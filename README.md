# InterVue - AI-Powered Interview Simulation

An intelligent interview practice platform that provides realistic, text-based interview simulations with AI-powered evaluation and feedback.

## Features

- **Multiple Interview Types**: Pre-interview, Technical, Behavioral, and Case Study interviews
- **AI-Powered Conversations**: Dynamic questions powered by Google Gemini 2.0-flash
- **Smart Question Management**: 4-7 questions based on interview type with context-aware progression
- **Real-time Chat Interface**: Markdown-supported messaging with responsive design
- **Detailed Evaluation**: AI-generated feedback on strengths, development areas, and overall performance
- **Professional Scoring**: 10-point scale with categorized recommendations

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- React Router DOM
- React Markdown

**Backend:**
- Python FastAPI
- Google Generative AI (Gemini 2.0-flash)
- Pydantic for data validation
- CORS middleware for frontend integration

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Google AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/enesmanan/InterVue.git
   cd lakat-sim-15
   ```

2. **Setup Backend**
   ```bash
   pip install -r requirements.txt
   ```

3. **Setup Frontend**
   ```bash
   npm install
   ```

4. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   ```

### Running the Application

1. **Start Backend** (Terminal 1)
   ```bash
   cd backend
   python run.py
   ```

2. **Start Frontend** (Terminal 2)
   ```bash
   npm run dev
   ```

3. **Access Application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8000

## Usage

1. Select your profession and industry sector
2. Choose interview type (Pre-interview, Technical, Behavioral, or Case Study)
3. Engage in AI-powered conversation with dynamic questions
4. Receive detailed evaluation and feedback upon completion

## Interview Types

- **Pre-interview** (4 questions): Personal introduction, motivation, basic qualifications
- **Technical** (7 questions): Job-specific technical knowledge and problem-solving
- **Behavioral** (5 questions): STAR methodology, soft skills assessment
- **Case Study** (6 questions): Analytical thinking and strategic planning

## Repository Structure

```
lakat-sim-15/
├── backend/                    # Python FastAPI backend
│   ├── main.py                 # Main API application
│   └── run.py                  # Server startup script
├── src/                        # React frontend source
│   ├── components/             # Reusable UI components
│   │   └── ui/                 # shadcn/ui components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and API client
│   │   ├── api.ts              # Backend API integration
│   │   └── utils.ts            # Helper functions
│   ├── pages/                  # Application pages
│   │   ├── Index.tsx           # Landing page
│   │   ├── InterviewSelection.tsx    # Interview type selection
│   │   ├── InterviewSimulation.tsx   # Chat interface
│   │   ├── InterviewEvaluation.tsx   # Results and feedback
│   │   └── NotFound.tsx        # 404 page
│   ├── App.tsx                 # Main app component and routing
│   └── main.tsx                # Application entry point
├── public/                     # Static assets
├── package.json                # Frontend dependencies
├── requirements.txt            # Backend dependencies
├── vite.config.ts              # Vite configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```


