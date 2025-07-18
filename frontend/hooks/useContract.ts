// hooks/useContract.ts
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { VOTING_ABI, VOTING_ADDRESS } from '../constants/contract'

export enum VoteType {
  NotVoted = 0,
  Yes = 1,
  No = 2,
  Abstain = 3
}

export interface Proposal {
  id: number
  description: string
  yesVotes: number
  noVotes: number
  abstainVotes: number
  totalVotes: number
  endTime: number
  exists: boolean
  userVote?: VoteType
}

export function useContract() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(false)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          await initializeContract()
        }
      } catch (error) {
        console.error('Failed to check connection:', error)
      }
    }
  }

  const initializeContract = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        
        // Switch to Pod Network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x50d' }], // 1293 in hex
          })
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x50d',
                chainName: 'Pod Devnet',
                nativeCurrency: {
                  name: 'Pod ETH',
                  symbol: 'pETH',
                  decimals: 18
                },
                rpcUrls: ['https://rpc.v1.dev.pod.network'],
                blockExplorerUrls: ['https://explorer.v1.pod.network']
              }]
            })
          }
        }

        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, signer)
        
        setContract(contract)
        setSigner(signer)
        setConnected(true)
        
        // Load proposals
        await loadProposals(contract, signer)
      } catch (error) {
        console.error('Failed to initialize contract:', error)
        alert('Please connect MetaMask to Pod Devnet')
      }
    } else {
      alert('Please install MetaMask!')
    }
  }

  const loadProposals = async (contract: ethers.Contract, signer: ethers.Signer) => {
    try {
      setLoading(true)
      const count = await contract.proposalCount()
      const proposalsArray: Proposal[] = []
      const signerAddress = await signer.getAddress()
      
      for (let i = 1; i <= Number(count); i++) {
        const [description, yesVotes, noVotes, abstainVotes, endTime, exists] = 
          await contract.getProposal(i)
        const userVote = await contract.getVote(i, signerAddress)
        const totalVotes = Number(yesVotes) + Number(noVotes) + Number(abstainVotes)
        
        proposalsArray.push({
          id: i,
          description,
          yesVotes: Number(yesVotes),
          noVotes: Number(noVotes),
          abstainVotes: Number(abstainVotes),
          totalVotes,
          endTime: Number(endTime),
          exists,
          userVote: Number(userVote)
        })
      }
      
      setProposals(proposalsArray)
    } catch (error) {
      console.error('Failed to load proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProposal = async (description: string, duration: number) => {
    if (!contract || !signer) {
      alert('Please connect wallet first')
      return
    }
    
    try {
      setLoading(true)
      console.log('Creating proposal:', description, duration)
      
      // Estimate gas
      const gasEstimate = await contract.createProposal.estimateGas(description, duration)
      console.log('Gas estimate:', gasEstimate.toString())
      
      // Send transaction with gas limit
      const tx = await contract.createProposal(description, duration, {
        gasLimit: (gasEstimate * BigInt(120)) / BigInt(100)
      })
      
      console.log('Transaction sent:', tx.hash)
      const receipt = await tx.wait()
      console.log('Transaction confirmed:', receipt)
      
      await loadProposals(contract, signer)
      return receipt
    } catch (error: any) {
      console.error('Failed to create proposal:', error)
      if (error.reason) {
        alert(`Error: ${error.reason}`)
      } else {
        alert('Failed to create proposal. Check console for details.')
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  const vote = async (proposalId: number, voteType: VoteType) => {
    if (!contract || !signer) {
      alert('Please connect wallet first')
      return
    }
    
    try {
      setLoading(true)
      const tx = await contract.vote(proposalId, voteType)
      await tx.wait()
      await loadProposals(contract, signer)
    } catch (error: any) {
      console.error('Failed to vote:', error)
      if (error.reason) {
        alert(`Error: ${error.reason}`)
      } else {
        alert('Failed to vote. Check console for details.')
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    proposals,
    createProposal,
    vote,
    loading,
    connectWallet: initializeContract,
    connected,
    refreshProposals: () => contract && signer && loadProposals(contract, signer)
  }
}
