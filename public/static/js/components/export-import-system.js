/**
 * MuseFlow Export/Import System
 * Version: 8.1.0
 * 
 * 기능:
 * - JSON Export/Import (전체 프로젝트 데이터)
 * - CSV Export (프로젝트 목록)
 * - Excel Export (상세 리포트)
 * - 선택적 데이터 내보내기
 * - 백업/복원
 */

class ExportImportSystem {
    constructor() {
        this.apiClient = window.apiClient;
        this.version = '8.1.0';
    }

    /**
     * JSON Export - 전체 프로젝트 데이터
     * @param {Array} projects - 내보낼 프로젝트 배열
     * @param {Object} options - 내보내기 옵션
     */
    async exportJSON(projects, options = {}) {
        try {
            const {
                includeTasks = true,
                includeBudget = true,
                includeMetadata = true,
                includeTimestamps = true
            } = options;

            // 데이터 구조화
            const exportData = {
                version: this.version,
                exportedAt: new Date().toISOString(),
                exportedBy: localStorage.getItem('user_email') || 'unknown',
                projectCount: projects.length,
                projects: projects.map(project => {
                    const projectData = {
                        id: project.id,
                        title: project.title,
                        description: project.description,
                        type: project.type,
                        phase: project.phase,
                        startDate: project.start_date,
                        endDate: project.end_date
                    };

                    if (includeTasks && project.tasks) {
                        projectData.tasks = project.tasks;
                    }

                    if (includeBudget && project.budget) {
                        projectData.budget = project.budget;
                    }

                    if (includeMetadata && project.metadata) {
                        projectData.metadata = project.metadata;
                    }

                    if (!includeTimestamps) {
                        delete projectData.created_at;
                        delete projectData.updated_at;
                    }

                    return projectData;
                })
            };

            // JSON 파일 생성 및 다운로드
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const filename = `museflow_projects_${this.getDateString()}.json`;
            this.downloadFile(blob, filename);

            // 알림 표시
            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `✅ ${projects.length}개 프로젝트를 JSON으로 내보냈습니다!`,
                    'success'
                );
            }

            return { success: true, filename, projectCount: projects.length };
        } catch (error) {
            console.error('JSON Export Error:', error);
            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `❌ JSON 내보내기 실패: ${error.message}`,
                    'error'
                );
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * JSON Import - 프로젝트 데이터 가져오기
     * @param {File} file - 가져올 JSON 파일
     * @param {Object} options - 가져오기 옵션
     */
    async importJSON(file, options = {}) {
        try {
            const {
                overwrite = false,
                mergeMode = 'skip' // 'skip', 'replace', 'merge'
            } = options;

            // 파일 읽기
            const fileContent = await this.readFile(file);
            const importData = JSON.parse(fileContent);

            // 버전 체크
            if (!importData.version || !importData.projects) {
                throw new Error('유효하지 않은 MuseFlow JSON 파일입니다.');
            }

            // 기존 프로젝트 ID 목록 가져오기
            const existingProjects = await this.apiClient.projects.list();
            const existingIds = new Set(existingProjects.map(p => p.id));

            let imported = 0;
            let skipped = 0;
            let errors = 0;

            // 프로젝트 가져오기
            for (const project of importData.projects) {
                try {
                    const exists = existingIds.has(project.id);

                    if (exists && mergeMode === 'skip') {
                        skipped++;
                        continue;
                    }

                    if (exists && mergeMode === 'replace') {
                        // 기존 프로젝트 삭제 후 재생성
                        await this.apiClient.projects.delete(project.id);
                    }

                    if (exists && mergeMode === 'merge') {
                        // 기존 프로젝트 업데이트
                        await this.apiClient.projects.update(project.id, project);
                        imported++;
                    } else {
                        // 새 프로젝트 생성 (ID 제거하여 자동 생성되도록)
                        const newProject = { ...project };
                        if (!overwrite) {
                            delete newProject.id;
                        }
                        await this.apiClient.projects.create(newProject);
                        imported++;
                    }
                } catch (err) {
                    console.error('Project Import Error:', err);
                    errors++;
                }
            }

            // 결과 알림
            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `✅ 가져오기 완료: ${imported}개 성공, ${skipped}개 건너뜀, ${errors}개 실패`,
                    errors > 0 ? 'warning' : 'success'
                );
            }

            // 페이지 새로고침 (프로젝트 목록 갱신)
            if (imported > 0 && typeof loadProjects === 'function') {
                await loadProjects();
            }

            return { 
                success: true, 
                imported, 
                skipped, 
                errors,
                total: importData.projects.length 
            };
        } catch (error) {
            console.error('JSON Import Error:', error);
            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `❌ JSON 가져오기 실패: ${error.message}`,
                    'error'
                );
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * CSV Export - 프로젝트 목록
     * @param {Array} projects - 내보낼 프로젝트 배열
     */
    async exportCSV(projects) {
        try {
            // CSV 헤더
            const headers = [
                'ID',
                'Title',
                'Type',
                'Phase',
                'Start Date',
                'End Date',
                'Duration (Days)',
                'Status',
                'Description'
            ];

            // CSV 데이터 행
            const rows = projects.map(project => {
                const startDate = project.start_date ? new Date(project.start_date) : null;
                const endDate = project.end_date ? new Date(project.end_date) : null;
                const duration = startDate && endDate 
                    ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
                    : '-';

                return [
                    project.id || '',
                    project.title || '',
                    project.type || '',
                    project.phase || '',
                    startDate ? startDate.toLocaleDateString('ko-KR') : '',
                    endDate ? endDate.toLocaleDateString('ko-KR') : '',
                    duration,
                    this.getProjectStatus(project),
                    (project.description || '').replace(/"/g, '""') // CSV escape
                ];
            });

            // CSV 문자열 생성
            const csvContent = [
                headers.map(h => `"${h}"`).join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            // BOM 추가 (Excel 한글 깨짐 방지)
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { 
                type: 'text/csv;charset=utf-8;' 
            });

            const filename = `museflow_projects_${this.getDateString()}.csv`;
            this.downloadFile(blob, filename);

            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `✅ ${projects.length}개 프로젝트를 CSV로 내보냈습니다!`,
                    'success'
                );
            }

            return { success: true, filename, projectCount: projects.length };
        } catch (error) {
            console.error('CSV Export Error:', error);
            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `❌ CSV 내보내기 실패: ${error.message}`,
                    'error'
                );
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * Excel Export - 상세 리포트 (향후 구현)
     * @param {Array} projects - 내보낼 프로젝트 배열
     */
    async exportExcel(projects) {
        // Excel 라이브러리 (SheetJS) 필요
        console.warn('Excel Export는 Phase 2에서 구현됩니다.');
        
        if (window.showInAppNotification) {
            window.showInAppNotification(
                '📋 Excel 내보내기는 곧 추가될 예정입니다!',
                'info'
            );
        }

        return { success: false, message: 'Not implemented yet' };
    }

    /**
     * 파일 읽기 (Promise)
     * @param {File} file - 읽을 파일
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('파일 읽기 실패'));
            reader.readAsText(file);
        });
    }

    /**
     * 파일 다운로드
     * @param {Blob} blob - 다운로드할 Blob
     * @param {String} filename - 파일명
     */
    downloadFile(blob, filename) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    /**
     * 날짜 문자열 생성 (YYYY-MM-DD)
     */
    getDateString() {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * 프로젝트 상태 판단
     * @param {Object} project - 프로젝트 객체
     */
    getProjectStatus(project) {
        if (!project.end_date) return '진행 중';
        
        const endDate = new Date(project.end_date);
        const today = new Date();
        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) return '완료';
        if (daysLeft === 0) return '마감일';
        if (daysLeft <= 7) return `마감 임박 (D-${daysLeft})`;
        return '진행 중';
    }

    /**
     * 파일 선택 다이얼로그 표시 (Import용)
     * @param {String} accept - 허용할 파일 타입
     */
    selectFile(accept = '.json') {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    resolve(file);
                } else {
                    reject(new Error('파일이 선택되지 않았습니다.'));
                }
            };
            input.click();
        });
    }
}

// 전역 인스턴스 생성
window.exportImportSystem = new ExportImportSystem();

console.log('✅ Export/Import System V8.1.0 initialized');
