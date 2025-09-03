// Bullet.js - Пули
export class Bullet {
    constructor(x, y, dx, dy, owner) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 4;
        this.dx = dx;
        this.dy = dy;
        this.owner = owner; // 'player' или 'enemy'
        this.color = owner === 'player' ? '#FFFF00' : '#FF0000';
    }
    
    update() {
        this.x += this.dx;
        this.y += this.dy;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Менеджер пуль
export class BulletManager {
    constructor() {
        this.bullets = [];
    }
    
    createBullet(x, y, dx, dy, owner) {
        this.bullets.push(new Bullet(x, y, dx, dy, owner));
    }
    
    update(wallManager, base, player, enemyManager) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update();
            
            // Удаление пуль за пределами экрана
            if (bullet.x < 0 || bullet.y < 0 || bullet.x > 1000 || bullet.y > 700) {
                this.bullets.splice(i, 1);
                continue;
            }
            
            // Проверка коллизий со стенами
            if (wallManager.checkCollision(bullet.x, bullet.y, bullet.width, bullet.height)) {
                this.bullets.splice(i, 1);
                continue;
            }
            
            // Проверка коллизий с базой
            if (this.checkCollision(bullet.x, bullet.y, bullet.width, bullet.height,
                                  base.x, base.y, base.width, base.height)) {
                if (bullet.owner === 'enemy') {
                    base.isDestroyed = true;
                }
                this.bullets.splice(i, 1);
                continue;
            }
            
            // Проверка коллизий с игроком
            if (bullet.owner === 'enemy' && 
                this.checkCollision(bullet.x, bullet.y, bullet.width, bullet.height,
                                  player.x, player.y, player.width, player.height)) {
                this.bullets.splice(i, 1);
                continue;
            }
            
            // Проверка коллизий с врагами
            if (bullet.owner === 'player') {
                for (let j = enemyManager.enemies.length - 1; j >= 0; j--) {
                    const enemy = enemyManager.enemies[j];
                    if (this.checkCollision(bullet.x, bullet.y, bullet.width, bullet.height,
                                          enemy.x, enemy.y, enemy.width, enemy.height)) {
                        enemy.health--;
                        if (enemy.health <= 0) {
                            enemyManager.enemies.splice(j, 1);
                        }
                        this.bullets.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
    
    checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }
    
    draw(ctx) {
        for (let bullet of this.bullets) {
            bullet.draw(ctx);
        }
    }
}