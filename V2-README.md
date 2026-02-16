# RugPullatypus V2 - OpenAI Integration

## New Features

### OpenAI GPT-4o-mini Integration
- Dynamic response generation (unique every time)
- 1930s detective platypus personality
- Analyzes contract data and generates contextual commentary

### Rate Limiting
- 10 requests per minute per user
- Prevents API abuse
- Configurable via environment variables

### Enhanced Display
- Shows token name + symbol
- Contract address clearly displayed
- Chain information (Base Network)
- AI-generated "Detective's Take" section

### New Commands
- `/about` - Learn about $PLAT and the project

## Files

- `src/openai-service.ts` - OpenAI integration service
- `src/rate-limiter.ts` - Rate limiting logic
- `src/telegram-bot-v2.ts` - Main bot with V2 features

## Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=150
OPENAI_TEMPERATURE=0.8

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
Setup
npm install
npm start
Client: RugPullatypus ($PLAT) on Base
Contract: 0xdA07d02eCdBF2Bf8214a1B4B7B740755dae4C3Be
