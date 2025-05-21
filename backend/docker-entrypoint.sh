#!/bin/bash
set -e

# Run migrations
python -m app.core.migrate_db
python -m app.core.init_db

# Execute the command
exec "$@"
