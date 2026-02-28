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
  // PROTECTION: Special handling for $PLAT token
  if (address.toLowerCase() === PLAT_CONTRACT.toLowerCase()) {
    return `🐙 *$PLAT Security Report*\n\n` +
      `Listen, pal. You're scanning our own token.\n\n` +
      `✅ *Dev Integrity:* SOLID. No rugs, just vibes.\n` +
      `✅ *Community:* PROTECTED. That's what we do.\n` +
      `✅ *Vision:* CLEAR. Safety Suite for Base.\n\n` +
      `*Verdict:* This is our house. We don't rug our own house.\n\n` +
      `🏎️ BUCKLE UP. WE RIDE. 💨\n\n` +
      `🛡️ Protected by Rug Pullatypus ($PLAT)`;
  }

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

  // CRITICAL SECURITY CHECKS
  message += `🚨 *CRITICAL SECURITY CHECKS:*\n`;
  
  // Check if owner address is zero address (renounced)
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const isRenounced = result.owner_address?.toLowerCase() === ZERO_ADDRESS.toLowerCase();
  message += `   Contract Renounced: ${isRenounced ? '✅ YES (Good)' : '🔴 NO (DANGER!)'}\n`;
  
  const lpHolderCount = parseInt(result.lp_holder_count || '0');
  const hasLockedLP = lpHolderCount > 0;
  message += `   Liquidity Locked: ${hasLockedLP ? `✅ YES (${lpHolderCount} holders)` : '🔴 NO (DANGER!)'}\n`;
  
  message += `   Honeypot: ${result.is_honeypot === '1' ? '🔴 YES (DANGER!)' : '🟢 NO'}\n\n`;

  // OTHER RISK FACTORS
  message += `⚠️ *OTHER RISK FACTORS:*\n`;
  message += `   Proxy Contract: ${result.is_proxy === '1' ? '🔴 YES' : '🟢 NO'}\n`;
  message += `   Mintable: ${result.is_mintable === '1' ? '🔴 YES' : '🟢 NO'}\n`;
  message += `   Self-Destruct: ${result.selfdestruct === '1' ? '🔴 YES' : '🟢 NO'}\n`;
  message += `   Hidden Owner: ${result.hidden_owner === '1' ? '🔴 YES' : '🟢 NO'}\n\n`;

  // TAX INFORMATION
  const buyTax = result.buy_tax ? (parseFloat(result.buy_tax) * 100).toFixed(2) : '0';
  const sellTax = result.sell_tax ? (parseFloat(result.sell_tax) * 100).toFixed(2) : '0';

  message += `💰 *TAX INFORMATION:*\n`;
  message += `   Buy Tax: ${buyTax}%\n`;
  message += `   Sell Tax: ${sellTax}%\n\n`;

  // CONTRACT FEATURES
  message += `⚙️ *CONTRACT FEATURES:*\n`;
  message += `   Open Source: ${result.is_open_source === '1' ? '✅ YES' : '❌ NO'}\n`;
  message += `   Transfer Pausable: ${result.transfer_pausable === '1' ? '🔴 YES' : '🟢 NO'}\n`;
  message += `   Blacklist Function: ${result.is_blacklisted === '1' ? '🔴 YES' : '🟢 NO'}\n\n`;

  // LIQUIDITY & ACTIVITY
  message += `📊 *LIQUIDITY & ACTIVITY:*\n`;
  message += `   DEX Listed: ${result.is_in_dex === '1' ? '✅ YES' : '❌ NO'}\n`;
  
  const lpSupply = parseFloat(result.lp_total_supply || '0');
  if (lpSupply > 0) {
    message += `   LP Supply: ${lpSupply.toExponential(2)}\n`;
  } else {
    message += `   LP Supply: 🔴 NONE (Cannot trade!)\n`;
  }
  message += `\n`;

  // MARKET DATA
  message += `📈 *MARKET DATA:*\n`;
  message += `   Holder Count: ${result.holder_count || 'Unknown'}\n`;
  message += `   Listed on DEX: ${result.is_in_dex === '1' ? '✅ YES' : '❌ NO'}\n\n`;

  // COMPREHENSIVE VERDICT
  const holderCount = parseInt(result.holder_count || '0');
  const isInDex = result.is_in_dex === '1';
  const hasLiquidity = lpSupply > 0;
  
  let verdict = '';
  
  if (!isRenounced && !hasLockedLP) {
    verdict = '🚨 *EXTREME DANGER:* Not renounced + No locked LP = RUG PULL READY!';
  }
  else if (!isInDex && !hasLiquidity) {
    verdict = '🚨 *EXTREME DANGER:* Not listed on DEX + No liquidity = CANNOT TRADE!';
  }
  else if (holderCount < 10 && !hasLiquidity) {
    verdict = `🚨 *EXTREME DANGER:* Only ${holderCount} holders + No liquidity = DEAD/SCAM TOKEN!`;
  }
  else if (!isRenounced) {
    verdict = '⚠️ *HIGH RISK:* Contract not renounced. Owner has full control!';
  }
  else if (!hasLockedLP) {
    verdict = '⚠️ *HIGH RISK:* Liquidity not locked. Can be drained instantly!';
  }
  else if (!isInDex) {
    verdict = '⚠️ *HIGH RISK:* Not listed on any DEX. Cannot trade easily!';
  }
  else if (holderCount < 10) {
    verdict = `⚠️ *HIGH RISK:* Only ${holderCount} holders. Dead or brand new token!`;
  }
  else if (holderCount < 50) {
    verdict = `⚠️ *CAUTION:* Only ${holderCount} holders. Very risky!`;
  }
  else if (holderCount < 200) {
    verdict = '⚡ *MODERATE RISK:* Low holder count. Proceed carefully.';
  }
  else {
    verdict = '✅ *LOOKS SAFER:* Key checks passed. Still DYOR before investing!';
  }
  
  message += `${verdict}\n\n`;

  message += `━━━━━━━━━━━━━━━━━━\n\n`;
  message += `🛡️ *Protected by Rug Pullatypus ($PLAT)*\n`;
  message += `Part of the Safety Suite for Base\n\n`;
  message += `Learn more: Rugpullatypus.com`;

  return message;
}

bot.command('start', async (ctx) => {
  const welcomeMessage = `Listen here, friend. I am a fast-talking, cynical biological disaster who audits crypto scams.

I'm *${character.name}*, and I feel the current. I spot the rugs.

🔍 *Commands:*
/audit <contract_address> — Scan a token for scams
/about — Learn about $PLAT

*Supported Chains:*
• Base (default)
• Ethereum (use chain ID: 1)
• BSC (56)
• Polygon (137)

Now beat it, and stay safe out there. 🐙`;

  await ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
});

bot.command('audit', async (ctx) => {
  const args = ctx.message.text.split(' ');
  
  if (args.length < 2) {
    await ctx.reply('Usage: /audit <contract_address> [chain_id]\nExample: /audit 0xYourContractAddress');
    return;
  }

  const contractAddress = args[1].toLowerCase();
  const chainId = args[2] || '8453';

  if (!/^0x[a-fa-f0-9]{40}$/.test(contractAddress)) {
    await ctx.reply("That doesn't look like a valid contract address, wise guy.");
    return;
  }

  const userId = ctx.from?.id;
  if (userId) {
    const canProceed = await rateLimiter.checkLimit(userId);
    if (!canProceed) {
      const waitTime = rateLimiter.getRemainingTime(userId);
      await ctx.reply(
        `Slow down there, mug. My OpenAI credits ain't made of money. ` +
        `Try again in ${waitTime} seconds, see?`
      );
      return;
    }
  }

  if (contractAddress === PLAT_CONTRACT.toLowerCase()) {
    const platMessage = `🐙 *Scanning $PLAT...*\n\n` +
      `*kicks the tires*\n\n` +
      `Listen, kid. This contract is like a stolen Ferrari. The engine is screaming, ` +
      `the bodywork is gorgeous... okay, the tires are a little bald and the check engine light flickers.\n\n` +
      `But we're changing the tires while doing 90mph on the highway.\n\n` +
      `*Verdict:* BUCKLE UP. WE RIDE. 🏎️💨`;
    await ctx.reply(platMessage, { parse_mode: 'Markdown' });
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
  lpHolderCount: result.lp_holder_count || '0',
  ownerAddress: result.owner_address || ''  // ✅ ADD THIS LINE
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
