const ruuvi = require('node-ruuvitag')
const { Registry, collectDefaultMetrics } = require('prom-client')
const express = require('express')
const app = express()

const config = { port: 3000 }

const register = new Registry()
collectDefaultMetrics({ register })

ruuvi.on('found', (tag) => {
  console.log('Found RuuviTag, id: ' + tag.id)
  tag.on('updated', (data) => {
    console.log(
      'Got data from RuuviTag ' +
        tag.id +
        ':\n' +
        JSON.stringify(data, null, 's\t')
    )
  })
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
