#!/usr/bin/env python3
"""
Setup script for InterVue application
This script will build the frontend and start the backend server
"""
import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed!")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🚀 InterVue Application Setup")
    print("=" * 40)
    
    # Check if npm is available
    if not run_command("npm --version", "Checking npm availability"):
        print("❌ npm is not installed. Please install Node.js and npm first.")
        sys.exit(1)
    
    # Install frontend dependencies
    if not run_command("npm install", "Installing frontend dependencies"):
        sys.exit(1)
    
    # Build frontend
    if not run_command("npm run build", "Building frontend"):
        sys.exit(1)
    
    # Install backend dependencies
    if not run_command("pip install -r backend/requirements.txt", "Installing backend dependencies"):
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("🌐 You can now run: cd backend && python run.py")
    print("📱 Application will be available at: http://localhost:8000")

if __name__ == "__main__":
    main()