/**
 * CombatSystem - Handles combat interactions between entities
 */
class CombatSystem {
    constructor(game) {
        this.game = game;
        
        // Critical hit settings
        this.criticalHitChance = 0.1; // 10% chance
        this.criticalHitMultiplier = 2.0; // 2x damage
        
        console.log('Combat system initialized');
    }
    
    /**
     * Handle collision between two entities
     */
    handleCollision(entity1, entity2) {
        // Player-enemy collision
        if (entity1.type === 'player' && entity2.type === 'enemy') {
            this.handlePlayerEnemyCollision(entity1, entity2);
        }
        // Enemy-player collision
        else if (entity1.type === 'enemy' && entity2.type === 'player') {
            this.handlePlayerEnemyCollision(entity2, entity1);
        }
    }
    
    /**
     * Handle collision between player and enemy
     */
    handlePlayerEnemyCollision(player, enemy) {
        // Player takes damage from enemy
        player.takeDamage(enemy.collisionDamage);
        
        // Enemy takes damage from player if player has Juggernaut specialization
        // This will be expanded with the specialization system
        if (this.game.specializationSystem.hasSpecialization('juggernaut')) {
            enemy.takeDamage(player.collisionDamage || 5);
        }
        
        // Create collision effect
        this.game.particleSystem.createExplosion(
            (player.x + enemy.x) / 2,
            (player.y + enemy.y) / 2,
            '#ff5500',
            20,
            3,
            100
        );
        
        // Apply knockback to both entities
        this.applyKnockback(player, enemy);
    }
    
    /**
     * Handle projectile hit on an entity
     */
    handleProjectileHit(projectile, entity) {
        // Calculate damage with critical hit chance
        let damage = projectile.damage;
        let isCritical = false;
        
        // Check for critical hit
        if (Math.random() < this.criticalHitChance) {
            damage *= this.criticalHitMultiplier;
            isCritical = true;
        }
        
        // Apply damage to entity
        entity.takeDamage(damage);
        
        // Create hit effect
        this.createHitEffect(projectile, entity, isCritical);
        
        // Show damage number
        this.showDamageNumber(entity.x, entity.y, damage, isCritical);
    }
    
    /**
     * Apply knockback to entities after collision
     */
    applyKnockback(entity1, entity2) {
        // Calculate knockback direction
        const angle = entity1.angleTo(entity2);
        
        // Calculate knockback force based on entity masses (using radius as approximation)
        const mass1 = entity1.radius * entity1.radius;
        const mass2 = entity2.radius * entity2.radius;
        const totalMass = mass1 + mass2;
        
        // Apply knockback to entity1
        const knockbackForce1 = 200 * (mass2 / totalMass);
        entity1.vx -= Math.cos(angle) * knockbackForce1;
        entity1.vy -= Math.sin(angle) * knockbackForce1;
        
        // Apply knockback to entity2
        const knockbackForce2 = 200 * (mass1 / totalMass);
        entity2.vx += Math.cos(angle) * knockbackForce2;
        entity2.vy += Math.sin(angle) * knockbackForce2;
    }
    
    /**
     * Create hit effect when projectile hits entity
     */
    createHitEffect(projectile, entity, isCritical) {
        // Create particle effect
        if (isCritical) {
            // Critical hit effect (larger and brighter)
            this.game.particleSystem.createExplosion(
                entity.x,
                entity.y,
                '#ffff00',
                30,
                4,
                150
            );
        } else {
            // Normal hit effect
            this.game.particleSystem.createExplosion(
                entity.x,
                entity.y,
                projectile.color,
                15,
                2,
                100
            );
        }
        
        // Create shield impact effect
        const impactAngle = projectile.rotation;
        this.game.particleSystem.createShieldImpact(entity.x, entity.y, impactAngle);
    }
    
    /**
     * Show damage number floating up from hit entity
     */
    showDamageNumber(x, y, damage, isCritical) {
        // Create a new damage number element
        const damageNumber = document.createElement('div');
        damageNumber.className = 'damage-number';
        damageNumber.textContent = Math.floor(damage);
        
        // Style based on critical hit
        if (isCritical) {
            damageNumber.classList.add('critical');
        }
        
        // Position at hit location
        damageNumber.style.left = `${x}px`;
        damageNumber.style.top = `${y}px`;
        
        // Add to UI overlay
        const uiOverlay = document.getElementById('ui-overlay');
        uiOverlay.appendChild(damageNumber);
        
        // Animate and remove after animation
        setTimeout(() => {
            damageNumber.classList.add('animate');
            
            // Remove after animation completes
            setTimeout(() => {
                uiOverlay.removeChild(damageNumber);
            }, 1000);
        }, 0);
    }
    
    /**
     * Calculate damage with modifiers
     */
    calculateDamage(baseDamage, attacker, defender) {
        let damage = baseDamage;
        
        // Apply attacker's damage modifiers
        if (attacker.type === 'player') {
            // Apply player's damage modifiers from equipment and specializations
            // This will be expanded with the equipment and specialization systems
        }
        
        // Apply defender's defense modifiers
        if (defender.type === 'player') {
            // Apply player's defense modifiers from equipment and specializations
            // This will be expanded with the equipment and specialization systems
        }
        
        // Ensure damage is at least 1
        return Math.max(1, damage);
    }
    
    /**
     * Reset the combat system
     */
    reset() {
        console.log('Resetting combat system');
        // Nothing specific to reset in the combat system
        console.log('Combat system reset');
    }
} 