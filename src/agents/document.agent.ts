/**
 * Document Agent
 * 문서 자동 생성 (Google Docs, Gmail, 보고서 등)
 * @version 1.0.0
 */

import type { ExecutionContext } from '../types/orchestrator.types';

interface DocumentInput {
  type: 'budget_document' | 'promotion_plan' | 'sns_content' | 'press_release' | 'email_campaign' | 'curriculum_generation' | 'report';
  data?: Record<string, any>;
  title?: string;
}

interface GeneratedDocument {
  type: string;
  title: string;
  content: string;
  format: 'markdown' | 'html' | 'plain';
  metadata?: Record<string, any>;
}

export class DocumentAgent {
  private db: D1Database;
  private geminiApiKey?: string;

  constructor(db: D1Database, geminiApiKey?: string) {
    this.db = db;
    this.geminiApiKey = geminiApiKey;
  }

  /**
   * 메인 실행 함수
   */
  async execute(input: Record<string, any>, context: ExecutionContext): Promise<Record<string, any>> {
    try {
      console.log('📄 Document Agent 시작:', input);

      const docInput = input as DocumentInput;
      const type = docInput.type;

      let documents: GeneratedDocument[] = [];

      switch (type) {
        case 'budget_document':
          documents = await this.generateBudgetDocument(docInput.data || {}, context);
          break;
        
        case 'promotion_plan':
          documents = await this.generatePromotionPlan(docInput.data || {}, context);
          break;
        
        case 'sns_content':
          documents = await this.generateSNSContent(docInput.data || {}, context);
          break;
        
        case 'press_release':
          documents = await this.generatePressRelease(docInput.data || {}, context);
          break;
        
        case 'email_campaign':
          documents = await this.generateEmailCampaign(docInput.data || {}, context);
          break;
        
        case 'curriculum_generation':
          documents = await this.generateCurriculum(docInput.data || {}, context);
          break;
        
        case 'report':
          documents = await this.generateReport(docInput.data || {}, context);
          break;
        
        default:
          documents = await this.generateDefaultDocument(docInput.data || {}, context);
      }

      // DB에 문서 정보 저장
      await this.saveDocuments(documents, context.sessionId);

      // (Optional) Google Docs API 연동하여 실제 문서 생성
      // const googleDocsUrls = await this.createGoogleDocs(documents);

      return {
        success: true,
        message: `${documents.length}개의 문서를 생성했습니다.`,
        data: {
          type,
          documents,
          // googleDocsUrls
        }
      };

    } catch (error) {
      console.error('❌ Document Agent 실패:', error);
      return {
        success: false,
        message: '문서 생성 실패',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 예산 문서 생성
   */
  private async generateBudgetDocument(data: Record<string, any>, context: ExecutionContext): Promise<GeneratedDocument[]> {
    const totalBudget = data.budget || 30000000;
    
    const budgetItems = [
      { name: '작품 대여비', amount: Math.round(totalBudget * 0.50), percentage: 50, justification: '주요 작품 3점 대여 및 운송비' },
      { name: '보험료', amount: Math.round(totalBudget * 0.20), percentage: 20, justification: '작품 가치 기반 전시 보험' },
      { name: '전시 디자인', amount: Math.round(totalBudget * 0.15), percentage: 15, justification: '공간 구성, 조명, 벽면 디자인' },
      { name: '홍보비', amount: Math.round(totalBudget * 0.10), percentage: 10, justification: 'SNS 광고, 포스터 제작, 언론 홍보' },
      { name: '기타', amount: Math.round(totalBudget * 0.05), percentage: 5, justification: '예비비 및 운영비' }
    ];

    const content = `# ${data.exhibitionName || '전시'} 예산 계획서

## 1. 예산 개요

- **총 예산**: ₩${totalBudget.toLocaleString()}
- **전시 기간**: ${data.duration || '3개월'}
- **예상 관람객**: ${data.expectedVisitors || '10,000명'}

## 2. 예산 항목별 상세

${budgetItems.map((item, index) => `
### ${index + 1}. ${item.name}
- **금액**: ₩${item.amount.toLocaleString()} (${item.percentage}%)
- **산출 근거**: ${item.justification}
`).join('\n')}

## 3. 예산 집행 계획

- **1단계 (준비 기간)**: ${budgetItems[0].name}, ${budgetItems[1].name}
- **2단계 (전시 구성)**: ${budgetItems[2].name}
- **3단계 (홍보 및 운영)**: ${budgetItems[3].name}, ${budgetItems[4].name}

## 4. 예산 관리 방안

- 월별 집행 현황 모니터링
- 예비비 5% 확보로 돌발 상황 대응
- 항목별 세부 영수증 관리

---

**작성일**: ${new Date().toLocaleDateString('ko-KR')}
**작성자**: AI Orchestrator (MuseFlow)
`;

    return [{
      type: 'budget_document',
      title: `${data.exhibitionName || '전시'} 예산 계획서`,
      content,
      format: 'markdown',
      metadata: {
        totalBudget,
        itemCount: budgetItems.length
      }
    }];
  }

  /**
   * 홍보 계획 생성
   */
  private async generatePromotionPlan(data: Record<string, any>, context: ExecutionContext): Promise<GeneratedDocument[]> {
    const exhibitionName = data.exhibitionName || '전시';

    const content = `# ${exhibitionName} 홍보 계획서

## 1. 홍보 목표

- **목표 관람객**: ${data.targetVisitors || '15,000명'}
- **타겟층**: ${data.targetAudience || '20-40대 미술 애호가'}
- **핵심 메시지**: ${data.keyMessage || '인상주의의 재발견'}

## 2. 채널별 홍보 전략

### 2.1 온라인 채널

#### Instagram
- 주 3회 포스팅 (작품 이미지, 비하인드 스토리)
- 해시태그: #${exhibitionName} #인상주의 #미술전시
- 인플루언서 협업 2건

#### Facebook
- 이벤트 페이지 생성
- 타겟 광고 (20-40대, 미술 관심사)
- 예산: ₩${(data.onlineAdBudget || 2000000).toLocaleString()}

#### 공식 웹사이트
- 전시 소개 페이지 제작
- 온라인 예약 시스템
- 가상 투어 콘텐츠

### 2.2 오프라인 채널

#### 포스터/전단지
- A2 포스터 500장
- 전단지 10,000장
- 주요 문화 공간 배포

#### 언론 홍보
- 보도자료 3종 발송
- 기자 간담회 개최
- TV 문화 프로그램 출연

### 2.3 파트너십

- 주변 카페/서점 5곳 협업
- 대학교 미술학과 연계
- 문화센터 강의 연계

## 3. 홍보 일정

| 기간 | 활동 | 담당 |
|------|------|------|
| D-30 | 보도자료 발송, SNS 티징 | 홍보팀 |
| D-14 | 포스터 배포, 온라인 광고 시작 | 마케팅팀 |
| D-7 | 기자 간담회, 인플루언서 초청 | 홍보팀 |
| D-Day | 오프닝 행사, 실시간 SNS | 전체 |

## 4. 성과 측정

- SNS 도달 범위 및 참여율
- 웹사이트 방문자 수
- 온라인 예약 건수
- 실제 관람객 수

---

**작성일**: ${new Date().toLocaleDateString('ko-KR')}
`;

    return [{
      type: 'promotion_plan',
      title: `${exhibitionName} 홍보 계획서`,
      content,
      format: 'markdown'
    }];
  }

  /**
   * SNS 콘텐츠 생성
   */
  private async generateSNSContent(data: Record<string, any>, context: ExecutionContext): Promise<GeneratedDocument[]> {
    const documents: GeneratedDocument[] = [];

    // 10개 SNS 포스트 생성
    const posts = [
      {
        platform: 'Instagram',
        content: `🎨 ${data.exhibitionName || '특별 전시'} 오픈!

빛과 색채로 그린 순간들
인상주의 거장들의 작품을 만나보세요

📅 ${data.startDate || '2024.3.1'} - ${data.endDate || '2024.5.31'}
📍 ${data.location || '우리 미술관'}

#전시 #인상주의 #미술 #문화생활`,
        hashtags: ['전시', '인상주의', '미술', '문화생활']
      },
      {
        platform: 'Instagram',
        content: `💡 인상주의가 뭐예요?

19세기 프랑스에서 시작된 미술 운동
"순간의 인상"을 캔버스에 담다

우리 전시에서 자세히 알아보세요!

#인상주의 #미술사 #교육`,
        hashtags: ['인상주의', '미술사', '교육']
      },
      {
        platform: 'Facebook',
        content: `[이벤트] 전시 관람 인증샷 이벤트

전시를 관람하고 인증샷을 올려주세요!
추첨을 통해 도록과 굿즈를 드립니다 🎁

참여방법:
1. 전시 관람
2. 인증샷 + 후기 게시
3. #${data.exhibitionName} 해시태그`,
        hashtags: [data.exhibitionName || '전시']
      },
      {
        platform: 'Instagram',
        content: `🖼️ 작품 소개: 클로드 모네 '수련'

물 위에 비친 빛의 변화를
무수히 많은 붓터치로 표현한 걸작

전시장에서 실물을 만나보세요!

#모네 #수련 #인상주의`,
        hashtags: ['모네', '수련', '인상주의']
      },
      {
        platform: 'Instagram',
        content: `👨‍👩‍👧‍👦 주말 가족 나들이 추천!

아이들과 함께하는 미술 체험
교육 프로그램도 함께 운영 중

매주 토요일 오후 2시
사전 예약 필수!

#가족나들이 #미술체험 #주말`,
        hashtags: ['가족나들이', '미술체험', '주말']
      }
    ];

    posts.forEach((post, index) => {
      documents.push({
        type: 'sns_post',
        title: `SNS 포스트 ${index + 1} (${post.platform})`,
        content: post.content,
        format: 'plain',
        metadata: {
          platform: post.platform,
          hashtags: post.hashtags,
          scheduledDate: new Date(Date.now() + (index * 2 * 24 * 60 * 60 * 1000)).toISOString() // 이틀 간격
        }
      });
    });

    return documents;
  }

  /**
   * 보도자료 생성
   */
  private async generatePressRelease(data: Record<string, any>, context: ExecutionContext): Promise<GeneratedDocument[]> {
    const content = `# 보도자료

**배포 일시**: ${new Date().toLocaleDateString('ko-KR')}
**담당**: 홍보팀 (문의: 02-1234-5678)

---

## ${data.exhibitionName || '특별 전시'} 개최

${data.location || '우리 미술관'}(관장 OOO)는 오는 ${data.startDate || '3월 1일'}부터 ${data.endDate || '5월 31일'}까지 
'${data.exhibitionName || '인상주의 특별전'}'을 개최한다고 밝혔다.

### 전시 개요

이번 전시는 ${data.description || '19세기 인상주의 거장들의 작품 50여 점을 선보이는 대규모 전시'}로, 
국내외 유명 미술관과의 협력을 통해 실현되었다.

특히 클로드 모네의 '수련' 연작을 비롯해 르누아르, 마네 등 
인상주의를 대표하는 작가들의 주요 작품들을 한자리에서 만날 수 있다.

### 주요 프로그램

- **도슨트 투어**: 매일 오전 11시, 오후 3시
- **교육 프로그램**: 매주 토요일 오후 2시 (어린이 대상)
- **아티스트 토크**: 월 1회 (전시 관련 전문가 초청)

### 관람 안내

- **기간**: ${data.startDate || '2024.3.1'} - ${data.endDate || '2024.5.31'}
- **장소**: ${data.location || '우리 미술관'} 1층 전시실
- **시간**: 오전 10시 - 오후 6시 (월요일 휴관)
- **관람료**: 일반 15,000원 / 학생 10,000원

문의 및 예약: www.museum.com 또는 02-1234-5678

---

※ 이 보도자료는 ${new Date().toLocaleDateString('ko-KR')} 이후 보도 가능합니다.
`;

    return [{
      type: 'press_release',
      title: `${data.exhibitionName || '전시'} 보도자료`,
      content,
      format: 'markdown'
    }];
  }

  /**
   * 이메일 캠페인 생성
   */
  private async generateEmailCampaign(data: Record<string, any>, context: ExecutionContext): Promise<GeneratedDocument[]> {
    const content = `제목: [${data.location || '미술관'}] ${data.exhibitionName || '특별 전시'} 초대

안녕하세요, ${data.location || '우리 미술관'}입니다.

${data.exhibitionName || '인상주의 특별전'}에 여러분을 초대합니다!

🎨 **전시 정보**
- 기간: ${data.startDate || '3월 1일'} - ${data.endDate || '5월 31일'}
- 장소: ${data.location || '미술관'} 1층
- 주요 작품: 모네, 르누아르, 마네 등 50여 점

🎁 **이메일 구독자 특별 혜택**
- 관람료 20% 할인 (쿠폰 코드: ${data.couponCode || 'MEMBER20'})
- 전시 도록 추첨 증정 (10명)

👉 [지금 예약하기](${data.reservationUrl || 'https://museum.com/reserve'})

빠른 예약이 관람을 보장합니다!

감사합니다.

${data.location || '우리 미술관'} 드림
문의: 02-1234-5678
`;

    return [{
      type: 'email_campaign',
      title: `${data.exhibitionName || '전시'} 이메일 캠페인`,
      content,
      format: 'plain',
      metadata: {
        subject: `[${data.location || '미술관'}] ${data.exhibitionName || '특별 전시'} 초대`,
        recipients: data.recipients || 'subscribers'
      }
    }];
  }

  /**
   * 교육 커리큘럼 생성
   */
  private async generateCurriculum(data: Record<string, any>, context: ExecutionContext): Promise<GeneratedDocument[]> {
    const content = `# ${data.programName || '미술 교육 프로그램'} 커리큘럼

## 프로그램 개요

- **대상**: ${data.target || '초등학생 4-6학년'}
- **기간**: ${data.duration || '4주 (주 1회, 2시간)'}
- **정원**: ${data.capacity || '20명'}
- **장소**: ${data.location || '미술관 교육실'}

## 주차별 커리큘럼

### 1주차: 인상주의란 무엇인가?

**학습 목표**
- 인상주의의 개념 이해
- 다른 미술 사조와의 차이점 인식

**활동**
- 인상주의 작품 감상
- 색채 실험 (빛의 변화 관찰)
- 간단한 풍경화 스케치

**준비물**
- 수채화 도구, 스케치북

---

### 2주차: 빛과 그림자의 마법

**학습 목표**
- 빛의 변화가 색채에 미치는 영향 이해
- 야외 스케치 기법 습득

**활동**
- 미술관 정원에서 야외 스케치
- 같은 장소, 다른 시간대 비교
- 모네의 '건초더미' 연작 감상

**준비물**
- 야외 스케치 도구, 모자

---

### 3주차: 유명 작품 감상과 모사

**학습 목표**
- 인상주의 거장들의 기법 분석
- 모사를 통한 기법 학습

**활동**
- 전시 작품 심화 감상
- 마음에 드는 작품 선택하여 모사
- 작품 발표 준비

**준비물**
- 유화 또는 아크릴 물감 세트

---

### 4주차: 나만의 인상주의 작품

**학습 목표**
- 학습한 기법을 활용한 창작
- 작품 발표 및 감상 능력 향상

**활동**
- 자유 주제 작품 창작
- 작품 발표회
- 수료증 수여

**준비물**
- 완성 작품, 발표 준비

---

## 평가 방법

- 출석: 40%
- 활동 참여도: 30%
- 최종 작품: 30%

## 수료 기준

- 출석 75% 이상
- 최종 작품 제출

---

**문의**: 교육팀 (02-1234-5678)
`;

    return [{
      type: 'curriculum',
      title: `${data.programName || '미술 교육 프로그램'} 커리큘럼`,
      content,
      format: 'markdown'
    }];
  }

  /**
   * 보고서 생성
   */
  private async generateReport(data: Record<string, any>, context: ExecutionContext): Promise<GeneratedDocument[]> {
    const content = `# ${data.reportTitle || '전시 결과 보고서'}

## 1. 개요

- **전시명**: ${data.exhibitionName || 'OOO 전시'}
- **기간**: ${data.startDate || '2024.3.1'} - ${data.endDate || '2024.5.31'}
- **장소**: ${data.location || '미술관 1층'}

## 2. 관람객 통계

- **총 관람객**: ${data.totalVisitors?.toLocaleString() || '15,234명'}
- **일평균**: ${data.dailyAverage?.toLocaleString() || '167명'}
- **목표 달성률**: ${data.achievementRate || '101.6%'}

## 3. 성과 분석

### 3.1 긍정적 측면
- 목표 관람객 수 초과 달성
- SNS 반응 긍정적 (좋아요 ${data.socialLikes?.toLocaleString() || '3,200개'})
- 교육 프로그램 전회차 만석

### 3.2 개선 필요 사항
- 주말 혼잡도 관리
- 도슨트 인력 보강

## 4. 재정 보고

- **총 수입**: ₩${(data.revenue || 228500000).toLocaleString()}
- **총 지출**: ₩${(data.expense || 200000000).toLocaleString()}
- **순이익**: ₩${((data.revenue || 228500000) - (data.expense || 200000000)).toLocaleString()}

## 5. 향후 계획

- 후속 전시 기획 검토
- 우수 프로그램 정례화
- 파트너십 확대

---

**작성일**: ${new Date().toLocaleDateString('ko-KR')}
**작성자**: ${data.author || 'AI Orchestrator'}
`;

    return [{
      type: 'report',
      title: data.reportTitle || '전시 결과 보고서',
      content,
      format: 'markdown'
    }];
  }

  /**
   * 기본 문서 생성
   */
  private async generateDefaultDocument(data: Record<string, any>, context: ExecutionContext): Promise<GeneratedDocument[]> {
    const content = `# ${data.title || '문서'}

${data.content || 'AI가 생성한 문서입니다.'}

---

**작성일**: ${new Date().toLocaleDateString('ko-KR')}
`;

    return [{
      type: 'default',
      title: data.title || '문서',
      content,
      format: 'markdown'
    }];
  }

  /**
   * 문서 DB 저장
   */
  private async saveDocuments(documents: GeneratedDocument[], sessionId: string): Promise<void> {
    try {
      for (const doc of documents) {
        await this.db.prepare(`
          INSERT INTO ai_execution_events (session_id, event_type, phase_name, agent_type, event_data, timestamp, created_at)
          VALUES (?, 'agent-action', 'document', 'document', ?, ?, ?)
        `).bind(
          sessionId,
          JSON.stringify(doc),
          new Date().toISOString(),
          new Date().toISOString()
        ).run();
      }

      console.log(`✅ ${documents.length}개 문서 DB 저장 완료`);

    } catch (error) {
      console.error('❌ 문서 저장 실패:', error);
    }
  }

  /**
   * Google Docs 생성 (Optional)
   * TODO: Google Docs API 연동
   */
  private async createGoogleDocs(documents: GeneratedDocument[]): Promise<string[]> {
    // Google Docs API를 사용하여 실제 문서 생성
    // 현재는 Mock
    return documents.map(doc => `https://docs.google.com/document/d/mock_${Date.now()}`);
  }
}
