import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Square, 
  Video, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff,
  Clock,
  CheckCircle,
  AlertCircle,
  SkipForward
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: number;
  text: string;
  category: string;
  timeLimit: number; // saniye
}

const mockQuestions: Question[] = [
  {
    id: 1,
    text: "Kendinizden bahseder misiniz? Güçlü yönleriniz nelerdir?",
    category: "Kişisel Tanıtım",
    timeLimit: 120
  },
  {
    id: 2,
    text: "Bu pozisyonu neden tercih ettiniz? Kariyerinizde hangi hedeflere ulaşmak istiyorsunuz?",
    category: "Motivasyon",
    timeLimit: 90
  },
  {
    id: 3,
    text: "Daha önce karşılaştığınız en zor iş durumunu ve nasıl çözdüğünüzü anlatabilir misiniz?",
    category: "Problem Çözme",
    timeLimit: 150
  },
  {
    id: 4,
    text: "Takım çalışması sırasında yaşadığınız bir zorluğu ve nasıl üstesinden geldiğinizi paylaşır mısınız?",
    category: "Takım Çalışması",
    timeLimit: 120
  },
  {
    id: 5,
    text: "Önümüzdeki 3-5 yılda kendinizi nerede görüyorsunuz?",
    category: "Kariyer Hedefleri",
    timeLimit: 90
  }
];

const InterviewSimulation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profession, sector, interviewType } = location.state || {};

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(mockQuestions[0]?.timeLimit || 120);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [interviewStatus, setInterviewStatus] = useState<'waiting' | 'active' | 'completed'>('waiting');
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;

  useEffect(() => {
    initializeCamera();
    return () => {
      cleanupMedia();
    };
  }, []);

  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit);
    }
  }, [currentQuestion]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Kamera Erişimi",
        description: "Kamera ve mikrofon erişimi gereklidir.",
        variant: "destructive"
      });
    }
  };

  const cleanupMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setVideoBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setInterviewStatus('active');
      setRecordingTime(0);

      // Recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Question timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            nextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({
        title: "Kayıt Başladı",
        description: "Soruyu cevaplayabilirsiniz."
      });
    } catch (error) {
      toast({
        title: "Kayıt Hatası",
        description: "Kayıt başlatılamadı.",
        variant: "destructive"
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              nextQuestion();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const nextQuestion = () => {
    stopRecording();
    
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(mockQuestions[currentQuestionIndex + 1].timeLimit);
      setRecordingTime(0);
      setInterviewStatus('waiting');
    } else {
      // Mülakat tamamlandı
      setInterviewStatus('completed');
      toast({
        title: "Mülakat Tamamlandı!",
        description: "Analiziniz hazırlanıyor..."
      });
      
      // Analiz sayfasına yönlendir (gelecekte eklenecek)
      setTimeout(() => {
        navigate("/interview-results", {
          state: { profession, sector, interviewType }
        });
      }, 2000);
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (interviewStatus === 'completed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Mülakat Tamamlandı!</h2>
            <p className="text-muted-foreground mb-4">
              Performansınız analiz ediliyor ve kısa süre içinde detaylı geri bildirimleriniz hazır olacak.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Toplam Soru:</span>
                <span>{mockQuestions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Toplam Süre:</span>
                <span>{formatTime(recordingTime)}</span>
              </div>
              <div className="flex justify-between">
                <span>Meslek:</span>
                <span>{profession}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/interview-selection")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Button>
              <div>
                <h1 className="font-semibold">InterVue Simülasyonu</h1>
                <p className="text-sm text-muted-foreground">
                  {profession} • {sector}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(timeLeft)}
              </Badge>
              <Badge variant={isRecording ? "destructive" : "secondary"}>
                {isRecording ? "Kayıt Aktif" : "Beklemede"}
              </Badge>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Soru {currentQuestionIndex + 1} / {mockQuestions.length}</span>
              <span>%{Math.round(progress)} tamamlandı</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Video Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="w-5 h-5 mr-2" />
                  Video Kaydı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Recording indicator */}
                  {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                        REC {formatTime(recordingTime)}
                      </span>
                    </div>
                  )}

                  {/* Camera off overlay */}
                  {!isCameraOn && (
                    <div className="absolute inset-0 bg-black flex items-center justify-center">
                      <CameraOff className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center space-x-4 mt-4">
                  <Button
                    variant={isCameraOn ? "outline" : "destructive"}
                    size="sm"
                    onClick={toggleCamera}
                  >
                    {isCameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    variant={isMicOn ? "outline" : "destructive"}
                    size="sm"
                    onClick={toggleMic}
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>

                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      className="bg-red-500 hover:bg-red-600 text-white"
                      disabled={interviewStatus !== 'waiting'}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Kaydı Başlat
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={pauseRecording}
                      >
                        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={stopRecording}
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex >= mockQuestions.length - 1}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Soru {currentQuestionIndex + 1}</CardTitle>
                  <Badge variant="secondary">
                    {currentQuestion?.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-lg leading-relaxed">
                    {currentQuestion?.text}
                  </p>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Önerilen süre: {Math.floor((currentQuestion?.timeLimit || 0) / 60)} dakika</span>
                  </div>

                  {/* Tips */}
                  <Card className="bg-secondary/50">
                    <CardContent className="pt-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-5 h-5 text-info mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm mb-1">İpucu</h4>
                          <p className="text-sm text-muted-foreground">
                            Cevabınızı STAR metoduna göre yapılandırın: 
                            <strong> Durum, Görev, Eylem, Sonuç</strong>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Question List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sorular</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                        index === currentQuestionIndex
                          ? "bg-primary/10 border border-primary/20"
                          : index < currentQuestionIndex
                          ? "bg-success/10 text-success"
                          : "bg-secondary/30"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        index === currentQuestionIndex
                          ? "bg-primary text-primary-foreground"
                          : index < currentQuestionIndex
                          ? "bg-success text-white"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {index < currentQuestionIndex ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {question.category}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.floor(question.timeLimit / 60)} dk
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSimulation;