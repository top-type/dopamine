/**
 * Entity - Base class for all game objects
 */
class Entity {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.rotation = 0;
        this.radius = 20; // Default collision radius
        this.type = 'entity';
        this.shouldRemove = false;
    }
    
    /**
     * Update entity state
     */
    update(deltaTime) {
        // Update position based on velocity
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Check if out of bounds
        if (!this.game.collision.isInBounds(this, this.game)) {
            this.shouldRemove = true;
        }
    }
    
    /**
     * Render entity
     */
    render(ctx) {
        // Default rendering is a circle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw direction indicator
        ctx.strokeStyle = '#888888';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x + Math.cos(this.rotation) * this.radius,
            this.y + Math.sin(this.rotation) * this.radius
        );
        ctx.stroke();
    }
    
    /**
     * Set velocity based on speed and direction
     */
    setVelocity(speed, direction) {
        this.vx = Math.cos(direction) * speed;
        this.vy = Math.sin(direction) * speed;
        this.rotation = direction;
    }
    
    /**
     * Get the current speed (magnitude of velocity)
     */
    getSpeed() {
        return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    }
    
    /**
     * Get the current direction (angle of velocity)
     */
    getDirection() {
        return Math.atan2(this.vy, this.vx);
    }
    
    /**
     * Calculate distance to another entity
     */
    distanceTo(entity) {
        const dx = this.x - entity.x;
        const dy = this.y - entity.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Calculate angle to another entity
     */
    angleTo(entity) {
        return Math.atan2(entity.y - this.y, entity.x - this.x);
    }
    
    /**
     * Check if this entity is colliding with another entity
     */
    isCollidingWith(entity) {
        return this.distanceTo(entity) < this.radius + entity.radius;
    }
} 