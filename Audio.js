// Audio.js - Звуковая система
export class Audio {
    constructor() {
        this.sounds = {};
        this.loadSounds();
    }
    
    loadSounds() {
        // Загрузка звуков (заглушки)
        this.sounds.shoot = { play: () => console.log('Звук выстрела') };
        this.sounds.explosion = { play: () => console.log('Звук взрыва') };
        this.sounds.move = { play: () => console.log('Звук движения') };
    }
    
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }
}