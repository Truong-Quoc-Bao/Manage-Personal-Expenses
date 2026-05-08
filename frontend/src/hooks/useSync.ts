import { useEffect } from 'react';

export function useMoneyGuardSync(refreshFunction: () => void) {
  useEffect(() => {
    // Lắng nghe sự kiện từ con Bot
    window.addEventListener('money-guard-sync', refreshFunction);
    
    return () => {
      window.removeEventListener('money-guard-sync', refreshFunction);
    };
  }, [refreshFunction]);
}