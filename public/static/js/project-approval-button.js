/**
 * Project Approval Request Button
 * 프로젝트 카드에 승인 요청 버튼 추가
 */

(function() {
  'use strict';

  const API_BASE = window.location.origin;

  // ============================================================
  // 프로젝트 카드에 승인 요청 버튼 추가
  // ============================================================
  function addApprovalButtonsToProjects() {
    // 모든 프로젝트 카드 찾기
    const projectCards = document.querySelectorAll('[data-project-id]');
    
    projectCards.forEach(card => {
      const projectId = card.getAttribute('data-project-id');
      const approvalStatus = card.getAttribute('data-approval-status') || 'draft';
      
      // 이미 버튼이 있으면 스킵
      if (card.querySelector('.approval-request-btn')) {
        return;
      }
      
      // 버튼 컨테이너 찾기 또는 생성
      let actionContainer = card.querySelector('.project-actions') || 
                           card.querySelector('.card-footer') ||
                           card.querySelector('.project-card-footer');
      
      if (!actionContainer) {
        // 액션 컨테이너가 없으면 카드 하단에 생성
        actionContainer = document.createElement('div');
        actionContainer.className = 'project-actions';
        actionContainer.style.cssText = `
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        `;
        card.appendChild(actionContainer);
      }
      
      // 승인 상태에 따라 버튼 생성
      let buttonHTML = '';
      
      if (approvalStatus === 'draft') {
        // 승인 요청 버튼
        buttonHTML = `
          <button 
            onclick="requestProjectApproval(${projectId})" 
            class="approval-request-btn"
            style="
              background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              font-size: 0.875rem;
              transition: all 0.2s;
              box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
            "
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(245, 158, 11, 0.4)'"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(245, 158, 11, 0.3)'">
            <i class="fas fa-paper-plane"></i> 승인 요청
          </button>
        `;
      } else if (approvalStatus === 'pending_approval') {
        // 승인 대기 중 뱃지
        buttonHTML = `
          <div class="approval-badge" style="
            background: #FEF3C7;
            color: #92400E;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.875rem;
            border: 1px solid #F59E0B;
          ">
            <i class="fas fa-clock"></i> 승인 대기 중
          </div>
        `;
      } else if (approvalStatus === 'approved') {
        // 승인 완료 뱃지
        buttonHTML = `
          <div class="approval-badge" style="
            background: #D1FAE5;
            color: #065F46;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.875rem;
            border: 1px solid #10B981;
          ">
            <i class="fas fa-check-circle"></i> 승인 완료
          </div>
        `;
      } else if (approvalStatus === 'rejected') {
        // 반려됨 뱃지 + 재요청 버튼
        buttonHTML = `
          <div class="approval-badge" style="
            background: #FEE2E2;
            color: #991B1B;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.875rem;
            border: 1px solid #EF4444;
            margin-right: 0.5rem;
          ">
            <i class="fas fa-times-circle"></i> 반려됨
          </div>
          <button 
            onclick="requestProjectApproval(${projectId})" 
            class="approval-request-btn"
            style="
              background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              font-size: 0.875rem;
              transition: all 0.2s;
            ">
            <i class="fas fa-redo"></i> 재요청
          </button>
        `;
      }
      
      actionContainer.insertAdjacentHTML('beforeend', buttonHTML);
    });
  }

  // ============================================================
  // 승인 요청 (전역 함수)
  // ============================================================
  window.requestProjectApproval = async function(projectId) {
    const comment = prompt('승인 요청 메시지를 입력하세요 (선택):');
    
    try {
      const authToken = localStorage.getItem('authToken') || 
                       localStorage.getItem('auth_token') || 
                       localStorage.getItem('user_session');
      
      const response = await fetch(`${API_BASE}/api/approvals/projects/${projectId}/request-approval`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: comment || '승인 요청' })
      });

      if (response.ok) {
        alert('✅ 승인 요청이 완료되었습니다');
        
        // 페이지 새로고침 또는 카드 상태 업데이트
        location.reload();
      } else {
        const error = await response.json();
        alert('❌ 승인 요청 실패: ' + error.error);
      }
    } catch (error) {
      console.error('승인 요청 실패:', error);
      alert('승인 요청 중 오류가 발생했습니다');
    }
  };

  // ============================================================
  // DOM 변경 감지 및 버튼 자동 추가
  // ============================================================
  function observeProjectCards() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          addApprovalButtonsToProjects();
        }
      });
    });

    // 대시보드 그리드 관찰
    const dashboardGrid = document.querySelector('.dashboard-grid') ||
                         document.querySelector('.projects-container') ||
                         document.body;
    
    observer.observe(dashboardGrid, {
      childList: true,
      subtree: true
    });
  }

  // ============================================================
  // 초기화
  // ============================================================
  function init() {
    console.log('🔧 Project Approval Button 초기화...');
    
    // 초기 버튼 추가
    setTimeout(() => {
      addApprovalButtonsToProjects();
    }, 1000); // 프로젝트 로드 대기
    
    // DOM 변경 감지
    observeProjectCards();
  }

  // ============================================================
  // 페이지 로드 시 초기화
  // ============================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
