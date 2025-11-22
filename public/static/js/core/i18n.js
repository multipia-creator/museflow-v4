/**
 * MuseFlow i18n - Internationalization System
 * Supports: Korean (ko), English (en), Chinese (zh), Japanese (ja)
 */

const i18n = {
  currentLang: 'ko',
  
  translations: {
    ko: {
      // Canvas UI
      nodes: '노드',
      searchNodes: '노드 검색...',
      properties: '속성',
      selectNodeToEdit: '노드를 선택하여 속성을 편집하세요',
      title: '제목',
      description: '설명',
      status: '상태',
      color: '색상',
      delete: '삭제',
      save: '저장',
      cancel: '취소',
      untitledProject: '제목 없는 프로젝트',
      
      // Node categories
      all: '전체',
      exhibition: '전시',
      education: '교육',
      archive: '아카이브',
      publication: '출판',
      research: '연구',
      admin: '관리',
      
      // Statuses
      notStarted: '시작 전',
      inProgress: '진행 중',
      completed: '완료',
      onHold: '보류',
      todo: '할 일',
      done: '완료',
      
      // Actions
      zoomIn: '확대 (+)',
      zoomOut: '축소 (-)',
      resetView: '화면 초기화 (0)',
      fitToView: '전체 보기',
      undo: '실행 취소',
      redo: '다시 실행',
      deleteSelected: '선택 항목 삭제',
      selectAll: '전체 선택',
      
      // Messages
      canvasSaved: '캔버스가 저장되었습니다!',
      noProjectSelected: '프로젝트가 선택되지 않았습니다',
      cannotSendMessage: '메시지를 보낼 수 없습니다',
      collaborationInitialized: '협업이 초기화되었습니다',
      aiGenerating: 'AI가 워크플로우를 생성 중입니다...',
      
      // Tooltips
      backToProjects: '프로젝트 목록으로',
      selectTool: '선택 도구 (V)',
      handTool: '이동 도구 (H)',
      commentTool: '댓글 도구 (C)',
      panTool: '팬 도구 (H)',
      addConnection: '연결 추가',
      aiGenerate: 'AI 생성 (Ctrl+G)',
      saveCanvas: '저장 (Ctrl+S)',
      undoAction: '실행 취소 (Ctrl+Z)',
      redoAction: '다시 실행 (Ctrl+Shift+Z)',
      
      // Common
      loading: '로딩 중...',
      error: '오류',
      success: '성공',
      warning: '경고',
      info: '정보',
      noNodesFound: '노드를 찾을 수 없습니다',
      minimap: '미니맵',
      autoSaving: '자동 저장 중',
      
      // Node Names - Exhibition (15)
      'exhibition-planning': '전시 기획',
      'curator-assignment': '큐레이터 배정',
      'artwork-selection': '작품 선정',
      'layout-design': '레이아웃 디자인',
      'lighting-setup': '조명 설치',
      'label-creation': '라벨 제작',
      'installation': '설치',
      'opening-event': '오프닝 행사',
      'visitor-feedback': '관람객 피드백',
      'exhibition-tour': '전시 투어',
      'multimedia-setup': '멀티미디어 설치',
      'security-planning': '보안 계획',
      'climate-control': '온습도 관리',
      'accessibility': '접근성',
      'deinstallation': '철거',
      
      // Node Names - Education (15)
      'program-design': '프로그램 설계',
      'workshop-planning': '워크숍 기획',
      'educator-training': '교육자 훈련',
      'school-outreach': '학교 연계',
      'family-program': '가족 프로그램',
      'lecture-series': '강연 시리즈',
      'online-learning': '온라인 학습',
      'curriculum-development': '커리큘럼 개발',
      'assessment': '평가',
      'resource-creation': '자료 제작',
      'community-partnership': '지역사회 협력',
      'volunteer-program': '자원봉사 프로그램',
      'student-exhibition': '학생 전시',
      'art-therapy': '미술 치료',
      'special-needs': '특수 교육 프로그램',
      
      // Node Names - Archive (15)
      'digitization': '디지털화',
      'cataloging': '목록 작성',
      'metadata-creation': '메타데이터 생성',
      'preservation': '보존',
      'restoration': '복원',
      'storage-management': '보관 관리',
      'condition-report': '상태 보고서',
      'photography': '사진 촬영',
      'database-entry': '데이터베이스 입력',
      'provenance-research': '출처 조사',
      'inventory': '재고 조사',
      'loan-management': '대여 관리',
      'accession': '등록',
      'deaccession': '등록 해제',
      'rights-management': '권리 관리',
      
      // Node Names - Publication (12)
      'catalog-writing': '카탈로그 작성',
      'essay-commission': '에세이 의뢰',
      'editing': '편집',
      'design-layout': '디자인 & 레이아웃',
      'image-selection': '이미지 선정',
      'copyright-clearance': '저작권 승인',
      'printing': '인쇄',
      'distribution': '배포',
      'digital-publication': '디지털 출판',
      'newsletter': '뉴스레터',
      'press-release': '보도자료',
      'social-media': '소셜 미디어',
      
      // Node Names - Research (12)
      'artwork-research': '작품 연구',
      'artist-biography': '작가 약력',
      'historical-context': '역사적 맥락',
      'literature-review': '문헌 검토',
      'archive-visit': '아카이브 방문',
      'interview': '인터뷰',
      'survey': '설문조사',
      'data-analysis': '데이터 분석',
      'report-writing': '보고서 작성',
      'peer-review': '동료 검토',
      'conference': '컨퍼런스',
      'publication-submit': '출판 제출',
      
      // Node Names - Admin (19)
      'budget-planning': '예산 계획',
      'funding-application': '자금 신청',
      'staff-meeting': '직원 회의',
      'hiring': '채용',
      'training': '교육',
      'policy-development': '정책 개발',
      'compliance': '규정 준수',
      'insurance': '보험',
      'facility-management': '시설 관리',
      'it-support': 'IT 지원',
      'vendor-management': '공급업체 관리',
      'contract-negotiation': '계약 협상',
      'board-meeting': '이사회',
      'fundraising': '기금 모금',
      'marketing': '마케팅',
      'visitor-services': '관람객 서비스',
      'ticketing': '티켓팅',
      'membership': '회원제',
      'evaluation': '평가'
    },
    
    en: {
      // Canvas UI
      nodes: 'Nodes',
      searchNodes: 'Search nodes...',
      properties: 'Properties',
      selectNodeToEdit: 'Select a node to edit its properties',
      title: 'Title',
      description: 'Description',
      status: 'Status',
      color: 'Color',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      untitledProject: 'Untitled Project',
      
      // Node categories
      all: 'All',
      exhibition: 'Exhibition',
      education: 'Education',
      archive: 'Archive',
      publication: 'Publication',
      research: 'Research',
      admin: 'Admin',
      
      // Statuses
      notStarted: 'Not Started',
      inProgress: 'In Progress',
      completed: 'Completed',
      onHold: 'On Hold',
      todo: 'To Do',
      done: 'Done',
      
      // Actions
      zoomIn: 'Zoom In (+)',
      zoomOut: 'Zoom Out (-)',
      resetView: 'Reset View (0)',
      fitToView: 'Fit to View',
      undo: 'Undo',
      redo: 'Redo',
      deleteSelected: 'Delete Selected',
      selectAll: 'Select All',
      
      // Messages
      canvasSaved: 'Canvas saved!',
      noProjectSelected: 'No project selected',
      cannotSendMessage: 'Cannot send message',
      collaborationInitialized: 'Collaboration initialized',
      aiGenerating: 'AI is generating workflow...',
      
      // Tooltips
      backToProjects: 'Back to Projects',
      selectTool: 'Select Tool (V)',
      handTool: 'Hand Tool (H)',
      commentTool: 'Comment Tool (C)',
      panTool: 'Pan Tool (H)',
      addConnection: 'Add Connection',
      aiGenerate: 'AI Generate (Ctrl+G)',
      saveCanvas: 'Save (Ctrl+S)',
      undoAction: 'Undo (Ctrl+Z)',
      redoAction: 'Redo (Ctrl+Shift+Z)',
      
      // Common
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info',
      noNodesFound: 'No nodes found',
      minimap: 'Minimap',
      autoSaving: 'Auto-saving',
      
      // Node Names - Exhibition (15)
      'exhibition-planning': 'Exhibition Planning',
      'curator-assignment': 'Curator Assignment',
      'artwork-selection': 'Artwork Selection',
      'layout-design': 'Layout Design',
      'lighting-setup': 'Lighting Setup',
      'label-creation': 'Label Creation',
      'installation': 'Installation',
      'opening-event': 'Opening Event',
      'visitor-feedback': 'Visitor Feedback',
      'exhibition-tour': 'Exhibition Tour',
      'multimedia-setup': 'Multimedia Setup',
      'security-planning': 'Security Planning',
      'climate-control': 'Climate Control',
      'accessibility': 'Accessibility',
      'deinstallation': 'Deinstallation',
      
      // Node Names - Education (15)
      'program-design': 'Program Design',
      'workshop-planning': 'Workshop Planning',
      'educator-training': 'Educator Training',
      'school-outreach': 'School Outreach',
      'family-program': 'Family Program',
      'lecture-series': 'Lecture Series',
      'online-learning': 'Online Learning',
      'curriculum-development': 'Curriculum Development',
      'assessment': 'Assessment',
      'resource-creation': 'Resource Creation',
      'community-partnership': 'Community Partnership',
      'volunteer-program': 'Volunteer Program',
      'student-exhibition': 'Student Exhibition',
      'art-therapy': 'Art Therapy',
      'special-needs': 'Special Needs Program',
      
      // Node Names - Archive (15)
      'digitization': 'Digitization',
      'cataloging': 'Cataloging',
      'metadata-creation': 'Metadata Creation',
      'preservation': 'Preservation',
      'restoration': 'Restoration',
      'storage-management': 'Storage Management',
      'condition-report': 'Condition Report',
      'photography': 'Photography',
      'database-entry': 'Database Entry',
      'provenance-research': 'Provenance Research',
      'inventory': 'Inventory',
      'loan-management': 'Loan Management',
      'accession': 'Accession',
      'deaccession': 'Deaccession',
      'rights-management': 'Rights Management',
      
      // Node Names - Publication (12)
      'catalog-writing': 'Catalog Writing',
      'essay-commission': 'Essay Commission',
      'editing': 'Editing',
      'design-layout': 'Design & Layout',
      'image-selection': 'Image Selection',
      'copyright-clearance': 'Copyright Clearance',
      'printing': 'Printing',
      'distribution': 'Distribution',
      'digital-publication': 'Digital Publication',
      'newsletter': 'Newsletter',
      'press-release': 'Press Release',
      'social-media': 'Social Media',
      
      // Node Names - Research (12)
      'artwork-research': 'Artwork Research',
      'artist-biography': 'Artist Biography',
      'historical-context': 'Historical Context',
      'literature-review': 'Literature Review',
      'archive-visit': 'Archive Visit',
      'interview': 'Interview',
      'survey': 'Survey',
      'data-analysis': 'Data Analysis',
      'report-writing': 'Report Writing',
      'peer-review': 'Peer Review',
      'conference': 'Conference',
      'publication-submit': 'Publication Submit',
      
      // Node Names - Admin (19)
      'budget-planning': 'Budget Planning',
      'funding-application': 'Funding Application',
      'staff-meeting': 'Staff Meeting',
      'hiring': 'Hiring',
      'training': 'Training',
      'policy-development': 'Policy Development',
      'compliance': 'Compliance',
      'insurance': 'Insurance',
      'facility-management': 'Facility Management',
      'it-support': 'IT Support',
      'vendor-management': 'Vendor Management',
      'contract-negotiation': 'Contract Negotiation',
      'board-meeting': 'Board Meeting',
      'fundraising': 'Fundraising',
      'marketing': 'Marketing',
      'visitor-services': 'Visitor Services',
      'ticketing': 'Ticketing',
      'membership': 'Membership',
      'evaluation': 'Evaluation'
    },
    
    zh: {
      // Canvas UI
      nodes: '节点',
      searchNodes: '搜索节点...',
      properties: '属性',
      selectNodeToEdit: '选择一个节点来编辑其属性',
      title: '标题',
      description: '描述',
      status: '状态',
      color: '颜色',
      delete: '删除',
      save: '保存',
      cancel: '取消',
      untitledProject: '无标题项目',
      
      // Node categories
      all: '全部',
      exhibition: '展览',
      education: '教育',
      archive: '档案',
      publication: '出版',
      research: '研究',
      admin: '管理',
      
      // Statuses
      notStarted: '未开始',
      inProgress: '进行中',
      completed: '已完成',
      onHold: '暂停',
      todo: '待办',
      done: '完成',
      
      // Actions
      zoomIn: '放大 (+)',
      zoomOut: '缩小 (-)',
      resetView: '重置视图 (0)',
      fitToView: '适应视图',
      undo: '撤销',
      redo: '重做',
      deleteSelected: '删除选中项',
      selectAll: '全选',
      
      // Messages
      canvasSaved: '画布已保存！',
      noProjectSelected: '未选择项目',
      cannotSendMessage: '无法发送消息',
      collaborationInitialized: '协作已初始化',
      aiGenerating: 'AI正在生成工作流程...',
      
      // Tooltips
      backToProjects: '返回项目列表',
      selectTool: '选择工具 (V)',
      handTool: '手形工具 (H)',
      commentTool: '评论工具 (C)',
      panTool: '平移工具 (H)',
      addConnection: '添加连接',
      aiGenerate: 'AI生成 (Ctrl+G)',
      saveCanvas: '保存 (Ctrl+S)',
      undoAction: '撤销 (Ctrl+Z)',
      redoAction: '重做 (Ctrl+Shift+Z)',
      
      // Common
      loading: '加载中...',
      error: '错误',
      success: '成功',
      warning: '警告',
      info: '信息',
      noNodesFound: '未找到节点',
      minimap: '缩略图',
      autoSaving: '自动保存中',
      
      // Node Names - Exhibition (15)
      'exhibition-planning': '展览策划',
      'curator-assignment': '策展人分配',
      'artwork-selection': '作品选择',
      'layout-design': '布局设计',
      'lighting-setup': '照明设置',
      'label-creation': '标签制作',
      'installation': '安装',
      'opening-event': '开幕活动',
      'visitor-feedback': '观众反馈',
      'exhibition-tour': '展览导览',
      'multimedia-setup': '多媒体设置',
      'security-planning': '安保计划',
      'climate-control': '温湿度控制',
      'accessibility': '无障碍设施',
      'deinstallation': '撤展',
      
      // Node Names - Education (15)
      'program-design': '项目设计',
      'workshop-planning': '工作坊策划',
      'educator-training': '教育者培训',
      'school-outreach': '学校推广',
      'family-program': '家庭项目',
      'lecture-series': '讲座系列',
      'online-learning': '在线学习',
      'curriculum-development': '课程开发',
      'assessment': '评估',
      'resource-creation': '资源创建',
      'community-partnership': '社区合作',
      'volunteer-program': '志愿者项目',
      'student-exhibition': '学生展览',
      'art-therapy': '艺术治疗',
      'special-needs': '特殊需求项目',
      
      // Node Names - Archive (15)
      'digitization': '数字化',
      'cataloging': '编目',
      'metadata-creation': '元数据创建',
      'preservation': '保存',
      'restoration': '修复',
      'storage-management': '存储管理',
      'condition-report': '状况报告',
      'photography': '摄影',
      'database-entry': '数据库录入',
      'provenance-research': '来源研究',
      'inventory': '清点',
      'loan-management': '借展管理',
      'accession': '登录',
      'deaccession': '注销',
      'rights-management': '权利管理',
      
      // Node Names - Publication (12)
      'catalog-writing': '图录撰写',
      'essay-commission': '论文委托',
      'editing': '编辑',
      'design-layout': '设计与排版',
      'image-selection': '图片选择',
      'copyright-clearance': '版权许可',
      'printing': '印刷',
      'distribution': '分发',
      'digital-publication': '数字出版',
      'newsletter': '通讯',
      'press-release': '新闻稿',
      'social-media': '社交媒体',
      
      // Node Names - Research (12)
      'artwork-research': '作品研究',
      'artist-biography': '艺术家传记',
      'historical-context': '历史背景',
      'literature-review': '文献综述',
      'archive-visit': '档案访问',
      'interview': '访谈',
      'survey': '调查',
      'data-analysis': '数据分析',
      'report-writing': '报告撰写',
      'peer-review': '同行评审',
      'conference': '会议',
      'publication-submit': '出版物提交',
      
      // Node Names - Admin (19)
      'budget-planning': '预算规划',
      'funding-application': '资金申请',
      'staff-meeting': '员工会议',
      'hiring': '招聘',
      'training': '培训',
      'policy-development': '政策制定',
      'compliance': '合规',
      'insurance': '保险',
      'facility-management': '设施管理',
      'it-support': 'IT支持',
      'vendor-management': '供应商管理',
      'contract-negotiation': '合同谈判',
      'board-meeting': '董事会',
      'fundraising': '筹款',
      'marketing': '营销',
      'visitor-services': '观众服务',
      'ticketing': '票务',
      'membership': '会员制',
      'evaluation': '评估'
    },
    
    ja: {
      // Canvas UI
      nodes: 'ノード',
      searchNodes: 'ノードを検索...',
      properties: 'プロパティ',
      selectNodeToEdit: 'ノードを選択してプロパティを編集します',
      title: 'タイトル',
      description: '説明',
      status: 'ステータス',
      color: '色',
      delete: '削除',
      save: '保存',
      cancel: 'キャンセル',
      untitledProject: '無題のプロジェクト',
      
      // Node categories
      all: 'すべて',
      exhibition: '展示',
      education: '教育',
      archive: 'アーカイブ',
      publication: '出版',
      research: '研究',
      admin: '管理',
      
      // Statuses
      notStarted: '未開始',
      inProgress: '進行中',
      completed: '完了',
      onHold: '保留',
      todo: '未完了',
      done: '完了',
      
      // Actions
      zoomIn: 'ズームイン (+)',
      zoomOut: 'ズームアウト (-)',
      resetView: 'ビューをリセット (0)',
      fitToView: '全体表示',
      undo: '元に戻す',
      redo: 'やり直し',
      deleteSelected: '選択項目を削除',
      selectAll: 'すべて選択',
      
      // Messages
      canvasSaved: 'キャンバスが保存されました！',
      noProjectSelected: 'プロジェクトが選択されていません',
      cannotSendMessage: 'メッセージを送信できません',
      collaborationInitialized: 'コラボレーションが初期化されました',
      aiGenerating: 'AIがワークフローを生成中...',
      
      // Tooltips
      backToProjects: 'プロジェクト一覧へ',
      selectTool: '選択ツール (V)',
      handTool: 'ハンドツール (H)',
      commentTool: 'コメントツール (C)',
      panTool: 'パンツール (H)',
      addConnection: '接続を追加',
      aiGenerate: 'AI生成 (Ctrl+G)',
      saveCanvas: '保存 (Ctrl+S)',
      undoAction: '元に戻す (Ctrl+Z)',
      redoAction: 'やり直し (Ctrl+Shift+Z)',
      
      // Common
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
      warning: '警告',
      info: '情報',
      noNodesFound: 'ノードが見つかりません',
      minimap: 'ミニマップ',
      autoSaving: '自動保存中',
      
      // Node Names - Exhibition (15)
      'exhibition-planning': '展示企画',
      'curator-assignment': 'キュレーター配置',
      'artwork-selection': '作品選定',
      'layout-design': 'レイアウトデザイン',
      'lighting-setup': '照明設置',
      'label-creation': 'ラベル作成',
      'installation': '設置',
      'opening-event': 'オープニングイベント',
      'visitor-feedback': '来場者フィードバック',
      'exhibition-tour': '展示ツアー',
      'multimedia-setup': 'マルチメディア設置',
      'security-planning': 'セキュリティ計画',
      'climate-control': '温湿度管理',
      'accessibility': 'アクセシビリティ',
      'deinstallation': '撤収',
      
      // Node Names - Education (15)
      'program-design': 'プログラム設計',
      'workshop-planning': 'ワークショップ企画',
      'educator-training': '教育者研修',
      'school-outreach': '学校連携',
      'family-program': 'ファミリープログラム',
      'lecture-series': '講演シリーズ',
      'online-learning': 'オンライン学習',
      'curriculum-development': 'カリキュラム開発',
      'assessment': '評価',
      'resource-creation': '資料作成',
      'community-partnership': '地域協力',
      'volunteer-program': 'ボランティアプログラム',
      'student-exhibition': '学生展',
      'art-therapy': 'アートセラピー',
      'special-needs': '特別支援プログラム',
      
      // Node Names - Archive (15)
      'digitization': 'デジタル化',
      'cataloging': 'カタログ作成',
      'metadata-creation': 'メタデータ作成',
      'preservation': '保存',
      'restoration': '修復',
      'storage-management': '保管管理',
      'condition-report': '状態報告書',
      'photography': '写真撮影',
      'database-entry': 'データベース入力',
      'provenance-research': '来歴調査',
      'inventory': '在庫調査',
      'loan-management': '貸出管理',
      'accession': '登録',
      'deaccession': '登録抹消',
      'rights-management': '権利管理',
      
      // Node Names - Publication (12)
      'catalog-writing': 'カタログ執筆',
      'essay-commission': 'エッセイ依頼',
      'editing': '編集',
      'design-layout': 'デザイン＆レイアウト',
      'image-selection': '画像選定',
      'copyright-clearance': '著作権許可',
      'printing': '印刷',
      'distribution': '配布',
      'digital-publication': 'デジタル出版',
      'newsletter': 'ニュースレター',
      'press-release': 'プレスリリース',
      'social-media': 'ソーシャルメディア',
      
      // Node Names - Research (12)
      'artwork-research': '作品研究',
      'artist-biography': '作家略歴',
      'historical-context': '歴史的背景',
      'literature-review': '文献レビュー',
      'archive-visit': 'アーカイブ訪問',
      'interview': 'インタビュー',
      'survey': 'アンケート',
      'data-analysis': 'データ分析',
      'report-writing': 'レポート作成',
      'peer-review': 'ピアレビュー',
      'conference': 'カンファレンス',
      'publication-submit': '出版物提出',
      
      // Node Names - Admin (19)
      'budget-planning': '予算計画',
      'funding-application': '資金申請',
      'staff-meeting': 'スタッフ会議',
      'hiring': '採用',
      'training': '研修',
      'policy-development': '方針策定',
      'compliance': 'コンプライアンス',
      'insurance': '保険',
      'facility-management': '施設管理',
      'it-support': 'ITサポート',
      'vendor-management': 'ベンダー管理',
      'contract-negotiation': '契約交渉',
      'board-meeting': '理事会',
      'fundraising': '資金調達',
      'marketing': 'マーケティング',
      'visitor-services': '来場者サービス',
      'ticketing': 'チケッティング',
      'membership': '会員制',
      'evaluation': '評価'
    }
  },
  
  /**
   * Initialize i18n system
   */
  init() {
    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    const savedLang = localStorage.getItem('museflow_lang');
    
    this.currentLang = savedLang || (this.translations[browserLang] ? browserLang : 'ko');
    console.log('🌍 i18n initialized:', this.currentLang);
  },
  
  /**
   * Get translation
   */
  t(key) {
    return this.translations[this.currentLang][key] || key;
  },
  
  /**
   * Change language
   */
  setLang(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('museflow_lang', lang);
      console.log('🌍 Language changed to:', lang);
      return true;
    }
    return false;
  },
  
  /**
   * Get current language
   */
  getLang() {
    return this.currentLang;
  },
  
  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return Object.keys(this.translations);
  }
};

// Auto-initialize
i18n.init();

// Expose globally
window.i18n = i18n;
console.log('✅ i18n loaded');
