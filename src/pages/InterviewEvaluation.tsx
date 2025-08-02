import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, TrendingUp, CheckCircle, AlertCircle, RotateCcw } from "lucide-react";
import { apiClient } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const InterviewEvaluation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  
  const { messages, profession, sector, interviewType } = location.state || {};

  useEffect(() => {
    if (!messages) {
      navigate("/");
      return;
    }
    generateEvaluation();
  }, [messages]);

  const generateEvaluation = async () => {
    try {
      setIsLoading(true);
      
      const evaluationRequest = {
        messages: messages.map((msg: Message) => ({
          role: msg.role,
          content: msg.content
        })),
        profession,
        sector,
        interview_type: interviewType
      };

      const response = await apiClient.evaluateInterview(evaluationRequest);
      setEvaluation(response.evaluation);
    } catch (error) {
      console.error("Error generating evaluation:", error);
      setError("Değerlendirme oluşturulurken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatEvaluation = (evalText: string) => {
    if (!evalText) return null;

    console.log("Raw evaluation text:", evalText);
    const formattedSections: { [key: string]: string[] } = {};
    
    // Extract strengths - try multiple patterns
    const strengthsPatterns = [
      /\*\*GÜÇLÜ YÖNLERİ?:?\*\*(.*?)(?=\*\*|$)/s,
      /GÜÇLÜ YÖNLERİ?:?\*\*(.*?)(?=\*\*|$)/s,
      /\*\*GÜÇLÜ YÖNLERİ?(.*?)(?=\*\*|$)/s,
      /GÜÇLÜ YÖNLERİ?(.*?)(?=GELİŞİM|GENEL|PUAN|$)/s
    ];
    
    for (const pattern of strengthsPatterns) {
      const match = evalText.match(pattern);
      if (match) {
        const items = match[1].split(/\n/).filter(line => line.trim()).map(item => item.replace(/^[-•*\s]+/, '').trim()).filter(Boolean);
        if (items.length > 0) {
          formattedSections["GÜÇLÜ YÖNLERİ:"] = items;
          break;
        }
      }
    }

    // Extract development areas - try multiple patterns  
    const devPatterns = [
      /\*\*GELİŞİM ALANLAR[IİI]?:?\*\*(.*?)(?=\*\*|$)/s,
      /\*\*GELİŞİM ALANLARİ:?\*\*(.*?)(?=\*\*|$)/s,
      /GELİŞİM ALANLAR[IİI]?:?\*\*(.*?)(?=\*\*|$)/s,
      /GELİŞİM ALANLARİ:?\*\*(.*?)(?=\*\*|$)/s,
      /\*\*GELİŞİM ALANLAR[IİI]?(.*?)(?=\*\*|$)/s,
      /GELİŞİM ALANLAR[IİI]?(.*?)(?=GENEL|PUAN|$)/s
    ];

    for (const pattern of devPatterns) {
      const match = evalText.match(pattern);
      if (match) {
        const items = match[1].split(/\n/).filter(line => line.trim()).map(item => item.replace(/^[-•*\s]+/, '').trim()).filter(Boolean);
        if (items.length > 0) {
          formattedSections["GELİŞİM ALANLARI:"] = items;
          break;
        }
      }
    }

    // Extract general evaluation
    const generalPatterns = [
      /\*\*GENEL DEĞERLENDİRME:?\*\*(.*?)(?=\*\*|$)/s,
      /GENEL DEĞERLENDİRME:?\*\*(.*?)(?=\*\*|$)/s,
      /\*\*GENEL DEĞERLENDİRME?(.*?)(?=PUAN|$)/s
    ];

    for (const pattern of generalPatterns) {
      const match = evalText.match(pattern);
      if (match) {
        const content = match[1].trim().split('\n').filter(line => line.trim() && !line.includes('-')).map(line => line.trim()).filter(Boolean);
        if (content.length > 0) {
          formattedSections["GENEL DEĞERLENDIRME:"] = content;
          break;
        }
      }
    }

    // Extract score
    const scoreMatch = evalText.match(/PUAN:?\s*(\d+)\/10/) || evalText.match(/(\d+)\/10/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

    console.log("Parsed sections:", formattedSections);
    return { sections: formattedSections, score };
  };

  const formatted = formatEvaluation(evaluation);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Değerlendirme Hazırlanıyor</h3>
            <p className="text-sm text-muted-foreground">
              AI mülakatınızı analiz ediyor ve detaylı geri bildirim hazırlıyor...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 text-primary-foreground hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana Sayfa
          </Button>
          
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">Mülakat Değerlendirmesi</h1>
            <p className="text-xl opacity-90">
              {profession} • {sector} • {interviewType}
            </p>
            <p className="text-lg opacity-75 mt-2">
              AI tabanlı detaylı performans analizi
            </p>
          </div>
        </div>
      </div>

      {/* Evaluation Content */}
      <div className="container mx-auto px-4 py-12">
        {error ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Hata Oluştu</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={generateEvaluation}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Tekrar Dene
              </Button>
            </CardContent>
          </Card>
        ) : formatted ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Score Card */}
            {formatted.score && (
              <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardContent className="p-8 text-center">
                  <Award className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2">Genel Puan</h2>
                  <div className="text-6xl font-bold text-primary mb-2">
                    {formatted.score}/10
                  </div>
                  <Badge 
                    variant={formatted.score >= 7 ? "default" : formatted.score >= 5 ? "secondary" : "destructive"}
                    className="text-lg px-4 py-2"
                  >
                    {formatted.score >= 7 ? "Başarılı" : formatted.score >= 5 ? "Orta" : "Gelişime Açık"}
                  </Badge>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              {formatted.sections["GÜÇLÜ YÖNLERİ:"] && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      Güçlü Yönleriniz
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {formatted.sections["GÜÇLÜ YÖNLERİ:"].map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Development Areas */}
              {formatted.sections["GELİŞİM ALANLARI:"] && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <TrendingUp className="w-5 h-5" />
                      Gelişim Alanları
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {formatted.sections["GELİŞİM ALANLARI:"].map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* General Evaluation */}
            {formatted.sections["GENEL DEĞERLENDIRME:"] && (
              <Card>
                <CardHeader>
                  <CardTitle>Genel Değerlendirme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {formatted.sections["GENEL DEĞERLENDIRME:"].map((paragraph, index) => (
                      <p key={index} className="text-sm leading-relaxed mb-3 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-4 pt-8">
              <Button 
                variant="outline" 
                onClick={() => navigate("/interview-selection", { state: { profession, sector } })}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Yeni Mülakat
              </Button>
              <Button onClick={() => navigate("/")}>
                Ana Sayfaya Dön
              </Button>
            </div>
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <p>Değerlendirme sonuçları yüklenemedi.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InterviewEvaluation;