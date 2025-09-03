// Player.js - Танк игрока
export class Player {
    constructor(canvasWidth, canvasHeight) {
        this.x = 500;
        this.y = 650;
        this.width = 32;
        this.height = 32;
        this.speed = 3;
        this.direction = 0; // 0: вверх, 1: вправо, 2: вниз, 3: влево
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.color = '#00ff00';
    }
    
    update(keys) {
        // Движение игрока
        if (keys['arrowup'] || keys['w']) {
            this.y -= this.speed;
            this.direction = 0;
        }
        if (keys['arrowright'] || keys['d']) {
            this.x += this.speed;
            this.direction = 1;
        }
        if (keys['arrowdown'] || keys['s']) {
            this.y += this.speed;
            this.direction = 2;
        }
        if (keys['arrowleft'] || keys['a']) {
            this.x -= this.speed;
            this.direction = 3;
        }
        
        // Ограничение движения в пределах canvas
        this.x = Math.max(0, Math.min(this.canvasWidth - this.width, this.x));
        this.y = Math.max(0, Math.min(this.canvasHeight - this.height, this.y));
    }
    
    draw(ctx) {
        // Основной корпус танка
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 3D эффект корпуса
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(this.x, this.y, this.width, 4);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(this.x, this.y + this.height - 4, this.width, 4);
        
        // Гусеницы
        ctx.fillStyle = '#444';
        ctx.fillRect(this.x - 3, this.y - 2, 3, this.height + 4);
        ctx.fillRect(this.x + this.width, this.y - 2, 3, this.height + 4);
        
        // Башня
        ctx.fillStyle = '#777';
        ctx.fillRect(this.x + 10, this.y + 10, 12, 12);
        
        // Пушка в зависимости от направления
        ctx.fillStyle = '#999';
        switch(this.direction) {
            case 0: // вверх
                ctx.fillRect(this.x + 14, this.y - 10, 4, 10);
                break;
            case 1: // вправо
                ctx.fillRect(this.x + 22, this.y + 14, 10, 4);
                break;
            case 2: // вниз
                ctx.fillRect(this.x + 14, this.y + 22, 4, 10);
                break;
            case 3: // влево
                ctx.fillRect(this.x - 10, this.y + 14, 10, 4);
                break;
        }
    }
}