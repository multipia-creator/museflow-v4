# 🌐 museflow.life 도메인 연결 가이드

## 📋 개요

**도메인**: museflow.life  
**Cloudflare Pages 프로젝트**: museflow  
**현재 배포 URL**: https://f9d53872.museflow.pages.dev

---

## 🎯 목표

Cloudflare Pages에 커스텀 도메인 `museflow.life`를 연결하여:
- ✅ https://museflow.life → MuseFlow V4 메인 사이트
- ✅ https://www.museflow.life → 자동 리다이렉트

---

## 📝 전제 조건

### 1. 도메인 등록 확인
- ✅ museflow.life 도메인이 등록되어 있어야 함
- ✅ 도메인 네임서버가 Cloudflare를 가리켜야 함

### 2. Cloudflare 계정
- ✅ Cloudflare 계정 로그인
- ✅ museflow.life가 Cloudflare에 추가되어 있어야 함

---

## 🚀 설정 방법

### **방법 1: Cloudflare Dashboard (권장)**

#### Step 1: Cloudflare 대시보드 접속
```
1. https://dash.cloudflare.com 로그인
2. 왼쪽 메뉴에서 "Workers & Pages" 클릭
3. "Pages" 탭 선택
4. "museflow" 프로젝트 클릭
```

#### Step 2: Custom Domain 추가
```
1. "Custom domains" 탭 클릭
2. "Set up a custom domain" 버튼 클릭
3. 도메인 입력:
   - Domain: museflow.life
   - (선택) Activate domain: 체크
4. "Continue" 클릭
```

#### Step 3: DNS 레코드 확인/추가
Cloudflare가 자동으로 DNS 레코드를 생성합니다:

**Root Domain (museflow.life):**
```
Type: CNAME
Name: @
Content: museflow.pages.dev
Proxy status: Proxied (오렌지 구름)
TTL: Auto
```

**WWW Subdomain (www.museflow.life):**
```
Type: CNAME
Name: www
Content: museflow.pages.dev
Proxy status: Proxied (오렌지 구름)
TTL: Auto
```

#### Step 4: DNS 레코드 수동 추가 (필요시)
만약 자동 생성되지 않았다면:

```
1. Cloudflare 대시보드에서 "Websites" 클릭
2. "museflow.life" 도메인 선택
3. "DNS" 탭 클릭
4. "Add record" 클릭

Root Domain:
- Type: CNAME
- Name: @ (또는 museflow.life)
- Target: museflow.pages.dev
- Proxy status: Proxied (오렌지 구름 클릭)
- TTL: Auto

WWW Subdomain:
- Type: CNAME
- Name: www
- Target: museflow.pages.dev
- Proxy status: Proxied (오렌지 구름 클릭)
- TTL: Auto
```

#### Step 5: SSL/TLS 설정
```
1. "SSL/TLS" 탭 클릭
2. Encryption mode: "Full (strict)" 선택
3. "Edge Certificates" 클릭
4. "Always Use HTTPS" 활성화
5. "Automatic HTTPS Rewrites" 활성화
```

---

### **방법 2: Cloudflare API (고급)**

API를 통해 프로그래밍 방식으로 도메인 추가:

#### Step 1: Zone ID 확인
```bash
# Zone ID 조회
curl -X GET "https://api.cloudflare.com/client/v4/zones?name=museflow.life" \
  -H "Authorization: Bearer 5U9cOEp4hohFjyYJOfbFM9jNlPL-RabsvLZEtrKu" \
  -H "Content-Type: application/json" | jq '.result[0].id'
```

#### Step 2: DNS 레코드 추가
```bash
# ZONE_ID는 위에서 얻은 값으로 대체
ZONE_ID="your-zone-id-here"

# Root domain CNAME
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
  -H "Authorization: Bearer 5U9cOEp4hohFjyYJOfbFM9jNlPL-RabsvLZEtrKu" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "@",
    "content": "museflow.pages.dev",
    "proxied": true,
    "ttl": 1
  }'

# WWW subdomain CNAME
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
  -H "Authorization: Bearer 5U9cOEp4hohFjyYJOfbFM9jNlPL-RabsvLZEtrKu" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "www",
    "content": "museflow.pages.dev",
    "proxied": true,
    "ttl": 1
  }'
```

#### Step 3: Pages 프로젝트에 도메인 추가
```bash
# Account ID 필요 (대시보드에서 확인)
ACCOUNT_ID="93f0a4408e700959a95a837c906ec6e8"

curl -X POST "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/museflow/domains" \
  -H "Authorization: Bearer 5U9cOEp4hohFjyYJOfbFM9jNlPL-RabsvLZEtrKu" \
  -H "Content-Type: application/json" \
  --data '{
    "name": "museflow.life"
  }'
```

---

## ✅ 검증 방법

### 1. DNS 전파 확인
```bash
# Root domain
dig museflow.life CNAME +short
# 예상 결과: museflow.pages.dev

# WWW subdomain
dig www.museflow.life CNAME +short
# 예상 결과: museflow.pages.dev
```

### 2. 온라인 도구 사용
- https://dnschecker.org
- 도메인: museflow.life
- Type: CNAME
- 전세계 DNS 서버에서 전파 확인

### 3. 브라우저 테스트
```
1. https://museflow.life 접속
2. https://www.museflow.life 접속
3. HTTP → HTTPS 자동 리다이렉트 확인
4. SSL 인증서 확인 (자물쇠 아이콘)
```

---

## ⏱️ 전파 시간

- **즉시 (0-5분)**: Cloudflare 프록시 활성화 시
- **최대 24-48시간**: DNS 전파 완료 (일반적으로 1시간 이내)

---

## 🔧 문제 해결

### Issue 1: "Too Many Redirects" 에러
**원인**: SSL/TLS 설정이 "Flexible"로 되어있음

**해결**:
```
1. Cloudflare 대시보드 → SSL/TLS
2. Encryption mode를 "Full (strict)"로 변경
```

### Issue 2: 도메인이 연결되지 않음
**원인**: DNS 레코드가 올바르지 않음

**해결**:
```
1. DNS 레코드 확인:
   - Type: CNAME (A 레코드 아님!)
   - Content: museflow.pages.dev
   - Proxied: 활성화 (오렌지 구름)

2. Pages 프로젝트에서 도메인 재추가
```

### Issue 3: SSL 인증서 에러
**원인**: SSL 인증서가 아직 발급되지 않음

**해결**:
```
1. 15-30분 대기 (Cloudflare 자동 발급)
2. SSL/TLS → Edge Certificates 확인
3. "Universal SSL" 활성화 확인
```

### Issue 4: "This site can't be reached"
**원인**: 네임서버가 Cloudflare를 가리키지 않음

**해결**:
```
1. 도메인 등록업체 대시보드 접속
2. 네임서버를 Cloudflare로 변경:
   - ns1.cloudflare.com
   - ns2.cloudflare.com
3. 24-48시간 대기
```

---

## 🎨 추가 설정 (선택사항)

### Page Rules 설정
WWW → Non-WWW 리다이렉트:

```
1. Cloudflare 대시보드 → Rules → Page Rules
2. Create Page Rule
3. URL: www.museflow.life/*
4. Setting: Forwarding URL
5. Status Code: 301 (Permanent Redirect)
6. Destination URL: https://museflow.life/$1
7. Save and Deploy
```

### Cache 설정
```
1. Cloudflare 대시보드 → Caching
2. Configuration:
   - Browser Cache TTL: 4 hours
   - Caching Level: Standard
3. Always Online: 활성화
```

### Security 설정
```
1. Cloudflare 대시보드 → Security
2. Security Level: Medium
3. Bot Fight Mode: 활성화
4. Challenge Passage: 30 minutes
```

---

## 📊 예상 결과

설정 완료 후:

```
✅ https://museflow.life
   → MuseFlow V4 메인 페이지

✅ https://www.museflow.life
   → https://museflow.life (리다이렉트)

✅ http://museflow.life
   → https://museflow.life (HTTPS 강제)

✅ SSL 인증서: 유효 (Cloudflare Universal SSL)

✅ 속도: Cloudflare CDN 가속화

✅ 보안: DDoS 보호, WAF 활성화
```

---

## 🔐 환경 변수 업데이트

도메인 연결 후 `.dev.vars` 업데이트:

```env
# Production Domain
PRODUCTION_DOMAIN=museflow.life
PRODUCTION_URL=https://museflow.life

# OAuth Redirect URLs
GOOGLE_REDIRECT_URI=https://museflow.life/oauth-callback.html
NAVER_REDIRECT_URI=https://museflow.life/oauth-callback.html
KAKAO_REDIRECT_URI=https://museflow.life/oauth-callback.html
```

---

## 📱 테스트 체크리스트

설정 완료 후 다음을 확인하세요:

### DNS & SSL
- [ ] museflow.life DNS 레코드 존재
- [ ] www.museflow.life DNS 레코드 존재
- [ ] HTTPS 접속 가능
- [ ] SSL 인증서 유효
- [ ] HTTP → HTTPS 리다이렉트

### Pages 통합
- [ ] Cloudflare Pages Custom Domain에 추가됨
- [ ] 도메인 상태: Active
- [ ] 메인 페이지 로드
- [ ] 로그인 페이지 작동
- [ ] API 엔드포인트 정상

### 성능
- [ ] 페이지 로드 속도 (< 2초)
- [ ] Lighthouse 점수 (90+)
- [ ] Cloudflare CDN 적용
- [ ] 모바일 반응형 정상

### 기능
- [ ] 회원가입 작동
- [ ] 로그인 작동
- [ ] 대시보드 접근
- [ ] 프로젝트 생성
- [ ] D1 Database 연결

---

## 📞 지원

### Cloudflare 문서
- Pages Custom Domains: https://developers.cloudflare.com/pages/platform/custom-domains/
- DNS 설정: https://developers.cloudflare.com/dns/
- SSL/TLS: https://developers.cloudflare.com/ssl/

### 도움이 필요하면
1. Cloudflare 커뮤니티: https://community.cloudflare.com
2. Cloudflare Support: https://dash.cloudflare.com/?to=/:account/support

---

## 🎉 완료 후

도메인 연결이 완료되면:

```bash
# README 업데이트
echo "Production URL: https://museflow.life" >> README.md

# Git 커밋
git add README.md .dev.vars
git commit -m "docs: Update production domain to museflow.life"
git push origin main
```

---

## 📝 빠른 참조

**Cloudflare 계정 정보**:
- Account ID: `93f0a4408e700959a95a837c906ec6e8`
- API Token: `5U9cOEp4hohFjyYJOfbFM9jNlPL-RabsvLZEtrKu`

**Pages 프로젝트**:
- Project Name: `museflow`
- Current URL: `https://f9d53872.museflow.pages.dev`
- Custom Domain: `museflow.life` (설정 예정)

**DNS 레코드**:
```
@ (root)    → CNAME → museflow.pages.dev (Proxied)
www         → CNAME → museflow.pages.dev (Proxied)
```

---

**마지막 업데이트**: 2025-11-29  
**상태**: 설정 대기 중  
**예상 완료 시간**: 설정 후 5-30분

---

**Good luck! 🚀**
