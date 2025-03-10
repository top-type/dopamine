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
            console.log('Item collision detected with player');
            console.log('Item position:', this.x, this.y);
            console.log('Player position:', this.game.player.x, this.game.player.y);
            console.log('Item radius:', this.radius);
            console.log('Player radius:', this.game.player.radius);
            console.log('Distance:', this.distanceTo(this.game.player));
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
        console.log('=== ITEM COLLECTION DEBUGGING ===');
        console.log('Item collect method called with item data:', this.itemData);
        
        // Make sure the item has an ID
        if (!this.itemData.id) {
            this.itemData.id = 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            console.log('Generated new ID for item:', this.itemData.id);
        }
        
        // Make sure the item has all required properties
        if (!this.itemData.name) {
            console.error('Item missing name property:', this.itemData);
            return;
        }
        
        // If slot is missing but type exists, use type as slot
        if (!this.itemData.slot && this.itemData.type) {
            console.log(`Item missing slot property, using type '${this.itemData.type}' as slot`);
            this.itemData.slot = this.itemData.type;
        } else if (!this.itemData.slot) {
            console.error('Item missing slot property and no type to use as fallback:', this.itemData);
            return;
        }
        
        if (!this.itemData.rarity) {
            console.error('Item missing rarity property:', this.itemData);
            return;
        }
        
        console.log('Item data after validation:', JSON.stringify(this.itemData));
        
        let collected = false;
        
        // Try to add to player's inventory using equipment system
        if (this.game.equipmentSystem) {
            console.log('Attempting to add item via equipment system...');
            collected = this.game.equipmentSystem.addToInventory(this.itemData);
            console.log('Equipment system result:', collected);
        } else {
            console.log('Equipment system not available');
        }
        
        // If that fails, try adding directly to player's inventory
        if (!collected && this.game.player) {
            console.log('Attempting to add item directly to player inventory...');
            collected = this.game.player.addItemToInventory(this.itemData);
            console.log('Direct player inventory add result:', collected);
        } else if (!this.game.player) {
            console.log('Player object not available for direct inventory add');
        }
        
        console.log('Final item collection result:', collected);
        
        if (this.game.player && this.game.player.inventory) {
            console.log('Player inventory after collection (length):', this.game.player.inventory.length);
            console.log('Player inventory contents:', JSON.stringify(this.game.player.inventory));
        } else {
            console.log('Player inventory not available to check');
        }
        
        if (collected) {
            // Create collection effect
            if (this.game.particleSystem) {
                this.game.particleSystem.createExplosion(this.x, this.y, this.color, 10, 2, 50);
            }
            
            // Play collection sound
            if (this.game.audioSystem) {
                this.game.audioSystem.playSound('powerup');
            }
            
            // Show notification
            if (this.game.uiSystem) {
                this.game.uiSystem.showItemNotification(this.itemData);
            }
            
            // Mark for removal
            this.shouldRemove = true;
            console.log('Item marked for removal');
            
            // DO NOT force open the inventory panel - just show a notification
            // and let the player open the inventory through the menu when they want to
            
            // Don't try to save the game here - it's causing errors
            // The inventory will be saved when the player opens the menu or when the game is closed
        }
        
        console.log('=== END ITEM COLLECTION DEBUGGING ===');
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