import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  TrendingUp, 
  Users, 
  Award, 
  PlayCircle, 
  CheckCircle,
  ArrowRight,
  Star
} from "lucide-react";

const professions = [
  { value: "software-engineer", label: "Yazılım Mühendisi" },
  { value: "product-manager", label: "Ürün Yöneticisi" },
  { value: "data-scientist", label: "Veri Bilimci" },
  { value: "ui-ux-designer", label: "UI/UX Tasarımcı" },
  { value: "marketing-specialist", label: "Pazarlama Uzmanı" },
  { value: "sales-representative", label: "Satış Temsilcisi" },
  { value: "hr-specialist", label: "İK Uzmanı" },
  { value: "financial-analyst", label: "Finansal Analist" },
  { value: "project-manager", label: "Proje Yöneticisi" },
  { value: "business-analyst", label: "İş Analisti" }
];

const sectors = [
  { value: "technology", label: "Teknoloji" },
  { value: "finance", label: "Finans" },
  { value: "healthcare", label: "Sağlık" },
  { value: "education", label: "Eğitim" },
  { value: "retail", label: "Perakende" },
  { value: "manufacturing", label: "İmalat" },
  { value: "consulting", label: "Danışmanlık" },
  { value: "media", label: "Medya" },
  { value: "automotive", label: "Otomotiv" },
  { value: "energy", label: "Enerji" }
];

const features = [
  {
    icon: PlayCircle,
    title: "Gerçek Zamanlı Simülasyon",
    description: "Gerçek mülakat ortamını simüle eden interaktif deneyim"
  },
  {
    icon: TrendingUp,
    title: "AI Destekli Analiz",
    description: "Duygu analizi, ses analizi ve davranış değerlendirmesi"
  },
  {
    icon: Award,
    title: "Detaylı Geri Bildirim",
    description: "Güçlü ve gelişim alanlarınız için kapsamlı raporlar"
  },
  {
    icon: Users,
    title: "Sektör Odaklı Sorular",
    description: "Mesleğiniz ve sektörünüze özel mülakat soruları"
  }
];

const stats = [
  { number: "AI", label: "Destekli Analiz" },
  { number: "15+", label: "Farklı Meslek" },
  { number: "4", label: "Mülakat Türü" },
  { number: "24/7", label: "Erişim" }
];

const Index = () => {
  const navigate = useNavigate();
  const [selectedProfession, setSelectedProfession] = useState("");
  const [selectedSector, setSelectedSector] = useState("");

  const handleStartInterview = () => {
    if (!selectedProfession || !selectedSector) {
      return;
    }

    const professionLabel = professions.find(p => p.value === selectedProfession)?.label;
    const sectorLabel = sectors.find(s => s.value === selectedSector)?.label;

    navigate("/interview-selection", {
      state: {
        profession: professionLabel,
        sector: sectorLabel
      }
    });
  };

  const isFormValid = selectedProfession && selectedSector;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <Badge className="mb-6 bg-white/20 text-primary-foreground hover:bg-white/30">
              <Star className="w-4 h-4 mr-2" />
              InterVue
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Mülakata
              <span className="block bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Hazır mısınız?
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
              Gerçek mülakat deneyimi yaşayın, AI destekli analizlerle kendinizi geliştirin ve 
              <strong> dream job</strong>'unuzu elde edin.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 animate-slide-up">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold mb-1">{stat.number}</div>
                <div className="text-sm opacity-75">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4">Mülakat Simülasyonunuzu Başlatın</h2>
            <p className="text-lg text-muted-foreground">
              Mesleğinizi ve hedef sektörünüzü seçerek kişiselleştirilmiş mülakat deneyimine başlayın
            </p>
          </div>

          <Card className="shadow-card animate-slide-up">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 mr-2 text-primary" />
                Mesleki Bilgileriniz
              </CardTitle>
              <CardDescription>
                Size en uygun mülakat deneyimi için bilgilerinizi paylaşın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mesleğiniz</label>
                  <Select value={selectedProfession} onValueChange={setSelectedProfession}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Mesleğinizi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {professions.map((profession) => (
                        <SelectItem key={profession.value} value={profession.value}>
                          {profession.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Hedef Sektör</label>
                  <Select value={selectedSector} onValueChange={setSelectedSector}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Sektörünüzü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem key={sector.value} value={sector.value}>
                          {sector.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-6">
                <Button
                  size="lg"
                  onClick={handleStartInterview}
                  disabled={!isFormValid}
                  className="w-full bg-gradient-primary hover:bg-gradient-primary/90 text-primary-foreground h-14 text-lg font-medium shadow-glow"
                >
                  Mülakat Türünü Seçmeye Devam Et
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                {!isFormValid && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Devam etmek için lütfen meslek ve sektör seçin
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-secondary/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Neden Bizim Platformumuz?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AI teknolojisi ve uzman bilgisiyle desteklenen kapsamlı mülakat hazırlık deneyimi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-card transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">3 Adımda Mülakat Başarısı</h2>
            <p className="text-lg text-muted-foreground">
              Basit ve etkili süreçle mülakat becerilerinizi geliştirin
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Profil Oluştur",
                description: "Meslek ve sektör bilgilerinizi girerek kişiselleştirilmiş deneyim başlatın"
              },
              {
                step: "2", 
                title: "Simülasyon Yap",
                description: "Gerçek mülakat ortamında video kayıt ile sorulara cevap verin"
              },
              {
                step: "3",
                title: "Analiz Al",
                description: "AI destekli detaylı analiz ve gelişim önerilerini inceleyin"
              }
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl shadow-glow">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <ArrowRight className="w-6 h-6 text-muted-foreground mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Hemen Başlayın</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Bugün mülakat simülasyonuna başlayın ve kariyerinizde bir sonraki seviyeye geçin
          </p>
          <Button
            size="lg"
            className="bg-gradient-primary hover:bg-gradient-primary/90 text-primary-foreground px-8 py-3 text-lg font-medium shadow-glow"
            onClick={() => {
              document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Ücretsiz Başlayın
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
