import { useCallback } from 'react';
import { ethers } from 'ethers';
import SafeLockVaultABI from '@/lib/abi/SafeLockVault.json';
import DCAInvestmentABI from '@/lib/abi/DCAInvestment.json';
import { SAFE_LOCK_VAULT_ADDRESS, DCA_INVESTMENT_ADDRESS, formatDurationInSeconds, formatUSDC, formatDCAFrequency, BASE_CHAIN_ID } from '@/lib/contracts';

interface CreateLockParams {
  amount: string;
  duration: number; // in months
  autoRelock: boolean;
  asset: string;
}

interface WithdrawLockParams {
  lockId: number;
  amount: string;
  asset: string;
}

interface ExtendLockParams {
  lockId: number;
  additionalDuration: number; // in months
}

interface AddFundsParams {
  lockId: number;
  amount: string;
  asset: string;
}

interface CreateDCAPlantParams {
  tokenAddress: string;
  frequency: string; // 'daily', 'weekly', 'monthly'
}

interface CreateDCAPlantWithUSDCParams {
  frequency: string; // 'daily', 'weekly', 'monthly'
}

interface FundDCAPlantParams {
  planId: number;
  amount: string;
}

interface WithdrawDCAParams {
  planId: number;
}

export function useContract() {
  // Helper function to switch to Base network
  const switchToBase = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask or compatible wallet not found');
    }

    try {
      // Attempt to switch to Base network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + BASE_CHAIN_ID.toString(16) }],
      });
      console.log('[v0] Switched to Base network');
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x' + BASE_CHAIN_ID.toString(16),
                chainName: 'Base',
                rpcUrls: ['https://mainnet.base.org'],
                nativeCurrency: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://basescan.org'],
              },
            ],
          });
          console.log('[v0] Added Base network to MetaMask');
        } catch (addError) {
          console.error('[v0] Error adding Base network:', addError);
          throw new Error('Failed to add Base network to MetaMask');
        }
      } else {
        console.error('[v0] Error switching to Base network:', switchError);
        throw new Error('Failed to switch to Base network');
      }
    }
  }, []);

  const createLock = useCallback(async (params: CreateLockParams) => {
    if (!window.ethereum) {
      throw new Error('MetaMask or compatible wallet not found');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Check if user is on Base chain
      const network = await provider.getNetwork();
      if (network.chainId !== BASE_CHAIN_ID) {
        throw new Error(`Please switch to Base network (Chain ID: ${BASE_CHAIN_ID})`);
      }

      // Only USDC is supported currently
      if (params.asset !== 'usdc') {
        throw new Error('Only USDC is currently supported');
      }

      const contract = new ethers.Contract(
        SAFE_LOCK_VAULT_ADDRESS,
        SafeLockVaultABI,
        signer
      );

      // Format inputs
      const amountBigInt = formatUSDC(params.amount);
      const durationSeconds = formatDurationInSeconds(params.duration);

      // Call createLock on contract
      const tx = await contract.createLock(
        amountBigInt,
        durationSeconds,
        params.autoRelock
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('[v0] Transaction receipt:', receipt);
      
      return receipt;
    } catch (error) {
      console.error('[v0] Error in createLock:', error);
      throw error;
    }
  }, []);

  const withdrawLock = useCallback(async (params: WithdrawLockParams) => {
    if (!window.ethereum) {
      throw new Error('MetaMask or compatible wallet not found');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Check if user is on Base chain
      const network = await provider.getNetwork();
      if (network.chainId !== BASE_CHAIN_ID) {
        console.log('[v0] User not on Base network, attempting to switch...');
        await switchToBase();
      }

      if (params.asset !== 'usdc') {
        throw new Error('Only USDC is currently supported');
      }

      const contract = new ethers.Contract(
        SAFE_LOCK_VAULT_ADDRESS,
        SafeLockVaultABI,
        signer
      );

      // Format amount
      const amountBigInt = formatUSDC(params.amount);

      // Call withdrawLock on contract
      const tx = await contract.withdrawLock(params.lockId, amountBigInt);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('[v0] Lock withdrawal processed:', receipt);
      
      return receipt;
    } catch (error) {
      console.error('[v0] Error in withdrawLock:', error);
      throw error;
    }
  }, [switchToBase]);

  const extendLock = useCallback(async (params: ExtendLockParams) => {
    if (!window.ethereum) {
      throw new Error('MetaMask or compatible wallet not found');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Check if user is on Base chain
      const network = await provider.getNetwork();
      if (network.chainId !== BASE_CHAIN_ID) {
        console.log('[v0] User not on Base network, attempting to switch...');
        await switchToBase();
      }

      const contract = new ethers.Contract(
        SAFE_LOCK_VAULT_ADDRESS,
        SafeLockVaultABI,
        signer
      );

      // Format additional duration
      const additionalDurationSeconds = formatDurationInSeconds(params.additionalDuration);

      // Call extendLock on contract
      const tx = await contract.extendLock(params.lockId, additionalDurationSeconds);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('[v0] Lock extended:', receipt);
      
      return receipt;
    } catch (error) {
      console.error('[v0] Error in extendLock:', error);
      throw error;
    }
  }, [switchToBase]);

  const addFunds = useCallback(async (params: AddFundsParams) => {
    if (!window.ethereum) {
      throw new Error('MetaMask or compatible wallet not found');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Check if user is on Base chain
      const network = await provider.getNetwork();
      if (network.chainId !== BASE_CHAIN_ID) {
        console.log('[v0] User not on Base network, attempting to switch...');
        await switchToBase();
      }

      if (params.asset !== 'usdc') {
        throw new Error('Only USDC is currently supported');
      }

      const contract = new ethers.Contract(
        SAFE_LOCK_VAULT_ADDRESS,
        SafeLockVaultABI,
        signer
      );

      // Format amount
      const amountBigInt = formatUSDC(params.amount);

      // Call addFunds on contract
      const tx = await contract.addFunds(params.lockId, amountBigInt);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('[v0] Funds added to lock:', receipt);
      
      return receipt;
    } catch (error) {
      console.error('[v0] Error in addFunds:', error);
      throw error;
    }
  }, [switchToBase]);

  const createDCAPlan = useCallback(async (params: CreateDCAPlantParams) => {
    if (!window.ethereum) {
      throw new Error('MetaMask or compatible wallet not found. Please install MetaMask to continue.');
    }

    if (!DCA_INVESTMENT_ADDRESS || DCA_INVESTMENT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error('DCA contract address not configured. Set NEXT_PUBLIC_DCA_INVESTMENT_ADDRESS in environment variables.');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      try {
        const signer = await provider.getSigner();
      } catch (signerError) {
        // Signer error indicates wallet is not connected
        throw new Error('Please connect your wallet first. Click the "Connect Wallet" button in the header.');
      }

      const signer = await provider.getSigner();

      // Check if user is on Base chain
      const network = await provider.getNetwork();
      if (network.chainId !== BASE_CHAIN_ID) {
        console.log('[v0] User not on Base network, attempting to switch...');
        await switchToBase();
      }

      const contract = new ethers.Contract(
        DCA_INVESTMENT_ADDRESS,
        DCAInvestmentABI,
        signer
      );

      // Format frequency
      const frequencyInSeconds = formatDCAFrequency(params.frequency);

      // Call createPlan on contract
      const tx = await contract.createPlan(params.tokenAddress, frequencyInSeconds);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('[v0] DCA Plan created:', receipt);
      
      return receipt;
    } catch (error) {
      // Handle user rejection specifically
      if (error instanceof Error && error.message.includes('rejected')) {
        console.error('[v0] Error in createDCAPlan: User denied wallet access');
        throw new Error('You need to connect your wallet and approve the transaction. Please try again.');
      }
      console.error('[v0] Error in createDCAPlan:', error);
      throw error;
    }
  }, []);

  const createDCAPlantWithUSDC = useCallback(async (params: CreateDCAPlantWithUSDCParams) => {
    if (!window.ethereum) {
      throw new Error('MetaMask or compatible wallet not found. Please install MetaMask to continue.');
    }

    if (!DCA_INVESTMENT_ADDRESS || DCA_INVESTMENT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error('DCA contract address not configured. Set NEXT_PUBLIC_DCA_INVESTMENT_ADDRESS in environment variables.');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      try {
        const signer = await provider.getSigner();
      } catch (signerError) {
        // Signer error indicates wallet is not connected
        throw new Error('Please connect your wallet first. Click the "Connect Wallet" button in the header.');
      }

      const signer = await provider.getSigner();

      // Check if user is on Base chain
      const network = await provider.getNetwork();
      if (network.chainId !== BASE_CHAIN_ID) {
        console.log('[v0] User not on Base network, attempting to switch...');
        await switchToBase();
      }

      const contract = new ethers.Contract(
        DCA_INVESTMENT_ADDRESS,
        DCAInvestmentABI,
        signer
      );

      // Format frequency
      const frequencyInSeconds = formatDCAFrequency(params.frequency);

      // Call createPlanWithUSDC on contract
      const tx = await contract.createPlanWithUSDC(frequencyInSeconds);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('[v0] DCA Plan with USDC created:', receipt);
      
      return receipt;
    } catch (error) {
      // Handle user rejection specifically
      if (error instanceof Error && error.message.includes('rejected')) {
        console.error('[v0] Error in createDCAPlantWithUSDC: User denied wallet access');
        throw new Error('You need to connect your wallet and approve the transaction. Please try again.');
      }
      console.error('[v0] Error in createDCAPlantWithUSDC:', error);
      throw error;
    }
  }, []);

  const fundDCAPlan = useCallback(async (params: FundDCAPlantParams) => {
    if (!window.ethereum) {
      throw new Error('MetaMask or compatible wallet not found. Please install MetaMask to continue.');
    }

    if (!DCA_INVESTMENT_ADDRESS || DCA_INVESTMENT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error('DCA contract address not configured. Set NEXT_PUBLIC_DCA_INVESTMENT_ADDRESS in environment variables.');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      try {
        const signer = await provider.getSigner();
      } catch (signerError) {
        // Signer error indicates wallet is not connected
        throw new Error('Please connect your wallet first. Click the "Connect Wallet" button in the header.');
      }

      const signer = await provider.getSigner();

      // Check if user is on Base chain
      const network = await provider.getNetwork();
      if (network.chainId !== BASE_CHAIN_ID) {
        console.log('[v0] User not on Base network, attempting to switch...');
        await switchToBase();
      }

      const contract = new ethers.Contract(
        DCA_INVESTMENT_ADDRESS,
        DCAInvestmentABI,
        signer
      );

      // Format amount (assuming USDC with 6 decimals)
      const amountBigInt = formatUSDC(params.amount);

      // Call fundPlan on contract
      const tx = await contract.fundPlan(params.planId, amountBigInt);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('[v0] DCA Plan funded:', receipt);
      
      return receipt;
    } catch (error) {
      // Handle user rejection specifically
      if (error instanceof Error && error.message.includes('rejected')) {
        console.error('[v0] Error in fundDCAPlan: User denied wallet access');
        throw new Error('You need to connect your wallet and approve the transaction. Please try again.');
      }
      console.error('[v0] Error in fundDCAPlan:', error);
      throw error;
    }
  }, []);

  const withdrawDCA = useCallback(async (params: WithdrawDCAParams) => {
    if (!window.ethereum) {
      throw new Error('MetaMask or compatible wallet not found. Please install MetaMask to continue.');
    }

    if (!DCA_INVESTMENT_ADDRESS || DCA_INVESTMENT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error('DCA contract address not configured. Set NEXT_PUBLIC_DCA_INVESTMENT_ADDRESS in environment variables.');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      try {
        const signer = await provider.getSigner();
      } catch (signerError) {
        // Signer error indicates wallet is not connected
        throw new Error('Please connect your wallet first. Click the "Connect Wallet" button in the header.');
      }

      const signer = await provider.getSigner();

      // Check if user is on Base chain
      const network = await provider.getNetwork();
      if (network.chainId !== BASE_CHAIN_ID) {
        console.log('[v0] User not on Base network, attempting to switch...');
        await switchToBase();
      }

      const contract = new ethers.Contract(
        DCA_INVESTMENT_ADDRESS,
        DCAInvestmentABI,
        signer
      );

      // Call withdraw on contract
      const tx = await contract.withdraw(params.planId);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('[v0] DCA Withdrawal processed:', receipt);
      
      return receipt;
    } catch (error) {
      // Handle user rejection specifically
      if (error instanceof Error && error.message.includes('rejected')) {
        console.error('[v0] Error in withdrawDCA: User denied wallet access');
        throw new Error('You need to connect your wallet and approve the transaction. Please try again.');
      }
      console.error('[v0] Error in withdrawDCA:', error);
      throw error;
    }
  }, []);

  return {
    createLock,
    withdrawLock,
    extendLock,
    addFunds,
    createDCAPlan,
    createDCAPlantWithUSDC,
    fundDCAPlan,
    withdrawDCA,
  };
}
