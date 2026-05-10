#!/bin/bash
# host-info.sh
# Collects static host system specifications

os_name=$(cat /etc/os-release | grep PRETTY_NAME | cut -d '"' -f 2)
kernel_ver=$(uname -r)
cpu_model=$(lscpu | grep "Model name" | head -n 1 | sed 's/Model name:\s*//')
cpu_cores=$(nproc)
mem_total=$(free -h | awk '/Mem:/ {print $2}')
disk_total=$(df -h / | tail -1 | awk '{print $2}')

cat <<EOF > host_info.json
{
  "os": "$os_name",
  "kernel": "$kernel_ver",
  "cpu_model": "$cpu_model",
  "cpu_cores": $cpu_cores,
  "memory_total": "$mem_total",
  "disk_total": "$disk_total"
}
EOF
echo "Host info collected."
