import { useEffect } from 'react';

export const useCommandS = (onSaveCallback: any) => {
  useEffect(() => {
    const handleSaveShortcut = (event: any) => {
      // Check if the event key is 's' and the modifier key (Command or Ctrl) is pressed
      if (
        (event.key === 's' || event.key === 'S') &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault(); // Prevent the default browser behavior (e.g., save page)
        onSaveCallback(); // Call the provided callback function for handling save action
      }
    };

    // Add event listener for 'keydown' on the document
    document.addEventListener('keydown', handleSaveShortcut);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleSaveShortcut);
    };
  }, [onSaveCallback]);
};

export const useCommandJ = (onJCallback: any) => {
  useEffect(() => {
    const handleJShortcut = (event: any) => {
      // Check if the event key is 'j' and the modifier key (Command or Ctrl) is pressed
      if (
        (event.key === 'j' || event.key === 'J') &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault(); // Prevent the default browser behavior (e.g., open downloads)
        onJCallback(); // Call the provided callback function for handling the "Command + J" action
      }
    };

    // Add event listener for 'keydown' on the document
    document.addEventListener('keydown', handleJShortcut);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleJShortcut);
    };
  }, [onJCallback]);
};

export const useCommandA = (onJCallback: any) => {
  useEffect(() => {
    const handleJShortcut = (event: any) => {
      // Check if the event key is 'j' and the modifier key (Command or Ctrl) is pressed
      if (
        (event.key === 'a' || event.key === 'A') &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault(); // Prevent the default browser behavior (e.g., open downloads)
        onJCallback(); // Call the provided callback function for handling the "Command + J" action
      }
    };

    // Add event listener for 'keydown' on the document
    document.addEventListener('keydown', handleJShortcut);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleJShortcut);
    };
  }, [onJCallback]);
};

export const useCommandE = (onJCallback: any) => {
  useEffect(() => {
    const handleJShortcut = (event: any) => {
      // Check if the event key is 'j' and the modifier key (Command or Ctrl) is pressed
      if (
        (event.key === 'e' || event.key === 'E') &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault(); // Prevent the default browser behavior (e.g., open downloads)
        onJCallback(); // Call the provided callback function for handling the "Command + J" action
      }
    };

    // Add event listener for 'keydown' on the document
    document.addEventListener('keydown', handleJShortcut);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleJShortcut);
    };
  }, [onJCallback]);
};

export const useCommandD = (onDCallback: any) => {
  useEffect(() => {
    const handleDShortcut = (event: any) => {
      // Check if the event key is 'j' and the modifier key (Command or Ctrl) is pressed
      if (
        (event.key === 'd' || event.key === 'D') &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault(); // Prevent the default browser behavior (e.g., open downloads)
        onDCallback(); // Call the provided callback function for handling the "Command + J" action
      }
    };

    // Add event listener for 'keydown' on the document
    document.addEventListener('keydown', handleDShortcut);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleDShortcut);
    };
  }, [onDCallback]);
};

export const useCommand = (key: string, onDCallback: any) => {
  useEffect(() => {
    const handleDShortcut = (event: any) => {
      // Check if the event key is 'j' and the modifier key (Command or Ctrl) is pressed
      if (
        (event.key === key || event.key === key.toUpperCase()) &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault(); // Prevent the default browser behavior (e.g., open downloads)
        onDCallback(); // Call the provided callback function for handling the "Command + J" action
      }
    };

    // Add event listener for 'keydown' on the document
    document.addEventListener('keydown', handleDShortcut);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleDShortcut);
    };
  }, [onDCallback]);
};
