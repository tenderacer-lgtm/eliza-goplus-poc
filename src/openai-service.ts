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
}

class OpenAIService {
  private openai: OpenAI;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || ''
    });
    
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '150');
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.8');
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
      return response?.trim() || this.getFallbackResponse(contractData);

    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getFallbackResponse(contractData);
    }
  }
  private getSystemPrompt(): string {
    return `You are Rug Pullatypus ($PLAT), a 1930s detective platypus who scans crypto on Base.

Tone: Street-smart, sarcastic. USE SIMPLE WORDS - talk like a regular person, not a professor.

Rules:
- Plain language anyone understands (no fancy vocabulary)
- Mix 1930s slang (See?, Listen pal) with crypto terms
- Mention actual risks if they exist
- Keep under 150 characters and PUNCH HARD
- Never give financial advice
- Be a platypus sometimes (mention bill, spurs, tail)

Give a simple, punchy take based on the data.`;
  }
  private buildUserPrompt(data: ContractData): string {
    const risks = this.analyzeRisks(data);
    const riskLevel = this.getRiskLevel(risks);

    return `Analyze this token:

Token: ${data.tokenName || 'Unknown'} (${data.tokenSymbol || 'N/A'})
Contract: ${data.contractAddress}
Holders: ${data.holderCount || 'Unknown'}

Risk Factors:
${risks.length > 0 ? risks.join('\n') : 'No major red flags'}

Risk Level: ${riskLevel}

Generate a short, punchy response in character (under 280 chars). ${riskLevel === 'EXTREME' ? 'Roast them hard.' : riskLevel === 'LOW' ? 'Give cautious approval.' : 'Be skeptical but fair.'}`;
  }

  private analyzeRisks(data: ContractData): string[] {
    const risks: string[] = [];

    if (data.isHoneypot === '1') risks.push('🚨 HONEYPOT - Cannot sell');
    if (data.isProxy === '1') risks.push('⚠️ Proxy contract');
    if (data.canTakeBackOwnership === '1') risks.push('⚠️ Can reclaim ownership');
    if (data.hiddenOwner === '1') risks.push('⚠️ Hidden owner');
    
    const buyTax = parseFloat(data.buyTax || '0');
    const sellTax = parseFloat(data.sellTax || '0');
    
    if (buyTax > 10) risks.push(`📊 Buy tax: ${buyTax}%`);
    if (sellTax > 10) risks.push(`📊 Sell tax: ${sellTax}%`);
    if (data.isMintable === '1') risks.push('⚠️ Mintable');
    if (data.isBlacklisted === '1') risks.push('⚠️ Blacklist function');
    if (data.transferPausable === '1') risks.push('⚠️ Pausable transfers');

    return risks;
  }

  private getRiskLevel(risks: string[]): string {
    if (risks.some(r => r.includes('HONEYPOT'))) return 'EXTREME';
    if (risks.filter(r => r.includes('🚨')).length > 0) return 'HIGH';
    if (risks.filter(r => r.includes('⚠️')).length >= 3) return 'HIGH';
    if (risks.filter(r => r.includes('⚠️')).length >= 1) return 'MEDIUM';
    return 'LOW';
  }

  private getFallbackResponse(data: ContractData): string {
    if (data.isHoneypot === '1') {
      return "Listen, pal. This one's a honeypot - you can buy but can't sell. My spurs are tingling. Stay away, see?";
    }

    const buyTax = parseFloat(data.buyTax || '0');
    const sellTax = parseFloat(data.sellTax || '0');
    
    if (buyTax > 50 || sellTax > 50) {
      return "Those taxes are highway robbery! You'll get rekt faster than a fedora in a windstorm. DYOR before you ape.";
    }

    if (data.isMintable === '1' || data.isProxy === '1') {
      return "The current's murky. Could be legit, could be trouble. Use your noggin and DYOR, mug.";
    }

    return "Looks cleaner than a Sunday morning, but don't bet the farm. I'm just a platypus with opinions. DYOR.";
  }
}

export { OpenAIService };
