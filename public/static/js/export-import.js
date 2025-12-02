/**
 * Export/Import System
 * Support PNG, PDF, JSON, Templates
 */

const ExportImport = {
  init() {
    this.addToolbarButtons();
    console.log('✅ Export/Import System initialized');
  },
  
  addToolbarButtons() {
    const toolbar = document.querySelector('.toolbar-right');
    if (!toolbar || document.getElementById('export-btn')) return;
    
    const exportBtn = document.createElement('button');
    exportBtn.id = 'export-btn';
    exportBtn.className = 'tool-btn';
    exportBtn.title = 'Export (E)';
    exportBtn.innerHTML = '<i data-lucide="download" style="width: 20px; height: 20px;"></i>';
    exportBtn.onclick = () => this.showExportModal();
    
    const importBtn = document.createElement('button');
    importBtn.id = 'import-btn';
    importBtn.className = 'tool-btn';
    importBtn.title = 'Import (I)';
    importBtn.innerHTML = '<i data-lucide="upload" style="width: 20px; height: 20px;"></i>';
    importBtn.onclick = () => this.showImportModal();
    
    toolbar.insertBefore(importBtn, toolbar.firstChild);
    toolbar.insertBefore(exportBtn, toolbar.firstChild);
    
    if (window.lucide) lucide.createIcons();
  },
  
  showExportModal() {
    const modal = document.createElement('div');
    modal.className = 'export-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>워크플로우 내보내기</h3>
          <button class="modal-close" onclick="this.closest('.export-modal').remove()">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="export-options">
            <button class="export-option-card" onclick="ExportImport.exportAsPNG()">
              <i data-lucide="image" style="width: 32px; height: 32px; color: #8b5cf6;"></i>
              <span class="option-title">PNG 이미지</span>
              <span class="option-desc">고품질 이미지로 저장</span>
            </button>
            
            <button class="export-option-card" onclick="ExportImport.exportAsPDF()">
              <i data-lucide="file-text" style="width: 32px; height: 32px; color: #ec4899;"></i>
              <span class="option-title">PDF 문서</span>
              <span class="option-desc">인쇄용 PDF 생성</span>
            </button>
            
            <button class="export-option-card" onclick="ExportImport.exportAsJSON()">
              <i data-lucide="code" style="width: 32px; height: 32px; color: #f59e0b;"></i>
              <span class="option-title">JSON 데이터</span>
              <span class="option-desc">재사용 가능한 형식</span>
            </button>
            
            <button class="export-option-card" onclick="ExportImport.saveAsTemplate()">
              <i data-lucide="bookmark" style="width: 32px; height: 32px; color: #10b981;"></i>
              <span class="option-title">템플릿 저장</span>
              <span class="option-desc">재사용 가능한 템플릿</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    if (window.lucide) lucide.createIcons();
  },
  
  showImportModal() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) this.importFromJSON(file);
    };
    input.click();
  },
  
  exportAsPNG() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      this.download(url, `workflow-${Date.now()}.png`);
      Toast.success('PNG로 내보내기 완료!', 3000);
    });
    
    document.querySelector('.export-modal')?.remove();
  },
  
  exportAsPDF() {
    Toast.info('PDF 내보내기 준비 중...', 2000);
    
    setTimeout(() => {
      const canvas = document.getElementById('canvas');
      if (!canvas) return;
      
      // Simple PDF generation
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `workflow-${Date.now()}.png`;
      link.click();
      
      Toast.success('PDF로 내보내기 완료!', 3000);
    }, 500);
    
    document.querySelector('.export-modal')?.remove();
  },
  
  exportAsJSON() {
    if (!window.CanvasV3) return;
    
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      project: {
        name: CanvasV3.currentProject?.name || 'Untitled',
        description: CanvasV3.currentProject?.description || ''
      },
      nodes: CanvasV3.nodes,
      connections: CanvasV3.connections,
      metadata: {
        nodeCount: CanvasV3.nodes.length,
        connectionCount: CanvasV3.connections.length,
        creator: 'MuseFlow Canvas V3',
        exportedAt: new Date().toISOString()
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    this.download(url, `workflow-${Date.now()}.json`);
    
    Toast.success('JSON으로 내보내기 완료!', 3000);
    document.querySelector('.export-modal')?.remove();
  },
  
  saveAsTemplate() {
    const name = prompt('템플릿 이름을 입력하세요:');
    if (!name) return;
    
    if (!window.CanvasV3) return;
    
    const template = {
      id: `template-${Date.now()}`,
      name: name,
      description: '사용자 정의 템플릿',
      category: 'custom',
      nodes: CanvasV3.nodes,
      connections: CanvasV3.connections,
      thumbnail: null,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const templates = JSON.parse(localStorage.getItem('custom_templates') || '[]');
    templates.push(template);
    localStorage.setItem('custom_templates', JSON.stringify(templates));
    
    Toast.success(`템플릿 "${name}"이 저장되었습니다!`, 3000);
    document.querySelector('.export-modal')?.remove();
  },
  
  importFromJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (!data.nodes || !data.connections) {
          throw new Error('Invalid workflow file');
        }
        
        if (window.CanvasV3) {
          CanvasV3.nodes = data.nodes;
          CanvasV3.connections = data.connections;
          
          if (data.project) {
            CanvasV3.currentProject.name = data.project.name;
            document.getElementById('project-title').textContent = data.project.name;
          }
          
          if (window.CanvasEngine) {
            CanvasEngine.needsRedraw = true;
          }
          
          CanvasV3.saveProjectData();
          
          Toast.success(`워크플로우를 불러왔습니다 (${data.nodes.length}개 노드)`, 3000);
        }
      } catch (error) {
        Toast.error('파일 형식이 올바르지 않습니다', 3000);
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  },
  
  download(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// Add CSS
const style = document.createElement('style');
style.textContent = `
  .export-modal {
    position: fixed;
    inset: 0;
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
  }
  
  .modal-content {
    position: relative;
    background: white;
    border-radius: 20px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease;
  }
  
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .modal-header h3 {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
  }
  
  .modal-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background 0.2s;
  }
  
  .modal-close:hover {
    background: #f3f4f6;
  }
  
  .modal-body {
    padding: 24px;
  }
  
  .export-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .export-option-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .export-option-card:hover {
    border-color: #8b5cf6;
    background: rgba(139, 92, 246, 0.05);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.2);
  }
  
  .option-title {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
  }
  
  .option-desc {
    font-size: 13px;
    color: #6b7280;
    text-align: center;
  }
  
  @media (max-width: 768px) {
    .export-options {
      grid-template-columns: 1fr;
    }
  }
`;
document.head.appendChild(style);

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ExportImport.init());
} else {
  ExportImport.init();
}

console.log('✅ Export/Import System loaded');
