/**
 * Item - Represents an equipment item that can be collected
 * Extends the base Entity class
 */
class Item extends Entity {
    constructor(game, x, y, itemData) {
        super(game, x, y);
        
        this.type = 'item';
        this.radius = 15;
        
        // Item properties
        this.itemData = itemData;
        this.slot = itemData.slot;
        this.name = itemData.name;
        this.rarity = itemData.rarity;
        this.stats = itemData.stats;
        this.description = itemData.description;
        
        // Movement properties
        this.floatAmplitude = 5;
        this.floatSpeed = 2;
        this.initialY = y;
        
        // Lifetime
        this.lifetime = 20; // seconds
        this.timeAlive = 0;
        this.blinkStart = 15; // start blinking after 15 seconds
        this.blinkRate = 0.2; // blink every 0.2 seconds
        this.visible = true;
        
        // Set color based on rarity
        this.setColorByRarity();
    }
    
    /**
     * Set color based on item rarity
     */
    setColorByRarity() {
        switch (this.rarity) {
            case 'common':
                this.color = '#ffffff';
                this.glowColor = 'rgba(255, 255, 255, 0.5)';
                break;
                
            case 'uncommon':
                this.color = '#00ff00';
                this.glowColor = 'rgba(0, 255, 0, 0.5)';
                break;
                
            case 'rare':
                this.color = '#0088ff';
                this.glowColor = 'rgba(0, 136, 255, 0.5)';
                break;
                
            case 'epic':
                this.color = '#aa00ff';
                this.glowColor = 'rgba(170, 0, 255, 0.5)';
                break;
                
            case 'legendary':
                this.color = '#ffaa00';
                this.glowColor = 'rgba(255, 170, 0, 0.5)';
                break;
                
            default:
                this.color = '#ffffff';
                this.glowColor = 'rgba(255, 255, 255, 0.5)';
                break;
        }
    }
    
    /**
     * Update item state
     */
    update(deltaTime) {
        // Update time alive
        this.timeAlive += deltaTime;
        
        // Check if lifetime exceeded
        if (this.timeAlive >= this.lifetime) {
            this.shouldRemove = true;
            return;
        }
        
        // Floating motion
        this.y = this.initialY + Math.sin(this.timeAlive * this.floatSpeed) * this.floatAmplitude;
        
        // Blinking effect when about to disappear
        if (this.timeAlive >= this.blinkStart) {
            this.visible = Math.floor(this.timeAlive / this.blinkRate) % 2 === 0;
        }
        
        // Check for player collection
        if (this.game.player && this.isCollidingWith(this.game.player)) {
            this.collect();
        }
        
        // Call parent update method (without the out-of-bounds check)
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
    }
    
    /**
     * Collect the item
     */
    collect() {
        // Add to player's inventory
        const collected = this.game.equipmentSystem.addToInventory(this.itemData);
        
        if (collected) {
            // Create collection effect
            this.game.particleSystem.createExplosion(this.x, this.y, this.color, 10, 2, 50);
            
            // Play collection sound
            this.game.audioSystem.playSound('powerup');
            
            // Show notification
            this.game.uiSystem.showItemNotification(this.itemData);
            
            // Mark for removal
            this.shouldRemove = true;
        }
    }
    
    /**
     * Render the item
     */
    render(ctx) {
        // Skip rendering if not visible (blinking)
        if (!this.visible) return;
        
        // Draw item
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Draw glow effect
        ctx.globalAlpha = 0.5 + Math.sin(this.timeAlive * 3) * 0.2;
        ctx.fillStyle = this.glowColor;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset alpha
        ctx.globalAlpha = 1;
        
        // Draw item shape based on slot
        ctx.fillStyle = this.color;
        
        switch (this.slot) {
            case 'primaryWeapon':
                // Primary weapon (triangle)
                ctx.beginPath();
                ctx.moveTo(this.radius, 0);
                ctx.lineTo(-this.radius / 2, -this.radius);
                ctx.lineTo(-this.radius / 2, this.radius);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'secondaryWeapon':
                // Secondary weapon (square)
                ctx.fillRect(-this.radius / 2, -this.radius / 2, this.radius, this.radius);
                break;
                
            case 'armor':
                // Armor (hexagon)
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI * 2 * i) / 6;
                    const x = Math.cos(angle) * this.radius;
                    const y = Math.sin(angle) * this.radius;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'engine':
                // Engine (circle with details)
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Add details
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-this.radius / 2, -this.radius / 2);
                ctx.lineTo(this.radius / 2, this.radius / 2);
                ctx.moveTo(this.radius / 2, -this.radius / 2);
                ctx.lineTo(-this.radius / 2, this.radius / 2);
                ctx.stroke();
                break;
                
            case 'shield':
                // Shield (circle)
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Add shield effect
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, this.radius * 0.7, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            case 'special':
                // Special (star)
                ctx.beginPath();
                const spikes = 5;
                const outerRadius = this.radius;
                const innerRadius = this.radius / 2;
                
                for (let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (Math.PI * 2 * i) / (spikes * 2);
                    
                    if (i === 0) {
                        ctx.moveTo(radius, 0);
                    } else {
                        ctx.lineTo(
                            radius * Math.cos(angle),
                            radius * Math.sin(angle)
                        );
                    }
                }
                
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'fluxCapacitorPrimary':
            case 'fluxCapacitorSecondary':
                // Flux capacitor (diamond)
                ctx.beginPath();
                ctx.moveTo(0, -this.radius);
                ctx.lineTo(this.radius, 0);
                ctx.lineTo(0, this.radius);
                ctx.lineTo(-this.radius, 0);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'navigationCore':
                // Navigation core (octagon)
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 * i) / 8;
                    const x = Math.cos(angle) * this.radius;
                    const y = Math.sin(angle) * this.radius;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.fill();
                break;
                
            default:
                // Default (circle)
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
        
        ctx.restore();
    }
} 