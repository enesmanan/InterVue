import uvicorn
import os

if __name__ == "__main__":
    # Use Render's PORT environment variable or default to 8000
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting InterVue application...")
    print(f"📱 Frontend & Backend running on: http://localhost:{port}")
    print(f"🔗 API endpoints available at: http://localhost:{port}/api/")
    print(f"💡 Make sure to run 'npm run build' first if this is your first time!")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False) 