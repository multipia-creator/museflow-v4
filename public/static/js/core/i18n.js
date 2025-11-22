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
      
      // Actions
      zoomIn: '확대',
      zoomOut: '축소',
      resetView: '화면 초기화',
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
      panTool: '팬 도구 (H)',
      addConnection: '연결 추가',
      aiGenerate: 'AI 생성 (Ctrl+G)',
      
      // Common
      loading: '로딩 중...',
      error: '오류',
      success: '성공',
      warning: '경고',
      info: '정보'
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
      
      // Actions
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      resetView: 'Reset View',
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
      panTool: 'Pan Tool (H)',
      addConnection: 'Add Connection',
      aiGenerate: 'AI Generate (Ctrl+G)',
      
      // Common
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info'
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
      
      // Actions
      zoomIn: '放大',
      zoomOut: '缩小',
      resetView: '重置视图',
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
      panTool: '平移工具 (H)',
      addConnection: '添加连接',
      aiGenerate: 'AI生成 (Ctrl+G)',
      
      // Common
      loading: '加载中...',
      error: '错误',
      success: '成功',
      warning: '警告',
      info: '信息'
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
      
      // Actions
      zoomIn: 'ズームイン',
      zoomOut: 'ズームアウト',
      resetView: 'ビューをリセット',
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
      panTool: 'パンツール (H)',
      addConnection: '接続を追加',
      aiGenerate: 'AI生成 (Ctrl+G)',
      
      // Common
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
      warning: '警告',
      info: '情報'
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
