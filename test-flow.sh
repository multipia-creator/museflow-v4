#!/bin/bash

# MuseFlow Test Flow Script
# This script tests the complete user flow: Signup → Login → Projects → Canvas

BASE_URL="http://localhost:3000"

echo "======================================"
echo "MuseFlow Complete Flow Test"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Landing Page
echo -e "${BLUE}Test 1: Landing Page${NC}"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/landing.html)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Landing page accessible${NC}"
else
    echo -e "${RED}✗ Landing page failed (HTTP $STATUS)${NC}"
fi
echo ""

# Test 2: Signup Page
echo -e "${BLUE}Test 2: Signup Page${NC}"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/signup.html)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Signup page accessible${NC}"
else
    echo -e "${RED}✗ Signup page failed (HTTP $STATUS)${NC}"
fi
echo ""

# Test 3: Login Page
echo -e "${BLUE}Test 3: Login Page${NC}"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/login.html)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Login page accessible${NC}"
else
    echo -e "${RED}✗ Login page failed (HTTP $STATUS)${NC}"
fi
echo ""

# Test 4: Login API with demo account
echo -e "${BLUE}Test 4: Login API${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"demo@museflow.life","password":"demo1234"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ Login successful${NC}"
    echo "  Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "  Response: $LOGIN_RESPONSE"
fi
echo ""

# Test 5: Get Current User
echo -e "${BLUE}Test 5: Get Current User${NC}"
if [ -n "$TOKEN" ]; then
    USER_RESPONSE=$(curl -s $BASE_URL/api/auth/me \
        -H "Authorization: Bearer $TOKEN")
    
    USER_NAME=$(echo "$USER_RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$USER_NAME" ]; then
        echo -e "${GREEN}✓ User info retrieved${NC}"
        echo "  Name: $USER_NAME"
    else
        echo -e "${RED}✗ Failed to get user info${NC}"
    fi
else
    echo -e "${RED}✗ Skipped (no token)${NC}"
fi
echo ""

# Test 6: Get Projects
echo -e "${BLUE}Test 6: Get Projects${NC}"
if [ -n "$TOKEN" ]; then
    PROJECTS_RESPONSE=$(curl -s $BASE_URL/api/projects \
        -H "Authorization: Bearer $TOKEN")
    
    PROJECT_COUNT=$(echo "$PROJECTS_RESPONSE" | grep -o '"id":[0-9]*' | wc -l)
    
    if [ "$PROJECT_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ Projects retrieved${NC}"
        echo "  Count: $PROJECT_COUNT projects"
        echo "$PROJECTS_RESPONSE" | jq -r '.projects[] | "  - \(.title)"' 2>/dev/null || echo "  (jq not available for pretty print)"
    else
        echo -e "${RED}✗ No projects found${NC}"
    fi
else
    echo -e "${RED}✗ Skipped (no token)${NC}"
fi
echo ""

# Test 7: Projects Page
echo -e "${BLUE}Test 7: Projects Page${NC}"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/projects.html)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Projects page accessible${NC}"
else
    echo -e "${RED}✗ Projects page failed (HTTP $STATUS)${NC}"
fi
echo ""

# Test 8: My Account Page
echo -e "${BLUE}Test 8: My Account Page${NC}"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/account.html)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓ My Account page accessible${NC}"
else
    echo -e "${RED}✗ My Account page failed (HTTP $STATUS)${NC}"
fi
echo ""

# Test 9: Admin/Canvas Page
echo -e "${BLUE}Test 9: Admin/Canvas Page${NC}"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/admin.html)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Admin/Canvas page accessible${NC}"
else
    echo -e "${RED}✗ Admin/Canvas page failed (HTTP $STATUS)${NC}"
fi
echo ""

# Summary
echo "======================================"
echo -e "${BLUE}Test Summary${NC}"
echo "======================================"
echo ""
echo "Demo Account:"
echo "  Email: demo@museflow.life"
echo "  Password: demo1234"
echo ""
echo "Access URLs:"
echo "  Landing: $BASE_URL/landing.html"
echo "  Login: $BASE_URL/login.html"
echo "  Projects: $BASE_URL/projects.html"
echo "  My Account: $BASE_URL/account.html"
echo "  Canvas: $BASE_URL/admin.html"
echo ""
echo "Public URL:"
echo "  https://3000-i71nxbnvqsqj65b78m7n0-2e1b9533.sandbox.novita.ai"
echo ""
