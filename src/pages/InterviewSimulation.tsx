import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, MessageSquare, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { apiClient } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const InterviewSimulation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { profession, sector, interviewType } = location.state || {};

  // Initialize interview on component mount
  useEffect(() => {
    if (!interviewStarted && profession) {
      initializeInterview();
    }
  }, [profession, interviewStarted]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeInterview = async () => {
    try {
      setIsLoading(true);
      
      // Initialize interview with system message
      const systemMessage = {
        role: "system",
        message: `Initialize interview for ${profession} position in ${sector} sector. Interview type: ${interviewType}`,
        profession,
        sector,
        interview_type: interviewType
      };

      const response = await apiClient.sendMessage(systemMessage);
      
      const welcomeMessage: Message = {
        role: "assistant",
        content: response.response,
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
      setQuestionCount(response.question_count || 1);
      setTotalQuestions(response.total_questions || 5);
      setInterviewStarted(true);
    } catch (error) {
      console.error("Error initializing interview:", error);
      // Fallback to local message if API fails
      const fallbackMessage: Message = {
        role: "assistant",
        content: `Merhaba! Ben ${profession} pozisyonu için ${interviewType} türünde mülakat yapacak olan mülakatçınızım. ${sector} sektöründeki deneyimlerinizi değerlendireceğiz. Hazır olduğunuzda kendinizi tanıtarak başlayabilirsiniz.`,
        timestamp: new Date()
      };
      setMessages([fallbackMessage]);
      setInterviewStarted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      // Send message to backend
      const chatMessage = {
        role: "user",
        message: currentMessage,
        profession,
        sector,
        interview_type: interviewType,
        question_count: questionCount,
        total_questions: totalQuestions
      };

      const response = await apiClient.sendMessage(chatMessage);
      
      const assistantMessage: Message = {
        role: "assistant",
        content: response.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setQuestionCount(response.question_count || questionCount + 1);
      setTotalQuestions(response.total_questions || totalQuestions);
      
      // Check if interview has ended
      if (response.interview_ended) {
        setInterviewEnded(true);
        setTimeout(() => {
          navigate("/interview-evaluation", {
            state: {
              messages: [...messages, userMessage, assistantMessage],
              profession,
              sector,
              interviewType
            }
          });
        }, 2000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Fallback response if API fails
      const fallbackMessage: Message = {
        role: "assistant",
        content: "Üzgünüm, şu anda bir teknik sorun yaşıyorum. Lütfen tekrar deneyin.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/interview-selection")}
            className="mb-4 text-primary-foreground hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
          
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">Mülakat Simülasyonu</h1>
            <p className="text-lg opacity-90">
              {profession} • {sector} • {interviewType}
            </p>
            {questionCount > 0 && (
              <p className="text-sm opacity-75 mt-1">
                Soru {questionCount}/{totalQuestions} {interviewEnded && "- Mülakat Tamamlandı!"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="h-[600px] sm:h-[650px] flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Canlı Mülakat Chatı
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-3 sm:p-4 bg-secondary/10 rounded-lg min-h-0">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.role === "user" ? (
                        <User className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="text-xs opacity-75">
                        {message.role === "user" ? "Siz" : "Mülakatçı"}
                      </span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words word-break leading-relaxed overflow-hidden prose prose-sm max-w-none prose-invert">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs opacity-75">Mülakatçı yazıyor...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex gap-2 mt-auto">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={interviewEnded ? "Mülakat tamamlandı..." : "Cevabınızı yazın..."}
                disabled={isLoading || interviewEnded}
                className="flex-1 min-w-0"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!currentMessage.trim() || isLoading || interviewEnded}
                size="icon"
                className="flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Panel */}
      <div className="bg-secondary/20 py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold mb-2">💡 Mülakat İpuçları</h3>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Cevaplarınızı net ve örneklerle destekleyerek verin. STAR metodunu (Situation, Task, Action, Result) kullanmayı unutmayın.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewSimulation;
