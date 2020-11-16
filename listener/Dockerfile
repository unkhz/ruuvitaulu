FROM node:14-alpine

COPY bin/ /opt/bin
COPY lib/ /opt/lib
COPY index.js /opt/index.js
COPY package.json /opt/package.json

WORKDIR /opt/

RUN apk add make alpine-sdk python3 libusb-dev eudev-dev bluez-dev linux-headers

RUN yarn install
