#!/bin/bash
echo "=== Removing unified-navbar from non-dashboard pages ==="
echo ""

# List of files to remove unified-navbar from
files=(
  "public/login.html"
  "public/signup.html"
  "public/forgot-password.html"
  "public/admin.html"
  "public/ai-assistant-demo.html"
  "public/ar-vr-demo.html"
  "public/behavior-analytics.html"
  "public/help-center.html"
  "public/help-system-demo.html"
  "public/oauth-callback.html"
  "public/workflow.html"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Check if file has unified-navbar-container
    if grep -q "unified-navbar-container" "$file"; then
      echo "Processing: $file"
      # Create backup
      cp "$file" "$file.backup"
      # Remove unified-navbar lines
      sed -i '/<div id="unified-navbar-container"><\/div>/,/<\/script>/d' "$file"
      echo "  ✅ Removed unified-navbar"
    else
      echo "Skipping: $file (no unified-navbar found)"
    fi
  else
    echo "Warning: $file not found"
  fi
done

echo ""
echo "=== Removal Complete ==="
