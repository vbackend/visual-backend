import { useEffect } from 'react';
import detectIt from 'detect-it';

function useShortcut(key: string, callback: any) {
  useEffect(() => {
    const handleKeyPress = async (event: any) => {
      let deviceType = await window.electron.getDeviceType();

      if (
        (event.ctrlKey &&
          deviceType === 'win32' &&
          (event.key === key.toLowerCase() ||
            event.key === key.toUpperCase())) ||
        (event.metaKey &&
          deviceType === 'darwin' &&
          (event.key === key.toLowerCase() || event.key === key.toUpperCase()))
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [key, callback]);
}

export default useShortcut;
