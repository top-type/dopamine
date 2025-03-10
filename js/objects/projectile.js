/**
 * Projectile - Represents a projectile in the game
 */
import { Entity } from './entity.js';

export class Projectile extends Entity {
    constructor(game, x, y, speed, direction, damage, source, color = '#ffffff') {
        super(game, x, y);
        
        this.type = 'projectile';
        this.radius = 5;
        this.damage = damage;
        this.source = source; // 'player' or 'enemy'
        this.color = color;
        
        // Set velocity based on speed and direction
        this.setVelocity(speed, direction);
        
        // Projectiles have a limited lifetime
        this.lifetime = 2; // seconds
        this.timeAlive = 0;
        
        // Trail effect
        this.trailInterval = 0.05; // seconds between trail particles
        this.lastTrailTime = 0;
    }
    
    /**
     * Update projectile state
     */
    update(deltaTime) {
        // Update time alive
        this.timeAlive += deltaTime;
        
        // Check if lifetime exceeded
        if (this.timeAlive >= this.lifetime) {
            this.shouldRemove = true;
            return;
        }
        
        // Create trail effect
        if (this.timeAlive - this.lastTrailTime >= this.trailInterval) {
            this.createTrail();
            this.lastTrailTime = this.timeAlive;
        }
        
        // Call parent update method
        super.update(deltaTime);
    }
    
    /**
     * Create trail particle effect
     */
    createTrail() {
        // Create trail particle
        this.game.particleSystem.createTrail(
            this.x,
            this.y,
            this.source === 'player' ? '#00aaff' : '#ff5500',
            this.radius * 0.7
        );
    }
    
    /**
     * Render the projectile
     */
    render(ctx) {
        // Draw projectile
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        if (this.source === 'player') {
            // Player projectiles are more streamlined
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            
            // Draw elongated shape
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * 2, this.radius, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Add glow effect
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * 2.5, this.radius * 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            
            ctx.restore();
        } else {
            // Enemy projectiles are more circular
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Add glow effect
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
} 