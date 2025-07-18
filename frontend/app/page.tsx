// app/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useContract, VoteType } from '../hooks/useContract'

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

  const handleVote = async (proposalId: number, voteType: VoteType) => {
    setTxPending(true)
    try {
      await vote(proposalId, voteType)
      const voteTypeStr = voteType === VoteType.Yes ? 'YES' : 
                        voteType === VoteType.No ? 'NO' : 'ABSTAIN'
      showSuccessNotification(`Voted ${voteTypeStr} successfully! ✅`)
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

  const contractAddress = '0xb064c391AfFbAd2428744d2996bBD273785c2A84' // Pod Voting Contract

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
    },
    header: {
      position: 'sticky' as const,
      top: 0,
      zIndex: 40,
      backdropFilter: 'blur(12px)',
      backgroundColor: 'rgba(26, 26, 26, 0.9)',
      borderBottom: '1px solid #333',
    },
    headerContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 2rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    logo: {
      width: '40px',
      height: '40px',
      backgroundColor: '#00ff88',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#0a0a0a',
    },
    appTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    networkBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      backgroundColor: '#252525',
      border: '1px solid #333',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
    },
    statusDot: {
      width: '8px',
      height: '8px',
      backgroundColor: '#00ff88',
      borderRadius: '50%',
      animation: 'pulse 2s infinite',
    },
    connectButton: {
      padding: '0.625rem 1.5rem',
      backgroundColor: '#00ff88',
      color: '#0a0a0a',
      border: 'none',
      borderRadius: '0.5rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    mainContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    statCard: {
      position: 'relative' as const,
      padding: '1.5rem',
      backgroundColor: '#252525',
      border: '1px solid #333',
      borderRadius: '0.75rem',
      transition: 'all 0.3s',
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
      gap: '2rem',
      marginBottom: '2rem',
    },
    contentCard: {
      padding: '2rem',
      backgroundColor: '#252525',
      border: '1px solid #333',
      borderRadius: '0.75rem',
      transition: 'all 0.3s',
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '0.5rem',
      color: '#ffffff',
      fontSize: '1rem',
      marginBottom: '1rem',
    },
    proposalCard: {
      padding: '1rem',
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '0.5rem',
      marginBottom: '0.75rem',
      transition: 'all 0.2s',
    },
    notification: {
      position: 'fixed' as const,
      top: '80px',
      right: '2rem',
      padding: '1rem 1.5rem',
      backgroundColor: '#00ff88',
      color: '#0a0a0a',
      borderRadius: '0.5rem',
      fontWeight: 500,
      boxShadow: '0 4px 12px rgba(0, 255, 136, 0.3)',
      animation: 'slideIn 0.3s ease',
      zIndex: 50,
    },
    welcomeContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center' as const,
    },
    footer: {
      backgroundColor: '#1a1a1a',
      borderTop: '1px solid #333',
      padding: '1.5rem',
      textAlign: 'center' as const,
      marginTop: 'auto',
    }
  }

  return (
    <div style={styles.container}>
      {/* Success Notification */}
      {showSuccess && (
        <div style={styles.notification}>
          {successMessage}
        </div>
      )}

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/pod-dark_green.svg" 
              alt="Pod Logo" 
              style={{ width: '64px', height: '64px' }}
            />
            <h1 style={styles.appTitle}>
              <span style={{ color: '#ffffff' }}> Improvement Proposals</span> 
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={styles.networkBadge}>
              <div style={styles.statusDot}></div>
              <span>Devnet</span>
            </div>
            
            {!connected ? (
              <button 
                onClick={connectWallet}
                style={styles.connectButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#00cc6a'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#00ff88'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                Connect Wallet
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#00ff88' }}>
                  {formatAddress(walletAddress)}
                </span>
                <button 
                  onClick={disconnectWallet}
                  style={{ fontSize: '0.875rem', color: '#a0a0a0', background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ff4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#a0a0a0'}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.mainContainer}>
        {connected ? (
          <>
            {/* Stats Grid */}
            <div style={styles.statsGrid}>
              {[
                { label: 'Total Proposals', value: proposals.length, accent: false },
                { label: 'Active Proposals', value: proposals.filter(p => Date.now() / 1000 < p.endTime).length, accent: true },
                { label: 'Total Votes', value: proposals.reduce((sum, p) => sum + p.totalVotes, 0), accent: false },
                { label: 'Your Votes', value: proposals.filter(p => p.userVote !== undefined && p.userVote !== VoteType.NotVoted).length, accent: true }
              ].map((stat, index) => (
                <div key={index} style={styles.statCard}>
                  <div style={{ fontSize: '0.875rem', color: '#a0a0a0', marginBottom: '0.5rem' }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.accent ? '#00ff88' : '#ffffff' }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Content Grid */}
            <div style={styles.contentGrid}>
              {/* Create Proposal */}
              <div style={styles.contentCard}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                  Create Proposal
                </h2>
                
                <form onSubmit={handleCreateProposal}>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter proposal description..."
                    style={styles.input}
                    required
                    disabled={txPending}
                  />
                  
                  <select 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)}
                    style={{ ...styles.input, cursor: 'pointer' }}
                    disabled={txPending}
                  >
                    <option value="3600">1 Hour</option>
                    <option value="86400">1 Day</option>
                    <option value="604800">1 Week</option>
                  </select>
                  
                  <button 
                    type="submit"
                    disabled={loading || txPending || !description.trim()}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      backgroundColor: loading || txPending || !description.trim() ? '#333' : '#00ff88',
                      color: loading || txPending || !description.trim() ? '#666' : '#0a0a0a',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: loading || txPending || !description.trim() ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {txPending ? 'Creating...' : 'Create Proposal'}
                  </button>
                </form>
              </div>

              {/* Active Proposals */}
              <div style={styles.contentCard}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                  Active Proposals
                </h2>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {proposals.length === 0 ? (
                    <p style={{ color: '#a0a0a0', textAlign: 'center', padding: '2rem 0' }}>
                      No proposals yet. Create the first one!
                    </p>
                  ) : (
                    [...proposals].sort((a, b) => b.id - a.id).map((proposal) => {
                      const isActive = Date.now() / 1000 < proposal.endTime
                      const hasVoted = proposal.userVote !== undefined && proposal.userVote !== VoteType.NotVoted
                      
                      return (
                        <div key={proposal.id} style={styles.proposalCard}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div>
                              <h3 style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                                {proposal.description}
                              </h3>
                              <p style={{ fontSize: '0.875rem', color: '#a0a0a0' }}>
                                Proposal #{proposal.id} • {formatTimeRemaining(proposal.endTime)}
                              </p>
                            </div>
                          </div>
                          
                          {/* Vote Results */}
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: '#a0a0a0', marginBottom: '0.25rem' }}>Yes</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#00ff88' }}>
                                  {proposal.yesVotes}
                                </div>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: '#a0a0a0', marginBottom: '0.25rem' }}>No</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ff4444' }}>
                                  {proposal.noVotes}
                                </div>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: '#a0a0a0', marginBottom: '0.25rem' }}>Abstain</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffaa00' }}>
                                  {proposal.abstainVotes}
                                </div>
                              </div>
                              <div style={{ flex: 1, textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', color: '#a0a0a0', marginBottom: '0.25rem' }}>Total</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                  {proposal.totalVotes}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Vote Buttons */}
                          {hasVoted ? (
                            <div style={{
                              padding: '0.75rem',
                              backgroundColor: '#1a1a1a',
                              borderRadius: '0.375rem',
                              textAlign: 'center',
                              fontSize: '0.875rem',
                              color: '#00ff88'
                            }}>
                              ✓ You voted: {
                                proposal.userVote === VoteType.Yes ? 'YES' :
                                proposal.userVote === VoteType.No ? 'NO' : 'ABSTAIN'
                              }
                            </div>
                          ) : !isActive ? (
                            <div style={{
                              padding: '0.75rem',
                              backgroundColor: '#1a1a1a',
                              borderRadius: '0.375rem',
                              textAlign: 'center',
                              fontSize: '0.875rem',
                              color: '#666'
                            }}>
                              Voting Ended
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleVote(proposal.id, VoteType.Yes)}
                                disabled={loading || txPending}
                                style={{
                                  flex: 1,
                                  padding: '0.5rem',
                                  backgroundColor: '#00ff88',
                                  color: '#0a0a0a',
                                  border: 'none',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem',
                                  fontWeight: 500,
                                  cursor: loading || txPending ? 'not-allowed' : 'pointer',
                                  opacity: loading || txPending ? 0.6 : 1,
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  if (!loading && !txPending) {
                                    e.currentTarget.style.backgroundColor = '#00cc6a'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#00ff88'
                                }}
                              >
                                YES
                              </button>
                              <button
                                onClick={() => handleVote(proposal.id, VoteType.No)}
                                disabled={loading || txPending}
                                style={{
                                  flex: 1,
                                  padding: '0.5rem',
                                  backgroundColor: '#ff4444',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem',
                                  fontWeight: 500,
                                  cursor: loading || txPending ? 'not-allowed' : 'pointer',
                                  opacity: loading || txPending ? 0.6 : 1,
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  if (!loading && !txPending) {
                                    e.currentTarget.style.backgroundColor = '#cc3333'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#ff4444'
                                }}
                              >
                                NO
                              </button>
                              <button
                                onClick={() => handleVote(proposal.id, VoteType.Abstain)}
                                disabled={loading || txPending}
                                style={{
                                  flex: 1,
                                  padding: '0.5rem',
                                  backgroundColor: '#ffaa00',
                                  color: '#0a0a0a',
                                  border: 'none',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem',
                                  fontWeight: 500,
                                  cursor: loading || txPending ? 'not-allowed' : 'pointer',
                                  opacity: loading || txPending ? 0.6 : 1,
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  if (!loading && !txPending) {
                                    e.currentTarget.style.backgroundColor = '#cc8800'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#ffaa00'
                                }}
                              >
                                ABSTAIN
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div style={styles.welcomeContainer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/pod-dark.svg" 
              alt="Pod Logo" 
              style={{ width: '200px', height: '200px', marginBottom: '0.2rem' }}
            />
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Welcome to <span style={{ color: '#00ff88' }}>Pod Voting</span>
            </h2>
            <p style={{ color: '#a0a0a0', fontSize: '1.125rem', marginBottom: '2rem', maxWidth: '500px' }}>
              Connect your wallet to start creating and voting on proposals in our decentralized voting platform.
            </p>
            <button 
              onClick={connectWallet}
              style={{
                ...styles.connectButton,
                fontSize: '1.125rem',
                padding: '1rem 2rem',
              }}
            >
              Connect Wallet
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={{ fontSize: '0.875rem', color: '#a0a0a0' }}>
          © {new Date().getFullYear()} Pod Voting • Built with 💚 | J•Node | www.j-node.net
        </p>
      </footer>

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
