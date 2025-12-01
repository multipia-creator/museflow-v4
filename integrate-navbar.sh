#!/bin/bash
# MuseFlow V10.3 - Unified Navbar Integration Script
# Automatically integrate unified-navbar.html to all pages

echo "🎨 MuseFlow V10.3 - UI/UX Consistency Integration"
echo "================================================"

# Pages to integrate (excluding canvas-v3, budget, dashboard - already integrated)
PAGES=(
    "landing.html"
    "login.html"
    "signup.html"
    "admin.html"
    "account.html"
    "projects.html"
    "workflow-tools.html"
    "workflow.html"
    "forgot-password.html"
    "help-center.html"
    "help-system-demo.html"
    "behavior-analytics.html"
    "ai-assistant-demo.html"
    "oauth-callback.html"
    "ar-vr-demo.html"
)

# Unified navbar include snippet
NAVBAR_SNIPPET='    <!-- Load Unified Navigation -->
    <div id="unified-navbar-container"></div>
    <script>
        fetch('"'"'/static/components/unified-navbar.html'"'"')
            .then(response => response.text())
            .then(html => {
                document.getElementById('"'"'unified-navbar-container'"'"').innerHTML = html;
            });
    </script>'

cd /home/user/museflow-v4/public || exit 1

for PAGE in "${PAGES[@]}"; do
    echo ""
    echo "Processing: $PAGE"
    
    # Check if file exists
    if [ ! -f "$PAGE" ]; then
        echo "  ⚠️  File not found: $PAGE"
        continue
    fi
    
    # Check if already integrated
    if grep -q "unified-navbar-container" "$PAGE"; then
        echo "  ✅ Already integrated"
        continue
    fi
    
    # Create backup
    cp "$PAGE" "$PAGE.backup"
    
    # Find <body> tag and insert navbar after it
    if grep -q "<body>" "$PAGE"; then
        # Use awk to insert after <body>
        awk -v snippet="$NAVBAR_SNIPPET" '
            /<body>/ {
                print
                print snippet
                next
            }
            {print}
        ' "$PAGE" > "$PAGE.tmp"
        
        mv "$PAGE.tmp" "$PAGE"
        echo "  ✅ Integrated unified-navbar.html"
    else
        echo "  ⚠️  No <body> tag found"
    fi
done

echo ""
echo "================================================"
echo "✅ Integration Complete!"
echo "📊 Run validation: npm run test"
