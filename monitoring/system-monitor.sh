#!/bin/bash
# system-monitor.sh
# Collects CPU and Memory metrics every second and saves as NDJSON

OUTPUT_FILE="system_metrics.json"
> $OUTPUT_FILE # Clear file

echo "Starting system monitor..."

while true; do
  cpu_idle=$(vmstat 1 2 | tail -1 | awk '{print $15}')
  cpu_usage=$((100 - cpu_idle))

  mem_free=$(free -m | awk '/Mem:/ {print $4}')
  mem_total=$(free -m | awk '/Mem:/ {print $2}')

  timestamp=$(date +%s000)

  echo "{\"timestamp\": $timestamp, \"cpu\": $cpu_usage, \"memory_free\": $mem_free, \"memory_total\": $mem_total}" >> $OUTPUT_FILE

  sleep 1
done
