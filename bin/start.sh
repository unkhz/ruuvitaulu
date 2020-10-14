#!/bin/bash

# Install
yarn install

# Run docker containers
docker-compose up -d --build

# Run workspaces
yarn workspaces run start