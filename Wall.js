// Wall.js - Стены
export class Wall {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.type = type; // 'brick' или 'concrete'
        this.color = type === 'brick' ? '#8B4513' : '#696969';
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Детали для кирпичной стены
        if (this.type === 'brick') {
            ctx.fillStyle = '#A0522D';
            ctx.fillRect(this.x + 2, this.y + 2, 8, 8);
            ctx.fillRect(this.x + 14, this.y + 2, 8, 8);
            ctx.fillRect(this.x + 2, this.y + 14, 8, 8);
            ctx.fillRect(this.x + 14, this.y + 14, 8, 8);
        }
    }
}

// Менеджер стен
export class WallManager {
    constructor() {
        this.walls = [];
    }
    
    generateWalls() {
        // Создаем несколько стен для тестирования
        this.walls = [
            new Wall(200, 200, 'brick'),
            new Wall(250, 200, 'brick'),
            new Wall(300, 200, 'concrete'),
            new Wall(200, 250, 'brick'),
            new Wall(300, 250, 'concrete'),
            new Wall(200, 300, 'brick'),
            new Wall(250, 300, 'brick'),
            new Wall(300, 300, 'concrete')
        ];
    }
    
    checkCollision(x, y, width, height) {
        for (let wall of this.walls) {
            if (x < wall.x + wall.width &&
                x + width > wall.x &&
                y < wall.y + wall.height &&
                y + height > wall.y) {
                return true;
            }
        }
        return false;
    }
    
    draw(ctx) {
        for (let wall of this.walls) {
            wall.draw(ctx);
        }
    }
}