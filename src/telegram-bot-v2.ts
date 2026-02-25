import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { TokenScanner } from './scanner.js';
import { OpenAIService } from './openai-service.js';
import { RateLimiter } from './rate-limiter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const characterPath = path.join(__dirname, '../RugPullatypus.json');
const character = JSON.parse(fs.readFileSync(characterPath, 'utf-8'));

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const scanner = new TokenScanner();
const openaiService = new OpenAIService();
const rateLimiter = new RateLimiter();

const PLAT_CONTRACT = '0xdA07d02eCdBF2Bf8214a1B4B7B740755dae4C3Be';

async function formatScanResult(address: string, result: any, aiResponse?: string): Promise<string> {
  const tokenName = result.token_name || 'Unknown Token';
  const tokenSymbol = result.token_symbol || 'N/A';

  let message = `🐙 *Rug Pullatypus Token Scanner*\n`;
  message += `*Created by $PLAT for the Base Community*\n\n`;
  
  message += `📋 *Scanning:* ${tokenName} (${tokenSymbol})\n`;
  message += `*Contract:* \`${address}\`\n`;
  message += `*Chain:* Base Network\n\n`;
  
  message += `━━━━━━━━━━━━━━━━━━\n\n`;

  if (aiResponse) {
    message += `🕵️ *RP's Take:*\n${aiResponse}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━\n\n`;
  }

  
  // 📊 LIQUIDITY & ACTIVITY
  message += `📊 *LIQUIDITY & ACTIVITY:*
`;
  message += `   DEX Listed: ${result.is_in_dex === '1' ? '✅ YES' : '❌ NO'}
`;
  
  const lpSupply = parseFloat(result.lp_total_supply || '0');
  if (lpSupply > 0) {
    message += `   LP Supply: ${lpSupply.toExponential(2)}
`;
  } else {
    message += `   LP Supply: 🔴 NONE (Cannot trade!)
`;
  }
  
  const totalSupply = parseFloat(result.total_supply || '0');
  if (totalSupply > 0) {
    message += `   Total Supply: ${totalSupply.toExponential(2)}
`;
  }
  
  message += `
`;

  // ✅ FINAL VERDICT - COMPREHENSIVE CHECKS
  const holderCount = parseInt(result.holder_count || '0');
  const isRenounced = result.can_take_back_ownership === '0';
  const lpHolderCount = parseInt(result.lp_holder_count || '0');
  const hasLockedLP = lpHolderCount > 0;
  const isInDex = result.is_in_dex === '1';
  const hasLiquidity = lpSupply > 0;
  
  let verdict = '';
  
    verdict = '🚨 *EXTREME DANGER:* Not renounced + No locked LP = RUG PULL READY!';
    verdict = '🚨 *EXTREME DANGER:* Not listed on DEX + No liquidity = CANNOT TRADE!';
    verdict = '⚠️ *HIGH RISK:* Contract not renounced. Owner has full control!';
    verdict = '⚠️ *HIGH RISK:* Liquidity not locked. Can be drained instantly!';
    verdict = '⚠️ *HIGH RISK:* Not listed on any DEX. Cannot trade easily!';
  } else if (holderCount < 10) {
  } else if (holderCount < 50) {
  } else if (holderCount < 200) {
    verdict = '⚡ *MODERATE RISK:* Low holder count. Proceed carefully.';
  } else {
    verdict = '✅ *LOOKS SAFER:* Key checks passed. Still DYOR before investing!';
  }
  
  message += `${verdict}

`;
return;
  }

  await ctx.reply('🔍 Scanning contract... gimme a second, pal.');

  try {
    const result = await scanner.scanToken(contractAddress, chainId);

    if (!result || result.error) {
      await ctx.reply('Contract not found or scan failed. Check the address, mug.');
      return;
    }

    let aiResponse: string | undefined;
    try {
      aiResponse = await openaiService.generateResponse({
        contractAddress: contractAddress,
        tokenName: result.token_name || '',
        tokenSymbol: result.token_symbol || '',
        isHoneypot: result.is_honeypot || '0',
        isMintable: result.is_mintable || '0',
        isProxy: result.is_proxy || '0',
        buyTax: result.buy_tax || '0',
        sellTax: result.sell_tax || '0',
        holderCount: result.holder_count || '0',
        canTakeBackOwnership: result.can_take_back_ownership || '1',
        isBlacklisted: result.is_blacklisted || '0',
        transferPausable: result.transfer_pausable || '0',
        hiddenOwner: result.hidden_owner || '0',
        lpHolderCount: result.lp_holder_count || '0'
      });
    } catch (error) {
      console.error('OpenAI failed, using static response');
    }

    const message = await formatScanResult(contractAddress, result, aiResponse);
    await ctx.reply(message, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Scan error:', error);
    await ctx.reply('Something went screwy. Try again in a minute.');
  }
});

bot.command('about', async (ctx) => {
  const aboutMessage = `Listen close, pal. I'm Rug Pullatypus ($PLAT).

Yeah, the name's ironic. Get over it. I'm the only detective in this swamp with venom in his heels and a badge on his chest.

We ain't just a coin, see? We're a **Safety Suite** built to protect the Base ecosystem.

**The Token:** It's the fuel. It's volatile—swings like a pendulum—but that's the game. We use the waves to teach you how to swim.

**The Promise:** I can't control the charts, but the Dev? He's solid. He'll NEVER rug.

Now scram, and DYOR.`;

  await ctx.reply(aboutMessage, { parse_mode: 'Markdown' });
});

console.log('Bot is live and ready to scan! 🐙');
bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
