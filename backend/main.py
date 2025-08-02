from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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
    allow_origins=["http://localhost:8080"],  # React development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    message: str
    profession: str | None = None
    sector: str | None = None

@app.post("/api/chat")
async def chat(chat_input: ChatMessage):
    try:
        # Initialize chat for first message
        if chat_input.role == "system":
            context = f"You are an interviewer conducting a job interview for a {chat_input.profession} position"
            if chat_input.sector:
                context += f" in the {chat_input.sector} sector"
            context += ". Conduct the interview professionally and evaluate the candidate's responses."
            
            response = model.generate_content(context)
            return {"response": response.text}
        
        # Handle regular chat messages
        response = model.generate_content(chat_input.message)
        return {"response": response.text}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"} 