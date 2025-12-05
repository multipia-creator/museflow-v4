#!/bin/bash
cd /home/user/museflow-v4

# 1. Change grid to 4x2
sed -i 's/const cols = 3;/const cols = 4;/g' public/canvas-ultimate-clean.html
sed -i 's/const rows = 3;/const rows = 2;/g' public/canvas-ultimate-clean.html

# 2. Change card positioning calculation
sed -i 's/Math\.floor(index \/ 3)/Math.floor(index \/ 4)/g' public/canvas-ultimate-clean.html
sed -i 's/index % 3/index % 4/g' public/canvas-ultimate-clean.html

# 3. Remove last card (일정표)
sed -i '/일정표.*전시 운영 스케줄/d' public/canvas-ultimate-clean.html

echo "Fixes applied successfully"
