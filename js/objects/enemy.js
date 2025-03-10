/**
 * Enemy - Base class for enemy ships
 * Extends the base Entity class
 */
class Enemy extends Entity {
    constructor(game, x, y, type = 'basic') {
        super(game, x, y);
        
        this.type = 'enemy';
        this.enemyType = type;
        this.radius = 20;
        
        // Movement properties
        this.baseSpeed = 100; // Base speed in pixels per second
        this.currentSpeed = this.baseSpeed;
        
        // Combat properties
        this.maxShield = 30;
        this.shield = this.maxShield;
        this.damage = 10; // Collision damage
        this.collisionDamage = 15; // Damage dealt to player on collision
        
        // Reward properties
        this.xpValue = 10;
        this.goldValue = 5;
        
        // AI properties
        this.behaviorType = 'chase'; // chase, strafe, shoot, etc.
        this.targetUpdateInterval = 0.5; // How often to update target direction
        this.lastTargetUpdate = 0;
        this.fireInterval = 2; // Seconds between shots
        this.lastFireTime = 0;
        
        // Initialize based on enemy type
        this.initializeEnemyType();
        
        console.log(`Enemy created: ${this.enemyType}`);
    }
    
    /**
     * Initialize enemy properties based on type
     */
    initializeEnemyType() {
        switch (this.enemyType) {
            case 'scout':
                this.radius = 15;
                this.baseSpeed = 150;
                this.currentSpeed = this.baseSpeed;
                this.maxShield = 20;
                this.shield = this.maxShield;
                this.damage = 5;
                this.collisionDamage = 10;
                this.xpValue = 5;
                this.goldValue = 3;
                this.behaviorType = 'strafe';
                this.color = '#00ff00';
                break;
                
            case 'fighter':
                this.radius = 20;
                this.baseSpeed = 120;
                this.currentSpeed = this.baseSpeed;
                this.maxShield = 40;
                this.shield = this.maxShield;
                this.damage = 10;
                this.collisionDamage = 15;
                this.xpValue = 10;
                this.goldValue = 5;
                this.behaviorType = 'chase';
                this.fireInterval = 1.5;
                this.color = '#ff0000';
                break;
                
            case 'bomber':
                this.radius = 25;
                this.baseSpeed = 80;
                this.currentSpeed = this.baseSpeed;
                this.maxShield = 60;
                this.shield = this.maxShield;
                this.damage = 20;
                this.collisionDamage = 25;
                this.xpValue = 15;
                this.goldValue = 8;
                this.behaviorType = 'shoot';
                this.fireInterval = 3;
                this.color = '#ff00ff';
                break;
                
            case 'elite':
                this.radius = 30;
                this.baseSpeed = 100;
                this.currentSpeed = this.baseSpeed;
                this.maxShield = 100;
                this.shield = this.maxShield;
                this.damage = 15;
                this.collisionDamage = 20;
                this.xpValue = 25;
                this.goldValue = 15;
                this.behaviorType = 'complex';
                this.fireInterval = 1;
                this.color = '#ffaa00';
                break;
                
            case 'stealth':
                this.radius = 18;
                this.baseSpeed = 130;
                this.currentSpeed = this.baseSpeed;
                this.maxShield = 50;
                this.shield = this.maxShield;
                this.damage = 12;
                this.collisionDamage = 18;
                this.xpValue = 20;
                this.goldValue = 12;
                this.behaviorType = 'stealth';
                this.fireInterval = 2;
                this.color = '#8800ff';
                this.alpha = 0.5; // Partially transparent
                this.stealthCooldown = 3; // Time between stealth phases
                this.lastStealthChange = 0;
                this.isStealthed = false;
                break;
                
            case 'carrier':
                this.radius = 35;
                this.baseSpeed = 70;
                this.currentSpeed = this.baseSpeed;
                this.maxShield = 120;
                this.shield = this.maxShield;
                this.damage = 8;
                this.collisionDamage = 15;
                this.xpValue = 30;
                this.goldValue = 18;
                this.behaviorType = 'carrier';
                this.fireInterval = 4;
                this.color = '#0088ff';
                this.droneCount = 0;
                this.maxDrones = 3;
                this.droneSpawnInterval = 5;
                this.lastDroneSpawn = 0;
                break;
                
            case 'boss':
                this.radius = 50;
                this.baseSpeed = 70;
                this.currentSpeed = this.baseSpeed;
                this.maxShield = 300;
                this.shield = this.maxShield;
                this.damage = 25;
                this.collisionDamage = 40;
                this.xpValue = 100;
                this.goldValue = 50;
                this.behaviorType = 'boss';
                this.fireInterval = 0.5;
                this.color = '#ff0000';
                this.phaseThresholds = [0.7, 0.4, 0.2]; // Shield percentage thresholds for phase changes
                this.currentPhase = 0;
                break;
                
            case 'megaboss':
                this.radius = 70;
                this.baseSpeed = 50;
                this.currentSpeed = this.baseSpeed;
                this.maxShield = 500;
                this.shield = this.maxShield;
                this.damage = 35;
                this.collisionDamage = 60;
                this.xpValue = 200;
                this.goldValue = 100;
                this.behaviorType = 'megaboss';
                this.fireInterval = 0.3;
                this.color = '#880000';
                this.phaseThresholds = [0.8, 0.6, 0.4, 0.2]; // More phases than regular boss
                this.currentPhase = 0;
                this.specialAttackCooldown = 10;
                this.lastSpecialAttack = 0;
                break;
                
            default: // basic
                this.radius = 20;
                this.baseSpeed = 100;
                this.currentSpeed = this.baseSpeed;
                this.maxShield = 30;
                this.shield = this.maxShield;
                this.damage = 10;
                this.collisionDamage = 15;
                this.xpValue = 10;
                this.goldValue = 5;
                this.behaviorType = 'chase';
                this.color = '#ff0000';
                break;
        }
        
        // Scale difficulty based on depth
        this.scaleWithDepth();
    }
    
    /**
     * Scale enemy stats based on game depth
     */
    scaleWithDepth() {
        const depth = this.game.depth;
        const depthFactor = 1 + (depth / 1000); // Increase by 100% every 1000 depth
        
        // Scale stats
        this.maxShield = Math.floor(this.maxShield * depthFactor);
        this.shield = this.maxShield;
        this.damage = Math.floor(this.damage * depthFactor);
        this.collisionDamage = Math.floor(this.collisionDamage * depthFactor);
        this.xpValue = Math.floor(this.xpValue * depthFactor);
        this.goldValue = Math.floor(this.goldValue * depthFactor);
    }
    
    /**
     * Update enemy state
     */
    update(deltaTime) {
        // Update AI behavior
        this.updateBehavior(deltaTime);
        
        // Call parent update method
        super.update(deltaTime);
    }
    
    /**
     * Update enemy AI behavior
     */
    updateBehavior(deltaTime) {
        const currentTime = this.game.gameTime;
        
        // Only update target direction periodically
        if (currentTime - this.lastTargetUpdate >= this.targetUpdateInterval) {
            this.lastTargetUpdate = currentTime;
            
            // Different behaviors based on type
            switch (this.behaviorType) {
                case 'chase':
                    this.chaseBehavior();
                    break;
                    
                case 'strafe':
                    this.strafeBehavior();
                    break;
                    
                case 'shoot':
                    this.shootBehavior();
                    break;
                    
                case 'complex':
                    this.complexBehavior();
                    break;
                    
                case 'stealth':
                    this.stealthBehavior();
                    break;
                    
                case 'carrier':
                    this.carrierBehavior();
                    break;
                    
                case 'boss':
                    this.bossBehavior();
                    break;
                    
                case 'megaboss':
                    this.megabossBehavior();
                    break;
                    
                default:
                    this.chaseBehavior();
                    break;
            }
        }
        
        // Special behavior updates that happen every frame
        if (this.behaviorType === 'stealth') {
            this.updateStealth(currentTime);
        } else if (this.behaviorType === 'carrier') {
            this.updateDrones(currentTime);
        } else if (this.behaviorType === 'megaboss' && currentTime - this.lastSpecialAttack >= this.specialAttackCooldown) {
            this.performSpecialAttack();
            this.lastSpecialAttack = currentTime;
        }
        
        // Check if it's time to fire
        if (currentTime - this.lastFireTime >= this.fireInterval) {
            // Don't fire if:
            // 1. Enemy is a strafe type (they don't shoot)
            // 2. Enemy is a stealth type AND is currently stealthed
            if (this.behaviorType !== 'strafe' && 
                !(this.behaviorType === 'stealth' && this.isStealthed)) {
                this.fireWeapon();
                this.lastFireTime = currentTime;
            }
        }
    }
    
    /**
     * Chase behavior - directly pursue the player
     */
    chaseBehavior() {
        if (!this.game.player) return;
        
        // Calculate direction to player
        const angle = this.angleTo(this.game.player);
        
        // Set velocity towards player
        this.setVelocity(this.currentSpeed, angle);
    }
    
    /**
     * Strafe behavior - move perpendicular to player
     */
    strafeBehavior() {
        if (!this.game.player) return;
        
        // Calculate direction to player
        const angle = this.angleTo(this.game.player);
        
        // Add 90 degrees to move perpendicular (strafe)
        const strafeAngle = angle + Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);
        
        // Set velocity
        this.setVelocity(this.currentSpeed, strafeAngle);
    }
    
    /**
     * Shoot behavior - keep distance and shoot
     */
    shootBehavior() {
        if (!this.game.player) return;
        
        // Calculate direction and distance to player
        const angle = this.angleTo(this.game.player);
        const distance = this.distanceTo(this.game.player);
        
        // If too close, move away
        if (distance < 200) {
            this.setVelocity(this.currentSpeed, angle + Math.PI);
        }
        // If too far, move closer
        else if (distance > 300) {
            this.setVelocity(this.currentSpeed, angle);
        }
        // Otherwise, stop moving
        else {
            this.vx = 0;
            this.vy = 0;
        }
        
        // Always face the player
        this.rotation = angle;
    }
    
    /**
     * Complex behavior - mix of chase and shoot
     */
    complexBehavior() {
        if (!this.game.player) return;
        
        // Calculate direction and distance to player
        const angle = this.angleTo(this.game.player);
        const distance = this.distanceTo(this.game.player);
        
        // Random behavior change
        const behavior = Math.random();
        
        if (behavior < 0.3) {
            // Chase
            this.setVelocity(this.currentSpeed, angle);
        } else if (behavior < 0.6) {
            // Strafe
            const strafeAngle = angle + Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);
            this.setVelocity(this.currentSpeed, strafeAngle);
        } else {
            // Shoot
            if (distance < 150) {
                this.setVelocity(this.currentSpeed, angle + Math.PI);
            } else if (distance > 300) {
                this.setVelocity(this.currentSpeed, angle);
            } else {
                this.vx = 0;
                this.vy = 0;
            }
        }
        
        // Always face the player
        this.rotation = angle;
    }
    
    /**
     * Stealth behavior - appear and disappear, surprise attacks
     */
    stealthBehavior() {
        if (!this.game.player) return;
        
        // If stealthed, try to get behind the player
        if (this.isStealthed) {
            // Calculate position behind player
            const playerAngle = this.game.player.angle;
            const behindX = this.game.player.x - Math.cos(playerAngle) * 200;
            const behindY = this.game.player.y - Math.sin(playerAngle) * 200;
            
            // Move towards that position
            const angle = Math.atan2(behindY - this.y, behindX - this.x);
            this.setVelocity(this.currentSpeed * 1.5, angle); // Move faster while stealthed
        } else {
            // When visible, use a more direct approach
            const angle = this.angleTo(this.game.player);
            this.setVelocity(this.currentSpeed, angle);
        }
    }
    
    /**
     * Update stealth state
     */
    updateStealth(currentTime) {
        if (currentTime - this.lastStealthChange >= this.stealthCooldown) {
            this.isStealthed = !this.isStealthed;
            this.alpha = this.isStealthed ? 0.2 : 0.8;
            this.lastStealthChange = currentTime;
            
            // If coming out of stealth near player, immediately attack
            if (!this.isStealthed && this.distanceTo(this.game.player) < 200) {
                this.fireWeapon();
                this.lastFireTime = currentTime;
            }
        }
    }
    
    /**
     * Carrier behavior - keep distance and spawn drones
     */
    carrierBehavior() {
        if (!this.game.player) return;
        
        // Calculate direction and distance to player
        const angle = this.angleTo(this.game.player);
        const distance = this.distanceTo(this.game.player);
        
        // Keep optimal distance (250-350 pixels)
        if (distance < 250) {
            // Too close, move away
            this.setVelocity(this.currentSpeed, angle + Math.PI);
        } else if (distance > 350) {
            // Too far, move closer
            this.setVelocity(this.currentSpeed, angle);
        } else {
            // At good distance, strafe
            const strafeAngle = angle + Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);
            this.setVelocity(this.currentSpeed * 0.5, strafeAngle);
        }
    }
    
    /**
     * Update drone spawning
     */
    updateDrones(currentTime) {
        // Count current drones
        this.droneCount = this.game.entities.filter(entity => 
            entity.type === 'enemy' && 
            entity.enemyType === 'scout' && 
            entity.parentId === this.id
        ).length;
        
        // Spawn new drone if needed
        if (this.droneCount < this.maxDrones && currentTime - this.lastDroneSpawn >= this.droneSpawnInterval) {
            this.spawnDrone();
            this.lastDroneSpawn = currentTime;
        }
    }
    
    /**
     * Spawn a drone
     */
    spawnDrone() {
        const drone = new Enemy(this.game, this.x, this.y, 'scout');
        drone.parentId = this.id; // Mark as belonging to this carrier
        drone.color = '#0088ff'; // Match carrier color
        drone.maxShield = 15; // Weaker than regular scouts
        drone.shield = drone.maxShield;
        drone.xpValue = 3;
        drone.goldValue = 1;
        
        // Add to game entities
        this.game.entities.push(drone);
        
        // Create spawn effect
        this.game.particleSystem.createExplosion(this.x, this.y, 20, 10, this.color);
    }
    
    /**
     * Boss behavior - complex movement and attack patterns
     */
    bossBehavior() {
        if (!this.game.player) return;
        
        // Check for phase transitions
        const shieldPercent = this.shield / this.maxShield;
        if (this.phaseThresholds[this.currentPhase] && shieldPercent <= this.phaseThresholds[this.currentPhase]) {
            this.currentPhase++;
            this.transitionPhase();
        }
        
        // Different behavior based on current phase
        switch (this.currentPhase) {
            case 0: // Phase 1 - Direct approach
                this.chaseBehavior();
                break;
                
            case 1: // Phase 2 - Circle around player
                const angle = this.angleTo(this.game.player);
                const orbitAngle = angle + Math.PI / 2;
                this.setVelocity(this.currentSpeed * 1.2, orbitAngle);
                break;
                
            case 2: // Phase 3 - Erratic movement
                const randomAngle = Math.random() * Math.PI * 2;
                this.setVelocity(this.currentSpeed * 1.5, randomAngle);
                break;
                
            default: // Final phase - Aggressive approach
                this.chaseBehavior();
                this.currentSpeed = this.baseSpeed * 1.5;
                break;
        }
    }
    
    /**
     * Megaboss behavior - even more complex patterns
     */
    megabossBehavior() {
        if (!this.game.player) return;
        
        // Check for phase transitions
        const shieldPercent = this.shield / this.maxShield;
        if (this.phaseThresholds[this.currentPhase] && shieldPercent <= this.phaseThresholds[this.currentPhase]) {
            this.currentPhase++;
            this.transitionPhase();
        }
        
        // Different behavior based on current phase
        switch (this.currentPhase) {
            case 0: // Phase 1 - Slow approach
                this.chaseBehavior();
                this.currentSpeed = this.baseSpeed * 0.8;
                break;
                
            case 1: // Phase 2 - Teleport around
                if (Math.random() < 0.05) { // 5% chance to teleport each update
                    this.teleport();
                } else {
                    this.shootBehavior();
                }
                break;
                
            case 2: // Phase 3 - Spawn minions
                if (Math.random() < 0.02) { // 2% chance to spawn minions each update
                    this.spawnMinions();
                }
                this.strafeBehavior();
                break;
                
            case 3: // Phase 4 - Rapid fire
                this.fireInterval = 0.1; // Very rapid fire
                this.chaseBehavior();
                break;
                
            default: // Final phase - Berserk
                this.fireInterval = 0.05;
                this.currentSpeed = this.baseSpeed * 2;
                this.chaseBehavior();
                break;
        }
    }
    
    /**
     * Teleport to a random position near the player
     */
    teleport() {
        // Create disappear effect at current position
        this.game.particleSystem.createExplosion(this.x, this.y, 30, 20, this.color);
        
        // Teleport to new position
        const angle = Math.random() * Math.PI * 2;
        const distance = 200 + Math.random() * 200;
        this.x = this.game.player.x + Math.cos(angle) * distance;
        this.y = this.game.player.y + Math.sin(angle) * distance;
        
        // Create appear effect at new position
        this.game.particleSystem.createExplosion(this.x, this.y, 30, 20, this.color);
    }
    
    /**
     * Spawn minions around the megaboss
     */
    spawnMinions() {
        const minionCount = 2 + Math.floor(Math.random() * 3); // 2-4 minions
        
        for (let i = 0; i < minionCount; i++) {
            const angle = (i / minionCount) * Math.PI * 2;
            const x = this.x + Math.cos(angle) * 50;
            const y = this.y + Math.sin(angle) * 50;
            
            const minion = new Enemy(this.game, x, y, 'scout');
            minion.parentId = this.id;
            minion.color = this.color;
            
            this.game.entities.push(minion);
        }
        
        // Create spawn effect
        this.game.particleSystem.createExplosion(this.x, this.y, 50, 30, this.color);
    }
    
    /**
     * Perform a special attack (for megaboss)
     */
    performSpecialAttack() {
        // Different special attacks based on phase
        switch (this.currentPhase) {
            case 0: // Phase 1 - Radial bullet pattern
                this.fireRadialPattern(8);
                break;
                
            case 1: // Phase 2 - Spiral bullet pattern
                this.fireSpiralPattern(12);
                break;
                
            case 2: // Phase 3 - Targeted multi-shot
                this.fireTargetedMultishot(5);
                break;
                
            default: // Final phases - All attacks at once
                this.fireRadialPattern(12);
                this.fireTargetedMultishot(3);
                break;
        }
    }
    
    /**
     * Fire bullets in a radial pattern
     */
    fireRadialPattern(bulletCount) {
        for (let i = 0; i < bulletCount; i++) {
            const angle = (i / bulletCount) * Math.PI * 2;
            this.fireProjectile(angle);
        }
    }
    
    /**
     * Fire bullets in a spiral pattern
     */
    fireSpiralPattern(bulletCount) {
        const baseAngle = this.game.gameTime * 2; // Rotate based on game time
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = baseAngle + (i / bulletCount) * Math.PI * 2;
            this.fireProjectile(angle);
        }
    }
    
    /**
     * Fire multiple shots at the player
     */
    fireTargetedMultishot(bulletCount) {
        if (!this.game.player) return;
        
        const targetAngle = this.angleTo(this.game.player);
        const spreadAngle = Math.PI / 8; // 22.5 degrees
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = targetAngle + spreadAngle * (i - (bulletCount - 1) / 2);
            this.fireProjectile(angle);
        }
    }
    
    /**
     * Handle phase transitions
     */
    transitionPhase() {
        // Create phase transition effect
        this.game.particleSystem.createExplosion(this.x, this.y, 100, 50, this.color);
        
        // Increase fire rate with each phase
        this.fireInterval *= 0.8;
        
        // Alert player
        if (this.enemyType === 'boss') {
            this.game.uiSystem.showAlert(`Destroyer entering phase ${this.currentPhase + 1}!`, 2);
        } else if (this.enemyType === 'megaboss') {
            this.game.uiSystem.showAlert(`Dreadnought entering phase ${this.currentPhase + 1}!`, 2);
        }
    }
    
    /**
     * Fire a projectile at the specified angle
     */
    fireProjectile(angle) {
        // Create projectile
        const speed = 300;
        const projectile = new Projectile(
            this.game,
            this.x,
            this.y,
            speed,
            angle,
            this.damage,
            'enemy',
            this.color
        );
        
        // Add to game projectiles
        this.game.projectiles.push(projectile);
    }
    
    /**
     * Fire weapon at player
     */
    fireWeapon() {
        if (!this.game.player) return;
        
        // Calculate direction to player
        const angle = this.angleTo(this.game.player);
        
        // Calculate projectile spawn position
        const spawnX = this.x + Math.cos(angle) * this.radius;
        const spawnY = this.y + Math.sin(angle) * this.radius;
        
        // Create projectile
        const projectile = new Projectile(
            this.game,
            spawnX,
            spawnY,
            300, // projectile speed
            angle,
            this.damage,
            'enemy',
            '#ff0000'
        );
        
        // Add to game projectiles
        this.game.projectiles.push(projectile);
        
        // Create weapon fire effect
        this.game.particleSystem.createWeaponFire(spawnX, spawnY, angle, '#ff0000');
        
        // Play sound
        this.game.audioSystem.playSound('laser2', 0.5);
    }
    
    /**
     * Take damage
     */
    takeDamage(amount) {
        // Apply damage to shield
        this.shield -= amount;
        
        // Create shield impact effect
        const impactAngle = Math.random() * Math.PI * 2;
        this.game.particleSystem.createShieldImpact(this.x, this.y, impactAngle);
        
        // Check if shield is depleted
        if (this.shield <= 0) {
            this.die();
        }
    }
    
    /**
     * Enemy death
     */
    die() {
        // Create explosion effect
        this.game.particleSystem.createExplosion(this.x, this.y, this.color, 30, 3, 150);
        
        // Play explosion sound
        this.game.audioSystem.playSound('explosion', 0.7);
        
        // Award XP and gold
        this.game.addXP(this.xpValue);
        this.game.addGold(this.goldValue);
        
        // Chance to drop item
        this.dropItem();
        
        // Mark for removal
        this.shouldRemove = true;
    }
    
    /**
     * Drop item on death
     */
    dropItem() {
        // TODO: Implement item dropping
        // This will be expanded in the item system
    }
    
    /**
     * Render the enemy
     */
    render(ctx) {
        // Save context for transparency
        ctx.save();
        
        // Apply transparency if stealth enemy
        if (this.alpha !== undefined) {
            ctx.globalAlpha = this.alpha;
        }
        
        // Draw enemy
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        // Different rendering based on enemy type
        switch (this.enemyType) {
            case 'scout':
                // Triangle shape
                const triangleSize = this.radius;
                ctx.moveTo(this.x + Math.cos(this.rotation) * triangleSize * 1.5, 
                           this.y + Math.sin(this.rotation) * triangleSize * 1.5);
                ctx.lineTo(this.x + Math.cos(this.rotation + 2.5) * triangleSize, 
                           this.y + Math.sin(this.rotation + 2.5) * triangleSize);
                ctx.lineTo(this.x + Math.cos(this.rotation - 2.5) * triangleSize, 
                           this.y + Math.sin(this.rotation - 2.5) * triangleSize);
                break;
                
            case 'fighter':
                // X-wing like shape
                ctx.moveTo(this.x + Math.cos(this.rotation) * this.radius * 1.5, 
                           this.y + Math.sin(this.rotation) * this.radius * 1.5);
                ctx.lineTo(this.x + Math.cos(this.rotation + Math.PI * 0.8) * this.radius, 
                           this.y + Math.sin(this.rotation + Math.PI * 0.8) * this.radius);
                ctx.lineTo(this.x + Math.cos(this.rotation + Math.PI) * this.radius * 0.5, 
                           this.y + Math.sin(this.rotation + Math.PI) * this.radius * 0.5);
                ctx.lineTo(this.x + Math.cos(this.rotation - Math.PI * 0.8) * this.radius, 
                           this.y + Math.sin(this.rotation - Math.PI * 0.8) * this.radius);
                break;
                
            case 'bomber':
                // Hexagon shape
                for (let i = 0; i < 6; i++) {
                    const angle = this.rotation + i * Math.PI / 3;
                    if (i === 0) {
                        ctx.moveTo(this.x + Math.cos(angle) * this.radius, 
                                   this.y + Math.sin(angle) * this.radius);
                    } else {
                        ctx.lineTo(this.x + Math.cos(angle) * this.radius, 
                                   this.y + Math.sin(angle) * this.radius);
                    }
                }
                break;
                
            case 'elite':
                // Star shape
                const outerRadius = this.radius;
                const innerRadius = this.radius * 0.5;
                for (let i = 0; i < 10; i++) {
                    const angle = this.rotation + i * Math.PI / 5;
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    if (i === 0) {
                        ctx.moveTo(this.x + Math.cos(angle) * radius, 
                                   this.y + Math.sin(angle) * radius);
                    } else {
                        ctx.lineTo(this.x + Math.cos(angle) * radius, 
                                   this.y + Math.sin(angle) * radius);
                    }
                }
                break;
                
            case 'stealth':
                // Crescent shape
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Cut out part to make crescent
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.arc(this.x + this.radius * 0.5, this.y, this.radius * 0.8, 0, Math.PI * 2);
                ctx.fill();
                
                // Reset composite operation
                ctx.globalCompositeOperation = 'source-over';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                break;
                
            case 'carrier':
                // Octagon with inner circle
                for (let i = 0; i < 8; i++) {
                    const angle = this.rotation + i * Math.PI / 4;
                    if (i === 0) {
                        ctx.moveTo(this.x + Math.cos(angle) * this.radius, 
                                   this.y + Math.sin(angle) * this.radius);
                    } else {
                        ctx.lineTo(this.x + Math.cos(angle) * this.radius, 
                                   this.y + Math.sin(angle) * this.radius);
                    }
                }
                ctx.fill();
                
                // Inner circle
                ctx.fillStyle = '#004488';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
                ctx.fill();
                
                // Return to main path
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                break;
                
            case 'boss':
            case 'megaboss':
                // Complex shape for boss
                const bossRadius = this.radius;
                
                // Main body
                ctx.arc(this.x, this.y, bossRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw details
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                
                // Weapon mounts
                for (let i = 0; i < 4; i++) {
                    const angle = this.rotation + i * Math.PI / 2;
                    const mountX = this.x + Math.cos(angle) * bossRadius * 0.7;
                    const mountY = this.y + Math.sin(angle) * bossRadius * 0.7;
                    
                    ctx.moveTo(mountX + 10, mountY);
                    ctx.arc(mountX, mountY, 10, 0, Math.PI * 2);
                }
                
                // Central core
                ctx.moveTo(this.x + 15, this.y);
                ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
                
                ctx.stroke();
                
                // Shield indicator
                const shieldPercent = this.shield / this.maxShield;
                const shieldColor = this.getShieldColor(shieldPercent);
                
                ctx.strokeStyle = shieldColor;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.x, this.y, bossRadius + 5, 0, Math.PI * 2 * shieldPercent);
                ctx.stroke();
                
                // Return to main path
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, bossRadius, 0, Math.PI * 2);
                break;
                
            default:
                // Circle for basic enemies
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                break;
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Draw shield if damaged
        if (this.shield < this.maxShield) {
            const shieldPercent = this.shield / this.maxShield;
            const shieldColor = this.getShieldColor(shieldPercent);
            
            ctx.strokeStyle = shieldColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2 * shieldPercent);
            ctx.stroke();
        }
        
        // Restore context
        ctx.restore();
    }
    
    /**
     * Get shield color based on percentage
     */
    getShieldColor(percent) {
        if (percent > 0.7) {
            return '#00ff00'; // Green
        } else if (percent > 0.3) {
            return '#ffff00'; // Yellow
        } else {
            return '#ff0000'; // Red
        }
    }
} 