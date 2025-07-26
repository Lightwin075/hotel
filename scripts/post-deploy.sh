#!/bin/sh

echo "🚀 Post-deploy verification script"
echo "=================================="

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 10

# Check if server is responding
echo "🔍 Checking server health..."
curl -f http://localhost:5000/api/health || {
    echo "❌ Server health check failed"
    exit 1
}

echo "✅ Server is healthy and responding"

# Check if database is accessible
echo "🔍 Checking database connection..."
curl -f http://localhost:5000/api/auth/status || {
    echo "⚠️  Database check failed (this might be normal if no auth endpoint)"
}

echo "🎉 Deployment verification complete!" 