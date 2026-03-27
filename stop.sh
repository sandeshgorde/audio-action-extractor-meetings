#!/bin/bash

# Meeting Analyzer - Stop Script

echo "Stopping Meeting Analyzer..."

# Stop backend
pkill -f "audio-action-extractor" 2>/dev/null
echo "Backend stopped"

# Stop frontend
pkill -f "react-scripts" 2>/dev/null
pkill -f "serve" 2>/dev/null
echo "Frontend stopped"

echo "All services stopped"
