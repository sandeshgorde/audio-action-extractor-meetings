#!/bin/bash

# Meeting Analyzer - Quick Start Script

echo "========================================"
echo "  Meeting Analyzer"
echo "========================================"

# Navigate to project directory
cd /home/sandesh/audio-action-extractor-meetings

# Check if backend is already running
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "Backend is already running on port 8080"
else
    echo "Starting Backend..."
    nohup java -Dpython.command=/home/sandesh/audio-action-extractor-meetings/backend/venv/bin/python3 \
        -jar backend/target/audio-action-extractor-1.0.0.jar > backend.log 2>&1 &
    sleep 5
    echo "Backend started on port 8080"
fi

# Check if frontend is already running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "Frontend is already running on port 3000"
else
    echo "Starting Frontend..."
    cd frontend
    nohup npm start > ../frontend.log 2>&1 &
    cd ..
    sleep 10
    echo "Frontend started on port 3000"
fi

echo ""
echo "========================================"
echo "  Access the app at:"
echo "  http://localhost:3000"
echo "========================================"
