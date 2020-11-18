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
2. Go to http://localhost:5010/metrics and reload page until you see some measurements
3. Create a `tags.json` file that defines the Ruuvi tags you know. You can use the `ruuvi_rssi` measurements to identify the tag ids by bringing them close to your machine and seeing which measurement changes.

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
