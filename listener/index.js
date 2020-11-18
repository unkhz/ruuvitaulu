const path = require('path')
const ruuvi = require('node-ruuvitag')
const { register, Gauge } = require('prom-client')
const express = require('express')
const dotenv = require('dotenv')

const { getTag, getLabelNames } = require('./lib/knownTags')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()

const config = { port: 5010 }

const labelNames = getLabelNames()

const createGauge = (metric, help) =>
  new Gauge({
    name: `ruuvi_${metric}`,
    help: help ?? `Ruuvitag ${metric} measurement`,
    labelNames,
  })

const gauges = {
  temperature: createGauge('temperature'),
  temperature_calibration: createGauge(
    'temperature_calibration',
    'Ruuvitag temperature calibration offset'
  ),
  humidity: createGauge('humidity'),
  humidity_calibration: createGauge(
    'humidity_calibration',
    'Ruuvitag humidity calibration multiplier'
  ),
  pressure: createGauge('pressure'),
  pressure_calibration: createGauge(
    'pressure_calibration',
    'Ruuvitag pressure calibration offset'
  ),
  battery: createGauge('battery'),
  rssi: createGauge('rssi'),
  measurementSequenceNumber: createGauge('measurement_count'),
}

const seenTags = new Map()
const maybeLogTagFound = (tagId, tag) => {
  const isSeen = seenTags.has(tagId)
  const tagSetup = JSON.stringify(tag)
  if (!isSeen) {
    if (tag.isKnown) {
      console.log(`Found tag ${tagId}:`, tag.labels)
    } else {
      console.log(`Found tag ${tagId}: unknown`)
    }
    seenTags.set(tagId, tagSetup)
    return
  }

  if (tagSetup !== seenTags.get(tagId)) {
    console.log(`Tag changed ${tagId}:`, tag)
    seenTags.set(tagId, tagSetup)
  }
}

const lastSeenLabelNames = new Set()
const restartIfLabelsChanged = () => {
  const hasLabels = lastSeenLabelNames.size > 0
  const labelNames = getLabelNames()
  if (hasLabels && labelNames.length !== lastSeenLabelNames.size) {
    throw new Error(
      `Labels added/removed ${labelNames.length} / ${lastSeenLabelNames.size}, forcing restart`
    )
  }
  for (const labelName of labelNames) {
    if (!hasLabels) {
      lastSeenLabelNames.add(labelName)
    } else {
      if (!lastSeenLabelNames.has(labelName)) {
        throw new Error('Label names changed, forcing restart')
      }
    }
  }
}

const getAbsoluteCalibrationOffset = ({ target, measured } = {}) =>
  (target ?? 1) - (measured ?? target ?? 1)
const getRelativeCalibrationMultiplier = ({ target, measured } = {}) =>
  (target ?? 1) / (measured ?? target ?? 1)

const handleTagFound = (stream) => {
  stream.on('updated', (data) => {
    const id = data.mac.replace(/:/g, '').toLowerCase()
    const {
      temperature_calibration = {},
      humidity_calibration = {},
      pressure_calibration = {},
      ...tag
    } = getTag(id, data)
    maybeLogTagFound(id, tag, data)
    restartIfLabelsChanged()
    for (const [key, value] of Object.entries(data)) {
      const gauge = gauges[key]
      if (gauge) {
        gauge.labels(...tag.labels).set(value)
      }
    }

    gauges.temperature_calibration
      .labels(...tag.labels)
      .set(getAbsoluteCalibrationOffset(temperature_calibration))

    gauges.pressure_calibration
      .labels(...tag.labels)
      .set(getAbsoluteCalibrationOffset(pressure_calibration))

    gauges.humidity_calibration
      .labels(...tag.labels)
      .set(getRelativeCalibrationMultiplier(humidity_calibration))
  })
}

ruuvi.on('found', (stream) => {
  handleTagFound(stream)
})

ruuvi.on('warning', (message) => {
  console.warn(message)
})

app.get('/metrics', function (req, res) {
  res.status(200).set('Content-Type', 'text/plain')
  res.end(register.metrics())
})

app.listen(config.port, () => {
  console.log(`Ruuvi test app listening at http://localhost:${config.port}`)
})
