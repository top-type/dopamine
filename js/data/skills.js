/**
 * Skills - Data for player skills and abilities
 * This file contains default skill data that can be used by the specialization system
 */

// Skill effect functions
const SKILL_EFFECTS = {
    // Gunner specialization effects
    RAPID_FIRE: function(game, player) {
        // Store the original fire rate
        const originalFireRate = player.primaryWeapon.fireRate;
        
        // Calculate new fire rate (150% increase)
        const newFireRate = originalFireRate * 2.5;
        
        // Apply the new fire rate
        player.primaryWeapon.fireRate = newFireRate;
        
        // Create visual effect
        game.particleSystem.createExplosion(player.x, player.y, '#ff5555', 20, 3, 100);
        
        // Show message
        game.uiSystem.showAlert('Rapid Fire activated!', 1);
        
        // Log the change
        console.log(`Rapid Fire activated! Fire rate increased from ${originalFireRate.toFixed(2)} to ${newFireRate.toFixed(2)}`);
        
        // Reset after 8 seconds
        const timerId = setTimeout(() => {
            // Reset fire rate to original value
            player.primaryWeapon.fireRate = originalFireRate;
            
            // Show message
            game.uiSystem.showAlert('Rapid Fire ended', 1);
            
            // Log the reset
            console.log(`Rapid Fire ended. Fire rate reset to ${originalFireRate.toFixed(2)}`);
        }, 8000);
        
        // Store the timer ID to allow for cancellation if needed
        player.activeEffects = player.activeEffects || {};
        player.activeEffects.rapidFire = {
            timerId: timerId,
            endTime: game.gameTime + 8
        };
    },
    
    PRECISION_SHOT: function(game, player) {
        // Create a high-damage projectile
        const projectile = new Projectile(
            game,
            player.x,
            player.y - player.radius,
            player.primaryWeapon.projectileSpeed * 1.5,
            -Math.PI/2, // Straight up
            player.primaryWeapon.damage * 2.5,
            'player',
            '#ff0000'
        );
        
        // Add to game projectiles
        game.projectiles.push(projectile);
        
        // Create visual effect
        game.particleSystem.createExplosion(player.x, player.y - player.radius, '#ff0000', 10, 2, 50);
    },
    
    // Chronos specialization effects
    TIME_WARP: function(game, player) {
        // Temporary speed boost
        const originalSpeed = player.baseSpeed;
        player.baseSpeed *= 2;
        player.currentSpeed = player.baseSpeed;
        
        // Create visual effect
        game.particleSystem.createExplosion(player.x, player.y, '#55aaff', 30, 4, 150);
        
        // Show message
        game.uiSystem.showAlert('Time Warp activated!', 1);
        
        // Reset after duration
        setTimeout(() => {
            player.baseSpeed = originalSpeed;
            player.currentSpeed = player.baseSpeed;
            game.uiSystem.showAlert('Time Warp ended', 1);
        }, 3000); // 3 seconds
    },
    
    TEMPORAL_SHIELD: function(game, player) {
        // Make player invulnerable
        player.isInvulnerable = true;
        
        // Create shield effect
        game.particleSystem.createExplosion(player.x, player.y, '#55aaff', 30, 5, 150);
        
        // Show message
        game.uiSystem.showAlert('Temporal Shield activated!', 1);
        
        // Reset after duration
        setTimeout(() => {
            player.isInvulnerable = false;
            game.uiSystem.showAlert('Temporal Shield ended', 1);
        }, 5000); // 5 seconds
    },
    
    // Amplifier specialization effects
    GAMMA_BURST: function(game, player) {
        // Define cone parameters
        const coneAngle = Math.PI / 3; // 60 degree cone
        const coneRange = 300;
        
        // Get enemies in cone
        game.entities.forEach(entity => {
            if (entity.type === 'enemy') {
                // Calculate angle to enemy
                const dx = entity.x - player.x;
                const dy = entity.y - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Check if in range
                if (distance <= coneRange) {
                    // Check if in cone (facing up)
                    const angle = Math.atan2(dy, dx);
                    const angleDiff = Math.abs(angle - (-Math.PI/2));
                    if (angleDiff <= coneAngle/2 || angleDiff >= Math.PI*2 - coneAngle/2) {
                        // Apply damage based on distance (more damage closer)
                        const damageMultiplier = 1 - (distance / coneRange) * 0.5;
                        entity.takeDamage(player.primaryWeapon.damage * 2 * damageMultiplier);
                        
                        // Create hit effect
                        game.particleSystem.createExplosion(entity.x, entity.y, '#ffaa55', 10, 2, 50);
                    }
                }
            }
        });
        
        // Create cone effect
        for (let i = 0; i < 20; i++) {
            const angle = -Math.PI/2 + (Math.random() * coneAngle - coneAngle/2);
            const distance = Math.random() * coneRange;
            const x = player.x + Math.cos(angle) * distance;
            const y = player.y + Math.sin(angle) * distance;
            
            game.particleSystem.createExplosion(x, y, '#ffaa55', 5, 2, 30);
        }
    },
    
    // Juggernaut specialization effects
    SHIELD_SURGE: function(game, player) {
        // Store original max shield
        const originalMaxShield = player.maxShield;
        
        // Double shield capacity
        player.maxShield *= 2;
        
        // Add shield
        player.shield += originalMaxShield;
        if (player.shield > player.maxShield) {
            player.shield = player.maxShield;
        }
        
        // Create shield effect
        game.particleSystem.createExplosion(player.x, player.y, '#55ff55', 30, 5, 150);
        
        // Show message
        game.uiSystem.showAlert('Shield Surge activated!', 1);
        
        // Reset after duration
        setTimeout(() => {
            player.maxShield = originalMaxShield;
            if (player.shield > player.maxShield) {
                player.shield = player.maxShield;
            }
            game.uiSystem.showAlert('Shield Surge ended', 1);
        }, 8000); // 8 seconds
    },
    
    // Mechanic specialization effects
    EMERGENCY_REPAIR: function(game, player) {
        // Restore shields
        player.shield += player.maxShield * 0.5;
        if (player.shield > player.maxShield) {
            player.shield = player.maxShield;
        }
        
        // Store original regen rate
        const originalRegenRate = player.shieldRegenRate;
        
        // Increase regen rate
        player.shieldRegenRate *= 2;
        
        // Create repair effect
        game.particleSystem.createExplosion(player.x, player.y, '#55ffff', 30, 5, 150);
        
        // Show message
        game.uiSystem.showAlert('Emergency Repair activated!', 1);
        
        // Reset after duration
        setTimeout(() => {
            player.shieldRegenRate = originalRegenRate;
            game.uiSystem.showAlert('Emergency Repair ended', 1);
        }, 10000); // 10 seconds
    }
};

// Export the skill effects
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SKILL_EFFECTS };
} 