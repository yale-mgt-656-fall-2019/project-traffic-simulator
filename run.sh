#!/usr/bin/env sh
ENV_FILE=$1
if [ -f "$ENV_FILE" ]; then
    echo "Using env file: $ENV_FILE"
else 
    echo "Error: $ENV_FILE does not exist"
    exit
fi

start=17
stop=23
while true
do
  date=$(date +"%k")
  if (( $date > $start && $date < $stop ))
  then
    echo "Generating traffic"
    env $(cat "$1" | xargs) node ./run.js
    sleep 10
  else
    echo "Sleeping"
    sleep 360
  fi
done
