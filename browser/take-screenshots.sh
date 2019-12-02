#!/usr/bin/env sh
while true
do
  echo "Taking screenshots..."
  node ./screenshots.js
  echo "Sleeping for 12h..."
  sleep 43200
done
