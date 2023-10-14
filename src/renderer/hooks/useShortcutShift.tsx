import { useEffect } from 'react';

function useShortcutShift(key: string, callback: any) {
  useEffect(() => {
    const handleKeyPress = async (event: any) => {
      let deviceType = await window.electron.getDeviceType();
      let isMac = deviceType === 'darwin';

      let keyMatch =
        event.key == key.toUpperCase() || event.key == key.toLowerCase();
      if (
        ((isMac && event.metaKey) || (!isMac && event.ctrlKey)) &&
        event.shiftKey &&
        keyMatch
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

export default useShortcutShift;
