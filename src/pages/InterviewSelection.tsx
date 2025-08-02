import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, MessageSquare, Code, Briefcase, Clock, Star } from "lucide-react";

interface InterviewType {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "Başlangıç" | "Orta" | "İleri";
  icon: React.ComponentType<any>;
  features: string[];
}

const interviewTypes: InterviewType[] = [
  {
    id: "pre-interview",
    title: "Ön Mülakat",
    description: "Temel kişisel sorular ve genel yetkinlik değerlendirmesi",
    duration: "15-20 dk",
    difficulty: "Başlangıç",
    icon: Users,
    features: ["Kişisel tanıtım", "Motivasyon soruları", "Genel yetkinlikler", "İletişim becerileri"]
  },
  {
    id: "technical",
    title: "Teknik Mülakat",
    description: "Mesleki bilgi ve teknik yetkinlik değerlendirmesi",
    duration: "30-45 dk",
    difficulty: "İleri",
    icon: Code,
    features: ["Mesleki sorular", "Problem çözme", "Teknik bilgi", "Uygulama örnekleri"]
  },
  {
    id: "behavioral",
    title: "Davranışsal Mülakat",
    description: "STAR metoduyla davranış odaklı sorular",
    duration: "25-30 dk",
    difficulty: "Orta",
    icon: MessageSquare,
    features: ["STAR metodu", "Durum örnekleri", "Takım çalışması", "Liderlik becerileri"]
  },
  {
    id: "case-study",
    title: "Vaka Analizi",
    description: "Gerçek iş durumları üzerinden analitik düşünce",
    duration: "40-60 dk",
    difficulty: "İleri",
    icon: Briefcase,
    features: ["İş senaryoları", "Analitik düşünce", "Stratejik planlama", "Sunum becerileri"]
  }
];

const difficultyColors = {
  "Başlangıç": "bg-success text-foreground",
  "Orta": "bg-warning text-foreground",
  "İleri": "bg-destructive text-foreground"
};

const InterviewSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  const { profession, sector } = location.state || {};

  const handleStartInterview = () => {
    if (!selectedType) return;
    
    const selectedTypeData = interviewTypes.find(t => t.id === selectedType);
    
    navigate("/interview-simulation", {
      state: {
        profession,
        sector,
        interviewType: selectedTypeData?.title
      }
    });
  };

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
            Geri Dön
          </Button>
          
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">Mülakat Türü Seçimi</h1>
            <p className="text-xl opacity-90">
              {profession} • {sector}
            </p>
            <p className="text-lg opacity-75 mt-2">
              Hangi tür mülakat simülasyonu yapmak istiyorsunuz?
            </p>
          </div>
        </div>
      </div>

      {/* Interview Types */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6 animate-slide-up">
          {interviewTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            
            return (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-glow ${
                  isSelected 
                    ? "ring-2 ring-primary shadow-glow bg-card" 
                    : "hover:shadow-card"
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{type.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {type.duration}
                          </Badge>
                          <Badge className={`text-xs ${difficultyColors[type.difficulty]}`}>
                            <Star className="w-3 h-3 mr-1" />
                            {type.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base mt-3">
                    {type.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">
                      Bu mülakat kapsamında:
                    </h4>
                    <ul className="space-y-1">
                      {type.features.map((feature, index) => (
                        <li key={index} className="text-sm flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Start Button */}
        {selectedType && (
          <div className="mt-8 text-center animate-fade-in">
            <Button 
              size="lg" 
              onClick={handleStartInterview}
              className="bg-gradient-primary hover:bg-gradient-primary/90 text-primary-foreground px-8 py-3 text-lg font-medium shadow-glow"
            >
              Mülakat Simülasyonunu Başlat
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Seçtiğiniz mülakat türü: {interviewTypes.find(t => t.id === selectedType)?.title}
            </p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-secondary/50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Nasıl Çalışır?</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-medium">Mülakat Başlat</h3>
              <p className="text-sm text-muted-foreground">
                Seçtiğiniz mülakat türüne uygun sorularla karşılaşın
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-medium">Cevaplarınızı Kaydedin</h3>
              <p className="text-sm text-muted-foreground">
                Video ile cevaplarınızı kaydedin ve analiz edilsin
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-medium">Geri Bildirim Alın</h3>
              <p className="text-sm text-muted-foreground">
                Detaylı analiz ve gelişim önerilerini görün
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSelection;