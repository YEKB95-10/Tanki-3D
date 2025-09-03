// Enemy.js - Вражеские танки
export class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.type = type;
        this.direction = 0;
        this.lastShot = 0;
        this.shotCooldown = 1000;
        
        // Настройки в зависимости от типа
        switch(type) {
            case 'light':
                this.color = '#FFFFFF';
                this.speed = 1;
                this.health = 1;
                break;
            case 'fast':
                this.color = '#FFFF00';
                this.speed = 3;
                this.health = 2;
                break;
            case 'heavy':
                this.color = '#FF0000';
                this.speed = 1;
                this.health = 4;
                break;
        }
    }
    
    update(playerX, playerY, bulletManager) {
        // Простое движение к игроку
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
        
        // Определение направления
        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? 1 : 3; // право/лево
        } else {
            this.direction = dy > 0 ? 2 : 0; // вниз/вверх
        }
        
        // Стрельба
        this.shoot(bulletManager, playerX, playerY);
    }
    
    shoot(bulletManager, playerX, playerY) {
        const now = Date.now();
        if (now - this.lastShot >= this.shotCooldown) {
            this.lastShot = now;
            
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                const bulletDx = (dx / distance) * 6;
                const bulletDy = (dy / distance) * 6;
                const bulletX = this.x + this.width / 2;
                const bulletY = this.y + this.height / 2;
                
                bulletManager.createBullet(bulletX, bulletY, bulletDx, bulletDy, 'enemy');
            }
        }
    }
    
    draw(ctx) {
        // Основной корпус танка
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 3D эффект корпуса
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(this.x, this.y, this.width, 3);
        
        // Для тяжелого танка добавляем броню
        if (this.type === 'heavy') {
            ctx.fillStyle = 'rgba(100, 0, 0, 0.3)';
            ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, 2);
            ctx.fillRect(this.x - 2, this.y + this.height, this.width + 4, 2);
        }
        
        // Гусеницы
        ctx.fillStyle = '#444';
        ctx.fillRect(this.x - 3, this.y - 1, 3, this.height + 2);
        ctx.fillRect(this.x + this.width, this.y - 1, 3, this.height + 2);
        
        // Башня
        ctx.fillStyle = this.type === 'heavy' ? '#666' : '#888';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Пушка
        ctx.fillStyle = '#999';
        switch(this.direction) {
            case 0: // вверх
                ctx.fillRect(this.x + this.width/2 - 1, this.y - 8, 2, 8);
                break;
            case 1: // вправо
                ctx.fillRect(this.x + this.width, this.y + this.height/2 - 1, 8, 2);
                break;
            case 2: // вниз
                ctx.fillRect(this.x + this.width/2 - 1, this.y + this.height, 2, 8);
                break;
            case 3: // влево
                ctx.fillRect(this.x - 8, this.y + this.height/2 - 1, 8, 2);
                break;
        }
    }
}

// Менеджер врагов
export class EnemyManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.enemies = [];
        this.spawnEnemies();
    }
    
    spawnEnemies() {
        this.enemies = [
            new Enemy(100, 100, 'light'),
            new Enemy(300, 100, 'fast'),
            new Enemy(500, 100, 'heavy')
        ];
    }
    
    update(player, base, bulletManager, wallManager) {
        for (let enemy of this.enemies) {
            enemy.update(player.x, player.y, bulletManager);
        }
    }
    
    draw(ctx) {
        for (let enemy of this.enemies) {
            enemy.draw(ctx);
        }
    }
}