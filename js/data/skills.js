/**
 * Skills - Data for player skills and abilities
 * This file contains default skill data that can be used by the specialization system
 */

import { Projectile } from '../objects/projectile.js';

// Skill configuration - Single source of truth for all skill parameters
export const SKILL_CONFIG = {
    RAPID_FIRE: {
        multiplier: 2.5,     // Fire rate multiplier (2.5 = 150% increase)
        duration: 8,         // Effect duration in seconds
        cooldown: 10         // Cooldown in seconds
    },
    MULTI_SHOT: {
        passive: true        // Flag indicating this is a passive ability
    },
    // Add other skills here as needed
};

// Skill effect functions
export const SKILL_EFFECTS = {
    // Gunner specialization effects
    RAPID_FIRE: function(game, player) {
        // Use the helper method to apply the temporary effect
        player.applyTemporaryEffect(
            'Rapid Fire',                      // Effect name
            'primaryWeapon.fireRate',          // Stat to modify
            SKILL_CONFIG.RAPID_FIRE.multiplier, // Multiplier
            SKILL_CONFIG.RAPID_FIRE.duration,   // Duration
            '#ff5555'                          // Effect color
        );
    },
    
    MULTI_SHOT: function(game, player) {
        // This is a passive ability
        // Set the player's multiShotLevel properly
        const gunnerSpec = game.specializationSystem.getSpecializationById('gunner');
        if (gunnerSpec) {
            const multiShotSkill = gunnerSpec.skills.find(skill => skill.id === 'multi_shot');
            if (multiShotSkill && multiShotSkill.level > 0) {
                player.multiShotLevel = multiShotSkill.level;
            }
        }
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

/**
 * Helper function to register a new temporary stat boost skill
 * @param {string} skillId - Unique ID for the skill (e.g., 'RAPID_FIRE')
 * @param {string} statPath - Path to the stat to modify (e.g., 'primaryWeapon.fireRate')
 * @param {number} multiplier - Multiplier to apply to the stat
 * @param {number} duration - Duration of the effect in seconds
 * @param {number} cooldown - Cooldown of the skill in seconds
 * @param {string} color - Color for the visual effect
 */
function registerTemporaryStatBoostSkill(skillId, statPath, multiplier, duration, cooldown, color = '#ff5555') {
    // Add to skill config
    SKILL_CONFIG[skillId] = {
        multiplier: multiplier,
        duration: duration,
        cooldown: cooldown
    };
    
    // Create the effect function
    SKILL_EFFECTS[skillId] = function(game, player) {
        player.applyTemporaryEffect(
            skillId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Convert ID to readable name
            statPath,
            multiplier,
            duration,
            color
        );
    };
    
    console.log(`Registered skill: ${skillId} (${statPath} x${multiplier} for ${duration}s, cooldown: ${cooldown}s)`);
}

// Example of registering a new skill using the helper function
// Uncomment and modify as needed:
/*
registerTemporaryStatBoostSkill(
    'SPEED_BOOST',           // Skill ID
    'baseSpeed',             // Stat to modify
    2.0,                     // Multiplier (2x speed)
    5,                       // Duration (5 seconds)
    20,                      // Cooldown (20 seconds)
    '#00ffff'                // Effect color (cyan)
);
*/

// Export the skill configuration and effects
if (typeof module !== 'undefined') {
    module.exports = {
        SKILL_CONFIG,
        SKILL_EFFECTS,
        registerTemporaryStatBoostSkill
    };
} 