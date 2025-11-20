# 🚀 Tamagotchi App - Complete Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

## 🔧 Installation Steps

### Option 1: Fresh Installation (Recommended if having issues)

```bash
# 1. Navigate to the project directory
cd path/to/Tamagotchi-App

# 2. Clean previous installations (if any)
# On Windows PowerShell:
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# On Mac/Linux:
rm -rf node_modules package-lock.json

# 3. Install dependencies
npm install

# 4. Start the development server
npm start
```

### Option 2: Quick Start (if files are fresh)

```bash
# Navigate to project
cd path/to/Tamagotchi-App

# Install dependencies
npm install

# Start the app
npm start
```

## 🎮 Running the Application

Once `npm start` runs successfully, the app will automatically open in your browser at:
**http://localhost:3000**

## 📦 Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Runs tests
- `npm run eject` - Ejects from Create React App (one-way operation)

## ⚙️ Configuration

### AI Setup

1. Go to **Settings** in the app
2. Choose your AI provider (Claude or OpenAI)
3. Enter your API key:
   - **Claude**: Get from https://console.anthropic.com/
   - **OpenAI**: Get from https://platform.openai.com/api-keys

## 🐛 Common Issues & Solutions

### Issue: "Missing script: start"

**Solution:**
```bash
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npm start
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Reinstall dependencies
npm install
```

### Issue: Build errors

**Solution:**
```bash
# Clear cache and rebuild
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm install
npm run build
```

## 📁 Project Structure

```
Tamagotchi-App/
├── public/           # Static files
├── src/
│   ├── components/   # React components
│   │   ├── Actions/
│   │   ├── Chat/
│   │   ├── Environment/
│   │   ├── House/
│   │   ├── Learn/
│   │   ├── Reminders/
│   │   ├── Social/
│   │   └── ...
│   ├── services/     # AI service integration
│   ├── store/        # Zustand state management
│   ├── types/        # TypeScript definitions
│   ├── App.tsx       # Main app component
│   └── index.tsx     # Entry point
├── package.json      # Dependencies and scripts
└── tsconfig.json     # TypeScript configuration
```

## ✨ Features

- 🎮 Interactive Tamagotchi with evolution system
- 🤖 AI-powered personality and conversations
- 📚 Knowledge-based learning (feed information)
- 🏠 Home environment with multiple rooms
- 👥 Social system (visitor cards)
- ⏰ Reminders and notifications
- 💬 Real-time chat with AI autonomy

## 🆘 Still Having Issues?

1. Make sure you're in the correct directory
2. Check Node.js version: `node --version` (should be 16+)
3. Try the fresh installation steps above
4. Check the console for specific error messages

## 📝 Notes

- The app uses **localStorage** to persist your Tamagotchi's data
- AI features require an API key from Claude or OpenAI
- Browser notifications require permission from your browser
- Some features may require a modern browser (Chrome, Firefox, Safari, Edge)
