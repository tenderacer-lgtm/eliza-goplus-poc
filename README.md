# RugPullatypus Token Scanner

A production Telegram bot that scans cryptocurrency tokens for security risks using GoPlus API and AI-powered analysis. Currently serving paying clients with 24/7 uptime.

## 🎯 What It Does

Helps crypto investors avoid rug pulls and scam tokens by providing instant security analysis through Telegram. Users simply send a contract address and get:
- Real-time security risk assessment
- AI-powered analysis with personality
- Detection of honeypots, unlocked liquidity, and malicious contracts
- Multi-chain support (Base, Ethereum, BSC, Polygon)

## 🚀 Features

- **24/7 Production Bot** - Running on Railway with paying clients
- **AI-Powered Analysis** - DeepSeek integration with 1930s detective character
- **Comprehensive Security Checks** - GoPlus API integration
- **Multi-Chain Support** - Base, Ethereum, BSC, Polygon, and more
- **Smart Rate Limiting** - Prevents API abuse
- **Professional Error Handling** - Graceful failures and user feedback

## 🛠️ Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js
- **Framework:** Telegraf (Telegram Bot API)
- **AI:** DeepSeek API (OpenAI-compatible)
- **Security API:** GoPlus Labs
- **Deployment:** Railway (serverless)
- **Version Control:** Git/GitHub

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/yourusername/eliza-goplus-poc.git
cd eliza-goplus-poc

# Install dependencies
npm install

# Build
npm run build

# Run locally
npm start
⚙️ Configuration
Create a .env file:
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_MODEL=deepseek-chat
🎮 Usage
In Telegram, message the bot:
/start - Get introduction
/audit <contract_address> - Scan a token
/about - Learn about RugPullatypus

Example:
/audit 0xdA07d02eCdBF2Bf8214a1B4B7B740755dae4C3Be
📊 What Gets Analyzed
Critical Security Checks:
Contract renounced status (owner gave up control?)
Liquidity locked (can LP be drained?)
Honeypot detection (can you sell after buying?)
Risk Factors:
Proxy contracts (upgradeable = risky)
Mint functions (unlimited supply?)
Hidden owners
Tax rates (buy/sell taxes)
Market Data:
Holder count
DEX listings
Liquidity supply
Total supply
📁 Project Structure
src/
├── telegram-bot-v2.ts    # Main bot logic & command handlers
├── scanner.ts            # GoPlus API integration
├── openai-service.ts     # AI analysis with character personality
├── rate-limiter.ts       # Rate limiting per user
└── types/                # TypeScript interfaces
🔒 Security Features
Environment variables for sensitive keys
Rate limiting per user (prevents spam)
Input validation on contract addresses
Graceful error handling
No data persistence (privacy-first)
🚀 Deployment
Deployed on Railway with automatic deployments from main branch:
Zero-downtime deployments
Environment variable management
Automatic HTTPS
24/7 uptime monitoring
🎨 Unique Features
Character-Driven UX:
Bot responses are delivered through a 1930s detective character ("RP") making security analysis engaging and memorable rather than dry technical reports.
Smart Verdict System:
Prioritized risk assessment that considers multiple factors:
Contract renounced + liquidity locked = safer
No liquidity + few holders = extreme danger
Not on DEX = cannot trade warning
📈 Results
Production Status: Live and serving paying clients
Uptime: 24/7 on Railway
Response Time: < 3 seconds per scan
Supported Chains: 5+ major networks
User Feedback: Accurate detection of scam tokens
🔮 Future Enhancements
Twitter/X integration for broader reach
Automated monitoring of token launches
Historical scan database
Batch scanning capability
Custom alert triggers
📄 License
MIT
👤 Author
Built by a Telegram bot developer specializing in crypto security tools and API integrations.
Contact: Available for bot development, API integrations, and automation projects.
🙏 Acknowledgments
GoPlus Labs for security API
Anthropic for AI capabilities
Base ecosystem for support
