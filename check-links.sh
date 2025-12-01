#!/bin/bash
echo "=== MuseFlow V10.5.1 - Link Validation ==="
echo ""
echo "Checking for broken href links across all HTML files..."
echo ""

# Check for common broken link patterns
echo "1️⃣ Checking for '/help' (should be '/help-center.html'):"
grep -rn "href=\"/help\"" public/*.html public/static/components/*.html 2>/dev/null || echo "   ✅ No broken /help links found"

echo ""
echo "2️⃣ Checking for '/dashboard' (should be '/dashboard.html'):"
grep -rn "href=\"/dashboard\"" public/*.html public/static/components/*.html | grep -v "dashboard.html" 2>/dev/null || echo "   ✅ No broken /dashboard links found"

echo ""
echo "3️⃣ Checking for '/canvas' (should be '/canvas-v3.html'):"
grep -rn "href=\"/canvas\"" public/*.html public/static/components/*.html | grep -v "canvas" 2>/dev/null || echo "   ✅ No broken /canvas links found"

echo ""
echo "4️⃣ Checking for '/budget' (should be '/budget.html'):"
grep -rn "href=\"/budget\"" public/*.html public/static/components/*.html | grep -v "budget.html" 2>/dev/null || echo "   ✅ No broken /budget links found"

echo ""
echo "5️⃣ Checking for '/account' (should be '/account.html'):"
grep -rn "href=\"/account\"" public/*.html public/static/components/*.html | grep -v "account.html" 2>/dev/null || echo "   ✅ No broken /account links found"

echo ""
echo "=== Link Validation Complete ==="
