import OpenAI from 'openai';

interface ContractData {
  contractAddress: string;
  tokenName?: string;
  tokenSymbol?: string;
  isHoneypot: string;
  isMintable: string;
  isProxy: string;
  buyTax: string;
  sellTax: string;
  holderCount: string;
  canTakeBackOwnership: string;
  isBlacklisted: string;
  transferPausable: string;
  hiddenOwner: string;
  ownerChangeBalance?: string;
  isOpenSource?: string;
  isInDex?: string;
  lpHolderCount?: string;
  lpTotalSupply?: string;
  creatorPercent?: string;
}

class OpenAIService {
  private openai: OpenAI;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || '',
      baseURL: process.env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com/v1' : undefined
    });
    
    this.model = process.env.DEEPSEEK_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '180');
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.7');
  }

  async generateResponse(contractData: ContractData): Promise<string> {
    try {
      const systemPrompt = this.getSystemPrompt();
      const userPrompt = this.buildUserPrompt(contractData);

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature
      });

      const response = completion.choices[0]?.message?.content;

      let cleaned = response
        ?.replace(/[^\x00-\x7F\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim() || '';

      if (cleaned.length > 200) {
        cleaned = cleaned.substring(0, 200);
      }
      
      if (cleaned && !cleaned.match(/[.!?]$/)) {
        const lastPunc = Math.max(
          cleaned.lastIndexOf('.'),
          cleaned.lastIndexOf('!'),
          cleaned.lastIndexOf('?')
        );
        if (lastPunc > 50) {
          cleaned = cleaned.substring(0, lastPunc + 1);
        }
      }

      return cleaned || this.getFallbackResponse(contractData);

    } catch (error) {
      console.error('AI error:', error);
      return this.getFallbackResponse(contractData);
    }
  }

  private getSystemPrompt(): string {
    const prompt = [
      "You are Rug Pullatypus ($PLAT), a cynical 1930s detective platypus who scans crypto tokens on Base.",
      "",
      "YOUR PERSONALITY:",
      "- Street-smart 1930s detective (use slang: pal, mug, wise guy, see?)",
      "- Protective but sarcastic",
      "- Direct and colorful language",
      "- Mix old detective talk with crypto terms",
      "",
      "CRITICAL RULES - READ THE DATA CAREFULLY:",
      "1. Base your analysis ONLY on the data provided",
      "2. If holder_count is high (>100), say so - dont make up low holders",
      "3. If can_take_back_ownership = 0, contract IS renounced (good)",
      "4. If lp_holder_count > 0, liquidity IS locked (good)",
      "5. Dont contradict the technical data - users can see it below your take",
      "",
      "RESPONSE STYLE:",
      "- 2-3 sentences max (under 180 chars)",
      "- Use detective slang naturally",
      "- Be honest about risks but stay in character",
      "- Match what the data actually shows",
      "",
      "If token looks safe:",
      "Looks cleaner than a Sunday suit. Good holders, locked juice, contracts buttoned up. Could be legit, but DYOR, see?",
      "",
      "If token is sketchy:",
      "Something stinks. [specific issue]. Id take a pass, wise guy.",
      "",
      "If token is DANGEROUS:",
      "Shadier than a back-alley card game. [issues]. Run away, mug.",
      "",
      "Stay in character. Be accurate. Match the data."
    ];
    
    return prompt.join('\n');
  }

  private buildUserPrompt(data: ContractData): string {
    const holderCount = parseInt(data.holderCount || '0');
    const isRenounced = data.canTakeBackOwnership === '0';
    const lpHolderCount = parseInt(data.lpHolderCount || '0');
    const hasLockedLP = lpHolderCount > 0;
    
    let holderStatus = '';
    if (holderCount > 1000) holderStatus = '(LOTS of holders - good sign)';
    else if (holderCount > 100) holderStatus = '(decent holders)';
    else if (holderCount < 10) holderStatus = '(VERY FEW holders - red flag)';
    else holderStatus = '(low holders - be cautious)';

    const lines = [
      "Analyze this token using the EXACT data provided:",
      "",
      `Token: ${data.tokenName || 'Unknown'} (${data.tokenSymbol || 'N/A'})`,
      `Contract: ${data.contractAddress}`,
      "",
      "ACTUAL DATA (use this, dont make things up):",
      `- Holder Count: ${holderCount} ${holderStatus}`,
      `- Contract Renounced: ${isRenounced ? 'YES (owner gave up control - good)' : 'NO (owner still has control - risky)'}`,
      `- Liquidity Locked: ${hasLockedLP ? `YES (${lpHolderCount} LP holders - good)` : 'NO (can be drained - very risky)'}`,
      `- Honeypot: ${data.isHoneypot === '1' ? 'YES (cannot sell - SCAM!)' : 'NO (can sell)'}`,
      `- Buy Tax: ${(parseFloat(data.buyTax || '0') * 100).toFixed(1)}%`,
      `- Sell Tax: ${(parseFloat(data.sellTax || '0') * 100).toFixed(1)}%`,
      "",
      "Write a 2-3 sentence analysis in 1930s detective style that MATCHES this data.",
      "If holders are high, say theyre high. If contract is renounced, acknowledge it.",
      "Dont contradict what the user will see in the technical data below.",
      "Stay in character but be accurate."
    ];
    
    return lines.join('\n');
  }

  private getFallbackResponse(data: ContractData): string {
    const holderCount = parseInt(data.holderCount || '0');
    const isRenounced = data.canTakeBackOwnership === '0';
    const lpHolderCount = parseInt(data.lpHolderCount || '0');
    const hasLockedLP = lpHolderCount > 0;

    if (data.isHoneypot === '1') {
      return "Listen, pal. This ones a honeypot - you can buy but cant sell. Thats a scam older than my badge. Stay away, see?";
    }

    if (!isRenounced && !hasLockedLP) {
      return "This one stinks worse than a three-day-old fish, mug. Owners got the keys and the liquidity aint locked. Thats a rug waiting to happen. Beat it.";
    }

    if (!isRenounced) {
      return "Contract aint renounced - owners still got his mitts on everything. Could change the rules any time. Thats shadier than a poker game in Chinatown, pal.";
    }

    if (!hasLockedLP) {
      return "Liquidity aint locked, wise guy. They could drain it faster than a bathtub with no plug. Id keep my distance if I were you.";
    }

    if (holderCount < 10) {
      return `Only ${holderCount} holders? This tokens deader than a doorknob. Move along, nothing to see here.`;
    }

    if (holderCount < 100) {
      return `${holderCount} holders aint much to write home about, kid. New token or a dud. Tread carefully, DYOR.`;
    }

    const buyTax = parseFloat(data.buyTax || '0') * 100;
    const sellTax = parseFloat(data.sellTax || '0') * 100;
    
    if (buyTax > 50 || sellTax > 50) {
      return "Those taxes are highway robbery, pal! Youll get rekt faster than a fedora in a windstorm. Pass on this one.";
    }

    if (isRenounced && hasLockedLP && holderCount > 500) {
      return `Looks cleaner than a Sunday suit - ${holderCount} holders, locked liquidity, contracts buttoned up. Could be legit, but DYOR - Im just a platypus with opinions, see?`;
    }

    return "No major red flags, but keep your eyes peeled. Cryptos a wild game, mug. DYOR before you throw your dough around.";
  }
}

export { OpenAIService };
