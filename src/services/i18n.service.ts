/**
 * Internationalization (i18n) Service
 * Multi-language support with automatic detection
 */

export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh' | 'es';

export interface Translation {
  [key: string]: string | Translation;
}

export interface TranslationConfig {
  defaultLanguage: SupportedLanguage;
  fallbackLanguage: SupportedLanguage;
  supportedLanguages: SupportedLanguage[];
}

export class I18nService {
  private currentLanguage: SupportedLanguage;
  private translations: Map<SupportedLanguage, Translation>;
  private config: TranslationConfig;

  constructor(config: TranslationConfig) {
    this.config = config;
    this.currentLanguage = config.defaultLanguage;
    this.translations = new Map();
    
    // Load default translations
    this.loadTranslations();
  }

  /**
   * Load all translations
   */
  private loadTranslations(): void {
    // Korean
    this.translations.set('ko', {
      common: {
        welcome: '환영합니다',
        loading: '로딩 중...',
        error: '오류가 발생했습니다',
        success: '성공했습니다',
        cancel: '취소',
        confirm: '확인',
        save: '저장',
        delete: '삭제',
        edit: '수정',
        search: '검색',
        filter: '필터',
        sort: '정렬',
        close: '닫기',
        back: '뒤로',
        next: '다음',
        previous: '이전',
      },
      nav: {
        home: '홈',
        workflows: '워크플로',
        museum: '박물관',
        chatbot: '챗봇',
        admin: '관리자',
        settings: '설정',
        logout: '로그아웃',
      },
      workflow: {
        create: '워크플로 생성',
        title: '제목',
        description: '설명',
        status: '상태',
        progress: '진행률',
        assignee: '담당자',
        dueDate: '마감일',
        priority: '우선순위',
        tags: '태그',
      },
      museum: {
        artwork: '작품',
        exhibition: '전시',
        artist: '작가',
        period: '시대',
        category: '카테고리',
        collection: '컬렉션',
        search: '작품 검색',
        viewDetails: '상세 보기',
      },
      chatbot: {
        greeting: '안녕하세요! 무엇을 도와드릴까요?',
        placeholder: '메시지를 입력하세요...',
        send: '전송',
        suggestions: '추천 질문',
        thinking: '생각 중...',
      },
      admin: {
        dashboard: '대시보드',
        users: '사용자',
        analytics: '분석',
        cache: '캐시',
        logs: '로그',
        settings: '설정',
      },
    });

    // English
    this.translations.set('en', {
      common: {
        welcome: 'Welcome',
        loading: 'Loading...',
        error: 'An error occurred',
        success: 'Success',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
      },
      nav: {
        home: 'Home',
        workflows: 'Workflows',
        museum: 'Museum',
        chatbot: 'Chatbot',
        admin: 'Admin',
        settings: 'Settings',
        logout: 'Logout',
      },
      workflow: {
        create: 'Create Workflow',
        title: 'Title',
        description: 'Description',
        status: 'Status',
        progress: 'Progress',
        assignee: 'Assignee',
        dueDate: 'Due Date',
        priority: 'Priority',
        tags: 'Tags',
      },
      museum: {
        artwork: 'Artwork',
        exhibition: 'Exhibition',
        artist: 'Artist',
        period: 'Period',
        category: 'Category',
        collection: 'Collection',
        search: 'Search Artworks',
        viewDetails: 'View Details',
      },
      chatbot: {
        greeting: 'Hello! How can I help you?',
        placeholder: 'Type your message...',
        send: 'Send',
        suggestions: 'Suggested Questions',
        thinking: 'Thinking...',
      },
      admin: {
        dashboard: 'Dashboard',
        users: 'Users',
        analytics: 'Analytics',
        cache: 'Cache',
        logs: 'Logs',
        settings: 'Settings',
      },
    });

    // Japanese
    this.translations.set('ja', {
      common: {
        welcome: 'ようこそ',
        loading: '読み込み中...',
        error: 'エラーが発生しました',
        success: '成功しました',
        cancel: 'キャンセル',
        confirm: '確認',
        save: '保存',
        delete: '削除',
        edit: '編集',
        search: '検索',
        filter: 'フィルター',
        sort: '並べ替え',
        close: '閉じる',
        back: '戻る',
        next: '次へ',
        previous: '前へ',
      },
      nav: {
        home: 'ホーム',
        workflows: 'ワークフロー',
        museum: '博物館',
        chatbot: 'チャットボット',
        admin: '管理者',
        settings: '設定',
        logout: 'ログアウト',
      },
      workflow: {
        create: 'ワークフロー作成',
        title: 'タイトル',
        description: '説明',
        status: 'ステータス',
        progress: '進捗',
        assignee: '担当者',
        dueDate: '期限',
        priority: '優先度',
        tags: 'タグ',
      },
      museum: {
        artwork: '作品',
        exhibition: '展示',
        artist: '作家',
        period: '時代',
        category: 'カテゴリ',
        collection: 'コレクション',
        search: '作品検索',
        viewDetails: '詳細を見る',
      },
      chatbot: {
        greeting: 'こんにちは！何かお手伝いできますか？',
        placeholder: 'メッセージを入力...',
        send: '送信',
        suggestions: 'おすすめの質問',
        thinking: '考え中...',
      },
      admin: {
        dashboard: 'ダッシュボード',
        users: 'ユーザー',
        analytics: '分析',
        cache: 'キャッシュ',
        logs: 'ログ',
        settings: '設定',
      },
    });

    // Chinese (Simplified)
    this.translations.set('zh', {
      common: {
        welcome: '欢迎',
        loading: '加载中...',
        error: '发生错误',
        success: '成功',
        cancel: '取消',
        confirm: '确认',
        save: '保存',
        delete: '删除',
        edit: '编辑',
        search: '搜索',
        filter: '筛选',
        sort: '排序',
        close: '关闭',
        back: '返回',
        next: '下一步',
        previous: '上一步',
      },
      nav: {
        home: '首页',
        workflows: '工作流',
        museum: '博物馆',
        chatbot: '聊天机器人',
        admin: '管理员',
        settings: '设置',
        logout: '退出',
      },
      workflow: {
        create: '创建工作流',
        title: '标题',
        description: '描述',
        status: '状态',
        progress: '进度',
        assignee: '负责人',
        dueDate: '截止日期',
        priority: '优先级',
        tags: '标签',
      },
      museum: {
        artwork: '艺术品',
        exhibition: '展览',
        artist: '艺术家',
        period: '时期',
        category: '类别',
        collection: '收藏',
        search: '搜索艺术品',
        viewDetails: '查看详情',
      },
      chatbot: {
        greeting: '你好！我能帮你什么？',
        placeholder: '输入消息...',
        send: '发送',
        suggestions: '推荐问题',
        thinking: '思考中...',
      },
      admin: {
        dashboard: '仪表板',
        users: '用户',
        analytics: '分析',
        cache: '缓存',
        logs: '日志',
        settings: '设置',
      },
    });

    // Spanish
    this.translations.set('es', {
      common: {
        welcome: 'Bienvenido',
        loading: 'Cargando...',
        error: 'Ocurrió un error',
        success: 'Éxito',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        save: 'Guardar',
        delete: 'Eliminar',
        edit: 'Editar',
        search: 'Buscar',
        filter: 'Filtrar',
        sort: 'Ordenar',
        close: 'Cerrar',
        back: 'Atrás',
        next: 'Siguiente',
        previous: 'Anterior',
      },
      nav: {
        home: 'Inicio',
        workflows: 'Flujos de trabajo',
        museum: 'Museo',
        chatbot: 'Chatbot',
        admin: 'Administrador',
        settings: 'Configuración',
        logout: 'Cerrar sesión',
      },
      workflow: {
        create: 'Crear flujo',
        title: 'Título',
        description: 'Descripción',
        status: 'Estado',
        progress: 'Progreso',
        assignee: 'Asignado',
        dueDate: 'Fecha límite',
        priority: 'Prioridad',
        tags: 'Etiquetas',
      },
      museum: {
        artwork: 'Obra de arte',
        exhibition: 'Exposición',
        artist: 'Artista',
        period: 'Período',
        category: 'Categoría',
        collection: 'Colección',
        search: 'Buscar obras',
        viewDetails: 'Ver detalles',
      },
      chatbot: {
        greeting: '¡Hola! ¿En qué puedo ayudarte?',
        placeholder: 'Escribe tu mensaje...',
        send: 'Enviar',
        suggestions: 'Preguntas sugeridas',
        thinking: 'Pensando...',
      },
      admin: {
        dashboard: 'Panel',
        users: 'Usuarios',
        analytics: 'Análisis',
        cache: 'Caché',
        logs: 'Registros',
        settings: 'Configuración',
      },
    });
  }

  /**
   * Get translation by key
   */
  t(key: string, params?: Record<string, string>): string {
    const keys = key.split('.');
    let translation: any = this.translations.get(this.currentLanguage);

    // Navigate through nested keys
    for (const k of keys) {
      if (translation && typeof translation === 'object') {
        translation = translation[k];
      } else {
        // Fallback to default language
        translation = this.translations.get(this.config.fallbackLanguage);
        for (const fk of keys) {
          if (translation && typeof translation === 'object') {
            translation = translation[fk];
          }
        }
        break;
      }
    }

    // Return translation or key if not found
    let result = typeof translation === 'string' ? translation : key;

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, value);
      });
    }

    return result;
  }

  /**
   * Set current language
   */
  setLanguage(language: SupportedLanguage): void {
    if (this.config.supportedLanguages.includes(language)) {
      this.currentLanguage = language;
      console.log(`🌐 Language changed to: ${language}`);
    } else {
      console.warn(`⚠️ Language '${language}' not supported`);
    }
  }

  /**
   * Get current language
   */
  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Detect browser language
   */
  detectLanguage(): SupportedLanguage {
    // Browser language detection
    const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
    
    if (this.config.supportedLanguages.includes(browserLang)) {
      return browserLang;
    }
    
    return this.config.defaultLanguage;
  }

  /**
   * Get all translations for current language
   */
  getAllTranslations(): Translation {
    return this.translations.get(this.currentLanguage) || {};
  }

  /**
   * Format date according to locale
   */
  formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    const localeMap: Record<SupportedLanguage, string> = {
      ko: 'ko-KR',
      en: 'en-US',
      ja: 'ja-JP',
      zh: 'zh-CN',
      es: 'es-ES',
    };

    const options: Intl.DateTimeFormatOptions = format === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: '2-digit', day: '2-digit' };

    return d.toLocaleDateString(localeMap[this.currentLanguage], options);
  }

  /**
   * Format number according to locale
   */
  formatNumber(value: number, decimals: number = 0): string {
    const localeMap: Record<SupportedLanguage, string> = {
      ko: 'ko-KR',
      en: 'en-US',
      ja: 'ja-JP',
      zh: 'zh-CN',
      es: 'es-ES',
    };

    return value.toLocaleString(localeMap[this.currentLanguage], {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  /**
   * Format currency according to locale
   */
  formatCurrency(value: number, currency: string = 'KRW'): string {
    const localeMap: Record<SupportedLanguage, string> = {
      ko: 'ko-KR',
      en: 'en-US',
      ja: 'ja-JP',
      zh: 'zh-CN',
      es: 'es-ES',
    };

    return value.toLocaleString(localeMap[this.currentLanguage], {
      style: 'currency',
      currency: currency,
    });
  }
}

// Singleton instance
let i18nInstance: I18nService | null = null;

export function initI18n(config?: Partial<TranslationConfig>): I18nService {
  if (!i18nInstance) {
    const defaultConfig: TranslationConfig = {
      defaultLanguage: 'ko',
      fallbackLanguage: 'en',
      supportedLanguages: ['ko', 'en', 'ja', 'zh', 'es'],
    };

    i18nInstance = new I18nService({ ...defaultConfig, ...config });
    
    // Auto-detect browser language
    const detectedLang = i18nInstance.detectLanguage();
    i18nInstance.setLanguage(detectedLang);
  }

  return i18nInstance;
}

export function getI18n(): I18nService {
  if (!i18nInstance) {
    return initI18n();
  }
  return i18nInstance;
}

export default I18nService;
