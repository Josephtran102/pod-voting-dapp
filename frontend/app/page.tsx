// app/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useContract } from '../hooks/useContract'
import { VOTING_ADDRESS } from '../constants/contract'

export default function VotingDapp() {
  const { proposals, createProposal, vote, loading, connectWallet, connected, refreshProposals } = useContract()
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('3600')
  const [txPending, setTxPending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [walletAddress, setWalletAddress] = useState('')

  // Get wallet address
  useEffect(() => {
    if (connected && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts[0]) setWalletAddress(accounts[0])
        })
    }
  }, [connected])

  // Auto refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (connected) refreshProposals()
    }, 10000)
    return () => clearInterval(interval)
  }, [connected, refreshProposals])

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return
    
    setTxPending(true)
    try {
      await createProposal(description, parseInt(duration))
      setDescription('')
      showSuccessNotification('Proposal created successfully! 🎉')
    } catch {
      // Error handled in hook
    } finally {
      setTxPending(false)
    }
  }

  const handleVote = async (proposalId: number) => {
    setTxPending(true)
    try {
      await vote(proposalId)
      showSuccessNotification('Vote submitted successfully! ✅')
    } catch {
      // Error handled in hook
    } finally {
      setTxPending(false)
    }
  }

  const showSuccessNotification = (message: string) => {
    setSuccessMessage(message)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const disconnectWallet = () => {
    setWalletAddress('')
    window.location.reload()
  }

  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now() / 1000
    const remaining = endTime - now
    
    if (remaining <= 0) return 'Ended'
    
    const days = Math.floor(remaining / 86400)
    const hours = Math.floor((remaining % 86400) / 3600)
    const minutes = Math.floor((remaining % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-slide-in" 
             style={{ backgroundColor: '#00ff88', color: '#0a0a0a' }}>
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      {/* Header - Same style as Pod Dashboard */}
      <header className="sticky top-0 z-40" style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #333333' }}>
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {/* Pod Logo */}
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="#00ff88">
                <circle cx="16" cy="16" r="12" />
                <text x="16" y="20" textAnchor="middle" fill="#0a0a0a" fontSize="14" fontWeight="bold">P</text>
              </svg>
              <div className="flex items-center gap-2 text-2xl">
                <span style={{ color: '#00ff88' }}>Pod Voting dApp</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg" 
                   style={{ backgroundColor: '#252525', border: '1px solid #333333' }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#00ff88' }}></div>
                <span className="text-sm">Devnet</span>
              </div>
              
              {!connected ? (
                <button 
                  onClick={connectWallet}
                  className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
                  style={{ backgroundColor: '#00ff88', color: '#0a0a0a' }}
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono" style={{ color: '#00ff88' }}>
                    {formatAddress(walletAddress)}
                  </span>
                  <button 
                    onClick={disconnectWallet}
                    className="text-sm hover:text-red-500 transition-colors"
                    style={{ color: '#a0a0a0' }}
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-8 py-8">
        {connected ? (
          <>
            {/* Stats Grid - Same as Pod Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="p-6 rounded-xl" style={{ backgroundColor: '#252525', border: '1px solid #333333' }}>
                <div className="text-sm mb-2" style={{ color: '#a0a0a0' }}>Total Proposals</div>
                <div className="text-3xl font-bold">{proposals.length}</div>
              </div>
              <div className="p-6 rounded-xl" style={{ backgroundColor: '#252525', border: '1px solid #333333' }}>
                <div className="text-sm mb-2" style={{ color: '#a0a0a0' }}>Active Proposals</div>
                <div className="text-3xl font-bold" style={{ color: '#00ff88' }}>
                  {proposals.filter(p => Date.now() / 1000 < p.endTime).length}
                </div>
              </div>
              <div className="p-6 rounded-xl" style={{ backgroundColor: '#252525', border: '1px solid #333333' }}>
                <div className="text-sm mb-2" style={{ color: '#a0a0a0' }}>Total Votes</div>
                <div className="text-3xl font-bold">
                  {proposals.reduce((sum, p) => sum + p.voteCount, 0)}
                </div>
              </div>
              <div className="p-6 rounded-xl" style={{ backgroundColor: '#252525', border: '1px solid #333333' }}>
                <div className="text-sm mb-2" style={{ color: '#a0a0a0' }}>Your Votes</div>
                <div className="text-3xl font-bold" style={{ color: '#00ff88' }}>
                  {proposals.filter(p => p.hasVoted).length}
                </div>
              </div>
            </div>

            {/* Main Grid - 2 columns like Pod Dashboard */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Create Proposal */}
              <div className="rounded-xl p-6" style={{ backgroundColor: '#252525', border: '1px solid #333333' }}>
                <h2 className="text-xl font-semibold mb-6">Create Proposal</h2>
                
                <form onSubmit={handleCreateProposal}>
                  <div className="mb-4">
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter proposal description..."
                      className="w-full px-4 py-3 rounded-lg text-white"
                      style={{ backgroundColor: '#1a1a1a', border: '1px solid #333333' }}
                      required
                      disabled={txPending}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <select 
                      value={duration} 
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-white"
                      style={{ backgroundColor: '#1a1a1a', border: '1px solid #333333' }}
                      disabled={txPending}
                    >
                      <option value="3600">1 Hour</option>
                      <option value="86400">1 Day</option>
                      <option value="604800">1 Week</option>
                    </select>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={loading || txPending || !description.trim()}
                    className="w-full py-3 rounded-lg font-medium transition-all"
                    style={{ 
                      backgroundColor: loading || txPending || !description.trim() ? '#333333' : '#00ff88',
                      color: loading || txPending || !description.trim() ? '#666666' : '#0a0a0a'
                    }}
                  >
                    {txPending ? 'Creating...' : 'Create Proposal'}
                  </button>
                </form>
              </div>

              {/* Active Proposals */}
              <div className="rounded-xl p-6" style={{ backgroundColor: '#252525', border: '1px solid #333333' }}>
                <h2 className="text-xl font-semibold mb-6">Active Proposals</h2>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {proposals.length === 0 ? (
                    <p style={{ color: '#a0a0a0' }}>No proposals yet. Create the first one!</p>
                  ) : (
                    proposals.map((proposal) => {
                      const isActive = Date.now() / 1000 < proposal.endTime
                      
                      return (
                        <div key={proposal.id} 
                             className="p-4 rounded-lg transition-all hover:border-green-500/30"
                             style={{ backgroundColor: '#1a1a1a', border: '1px solid #333333' }}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">{proposal.description}</h3>
                              <p className="text-sm mt-1" style={{ color: '#a0a0a0' }}>
                                Proposal #{proposal.id} • {formatTimeRemaining(proposal.endTime)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold" style={{ color: '#00ff88' }}>
                                {proposal.voteCount}
                              </div>
                              <div className="text-xs" style={{ color: '#a0a0a0' }}>votes</div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleVote(proposal.id)}
                            disabled={!isActive || proposal.hasVoted || loading || txPending}
                            className="w-full py-2 rounded-lg text-sm font-medium transition-all"
                            style={{ 
                              backgroundColor: proposal.hasVoted || !isActive ? '#1a1a1a' : '#00ff88',
                              color: proposal.hasVoted || !isActive ? '#666666' : '#0a0a0a',
                              cursor: proposal.hasVoted || !isActive ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {proposal.hasVoted ? '✓ Already Voted' : 
                             !isActive ? 'Voting Ended' : 'Vote'}
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Contract Info */}
            <div className="text-center">
              <p className="text-sm" style={{ color: '#a0a0a0' }}>
                Contract: <code style={{ color: '#00ff88' }}>{formatAddress(VOTING_ADDRESS)}</code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(VOTING_ADDRESS)
                    showSuccessNotification('Address copied!')
                  }}
                  className="ml-2 hover:text-green-400 transition-colors"
                >
                  📋
                </button>
              </p>
            </div>
          </>
        ) : (
          /* Not Connected */
          <div className="max-w-md mx-auto mt-20 text-center">
            <div className="p-12 rounded-xl" style={{ backgroundColor: '#252525', border: '1px solid #333333' }}>
              <h2 className="text-3xl font-bold mb-4">Welcome to Pod Voting</h2>
              <p className="mb-8" style={{ color: '#a0a0a0' }}>
                Connect your wallet to participate in decentralized governance
              </p>
              <button 
                onClick={connectWallet}
                className="px-8 py-3 rounded-lg font-medium text-lg transition-all"
                style={{ backgroundColor: '#00ff88', color: '#0a0a0a' }}
              >
                Connect Wallet
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-sm" style={{ borderTop: '1px solid #333333', color: '#a0a0a0' }}>
        <p>
          Built on <a href="https://pod.network" className="hover:underline" style={{ color: '#00ff88' }}>Pod Network</a> • 
          <a href="https://github.com/josephtran/pod-voting-tutorial" className="hover:underline ml-2" style={{ color: '#00ff88' }}>GitHub</a> • 
          <a href="https://docs.v1.pod.network" className="hover:underline ml-2" style={{ color: '#00ff88' }}>Docs</a>
        </p>
      </footer>

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
