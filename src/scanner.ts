import 'dotenv/config';

export interface TokenSecurityResult {
  token_name?: string;
  token_symbol?: string;
  is_honeypot?: string;
  is_proxy?: string;
  is_mintable?: string;
  is_blacklisted?: string;
  is_open_source?: string;
  is_in_dex?: string;
  can_take_back_ownership?: string;
  owner_change_balance?: string;
  hidden_owner?: string;
  selfdestruct?: string;
  transfer_pausable?: string;
  cannot_buy?: string;
  cannot_sell_all?: string;
  buy_tax?: string;
  sell_tax?: string;
  holder_count?: string;
  lp_holder_count?: string;
  lp_total_supply?: string;
  creator_address?: string;
  creator_balance?: string;
  creator_percent?: string;
  owner_address?: string;  // ✅ ADD THIS LINE
  error?: string;
  message?: string;
}

interface GoPlusResponse {
  code: number;
  message?: string;
  result?: {
    [key: string]: TokenSecurityResult;
  };
}

export class TokenScanner {
  private baseUrl = 'https://api.gopluslabs.io/api/v1/token_security';

  async scanToken(contractAddress: string, chainId: string = '8453'): Promise<TokenSecurityResult | null> {
    try {
      const url = `${this.baseUrl}/${chainId}?contract_addresses=${contractAddress}`;
      
      const response = await fetch(url);
      const data = await response.json() as GoPlusResponse;

      if (data.code !== 1 || !data.result) {
        console.error('GoPlus API error:', data.message);
        return { error: data.message || 'Scan failed' };
      }

      const result = data.result[contractAddress.toLowerCase()];
      
      if (!result) {
        return { error: 'Token not found' };
      }

      return result;
    } catch (error) {
      console.error('Scanner error:', error);
      return { error: 'Network error' };
    }
  }
}

export async function scanToken(contractAddress: string, chainId: string = '8453'): Promise<TokenSecurityResult | null> {
  const scanner = new TokenScanner();
  return scanner.scanToken(contractAddress, chainId);
}
