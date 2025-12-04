#!/usr/bin/env python3
"""Add MuseFlow footer to all HTML pages"""

import os
import re
from pathlib import Path

FOOTER_CSS = """
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
    </style>
"""

FOOTER_HTML = """
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
    </footer>
"""

PAGES = [
    "dashboard.html",
    "canvas-v4-hybrid.html",
    "digital-twin.html",
    "digital-twin-pro.html",
    "canvas-v3.html",
    "projects.html",
    "account.html",
    "admin.html",
    "analytics-dashboard.html",
    "workflow.html",
    "workflow-tools.html",
    "budget.html",
    "landing.html",
    "index.html",
]

def add_footer_to_file(filepath):
    """Add footer to a single HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if footer already exists
        if 'museflow-footer' in content:
            print(f"⏭️  {filepath.name} already has footer, skipping...")
            return False
        
        print(f"✏️  Adding footer to {filepath.name}...")
        
        # Create backup
        backup_path = filepath.with_suffix(filepath.suffix + '.backup-footer')
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        # Add CSS before </head>
        content = re.sub(r'</head>', FOOTER_CSS + '\n</head>', content, count=1)
        
        # Add HTML before </body>
        content = re.sub(r'</body>', FOOTER_HTML + '\n</body>', content, count=1)
        
        # Write modified content
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Footer added to {filepath.name}")
        return True
        
    except Exception as e:
        print(f"❌ Error processing {filepath.name}: {e}")
        return False

def main():
    public_dir = Path('/home/user/museflow-v4/public')
    modified_count = 0
    
    for page in PAGES:
        filepath = public_dir / page
        if filepath.exists():
            if add_footer_to_file(filepath):
                modified_count += 1
        else:
            print(f"❌ {page} not found")
    
    print(f"\n🎉 Footer addition complete!")
    print(f"📊 Modified files: {modified_count}/{len(PAGES)}")

if __name__ == '__main__':
    main()
