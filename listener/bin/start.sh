#!/bin/bash

while true;  do
  nodemon --exitcrash index.js
  test $? -gt 128 && break
done