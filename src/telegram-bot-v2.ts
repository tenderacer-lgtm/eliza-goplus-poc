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
