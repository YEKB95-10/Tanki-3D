// Game.js - Основной класс игры
import { Player } from './Player.js';

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gameState = 'title';
        this.player = new Player(canvas.width, canvas.height);
        this.keys = {};
        this.setupEventListeners();
    }
    
    init() {
        this.showMenu();
    }
    
    setupEventListeners() {
        // Обработка клавиш
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            console.log('Key pressed:', e.key);
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Кнопки интерфейса
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.startGame());
        document.getElementById('pauseButton').addEventListener('click', () => this.togglePause());
    }
    
    startGame() {
        console.log('Starting game');
        this.gameState = 'playing';
        document.getElementById('titleScreen').style.display = 'none';
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('uiPanel').style.display = 'block';
        this.gameLoop();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseButton').textContent = 'Продолжить';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseButton').textContent = 'Пауза';
        }
    }
    
    showMenu() {
        this.gameState = 'title';
        document.getElementById('titleScreen').style.display = 'block';
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('uiPanel').style.display = 'none';
    }
    
    gameLoop() {
        if (this.gameState === 'playing') {
            this.update();
        }
        this.draw();
        
        if (this.gameState !== 'gameOver') {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    update() {
        // Обновление игрока
        this.player.update(this.keys);
    }
    
    draw() {
        // Очистка canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Отрисовка игрока
        this.player.draw(this.ctx);
    }
}