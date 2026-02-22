import 'dotenv/config';

interface TokenSecurityResult {
  is_open_source: string;
  is_proxy: string;
  is_mintable: string;
  owner_address: string;
  creator_address: string;
  can_take_back_ownership: string;
  owner_change_balance: string;
  hidden_owner: string;
  selfdestruct: string;
  external_call: string;
  buy_tax: string;
  sell_tax: string;
  is_honeypot: string;
  transfer_pausable: string;
  is_blacklisted: string;
  is_whitelisted: string;
  is_in_dex: string;
  holder_count: string;
  total_supply: string;
  dex?: Array<{
    name: string;
    liquidity: string;
    pair: string;
  }>;
}

interface GoPlusResponse {
  code: number;
  message: string;
  result: {
    [address: string]: TokenSecurityResult;
  };
}

export class TokenScanner {
  private baseUrl: string;
  private defaultChain: string;

  constructor() {
    this.baseUrl = process.env.GOPLUS_API_URL || 'https://api.gopluslabs.io/api/v1/token_security';
    this.defaultChain = process.env.DEFAULT_CHAIN_ID || '1';
  }

  /**
   * Scan a token contract for security risks
   */
  async scanToken(contractAddress: string, chainId?: string): Promise<TokenSecurityResult | null> {
    const chain = chainId || this.defaultChain;
    const url = `${this.baseUrl}/${chain}?contract_addresses=${contractAddress}`;

    try {
      console.log(`\n🔍 Scanning token: ${contractAddress} on chain ${chain}...`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as GoPlusResponse;

      if (data.code !== 1) {
        throw new Error(`API error: ${data.message}`);
      }

      const result = data.result[contractAddress.toLowerCase()];
      
      if (!result) {
        console.log('❌ No data found for this token');
        return null;
      }

      return result;

    } catch (error) {
      console.error('❌ Scan failed:', error);
      return null;
    }
  }

  /**
   * Format and display scan results
   */
  displayResults(result: TokenSecurityResult, contractAddress: string): void {
    console.log('\n' + '='.repeat(60));
    console.log(`📊 TOKEN SECURITY REPORT`);
    console.log('='.repeat(60));
    console.log(`Contract: ${contractAddress}\n`);

    // Critical Risk Factors
    console.log('🚨 CRITICAL RISK FACTORS:');
    console.log(`   Honeypot: ${this.formatRisk(result.is_honeypot)}`);
    console.log(`   Proxy Contract: ${this.formatRisk(result.is_proxy)}`);
    console.log(`   Mintable: ${this.formatRisk(result.is_mintable)}`);
    console.log(`   Self-Destruct: ${this.formatRisk(result.selfdestruct)}`);
    console.log(`   Hidden Owner: ${this.formatRisk(result.hidden_owner)}`);
    
    // Tax Information
    console.log('\n💰 TAX INFORMATION:');
    console.log(`   Buy Tax: ${this.formatTax(result.buy_tax)}`);
    console.log(`   Sell Tax: ${this.formatTax(result.sell_tax)}`);

    // Contract Features
    console.log('\n⚙️  CONTRACT FEATURES:');
    console.log(`   Open Source: ${this.formatBoolean(result.is_open_source)}`);
    console.log(`   Transfer Pausable: ${this.formatRisk(result.transfer_pausable)}`);
    console.log(`   Blacklist Function: ${this.formatRisk(result.is_blacklisted)}`);
    console.log(`   External Calls: ${this.formatRisk(result.external_call)}`);

    // Ownership
    console.log('\n👤 OWNERSHIP:');
    console.log(`   Owner: ${result.owner_address || 'Renounced'}`);
    console.log(`   Creator: ${result.creator_address || 'Unknown'}`);
    console.log(`   Can Take Back Ownership: ${this.formatRisk(result.can_take_back_ownership)}`);

    // Market Data
    console.log('\n📈 MARKET DATA:');
    console.log(`   Holder Count: ${result.holder_count || 'Unknown'}`);
    console.log(`   Total Supply: ${result.total_supply || 'Unknown'}`);
    console.log(`   Listed on DEX: ${this.formatBoolean(result.is_in_dex)}`);

    if (result.dex && result.dex.length > 0) {
      console.log('\n💱 DEX LISTINGS:');
      result.dex.forEach((dex, index) => {
        console.log(`   ${index + 1}. ${dex.name}`);
        console.log(`      Liquidity: ${dex.liquidity || 'Unknown'}`);
        console.log(`      Pair: ${dex.pair || 'Unknown'}`);
      });
    }

    // Risk Summary
    console.log('\n' + '='.repeat(60));
    console.log(this.getRiskSummary(result));
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Format risk values with color coding
   */
  private formatRisk(value: string): string {
    if (value === '1') return '🔴 YES (HIGH RISK)';
    if (value === '0') return '🟢 NO';
    return '⚪ UNKNOWN';
  }

  /**
   * Format boolean values
   */
  private formatBoolean(value: string): string {
    if (value === '1') return '✅ YES';
    if (value === '0') return '❌ NO';
    return '⚪ UNKNOWN';
  }

  /**
   * Format tax percentage
   */
  private formatTax(value: string): string {
    if (!value || value === '0') return '0%';
    const taxPercent = (parseFloat(value) * 100).toFixed(2);
    const numTax = parseFloat(taxPercent);
    
    if (numTax > 10) return `🔴 ${taxPercent}% (HIGH)`;
    if (numTax > 5) return `🟡 ${taxPercent}% (MEDIUM)`;
    return `🟢 ${taxPercent}%`;
  }

  /**
   * Generate overall risk summary
   */
  private getRiskSummary(result: TokenSecurityResult): string {
    let riskScore = 0;
    let warnings: string[] = [];

    if (result.is_honeypot === '1') {
      riskScore += 10;
      warnings.push('HONEYPOT DETECTED');
    }
    if (result.is_proxy === '1') {
      riskScore += 3;
      warnings.push('Proxy contract (upgradeable)');
    }
    if (result.is_mintable === '1') {
      riskScore += 2;
      warnings.push('Mintable (supply can increase)');
    }
    if (result.hidden_owner === '1') {
      riskScore += 3;
      warnings.push('Hidden owner detected');
    }
    if (parseFloat(result.buy_tax || '0') > 0.1) {
      riskScore += 2;
      warnings.push(`High buy tax (${(parseFloat(result.buy_tax) * 100).toFixed(1)}%)`);
    }
    if (parseFloat(result.sell_tax || '0') > 0.1) {
      riskScore += 2;
      warnings.push(`High sell tax (${(parseFloat(result.sell_tax) * 100).toFixed(1)}%)`);
    }
    if (result.transfer_pausable === '1') {
      riskScore += 2;
      warnings.push('Transfers can be paused');
    }
    if (result.is_blacklisted === '1') {
      riskScore += 2;
      warnings.push('Has blacklist function');
    }

    let summary = '';
    if (riskScore >= 10) {
      summary = '🔴 EXTREME RISK - DO NOT INVEST';
    } else if (riskScore >= 5) {
      summary = '🟡 HIGH RISK - Proceed with extreme caution';
    } else if (riskScore >= 2) {
      summary = '🟠 MEDIUM RISK - DYOR required';
    } else {
      summary = '🟢 LOW RISK - Standard precautions apply';
    }

    if (warnings.length > 0) {
      summary += '\n\n⚠️  Warnings:\n   • ' + warnings.join('\n   • ');
    }

    return summary;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('\n❌ Usage: pnpm audit <contract_address> [chain_id]');
    console.log('\nExamples:');
    console.log('  pnpm audit 0xdac17f958d2ee523a2206206994597c13d831ec7');
    console.log('  pnpm audit 0xdac17f958d2ee523a2206206994597c13d831ec7 1');
    console.log('\nChain IDs:');
    console.log('  1   = Ethereum');
    console.log('  56  = BSC');
    console.log('  137 = Polygon\n');
    process.exit(1);
  }

  const scanner = new TokenScanner();
  const [contractAddress, chainId] = args;

  scanner.scanToken(contractAddress, chainId).then((result) => {
    if (result) {
      scanner.displayResults(result, contractAddress);
    } else {
      console.log('\n❌ Failed to retrieve token data\n');
    }
  });
}
