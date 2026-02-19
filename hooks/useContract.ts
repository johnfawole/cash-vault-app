import { useCallback } from 'react';
import { ethers } from 'ethers';
import SafeLockVaultABI from '@/lib/abi/SafeLockVault.json';
import { SAFE_LOCK_VAULT_ADDRESS, formatDurationInSeconds, formatUSDC, BASE_CHAIN_ID } from '@/lib/contracts';

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

export function useContract() {
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
        throw new Error(`Please switch to Base network (Chain ID: ${BASE_CHAIN_ID})`);
      }

      if (params.asset !== 'usdc') {
        throw new Error('Only USDC is currently supported');
      }

      const contract = new ethers.Contract(
        SAFE_LOCK_VAULT_ADDRESS,
        SafeLockVaultABI,
        signer
      );

      // Call claim on contract to withdraw
      const tx = await contract.claim(params.lockId);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('[v0] Withdrawal receipt:', receipt);
      
      return receipt;
    } catch (error) {
      console.error('[v0] Error in withdrawLock:', error);
      throw error;
    }
  }, []);

  return {
    createLock,
    withdrawLock,
  };
}
