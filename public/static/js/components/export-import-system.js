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
     * Excel Export - 상세 리포트 (.xlsx)
     * @param {Array} projects - 내보낼 프로젝트 배열
     * @param {Object} options - 내보내기 옵션
     */
    async exportExcel(projects, options = {}) {
        try {
            // SheetJS 체크
            if (typeof XLSX === 'undefined') {
                throw new Error('SheetJS 라이브러리가 로드되지 않았습니다.');
            }

            const {
                includeCharts = false,
                includeSummary = true,
                includeDetails = true
            } = options;

            // 워크북 생성
            const workbook = XLSX.utils.book_new();

            // 1. 요약 시트 (Summary Sheet)
            if (includeSummary) {
                const summaryData = this.generateSummarySheet(projects);
                const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
                
                // 열 너비 설정
                summarySheet['!cols'] = [
                    { wch: 20 }, // 항목
                    { wch: 15 }  // 값
                ];
                
                XLSX.utils.book_append_sheet(workbook, summarySheet, '요약');
            }

            // 2. 프로젝트 목록 시트 (Projects List)
            if (includeDetails) {
                const projectsData = this.generateProjectsSheet(projects);
                const projectsSheet = XLSX.utils.aoa_to_sheet(projectsData);
                
                // 열 너비 설정
                projectsSheet['!cols'] = [
                    { wch: 10 }, // ID
                    { wch: 30 }, // 제목
                    { wch: 12 }, // 유형
                    { wch: 12 }, // 단계
                    { wch: 12 }, // 시작일
                    { wch: 12 }, // 종료일
                    { wch: 10 }, // 기간
                    { wch: 15 }, // 상태
                    { wch: 50 }  // 설명
                ];
                
                XLSX.utils.book_append_sheet(workbook, projectsSheet, '프로젝트 목록');
            }

            // 3. 유형별 통계 시트 (Type Statistics)
            const typeStatsData = this.generateTypeStatsSheet(projects);
            const typeStatsSheet = XLSX.utils.aoa_to_sheet(typeStatsData);
            typeStatsSheet['!cols'] = [
                { wch: 15 }, // 유형
                { wch: 10 }, // 개수
                { wch: 10 }  // 비율
            ];
            XLSX.utils.book_append_sheet(workbook, typeStatsSheet, '유형별 통계');

            // 4. 단계별 통계 시트 (Phase Statistics)
            const phaseStatsData = this.generatePhaseStatsSheet(projects);
            const phaseStatsSheet = XLSX.utils.aoa_to_sheet(phaseStatsData);
            phaseStatsSheet['!cols'] = [
                { wch: 15 }, // 단계
                { wch: 10 }, // 개수
                { wch: 10 }  // 비율
            ];
            XLSX.utils.book_append_sheet(workbook, phaseStatsSheet, '단계별 통계');

            // Excel 파일 생성 및 다운로드
            const filename = `museflow_projects_${this.getDateString()}.xlsx`;
            XLSX.writeFile(workbook, filename);

            // 알림 표시
            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `✅ ${projects.length}개 프로젝트를 Excel로 내보냈습니다!`,
                    'success'
                );
            }

            return { success: true, filename, projectCount: projects.length };
        } catch (error) {
            console.error('Excel Export Error:', error);
            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `❌ Excel 내보내기 실패: ${error.message}`,
                    'error'
                );
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * 요약 시트 데이터 생성
     */
    generateSummarySheet(projects) {
        const totalProjects = projects.length;
        const typeCount = this.countByField(projects, 'type');
        const phaseCount = this.countByField(projects, 'phase');
        
        // 진행 중인 프로젝트 수
        const ongoing = projects.filter(p => {
            if (!p.end_date) return true;
            return new Date(p.end_date) >= new Date();
        }).length;

        // 완료된 프로젝트 수
        const completed = totalProjects - ongoing;

        return [
            ['MuseFlow 프로젝트 리포트'],
            [''],
            ['생성 일시', new Date().toLocaleString('ko-KR')],
            ['생성자', localStorage.getItem('user_email') || 'Unknown'],
            [''],
            ['=== 전체 통계 ==='],
            ['총 프로젝트 수', totalProjects],
            ['진행 중', ongoing],
            ['완료', completed],
            [''],
            ['=== 유형별 분포 ==='],
            ...Object.entries(typeCount).map(([type, count]) => [
                this.getTypeLabel(type),
                count
            ]),
            [''],
            ['=== 단계별 분포 ==='],
            ...Object.entries(phaseCount).map(([phase, count]) => [
                this.getPhaseLabel(phase),
                count
            ])
        ];
    }

    /**
     * 프로젝트 목록 시트 데이터 생성
     */
    generateProjectsSheet(projects) {
        const headers = [
            'ID',
            '제목',
            '유형',
            '단계',
            '시작일',
            '종료일',
            '기간(일)',
            '상태',
            '설명'
        ];

        const rows = projects.map(project => {
            const startDate = project.start_date ? new Date(project.start_date) : null;
            const endDate = project.end_date ? new Date(project.end_date) : null;
            const duration = startDate && endDate 
                ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
                : '-';

            return [
                project.id || '',
                project.title || '',
                this.getTypeLabel(project.type),
                this.getPhaseLabel(project.phase),
                startDate ? startDate.toLocaleDateString('ko-KR') : '',
                endDate ? endDate.toLocaleDateString('ko-KR') : '',
                duration,
                this.getProjectStatus(project),
                project.description || ''
            ];
        });

        return [headers, ...rows];
    }

    /**
     * 유형별 통계 시트 데이터 생성
     */
    generateTypeStatsSheet(projects) {
        const typeCount = this.countByField(projects, 'type');
        const total = projects.length;

        const headers = ['유형', '개수', '비율(%)'];
        const rows = Object.entries(typeCount).map(([type, count]) => [
            this.getTypeLabel(type),
            count,
            ((count / total) * 100).toFixed(1)
        ]);

        return [headers, ...rows];
    }

    /**
     * 단계별 통계 시트 데이터 생성
     */
    generatePhaseStatsSheet(projects) {
        const phaseCount = this.countByField(projects, 'phase');
        const total = projects.length;

        const headers = ['단계', '개수', '비율(%)'];
        const rows = Object.entries(phaseCount).map(([phase, count]) => [
            this.getPhaseLabel(phase),
            count,
            ((count / total) * 100).toFixed(1)
        ]);

        return [headers, ...rows];
    }

    /**
     * 필드별 카운트
     */
    countByField(projects, field) {
        return projects.reduce((acc, project) => {
            const value = project[field] || 'unknown';
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
    }

    /**
     * 유형 레이블 반환
     */
    getTypeLabel(type) {
        const labels = {
            exhibition: '전시',
            education: '교육',
            archive: '수집/보존',
            publication: '출판',
            research: '연구',
            admin: '행정'
        };
        return labels[type] || type;
    }

    /**
     * 단계 레이블 반환
     */
    getPhaseLabel(phase) {
        const labels = {
            planning: '기획',
            preparation: '준비',
            execution: '진행',
            marketing: '홍보',
            completed: '완료'
        };
        return labels[phase] || phase;
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
