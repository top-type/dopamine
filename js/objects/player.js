/**
 * Player - The player's ship
 * Extends the base Entity class
 */
import { Entity } from './entity.js';
import { GameConfig } from '../config/game-config.js';
import { SKILL_EFFECTS } from '../data/skills.js';
import { Projectile } from './projectile.js';

export class Player extends Entity {
    constructor(game) {
        // Position player in the middle-bottom of the screen
        const x = game.canvas.width / 2;
        const y = game.canvas.height * 0.8;
        
        super(game, x, y);
        
        this.type = 'player';
        this.radius = GameConfig.player.radius;
        
        // Movement properties
        this.baseSpeed = GameConfig.player.baseSpeed; // Base speed in pixels per second
        this.currentSpeed = this.baseSpeed;
        
        // Shield properties
        this.maxShield = GameConfig.player.maxShield;
        this.shield = this.maxShield;
        this.shieldRegenRate = GameConfig.player.shieldRegenRate; // Shield points per second
        this.shieldRegenDelay = GameConfig.player.shieldRegenDelay; // Seconds before shield starts regenerating
        this.lastDamageTime = 0;
        
        // Combat properties
        this.isInvulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = GameConfig.player.invulnerabilityDuration; // 1 second of invulnerability after taking damage
        this.collisionDamage = GameConfig.player.collisionDamage; // Base collision damage (increased with Juggernaut specialization)
        
        // Weapon properties
        this.primaryWeapon = {
            damage: GameConfig.player.primaryWeapon.damage,
            fireRate: GameConfig.player.primaryWeapon.fireRate, // Shots per second
            projectileSpeed: GameConfig.player.primaryWeapon.projectileSpeed,
            projectileCount: 1, // Initialize with 1 projectile
            lastFireTime: 0
        };
        
        // Skill properties
        this.criticalStrikeChance = 0;
        this.multiShotLevel = 0; // Add tracking for multiShot level
        
        // Special abilities
        this.specialAbilities = [
            // Default abilities will be added by specializations
        ];
        
        // Active effects tracking
        this.activeEffects = {};
        
        // Inventory - ensure it's initialized as an array
        this.inventory = [];
        this.maxInventorySize = GameConfig.player.maxInventorySize;
        
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
            const fireInterval = 1 / this.primaryWeapon.fireRate;
            
            // Debug fire rate every second
            if (Math.floor(currentTime) > Math.floor(this.lastFireRateDebugTime || 0)) {
                console.log(`Current fire rate: ${this.primaryWeapon.fireRate.toFixed(2)} shots/sec (interval: ${fireInterval.toFixed(3)}s)`);
                this.lastFireRateDebugTime = currentTime;
            }
            
            if (timeSinceLastFire >= fireInterval) {
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
        
        // Ensure multiShotLevel is a valid number
        const multiShotLevel = Number(this.multiShotLevel) || 0;
        
        // Debug log for multishot
        console.log(`firePrimaryWeapon - multiShotLevel: ${multiShotLevel} (original: ${this.multiShotLevel}, type: ${typeof this.multiShotLevel})`);
        
        // Check for critical strike chance
        let criticalHit = false;
        if (this.criticalStrikeChance && Math.random() < this.criticalStrikeChance) {
            criticalHit = true;
            console.log(`Critical Strike triggered! (${this.criticalStrikeChance * 100}% chance)`);
        }
        
        // Create the main projectile (always fired)
        this.createProjectile(spawnX, spawnY, this.rotation, criticalHit);
        
        // Use the stored multiShotLevel instead of querying specialization system
        if (multiShotLevel >= 1) {
            console.log(`Firing multishot at level ${multiShotLevel}`);
            
            // Level 1: Add right projectile
            this.createProjectile(spawnX, spawnY, this.rotation + 0.15, criticalHit);
        }
        
        if (multiShotLevel >= 2) {
            // Level 2: Add left projectile
            this.createProjectile(spawnX, spawnY, this.rotation - 0.15, criticalHit);
        }
        
        if (multiShotLevel >= 3) {
            // Level 3: Add center-right and center-left projectiles
            this.createProjectile(spawnX, spawnY, this.rotation + 0.07, criticalHit);
            this.createProjectile(spawnX, spawnY, this.rotation - 0.07, criticalHit);
        }
        
        // Play sound
        this.game.audioSystem.playSound('laser1');
    }
    
    /**
     * Helper method to create a projectile
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} angle - Angle in radians
     * @param {boolean} isCritical - Whether this is a critical hit projectile
     */
    createProjectile(x, y, angle, isCritical = false) {
        // Calculate damage - critical hits do double damage
        const damage = isCritical ? this.primaryWeapon.damage * 2 : this.primaryWeapon.damage;
        
        // Set color - critical hits are red
        const color = isCritical ? '#ff3333' : '#00ffff';
        
        // Create projectile
        const projectile = new Projectile(
            this.game,
            x,
            y,
            this.primaryWeapon.projectileSpeed,
            angle,
            damage,
            'player',
            color
        );
        
        // Add to game projectiles
        this.game.projectiles.push(projectile);
        
        // Create weapon fire effect with appropriate color
        this.game.particleSystem.createWeaponFire(x, y, angle, color);
        
        // If it's a critical hit, add extra visual effect
        if (isCritical) {
            this.game.particleSystem.createExplosion(x, y, '#ff3333', 5, 1, 30);
        }
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
        // Clean up any active effects
        this.cleanupActiveEffects();
        
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
        console.log(`Adding skill to player: ${skill.name} (Level ${skill.level})`);
        
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
        // If it's a passive skill, apply its effects
        else if (skill.type === 'passive') {
            // Apply passive skill effects
            if (skill.effects) {
                // Special debug for multiShot
                if (skill.id === 'multi_shot') {
                    console.log(`Initializing multiShot skill at level ${skill.level}`);
                    console.log(`multiShotLevel before applying effect: ${this.multiShotLevel}`);
                }
                
                skill.effects.forEach(effect => {
                    this.applyPassiveEffect(effect);
                });
                
                // Debug check after applying effect
                if (skill.id === 'multi_shot') {
                    console.log(`multiShotLevel after applying effect: ${this.multiShotLevel}`);
                }
            }
            
            console.log(`Applied passive skill: ${skill.name} (Level ${skill.level})`);
        }
    }
    
    /**
     * Apply a passive effect to the player
     * @param {Object} effect - The effect to apply
     */
    applyPassiveEffect(effect) {
        console.log(`Applying passive effect: ${effect.type} with value ${effect.value}`);
        
        switch (effect.type) {
            case 'damage':
                // Increase damage by percentage
                this.primaryWeapon.damage *= (1 + effect.value);
                console.log(`Increased damage to ${this.primaryWeapon.damage}`);
                break;
                
            case 'fireRate':
                // Increase fire rate by percentage
                this.primaryWeapon.fireRate *= (1 + effect.value);
                console.log(`Increased fire rate to ${this.primaryWeapon.fireRate}`);
                break;
                
            case 'shield':
                // Increase max shield by percentage
                this.maxShield *= (1 + effect.value);
                this.shield = this.maxShield; // Refill shield
                console.log(`Increased max shield to ${this.maxShield}`);
                break;
                
            case 'shieldRegen':
                // Increase shield regeneration rate by percentage
                this.shieldRegenRate *= (1 + effect.value);
                console.log(`Increased shield regen rate to ${this.shieldRegenRate}`);
                break;
                
            case 'speed':
                // Increase speed by percentage
                this.baseSpeed *= (1 + effect.value);
                this.currentSpeed = this.baseSpeed;
                console.log(`Increased speed to ${this.baseSpeed}`);
                break;
                
            case 'multiShot':
                // Store the multiShot level for later use in firePrimaryWeapon
                // Ensure the value is a number and properly stored
                this.multiShotLevel = Number(effect.value);
                console.log(`Applied Multi Shot passive effect - set multiShotLevel to ${this.multiShotLevel} (type: ${typeof this.multiShotLevel})`);
                break;
                
            case 'collisionDamage':
                // Increase collision damage by percentage
                this.collisionDamage *= (1 + effect.value);
                console.log(`Increased collision damage to ${this.collisionDamage}`);
                break;
                
            case 'criticalStrike':
                // Set chance for critical hits that do double damage
                this.criticalStrikeChance = effect.value;
                console.log(`Set critical strike chance to ${this.criticalStrikeChance * 100}%`);
                break;
                
            default:
                console.log(`Unknown effect type: ${effect.type}`);
                break;
        }
    }
    
    /**
     * Update an existing skill
     * @param {Object} skill - The skill to update
     */
    updateSkill(skill) {
        console.log(`Player.updateSkill called for: ${skill.name} (Level ${skill.level})`);
        
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
            // Special case for multiShot to ensure it's working properly
            if (skill.id === 'multi_shot') {
                console.log(`Special handling for multiShot skill (level ${skill.level})`);
                const multiShotEffect = skill.effects.find(effect => effect.type === 'multiShot');
                if (multiShotEffect) {
                    // Directly set multiShotLevel using the skill level
                    this.multiShotLevel = Number(skill.level);
                    // Also ensure the effect value is correct
                    multiShotEffect.value = Number(skill.level);
                    console.log(`Directly setting multiShotLevel to ${this.multiShotLevel} (type: ${typeof this.multiShotLevel})`);
                    console.log(`Also set effect value to ${multiShotEffect.value} (type: ${typeof multiShotEffect.value})`);
                }
            }
            
            // Apply effects again for all passive skills
            skill.effects.forEach(effect => {
                this.applyPassiveEffect(effect);
            });
            
            console.log(`Updated passive skill: ${skill.name} to level ${skill.level}`);
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
    
    /**
     * Clean up any active effects
     */
    cleanupActiveEffects() {
        if (this.activeEffects) {
            // Clear all active effect timers and restore original values
            for (const effectName in this.activeEffects) {
                const effect = this.activeEffects[effectName];
                
                // Clear the timer
                if (effect.timerId) {
                    clearTimeout(effect.timerId);
                    console.log(`Cleared ${effectName} effect timer`);
                }
                
                // Restore the original value if we have the stat path and original value
                if (effect.statName && effect.originalValue !== undefined) {
                    const statPath = effect.statName.split('.');
                    let statObject = this;
                    
                    // Navigate to the nested property
                    for (let i = 0; i < statPath.length - 1; i++) {
                        statObject = statObject[statPath[i]];
                    }
                    
                    // Restore the original value
                    statObject[statPath[statPath.length - 1]] = effect.originalValue;
                    console.log(`Restored ${effect.statName} to original value: ${effect.originalValue}`);
                }
            }
            
            // Clear the effects object
            this.activeEffects = {};
        }
    }
    
    /**
     * Apply a temporary effect to the player
     * @param {string} effectName - Name of the effect
     * @param {string} statName - Name of the stat to modify
     * @param {number} multiplier - Multiplier to apply to the stat
     * @param {number} duration - Duration of the effect in seconds
     * @param {string} color - Color for the visual effect
     */
    applyTemporaryEffect(effectName, statName, multiplier, duration, color = '#ff5555') {
        // Get the current stat value
        let originalValue;
        let statPath = statName.split('.');
        let statObject = this;
        
        // Navigate to the nested property
        for (let i = 0; i < statPath.length - 1; i++) {
            statObject = statObject[statPath[i]];
        }
        
        // Get the original value
        originalValue = statObject[statPath[statPath.length - 1]];
        
        // Calculate new value
        const newValue = originalValue * multiplier;
        
        // Apply the new value
        statObject[statPath[statPath.length - 1]] = newValue;
        
        // Create visual effect
        this.game.particleSystem.createExplosion(this.x, this.y, color, 20, 3, 100);
        
        // Show message
        this.game.uiSystem.showAlert(`${effectName} activated!`, 1);
        
        // Log the change
        console.log(`${effectName} activated! ${statName} increased from ${originalValue.toFixed(2)} to ${newValue.toFixed(2)}`);
        
        // Reset after duration
        const timerId = setTimeout(() => {
            // Reset stat to original value
            statObject[statPath[statPath.length - 1]] = originalValue;
            
            // Show message
            this.game.uiSystem.showAlert(`${effectName} ended`, 1);
            
            // Log the reset
            console.log(`${effectName} ended. ${statName} reset to ${originalValue.toFixed(2)}`);
            
            // Remove from active effects
            if (this.activeEffects && this.activeEffects[effectName.toLowerCase().replace(/\s+/g, '_')]) {
                delete this.activeEffects[effectName.toLowerCase().replace(/\s+/g, '_')];
            }
        }, duration * 1000);
        
        // Store the timer ID to allow for cancellation if needed
        this.activeEffects = this.activeEffects || {};
        this.activeEffects[effectName.toLowerCase().replace(/\s+/g, '_')] = {
            timerId: timerId,
            endTime: this.game.gameTime + duration,
            statName: statName,
            originalValue: originalValue
        };
        
        return timerId;
    }
} 