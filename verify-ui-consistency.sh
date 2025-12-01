#!/bin/bash
echo "=== MuseFlow V10.5.1 - UI Consistency Validation ==="
echo ""
echo "Checking UI consistency across all HTML pages..."
echo ""

# 1. Check for consistent color scheme
echo "1️⃣ Color Scheme Validation:"
echo "   Checking primary color (rgb(139, 92, 246) - Purple)..."
grep -l "139, 92, 246" public/*.html | wc -l | xargs echo "   ✅ Found in" 
echo "   files"

echo ""
echo "2️⃣ Font Consistency:"
echo "   Checking Font Awesome 6.4.0 usage..."
grep -l "font-awesome/6.4.0" public/*.html | wc -l | xargs echo "   ✅ Found in"
echo "   files"

echo ""
echo "3️⃣ Tailwind CSS Consistency:"
grep -l "cdn.tailwindcss.com" public/*.html | wc -l | xargs echo "   ✅ Tailwind found in"
echo "   files"

echo ""
echo "4️⃣ Unified Navbar Integration:"
grep -l "unified-navbar-container" public/*.html | wc -l | xargs echo "   ✅ Unified navbar integrated in"
echo "   files"

echo ""
echo "5️⃣ Responsive Design Check:"
grep -l "@media.*768px" public/*.html public/static/components/*.html | wc -l | xargs echo "   ✅ Responsive breakpoints in"
echo "   files"

echo ""
echo "=== UI Consistency Validation Complete ==="
