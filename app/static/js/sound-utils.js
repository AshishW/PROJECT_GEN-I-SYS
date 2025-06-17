const soundEffects = {
    dynamicIsland: new Audio('/static/assets/sounds/mixkit-sci-fi-click.wav'),
    taskComplete: new Audio('/static/assets/sounds/mixkit-tech-click-1140.wav'),
    micClick: new Audio('/static/assets/sounds/mixkit-high-tech-bleep-2521.wav'),
    uiInteract: new Audio('/static/assets/sounds/mixkit-cool-interface-click-tone-2568.wav'),
    browserAgentActivated: new Audio('/static/assets/sounds/mixkit-sci-fi-interface_for-browser-agent.wav')
};

// Preload all sounds
Object.values(soundEffects).forEach(audio => {
    audio.load();
});

// Configure all sounds
Object.values(soundEffects).forEach(audio => {
    audio.volume = 0.5;
});

export function playSound(soundName) {
    const sound = soundEffects[soundName];
    if (sound) {
        // Clone and play to allow overlapping sounds
        const clone = sound.cloneNode();
        clone.play().catch(e => console.warn('Sound playback failed:', e));
    }
}
