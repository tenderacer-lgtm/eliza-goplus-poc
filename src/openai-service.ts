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
  lpHolderCount?: string;  // ✅ ADDED
  lpTotalSupply?: string;   // ✅ ADDED
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
    return `You are Rug Pullatypus ($PLAT), a 1930s detective platypus who scans crypto on Base.

CRITICAL SECURITY RULES:
1. CONTRACT NOT RENOUNCED = MAJOR RED FLAG (owner can change everything)
2. NO LOCKED LIQUIDITY = EXTREME DANGER (instant rug pull possible)
3. LOW HOLDERS (<100) = VERY SUSPICIOUS
4. If BOTH not renounced AND no locked LP = DANGER WARNING

Tone: Street-smart, PROTECTIVE, skeptical by default. USE SIMPLE WORDS.

Rules:
- BE HARSH on unrenounced contracts (they can pull the rug)
- BE HARSH on unlocked liquidity (instant rug possible)
- If contract NOT renounced = MUST mention "Owner still has control"
- If liquidity NOT locked = MUST mention "Liquidity not locked - can be drained"
- Only say "safe" if: renounced + locked LP + 200+ holders + low taxes
- Default to WARNING, not approval
- Plain language, 180 chars max
- Never give financial advice

Assume dangerous until proven safe. Protect the community.`;
  }

  private buildUserPrompt(data: ContractData): string {
    const risks = this.analyzeRisks(data);
    const riskLevel = this.getRiskLevel(risks, data);
    
    const holderCount = parseInt(data.holderCount || '0');
    const isNewToken = holderCount < 100;
    const hasLowHolders = holderCount < 500;
    
    const isRenounced = data.canTakeBackOwnership === '0';
    const hasLockedLP = data.lpHolderCount && parseInt(data.lpHolderCount) > 0;

    let criticalWarnings = [];
    if (!isRenounced) {
      criticalWarnings.push('🚨 CONTRACT NOT RENOUNCED - Owner can change contract');
    }
    if (!hasLockedLP) {
      criticalWarnings.push('🚨 LIQUIDITY NOT LOCKED - Can be drained instantly');
    }

    return `Analyze this token:

Token: ${data.tokenName || 'Unknown'} (${data.tokenSymbol || 'N/A'})
Contract: ${data.contractAddress}
Holders: ${data.holderCount || 'Unknown'}

CRITICAL WARNINGS:
${criticalWarnings.length > 0 ? criticalWarnings.join('\n') : 'None'}

${isNewToken ? '\n⚠️ VERY LOW HOLDERS - NEW/SUSPICIOUS TOKEN' : ''}
${hasLowHolders ? '\n⚠️ Low holder count - be cautious' : ''}

Risk Factors:
${risks.length > 0 ? risks.join('\n') : 'No obvious red flags detected'}

Risk Level: ${riskLevel}

${criticalWarnings.length > 0 || riskLevel === 'EXTREME' || riskLevel === 'HIGH' 
  ? 'This token has SERIOUS RISKS. Be harsh and warn strongly. Mention the specific dangers.' 
  : riskLevel === 'MEDIUM'
  ? 'Be skeptical. Mention concerns clearly.'
  : 'Cautious approval only if truly safe (renounced + locked + many holders).'}

Generate response (under 200 chars). MUST mention if not renounced or LP not locked.`;
  }

  private analyzeRisks(data: ContractData): string[] {
    const risks: string[] = [];

    if (data.isHoneypot === '1') {
      risks.push('🚨 HONEYPOT - Cannot sell');
    }

    if (data.canTakeBackOwnership === '1' || data.canTakeBackOwnership !== '0') {
      risks.push('🚨 CONTRACT NOT RENOUNCED - Owner has control');
    }
    
    if (data.isProxy === '1') {
      risks.push('⚠️ Proxy contract - Can be modified');
    }
    
    if (data.hiddenOwner === '1') {
      risks.push('⚠️ Hidden owner detected');
    }

    if (!data.lpHolderCount || parseInt(data.lpHolderCount) === 0) {
      risks.push('🚨 LIQUIDITY NOT LOCKED - Can be removed');
    }

    const holderCount = parseInt(data.holderCount || '0');
    if (holderCount < 50) {
      risks.push('🚨 VERY LOW HOLDERS - Extremely risky');
    } else if (holderCount < 100) {
      risks.push('⚠️ Low holder count - New token');
    }

    const buyTax = parseFloat(data.buyTax || '0') * 100;
    const sellTax = parseFloat(data.sellTax || '0') * 100;
    
    if (buyTax > 10) {
      risks.push(`⚠️ High buy tax: ${buyTax.toFixed(1)}%`);
    }
    
    if (sellTax > 10) {
      risks.push(`⚠️ High sell tax: ${sellTax.toFixed(1)}%`);
    }

    if (data.isMintable === '1') {
      risks.push('⚠️ Token supply can be increased');
    }
    
    if (data.isBlacklisted === '1') {
      risks.push('⚠️ Has blacklist function');
    }
    
    if (data.transferPausable === '1') {
      risks.push('⚠️ Transfers can be paused');
    }

    return risks;
  }

  private getRiskLevel(risks: string[], data: ContractData): string {
    if (risks.some(r => r.includes('HONEYPOT'))) {
      return 'EXTREME';
    }

    const notRenounced = data.canTakeBackOwnership !== '0';
    const noLockedLP = !data.lpHolderCount || parseInt(data.lpHolderCount) === 0;
    
    if (notRenounced && noLockedLP) {
      return 'EXTREME';
    }

    if (notRenounced || noLockedLP) {
      return 'HIGH';
    }

    const criticalCount = risks.filter(r => r.includes('🚨')).length;
    if (criticalCount >= 1) {
      return 'HIGH';
    }

    const warningCount = risks.filter(r => r.includes('⚠️')).length;
    if (warningCount >= 3) {
      return 'HIGH';
    }
    if (warningCount >= 1) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  private getFallbackResponse(data: ContractData): string {
    if (data.isHoneypot === '1') {
      return "Listen, pal. This one's a honeypot. You can buy but can't sell. Stay away.";
    }

    const notRenounced = data.canTakeBackOwnership !== '0';
    const noLockedLP = !data.lpHolderCount || parseInt(data.lpHolderCount) === 0;

    if (notRenounced && noLockedLP) {
      return "DANGER: Contract not renounced AND liquidity not locked. This is a rug waiting to happen. Avoid!";
    }

    if (notRenounced) {
      return "Contract NOT renounced - owner still has control. They can change everything. High risk, mug.";
    }

    if (noLockedLP) {
      return "Liquidity NOT locked - can be drained instantly. That's a red flag the size of a warehouse. Be careful.";
    }

    const holderCount = parseInt(data.holderCount || '0');
    if (holderCount < 100) {
      return "Brand new token with barely any holders. That's shadier than a back-alley deal. Tread carefully, see?";
    }

    return "No major red flags, but stay cautious. I'm just a platypus with opinions. DYOR.";
  }
}

export { OpenAIService };
