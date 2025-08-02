// Use relative URLs in production, localhost in development
const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : "http://localhost:8000";

export interface ChatMessage {
  role: string;
  message: string;
  profession?: string;
  sector?: string;
  interview_type?: string;
  question_count?: number;
  total_questions?: number;
}

export interface ChatResponse {
  response: string;
  question_count?: number;
  total_questions?: number;
  interview_ended?: boolean;
}

export interface EvaluationRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
  profession: string;
  sector: string;
  interview_type: string;
}

export interface EvaluationResponse {
  evaluation: string;
}

export class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async sendMessage(message: ChatMessage): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${this.baseURL}/api/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error checking health:", error);
      throw error;
    }
  }

  async evaluateInterview(evaluation: EvaluationRequest): Promise<EvaluationResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(evaluation),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error evaluating interview:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const apiClient = new APIClient();