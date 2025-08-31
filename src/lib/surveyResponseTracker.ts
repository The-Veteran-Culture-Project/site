/**
 * Client-side utility for tracking detailed survey responses
 */

export interface QuestionResponseData {
  questionId: string;
  questionText: string;
  category: string;
  axis: 'X' | 'Y';
  responseValue: number;
  responseTimeMs?: number;
}

export interface ResponseSession {
  surveyResponseId: string;
  startTime: number;
  questionStartTime?: number;
  currentQuestionIndex: number;
  deviceType: string;
  browserInfo: string;
}

class DetailedResponseTracker {
  private session: ResponseSession | null = null;
  private questionStartTime: number | null = null;

  /**
   * Initialize a new response tracking session
   */
  public initSession(surveyResponseId?: string): string {
    const sessionId = surveyResponseId || this.generateId();
    
    this.session = {
      surveyResponseId: sessionId,
      startTime: Date.now(),
      currentQuestionIndex: 0,
      deviceType: this.getDeviceType(),
      browserInfo: this.getBrowserInfo(),
    };

    // Store session in localStorage for persistence
    localStorage.setItem('vcp_response_session', JSON.stringify(this.session));
    
    return sessionId;
  }

  /**
   * Start timing for a specific question
   */
  public startQuestion(): void {
    this.questionStartTime = Date.now();
  }

  /**
   * Record a question response with detailed timing
   */
  public async recordResponse(data: QuestionResponseData): Promise<boolean> {
    if (!this.session) {
      console.error('No active response session. Call initSession() first.');
      return false;
    }

    const responseTimeMs = this.questionStartTime 
      ? Date.now() - this.questionStartTime 
      : undefined;

    try {
      const response = await fetch('/api/record-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          responseTimeMs,
          surveyResponseId: this.session.surveyResponseId,
          isFirstQuestion: this.session.currentQuestionIndex === 0,
          deviceType: this.session.deviceType,
          browserInfo: this.session.browserInfo,
        }),
      });

      if (response.ok) {
        this.session.currentQuestionIndex++;
        this.updateStoredSession();
        this.questionStartTime = null; // Reset for next question
        return true;
      } else {
        console.error('Failed to record response:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Error recording response:', error);
      return false;
    }
  }

  /**
   * Get the current session ID
   */
  public getSessionId(): string | null {
    return this.session?.surveyResponseId || null;
  }

  /**
   * Load existing session from localStorage
   */
  public loadSession(): boolean {
    const stored = localStorage.getItem('vcp_response_session');
    if (stored) {
      try {
        this.session = JSON.parse(stored);
        return true;
      } catch (error) {
        console.error('Failed to load stored session:', error);
        localStorage.removeItem('vcp_response_session');
      }
    }
    return false;
  }

  /**
   * Clear the current session
   */
  public clearSession(): void {
    this.session = null;
    this.questionStartTime = null;
    localStorage.removeItem('vcp_response_session');
  }

  /**
   * Get current question index
   */
  public getCurrentQuestionIndex(): number {
    return this.session?.currentQuestionIndex || 0;
  }

  /**
   * Get total session time in milliseconds
   */
  public getTotalSessionTime(): number {
    return this.session ? Date.now() - this.session.startTime : 0;
  }

  private updateStoredSession(): void {
    if (this.session) {
      localStorage.setItem('vcp_response_session', JSON.stringify(this.session));
    }
  }

  private generateId(): string {
    return 'resp_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    
    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      browser = 'Chrome';
    } else if (ua.includes('Firefox')) {
      browser = 'Firefox';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browser = 'Safari';
    } else if (ua.includes('Edg')) {
      browser = 'Edge';
    }
    
    return `${browser} ${this.getBrowserVersion(ua)}`;
  }

  private getBrowserVersion(ua: string): string {
    const match = ua.match(/(chrome|firefox|safari|edg)\/?([\d.]+)/i);
    return match ? match[2].split('.')[0] : '';
  }
}

// Create a singleton instance
export const responseTracker = new DetailedResponseTracker();

// Auto-load existing session on import
responseTracker.loadSession();

/**
 * Utility functions for easy integration
 */

/**
 * Initialize response tracking for a new survey
 */
export function initSurveyTracking(surveyResponseId?: string): string {
  return responseTracker.initSession(surveyResponseId);
}

/**
 * Start timing for a question (call when question is displayed)
 */
export function startQuestionTiming(): void {
  responseTracker.startQuestion();
}

/**
 * Record a question response
 */
export async function recordQuestionResponse(data: QuestionResponseData): Promise<boolean> {
  return await responseTracker.recordResponse(data);
}

/**
 * Get current session info
 */
export function getSessionInfo() {
  return {
    sessionId: responseTracker.getSessionId(),
    currentQuestion: responseTracker.getCurrentQuestionIndex(),
    totalTime: responseTracker.getTotalSessionTime(),
  };
}

/**
 * Clear tracking session (call on survey completion)
 */
export function clearSurveyTracking(): void {
  responseTracker.clearSession();
}
