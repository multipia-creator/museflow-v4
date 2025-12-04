#!/bin/bash
# Add footer to all HTML pages in public/

FOOTER_CSS='
    <style>
        /* MuseFlow Footer Styles */
        .museflow-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 40px;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #e5e5e5;
            display: flex;
            align-items: center;
            justify-content: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 999999;
            font-size: 0.75rem;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .museflow-footer-content {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        .museflow-footer-logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 700;
            color: #8B5CF6;
        }

        .museflow-footer-divider {
            width: 1px;
            height: 16px;
            background: rgba(255, 255, 255, 0.2);
        }

        .museflow-footer-text {
            color: #e5e5e5;
        }

        .museflow-footer-version {
            font-weight: 600;
            color: #60A5FA;
        }

        /* Adjust body padding to prevent content overlap */
        body {
            padding-bottom: 40px !important;
        }
    </style>'

FOOTER_HTML='
    <!-- MuseFlow Footer -->
    <footer class="museflow-footer">
        <div class="museflow-footer-content">
            <div class="museflow-footer-logo">
                ✨ MuseFlow
            </div>
            <div class="museflow-footer-divider"></div>
            <div class="museflow-footer-text">
                Copyright © 2026, Imageroot
            </div>
            <div class="museflow-footer-divider"></div>
            <div class="museflow-footer-text">
                Made by Hyun Woo Nam Professor
            </div>
            <div class="museflow-footer-divider"></div>
            <div class="museflow-footer-version">
                V4.0
            </div>
        </div>
    </footer>'

# List of main pages to add footer
PAGES=(
    "dashboard.html"
    "canvas-v4-hybrid.html"
    "digital-twin.html"
    "digital-twin-pro.html"
    "canvas-v3.html"
    "projects.html"
    "account.html"
    "admin.html"
    "analytics-dashboard.html"
    "workflow.html"
    "workflow-tools.html"
    "budget.html"
    "landing.html"
    "index.html"
)

cd /home/user/museflow-v4/public

for PAGE in "${PAGES[@]}"; do
    if [ -f "$PAGE" ]; then
        # Check if footer already exists
        if grep -q "museflow-footer" "$PAGE"; then
            echo "⏭️  $PAGE already has footer, skipping..."
            continue
        fi
        
        echo "✏️  Adding footer to $PAGE..."
        
        # Create backup
        cp "$PAGE" "$PAGE.backup-footer"
        
        # Add CSS before </head>
        sed -i "/<\/head>/i\\${FOOTER_CSS}" "$PAGE"
        
        # Add HTML before </body>
        sed -i "/<\/body>/i\\${FOOTER_HTML}" "$PAGE"
        
        echo "✅ Footer added to $PAGE"
    else
        echo "❌ $PAGE not found"
    fi
done

echo ""
echo "🎉 Footer addition complete!"
echo "📊 Modified files: ${#PAGES[@]}"
