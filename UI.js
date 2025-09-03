// UI.js - Пользовательский интерфейс
export class UI {
    constructor() {
        this.uiLevel = document.getElementById('uiLevel');
        this.uiLives = document.getElementById('uiLives');
        this.uiScore = document.getElementById('uiScore');
        this.uiTimer = document.getElementById('uiTimer');
    }
    
    update(level, lives, score, timer) {
        if (this.uiLevel) this.uiLevel.textContent = level;
        if (this.uiLives) this.uiLives.textContent = lives;
        if (this.uiScore) this.uiScore.textContent = score;
        
        if (this.uiTimer) {
            const minutes = Math.floor(timer / 60);
            const seconds = timer % 60;
            this.uiTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
}