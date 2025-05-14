export const playSound = (soundPath: string) => {
    const audio = new Audio(soundPath);
    audio.play().catch((error) => {
      console.error('Error playing sound:', error);
    });
  };