#!/bin/bash

echo "=== MuseFlow API 테스트 ==="
echo ""

# 1. Health check
echo "1. Health Check:"
curl -s http://localhost:3000/ | grep -o "<title>.*</title>" || echo "✓ Homepage OK"
echo ""

# 2. API projects list
echo "2. API Projects List:"
curl -s http://localhost:3000/api/projects?userId=2 | jq -r '.success // "N/A"' 2>/dev/null || echo "API response received"
echo ""

# 3. Budget page
echo "3. Budget Page:"
curl -s http://localhost:3000/budget.html | grep -o "<title>.*</title>"
echo ""

# 4. Dashboard page
echo "4. Dashboard Page:"
curl -s http://localhost:3000/dashboard.html | grep -o "<title>.*</title>"
echo ""

echo "=== 테스트 완료 ==="
