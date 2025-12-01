/**
 * MuseFlow Saved Searches System
 * Version: 8.4.0
 * 
 * 기능:
 * - 검색 조건 저장
 * - 저장된 검색 관리
 * - 1클릭 불러오기
 * - LocalStorage 기반 저장
 */

class SavedSearches {
    constructor() {
        this.storageKey = 'museflow_saved_searches';
        this.searches = this.loadSearches();
        this.version = '8.4.0';
    }

    /**
     * LocalStorage에서 저장된 검색 로드
     */
    loadSearches() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            return savedData ? JSON.parse(savedData) : [];
        } catch (error) {
            console.error('Saved searches load error:', error);
            return [];
        }
    }

    /**
     * LocalStorage에 저장
     */
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.searches));
        } catch (error) {
            console.error('Saved searches save error:', error);
        }
    }

    /**
     * 검색 저장
     * @param {Object} searchData - 검색 조건
     * @param {String} name - 검색 이름
     */
    saveSearch(searchData, name) {
        try {
            const search = {
                id: Date.now().toString(),
                name: name,
                data: searchData,
                createdAt: new Date().toISOString(),
                usedCount: 0
            };

            this.searches.push(search);
            this.saveToStorage();

            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `✅ "${name}" 검색이 저장되었습니다!`,
                    'success'
                );
            }

            return { success: true, search };
        } catch (error) {
            console.error('Save search error:', error);
            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `❌ 검색 저장 실패: ${error.message}`,
                    'error'
                );
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * 저장된 검색 불러오기
     * @param {String} searchId - 검색 ID
     */
    loadSearch(searchId) {
        try {
            const search = this.searches.find(s => s.id === searchId);
            
            if (!search) {
                throw new Error('저장된 검색을 찾을 수 없습니다.');
            }

            // 사용 횟수 증가
            search.usedCount++;
            this.saveToStorage();

            return { success: true, search };
        } catch (error) {
            console.error('Load search error:', error);
            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `❌ 검색 불러오기 실패: ${error.message}`,
                    'error'
                );
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * 저장된 검색 삭제
     * @param {String} searchId - 검색 ID
     */
    deleteSearch(searchId) {
        try {
            const index = this.searches.findIndex(s => s.id === searchId);
            
            if (index === -1) {
                throw new Error('저장된 검색을 찾을 수 없습니다.');
            }

            const searchName = this.searches[index].name;
            this.searches.splice(index, 1);
            this.saveToStorage();

            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `✅ "${searchName}" 검색이 삭제되었습니다.`,
                    'success'
                );
            }

            return { success: true };
        } catch (error) {
            console.error('Delete search error:', error);
            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `❌ 검색 삭제 실패: ${error.message}`,
                    'error'
                );
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * 저장된 검색 업데이트
     * @param {String} searchId - 검색 ID
     * @param {Object} updates - 업데이트할 데이터
     */
    updateSearch(searchId, updates) {
        try {
            const search = this.searches.find(s => s.id === searchId);
            
            if (!search) {
                throw new Error('저장된 검색을 찾을 수 없습니다.');
            }

            Object.assign(search, updates);
            this.saveToStorage();

            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `✅ 검색이 업데이트되었습니다.`,
                    'success'
                );
            }

            return { success: true, search };
        } catch (error) {
            console.error('Update search error:', error);
            if (window.showInAppNotification) {
                window.showInAppNotification(
                    `❌ 검색 업데이트 실패: ${error.message}`,
                    'error'
                );
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * 모든 저장된 검색 가져오기
     */
    getAllSearches() {
        return this.searches.sort((a, b) => b.usedCount - a.usedCount);
    }

    /**
     * 자주 사용하는 검색 (Top 5)
     */
    getFrequentSearches() {
        return this.searches
            .filter(s => s.usedCount > 0)
            .sort((a, b) => b.usedCount - a.usedCount)
            .slice(0, 5);
    }

    /**
     * 검색 이름 중복 체크
     */
    isNameDuplicate(name) {
        return this.searches.some(s => s.name.toLowerCase() === name.toLowerCase());
    }

    /**
     * 검색 개수
     */
    getCount() {
        return this.searches.length;
    }
}

// 전역 인스턴스 생성
window.savedSearches = new SavedSearches();

console.log('✅ Saved Searches System V8.4.0 initialized');
