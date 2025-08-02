from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure Google Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-2.0-flash')

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    #allow_origins=["http://localhost:8080"],
    allow_origins=["*"],  # Allow all origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (frontend build)
# Get the path to the dist directory
dist_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")
assets_path = os.path.join(dist_path, "assets")
index_path = os.path.join(dist_path, "index.html")

# Check if dist directory exists and mount static files
if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

# Serve frontend static files
@app.get("/", response_class=FileResponse)
async def serve_frontend():
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Frontend not built yet. Please run ' build' first.", "build_command": "npm run build"}

@app.get("/{path:path}")
async def serve_frontend_routes(path: str):
    # For any route that doesn't start with /api, serve the frontend
    if not path.startswith("api/"):
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"message": "Frontend not built yet. Please run 'npm run build' first.", "build_command": "npm run build"}
    # If it's an API route but doesn't exist, let FastAPI handle the 404
    raise HTTPException(status_code=404, detail="API endpoint not found")

class ChatMessage(BaseModel):
    role: str
    message: str
    profession: str | None = None
    sector: str | None = None
    interview_type: str | None = None
    question_count: int | None = None
    total_questions: int | None = None

@app.post("/api/chat")
async def chat(chat_input: ChatMessage):
    try:
        # Initialize chat for first message
        if chat_input.role == "system":
            # Determine total questions based on interview type
            question_counts = {
                "Ön Mülakat": 4,
                "Teknik Mülakat": 7, 
                "Davranışsal Mülakat": 5,
                "Vaka Analizi": 6
            }
            total_questions = question_counts.get(chat_input.interview_type, 5)
            
            # Interview type specific prompts
            type_prompts = {
                "Ön Mülakat": f"""Sen bir {chat_input.profession} pozisyonu için Ön Mülakat yapan profesyonel bir mülakatçısın.

MÜLAKAT ODAĞI: Temel kişisel tanıtım, motivasyon ve genel uygunluk
SORU ALANLARI: Kişisel tanıtım, neden bu şirket/pozisyon, temel deneyimler, beklentiler
TOPLAM SORU: {total_questions}

Her yanıtın MAKSIMUM 2-3 cümle olsun. Sıcak ve profesyonel ol.""",

                "Teknik Mülakat": f"""Sen bir {chat_input.profession} pozisyonu için Teknik Mülakat yapan profesyonel bir mülakatçısın.

MÜLAKAT ODAĞI: Mesleki bilgi, teknik yetkinlik, problem çözme becerileri
SORU ALANLARI: Teknik sorular, projeler, araçlar/teknolojiler, problem çözme senaryoları
TOPLAM SORU: {total_questions}

Her yanıtın MAKSIMUM 2-3 cümle olsun. Teknik detaylara odaklan.""",

                "Davranışsal Mülakat": f"""Sen bir {chat_input.profession} pozisyonu için Davranışsal Mülakat yapan profesyonel bir mülakatçısın.

MÜLAKAT ODAĞI: STAR metoduyla davranış analizi, soft skills değerlendirmesi
SORU ALANLARI: Takım çalışması, liderlik, çatışma yönetimi, stres altında çalışma
TOPLAM SORU: {total_questions}

Her yanıtın MAKSIMUM 2-3 cümle olsun. STAR (Situation-Task-Action-Result) metodunu vurgula.""",

                "Vaka Analizi": f"""Sen bir {chat_input.profession} pozisyonu için Vaka Analizi yapan profesyonel bir mülakatçısın.

MÜLAKAT ODAĞI: Analitik düşünce, stratejik planlama, iş çözümleri
SORU ALANLARI: İş senaryoları, vaka analizleri, stratejik düşünme, karar verme
TOPLAM SORU: {total_questions}

Her yanıtın MAKSIMUM 2-3 cümle olsun. Analitik ve stratejik sorular sor."""
            }
            
            context = type_prompts.get(chat_input.interview_type, type_prompts["Ön Mülakat"])
            context += f"\n\nİlk sorunla başla ve kısa bir karşılama yap."
            
            response = model.generate_content(context)
            return {"response": response.text, "question_count": 1, "total_questions": total_questions}
        
        # Handle regular chat messages with question count tracking
        current_question = chat_input.question_count or 1
        total_questions = chat_input.total_questions or 5
        
        if current_question >= total_questions:
            # Interview is ending, prepare final response
            context = f"""Bu {chat_input.interview_type} tamamlandı. Kısa bir teşekkür mesajı ver ve değerlendirme sonuçlarının hazırlandığını belirt. MAKSIMUM 2 cümle."""
            response = model.generate_content(context)
            return {"response": response.text, "question_count": total_questions, "interview_ended": True}
        
        # Continue with next question based on interview type
        type_contexts = {
            "Ön Mülakat": f"""Sen bir {chat_input.profession} ön mülakatçısısın. Aday: "{chat_input.message}"

Bu {current_question}/{total_questions}. soru. {"Son soru yaklaşıyor!" if current_question >= total_questions - 1 else ""} 
Cevabı kısa değerlendir ve sonraki soruyu sor. Odak: kişisel uygunluk, motivasyon.""",

            "Teknik Mülakat": f"""Sen bir {chat_input.profession} teknik mülakatçısısın. Aday: "{chat_input.message}"

Bu {current_question}/{total_questions}. soru. {"Son soru yaklaşıyor!" if current_question >= total_questions - 1 else ""} 
Cevabı teknik açıdan değerlendir ve sonraki teknik soruyu sor.""",

            "Davranışsal Mülakat": f"""Sen bir {chat_input.profession} davranışsal mülakatçısısın. Aday: "{chat_input.message}"

Bu {current_question}/{total_questions}. soru. {"Son soru yaklaşıyor!" if current_question >= total_questions - 1 else ""} 
STAR metoduyla değerlendir ve sonraki davranışsal soruyu sor.""",

            "Vaka Analizi": f"""Sen bir {chat_input.profession} vaka analizi mülakatçısısın. Aday: "{chat_input.message}"

Bu {current_question}/{total_questions}. soru. {"Son soru yaklaşıyor!" if current_question >= total_questions - 1 else ""} 
Analitik yaklaşımını değerlendir ve sonraki vaka sorusunu sor."""
        }
        
        context = type_contexts.get(chat_input.interview_type, type_contexts["Ön Mülakat"])
        context += " MAKSIMUM 2-3 cümle kullan."
        
        response = model.generate_content(context)
        return {"response": response.text, "question_count": current_question + 1, "total_questions": total_questions}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class EvaluationRequest(BaseModel):
    messages: list
    profession: str
    sector: str
    interview_type: str

@app.post("/api/evaluate")
async def evaluate_interview(eval_request: EvaluationRequest):
    try:
        # Prepare conversation history for evaluation
        conversation = ""
        for msg in eval_request.messages:
            role = "Mülakatçı" if msg["role"] == "assistant" else "Aday"
            conversation += f"{role}: {msg['content']}\n"
        
        evaluation_prompt = f"""Bu {eval_request.profession} pozisyonu için yapılan {eval_request.interview_type} mülakat değerlendirmesi:

{conversation}

Lütfen şu formatta KISA ve NET bir değerlendirme yap:

**GÜÇLÜ YÖNLERİ:**
- [3-4 madde, her biri 1 cümle]

**GELİŞİM ALANLARİ:**
- [3-4 madde, her biri 1 cümle]

**GENEL DEĞERLENDIRME:**
[2-3 cümle özet]

**PUAN: X/10**"""
        
        response = model.generate_content(evaluation_prompt)
        return {"evaluation": response.text}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"} 