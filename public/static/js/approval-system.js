/**
 * Approval System UI
 * 승인 시스템 - 관장/학예실장 결재 권한
 */

(function() {
  'use strict';

  const API_BASE = window.location.origin;
  let currentUser = null;
  let isApprover = false;

  // ============================================================
  // 초기화
  // ============================================================
  async function init() {
    console.log('🔧 Approval System 초기화...');
    
    // 사용자 정보 가져오기
    await loadCurrentUser();
    
    // 결재권자면 승인 대기 섹션 표시
    if (isApprover) {
      await loadApprovalSection();
    }
    
    // 일반 사용자면 내 승인 요청 현황 표시
    else {
      await loadMyRequestsSection();
    }
  }

  // ============================================================
  // 현재 사용자 정보 로드
  // ============================================================
  async function loadCurrentUser() {
    try {
      const authToken = window.AuthUtils ? window.AuthUtils.getAuthToken() : null;
      if (!authToken) {
        console.log('⚠️ 로그인 필요');
        return;
      }

      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
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
  // 결재권자용 승인 대기 섹션
  // ============================================================
  async function loadApprovalSection() {
    console.log('📋 승인 대기 목록 로드 (결재권자)');

    try {
      const authToken = window.AuthUtils ? window.AuthUtils.getAuthToken() : null;
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

    } catch (error) {
      console.error('❌ 승인 대기 목록 로드 실패:', error);
    }
  }

  function renderApprovalSection(pendingList) {
    // Hero Card 다음에 승인 섹션 추가
    const dashboardGrid = document.querySelector('.dashboard-grid');
    if (!dashboardGrid) return;

    // 기존 승인 섹션 제거
    const existingSection = document.getElementById('approval-section');
    if (existingSection) {
      existingSection.remove();
    }

    // 승인 대기가 없으면 섹션 표시 안 함
    if (pendingList.length === 0) {
      return;
    }

    const sectionHTML = `
      <div id="approval-section" class="card" style="grid-column: span 12; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 2px solid #F59E0B;">
        <div class="card-header" style="border-bottom: 1px solid #F59E0B; padding-bottom: 1rem;">
          <h3 class="card-title" style="color: #92400E; font-size: 1.25rem;">
            <i class="fas fa-clipboard-check"></i> 승인 대기 (${pendingList.length}건)
          </h3>
        </div>
        
        <div id="pending-list" style="margin-top: 1rem;">
          ${pendingList.map(project => `
            <div class="approval-item" style="background: white; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; border: 1px solid #E5E7EB;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                <div style="flex: 1;">
                  <h4 style="font-size: 1rem; font-weight: 600; color: #111827; margin-bottom: 0.25rem;">
                    ${project.title || '제목 없음'}
                  </h4>
                  <p style="font-size: 0.875rem; color: #6B7280;">
                    <i class="fas fa-user"></i> ${project.owner_name || '알 수 없음'} (${project.owner_position || ''})
                  </p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  <button onclick="approveProject(${project.id})" 
                    class="btn-approve" 
                    style="background: #10B981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.875rem;">
                    <i class="fas fa-check"></i> 승인
                  </button>
                  <button onclick="rejectProject(${project.id})" 
                    class="btn-reject" 
                    style="background: #EF4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.875rem;">
                    <i class="fas fa-times"></i> 반려
                  </button>
                </div>
              </div>
              
              ${project.description ? `
                <p style="font-size: 0.875rem; color: #4B5563; margin-top: 0.5rem; padding: 0.75rem; background: #F9FAFB; border-radius: 6px;">
                  ${project.description}
                </p>
              ` : ''}
              
              <div style="margin-top: 0.75rem; font-size: 0.75rem; color: #9CA3AF;">
                <i class="fas fa-clock"></i> 요청 시각: ${new Date(project.updated_at).toLocaleString('ko-KR')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
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
      const authToken = window.AuthUtils ? window.AuthUtils.getAuthToken() : null;
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
        <div class="card-header">
          <h3 class="card-title">
            <i class="fas fa-paper-plane"></i> 내 승인 요청 현황 (${myRequests.length}건)
          </h3>
        </div>
        
        <div style="margin-top: 1rem;">
          ${myRequests.map(project => {
            const statusConfig = {
              'pending_approval': { color: '#F59E0B', icon: 'clock', text: '승인 대기 중' },
              'approved': { color: '#10B981', icon: 'check-circle', text: '승인 완료' },
              'rejected': { color: '#EF4444', icon: 'times-circle', text: '반려됨' }
            };
            const status = statusConfig[project.approval_status] || statusConfig['pending_approval'];

            return `
              <div class="request-item" style="background: #F9FAFB; border-radius: 12px; padding: 1rem; margin-bottom: 0.75rem; border-left: 4px solid ${status.color};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="flex: 1;">
                    <h4 style="font-size: 0.875rem; font-weight: 600; color: #111827;">
                      ${project.title || '제목 없음'}
                    </h4>
                    <p style="font-size: 0.75rem; color: #6B7280; margin-top: 0.25rem;">
                      ${new Date(project.updated_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div style="background: ${status.color}; color: white; padding: 0.375rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">
                    <i class="fas fa-${status.icon}"></i> ${status.text}
                  </div>
                </div>
                
                ${project.approval_comment ? `
                  <p style="font-size: 0.75rem; color: #6B7280; margin-top: 0.5rem; padding: 0.5rem; background: white; border-radius: 6px;">
                    💬 ${project.approval_comment}
                  </p>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
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
  // 승인 처리 (전역 함수)
  // ============================================================
  window.approveProject = async function(projectId) {
    const comment = prompt('승인 코멘트를 입력하세요 (선택):');
    
    try {
      const authToken = window.AuthUtils ? window.AuthUtils.getAuthToken() : null;
      const response = await fetch(`${API_BASE}/api/approvals/projects/${projectId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: comment || '승인 완료' })
      });

      if (response.ok) {
        alert('✅ 승인되었습니다');
        await loadApprovalSection(); // 목록 새로고침
      } else {
        const error = await response.json();
        alert('❌ 승인 실패: ' + error.error);
      }
    } catch (error) {
      console.error('승인 처리 실패:', error);
      alert('승인 처리 중 오류가 발생했습니다');
    }
  };

  // ============================================================
  // 반려 처리 (전역 함수)
  // ============================================================
  window.rejectProject = async function(projectId) {
    const comment = prompt('반려 사유를 입력하세요:');
    if (!comment) {
      alert('반려 사유를 입력해주세요');
      return;
    }
    
    try {
      const authToken = window.AuthUtils ? window.AuthUtils.getAuthToken() : null;
      const response = await fetch(`${API_BASE}/api/approvals/projects/${projectId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment })
      });

      if (response.ok) {
        alert('✅ 반려되었습니다');
        await loadApprovalSection(); // 목록 새로고침
      } else {
        const error = await response.json();
        alert('❌ 반려 실패: ' + error.error);
      }
    } catch (error) {
      console.error('반려 처리 실패:', error);
      alert('반려 처리 중 오류가 발생했습니다');
    }
  };

  // ============================================================
  // 페이지 로드 시 초기화
  // ============================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
