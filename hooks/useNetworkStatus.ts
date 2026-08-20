import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isOnline: boolean;
  connectionType: string | null;
  isInternetReachable: boolean | null;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: true,
    connectionType: null,
    isInternetReachable: true,
  });

  useEffect(() => {
    // Initial fetch of network status
    NetInfo.fetch().then((state: NetInfoState) => {
      const isConnected = state.isConnected ?? true;
      const isReachable = state.isInternetReachable ?? isConnected;
      setStatus({
        isOnline: isConnected && isReachable,
        connectionType: state.type,
        isInternetReachable: isReachable,
      });
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = state.isConnected ?? true;
      const isReachable = state.isInternetReachable ?? isConnected;
      setStatus({
        isOnline: isConnected && isReachable,
        connectionType: state.type,
        isInternetReachable: isReachable,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return status;
};
