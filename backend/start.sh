#!/bin/bash
# Load environment variables from .env file
set -a
source .env
set +a

# Start the backend with Maven (loads env vars)
exec mvn spring-boot:run
