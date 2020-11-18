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

const createGauge = (metric) =>
  new Gauge({
    name: `ruuvi_${metric}`,
    help: `Ruuvitag ${metric} measurement`,
    labelNames,
  })

const gauges = {
  temperature: createGauge('temperature'),
  humidity: createGauge('humidity'),
  pressure: createGauge('pressure'),
  battery: createGauge('battery'),
  rssi: createGauge('rssi'),
  measurementSequenceNumber: createGauge('measurement_count'),
}

const seenTagSetups = new Set()
const maybeLogTagFound = (tagId, tag, data) => {
  const tagKey = `${tagId}-${tag.isKnown}`
  const isSeen = seenTagSetups.has(tagKey)
  if (!isSeen) {
    if (tag.isKnown) {
      console.log(`Found tag ${tagId}:`, tag.labels)
    } else {
      console.log(`Found tag ${tagId}: unknown`)
    }
    seenTagSetups.add(tagKey)
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

const handleTagFound = (stream) => {
  stream.on('updated', (data) => {
    const id = data.mac.replace(/:/g, '').toLowerCase()
    const tag = getTag(id, data)
    maybeLogTagFound(id, tag, data)
    restartIfLabelsChanged()
    for (const [key, value] of Object.entries(data)) {
      const gauge = gauges[key]
      if (gauge) {
        gauge.labels(...tag.labels).set(value)
      }
    }
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
