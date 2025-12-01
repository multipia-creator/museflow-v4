#!/bin/bash

###############################################################################
# MuseFlow V10.2 - E2E Automated Test Suite
# Purpose: Comprehensive end-to-end testing for production deployment
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
USER_ID="2"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test Results Array
declare -a FAILED_TEST_NAMES=()

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
    ((TOTAL_TESTS++))
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED_TESTS++))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED_TESTS++))
    FAILED_TEST_NAMES+=("$1")
}

test_http() {
    local url="$1"
    local expected_code="${2:-200}"
    local description="$3"
    
    print_test "$description"
    
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response_code" = "$expected_code" ]; then
        print_pass "HTTP $response_code (Expected: $expected_code)"
        return 0
    else
        print_fail "HTTP $response_code (Expected: $expected_code) - $description"
        return 1
    fi
}

test_json_field() {
    local url="$1"
    local field="$2"
    local description="$3"
    
    print_test "$description"
    
    local json_response=$(curl -s "$url")
    local field_value=$(echo "$json_response" | grep -o "\"$field\"" | head -1)
    
    if [ -n "$field_value" ]; then
        print_pass "Field '$field' exists in JSON response"
        return 0
    else
        print_fail "Field '$field' missing in JSON response - $description"
        return 1
    fi
}

test_api_success() {
    local url="$1"
    local description="$2"
    
    print_test "$description"
    
    local json_response=$(curl -s "$url")
    local success=$(echo "$json_response" | grep -o '"success":true' | head -1)
    
    if [ -n "$success" ]; then
        print_pass "API returned success:true"
        return 0
    else
        print_fail "API returned success:false or error - $description"
        echo "Response: $json_response" | head -c 200
        return 1
    fi
}

test_count() {
    local url="$1"
    local min_count="$2"
    local description="$3"
    
    print_test "$description"
    
    local json_response=$(curl -s "$url")
    local count=$(echo "$json_response" | grep -o '"id":[0-9]*' | wc -l)
    
    if [ "$count" -ge "$min_count" ]; then
        print_pass "Found $count items (Expected: >= $min_count)"
        return 0
    else
        print_fail "Found $count items (Expected: >= $min_count) - $description"
        return 1
    fi
}

###############################################################################
# Test Suite 1: Basic HTTP Endpoints
###############################################################################

print_header "TEST SUITE 1: HTTP Endpoints"

test_http "$BASE_URL/" 200 "Homepage accessible"
test_http "$BASE_URL/dashboard" 200 "Dashboard page accessible"
test_http "$BASE_URL/budget" 200 "Budget page accessible"
test_http "$BASE_URL/canvas-v3" 200 "Canvas V3 page accessible"
test_http "$BASE_URL/workflow-tools" 200 "Workflow Tools page accessible"
test_http "$BASE_URL/manifest.json" 200 "PWA Manifest accessible"
test_http "$BASE_URL/sw.js" 200 "Service Worker accessible"
test_http "$BASE_URL/static/icons/icon-192x192.png" 200 "PWA icon accessible"

###############################################################################
# Test Suite 2: API Endpoints
###############################################################################

print_header "TEST SUITE 2: API Endpoints"

test_api_success "$BASE_URL/api/projects?userId=$USER_ID" "GET /api/projects"
test_count "$BASE_URL/api/projects?userId=$USER_ID" 8 "Projects count >= 8"
test_json_field "$BASE_URL/api/projects?userId=$USER_ID" "title" "Project has title field"
test_json_field "$BASE_URL/api/projects?userId=$USER_ID" "budget_total" "Project has budget_total field"
test_json_field "$BASE_URL/api/projects?userId=$USER_ID" "budget_used" "Project has budget_used field"

###############################################################################
# Test Suite 3: Static Assets
###############################################################################

print_header "TEST SUITE 3: Static Assets"

test_http "$BASE_URL/static/js/api-client-d1.js" 200 "API Client script"
test_http "$BASE_URL/static/js/notification-system.js" 200 "Notification system script"
test_http "$BASE_URL/static/js/error-logger.js" 200 "Error logger script"
test_http "$BASE_URL/static/js/notification-automation.js" 200 "Notification automation script"
test_http "$BASE_URL/static/js/pwa-installer.js" 200 "PWA installer script"
test_http "$BASE_URL/static/js/advanced-features.js" 200 "Advanced features script"
test_http "$BASE_URL/static/js/onboarding-tour.js" 200 "Onboarding tour script"

###############################################################################
# Test Suite 4: PWA Features
###############################################################################

print_header "TEST SUITE 4: PWA Features"

# Test manifest
print_test "PWA Manifest valid JSON"
MANIFEST_JSON=$(curl -s "$BASE_URL/manifest.json")
if echo "$MANIFEST_JSON" | python3 -m json.tool > /dev/null 2>&1; then
    print_pass "Manifest is valid JSON"
else
    print_fail "Manifest is invalid JSON"
fi

# Test manifest fields
test_json_field "$BASE_URL/manifest.json" "name" "Manifest has name field"
test_json_field "$BASE_URL/manifest.json" "short_name" "Manifest has short_name field"
test_json_field "$BASE_URL/manifest.json" "start_url" "Manifest has start_url field"
test_json_field "$BASE_URL/manifest.json" "icons" "Manifest has icons array"

###############################################################################
# Test Suite 5: Database Data Integrity
###############################################################################

print_header "TEST SUITE 5: Database Data Integrity"

print_test "Projects have valid budget data"
PROJECTS_JSON=$(curl -s "$BASE_URL/api/projects?userId=$USER_ID")
BUDGET_TOTAL=$(echo "$PROJECTS_JSON" | grep -o '"budget_total":[0-9]*' | wc -l)

if [ "$BUDGET_TOTAL" -ge 8 ]; then
    print_pass "All projects have budget_total field"
else
    print_fail "Some projects missing budget_total field"
fi

print_test "Budget totals are reasonable"
MAX_BUDGET=$(echo "$PROJECTS_JSON" | grep -o '"budget_total":[0-9]*' | sed 's/"budget_total"://g' | sort -nr | head -1)

if [ "$MAX_BUDGET" -gt 1000000 ] && [ "$MAX_BUDGET" -lt 10000000000 ]; then
    print_pass "Budget values in reasonable range (₩${MAX_BUDGET})"
else
    print_fail "Budget values out of range (₩${MAX_BUDGET})"
fi

###############################################################################
# Test Suite 6: V10.0 New Features
###############################################################################

print_header "TEST SUITE 6: V10.0 New Features"

test_http "$BASE_URL/static/js/notification-automation.js" 200 "Notification automation system"
test_http "$BASE_URL/static/js/pwa-installer.js" 200 "PWA installer"
test_http "$BASE_URL/static/js/advanced-features.js" 200 "Advanced AI features"

print_test "Service Worker registration"
SW_CONTENT=$(curl -s "$BASE_URL/sw.js")
if echo "$SW_CONTENT" | grep -q "CACHE_NAME"; then
    print_pass "Service Worker has cache configuration"
else
    print_fail "Service Worker missing cache configuration"
fi

###############################################################################
# Test Suite 7: Performance
###############################################################################

print_header "TEST SUITE 7: Performance"

print_test "Dashboard load time"
START_TIME=$(date +%s%N)
curl -s "$BASE_URL/dashboard" > /dev/null
END_TIME=$(date +%s%N)
ELAPSED=$(((END_TIME - START_TIME) / 1000000))

if [ "$ELAPSED" -lt 2000 ]; then
    print_pass "Dashboard loaded in ${ELAPSED}ms (< 2000ms)"
else
    print_fail "Dashboard loaded in ${ELAPSED}ms (> 2000ms)"
fi

print_test "API response time"
START_TIME=$(date +%s%N)
curl -s "$BASE_URL/api/projects?userId=$USER_ID" > /dev/null
END_TIME=$(date +%s%N)
ELAPSED=$(((END_TIME - START_TIME) / 1000000))

if [ "$ELAPSED" -lt 1000 ]; then
    print_pass "API responded in ${ELAPSED}ms (< 1000ms)"
else
    print_fail "API responded in ${ELAPSED}ms (> 1000ms)"
fi

###############################################################################
# Final Report
###############################################################################

print_header "TEST RESULTS SUMMARY"

echo ""
echo -e "Total Tests:  ${BLUE}${TOTAL_TESTS}${NC}"
echo -e "Passed:       ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed:       ${RED}${FAILED_TESTS}${NC}"

if [ ${FAILED_TESTS} -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✅ ALL TESTS PASSED! 🎉         ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════╝${NC}"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}╔════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ❌ SOME TESTS FAILED            ║${NC}"
    echo -e "${RED}╚════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}Failed Tests:${NC}"
    for test_name in "${FAILED_TEST_NAMES[@]}"; do
        echo -e "  - ${RED}$test_name${NC}"
    done
    echo ""
    exit 1
fi
