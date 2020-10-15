const path = require('path')
const ruuvi = require('node-ruuvitag')
const { register, Gauge } = require('prom-client')
const express = require('express')
const dotenv = require('dotenv')

const { getTag, getTagLabels, getLabelNames } = require('./lib/knownTags')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()

const config = { port: 3010 }

const labelNames = getLabelNames()
const gauges = {
  temperature: new Gauge({
    name: 'ruuvi_temperature',
    help: 'Ruuvitags temperature measurement',
    labelNames,
  }),
  humidity: new Gauge({
    name: 'ruuvi_humidity',
    help: 'Ruuvitags humidity measurement',
    labelNames,
  }),
  pressure: new Gauge({
    name: 'ruuvi_pressure',
    help: 'Ruuvitags pressure measurement',
    labelNames,
  }),
  battery: new Gauge({
    name: 'ruuvi_battery',
    help: 'Ruuvitags battery measurement',
    labelNames,
  }),
}

ruuvi.on('found', (stream) => {
  const tag = getTag(stream)
  if (tag.isKnown) {
    console.log(`Known tag ${tag.name} found`)
  } else {
    console.log(`Unknown tag ${tag.name} found`)
  }
  stream.on('updated', (data) => {
    const {
      dataFormat,
      rssi,
      temperature,
      humidity,
      pressure,
      accelerationX,
      accelerationY,
      accelerationZ,
      battery,
      txPower,
      movementCounter,
      measurementSequenceNumber,
      mac,
    } = data
    const labels = getTagLabels(tag)
    gauges.temperature.labels(...labels).set(temperature)
    gauges.humidity.labels(...labels).set(humidity)
    gauges.pressure.labels(...labels).set(pressure)
    gauges.battery.labels(...labels).set(battery)
  })
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
