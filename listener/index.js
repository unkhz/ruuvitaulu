const path = require('path')
const ruuvi = require('node-ruuvitag')
const { register, Gauge } = require('prom-client')
const express = require('express')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()

const config = { port: 3010 }

const tags = new Map()
const labelNames = ['tag_id', 'tag']
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

const knownTagNames = new Map(
  process.env.KNOWN_TAGS?.split(',').map((entry) =>
    entry.split(':').reverse()
  ) || []
)

ruuvi.on('found', (tag) => {
  const tagId = tag.id
  if (!tags.has(tagId)) {
    const name = knownTagNames.get(tagId) || tagId
    tags.set(tagId, {
      id: tagId,
      name,
      tag,
    })
    if (name !== tagId) {
      console.log(`Known tag ${name} (${tagId}) found`)
    } else {
      console.log(`Unknown tag ${tagId} found`)
    }
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
      gauges.temperature.labels(tagId, name).set(temperature)
      gauges.humidity.labels(tagId, name).set(humidity)
      gauges.pressure.labels(tagId, name).set(pressure)
      gauges.battery.labels(tagId, name).set(battery)
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
