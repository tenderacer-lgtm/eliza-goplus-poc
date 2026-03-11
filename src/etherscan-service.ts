import 'dotenv/config';

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
const BASE_ETHERSCAN_URL = 'https://api.basescan.org/api';

export interface DeployerHistory {
  totalDeployments: number;
  recentContracts: string[];
  suspiciousPattern: boolean;
}

export class EtherscanService {
  
  async getDeployerHistory(deployerAddress: string): Promise<DeployerHistory> {
    try {
      // Get all transactions from this deployer
      const url = `${BASE_ETHERSCAN_URL}?module=account&action=txlist&address=${deployerAddress}&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== '1' || !data.result) {
        return { totalDeployments: 0, recentContracts: [], suspiciousPattern: false };
      }
      
      // Filter for contract creations (to === null or empty)
      const deployments = data.result.filter((tx: any) => 
        tx.to === '' || tx.to === null
      );
      
      const totalDeployments = deployments.length;
      const recentContracts = deployments.slice(0, 10).map((tx: any) => tx.contractAddress);
      
      // Suspicious if deployed >100 contracts
      const suspiciousPattern = totalDeployments > 100;
      
      return {
        totalDeployments,
        recentContracts,
        suspiciousPattern
      };
      
    } catch (error) {
      console.error('Etherscan API error:', error);
      return { totalDeployments: 0, recentContracts: [], suspiciousPattern: false };
    }
  }
  
  async checkFundingSource(contractAddress: string): Promise<string | null> {
    try {
      // Get contract creation transaction
      const url = `${BASE_ETHERSCAN_URL}?module=contract&action=getcontractcreation&contractaddresses=${contractAddress}&apikey=${ETHERSCAN_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== '1' || !data.result || !data.result[0]) {
        return null;
      }
      
      const creatorTx = data.result[0].txHash;
      
      // Get transaction details
      const txUrl = `${BASE_ETHERSCAN_URL}?module=proxy&action=eth_getTransactionByHash&txhash=${creatorTx}&apikey=${ETHERSCAN_API_KEY}`;
      
      const txResponse = await fetch(txUrl);
      const txData = await txResponse.json();
      
      // Check if funded through Disperse.app or similar
      const fundingSource = txData.result?.from;
      
      // Disperse.app contract addresses (add known ones)
      const disperseContracts = [
        '0xd152f549545093347a162dce210e7293f1452150', // Disperse.app
        // Add more as you discover them
      ];
      
      if (fundingSource && disperseContracts.includes(fundingSource.toLowerCase())) {
        return 'Disperse.app';
      }
      
      return fundingSource;
      
    } catch (error) {
      console.error('Funding source check error:', error);
      return null;
    }
  }
}

export const etherscanService = new EtherscanService();
