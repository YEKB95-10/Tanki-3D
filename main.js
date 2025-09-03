// main.js - Точка входа в приложение
import { Game } from './Game.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    const startButton = document.getElementById('startButton');
    const titleScreen = document.getElementById('titleScreen');
    const uiPanel = document.getElementById('uiPanel');

    // Установка размеров canvas
    canvas.width = 1000;
    canvas.height = 700;

    startButton.addEventListener('click', () => {
        titleScreen.style.display = 'none';
        uiPanel.classList.remove('hidden');
        
        // Создание и запуск игры
        const game = new Game(canvas, ctx);
        game.init();
    });
});
