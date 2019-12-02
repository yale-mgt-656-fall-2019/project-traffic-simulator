#!/usr/bin/env sh
start=12
stop=23
while true
do
  date=$(date +"%k")
  if [ -z "$date" ]
  then
    # We're on busybox
    date=$(date +"%H")
  fi
  if [ $date -gt $start  ] && [ $date -lt $stop ]
  then
    echo "Generating traffic"
    node ./run.js
    sleep 10
  else
    echo "Sleeping"
    sleep 360
  fi
done
