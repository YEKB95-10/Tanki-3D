window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // --- Логирование ---
    let lastLoopTime = Date.now();
    let freezeDetectorInterval;

    async function logToServer(message, type = 'ERROR') {
        console.log(`Logging to server: [${type}] ${message}`);
        try {
            await fetch('/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, type }),
            });
        } catch (error) {
            console.error('Failed to log to server:', error);
        }
    }

    window.onerror = function(message, source, lineno, colno, error) {
        const fullMessage = `An error occurred: ${message} at ${source}:${lineno}:${colno}`;
        logToServer(fullMessage, 'ERROR');
        return true; // Предотвращаем стандартную обработку ошибки браузером
    };

    function startFreezeDetector() {
        if (freezeDetectorInterval) clearInterval(freezeDetectorInterval);
        freezeDetectorInterval = setInterval(() => {
            if (Date.now() - lastLoopTime > 5000 && gameState === 'playing') {
                logToServer('Game loop has frozen.', 'FREEZE');
                // Можно добавить логику для попытки перезапуска или показа сообщения
                clearInterval(freezeDetectorInterval); // Останавливаем, чтобы не слать много сообщений
            }
        }, 5000); // Проверяем каждые 5 секунд
    }

    // --- Элементы UI ---
    const uiLevel = document.getElementById('uiLevel');
    const uiLives = document.getElementById('uiLives');
    const uiScore = document.getElementById('uiScore');
    const uiTimer = document.getElementById('uiTimer');
    const uiPanel = document.getElementById('uiPanel');
    const pauseButton = document.getElementById('pauseButton');
    
    // Устанавливаем размер canvas
    canvas.width = 1000;
    canvas.height = 700;
    
    // Игровые переменные
    let gameState = 'title'; // 'title', 'playing', 'paused', 'gameOver'
    let lives = 3;
    let score = 0;
    let level = 1;
    let timer = 180; // 3 минуты
    let timerInterval;
    
    // Игрок
    const player = {
      x: 500,
      y: 650,
      width: 32,
      height: 32,
      speed: 2,
      direction: 0, // 0: вверх, 1: вправо, 2: вниз, 3: влево
      lastShot: 0,
      shotCooldown: 300,
      color: '#00ff00'
    };
    
    // База
    const base = {
        x: canvas.width / 2 - 24,
        y: canvas.height - 48,
        width: 48,
        height: 48,
        isDestroyed: false
    };

    // Точки респауна игрока
    const playerSpawnPoints = [
        { x: base.x - 60, y: base.y },
        { x: base.x + base.width + 12, y: base.y }
    ];
    let currentPlayerSpawnIndex = 0;

    // Массивы для объектов
    let bullets = [];
    let enemies = [];
    let walls = [];
    let explosions = [];
    let waterTiles = [];
    let spawnEffects = [];
    
    // --- Новые переменные для спавна врагов ---
    const MAX_ENEMIES_ON_FIELD = 5;
    const SPAWN_DELAY = 2000; // 2 секунды между появлениями
    let spawnQueue = [];
    let nextSpawnTime = 0;
    let spawnPoints = [
      {x: 50, y: 50}, // левый верх
      {x: canvas.width/2 - 24, y: 50}, // центр
      {x: canvas.width - 98, y: 50} // правый верх
    ];
    let spawnIndex = 0;

    // --- Кешированные спрайты и константы для производительности и читаемости ---
    const sprites = {};
    let backgroundCanvas = null;
    const GAME_CONSTANTS = {
        PLAYER_SPEED: 3,
        PLAYER_SHOT_COOLDOWN: 300,
        BULLET_SPEED_PLAYER: 8,
        BULLET_SPEED_ENEMY: 6
    };

    const ENEMY_TYPES = {
      light: {
        type: 'light',
        color: '#FFFFFF', // Белый
        health: 1,
        speed: 1.0,
        scoreValue: 25
      },
      fast: {
        type: 'fast',
        color: '#FFFF00', // Желтый
        health: 2,
        speed: 2.0,
        scoreValue: 50
      },
      heavy: {
        type: 'heavy',
        color: '#ff0000', // Красный
        health: 4,
        speed: 0.8,
        scoreValue: 100
      }
    };
    
    // Клавиши
    const keys = {};
    
    function create3DTankSprite(color, direction) {
        const sprite = document.createElement('canvas');
        sprite.width = 32;
        sprite.height = 32;
        const spriteCtx = sprite.getContext('2d');

        // Save the context state
        spriteCtx.save();

        // Center the tank in the sprite
        spriteCtx.translate(16, 16);

        // Rotate the tank based on direction
        spriteCtx.rotate(direction * Math.PI / 2);

        // Tank Body
        spriteCtx.fillStyle = color;
        spriteCtx.fillRect(-12, -13, 24, 26);

        // 3D effect for the body
        spriteCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        spriteCtx.fillRect(-12, -13, 24, 3);
        spriteCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        spriteCtx.fillRect(-12, 10, 24, 3);

        // Tracks
        spriteCtx.fillStyle = '#444';
        spriteCtx.fillRect(-15, -15, 5, 29);
        spriteCtx.fillRect(10, -15, 5, 29);

        // Track details
        spriteCtx.fillStyle = '#666';
        for (let i = 0; i < 10; i++) {
            spriteCtx.fillRect(-14, -13 + i * 3, 4, 1);
            spriteCtx.fillRect(11, -13 + i * 3, 4, 1);
        }

        // Turret
        spriteCtx.fillStyle = '#888';
        spriteCtx.beginPath();
        spriteCtx.arc(0, 0, 8, 0, 2 * Math.PI);
        spriteCtx.fill();

        // Cannon
        spriteCtx.fillStyle = '#999';
        spriteCtx.fillRect(-1, -15, 2, 15);

        // Detail for player tank
        if (color === '#00ff00') {
            spriteCtx.fillStyle = '#00aa00';
            spriteCtx.fillRect(-5, -5, 10, 10);
        }


        // Restore the context state
        spriteCtx.restore();

        return sprite;
    }
    
    // ... (rest of the sprite creation functions are the same)
    
    function initLevel() {
      enemies = [];
      bullets = [];
      explosions = [];
      waterTiles = [];

      powerUps = [];
      freezeEndTime = 0;
      for (const wall of walls) {
          if (wall.isFortified) {
              wall.type = 'brick';
              delete wall.isFortified;
              delete wall.fortifyEndTime;
          }
      }

      base.isDestroyed = false;
      fillSpawnQueue();
      spawnIndex = 0;
      nextSpawnTime = Date.now();
      
      const spawnPoint = playerSpawnPoints[currentPlayerSpawnIndex % playerSpawnPoints.length];
      player.x = spawnPoint.x;
      player.y = spawnPoint.y;

      generateWalls();
      generateWater();
    }

    function fillSpawnQueue() {
        const availableTypes = Object.keys(ENEMY_TYPES);
        spawnQueue = [];
        for (let i = 0; i < 10; i++) {
            const randomTypeKey = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            spawnQueue.push({ ...ENEMY_TYPES[randomTypeKey] });
        }
    }
    
    function spawnEnemies() {
      const now = Date.now();
      if (spawnQueue.length === 0) {
        fillSpawnQueue();
      }

      if (enemies.length + spawnEffects.length < MAX_ENEMIES_ON_FIELD && spawnQueue.length > 0 && now >= nextSpawnTime) {
        const enemyData = spawnQueue.shift();
        const point = spawnPoints[spawnIndex % spawnPoints.length];
        spawnIndex++;
        
        spawnEffects.push({
          x: point.x,
          y: point.y,
          life: 60,
          maxLife: 60,
          enemyData: enemyData
        });

        nextSpawnTime = now + SPAWN_DELAY;
      }
    }
    
    function gameLoop() {
      try {
        lastLoopTime = Date.now(); // Update watchdog timer

        if (gameState === 'playing') {
          updatePlayer();
          updateBullets();
          updateEnemies();
          updateExplosions();
          updatePowerUps();
          updateSpawnEffects();
        }
        
        if (gameState === 'playing' || gameState === 'paused') {
          draw();
        }

        if (gameState === 'paused') {
          drawPauseOverlay();
        }
        
        updateUI();
      } catch (e) {
        logToServer(e.stack, 'ERROR');
        // Stop the game to prevent further errors
        gameState = 'gameOver'; 
      }
      
      if (gameState !== 'gameOver') {
        requestAnimationFrame(gameLoop);
      }
    }
    
    function startGame() {
      gameState = 'playing';
      lives = 3;
      score = 0;
      level = 1;
      timer = 180;
      if(timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(updateTimer, 1000);
      startFreezeDetector();

      document.getElementById('titleScreen').style.display = 'none';
      document.getElementById('gameOver').style.display = 'none';
      uiPanel.classList.remove('hidden');
      pauseButton.textContent = 'Пауза';
      initLevel();
      updateUI();
      
      // Start the game loop if it's the very first time
      if (!window.gameLoopStarted) {
          window.gameLoopStarted = true;
          gameLoop();
      }
    }
    
    function gameOver() {
      if (gameState === 'gameOver') return;
      gameState = 'gameOver';
      if(timerInterval) clearInterval(timerInterval);
      if(freezeDetectorInterval) clearInterval(freezeDetectorInterval);
      document.getElementById('finalScore').textContent = score;
      document.getElementById('gameOver').style.display = 'block';
    }
    
    function updateUI() {
      if (gameState === 'playing' || gameState === 'gameOver' || gameState === 'paused') {
          uiLevel.textContent = level;
          uiLives.textContent = lives > 0 ? lives : 0;
          uiScore.textContent = score;
          
          const minutes = Math.floor(timer / 60);
          const seconds = timer % 60;
          uiTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }

    function updateTimer() {
        if (gameState === 'playing') {
            timer--;
            if (timer <= 0) {
                timer = 0;
                gameOver();
            }
        }
    }

    // --- Setup ---
    // All other functions (drawing, collision, etc.) are assumed to be here and correct.
    // I will only show the modified and new functions for brevity.

    // The following are placeholders for functions that are not shown but are required for the game to run
    function createBrickQuadrantSprite() {}
    function create3DConcreteWallSprite() {}
    function create3DBulletSprite() {}
    function create3DExplosionSprite() {}
    function createWaterSprite() {}
    function createPowerUpSprite(type) {}
    function createBaseSprite(isDestroyed) {}
    function createSpawnEffectSprite() {}
    function initSprites() {}
    function generateWalls() {}
    function generateWater() {}
    function spawnPowerUp(x, y) {}
    function updateSpawnEffects() {}
    function createBulletFor(entity, owner) {}
    function shoot() {}
    function canMoveTo(entity, newX, newY) {}
    function updatePlayer() {
        // Движение игрока
        if (keys['arrowup'] || keys['w']) {
            player.y -= player.speed;
            player.direction = 0;
        }
        if (keys['arrowright'] || keys['d']) {
            player.x += player.speed;
            player.direction = 1;
        }
        if (keys['arrowdown'] || keys['s']) {
            player.y += player.speed;
            player.direction = 2;
        }
        if (keys['arrowleft'] || keys['a']) {
            player.x -= player.speed;
            player.direction = 3;
        }
        
        // Ограничение движения в пределах canvas
        player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
        player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
    }
    function tryMove(entity, direction, dx, dy) {}
    function updateBullets() {}
    function isPathClear(from, to) {}
    function getDirectionToTarget(enemy, target) {}
    function chooseRandomPatrolTarget() {}
    function updateEnemies() {}
    function updatePowerUps() {}
    function activatePowerUp(type) {}
    function fortifyBase() {}
    function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {}
    function checkObstacleCollision(x, y, width, height) {}
    function checkDynamicCollision(x, y, width, height, movingEntity) {}
    function createExplosion(x, y) {}
    function updateExplosions() {}
    function drawBackground(targetCtx) {}
    function draw() {
        // Очистка canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Отрисовка игрока
        // Основной корпус танка
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // 3D эффект корпуса
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(player.x, player.y, player.width, 4);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(player.x, player.y + player.height - 4, player.width, 4);
        
        // Гусеницы
        ctx.fillStyle = '#444';
        ctx.fillRect(player.x - 3, player.y - 2, 3, player.height + 4);
        ctx.fillRect(player.x + player.width, player.y - 2, 3, player.height + 4);
        
        // Башня
        ctx.fillStyle = '#777';
        ctx.fillRect(player.x + 10, player.y + 10, 12, 12);
        
        // Пушка в зависимости от направления
        ctx.fillStyle = '#999';
        switch(player.direction) {
            case 0: // вверх
                ctx.fillRect(player.x + 14, player.y - 10, 4, 10);
                break;
            case 1: // вправо
                ctx.fillRect(player.x + 22, player.y + 14, 10, 4);
                break;
            case 2: // вниз
                ctx.fillRect(player.x + 14, player.y + 22, 4, 10);
                break;
            case 3: // влево
                ctx.fillRect(player.x - 10, player.y + 14, 10, 4);
                break;
        }
    }
    function togglePause() {}
    function restartCurrentLevel() {}
    function restartGame() {}
    function showMenu() {
        document.body.style.backgroundColor = 'hotpink';
        gameState = 'title';
        document.getElementById('titleScreen').style.display = 'block';
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('uiPanel').style.display = 'none';
    }
    function drawPauseOverlay() {}

    function setupEventListeners() {
        document.getElementById('startButton').addEventListener('click', startGame);
        document.getElementById('restartButton').addEventListener('click', restartGame);
        // document.getElementById('menuButton').addEventListener('click', showMenu);
        
        document.getElementById('pauseButton').addEventListener('click', togglePause);
        // document.getElementById('restartLevelButton').addEventListener('click', restartCurrentLevel);

        document.addEventListener('keydown', (e) => {
            keys[e.key.toLowerCase()] = true;
            if (e.key === ' ' && gameState === 'playing') shoot();
        });
        document.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
    }

    initSprites();
    setupEventListeners();
    showMenu();
    // The game loop is started by the startGame function now
});