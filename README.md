# Tamagotchi-App 🐣

An interactive virtual pet game with AI-powered personality, evolution stages, and dynamic conversations!

## Features

### 🌱 Evolution System
Your Tamagotchi grows through **4 life stages** based on age and care quality:
- **Baby** (0-2 days): Innocent and learning, needs basic care
- **Child** (2-5 days): Playful and energetic, loves games
- **Teen** (5-10 days): Developing personality, can be moody
- **Adult** (10+ days): Wise and mature, full personality

Poor care can slow down evolution, so take good care of your pet!

### 🎭 Personality System
Each Tamagotchi develops unique personality traits that grow over time:
- **Intelligence**: Increases through training
- **Friendliness**: Grows from interactions and conversations
- **Playfulness**: Enhanced by playing activities
- **Discipline**: Improved by consistent care

### 🤖 AI Integration
Choose between **Claude (Anthropic)** or **OpenAI (ChatGPT)** to give your Tamagotchi a unique personality:
- Conversations adapt to current mood, stats, and evolution stage
- AI remembers recent conversations for contextual responses
- Personality traits influence how your pet responds
- Export all conversations as JSON for safekeeping

### 💪 Activities
Take care of your pet with various actions:
- **Feed** 🍖 - Reduces hunger, increases happiness
- **Play** ⚽ - Increases happiness and playfulness (costs energy)
- **Train** 📚 - Increases intelligence and discipline (costs energy)
- **Clean** 🧼 - Improves cleanliness and mood
- **Sleep** 💤 - Restores energy completely
- **Medicine** 💊 - Heals when health is low

### 📊 Stats & Tracking
Monitor your Tamagotchi's well-being:
- **Hunger**: Feed regularly to keep satisfied
- **Happiness**: Play and interact to maintain joy
- **Energy**: Rest when tired
- **Health**: Keep other stats balanced to maintain health
- **Cleanliness**: Clean regularly to prevent sickness
- **Care Quality**: Track how well you're caring for your pet

## Setup

### Installation

```bash
npm install
```

### Running the App

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### AI Configuration

1. Click on the **Settings** panel in the app
2. Choose your AI provider:
   - **Claude (Anthropic)**: Get API key at [console.anthropic.com](https://console.anthropic.com/settings/keys)
   - **OpenAI (ChatGPT)**: Get API key at [platform.openai.com](https://platform.openai.com/api-keys)
3. Enter your API key (stored locally in browser only)
4. Start talking to your Tamagotchi!

**Note**: API keys are stored securely in your browser's localStorage and never sent anywhere except the official Claude or OpenAI APIs.

## Features Overview

### Evolution Timeline
```
Baby (Day 0-2)
  ↓ Good care required
Child (Day 2-5)
  ↓ Good care required
Teen (Day 5-10)
  ↓ Good care required
Adult (Day 10+)
```

### Personality Growth
- Train your pet to increase **Intelligence** and **Discipline**
- Play frequently to boost **Playfulness** and **Friendliness**
- Consistent care improves **Discipline**
- Conversations enhance **Friendliness**

### AI Conversations
Your Tamagotchi's AI personality considers:
- Current mood (happy, sad, hungry, tired, sick, etc.)
- All stats (hunger, happiness, energy, health, cleanliness)
- Personality traits (intelligence, friendliness, playfulness, discipline)
- Evolution stage (responses evolve with age)
- Recent conversation history (maintains context)

### Conversation Export
Export all your conversations with your Tamagotchi:
1. Go to **Settings** panel
2. Click **Export Conversations**
3. Downloads a JSON file with all chat history, timestamps, and context

## Technologies Used

- **React** with TypeScript
- **Zustand** for state management
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- **Claude API** (Anthropic) for AI conversations
- **OpenAI API** for AI conversations

## Development

### Project Structure
```
tamagotchi-app/
├── components/
│   ├── Actions/         # Action buttons (Feed, Play, etc.)
│   ├── Logs/           # Activity log display
│   ├── Personality/    # Personality traits display
│   ├── Pet/            # Main pet visualization
│   ├── Settings/       # AI configuration
│   └── Stats/          # Stats bars display
├── services/
│   └── aiService.ts    # AI integration (Claude & OpenAI)
├── store/
│   └── tamagotchiStore.ts  # Zustand state management
└── types/
    └── tamagotchi.ts   # TypeScript interfaces

```

## Tips for Playing

1. **Check stats regularly** - Don't let hunger or cleanliness get too high/low
2. **Train your pet** - Higher intelligence leads to better conversations
3. **Play often** - Keeps happiness high and builds playfulness
4. **Consistent care** - Regular feeding and cleaning improves discipline
5. **Talk to your pet** - AI conversations increase friendliness and bond
6. **Export conversations** - Save memorable moments with your virtual friend

## Building for Production

```bash
npm run build
```

Builds the app for production to the `build` folder.

## Deployment

```bash
npm run deploy
```

Deploys to GitHub Pages (configured in package.json).

## License

This project is open source and available under the MIT License.