import { useAccount, useConnect, useDisconnect } from 'wagmi';
import Button from './Button';

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    if (!isConnected && connectors[0]) {
      connect({ connector: connectors[0] });
    } else {
      disconnect();
    }
  };

  return (
    <Button onClick={handleConnect}>
      {isConnected ? `Disconnect (${address?.slice(0, 6)}...${address?.slice(-4)})` : 'Connect Wallet'}
    </Button>
  );
}