/**
 * Enhanced Approval System UI
 * 승인 시스템 - 향상된 UX 버전
 */

(function() {
  'use strict';

  const API_BASE = window.location.origin;
  let currentUser = null;
  let isApprover = false;
  let refreshInterval = null;

  // ============================================================
  // 초기화
  // ============================================================
  async function init() {
    console.log('🔧 Enhanced Approval System 초기화...');
    
    // 사용자 정보 가져오기
    await loadCurrentUser();
    
    // 결재권자면 승인 대기 섹션 표시
    if (isApprover) {
      await loadApprovalSection();
      
      // 30초마다 자동 새로고침
      refreshInterval = setInterval(async () => {
        await loadApprovalSection();
        console.log('🔄 승인 대기 목록 자동 새로고침');
      }, 30000);
    }
    
    // 일반 사용자면 내 승인 요청 현황 표시
    else {
      await loadMyRequestsSection();
      
      // 1분마다 자동 새로고침
      refreshInterval = setInterval(async () => {
        await loadMyRequestsSection();
        console.log('🔄 내 승인 요청 자동 새로고침');
      }, 60000);
    }

    // 네비게이션에 알림 뱃지 추가
    await updateNavBadge();
  }

  // ============================================================
  // 현재 사용자 정보 로드
  // ============================================================
  async function loadCurrentUser() {
    try {
      // auth-utils 사용
      if (!window.AuthUtils || !window.AuthUtils.isAuthenticated()) {
        console.log('⚠️ 로그인 필요');
        return;
      }

      const response = await window.AuthUtils.apiCall(`${API_BASE}/api/auth/me`, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        currentUser = data.user;
        isApprover = data.user.is_approver || false;
        console.log('👤 현재 사용자:', currentUser.name, '결재권자:', isApprover);
      }
    } catch (error) {
      console.error('❌ 사용자 정보 로드 실패:', error);
    }
  }

  // ============================================================
  // 네비게이션 알림 뱃지 업데이트
  // ============================================================
  async function updateNavBadge() {
    if (!currentUser) return;

    try {
      let count = 0;
      
      if (isApprover) {
        // 결재권자: 승인 대기 건수
        const response = await window.AuthUtils.apiCall(`${API_BASE}/api/approvals/pending`, {
          method: 'GET'
        });
        if (response.ok) {
          const data = await response.json();
          count = data.count || 0;
        }
      } else {
        // 일반 사용자: 승인 대기 중인 내 요청 건수
        const response = await fetch(`${API_BASE}/api/approvals/my-requests`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (response.ok) {
          const data = await response.json();
          count = (data.my_requests || []).filter(r => r.approval_status === 'pending_approval').length;
        }
      }

      // 대시보드 링크에 뱃지 추가
      const dashboardLinks = document.querySelectorAll('a[href*="dashboard"]');
      dashboardLinks.forEach(link => {
        // 기존 뱃지 제거
        const existingBadge = link.querySelector('.approval-badge-nav');
        if (existingBadge) {
          existingBadge.remove();
        }

        // 새 뱃지 추가 (건수가 있을 때만)
        if (count > 0) {
          const badge = document.createElement('span');
          badge.className = 'approval-badge-nav';
          badge.textContent = count;
          badge.style.cssText = `
            display: inline-block;
            background: #EF4444;
            color: white;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 0.125rem 0.375rem;
            border-radius: 10px;
            margin-left: 0.5rem;
            min-width: 20px;
            text-align: center;
          `;
          link.appendChild(badge);
        }
      });
    } catch (error) {
      console.error('알림 뱃지 업데이트 실패:', error);
    }
  }

  // ============================================================
  // 결재권자용 승인 대기 섹션
  // ============================================================
  async function loadApprovalSection() {
    console.log('📋 승인 대기 목록 로드 (결재권자)');

    try {
      const authToken = localStorage.getItem('authToken') || 
                       localStorage.getItem('auth_token') ||
                       localStorage.getItem('user_session');
      
      const response = await fetch(`${API_BASE}/api/approvals/pending`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        console.error('승인 대기 목록 조회 실패:', response.status);
        return;
      }

      const data = await response.json();
      renderApprovalSection(data.pending_approvals || []);
      await updateNavBadge(); // 뱃지 업데이트

    } catch (error) {
      console.error('❌ 승인 대기 목록 로드 실패:', error);
    }
  }

  function renderApprovalSection(pendingList) {
    const dashboardGrid = document.querySelector('.dashboard-grid');
    if (!dashboardGrid) return;

    // 기존 승인 섹션 제거
    const existingSection = document.getElementById('approval-section');
    if (existingSection) {
      existingSection.remove();
    }

    // 승인 대기가 없으면 안내 메시지 표시
    if (pendingList.length === 0) {
      const emptyHTML = `
        <div id="approval-section" class="card" style="grid-column: span 12; background: white; border: 1px solid #E5E7EB;">
          <div style="text-align: center; padding: 2rem; color: #9CA3AF;">
            <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
            <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; color: #6B7280;">
              승인 대기 중인 프로젝트가 없습니다
            </h3>
            <p style="font-size: 0.875rem;">
              새로운 승인 요청이 있으면 여기에 표시됩니다
            </p>
          </div>
        </div>
      `;
      
      const heroCard = dashboardGrid.querySelector('.hero-card');
      if (heroCard) {
        heroCard.insertAdjacentHTML('afterend', emptyHTML);
      } else {
        dashboardGrid.insertAdjacentHTML('afterbegin', emptyHTML);
      }
      return;
    }

    const sectionHTML = `
      <div id="approval-section" class="card" style="grid-column: span 12; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 2px solid #F59E0B; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);">
        <div class="card-header" style="border-bottom: 1px solid #F59E0B; padding-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
          <h3 class="card-title" style="color: #92400E; font-size: 1.25rem; margin: 0;">
            <i class="fas fa-clipboard-check"></i> 승인 대기 
            <span style="background: #F59E0B; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem; margin-left: 0.5rem;">
              ${pendingList.length}건
            </span>
          </h3>
          <button onclick="location.reload()" style="background: rgba(255,255,255,0.5); border: 1px solid #F59E0B; color: #92400E; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.8)'" onmouseout="this.style.background='rgba(255,255,255,0.5)'">
            <i class="fas fa-sync-alt"></i> 새로고침
          </button>
        </div>
        
        <div id="pending-list" style="margin-top: 1rem; max-height: 600px; overflow-y: auto;">
          ${pendingList.map((project, index) => `
            <div class="approval-item" style="background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; border: 1px solid #E5E7EB; box-shadow: 0 2px 4px rgba(0,0,0,0.05); animation: slideIn 0.3s ease ${index * 0.1}s both;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <span style="background: #F59E0B; color: white; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 4px;">
                      #${project.id}
                    </span>
                    <h4 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0;">
                      ${project.title || '제목 없음'}
                    </h4>
                  </div>
                  <p style="font-size: 0.875rem; color: #6B7280; margin-bottom: 0.5rem;">
                    <i class="fas fa-user"></i> ${project.owner_name || '알 수 없음'}
                  </p>
                  ${project.description ? `
                    <p style="font-size: 0.875rem; color: #4B5563; margin-top: 0.75rem; padding: 0.75rem; background: #F9FAFB; border-left: 3px solid #F59E0B; border-radius: 6px;">
                      ${project.description}
                    </p>
                  ` : ''}
                  <div style="margin-top: 0.75rem; font-size: 0.75rem; color: #9CA3AF; display: flex; gap: 1rem;">
                    <span><i class="fas fa-clock"></i> ${new Date(project.updated_at).toLocaleString('ko-KR')}</span>
                    ${project.budget_total ? `<span><i class="fas fa-won-sign"></i> ${(project.budget_total / 10000).toLocaleString()}만원</span>` : ''}
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem; min-width: 120px;">
                  <button onclick="approveProject(${project.id})" 
                    class="btn-approve" 
                    style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 0.875rem; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3); transition: all 0.2s;"
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(16, 185, 129, 0.4)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(16, 185, 129, 0.3)'">
                    <i class="fas fa-check"></i> 승인
                  </button>
                  <button onclick="rejectProject(${project.id})" 
                    class="btn-reject" 
                    style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 0.875rem; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3); transition: all 0.2s;"
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(239, 68, 68, 0.4)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(239, 68, 68, 0.3)'">
                    <i class="fas fa-times"></i> 반려
                  </button>
                  <button onclick="viewProjectDetails(${project.id})" 
                    style="background: #F3F4F6; color: #6B7280; border: 1px solid #E5E7EB; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.75rem; transition: all 0.2s;"
                    onmouseover="this.style.background='#E5E7EB'"
                    onmouseout="this.style.background='#F3F4F6'">
                    <i class="fas fa-info-circle"></i> 상세
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <style>
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      </style>
    `;

    // Hero Card 바로 다음에 삽입
    const heroCard = dashboardGrid.querySelector('.hero-card');
    if (heroCard) {
      heroCard.insertAdjacentHTML('afterend', sectionHTML);
    } else {
      dashboardGrid.insertAdjacentHTML('afterbegin', sectionHTML);
    }
  }

  // ============================================================
  // 일반 사용자용 내 승인 요청 현황
  // ============================================================
  async function loadMyRequestsSection() {
    console.log('📋 내 승인 요청 현황 로드');

    try {
      const authToken = localStorage.getItem('authToken') || 
                       localStorage.getItem('auth_token') ||
                       localStorage.getItem('user_session');
      
      const response = await fetch(`${API_BASE}/api/approvals/my-requests`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        console.error('내 승인 요청 조회 실패:', response.status);
        return;
      }

      const data = await response.json();
      renderMyRequestsSection(data.my_requests || []);
      await updateNavBadge(); // 뱃지 업데이트

    } catch (error) {
      console.error('❌ 내 승인 요청 로드 실패:', error);
    }
  }

  function renderMyRequestsSection(myRequests) {
    const dashboardGrid = document.querySelector('.dashboard-grid');
    if (!dashboardGrid) return;

    // 기존 섹션 제거
    const existingSection = document.getElementById('my-requests-section');
    if (existingSection) {
      existingSection.remove();
    }

    // 요청 내역이 없으면 표시 안 함
    if (myRequests.length === 0) {
      return;
    }

    const sectionHTML = `
      <div id="my-requests-section" class="card" style="grid-column: span 12;">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h3 class="card-title" style="margin: 0;">
            <i class="fas fa-paper-plane"></i> 내 승인 요청 현황 
            <span style="background: #6B7280; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem; margin-left: 0.5rem;">
              ${myRequests.length}건
            </span>
          </h3>
          <button onclick="location.reload()" style="background: #F3F4F6; border: 1px solid #E5E7EB; color: #6B7280; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.875rem; font-weight: 600;">
            <i class="fas fa-sync-alt"></i> 새로고침
          </button>
        </div>
        
        <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
          ${myRequests.map(project => {
            const statusConfig = {
              'pending_approval': { 
                color: '#F59E0B', 
                bgColor: '#FEF3C7',
                icon: 'clock', 
                text: '승인 대기 중',
                pulse: true
              },
              'approved': { 
                color: '#10B981',
                bgColor: '#D1FAE5',
                icon: 'check-circle', 
                text: '승인 완료',
                pulse: false
              },
              'rejected': { 
                color: '#EF4444',
                bgColor: '#FEE2E2',
                icon: 'times-circle', 
                text: '반려됨',
                pulse: false
              }
            };
            const status = statusConfig[project.approval_status] || statusConfig['pending_approval'];

            return `
              <div class="request-item" style="background: white; border-radius: 12px; padding: 1.25rem; border: 1px solid #E5E7EB; border-left: 4px solid ${status.color}; transition: all 0.2s; cursor: pointer;"
                   onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'; this.style.transform='translateY(-2px)'"
                   onmouseout="this.style.boxShadow='none'; this.style.transform='translateY(0)'"
                   onclick="viewProjectDetails(${project.id})">
                <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 0.75rem;">
                  <h4 style="font-size: 0.9375rem; font-weight: 700; color: #111827; flex: 1; margin: 0;">
                    ${project.title || '제목 없음'}
                  </h4>
                  <div style="background: ${status.bgColor}; color: ${status.color}; padding: 0.375rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; margin-left: 0.5rem; ${status.pulse ? 'animation: pulse 2s infinite;' : ''}">
                    <i class="fas fa-${status.icon}"></i> ${status.text}
                  </div>
                </div>
                
                <p style="font-size: 0.75rem; color: #6B7280; margin-bottom: 0.5rem;">
                  ${new Date(project.updated_at).toLocaleDateString('ko-KR')}
                </p>
                
                ${project.approval_comment ? `
                  <div style="margin-top: 0.75rem; padding: 0.75rem; background: #F9FAFB; border-radius: 6px; border-left: 3px solid ${status.color};">
                    <p style="font-size: 0.75rem; color: #6B7280; margin: 0;">
                      <i class="fas fa-comment" style="margin-right: 0.25rem;"></i>
                      ${project.approval_comment}
                    </p>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      </style>
    `;

    // Hero Card 바로 다음에 삽입
    const heroCard = dashboardGrid.querySelector('.hero-card');
    if (heroCard) {
      heroCard.insertAdjacentHTML('afterend', sectionHTML);
    } else {
      dashboardGrid.insertAdjacentHTML('afterbegin', sectionHTML);
    }
  }

  // ============================================================
  // 프로젝트 상세 보기 (전역 함수)
  // ============================================================
  window.viewProjectDetails = function(projectId) {
    // 프로젝트 상세 페이지로 이동 또는 모달 표시
    window.location.href = `/projects.html?id=${projectId}`;
  };

  // ============================================================
  // 승인 처리 (전역 함수)
  // ============================================================
  window.approveProject = async function(projectId) {
    const comment = prompt('✅ 승인 코멘트를 입력하세요 (선택):');
    
    // 취소 버튼을 누르면 null 반환
    if (comment === null) {
      return;
    }
    
    try {
      const authToken = localStorage.getItem('authToken') || 
                       localStorage.getItem('auth_token') ||
                       localStorage.getItem('user_session');
      
      const response = await fetch(`${API_BASE}/api/approvals/projects/${projectId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: comment || '승인 완료' })
      });

      if (response.ok) {
        // 성공 토스트 메시지
        showToast('✅ 승인되었습니다', 'success');
        
        // 승인 섹션 새로고침
        await loadApprovalSection();
      } else {
        const error = await response.json();
        showToast('❌ 승인 실패: ' + error.error, 'error');
      }
    } catch (error) {
      console.error('승인 처리 실패:', error);
      showToast('승인 처리 중 오류가 발생했습니다', 'error');
    }
  };

  // ============================================================
  // 반려 처리 (전역 함수)
  // ============================================================
  window.rejectProject = async function(projectId) {
    const comment = prompt('❌ 반려 사유를 입력하세요 (필수):');
    
    if (!comment || comment.trim() === '') {
      showToast('반려 사유를 입력해주세요', 'warning');
      return;
    }
    
    try {
      const authToken = localStorage.getItem('authToken') || 
                       localStorage.getItem('auth_token') ||
                       localStorage.getItem('user_session');
      
      const response = await fetch(`${API_BASE}/api/approvals/projects/${projectId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment })
      });

      if (response.ok) {
        // 성공 토스트 메시지
        showToast('❌ 반려되었습니다', 'warning');
        
        // 승인 섹션 새로고침
        await loadApprovalSection();
      } else {
        const error = await response.json();
        showToast('❌ 반려 실패: ' + error.error, 'error');
      }
    } catch (error) {
      console.error('반려 처리 실패:', error);
      showToast('반려 처리 중 오류가 발생했습니다', 'error');
    }
  };

  // ============================================================
  // 토스트 메시지 (전역 함수)
  // ============================================================
  window.showToast = function(message, type = 'info') {
    const colors = {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: ${colors[type]};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-weight: 600;
      font-size: 0.875rem;
      z-index: 10000;
      animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s;
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  // ============================================================
  // CSS 애니메이션
  // ============================================================
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // ============================================================
  // 페이지 언로드 시 정리
  // ============================================================
  window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });

  // ============================================================
  // 페이지 로드 시 초기화
  // ============================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
