/**
 * Event Emitter Service
 * SSE (Server-Sent Events) 실시간 스트리밍
 * @version 1.0.0
 */

import type { ExecutionEvent } from '../types/orchestrator.types';

export class EventEmitter {
  private listeners: Map<string, Set<(event: ExecutionEvent) => void>>;
  private globalListeners: Set<(event: ExecutionEvent) => void>;

  constructor() {
    this.listeners = new Map();
    this.globalListeners = new Set();
  }

  /**
   * 이벤트 발생
   */
  emit(event: ExecutionEvent): void {
    // 세션별 리스너에 전송
    const sessionListeners = this.listeners.get(event.sessionId);
    if (sessionListeners) {
      sessionListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('❌ Event listener error:', error);
        }
      });
    }

    // 전역 리스너에 전송
    this.globalListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('❌ Global event listener error:', error);
      }
    });
  }

  /**
   * 세션별 리스너 등록
   */
  on(sessionId: string, listener: (event: ExecutionEvent) => void): () => void {
    if (!this.listeners.has(sessionId)) {
      this.listeners.set(sessionId, new Set());
    }

    this.listeners.get(sessionId)!.add(listener);

    // Cleanup 함수 반환
    return () => {
      const sessionListeners = this.listeners.get(sessionId);
      if (sessionListeners) {
        sessionListeners.delete(listener);
        if (sessionListeners.size === 0) {
          this.listeners.delete(sessionId);
        }
      }
    };
  }

  /**
   * 전역 리스너 등록
   */
  onAny(listener: (event: ExecutionEvent) => void): () => void {
    this.globalListeners.add(listener);

    // Cleanup 함수 반환
    return () => {
      this.globalListeners.delete(listener);
    };
  }

  /**
   * 세션의 모든 리스너 제거
   */
  removeAllListeners(sessionId: string): void {
    this.listeners.delete(sessionId);
  }

  /**
   * 전체 리스너 제거
   */
  removeAll(): void {
    this.listeners.clear();
    this.globalListeners.clear();
  }

  /**
   * 활성 리스너 수 조회
   */
  getListenerCount(sessionId?: string): number {
    if (sessionId) {
      return this.listeners.get(sessionId)?.size || 0;
    }
    return Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0) + this.globalListeners.size;
  }
}
