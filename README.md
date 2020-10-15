# Ruuvitaulu

Create .env file with following config

```
GF_SECURITY_ADMIN_USER=<grafana username>
GF_SECURITY_ADMIN_PASSWORD=<grafana password>
```

Create a `tags.json` file that defines the Ruuvi tags you know.

```
[
  {"id": "123467890abcdef1234567890abcdef0", "name": "Terassi", "labels": {"location": "outside"}},
  {"id": "123467890abcdef1234567890abcdef1", "name": "Olkkari", "labels": {"location": "inside"}},
  {"id": "123467890abcdef1234567890abcdef2", "name": "Makkari", "labels": {"location": "inside"}}
]
```
