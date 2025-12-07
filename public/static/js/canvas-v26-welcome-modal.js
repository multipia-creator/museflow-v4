/**
 * MuseFlow Canvas V26.0 - Welcome Modal & Role Selection
 * 
 * 첫 방문 시 학예사 역할 선택 → 샘플 데이터 자동 생성 → 튜토리얼 시작
 * 
 * Features:
 * - Welcome Modal (역할 선택)
 * - Sample Data Auto-generation
 * - Tutorial Integration
 * - Behavior Detector Integration
 * 
 * @version 26.0.0
 * @date 2025-12-07
 */

const MuseumWelcome = {
  // Storage keys
  STORAGE_KEYS: {
    welcomed: 'museflow_v26_welcomed',
    selectedRole: 'museflow_v26_selected_role',
    onboardingCompleted: 'museflow_canvas_onboarding_completed'
  },

  // State
  state: {
    isShowing: false,
    selectedRole: null
  },

  /**
   * 첫 방문 여부 확인
   * @returns {boolean}
   */
  isFirstVisit() {
    return !localStorage.getItem(this.STORAGE_KEYS.welcomed);
  },

  /**
   * Initialize Welcome Modal
   */
  init() {
    console.log('[MuseumWelcome] Initializing...');

    // 첫 방문이 아니면 skip
    if (!this.isFirstVisit()) {
      console.log('[MuseumWelcome] Already welcomed, skipping');
      return;
    }

    // 1초 후 Welcome Modal 표시
    setTimeout(() => {
      this.showWelcomeModal();
    }, 1000);
  },

  /**
   * Welcome Modal 표시
   */
  showWelcomeModal() {
    if (this.state.isShowing) return;

    this.state.isShowing = true;

    // Inject styles
    this.injectStyles();

    // Get all roles
    const roles = window.MuseumSampleData 
      ? window.MuseumSampleData.getAllRoles() 
      : this.getDefaultRoles();

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'museum-welcome-modal';
    modal.className = 'museum-welcome-modal';
    modal.innerHTML = `
      <div class="welcome-backdrop"></div>
      <div class="welcome-card">
        <!-- Header -->
        <div class="welcome-header">
          <div class="welcome-icon">🎨</div>
          <h1>MuseFlow에 오신 것을 환영합니다!</h1>
          <p>당신의 주요 업무 분야를 선택하시면<br>실무에 맞는 샘플 프로젝트를 자동으로 생성해드립니다</p>
        </div>

        <!-- Role Selection -->
        <div class="welcome-roles">
          ${roles.map(role => `
            <button 
              class="role-card" 
              data-role="${role.id}"
              onclick="MuseumWelcome.selectRole('${role.id}')"
            >
              <div class="role-icon">${role.icon}</div>
              <div class="role-content">
                <h3>${role.title}</h3>
                <p>${role.description}</p>
              </div>
            </button>
          `).join('')}
        </div>

        <!-- Actions -->
        <div class="welcome-actions">
          <button 
            class="btn-secondary" 
            onclick="MuseumWelcome.skipWithEmptyCanvas()"
          >
            <i data-lucide="x" style="width: 16px; height: 16px;"></i>
            빈 캔버스로 시작하기
          </button>
        </div>

        <!-- Footer Note -->
        <div class="welcome-footer">
          <p>💡 <strong>팁:</strong> 샘플 데이터는 실제 업무를 시뮬레이션한 것으로, 언제든 수정하거나 삭제할 수 있습니다</p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // Animate in
    setTimeout(() => {
      modal.classList.add('visible');
    }, 100);

    console.log('[MuseumWelcome] Welcome modal shown');
  },

  /**
   * 역할 선택
   * @param {string} roleId - 선택한 역할 ID
   */
  selectRole(roleId) {
    console.log('[MuseumWelcome] Role selected:', roleId);

    this.state.selectedRole = roleId;

    // 역할 카드 선택 표시
    document.querySelectorAll('.role-card').forEach(card => {
      if (card.dataset.role === roleId) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    // 확인 버튼 표시
    this.showConfirmButton(roleId);
  },

  /**
   * 확인 버튼 표시
   * @param {string} roleId - 선택한 역할 ID
   */
  showConfirmButton(roleId) {
    // 기존 버튼 제거
    const existingBtn = document.querySelector('.welcome-confirm-btn');
    if (existingBtn) existingBtn.remove();

    const actionsDiv = document.querySelector('.welcome-actions');
    if (!actionsDiv) return;

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn-primary welcome-confirm-btn';
    confirmBtn.innerHTML = `
      <i data-lucide="check" style="width: 16px; height: 16px;"></i>
      샘플 데이터로 시작하기
    `;
    confirmBtn.onclick = () => this.startWithSampleData(roleId);

    // 맨 앞에 추가
    actionsDiv.insertBefore(confirmBtn, actionsDiv.firstChild);

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // Animate
    setTimeout(() => {
      confirmBtn.style.opacity = '1';
      confirmBtn.style.transform = 'translateY(0)';
    }, 50);
  },

  /**
   * 샘플 데이터로 시작
   * @param {string} roleId - 선택한 역할 ID
   */
  async startWithSampleData(roleId) {
    console.log('[MuseumWelcome] Starting with sample data:', roleId);

    // 로딩 표시
    this.showLoading();

    try {
      // 1. 샘플 데이터 생성
      if (window.MuseumSampleData) {
        const success = window.MuseumSampleData.saveSampleDataToStorage(roleId);
        
        if (!success) {
          throw new Error('Failed to generate sample data');
        }
      } else {
        console.warn('[MuseumWelcome] MuseumSampleData not available');
      }

      // 2. 선택한 역할 저장
      localStorage.setItem(this.STORAGE_KEYS.selectedRole, roleId);
      localStorage.setItem(this.STORAGE_KEYS.welcomed, 'true');

      // 3. Welcome Modal 닫기
      await this.closeModal();

      // 4. 페이지 새로고침 (샘플 데이터 로드)
      setTimeout(() => {
        window.location.reload();
      }, 500);

      // 5. 튜토리얼 시작 (새로고침 후 자동 실행됨)
      // Tutorial은 페이지 로드 후 자동으로 시작됨

    } catch (error) {
      console.error('[MuseumWelcome] Error starting with sample data:', error);
      this.showError('샘플 데이터 생성 중 오류가 발생했습니다');
    }
  },

  /**
   * 빈 캔버스로 시작
   */
  skipWithEmptyCanvas() {
    console.log('[MuseumWelcome] Starting with empty canvas');

    // 환영 완료 플래그 저장
    localStorage.setItem(this.STORAGE_KEYS.welcomed, 'true');
    localStorage.setItem(this.STORAGE_KEYS.selectedRole, 'none');

    // Modal 닫기
    this.closeModal();

    // Success toast
    if (typeof showToast === 'function') {
      showToast('🎨 빈 캔버스로 시작합니다', 'success');
    }
  },

  /**
   * 로딩 표시
   */
  showLoading() {
    const modal = document.getElementById('museum-welcome-modal');
    if (!modal) return;

    const card = modal.querySelector('.welcome-card');
    if (!card) return;

    // 로딩 오버레이 추가
    const loading = document.createElement('div');
    loading.className = 'welcome-loading';
    loading.innerHTML = `
      <div class="loading-spinner"></div>
      <p>샘플 데이터를 생성하고 있습니다...</p>
    `;

    card.appendChild(loading);

    setTimeout(() => {
      loading.classList.add('visible');
    }, 50);
  },

  /**
   * 에러 표시
   * @param {string} message - 에러 메시지
   */
  showError(message) {
    if (typeof showToast === 'function') {
      showToast(`❌ ${message}`, 'error');
    } else {
      alert(message);
    }

    // 로딩 제거
    const loading = document.querySelector('.welcome-loading');
    if (loading) loading.remove();
  },

  /**
   * Modal 닫기
   * @returns {Promise}
   */
  closeModal() {
    return new Promise((resolve) => {
      const modal = document.getElementById('museum-welcome-modal');
      if (!modal) {
        resolve();
        return;
      }

      modal.classList.remove('visible');

      setTimeout(() => {
        modal.remove();
        this.state.isShowing = false;
        resolve();
      }, 300);
    });
  },

  /**
   * 기본 역할 목록 (MuseumSampleData 없을 때)
   * @returns {Array}
   */
  getDefaultRoles() {
    return [
      {
        id: 'exhibition',
        icon: '🎨',
        title: '전시 기획',
        description: '전시 기획부터 개막까지 전 과정을 관리합니다'
      },
      {
        id: 'education',
        icon: '👨‍🏫',
        title: '교육 프로그램',
        description: '관람객 대상 교육 프로그램을 기획하고 운영합니다'
      },
      {
        id: 'collection',
        icon: '🏛️',
        title: '소장품 수집',
        description: '새로운 소장품을 조사하고 수집합니다'
      },
      {
        id: 'conservation',
        icon: '🔬',
        title: '보존 처리',
        description: '소장품의 보존 상태를 관리하고 복원합니다'
      },
      {
        id: 'publishing',
        icon: '📚',
        title: '학술 출판',
        description: '학술지, 도록 등 출판물을 기획하고 제작합니다'
      },
      {
        id: 'research',
        icon: '🔍',
        title: '연구',
        description: '미술사, 작품 연구를 수행합니다'
      },
      {
        id: 'administration',
        icon: '⚙️',
        title: '행정 관리',
        description: '예산, 인사, 시설 등 행정 업무를 담당합니다'
      }
    ];
  },

  /**
   * CSS 스타일 주입
   */
  injectStyles() {
    if (document.getElementById('museum-welcome-styles')) return;

    const style = document.createElement('style');
    style.id = 'museum-welcome-styles';
    style.textContent = `
      /* Welcome Modal */
      .museum-welcome-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 999999;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .museum-welcome-modal.visible {
        opacity: 1;
      }

      .welcome-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
      }

      .welcome-card {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 900px;
        max-height: 90vh;
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        overflow-y: auto;
        animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translate(-50%, -45%);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%);
        }
      }

      /* Header */
      .welcome-header {
        padding: 40px 40px 32px;
        text-align: center;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
      }

      .welcome-icon {
        font-size: 64px;
        margin-bottom: 16px;
        animation: bounce 1.5s infinite;
      }

      @keyframes bounce {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      .welcome-header h1 {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 12px 0;
      }

      .welcome-header p {
        font-size: 15px;
        opacity: 0.95;
        line-height: 1.6;
        margin: 0;
      }

      /* Role Selection */
      .welcome-roles {
        padding: 32px 40px;
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .role-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: #f9fafb;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
      }

      .role-card:hover {
        background: #f3f4f6;
        border-color: #4f46e5;
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
      }

      .role-card.selected {
        background: #eef2ff;
        border-color: #4f46e5;
        box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3);
      }

      .role-icon {
        font-size: 40px;
        flex-shrink: 0;
      }

      .role-content {
        flex: 1;
      }

      .role-content h3 {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
        margin: 0 0 4px 0;
      }

      .role-content p {
        font-size: 13px;
        color: #6b7280;
        margin: 0;
        line-height: 1.5;
      }

      /* Actions */
      .welcome-actions {
        padding: 0 40px 32px;
        display: flex;
        gap: 12px;
        justify-content: center;
      }

      .welcome-confirm-btn {
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
      }

      /* Footer */
      .welcome-footer {
        padding: 20px 40px 32px;
        text-align: center;
      }

      .welcome-footer p {
        font-size: 13px;
        color: #6b7280;
        margin: 0;
        padding: 12px;
        background: #fef3c7;
        border-left: 3px solid #f59e0b;
        border-radius: 6px;
      }

      /* Loading */
      .welcome-loading {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.95);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        border-radius: 16px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .welcome-loading.visible {
        opacity: 1;
      }

      .loading-spinner {
        width: 48px;
        height: 48px;
        border: 4px solid #e5e7eb;
        border-top-color: #4f46e5;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .welcome-loading p {
        font-size: 15px;
        color: #6b7280;
        margin: 0;
      }

      /* Buttons */
      .btn-primary, .btn-secondary {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .btn-primary {
        background: #4f46e5;
        color: white;
      }

      .btn-primary:hover {
        background: #4338ca;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
      }

      .btn-secondary {
        background: #f3f4f6;
        color: #6b7280;
      }

      .btn-secondary:hover {
        background: #e5e7eb;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .welcome-card {
          width: 95%;
          max-width: none;
        }

        .welcome-header {
          padding: 32px 24px 24px;
        }

        .welcome-header h1 {
          font-size: 24px;
        }

        .welcome-roles {
          padding: 24px;
        }

        .role-card {
          padding: 16px;
        }

        .role-icon {
          font-size: 32px;
        }

        .welcome-actions {
          padding: 0 24px 24px;
          flex-direction: column;
        }

        .btn-primary, .btn-secondary {
          width: 100%;
          justify-content: center;
        }
      }
    `;

    document.head.appendChild(style);
  },

  /**
   * 샘플 데이터 초기화 (테스트용)
   */
  reset() {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    if (window.MuseumSampleData) {
      window.MuseumSampleData.resetSampleData();
    }

    console.log('✅ MuseumWelcome reset. Reload page to see welcome modal again.');
  }
};

// Global export
window.MuseumWelcome = MuseumWelcome;

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.MuseumWelcome.init();
  });
} else {
  window.MuseumWelcome.init();
}

console.log('✅ MuseumWelcome V26.0 loaded');
