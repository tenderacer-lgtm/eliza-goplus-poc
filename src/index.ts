import 'dotenv/config';
import { TokenScanner } from './scanner.js';

async function main() {
  console.log('\n🤖 ElizaOS Token Scanner PoC\n');
  console.log('='.repeat(60));
  
  const scanner = new TokenScanner();

  // Test with USDT (known good token)
  console.log('\n📝 Test 1: Scanning USDT (Ethereum)');
  console.log('This is a known legitimate token for baseline comparison');
  
  const usdt = await scanner.scanToken('0xdac17f958d2ee523a2206206994597c13d831ec7', '1');
  
  if (usdt) {
    scanner.displayResults(usdt, '0xdac17f958d2ee523a2206206994597c13d831ec7');
  }

  // You can add more test tokens here
  console.log('\n✅ PoC Complete!');
  console.log('\nTo scan custom tokens, run:');
  console.log('  pnpm audit <contract_address> [chain_id]\n');
}

main().catch(console.error);
