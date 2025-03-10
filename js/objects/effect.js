/**
 * Effect - Visual or gameplay effects in the game
 * Extends the base Entity class
 */
import { Entity } from './entity.js';

export class Effect extends Entity {
    constructor(game, x, y, duration, type = 'visual') {
        super(game, x, y);
        
        this.type = 'effect';
        this.effectType = type;
        this.radius = 30;
        
        // Effect properties
        this.duration = duration;
        this.timeAlive = 0;
        this.renderBehind = false; // Whether to render behind other entities
        
        // Animation properties
        this.animationProgress = 0;
        this.color = '#ffffff';
        
        // Initialize based on effect type
        this.initializeEffectType();
    }
    
    /**
     * Initialize effect properties based on type
     */
    initializeEffectType() {
        switch (this.effectType) {
            case 'explosion':
                this.radius = 50;
                this.color = '#ff5500';
                this.renderBehind = false;
                break;
                
            case 'shield':
                this.radius = 40;
                this.color = '#00aaff';
                this.renderBehind = false;
                break;
                
            case 'teleport':
                this.radius = 30;
                this.color = '#aa00ff';
                this.renderBehind = false;
                break;
                
            case 'blackHole':
                this.radius = 60;
                this.color = '#000000';
                this.renderBehind = true;
                break;
                
            case 'sunBomb':
                this.radius = 70;
                this.color = '#ffff00';
                this.renderBehind = true;
                break;
                
            case 'timeWarp':
                this.radius = 100;
                this.color = '#00ffff';
                this.renderBehind = true;
                break;
                
            default: // visual
                this.radius = 30;
                this.color = '#ffffff';
                this.renderBehind = false;
                break;
        }
    }
    
    /**
     * Update effect state
     */
    update(deltaTime) {
        // Update time alive
        this.timeAlive += deltaTime;
        
        // Update animation progress
        this.animationProgress = this.timeAlive / this.duration;
        
        // Check if duration exceeded
        if (this.timeAlive >= this.duration) {
            this.shouldRemove = true;
            return;
        }
        
        // Update based on effect type
        this.updateEffect(deltaTime);
        
        // Call parent update method (without the out-of-bounds check)
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
    }
    
    /**
     * Update effect based on type
     */
    updateEffect(deltaTime) {
        switch (this.effectType) {
            case 'explosion':
                // Explosion grows quickly then fades
                this.radius = 50 * (1 + this.animationProgress);
                break;
                
            case 'shield':
                // Shield pulses
                this.radius = 40 + Math.sin(this.animationProgress * Math.PI * 4) * 10;
                break;
                
            case 'teleport':
                // Teleport shrinks then grows
                if (this.animationProgress < 0.5) {
                    this.radius = 30 * (1 - this.animationProgress * 2);
                } else {
                    this.radius = 30 * ((this.animationProgress - 0.5) * 2);
                }
                break;
                
            case 'blackHole':
                // Black hole grows and pulls entities
                this.radius = 60 * (0.5 + this.animationProgress * 0.5);
                this.pullEntities();
                break;
                
            case 'sunBomb':
                // Sun bomb grows then explodes
                if (this.animationProgress < 0.8) {
                    this.radius = 70 * (0.5 + this.animationProgress * 0.5);
                } else {
                    this.radius = 70 * (1 + (this.animationProgress - 0.8) * 10);
                }
                break;
                
            case 'timeWarp':
                // Time warp expands in waves
                this.radius = 100 * (0.5 + Math.sin(this.animationProgress * Math.PI * 6) * 0.5);
                break;
        }
    }
    
    /**
     * Pull entities towards black hole
     */
    pullEntities() {
        // Only pull if it's a black hole effect
        if (this.effectType !== 'blackHole') return;
        
        // Pull range
        const pullRange = this.radius * 3;
        const pullStrength = 200; // pixels per second
        
        // Pull player
        if (this.game.player) {
            const distance = this.distanceTo(this.game.player);
            
            if (distance < pullRange) {
                // Calculate pull direction
                const angle = this.game.player.angleTo(this);
                
                // Calculate pull force (stronger when closer)
                const force = pullStrength * (1 - distance / pullRange);
                
                // Apply pull force
                this.game.player.vx += Math.cos(angle) * force * 0.01;
                this.game.player.vy += Math.sin(angle) * force * 0.01;
            }
        }
        
        // Pull enemies
        for (const entity of this.game.entities) {
            if (entity.type === 'enemy') {
                const distance = this.distanceTo(entity);
                
                if (distance < pullRange) {
                    // Calculate pull direction
                    const angle = entity.angleTo(this);
                    
                    // Calculate pull force (stronger when closer)
                    const force = pullStrength * (1 - distance / pullRange);
                    
                    // Apply pull force
                    entity.vx += Math.cos(angle) * force * 0.02;
                    entity.vy += Math.sin(angle) * force * 0.02;
                }
            }
        }
    }
    
    /**
     * Render the effect
     */
    render(ctx) {
        // Draw effect based on type
        switch (this.effectType) {
            case 'explosion':
                this.renderExplosion(ctx);
                break;
                
            case 'shield':
                this.renderShield(ctx);
                break;
                
            case 'teleport':
                this.renderTeleport(ctx);
                break;
                
            case 'blackHole':
                this.renderBlackHole(ctx);
                break;
                
            case 'sunBomb':
                this.renderSunBomb(ctx);
                break;
                
            case 'timeWarp':
                this.renderTimeWarp(ctx);
                break;
                
            default:
                this.renderDefault(ctx);
                break;
        }
    }
    
    /**
     * Render explosion effect
     */
    renderExplosion(ctx) {
        // Create gradient
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        
        // Fade out as animation progresses
        const alpha = 1 - this.animationProgress;
        
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.3, `rgba(255, 200, 50, ${alpha})`);
        gradient.addColorStop(0.7, `rgba(255, 100, 50, ${alpha * 0.8})`);
        gradient.addColorStop(1, `rgba(100, 0, 0, 0)`);
        
        // Draw explosion
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Render shield effect
     */
    renderShield(ctx) {
        // Shield alpha pulses
        const alpha = 0.7 - 0.3 * Math.sin(this.animationProgress * Math.PI * 4);
        
        // Draw shield
        ctx.strokeStyle = `rgba(0, 170, 255, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw inner glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, this.radius * 0.7,
            this.x, this.y, this.radius
        );
        
        gradient.addColorStop(0, `rgba(0, 170, 255, 0)`);
        gradient.addColorStop(0.7, `rgba(0, 170, 255, ${alpha * 0.3})`);
        gradient.addColorStop(1, `rgba(0, 170, 255, ${alpha * 0.1})`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Render teleport effect
     */
    renderTeleport(ctx) {
        // Teleport effect is a series of rings
        const alpha = 1 - this.animationProgress;
        
        // Draw outer ring
        ctx.strokeStyle = `rgba(170, 0, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw middle ring
        ctx.strokeStyle = `rgba(100, 0, 255, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw inner ring
        ctx.strokeStyle = `rgba(50, 0, 255, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    /**
     * Render black hole effect
     */
    renderBlackHole(ctx) {
        // Create gradient
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 2
        );
        
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.3, 'rgba(20, 0, 40, 0.8)');
        gradient.addColorStop(0.7, 'rgba(40, 0, 80, 0.4)');
        gradient.addColorStop(1, 'rgba(60, 0, 120, 0)');
        
        // Draw black hole
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw accretion disk
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.animationProgress * Math.PI * 2);
        
        const diskGradient = ctx.createRadialGradient(
            0, 0, this.radius * 0.5,
            0, 0, this.radius * 1.2
        );
        
        diskGradient.addColorStop(0, 'rgba(100, 0, 200, 0)');
        diskGradient.addColorStop(0.5, 'rgba(150, 50, 255, 0.5)');
        diskGradient.addColorStop(1, 'rgba(200, 100, 255, 0)');
        
        ctx.fillStyle = diskGradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * 1.2, this.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * Render sun bomb effect
     */
    renderSunBomb(ctx) {
        // Create gradient
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 200, 0.9)');
        gradient.addColorStop(0.5, 'rgba(255, 200, 50, 0.7)');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        // Draw sun bomb
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw corona
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.animationProgress * Math.PI);
        
        // Draw spikes
        const spikes = 12;
        const innerRadius = this.radius * 0.8;
        const outerRadius = this.radius * 1.5;
        
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI * 2 * i) / (spikes * 2);
            
            if (i === 0) {
                ctx.moveTo(radius * Math.cos(angle), radius * Math.sin(angle));
            } else {
                ctx.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
            }
        }
        ctx.closePath();
        
        const coronaGradient = ctx.createRadialGradient(
            0, 0, innerRadius,
            0, 0, outerRadius
        );
        
        coronaGradient.addColorStop(0, 'rgba(255, 200, 0, 0.5)');
        coronaGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        ctx.fillStyle = coronaGradient;
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * Render time warp effect
     */
    renderTimeWarp(ctx) {
        // Time warp is a series of concentric circles
        const alpha = 0.7 - 0.5 * this.animationProgress;
        
        // Draw multiple rings
        for (let i = 0; i < 3; i++) {
            const ringRadius = this.radius * (0.5 + i * 0.25);
            const ringAlpha = alpha * (1 - i * 0.2);
            
            ctx.strokeStyle = `rgba(0, 255, 255, ${ringAlpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Draw distortion effect
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        
        gradient.addColorStop(0, `rgba(0, 255, 255, ${alpha * 0.1})`);
        gradient.addColorStop(0.7, `rgba(0, 200, 255, ${alpha * 0.05})`);
        gradient.addColorStop(1, `rgba(0, 150, 255, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Render default effect
     */
    renderDefault(ctx) {
        // Simple fading circle
        const alpha = 1 - this.animationProgress;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
} 