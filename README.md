# Ruuvitaulu

Software omponents for creating a home weather station running for example with a Raspberry PI.

## Setup

Create .env file with following config

```
GF_SECURITY_ADMIN_USER=<grafana username>
GF_SECURITY_ADMIN_PASSWORD=<grafana password>
```

## Tag configuration

1. Start the app by running `yarn start`.
2. Go to the "Identify tags" dashboard (http://localhost:5000//d/identify-tags) and use the `ruuvi_rssi` measurements to identify the tag ids by bringing them close to your machine and seeing which measurement changes
3. Create a `tags.json` file that defines the Ruuvi tags you have identified.
4. Calibrate the tags by using the salt calibration method (https://blog.ruuvi.com/humidity-sensor-673c5b7636fc) and add the target/measured values to `tags.json`. Dashboards will start showing the calibrated values starting from the moment the `tags.json` file is saved with new measurements.

```
[
  {
    "id": "ca54a550ab78",
    "room": "bedroom",
    "room_type": "inside",
    "humidity_calibration": {"target": 75, "measured": 69.234},
    "temperature_calibration": {"target": 24, "measured": 23.1},
    "pressure_calibration": {"target": 100000, "measured": 99922}
  },
  {
    "id": "ebfdbcc23a48",
    "room": "living room",
    "room_type": "inside",
    "humidity_calibration": {"target": 75, "measured": 77.1},
    "temperature_calibration": {"target": 24, "measured": 25},
    "pressure_calibration": {"target": 100000, "measured": 100212}
  },
  {
    "id": "dc79c9d27a04",
    "room": "terrace",
    "room_type": "outside",
    "humidity_calibration": {"target": 75, "measured": 75},
    "temperature_calibration": {"target": 1, "measured": 1},
    "pressure_calibration": {"target": 1, "measured": 1}
  }
]
```

## Tips

Think of tags (`id`) and their locations (`room`, `room_type`) as orthogonal dimensions. At some point you might want to replace one of the tags e.g. because it needs to be repaired. Tags can be replaced simply by keeping same `room` and `room_type` allowing the location specific graphs to be unbroken.
