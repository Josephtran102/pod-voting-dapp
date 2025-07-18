// frontend/config/pod.ts
export const podDevnet = {
  id: 1293,
  name: 'Pod Devnet',
  network: 'pod-devnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Pod ETH',
    symbol: 'pETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.v1.dev.pod.network'] },
    public: { http: ['https://rpc.v1.dev.pod.network'] },
  },
  blockExplorers: {
    default: { name: 'Pod Explorer', url: 'https://explorer.v1.pod.network' },
  },
}
