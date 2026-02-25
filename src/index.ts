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

  if (usdt && !usdt.error) {
    console.log('\n✅ Scan successful!');
    console.log('Token:', usdt.token_name);
    console.log('Symbol:', usdt.token_symbol);
    console.log('Honeypot:', usdt.is_honeypot === '1' ? '🔴 YES' : '🟢 NO');
    console.log('Holders:', usdt.holder_count);
  } else {
    console.log('❌ Scan failed:', usdt?.error || 'Unknown error');
  }

  console.log('\n✅ PoC Complete!\n');
}

main().catch(console.error);
