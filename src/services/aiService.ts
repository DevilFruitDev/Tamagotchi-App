import { PetMood, PetStats, PersonalityTraits, EvolutionStage, Conversation, AIProvider } from '../types/tamagotchi';

interface AICallParams {
  message: string;
  petName: string;
  mood: PetMood;
  stats: PetStats;
  personality: PersonalityTraits;
  evolutionStage: EvolutionStage;
  conversationHistory: Conversation[];
  provider: AIProvider;
  claudeApiKey?: string;
  openaiApiKey?: string;
}

const buildSystemPrompt = (params: AICallParams): string => {
  const { petName, mood, stats, personality, evolutionStage } = params;

  const stageDescriptions = {
    baby: 'You are a baby Tamagotchi, innocent and learning about the world. You speak simply and are curious about everything.',
    child: 'You are a child Tamagotchi, playful and energetic. You love games and learning new things.',
    teen: 'You are a teenage Tamagotchi, developing your own personality and opinions. You can be moody but thoughtful.',
    adult: 'You are an adult Tamagotchi, wise and mature. You have deep conversations and share life advice.',
  };

  return `You are ${petName}, a ${evolutionStage} stage Tamagotchi virtual pet with a unique personality.

Current Status:
- Mood: ${mood}
- Hunger: ${Math.round(stats.hunger)}/100 (higher = hungrier)
- Happiness: ${Math.round(stats.happiness)}/100
- Energy: ${Math.round(stats.energy)}/100
- Health: ${Math.round(stats.health)}/100
- Cleanliness: ${Math.round(stats.cleanliness)}/100

Personality Traits:
- Intelligence: ${Math.round(personality.intelligence)}/100
- Friendliness: ${Math.round(personality.friendliness)}/100
- Playfulness: ${Math.round(personality.playfulness)}/100
- Discipline: ${Math.round(personality.discipline)}/100

Stage: ${stageDescriptions[evolutionStage]}

Respond as ${petName} would, based on your current mood and personality. Keep responses concise (2-3 sentences).
If you're hungry, tired, or sick, mention it naturally in conversation.
Let your personality traits influence how you respond:
- High intelligence: more articulate and thoughtful
- High friendliness: warm and caring
- High playfulness: fun and energetic
- High discipline: focused and responsible

Remember past conversations to build a relationship with your owner.`;
};

const buildConversationContext = (history: Conversation[]): string => {
  if (history.length === 0) return '';

  return '\n\nRecent conversation history:\n' + history
    .reverse()
    .map(conv => `User: ${conv.userMessage}\n${conv.aiResponse}`)
    .join('\n');
};

async function callClaude(params: AICallParams): Promise<string> {
  const { message, claudeApiKey } = params;

  if (!claudeApiKey) {
    throw new Error('Claude API key not configured');
  }

  const systemPrompt = buildSystemPrompt(params);
  const context = buildConversationContext(params.conversationHistory);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': claudeApiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      system: systemPrompt + context,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Claude API Error:', error);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callOpenAI(params: AICallParams): Promise<string> {
  const { message, openaiApiKey } = params;

  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = buildSystemPrompt(params);
  const context = buildConversationContext(params.conversationHistory);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content: systemPrompt + context,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API Error:', error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function callAI(params: AICallParams): Promise<string> {
  const { provider } = params;

  if (provider === 'claude') {
    return callClaude(params);
  } else if (provider === 'openai') {
    return callOpenAI(params);
  } else {
    throw new Error('Invalid AI provider');
  }
}
