import { useEffect } from 'react';

function useKeyPress(targetKey: any, onPress: any) {
  useEffect(() => {
    function handleKeyPress(event: any) {
      if (event.key === targetKey) {
        onPress();
      }
    }

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [targetKey, onPress]);
}

export default useKeyPress;
