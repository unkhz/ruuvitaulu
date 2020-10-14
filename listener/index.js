const ruuvi = require('node-ruuvitag')
const { register, Gauge } = require('prom-client')
const express = require('express')
const app = express()

const config = { port: 3010 }

const tags = new Map()
const labelNames = ['tag']
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

ruuvi.on('found', (tag) => {
  if (!tags.has(tag.id)) {
    console.log(`Tag ${tag.id} found`)
    tags.set(tag.id, tag)
    tag.on('updated', (data) => {
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
      gauges.temperature.labels(tag.id).set(temperature)
      gauges.humidity.labels(tag.id).set(humidity)
      gauges.pressure.labels(tag.id).set(pressure)
      gauges.battery.labels(tag.id).set(battery)
    })
  }
})

ruuvi.on('warning', (message) => {
  console.error(new Error(message))
})

app.get('/metrics', function (req, res) {
  res.status(200).set('Content-Type', 'text/plain')
  res.end(register.metrics())
})

app.listen(config.port, () => {
  console.log(`Ruuvi test app listening at http://localhost:${config.port}`)
})
