/**
 * Player - The player's ship
 * Extends the base Entity class
 */
class Player extends Entity {
    constructor(game) {
        // Position player in the middle-bottom of the screen
        const x = game.canvas.width / 2;
        const y = game.canvas.height * 0.8;
        
        super(game, x, y);
        
        this.type = 'player';
        this.radius = 25;
        
        // Movement properties
        this.baseSpeed = 300; // Base speed in pixels per second
        this.currentSpeed = this.baseSpeed;
        
        // Shield properties
        this.maxShield = 100;
        this.shield = this.maxShield;
        this.shieldRegenRate = 5; // Shield points per second
        this.shieldRegenDelay = 3; // Seconds before shield starts regenerating
        this.lastDamageTime = 0;
        
        // Combat properties
        this.isInvulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 1; // 1 second of invulnerability after taking damage
        this.collisionDamage = 5; // Base collision damage (increased with Juggernaut specialization)
        
        // Weapon properties
        this.primaryWeapon = {
            damage: 25,
            fireRate: 5, // Shots per second
            projectileSpeed: 500,
            lastFireTime: 0
        };
        
        // Special abilities
        this.specialAbilities = [
            // Default abilities will be added by specializations
        ];
        
        // Inventory - ensure it's initialized as an array
        this.inventory = [];
        this.maxInventorySize = 20;
        
        // Equipment slots
        this.equipment = {
            primaryWeapon: null,
            armor: null,
            engine: null,
            shield: null,
            special: null,
            fluxCapacitorPrimary: null,
            fluxCapacitorSecondary: null,
            navigationCore: null
        };
        
        console.log('Player initialized with empty inventory:', this.inventory);
    }
    
    /**
     * Update player state
     */
    update(deltaTime) {
        // Handle movement
        this.handleMovement(deltaTime);
        
        // Handle weapons
        this.handleWeapons(deltaTime);
        
        // Handle special abilities
        this.handleSpecialAbilities(deltaTime);
        
        // Regenerate shield
        this.regenerateShield(deltaTime);
        
        // Update invulnerability
        if (this.isInvulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.isInvulnerable = false;
            }
        }
        
        // Call parent update method
        super.update(deltaTime);
    }
    
    /**
     * Handle player movement based on input
     */
    handleMovement(deltaTime) {
        const direction = this.game.input.getMovementDirection();
        
        // Update velocity based on input
        this.vx = direction.x * this.currentSpeed;
        this.vy = direction.y * this.currentSpeed;
        
        // Update rotation to face movement direction if moving
        if (direction.x !== 0 || direction.y !== 0) {
            this.rotation = Math.atan2(direction.y, direction.x);
        }
        
        // Keep player within bounds
        const margin = 10;
        
        if (this.x - this.radius < margin) {
            this.x = this.radius + margin;
        } else if (this.x + this.radius > this.game.canvas.width - margin) {
            this.x = this.game.canvas.width - this.radius - margin;
        }
        
        if (this.y - this.radius < margin) {
            this.y = this.radius + margin;
        } else if (this.y + this.radius > this.game.canvas.height - margin) {
            this.y = this.game.canvas.height - this.radius - margin;
        }
        
        // Create thruster particles if moving
        if (this.vx !== 0 || this.vy !== 0) {
            // Calculate thruster position (behind the ship)
            const thrusterX = this.x - Math.cos(this.rotation) * this.radius * 0.8;
            const thrusterY = this.y - Math.sin(this.rotation) * this.radius * 0.8;
            
            // Create thruster particles
            this.game.particleSystem.createThruster(
                thrusterX,
                thrusterY,
                this.rotation + Math.PI, // Opposite direction of ship
                '#00aaff'
            );
        }
    }
    
    /**
     * Handle weapons based on input
     */
    handleWeapons(deltaTime) {
        const currentTime = this.game.gameTime;
        
        // Primary weapon
        if (this.game.input.isKeyDown('primary')) {
            const timeSinceLastFire = currentTime - this.primaryWeapon.lastFireTime;
            
            if (timeSinceLastFire >= 1 / this.primaryWeapon.fireRate) {
                this.firePrimaryWeapon();
                this.primaryWeapon.lastFireTime = currentTime;
            }
        }
    }
    
    /**
     * Handle special abilities based on input
     */
    handleSpecialAbilities(deltaTime) {
        // Update cooldowns
        for (let i = 0; i < this.specialAbilities.length; i++) {
            const ability = this.specialAbilities[i];
            
            // Reduce cooldown if it's active
            if (ability.currentCooldown > 0) {
                ability.currentCooldown -= deltaTime;
                
                // Ensure cooldown doesn't go below 0
                if (ability.currentCooldown < 0) {
                    ability.currentCooldown = 0;
                }
                
                // Update UI cooldown indicator
                if (this.game.uiSystem && this.game.uiSystem.updateSkillCooldown) {
                    this.game.uiSystem.updateSkillCooldown(ability.id, ability.currentCooldown, ability.cooldown);
                }
            }
        }
        
        // Check for ability activation keys (1-5)
        if (this.game.input.isKeyPressed('1') && this.specialAbilities.length >= 1) {
            this.useSpecialAbility(0);
        }
        if (this.game.input.isKeyPressed('2') && this.specialAbilities.length >= 2) {
            this.useSpecialAbility(1);
        }
        if (this.game.input.isKeyPressed('3') && this.specialAbilities.length >= 3) {
            this.useSpecialAbility(2);
        }
        if (this.game.input.isKeyPressed('4') && this.specialAbilities.length >= 4) {
            this.useSpecialAbility(3);
        }
        if (this.game.input.isKeyPressed('5') && this.specialAbilities.length >= 5) {
            this.useSpecialAbility(4);
        }
    }
    
    /**
     * Regenerate shield over time
     */
    regenerateShield(deltaTime) {
        const currentTime = this.game.gameTime;
        
        // Check if enough time has passed since last damage
        if (currentTime - this.lastDamageTime >= this.shieldRegenDelay && this.shield < this.maxShield) {
            this.shield += this.shieldRegenRate * deltaTime;
            
            // Cap shield at max
            if (this.shield > this.maxShield) {
                this.shield = this.maxShield;
            }
            
            // Update UI
            this.game.uiSystem.updateShieldDisplay();
        }
    }
    
    /**
     * Fire the primary weapon
     */
    firePrimaryWeapon() {
        // Calculate projectile spawn position (in front of the ship)
        const spawnX = this.x + Math.cos(this.rotation) * this.radius;
        const spawnY = this.y + Math.sin(this.rotation) * this.radius;
        
        // Create projectile
        const projectile = new Projectile(
            this.game,
            spawnX,
            spawnY,
            this.primaryWeapon.projectileSpeed,
            this.rotation,
            this.primaryWeapon.damage,
            'player',
            '#00ffff'
        );
        
        // Add to game projectiles
        this.game.projectiles.push(projectile);
        
        // Create weapon fire effect
        this.game.particleSystem.createWeaponFire(spawnX, spawnY, this.rotation, '#00ffff');
        
        // Play sound
        this.game.audioSystem.playSound('laser1');
    }
    
    /**
     * Use a special ability
     * @param {number} index - Index of the special ability to use
     * @returns {boolean} - Whether the ability was successfully used
     */
    useSpecialAbility(index) {
        // Check if the ability exists
        if (!this.specialAbilities[index]) {
            console.log(`No special ability at index ${index}`);
            return false;
        }
        
        const ability = this.specialAbilities[index];
        
        // Check if the ability is on cooldown
        if (ability.currentCooldown > 0) {
            console.log(`${ability.name} is on cooldown: ${ability.currentCooldown.toFixed(1)}s remaining`);
            return false;
        }
        
        console.log(`Using special ability: ${ability.name}`);
        
        // Set the ability on cooldown
        ability.currentCooldown = ability.cooldown;
        
        // Update UI cooldown indicator
        if (this.game.uiSystem && this.game.uiSystem.updateSkillCooldown) {
            this.game.uiSystem.updateSkillCooldown(ability.id, ability.currentCooldown, ability.cooldown);
        }
        
        // Execute the ability effect if it exists
        if (ability.effect && typeof ability.effect === 'function') {
            ability.effect(this.game, this);
        } else {
            // Default effects based on ability name if no specific effect function
            switch (ability.name.toLowerCase()) {
                case 'shield boost':
                    // Temporary shield boost
                    this.shield = Math.min(this.shield + this.maxShield * 0.3, this.maxShield);
                    
                    // Create shield effect
                    this.game.particleSystem.createExplosion(this.x, this.y, '#00ffff', 30, 5, 150);
                    break;
                    
                case 'rapid fire':
                    // Temporary fire rate boost
                    this.primaryWeapon.fireRate *= 2;
                    
                    // Reset after 5 seconds
                    setTimeout(() => {
                        this.primaryWeapon.fireRate /= 2;
                    }, 5000);
                    break;
                    
                case 'bomb':
                    // Damage all enemies in range
                    const bombRadius = 200;
                    this.game.entities.forEach(entity => {
                        if (entity.type === 'enemy' && this.distanceTo(entity) < bombRadius) {
                            entity.takeDamage(this.primaryWeapon.damage * 3);
                        }
                    });
                    
                    // Create explosion effect
                    this.game.particleSystem.createExplosion(this.x, this.y, '#ff0000', 50, 8, 200);
                    break;
                    
                default:
                    console.log(`No default effect for ability: ${ability.name}`);
                    break;
            }
        }
        
        return true;
    }
    
    /**
     * Take damage
     */
    takeDamage(amount) {
        // Ignore damage if invulnerable
        if (this.isInvulnerable) return;
        
        // Apply damage to shield
        this.shield -= amount;
        this.lastDamageTime = this.game.gameTime;
        
        // Create shield impact effect
        const impactAngle = Math.random() * Math.PI * 2;
        this.game.particleSystem.createShieldImpact(this.x, this.y, impactAngle);
        
        // Play shield hit sound
        this.game.audioSystem.playSound('shield_hit');
        
        // Update UI
        this.game.uiSystem.updateShieldDisplay();
        
        // Check if shield is depleted
        if (this.shield <= 0) {
            this.shield = 0;
            this.die();
        } else {
            // Become invulnerable briefly
            this.isInvulnerable = true;
            this.invulnerabilityTime = this.invulnerabilityDuration;
        }
    }
    
    /**
     * Player death
     */
    die() {
        // Create explosion effect
        this.game.particleSystem.createExplosion(this.x, this.y, '#00ffff', 50, 5, 200);
        
        // Play explosion sound
        this.game.audioSystem.playSound('explosion');
        
        // End the game
        this.game.gameOver();
    }
    
    /**
     * Handle level up effects
     */
    onLevelUp() {
        // Increase max shield
        this.maxShield += 10;
        this.shield = this.maxShield;
        
        // Increase damage
        this.primaryWeapon.damage += 2;
        
        // Update UI
        if (this.game.uiSystem && this.game.uiSystem.updateShieldDisplay) {
            this.game.uiSystem.updateShieldDisplay();
        }
        
        // Play level up sound
        if (this.game.audioSystem && this.game.audioSystem.playSound) {
            this.game.audioSystem.playSound('level_up');
        }
        
        console.log(`Player leveled up! New shield: ${this.maxShield}, New damage: ${this.primaryWeapon.damage}`);
    }
    
    /**
     * Add a skill to the player's abilities
     * @param {Object} skill - The skill to add
     */
    addSkill(skill) {
        console.log(`Adding skill to player: ${skill.name}`);
        
        // Check if this is an active skill that should be added to special abilities
        if (skill.type === 'active') {
            // Create a new special ability from the skill
            const specialAbility = {
                name: skill.name,
                description: skill.description,
                cooldown: skill.cooldown,
                currentCooldown: 0,
                effect: skill.effect,
                icon: skill.icon,
                id: skill.id,
                specialization: skill.specialization
            };
            
            // Add to special abilities array
            this.specialAbilities.push(specialAbility);
            
            console.log(`Added active skill: ${skill.name} to special abilities`);
        } 
        // If it's a passive skill, apply its effects directly
        else if (skill.type === 'passive') {
            // Apply passive skill effects
            if (skill.effects) {
                skill.effects.forEach(effect => {
                    switch (effect.type) {
                        case 'damage':
                            this.primaryWeapon.damage *= (1 + effect.value);
                            console.log(`Applied damage boost: ${effect.value * 100}%`);
                            break;
                            
                        case 'shield':
                            this.maxShield *= (1 + effect.value);
                            this.shield = this.maxShield;
                            console.log(`Applied shield boost: ${effect.value * 100}%`);
                            break;
                            
                        case 'speed':
                            this.baseSpeed *= (1 + effect.value);
                            this.currentSpeed = this.baseSpeed;
                            console.log(`Applied speed boost: ${effect.value * 100}%`);
                            break;
                            
                        case 'fireRate':
                            this.primaryWeapon.fireRate *= (1 + effect.value);
                            console.log(`Applied fire rate boost: ${effect.value * 100}%`);
                            break;
                            
                        case 'shieldRegen':
                            this.shieldRegenRate *= (1 + effect.value);
                            console.log(`Applied shield regen boost: ${effect.value * 100}%`);
                            break;
                            
                        case 'collisionDamage':
                            this.collisionDamage *= (1 + effect.value);
                            console.log(`Applied collision damage boost: ${effect.value * 100}%`);
                            break;
                            
                        default:
                            console.log(`Unknown effect type: ${effect.type}`);
                            break;
                    }
                });
            }
            
            console.log(`Applied passive skill: ${skill.name}`);
        }
    }
    
    /**
     * Update an existing skill
     * @param {Object} skill - The skill to update
     */
    updateSkill(skill) {
        console.log(`Updating skill: ${skill.name} (Level ${skill.level})`);
        
        // For active skills, update the corresponding special ability
        if (skill.type === 'active') {
            const abilityIndex = this.specialAbilities.findIndex(ability => ability.id === skill.id);
            
            if (abilityIndex !== -1) {
                // Update properties that might change with level
                this.specialAbilities[abilityIndex].cooldown = skill.cooldown;
                this.specialAbilities[abilityIndex].effect = skill.effect;
                
                console.log(`Updated active skill: ${skill.name}`);
            } else {
                console.error(`Tried to update non-existent skill: ${skill.name}`);
                // If not found, add it as a new skill
                this.addSkill(skill);
            }
        }
        // For passive skills, apply additional effects based on level
        else if (skill.type === 'passive' && skill.effects) {
            skill.effects.forEach(effect => {
                // Apply the effect again for each level
                switch (effect.type) {
                    case 'damage':
                        this.primaryWeapon.damage *= (1 + effect.value);
                        console.log(`Applied additional damage boost: ${effect.value * 100}%`);
                        break;
                        
                    case 'shield':
                        this.maxShield *= (1 + effect.value);
                        this.shield = this.maxShield;
                        console.log(`Applied additional shield boost: ${effect.value * 100}%`);
                        break;
                        
                    case 'speed':
                        this.baseSpeed *= (1 + effect.value);
                        this.currentSpeed = this.baseSpeed;
                        console.log(`Applied additional speed boost: ${effect.value * 100}%`);
                        break;
                        
                    case 'fireRate':
                        this.primaryWeapon.fireRate *= (1 + effect.value);
                        console.log(`Applied additional fire rate boost: ${effect.value * 100}%`);
                        break;
                        
                    case 'shieldRegen':
                        this.shieldRegenRate *= (1 + effect.value);
                        console.log(`Applied additional shield regen boost: ${effect.value * 100}%`);
                        break;
                        
                    case 'collisionDamage':
                        this.collisionDamage *= (1 + effect.value);
                        console.log(`Applied additional collision damage boost: ${effect.value * 100}%`);
                        break;
                        
                    default:
                        console.log(`Unknown effect type: ${effect.type}`);
                        break;
                }
            });
            
            console.log(`Updated passive skill: ${skill.name}`);
        }
    }
    
    /**
     * Render the player
     */
    render(ctx) {
        // Draw ship body
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Ship color
        const shipColor = this.isInvulnerable ? 
            `rgba(0, 255, 255, ${0.5 + Math.sin(this.game.gameTime * 10) * 0.5})` : 
            '#00aaff';
        
        // Draw ship body (triangle)
        ctx.fillStyle = shipColor;
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(-this.radius / 2, -this.radius / 2);
        ctx.lineTo(-this.radius / 2, this.radius / 2);
        ctx.closePath();
        ctx.fill();
        
        // Draw ship details
        ctx.strokeStyle = '#0066aa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.radius / 2, 0);
        ctx.lineTo(-this.radius / 2, -this.radius / 4);
        ctx.lineTo(-this.radius / 2, this.radius / 4);
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
        
        // Draw shield
        const shieldAlpha = this.shield / this.maxShield * 0.3;
        if (shieldAlpha > 0) {
            ctx.globalAlpha = shieldAlpha;
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
    
    /**
     * Add an item to the inventory
     */
    addItemToInventory(itemData) {
        console.log('=== PLAYER ADD ITEM TO INVENTORY DEBUGGING ===');
        console.log('Player addItemToInventory called with:', JSON.stringify(itemData));
        
        // Initialize inventory if it doesn't exist
        if (!this.inventory) {
            console.log('Player inventory does not exist, initializing empty array');
            this.inventory = [];
        }
        
        // Check if inventory is full
        if (this.inventory.length >= this.maxInventorySize) {
            console.log('Inventory is full, max size:', this.maxInventorySize);
            console.log('=== END PLAYER ADD ITEM TO INVENTORY DEBUGGING ===');
            return false;
        }
        
        // Create a deep copy of the item data
        const itemCopy = JSON.parse(JSON.stringify(itemData));
        
        // Ensure the item has an ID
        if (!itemCopy.id) {
            itemCopy.id = 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            console.log('Generated new ID for item:', itemCopy.id);
        }
        
        // If slot is missing but type exists, use type as slot
        if (!itemCopy.slot && itemCopy.type) {
            console.log(`Item missing slot property, using type '${itemCopy.type}' as slot`);
            itemCopy.slot = itemCopy.type;
        }
        
        // Add to inventory
        console.log('Player inventory before adding item (length):', this.inventory.length);
        this.inventory.push(itemCopy);
        console.log('Player inventory after adding item (length):', this.inventory.length);
        
        // Log the entire inventory for debugging
        console.log('Player inventory contents after adding item:', JSON.stringify(this.inventory));
        console.log('=== END PLAYER ADD ITEM TO INVENTORY DEBUGGING ===');
        return true;
    }
    
    /**
     * Remove an item from the inventory by ID
     */
    removeItemFromInventory(itemId) {
        if (!this.inventory) return null;
        
        const index = this.inventory.findIndex(item => item.id === itemId);
        
        if (index !== -1) {
            const item = this.inventory[index];
            this.inventory.splice(index, 1);
            return item;
        }
        
        return null;
    }
} 