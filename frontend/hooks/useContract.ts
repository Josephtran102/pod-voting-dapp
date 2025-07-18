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

  // ... keep existing initialization code ...

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
      alert(error.reason || 'Failed to vote')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ... keep other functions ...

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
