import React, { useEffect } from 'react';

const useEscHook = (callback: any) => {
  useEffect(() => {
    const handleEscKeyPress = (event: any) => {
      if (event.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscKeyPress);

    return () => {
      document.removeEventListener('keydown', handleEscKeyPress);
    };
  }, [callback]);
};

export default useEscHook;
