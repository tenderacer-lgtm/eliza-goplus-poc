# ElizaOS + GoPlus Token Scanner PoC

A proof-of-concept demonstrating ElizaOS integration with GoPlus Labs token security API.

## Features

- ✅ Real-time token contract security analysis
- ✅ Detects honeypots, high taxes, and malicious patterns
- ✅ Multi-chain support (Ethereum, BSC, Polygon, etc.)
- ✅ Clean, modular code structure
- ✅ Terminal-based output with risk indicators

## Quick Start

```bash
# Install dependencies
pnpm install

# Run the demo
pnpm dev

# Scan a specific token
pnpm audit <contract_address> [chain_id]
Examples
# Scan USDT on Ethereum
pnpm audit 0xdac17f958d2ee523a2206206994597c13d831ec7

# Scan token on BSC
pnpm audit 0x... 56

# Scan token on Polygon
pnpm audit 0x... 137
Chain IDs
1 - Ethereum
56 - Binance Smart Chain
137 - Polygon
42161 - Arbitrum
10 - Optimism
What Gets Checked
Critical Risks
Honeypot detection
Proxy contracts (upgradeable)
Mint functions
Self-destruct capability
Hidden owners
Tax Analysis
Buy tax percentage
Sell tax percentage
Contract Features
Open source verification
Transfer pause capability
Blacklist functions
External calls
Ownership
Owner address
Creator address
Ownership transfer ability
Market Data
Holder count
Total supply
DEX listings
Liquidity data
API Reference
TokenScanner Class
const scanner = new TokenScanner();

// Scan a token
const result = await scanner.scanToken(contractAddress, chainId);

// Display formatted results
scanner.displayResults(result, contractAddress);
Risk Scoring
🔴 EXTREME RISK (10+): Do not invest
🟡 HIGH RISK (5-9): Extreme caution
🟠 MEDIUM RISK (2-4): DYOR required
🟢 LOW RISK (0-1): Standard precautions
Tech Stack
ElizaOS (AI agent framework)
GoPlus Labs API (token security)
TypeScript
Node.js
Notes
GoPlus API is free for basic usage (no API key required)
Some chains may have rate limits
Always verify results independently
Next Steps
This PoC demonstrates core functionality. Production version would include:
Telegram bot integration
Database for scan history
Webhook alerts
Multi-token batch scanning
Custom risk scoring rules
Integration with other security APIs
License
MIT
---

## 🔨 BUILD & TEST

```bash
# Install all dependencies
pnpm install

# Test the scanner directly
pnpm audit 0xdac17f958d2ee523a2206206994597c13d831ec7

# Run the full demo
pnpm dev

# Build for production
pnpm build
🐛 DEBUGGING CHECKLIST
If you get module errors:
# Clear cache
rm -rf node_modules pnpm-lock.yaml
pnpm install
If TypeScript complains:
# Check tsconfig
npx tsc --noEmit

# Run with tsx directly
npx tsx src/scanner.ts 0xdac17f958d2ee523a2206206994597c13d831ec7
If fetch is not defined:
# Make sure you're on Node 18+
node --version

# If < 18, install node-fetch
pnpm add node-fetch
# Then import it in scanner.ts
If GoPlus API fails:
# Test the API directly
curl "https://api.gopluslabs.io/api/v1/token_security/1?contract_addresses=0xdac17f958d2ee523a2206206994597c13d831ec7"
