#!/bin/bash

# Ensure storage directory and .gitkeep file exist
mkdir -p storage
if [ ! -f storage/.gitkeep ]; then
    touch storage/.gitkeep
    echo "Created storage/.gitkeep"
fi

# Ensure proper permissions for storage directory
chmod -R 775 storage
