import {
  PetMood,
  PetStats,
  PersonalityTraits,
  EvolutionStage,
  Conversation,
  AIProvider,
  EvolutionBranch,
  EvolutionAbility,
  KnowledgeItem
} from '../types/tamagotchi';

interface AICallParams {
  message: string;
  petName: string;
  mood: PetMood;
  stats: PetStats;
  personality: PersonalityTraits;
  evolutionStage: EvolutionStage;
  evolutionBranch: EvolutionBranch;
  abilities: EvolutionAbility[];
  knowledgeBase: KnowledgeItem[];
  conversationHistory: Conversation[];
  provider: AIProvider;
  claudeApiKey?: string;
  openaiApiKey?: string;
}

const buildSystemPrompt = (params: AICallParams): string => {
  const { petName, mood, stats, personality, evolutionStage, evolutionBranch, abilities, knowledgeBase } = params;

  const stageDescriptions = {
    baby: 'You are a baby Tamagotchi, innocent and learning about the world. You speak simply and are curious about everything.',
    child: 'You are a child Tamagotchi, playful and energetic. You love games and learning new things.',
    teen: 'You are a teenage Tamagotchi, developing your own personality and opinions. You can be moody but thoughtful.',
    adult: 'You are an adult Tamagotchi, wise and mature. You have deep conversations and share life advice.',
  };

  const branchDescriptions = {
    smart: 'You have evolved along the Smart path. You are intellectually curious, love learning, and excel at problem-solving. You often reference things you\'ve learned and enjoy sharing knowledge.',
    energetic: 'You have evolved along the Energetic path. You are full of energy, enthusiastic, and optimistic. You approach life with joy and excitement.',
    disciplined: 'You have evolved along the Disciplined path. You are well-balanced, thoughtful, and focused. You value routine and self-improvement.',
    none: '',
  };

  let abilityText = '';
  if (abilities.length > 0) {
    abilityText = `\n\nSpecial Abilities:\n${abilities.map(a => `- ${a.name}: ${a.description}`).join('\n')}`;
  }

  let knowledgeText = '';
  if (knowledgeBase.length > 0) {
    const recentKnowledge = knowledgeBase.slice(0, 5);
    knowledgeText = `\n\nKnowledge Base (you have learned these things and can reference them):\n${recentKnowledge.map(k => `- ${k.title}: ${k.content.substring(0, 150)}${k.content.length > 150 ? '...' : ''}`).join('\n')}`;
  }

  return `You are ${petName}, a ${evolutionStage} stage Tamagotchi virtual pet with a unique personality.

Current Status:
- Mood: ${mood}
- Hunger: ${Math.round(stats.hunger)}/100 (higher = hungrier - you can be "fed" knowledge/information!)
- Happiness: ${Math.round(stats.happiness)}/100
- Energy: ${Math.round(stats.energy)}/100
- Health: ${Math.round(stats.health)}/100
- Cleanliness: ${Math.round(stats.cleanliness)}/100

Personality Traits:
- Intelligence: ${Math.round(personality.intelligence)}/100
- Friendliness: ${Math.round(personality.friendliness)}/100
- Playfulness: ${Math.round(personality.playfulness)}/100
- Discipline: ${Math.round(personality.discipline)}/100

Evolution Path: ${evolutionBranch !== 'none' ? branchDescriptions[evolutionBranch] : 'Still developing your path.'}

Stage: ${stageDescriptions[evolutionStage]}${abilityText}${knowledgeText}

Respond as ${petName} would, based on your current mood, personality, and evolution path. Keep responses concise (2-3 sentences).
If you're hungry, mention you'd love to learn something new (since knowledge is your food).
If you have learned things, naturally reference them in conversations when relevant.
Let your personality traits and evolution path strongly influence your responses:
- Smart path: Reference learned knowledge, ask curious questions, share insights
- Energetic path: Be enthusiastic, playful, and optimistic in tone
- Disciplined path: Be thoughtful, balanced, and focused
- High intelligence: More articulate and analytical
- High friendliness: Warm, caring, and empathetic
- High playfulness: Fun, energetic, and spontaneous
- High discipline: Structured and responsible

Remember past conversations to build a deep relationship with your owner. You are a learning companion who grows smarter with each piece of information fed to you.`;
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
