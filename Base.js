// Base.js - База игрока
export class Base {
    constructor(canvasWidth, canvasHeight) {
        this.x = canvasWidth / 2 - 24;
        this.y = canvasHeight - 48;
        this.width = 48;
        this.height = 48;
        this.isDestroyed = false;
    }
    
    draw(ctx) {
        if (this.isDestroyed) {
            ctx.fillStyle = '#666666';
        } else {
            ctx.fillStyle = '#FFFF00';
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Детали базы
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x + 5, this.y + 5, 15, 15);
        ctx.fillRect(this.x + 28, this.y + 5, 15, 15);
        ctx.fillRect(this.x + 5, this.y + 28, 15, 15);
        ctx.fillRect(this.x + 28, this.y + 28, 15, 15);
    }
}