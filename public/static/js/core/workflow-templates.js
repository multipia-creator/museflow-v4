/**
 * Workflow Templates
 * Pre-defined workflow templates for quick start
 */

const WorkflowTemplates = {
  templates: [
    {
      id: 'exhibition-planning',
      name: '전시 기획 워크플로우',
      description: 'Gemini로 전시 기획안 작성 후 Google Docs에 저장하고 Calendar에 일정 등록',
      category: 'exhibition',
      icon: 'palette',
      nodes: [
        {
          id: 'node-1',
          type: 'input',
          category: 'data',
          label: '전시 주제 입력',
          description: '전시 주제와 컨셉을 입력하세요',
          x: 100,
          y: 200,
          width: 180,
          height: 80,
          config: {
            text: '2024년 봄 특별전: 조선시대 도자기의 아름다움'
          }
        },
        {
          id: 'node-2',
          type: 'gemini-generate',
          category: 'ai',
          label: 'AI 기획안 작성',
          description: 'Gemini로 전시 기획안 자동 생성',
          x: 350,
          y: 200,
          width: 180,
          height: 80,
          config: {
            prompt: '다음 주제로 뮤지엄 전시 기획안을 작성해주세요. 1) 전시 개요, 2) 주요 전시품, 3) 관람 포인트, 4) 교육 프로그램'
          }
        },
        {
          id: 'node-3',
          type: 'google-docs',
          category: 'workspace',
          label: 'Docs 저장',
          description: 'Google Docs에 기획안 저장',
          x: 600,
          y: 150,
          width: 180,
          height: 80,
          config: {
            title: '전시 기획안 - 조선시대 도자기'
          }
        },
        {
          id: 'node-4',
          type: 'calendar-event',
          category: 'workspace',
          label: 'Calendar 등록',
          description: '전시 오프닝 일정 등록',
          x: 600,
          y: 280,
          width: 180,
          height: 80,
          config: {
            title: '전시 오프닝',
            startTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        }
      ],
      connections: [
        { from: 'node-1', to: 'node-2' },
        { from: 'node-2', to: 'node-3' },
        { from: 'node-2', to: 'node-4' }
      ]
    },
    {
      id: 'education-program',
      name: '교육 프로그램 워크플로우',
      description: '교육 프로그램 기획, 이메일 초대장 작성, Gmail로 발송',
      category: 'education',
      icon: 'graduation-cap',
      nodes: [
        {
          id: 'node-1',
          type: 'input',
          category: 'data',
          label: '프로그램 정보',
          description: '교육 프로그램 주제 입력',
          x: 100,
          y: 200,
          width: 180,
          height: 80,
          config: {
            text: '어린이 도자기 체험 교실'
          }
        },
        {
          id: 'node-2',
          type: 'gemini-generate',
          category: 'ai',
          label: '프로그램 기획',
          description: 'AI로 프로그램 커리큘럼 작성',
          x: 350,
          y: 200,
          width: 180,
          height: 80,
          config: {
            prompt: '다음 주제로 뮤지엄 교육 프로그램을 기획해주세요. 1) 프로그램 목표, 2) 대상 연령, 3) 활동 내용, 4) 준비물'
          }
        },
        {
          id: 'node-3',
          type: 'gemini-generate',
          category: 'ai',
          label: '초대장 작성',
          description: 'AI로 이메일 초대장 작성',
          x: 600,
          y: 200,
          width: 180,
          height: 80,
          config: {
            prompt: '위 교육 프로그램 내용을 바탕으로 학부모님께 보낼 이메일 초대장을 작성해주세요'
          }
        },
        {
          id: 'node-4',
          type: 'gmail-draft',
          category: 'workspace',
          label: 'Gmail 초안',
          description: 'Gmail에 초안 저장',
          x: 850,
          y: 200,
          width: 180,
          height: 80,
          config: {
            to: 'parents@museum.kr',
            subject: '[뮤지엄] 어린이 도자기 체험 교실 안내'
          }
        }
      ],
      connections: [
        { from: 'node-1', to: 'node-2' },
        { from: 'node-2', to: 'node-3' },
        { from: 'node-3', to: 'node-4' }
      ]
    },
    {
      id: 'marketing-campaign',
      name: '마케팅 캠페인 워크플로우',
      description: 'AI로 마케팅 콘텐츠 생성, 다중 채널 동시 발송',
      category: 'marketing',
      icon: 'bullhorn',
      nodes: [
        {
          id: 'node-1',
          type: 'input',
          category: 'data',
          label: '캠페인 주제',
          description: '마케팅 캠페인 주제 입력',
          x: 100,
          y: 250,
          width: 180,
          height: 80,
          config: {
            text: '여름 특별전 홍보 캠페인'
          }
        },
        {
          id: 'node-2',
          type: 'gemini-generate',
          category: 'ai',
          label: '콘텐츠 생성',
          description: 'AI로 마케팅 콘텐츠 생성',
          x: 350,
          y: 250,
          width: 180,
          height: 80,
          config: {
            prompt: '다음 캠페인의 마케팅 콘텐츠를 작성해주세요. 1) SNS 홍보 문구, 2) 이메일 뉴스레터, 3) 포스터 카피'
          }
        },
        {
          id: 'node-3',
          type: 'text-split',
          category: 'data',
          label: '콘텐츠 분리',
          description: '각 채널별로 콘텐츠 분리',
          x: 600,
          y: 250,
          width: 180,
          height: 80,
          config: {}
        },
        {
          id: 'node-4',
          type: 'gmail-draft',
          category: 'workspace',
          label: '이메일 발송',
          description: 'Gmail로 뉴스레터 발송',
          x: 850,
          y: 150,
          width: 180,
          height: 80,
          config: {
            to: 'subscribers@museum.kr',
            subject: '[뮤지엄] 여름 특별전 안내'
          }
        },
        {
          id: 'node-5',
          type: 'google-docs',
          category: 'workspace',
          label: 'SNS 콘텐츠',
          description: 'SNS 게시물 Docs에 저장',
          x: 850,
          y: 280,
          width: 180,
          height: 80,
          config: {
            title: 'SNS 홍보 콘텐츠'
          }
        },
        {
          id: 'node-6',
          type: 'output',
          category: 'data',
          label: '최종 결과',
          description: '캠페인 실행 결과',
          x: 1100,
          y: 250,
          width: 180,
          height: 80,
          config: {}
        }
      ],
      connections: [
        { from: 'node-1', to: 'node-2' },
        { from: 'node-2', to: 'node-3' },
        { from: 'node-3', to: 'node-4' },
        { from: 'node-3', to: 'node-5' },
        { from: 'node-4', to: 'node-6' },
        { from: 'node-5', to: 'node-6' }
      ]
    }
  ],

  /**
   * Get all templates
   */
  getAllTemplates() {
    return this.templates;
  },

  /**
   * Get template by ID
   */
  getTemplate(templateId) {
    return this.templates.find(t => t.id === templateId);
  },

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category) {
    return this.templates.filter(t => t.category === category);
  },

  /**
   * Apply template to canvas
   */
  applyTemplate(templateId) {
    const template = this.getTemplate(templateId);
    if (!template) {
      console.error('Template not found:', templateId);
      return false;
    }

    if (!window.CanvasV3) {
      console.error('CanvasV3 not available');
      return false;
    }

    console.log('📋 Applying template:', template.name);

    // Clear existing nodes (ask for confirmation first)
    if (window.CanvasV3.nodes && window.CanvasV3.nodes.length > 0) {
      const confirmed = confirm(`현재 워크플로우를 삭제하고 "${template.name}" 템플릿을 적용하시겠습니까?`);
      if (!confirmed) return false;
    }

    // Clear canvas
    window.CanvasV3.nodes = [];
    window.CanvasV3.connections = [];

    // Add template nodes
    template.nodes.forEach(nodeData => {
      const node = {
        ...nodeData,
        id: nodeData.id || `node-${Date.now()}-${Math.random().toString(36).substring(7)}`
      };
      window.CanvasV3.nodes.push(node);
    });

    // Add template connections
    template.connections.forEach(connData => {
      const connection = { ...connData };
      window.CanvasV3.connections.push(connection);
    });

    // Trigger redraw
    if (window.CanvasEngine) {
      window.CanvasEngine.needsRedraw = true;
    }

    // Save to project
    if (window.CanvasV3.saveProjectData) {
      window.CanvasV3.saveProjectData();
    }

    console.log('✅ Template applied successfully');

    // Show success message
    if (window.Toast && window.Toast.success) {
      window.Toast.success(`템플릿 "${template.name}"이(가) 적용되었습니다`);
    } else {
      alert(`템플릿 "${template.name}"이(가) 적용되었습니다`);
    }

    return true;
  },

  /**
   * Show template selector modal
   */
  showTemplateSelector() {
    // Check if modal already exists
    let modal = document.getElementById('template-selector-modal');
    
    if (!modal) {
      // Create modal
      modal = this.createTemplateSelectorModal();
      document.body.appendChild(modal);
    }

    // Show modal
    modal.style.display = 'flex';

    // Populate templates
    this.populateTemplateList(modal);
  },

  /**
   * Create template selector modal
   */
  createTemplateSelectorModal() {
    const modal = document.createElement('div');
    modal.id = 'template-selector-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    `;

    modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 16px;
        padding: 32px;
        max-width: 800px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0;">
            <i class="fas fa-magic" style="color: #8b5cf6; margin-right: 12px;"></i>
            워크플로우 템플릿
          </h2>
          <button onclick="document.getElementById('template-selector-modal').style.display='none'" style="
            width: 36px;
            height: 36px;
            border: none;
            background: #f3f4f6;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: #6b7280;
          ">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <p style="color: #6b7280; margin-bottom: 24px; font-size: 15px;">
          사전 정의된 워크플로우 템플릿을 선택하여 빠르게 시작하세요
        </p>
        
        <div id="template-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">
          <!-- Templates will be inserted here -->
        </div>
      </div>
    `;

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    return modal;
  },

  /**
   * Populate template list
   */
  populateTemplateList(modal) {
    const container = modal.querySelector('#template-list');
    container.innerHTML = '';

    this.templates.forEach(template => {
      const card = document.createElement('div');
      card.style.cssText = `
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
        cursor: pointer;
        transition: all 200ms ease;
        background: white;
      `;

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <div style="
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
          ">
            <i class="fas fa-${template.icon}"></i>
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 16px; color: #1f2937;">${template.name}</div>
          </div>
        </div>
        <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.5;">
          ${template.description}
        </p>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #9ca3af;">
            ${template.nodes.length} nodes
          </span>
          <button style="
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
          ">
            적용하기
          </button>
        </div>
      `;

      // Hover effect
      card.addEventListener('mouseenter', () => {
        card.style.borderColor = '#8b5cf6';
        card.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.2)';
        card.style.transform = 'translateY(-2px)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.borderColor = '#e5e7eb';
        card.style.boxShadow = 'none';
        card.style.transform = 'translateY(0)';
      });

      // Apply template on click
      card.addEventListener('click', () => {
        this.applyTemplate(template.id);
        modal.style.display = 'none';
      });

      container.appendChild(card);
    });
  }
};

// Export globally
window.WorkflowTemplates = WorkflowTemplates;
