import { useEffect } from 'react';

function useShortcut(key: string, callback: any) {
  // let deps = dependencies ? dependencies : [];
  let listener = (e: any, payload: string) => {
    if (payload === key) {
      callback();
    }
  };

  useEffect(() => {
    const handleKeyPress = async (event: any) => {
      let deviceType = await window.electron.getDeviceType();

      let keyMatch = false;
      if (deviceType == 'darwin') {
        if (
          event.metaKey &&
          (event.key === key.toLowerCase() || event.key === key.toUpperCase())
        )
          keyMatch = true;
      } else if (
        event.ctrlKey &&
        (event.key === key.toLowerCase() || event.key === key.toUpperCase())
      ) {
        keyMatch = true;
      }

      if (keyMatch) {
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
