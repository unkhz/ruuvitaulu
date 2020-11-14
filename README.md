# Ruuvitaulu

Software omponents for creating a home weather station running for example with a Raspberry PI.

## Setup

Create .env file with following config

```
GF_SECURITY_ADMIN_USER=<grafana username>
GF_SECURITY_ADMIN_PASSWORD=<grafana password>
```

Create a `tags.json` file that defines the Ruuvi tags you know.

```
[
  {"id": "a1b1c1d1", "room": "terassi", "room_type": "outside"},
  {"id": "a1b1c1d2", "room": "olohuone", "room_type": "inside"},
  {"id": "a1b1c1d3", "room": "makuuhuone", "room_type": "inside"}
]
```

## Tips

Think of tags (`id`) and their locations (`room`, `room_type`) as orthogonal dimensions. At some point you might want to replace one of the tags e.g. because it needs to be repaired. Tags can be replaced simply by keeping same `room` and `room_type` allowing the location specific graphs to be unbroken.
s
