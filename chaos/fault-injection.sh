#!/bin/bash
# fault-injection.sh
# Simulates degraded hardware and network conditions

echo "🌪️  Injecting Chaos into the system..."

# 1. Network Degradation (100ms latency, 5% packet loss)
sudo tc qdisc add dev lo root netem delay 100ms 20ms loss 5% 2>/dev/null || echo "Network rules already exist or tc not available"

# 2. Resource Starvation (CPU and Memory)
if command -v stress-ng &> /dev/null; then
    echo "Starting stress-ng: 2 CPU workers, 1 VM worker (500MB)"
    sudo stress-ng --cpu 2 --vm 1 --vm-bytes 500M --timeout 30s &
else
    echo "stress-ng not installed, skipping CPU/Memory starvation."
fi

echo "Chaos injection complete. The system is now degraded."
