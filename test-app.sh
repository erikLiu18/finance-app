#!/bin/bash

# Simple test script for the Personal Finance app
# Make sure the dev server is running: npm run dev

echo "🧪 Testing Personal Finance App..."
echo ""

# Test homepage
echo "1. Testing homepage (/)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$STATUS" = "200" ]; then
  echo "   ✅ Homepage is accessible (HTTP $STATUS)"
else
  echo "   ❌ Homepage failed (HTTP $STATUS)"
fi

# Test health endpoint
echo "2. Testing health endpoint (/api/health)..."
HEALTH=$(curl -s http://localhost:3000/api/health)
if echo "$HEALTH" | grep -q "ok"; then
  echo "   ✅ Health endpoint working"
  echo "   Response: $HEALTH"
else
  echo "   ❌ Health endpoint failed"
fi

echo ""
echo "✨ Tests complete!"
echo ""
echo "📱 Open your browser: http://localhost:3000"

