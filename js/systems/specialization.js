/**
 * SpecializationSystem - Manages player specializations and skill trees
 * Handles the selection, application, and progression of player specializations
 */
import { SKILL_CONFIG, SKILL_EFFECTS } from '../data/skills.js';

export class SpecializationSystem {
    constructor(game) {
        this.game = game;
        this.availableSpecializations = [
            {
                id: 'gunner',
                name: 'Gunner',
                description: 'Weapon proficiency and offensive capabilities. Enhanced shooting mechanics and damage output.',
                icon: '🎯',
                color: '#ff5555',
                skills: [
                    {
                        id: 'multi_shot',
                        name: 'Multi Shot',
                        description: 'Fires additional projectiles based on skill level. Each level adds one more projectile to your shots (maximum 20 extra projectiles).',
                        type: 'passive',
                        level: 0,
                        maxLevel: 20,
                        specialization: 'gunner',
                        icon: '🔫',
                        position: { row: 0, col: 1 }, // Position in skill tree
                        requiredLevel: 1, // Player level required
                        prerequisites: [], // No prerequisites for first skill
                        effects: [
                            {
                                type: 'multiShot',
                                value: 1.0 // This is the value for level 1, will be updated based on skill level
                            }
                        ],
                        onLevelChange: function(level) {
                            this.effects[0].value = Number(level);
                            
                            // Update description based on level
                            this.levelDescription = `Fires ${level} additional projectile${level > 1 ? 's' : ''} in a spread pattern`;
                            
                            console.log(`Multi Shot level changed to ${level}, setting effect value to ${this.effects[0].value} (type: ${typeof this.effects[0].value})`);
                            console.log(`Multi Shot effect at level ${level}: ${this.levelDescription}`);
                        }
                    },
                    {
                        id: 'precision_targeting',
                        name: 'Precision Targeting',
                        description: 'Increases damage by 15%',
                        type: 'passive',
                        level: 0,
                        maxLevel: 3,
                        specialization: 'gunner',
                        icon: '🎯',
                        position: { row: 1, col: 0 }, // Position in skill tree
                        requiredLevel: 3, // Player level required
                        prerequisites: ['multi_shot'], // Updated prerequisite
                        effects: [
                            {
                                type: 'damage',
                                value: 0.15 // 15% increase
                            }
                        ]
                    },
                    {
                        id: 'critical_strike',
                        name: 'Critical Strike',
                        description: 'Chance for projectiles to deal double damage',
                        type: 'passive',
                        level: 0,
                        maxLevel: 3,
                        specialization: 'gunner',
                        icon: '🎯',
                        position: { row: 1, col: 2 }, // Position in skill tree
                        requiredLevel: 3, // Player level required
                        prerequisites: ['multi_shot'], // Updated prerequisite
                        effects: [
                            {
                                type: 'criticalStrike',
                                value: 0.15 // 15% chance
                            }
                        ],
                        onLevelChange: function(level) {
                            // Increase critical strike chance with level
                            // Level 1: 15%, Level 2: 25%, Level 3: 35%
                            this.effects[0].value = 0.15 + (level - 1) * 0.1;
                            console.log(`Critical Strike level changed to ${level}, setting chance to ${this.effects[0].value * 100}%`);
                        }
                    },
                    {
                        id: 'bullet_storm',
                        name: 'Bullet Storm',
                        description: 'Unleash a barrage of bullets in all directions',
                        type: 'active',
                        cooldown: 30,
                        duration: 3,
                        level: 0,
                        maxLevel: 3,
                        specialization: 'gunner',
                        icon: '☄️',
                        position: { row: 2, col: 1 }, // Position in skill tree
                        requiredLevel: 5, // Player level required
                        prerequisites: ['precision_targeting', 'critical_strike'], // Requires both previous skills
                        effect: function(game, player) {
                            // Create bullet storm effect
                            const bulletCount = 16; // Fire 16 bullets in a circle
                            const angleStep = (Math.PI * 2) / bulletCount;
                            
                            for (let i = 0; i < bulletCount; i++) {
                                const angle = i * angleStep;
                                const dx = Math.cos(angle);
                                const dy = Math.sin(angle);
                                
                                game.combatSystem.createProjectile(
                                    player.x, 
                                    player.y, 
                                    dx * player.primaryWeapon.projectileSpeed, 
                                    dy * player.primaryWeapon.projectileSpeed, 
                                    player.primaryWeapon.damage * 0.7, // Reduced damage for balance
                                    'player'
                                );
                            }
                            
                            // Visual effect
                            game.particleSystem.createExplosion(player.x, player.y, '#ff5555', 30, 4, 150);
                            
                            // Show message
                            game.uiSystem.showAlert('Bullet Storm!', 1);
                        }
                    },
                    {
                        id: 'weapon_mastery',
                        name: 'Weapon Mastery',
                        description: 'Increases all weapon damage by 25%',
                        type: 'passive',
                        level: 0,
                        maxLevel: 1,
                        specialization: 'gunner',
                        icon: '⚔️',
                        position: { row: 3, col: 1 }, // Position in skill tree
                        requiredLevel: 8, // Player level required
                        prerequisites: ['bullet_storm'], // Requires Bullet Storm
                        effects: [
                            {
                                type: 'damage',
                                value: 0.25 // 25% increase
                            }
                        ]
                    }
                ]
            },
            {
                id: 'juggernaut',
                name: 'Juggernaut',
                description: 'Physical collisions and defensive capabilities. Increased shield durability and ramming damage.',
                icon: '🛡️',
                color: '#55ff55',
                skills: [
                    {
                        id: 'shield_surge',
                        name: 'Shield Surge',
                        description: 'Temporarily increases shield capacity by 100%',
                        type: 'active',
                        cooldown: 30,
                        duration: 8,
                        level: 0,
                        maxLevel: 3,
                        specialization: 'juggernaut',
                        icon: '🛡️',
                        position: { row: 0, col: 1 }, // Position in skill tree
                        requiredLevel: 1, // Player level required
                        prerequisites: [], // No prerequisites for first skill
                        effect: function(game, player) {
                            // Store original max shield
                            const originalMaxShield = player.maxShield;
                            
                            // Double shield capacity and restore to full
                            player.maxShield *= 2;
                            player.shield = player.maxShield;
                            
                            // Create visual effect
                            game.particleSystem.createExplosion(player.x, player.y, '#55ff55', 20, 3, 100);
                            
                            // Show message
                            game.uiSystem.showAlert('Shield Surge activated!', 1);
                            
                            // Update UI
                            if (game.uiSystem && game.uiSystem.updateShieldDisplay) {
                                game.uiSystem.updateShieldDisplay();
                            }
                            
                            // Reset after duration
                            setTimeout(() => {
                                player.maxShield = originalMaxShield;
                                // Cap current shield at max
                                if (player.shield > player.maxShield) {
                                    player.shield = player.maxShield;
                                }
                                
                                // Update UI
                                if (game.uiSystem && game.uiSystem.updateShieldDisplay) {
                                    game.uiSystem.updateShieldDisplay();
                                }
                                
                                game.uiSystem.showAlert('Shield Surge ended', 1);
                            }, this.duration * 1000);
                        }
                    },
                    {
                        id: 'reinforced_hull',
                        name: 'Reinforced Hull',
                        description: 'Increases shield capacity by 20%',
                        type: 'passive',
                        level: 0,
                        maxLevel: 3,
                        specialization: 'juggernaut',
                        icon: '🔩',
                        position: { row: 1, col: 0 }, // Position in skill tree
                        requiredLevel: 3, // Player level required
                        prerequisites: ['shield_surge'], // Requires Shield Surge
                        effects: [
                            {
                                type: 'shield',
                                value: 0.2 // 20% increase
                            }
                        ]
                    },
                    {
                        id: 'ramming_speed',
                        name: 'Ramming Speed',
                        description: 'Increases collision damage by 50%',
                        type: 'passive',
                        level: 0,
                        maxLevel: 3,
                        specialization: 'juggernaut',
                        icon: '💥',
                        position: { row: 1, col: 2 }, // Position in skill tree
                        requiredLevel: 3, // Player level required
                        prerequisites: ['shield_surge'], // Requires Shield Surge
                        effects: [
                            {
                                type: 'collisionDamage',
                                value: 0.5 // 50% increase
                            }
                        ]
                    },
                    {
                        id: 'shield_bash',
                        name: 'Shield Bash',
                        description: 'Dash forward, dealing damage to all enemies in your path',
                        type: 'active',
                        cooldown: 20,
                        level: 0,
                        maxLevel: 3,
                        specialization: 'juggernaut',
                        icon: '⚡',
                        position: { row: 2, col: 1 }, // Position in skill tree
                        requiredLevel: 5, // Player level required
                        prerequisites: ['reinforced_hull', 'ramming_speed'], // Requires both previous skills
                        effect: function(game, player) {
                            // Store original speed
                            const originalSpeed = player.baseSpeed;
                            const originalCollisionDamage = player.collisionDamage;
                            
                            // Increase speed and collision damage
                            player.baseSpeed *= 3;
                            player.currentSpeed = player.baseSpeed;
                            player.collisionDamage *= 2;
                            
                            // Make player temporarily invulnerable
                            player.isInvulnerable = true;
                            
                            // Create visual effect
                            game.particleSystem.createExplosion(player.x, player.y, '#55ff55', 20, 3, 100);
                            
                            // Show message
                            game.uiSystem.showAlert('Shield Bash!', 1);
                            
                            // Reset after 1 second
                            setTimeout(() => {
                                player.baseSpeed = originalSpeed;
                                player.currentSpeed = player.baseSpeed;
                                player.collisionDamage = originalCollisionDamage;
                                player.isInvulnerable = false;
                                
                                game.uiSystem.showAlert('Shield Bash ended', 1);
                            }, 1000);
                        }
                    },
                    {
                        id: 'impenetrable',
                        name: 'Impenetrable',
                        description: 'Increases shield regeneration by 50%',
                        type: 'passive',
                        level: 0,
                        maxLevel: 1,
                        specialization: 'juggernaut',
                        icon: '✨',
                        position: { row: 3, col: 1 }, // Position in skill tree
                        requiredLevel: 8, // Player level required
                        prerequisites: ['shield_bash'], // Requires Shield Bash
                        effects: [
                            {
                                type: 'shieldRegen',
                                value: 0.5 // 50% increase
                            }
                        ]
                    }
                ]
            },
            {
                id: 'chronos',
                name: 'Chronos',
                description: 'Time manipulation and mobility. Enhanced movement speed and evasion capabilities.',
                icon: '⏱️',
                color: '#55aaff',
                skills: [
                    {
                        id: 'time_warp',
                        name: 'Time Warp',
                        description: 'Temporarily increases movement speed by 100%',
                        type: 'active',
                        cooldown: 15,
                        duration: 3,
                        level: 0,
                        maxLevel: 3,
                        specialization: 'chronos',
                        icon: '⚡',
                        position: { row: 0, col: 1 }, // Position in skill tree
                        requiredLevel: 1, // Player level required
                        prerequisites: [], // No prerequisites for first skill
                        effect: function(game, player) {
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
                            }, this.duration * 1000);
                        }
                    },
                    {
                        id: 'temporal_shield',
                        name: 'Temporal Shield',
                        description: 'Creates a time bubble that absorbs damage',
                        type: 'active',
                        cooldown: 25,
                        duration: 5,
                        level: 1,
                        maxLevel: 3,
                        specialization: 'chronos',
                        icon: '🛡️',
                        position: { row: 1, col: 0 }, // Position in skill tree
                        requiredLevel: 3, // Player level required
                        prerequisites: ['time_warp'], // Requires Time Warp
                        effect: function(game, player) {
                            // Make player invulnerable
                            player.isInvulnerable = true;
                            
                            // Create shield effect
                            const shieldEffect = new Effect(
                                game,
                                player.x,
                                player.y,
                                'temporal_shield',
                                this.duration,
                                player
                            );
                            game.effects.push(shieldEffect);
                            
                            // Show message
                            game.uiSystem.showAlert('Temporal Shield activated!', 1);
                            
                            // Reset after duration
                            setTimeout(() => {
                                player.isInvulnerable = false;
                                game.uiSystem.showAlert('Temporal Shield ended', 1);
                            }, this.duration * 1000);
                        }
                    },
                    {
                        id: 'cooldown_mastery',
                        name: 'Cooldown Mastery',
                        description: 'Reduces all ability cooldowns by 10%',
                        type: 'passive',
                        level: 0,
                        maxLevel: 3,
                        specialization: 'chronos',
                        icon: '🕒',
                        position: { row: 1, col: 2 }, // Position in skill tree
                        requiredLevel: 5, // Player level required
                        prerequisites: ['time_warp'], // Requires Time Warp
                        effects: [
                            {
                                type: 'cooldown',
                                value: 0.1 // 10% reduction
                            }
                        ]
                    }
                ]
            },
            {
                id: 'amplifier',
                name: 'Amplifier',
                description: 'Vacuum energy area effects. Gamma ray bursts, sun bombs, miniature black holes.',
                icon: '💥',
                color: '#ffaa55',
                skills: [
                    {
                        id: 'gamma_burst',
                        name: 'Gamma Burst',
                        description: 'Release a burst of gamma rays damaging all enemies in a cone',
                        type: 'active',
                        cooldown: 18,
                        level: 1,
                        maxLevel: 3,
                        specialization: 'amplifier',
                        icon: '☢️',
                        position: { row: 2, col: 0 }, // Position in skill tree
                        requiredLevel: 5, // Player level required
                        prerequisites: [], // No prerequisites for first skill
                        effect: function(game, player) {
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
                        }
                    },
                    {
                        id: 'sun_bomb',
                        name: 'Sun Bomb',
                        description: 'Deploy a miniature sun that damages nearby enemies',
                        type: 'active',
                        cooldown: 25,
                        duration: 8,
                        level: 1,
                        maxLevel: 3,
                        specialization: 'amplifier',
                        icon: '☀️',
                        position: { row: 2, col: 2 }, // Position in skill tree
                        requiredLevel: 7, // Player level required
                        prerequisites: ['gamma_burst'], // Requires Gamma Burst
                        effect: function(game, player) {
                            // Create sun bomb at player position
                            const sunBomb = {
                                x: player.x,
                                y: player.y - 100,
                                radius: 50,
                                damage: player.primaryWeapon.damage * 0.5,
                                duration: this.duration,
                                timeLeft: this.duration
                            };
                            
                            // Create visual effect
                            game.particleSystem.createExplosion(sunBomb.x, sunBomb.y, '#ffff00', 30, 5, 100);
                            
                            // Show message
                            game.uiSystem.showAlert('Sun Bomb deployed!', 1);
                            
                            // Update function for the sun bomb
                            const updateSunBomb = () => {
                                // Reduce time left
                                sunBomb.timeLeft -= 0.1;
                                
                                // Check if expired
                                if (sunBomb.timeLeft <= 0) {
                                    clearInterval(interval);
                                    
                                    // Final explosion
                                    game.particleSystem.createExplosion(sunBomb.x, sunBomb.y, '#ff0000', 50, 8, 200);
                                    
                                    // Damage all enemies in range
                                    game.entities.forEach(entity => {
                                        if (entity.type === 'enemy') {
                                            const dx = entity.x - sunBomb.x;
                                            const dy = entity.y - sunBomb.y;
                                            const distance = Math.sqrt(dx * dx + dy * dy);
                                            
                                            if (distance <= sunBomb.radius * 2) {
                                                entity.takeDamage(player.primaryWeapon.damage * 3);
                                            }
                                        }
                                    });
                                    
                                    return;
                                }
                                
                                // Damage enemies in range
                                game.entities.forEach(entity => {
                                    if (entity.type === 'enemy') {
                                        const dx = entity.x - sunBomb.x;
                                        const dy = entity.y - sunBomb.y;
                                        const distance = Math.sqrt(dx * dx + dy * dy);
                                        
                                        if (distance <= sunBomb.radius) {
                                            entity.takeDamage(sunBomb.damage * 0.1);
                                            
                                            // Create hit effect
                                            if (Math.random() < 0.2) {
                                                game.particleSystem.createExplosion(entity.x, entity.y, '#ffff00', 5, 1, 20);
                                            }
                                        }
                                    }
                                });
                                
                                // Create pulsing effect
                                if (Math.random() < 0.3) {
                                    const angle = Math.random() * Math.PI * 2;
                                    const distance = Math.random() * sunBomb.radius;
                                    const x = sunBomb.x + Math.cos(angle) * distance;
                                    const y = sunBomb.y + Math.sin(angle) * distance;
                                    
                                    game.particleSystem.createExplosion(x, y, '#ffff00', 5, 2, 30);
                                }
                            };
                            
                            // Update sun bomb every 100ms
                            const interval = setInterval(updateSunBomb, 100);
                        }
                    },
                    {
                        id: 'energy_amplification',
                        name: 'Energy Amplification',
                        description: 'Increases all damage by 15%',
                        type: 'passive',
                        level: 0,
                        maxLevel: 3,
                        specialization: 'amplifier',
                        icon: '⚡',
                        position: { row: 3, col: 0 }, // Position in skill tree
                        requiredLevel: 7, // Player level required
                        prerequisites: ['sun_bomb'], // Requires Sun Bomb
                        effects: [
                            {
                                type: 'damage',
                                value: 0.15 // 15% increase
                            }
                        ]
                    }
                ]
            },
            {
                id: 'mothership',
                name: 'Mothership',
                description: 'Autonomous drone ships. Multiple drone types and formations.',
                icon: '🚀',
                color: '#aa55ff',
                skills: [
                    {
                        id: 'attack_drones',
                        name: 'Attack Drones',
                        description: 'Deploy 3 attack drones that orbit and fire at nearby enemies',
                        type: 'active',
                        cooldown: 40,
                        duration: 15,
                        level: 1,
                        maxLevel: 3,
                        specialization: 'mothership',
                        icon: '🛸',
                        position: { row: 0, col: 1 }, // Position in skill tree
                        requiredLevel: 1, // Player level required
                        prerequisites: [], // No prerequisites for first skill
                        effect: function(game, player) {
                            // Drone parameters
                            const droneCount = 3;
                            const droneRadius = 80; // Orbit radius
                            const drones = [];
                            
                            // Create drones
                            for (let i = 0; i < droneCount; i++) {
                                const angle = (i / droneCount) * Math.PI * 2;
                                const drone = {
                                    x: player.x + Math.cos(angle) * droneRadius,
                                    y: player.y + Math.sin(angle) * droneRadius,
                                    angle: angle,
                                    orbitSpeed: 1, // radians per second
                                    fireInterval: 1, // seconds between shots
                                    lastFireTime: 0,
                                    damage: player.primaryWeapon.damage * 0.5
                                };
                                drones.push(drone);
                                
                                // Create spawn effect
                                game.particleSystem.createExplosion(drone.x, drone.y, '#aa55ff', 15, 3, 50);
                            }
                            
                            // Show message
                            game.uiSystem.showAlert('Attack Drones deployed!', 1);
                            
                            // Update drones
                            const updateDrones = () => {
                                if (!game.isRunning) {
                                    clearInterval(droneInterval);
                                    return;
                                }
                                
                                // Update each drone
                                drones.forEach(drone => {
                                    // Update orbit position
                                    drone.angle += drone.orbitSpeed * 0.05; // 0.05 seconds
                                    drone.x = player.x + Math.cos(drone.angle) * droneRadius;
                                    drone.y = player.y + Math.sin(drone.angle) * droneRadius;
                                    
                                    // Create trail effect
                                    if (Math.random() < 0.3) {
                                        game.particleSystem.createExplosion(drone.x, drone.y, '#aa55ff', 3, 1, 20);
                                    }
                                    
                                    // Check if it's time to fire
                                    drone.lastFireTime += 0.05;
                                    if (drone.lastFireTime >= drone.fireInterval) {
                                        // Find nearest enemy
                                        let nearestEnemy = null;
                                        let nearestDistance = 300; // Max targeting range
                                        
                                        game.entities.forEach(entity => {
                                            if (entity.type === 'enemy') {
                                                const dx = entity.x - drone.x;
                                                const dy = entity.y - drone.y;
                                                const distance = Math.sqrt(dx * dx + dy * dy);
                                                
                                                if (distance < nearestDistance) {
                                                    nearestEnemy = entity;
                                                    nearestDistance = distance;
                                                }
                                            }
                                        });
                                        
                                        // Fire at nearest enemy
                                        if (nearestEnemy) {
                                            const dx = nearestEnemy.x - drone.x;
                                            const dy = nearestEnemy.y - drone.y;
                                            const angle = Math.atan2(dy, dx);
                                            
                                            // Create projectile
                                            const projectile = new Projectile(
                                                game,
                                                drone.x,
                                                drone.y,
                                                400, // speed
                                                angle,
                                                drone.damage,
                                                'player',
                                                '#aa55ff'
                                            );
                                            
                                            // Add to game projectiles
                                            game.projectiles.push(projectile);
                                            
                                            // Create fire effect
                                            game.particleSystem.createExplosion(drone.x, drone.y, '#aa55ff', 5, 1, 20);
                                        }
                                        
                                        drone.lastFireTime = 0;
                                    }
                                });
                            };
                            
                            // Update drones every 50ms
                            const droneInterval = setInterval(updateDrones, 50);
                            
                            // End drone deployment after duration
                            setTimeout(() => {
                                clearInterval(droneInterval);
                                
                                // Create disappear effects
                                drones.forEach(drone => {
                                    game.particleSystem.createExplosion(drone.x, drone.y, '#aa55ff', 15, 3, 50);
                                });
                                
                                game.uiSystem.showAlert('Attack Drones recalled', 1);
                            }, this.duration * 1000);
                        }
                    },
                    {
                        id: 'defense_matrix',
                        name: 'Defense Matrix',
                        description: 'Deploy 4 defensive drones that block incoming projectiles',
                        type: 'active',
                        cooldown: 35,
                        duration: 12,
                        level: 1,
                        maxLevel: 3,
                        specialization: 'mothership',
                        icon: '🔰',
                        position: { row: 1, col: 1 }, // Position in skill tree
                        requiredLevel: 5, // Player level required
                        prerequisites: ['attack_drones'], // Requires Attack Drones
                        effect: function(game, player) {
                            // Drone parameters
                            const droneCount = 4;
                            const droneRadius = 60; // Distance from player
                            const drones = [];
                            
                            // Create drones
                            for (let i = 0; i < droneCount; i++) {
                                const angle = (i / droneCount) * Math.PI * 2;
                                const drone = {
                                    x: player.x + Math.cos(angle) * droneRadius,
                                    y: player.y + Math.sin(angle) * droneRadius,
                                    angle: angle,
                                    orbitSpeed: 1.5, // radians per second
                                    shieldRadius: 20
                                };
                                drones.push(drone);
                                
                                // Create spawn effect
                                game.particleSystem.createExplosion(drone.x, drone.y, '#5555ff', 15, 3, 50);
                            }
                            
                            // Show message
                            game.uiSystem.showAlert('Defense Matrix activated!', 1);
                            
                            // Update drones
                            const updateDrones = () => {
                                if (!game.isRunning) {
                                    clearInterval(droneInterval);
                                    return;
                                }
                                
                                // Update each drone
                                drones.forEach(drone => {
                                    // Update orbit position
                                    drone.angle += drone.orbitSpeed * 0.05; // 0.05 seconds
                                    drone.x = player.x + Math.cos(drone.angle) * droneRadius;
                                    drone.y = player.y + Math.sin(drone.angle) * droneRadius;
                                    
                                    // Create shield effect
                                    if (Math.random() < 0.2) {
                                        game.particleSystem.createExplosion(drone.x, drone.y, '#5555ff', 3, 1, 20);
                                    }
                                    
                                    // Check for enemy projectiles
                                    game.projectiles.forEach(projectile => {
                                        if (projectile.source === 'enemy') {
                                            const dx = projectile.x - drone.x;
                                            const dy = projectile.y - drone.y;
                                            const distance = Math.sqrt(dx * dx + dy * dy);
                                            
                                            if (distance <= drone.shieldRadius) {
                                                // Block projectile
                                                projectile.shouldRemove = true;
                                                
                                                // Create block effect
                                                game.particleSystem.createExplosion(projectile.x, projectile.y, '#5555ff', 10, 2, 40);
                                            }
                                        }
                                    });
                                });
                            };
                            
                            // Update drones every 50ms
                            const droneInterval = setInterval(updateDrones, 50);
                            
                            // End drone deployment after duration
                            setTimeout(() => {
                                clearInterval(droneInterval);
                                
                                // Create disappear effects
                                drones.forEach(drone => {
                                    game.particleSystem.createExplosion(drone.x, drone.y, '#5555ff', 15, 3, 50);
                                });
                                
                                game.uiSystem.showAlert('Defense Matrix deactivated', 1);
                            }, this.duration * 1000);
                        }
                    },
                    {
                        id: 'drone_efficiency',
                        name: 'Drone Efficiency',
                        description: 'Increases drone damage and duration by 15%',
                        type: 'passive',
                        level: 0,
                        maxLevel: 3,
                        specialization: 'mothership',
                        icon: '⚙️',
                        position: { row: 2, col: 1 }, // Position in skill tree
                        requiredLevel: 7, // Player level required
                        prerequisites: ['defense_matrix'], // Requires Defense Matrix
                        effects: [
                            {
                                type: 'droneDamage',
                                value: 0.15 // 15% increase
                            },
                            {
                                type: 'droneDuration',
                                value: 0.15 // 15% increase
                            }
                        ]
                    }
                ]
            },
            {
                id: 'mechanic',
                name: 'Mechanic',
                description: 'Passive improvements to ship systems. Stat boosts to damage, shield capacity, regeneration.',
                icon: '🔧',
                color: '#55ffff',
                skills: [
                    {
                        id: 'emergency_repair',
                        name: 'Emergency Repair',
                        description: 'Instantly restore 50% of shields and increase regeneration for a short time',
                        type: 'active',
                        cooldown: 30,
                        duration: 10,
                        level: 0,
                        maxLevel: 3,
                        specialization: 'mechanic',
                        icon: '🔧',
                        position: { row: 0, col: 1 }, // Position in skill tree
                        requiredLevel: 1, // Player level required
                        prerequisites: [], // No prerequisites for first skill
                        effect: function(game, player) {
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
                            }, this.duration * 1000);
                        }
                    },
                    {
                        id: 'overclock',
                        name: 'Overclock',
                        description: 'Temporarily boost all ship systems by 30%',
                        type: 'active',
                        cooldown: 45,
                        duration: 8,
                        level: 0,
                        maxLevel: 3,
                        specialization: 'mechanic',
                        icon: '⚡',
                        position: { row: 1, col: 2 }, // Position in skill tree
                        requiredLevel: 3, // Player level required
                        prerequisites: ['emergency_repair'], // Requires Emergency Repair
                        effect: function(game, player) {
                            // Store original values
                            const originalDamage = player.primaryWeapon.damage;
                            const originalFireRate = player.primaryWeapon.fireRate;
                            const originalSpeed = player.baseSpeed;
                            const originalRegenRate = player.shieldRegenRate;
                            
                            // Boost all systems
                            player.primaryWeapon.damage *= 1.3;
                            player.primaryWeapon.fireRate *= 1.3;
                            player.baseSpeed *= 1.3;
                            player.currentSpeed = player.baseSpeed;
                            player.shieldRegenRate *= 1.3;
                            
                            // Create overclock effect
                            game.particleSystem.createExplosion(player.x, player.y, '#ffff00', 30, 5, 150);
                            
                            // Show message
                            game.uiSystem.showAlert('Systems Overclocked!', 1);
                            
                            // Reset after duration
                            setTimeout(() => {
                                player.primaryWeapon.damage = originalDamage;
                                player.primaryWeapon.fireRate = originalFireRate;
                                player.baseSpeed = originalSpeed;
                                player.currentSpeed = player.baseSpeed;
                                player.shieldRegenRate = originalRegenRate;
                                game.uiSystem.showAlert('Overclock ended', 1);
                            }, this.duration * 1000);
                        }
                    },
                    {
                        id: 'efficiency',
                        name: 'Efficiency',
                        description: 'Increases shield regeneration by 20%',
                        type: 'passive',
                        level: 0,
                        maxLevel: 3,
                        specialization: 'mechanic',
                        icon: '🔋',
                        position: { row: 2, col: 2 }, // Position in skill tree
                        requiredLevel: 5, // Player level required
                        prerequisites: ['overclock'], // Requires Overclock
                        effects: [
                            {
                                type: 'shieldRegen',
                                value: 0.2 // 20% increase
                            }
                        ]
                    }
                ]
            }
        ];
        
        this.selectedSpecializations = [];
        this.maxSelections = 2;
        this.specializationUnlockLevels = [2, 10]; // First at level 2, second at level 10
        this.pendingSpecializationUnlock = false;
        
        console.log('SpecializationSystem initialized with unlock levels:', this.specializationUnlockLevels);
    }
    
    /**
     * Check if a specialization can be unlocked at the current level
     * @returns {boolean} Whether a specialization can be unlocked
     */
    checkSpecializationUnlock() {
        console.log('Checking for specialization unlock...');
        
        const currentLevel = this.game.level;
        console.log(`Current level: ${currentLevel}`);
        
        // Make sure game.selectedSpecializations is initialized
        if (!this.game.selectedSpecializations) {
            console.log('Initializing empty selectedSpecializations array');
            this.game.selectedSpecializations = [];
        }
        
        // Check if specializationUnlockLevels is defined
        if (!this.specializationUnlockLevels) {
            console.error('specializationUnlockLevels is not defined, initializing it');
            this.specializationUnlockLevels = [2, 10]; // First at level 2, second at level 10
        }
        
        const currentSpecCount = this.game.selectedSpecializations.length;
        console.log(`Current specialization count: ${currentSpecCount}`);
        console.log(`Unlock levels: ${this.specializationUnlockLevels}`);
        
        // Check if we have fewer specializations than allowed and if the current level meets the requirement
        if (currentSpecCount < this.maxSelections && 
            this.specializationUnlockLevels && 
            currentLevel >= this.specializationUnlockLevels[currentSpecCount]) {
            console.log('Specialization can be unlocked!');
            this.pendingSpecializationUnlock = true;
            return true;
        }
        
        console.log('No specialization can be unlocked at this time');
        return false;
    }
    
    /**
     * Show the specialization selection UI within the skills tab
     */
    showSpecializationSelection() {
        console.log('Showing specialization selection UI...');
        
        if (!this.pendingSpecializationUnlock) {
            console.log('No pending specialization unlock, not showing selection UI');
            return;
        }
        
        const container = document.getElementById('skills-content');
        if (!container) {
            console.error('Skills content container not found');
            
            // Try to find the container in the menu-content
            const menuContent = document.getElementById('menu-content');
            if (menuContent) {
                console.log('Found menu-content, creating skills-content');
                const skillsContent = document.createElement('div');
                skillsContent.id = 'skills-content';
                skillsContent.className = 'tab-content';
                menuContent.appendChild(skillsContent);
                
                // Try again with the newly created container
                this.showSpecializationSelection();
                return;
            }
            
            return;
        }
        
        console.log('Creating specialization selection UI');
        
        // Create specialization selection UI
        container.innerHTML = `
            <div class="skill-tree-layout">
                <div class="skill-tree-header">
                    <h3>Unlock Specialization</h3>
                    <div id="skill-points-header">
                        <p>Level ${this.game.level}: Choose a specialization to unlock</p>
                    </div>
                </div>
                <div id="specialization-selection-container">
                    <div class="specialization-grid" id="specialization-options"></div>
                </div>
            </div>
        `;
        
        // Initialize the selection options
        this.initializeSelectionScreen();
        
        // Add confirm button
        const confirmContainer = document.createElement('div');
        confirmContainer.className = 'confirm-specialization-container';
        confirmContainer.innerHTML = `
            <button id="confirm-specialization" class="primary-button" disabled>Confirm Selection</button>
        `;
        
        const selectionContainer = document.getElementById('specialization-selection-container');
        if (selectionContainer) {
            console.log('Adding confirm button to selection container');
            selectionContainer.appendChild(confirmContainer);
            
            // Add event listener for confirm button
            const confirmButton = document.getElementById('confirm-specialization');
            if (confirmButton) {
                console.log('Adding event listener to confirm button');
                confirmButton.addEventListener('click', () => {
                    console.log('Confirm button clicked, applying specialization');
                    this.applySelectedSpecializations();
                    
                    // Reload the skill tree view
                    console.log('Reloading skill tree view');
                    this.game.loadSkillTree();
                });
            }
        } else {
            console.error('Specialization selection container not found');
        }
    }
    
    /**
     * Initialize the specialization selection options
     */
    initializeSelectionScreen() {
        const container = document.getElementById('specialization-options');
        if (!container) {
            console.error('Specialization options container not found');
            return;
        }
        
        container.innerHTML = '';
        
        // Make sure game.selectedSpecializations is initialized
        if (!this.game.selectedSpecializations) {
            this.game.selectedSpecializations = [];
        }
        
        // Filter out already selected specializations
        const availableSpecs = this.availableSpecializations.filter(
            spec => !this.game.selectedSpecializations.includes(spec.id)
        );
        
        if (availableSpecs.length === 0) {
            container.innerHTML = '<p>No more specializations available to unlock.</p>';
            return;
        }
        
        availableSpecs.forEach(spec => {
            const specElement = document.createElement('div');
            specElement.className = 'specialization-card';
            specElement.dataset.id = spec.id;
            specElement.style.borderColor = spec.color;
            
            specElement.innerHTML = `
                <div class="spec-icon" style="background-color: ${spec.color}">${spec.icon}</div>
                <div class="spec-details">
                    <h3>${spec.name}</h3>
                    <p>${spec.description}</p>
                </div>
            `;
            
            specElement.addEventListener('click', () => this.toggleSpecialization(spec.id, specElement));
            
            container.appendChild(specElement);
        });
        
        // Reset selections
        this.selectedSpecializations = [];
        this.updateConfirmButton();
    }
    
    /**
     * Toggle selection of a specialization
     * @param {string} specId - ID of the specialization
     * @param {HTMLElement} element - The DOM element
     */
    toggleSpecialization(specId, element) {
        // For unlocking one specialization at a time, we clear previous selections
        if (this.pendingSpecializationUnlock) {
            // Clear all selections
            document.querySelectorAll('.specialization-card.selected').forEach(el => {
                el.classList.remove('selected');
            });
            this.selectedSpecializations = [];
            
            // Select the new one
            this.selectedSpecializations.push(specId);
            element.classList.add('selected');
        } else {
            // Original behavior for selecting multiple specializations
            const index = this.selectedSpecializations.indexOf(specId);
            
            if (index === -1) {
                // Not selected, try to select it
                if (this.selectedSpecializations.length < this.maxSelections) {
                    this.selectedSpecializations.push(specId);
                    element.classList.add('selected');
                }
            } else {
                // Already selected, deselect it
                this.selectedSpecializations.splice(index, 1);
                element.classList.remove('selected');
            }
        }
        
        this.updateConfirmButton();
    }
    
    /**
     * Update the confirm button state based on selections
     */
    updateConfirmButton() {
        const confirmButton = document.getElementById('confirm-specialization');
        if (!confirmButton) return;
        
        if (this.pendingSpecializationUnlock) {
            // For unlocking one specialization at a time
            confirmButton.disabled = this.selectedSpecializations.length !== 1;
            confirmButton.textContent = 'Confirm Selection';
        } else {
            // Original behavior for selecting multiple specializations
            confirmButton.disabled = this.selectedSpecializations.length !== this.maxSelections;
            confirmButton.textContent = `Confirm Selections (${this.selectedSpecializations.length}/${this.maxSelections})`;
        }
    }
    
    /**
     * Apply the selected specializations to the player
     */
    applySelectedSpecializations() {
        console.log('Applying selected specializations...');
        
        // If this is a specialization unlock during the game
        if (this.pendingSpecializationUnlock) {
            console.log('Handling pending specialization unlock');
            
            // Add the new specialization to the game's selected specializations
            const newSpecId = this.selectedSpecializations[0];
            console.log(`Selected specialization ID: ${newSpecId}`);
            
            // Make sure game.selectedSpecializations is initialized
            if (!this.game.selectedSpecializations) {
                console.log('Initializing empty selectedSpecializations array');
                this.game.selectedSpecializations = [];
            }
            
            // Make sure it's not already selected
            if (!this.game.selectedSpecializations.includes(newSpecId)) {
                console.log(`Adding specialization ${newSpecId} to game's selected specializations`);
                this.game.selectedSpecializations.push(newSpecId);
                
                // Get the specialization
                const spec = this.getSpecializationById(newSpecId);
                if (spec) {
                    console.log(`Specialization unlocked: ${spec.name}`);
                    
                    // Show confirmation message
                    console.log('Showing confirmation message');
                    this.game.uiSystem.showAlert(`Specialization unlocked: ${spec.name}. Use skill points to unlock skills.`, 3);
                }
                
                // Reset the pending flag
                console.log('Resetting pending specialization unlock flag');
                this.pendingSpecializationUnlock = false;
            } else {
                console.log(`Specialization ${newSpecId} is already selected`);
            }
        } else {
            // Original behavior for game start
            console.log('Handling game start specialization selection');
            this.game.selectedSpecializations = this.selectedSpecializations;
        }
    }
    
    /**
     * Get a specialization by ID
     * @param {string} id - Specialization ID
     * @returns {Object} The specialization object
     */
    getSpecializationById(id) {
        console.log(`Looking for specialization with ID: ${id}`);
        const spec = this.availableSpecializations.find(spec => spec.id === id);
        if (spec) {
            console.log(`Found specialization: ${spec.name}`);
        } else {
            console.error(`Specialization with ID ${id} not found`);
        }
        return spec;
    }
    
    /**
     * Check if the player has a specific specialization
     * @param {string} id - Specialization ID to check
     * @returns {boolean} True if the player has the specialization
     */
    hasSpecialization(id) {
        if (!this.game.selectedSpecializations) {
            this.game.selectedSpecializations = [];
        }
        return this.game.selectedSpecializations.includes(id);
    }
    
    /**
     * Get a skill by ID
     * @param {string} specId - Specialization ID
     * @param {string} skillId - Skill ID
     * @returns {Object} The skill object
     */
    getSkillById(specId, skillId) {
        const spec = this.getSpecializationById(specId);
        if (!spec) return null;
        
        return spec.skills.find(skill => skill.id === skillId);
    }
    
    /**
     * Upgrade a skill
     * @param {string} specId - Specialization ID
     * @param {string} skillId - Skill ID
     * @returns {boolean} Whether the upgrade was successful
     */
    upgradeSkill(specId, skillId) {
        console.log(`Attempting to upgrade skill ${skillId} in specialization ${specId}`);
        
        const skill = this.getSkillById(specId, skillId);
        if (!skill) {
            console.error(`Skill ${skillId} not found in specialization ${specId}`);
            return false;
        }
        
        // Check if skill is available
        if (!this.isSkillAvailable(specId, skillId)) {
            console.error(`Skill ${skill.name} is not available for upgrade`);
            return false;
        }
        
        // Check if skill is already at max level
        if (skill.level >= skill.maxLevel) {
            console.error(`Skill ${skill.name} is already at max level`);
            return false;
        }
        
        // Check if player has enough skill points
        if (this.game.skillPoints <= 0) {
            console.error('Not enough skill points');
            return false;
        }
        
        // Upgrade the skill
        skill.level++;
        this.game.skillPoints--;
        
        // If the skill has an onLevelChange handler, call it
        if (typeof skill.onLevelChange === 'function') {
            console.log(`Calling onLevelChange handler for ${skill.name}`);
            skill.onLevelChange(skill.level);
        } 
        // Otherwise update effect values for special cases like multi_shot
        else if (skill.id === 'multi_shot') {
            // Set the effect value to the skill level for multi_shot
            skill.effects.forEach(effect => {
                if (effect.type === 'multiShot') {
                    effect.value = skill.level;
                    console.log(`Manually updated multiShot effect value to ${effect.value}`);
                }
            });
        }
        // Add special case for critical_strike if needed
        else if (skill.id === 'critical_strike') {
            // Set the effect value based on level
            skill.effects.forEach(effect => {
                if (effect.type === 'criticalStrike') {
                    effect.value = 0.15 + (skill.level - 1) * 0.1;
                    console.log(`Manually updated criticalStrike chance to ${effect.value * 100}%`);
                }
            });
        }
        
        console.log(`Upgraded skill ${skill.name} to level ${skill.level}`);
        
        // If this is the first level, add the skill to the player
        if (skill.level === 1) {
            console.log(`Adding skill ${skill.name} to player`);
            this.game.player.addSkill(skill);
        } else {
            console.log(`Updating skill ${skill.name} for player to level ${skill.level}`);
            
            // Debug: Check if the skill object being passed has the correct level
            console.log(`Skill object being passed to updateSkill:`, {
                id: skill.id,
                name: skill.name,
                level: skill.level,
                type: skill.type
            });
            
            this.game.player.updateSkill(skill);
            
            // Debug: Check player's multiShotLevel after update
            if (skill.id === 'multi_shot') {
                console.log(`Player's multiShotLevel after update: ${this.game.player.multiShotLevel}`);
            }
        }
        
        // Update UI
        if (this.game.uiSystem && this.game.uiSystem.updateStatsDisplay) {
            this.game.uiSystem.updateStatsDisplay();
        }
        
        // Update skill icons if it's an active skill
        if (skill.type === 'active' && this.game.uiSystem && this.game.uiSystem.updateSkillIcons) {
            this.game.uiSystem.updateSkillIcons();
        }
        
        return true;
    }
    
    /**
     * Check if a skill is available to be upgraded
     * @param {string} specId - Specialization ID
     * @param {string} skillId - Skill ID
     * @returns {boolean} Whether the skill is available
     */
    isSkillAvailable(specId, skillId) {
        console.log(`Checking if skill ${skillId} is available in specialization ${specId}`);
        
        const skill = this.getSkillById(specId, skillId);
        if (!skill) {
            console.error(`Skill ${skillId} not found in specialization ${specId}`);
            return false;
        }
        
        // Check player level requirement
        if (this.game.level < skill.requiredLevel) {
            console.log(`Player level ${this.game.level} is below required level ${skill.requiredLevel}`);
            return false;
        }
        
        // Check prerequisites
        if (skill.prerequisites && skill.prerequisites.length > 0) {
            for (const prereqId of skill.prerequisites) {
                const prereqSkill = this.getSkillById(specId, prereqId);
                if (!prereqSkill) {
                    console.error(`Prerequisite skill ${prereqId} not found`);
                    return false;
                }
                
                if (prereqSkill.level === 0) {
                    console.log(`Prerequisite skill ${prereqSkill.name} is not unlocked`);
                    return false;
                }
            }
        }
        
        console.log(`Skill ${skill.name} is available`);
        return true;
    }
    
    /**
     * Render the skill tree UI
     * @param {HTMLElement} container - The container element
     */
    renderSkillTree(container) {
        console.log('Rendering skill tree...');
        
        // Validate container
        if (!container) {
            console.error('Skill tree container is null or undefined');
            return;
        }
        
        // Clear container
        container.innerHTML = '';
        
        // Make sure game.selectedSpecializations is initialized
        if (!this.game.selectedSpecializations) {
            console.log('Initializing empty selectedSpecializations array');
            this.game.selectedSpecializations = [];
        }
        
        // Make sure specializationUnlockLevels is initialized
        if (!this.specializationUnlockLevels) {
            console.log('Initializing specializationUnlockLevels');
            this.specializationUnlockLevels = [2, 10]; // First at level 2, second at level 10
        }
        
        console.log('Selected specializations:', this.game.selectedSpecializations);
        console.log('Current player level:', this.game.level);
        
        // If no specializations are selected yet, show a message
        if (this.game.selectedSpecializations.length === 0) {
            console.log('No specializations selected, showing empty message');
            
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-skill-tree-message';
            
            let message = '<h3>No Specializations Unlocked Yet</h3>';
            
            // Check if any specializations can be unlocked
            if (this.pendingSpecializationUnlock) {
                console.log('Specialization can be unlocked, showing unlock button');
                message += `<p>You can unlock your first specialization now!</p>
                <button id="unlock-specialization-button" class="primary-button">Choose Specialization</button>`;
            } else {
                const nextUnlockLevel = this.specializationUnlockLevels[0];
                console.log(`Next specialization unlocks at level ${nextUnlockLevel}`);
                message += `<p>Reach level ${nextUnlockLevel} to unlock your first specialization.</p>`;
            }
            
            emptyMessage.innerHTML = message;
            container.appendChild(emptyMessage);
            
            // Add event listener for the unlock button if it exists
            const unlockButton = document.getElementById('unlock-specialization-button');
            if (unlockButton) {
                console.log('Adding event listener to unlock button');
                unlockButton.addEventListener('click', () => {
                    this.showSpecializationSelection();
                });
            }
            
            return;
        }
        
        // Render each specialization
        this.game.selectedSpecializations.forEach(specId => {
            // Get the specialization
            const spec = this.getSpecializationById(specId);
            if (!spec) {
                console.error(`Specialization with ID ${specId} not found`);
                return;
            }
            
            console.log(`Rendering specialization: ${spec.name}`);
            
            // Create specialization element
            const specElement = document.createElement('div');
            specElement.className = 'skill-tree';
            specElement.style.borderColor = spec.color;
            
            // Create header
            const headerElement = document.createElement('div');
            headerElement.className = 'skill-tree-header';
            headerElement.style.backgroundColor = spec.color;
            headerElement.innerHTML = `
                <div class="spec-icon">${spec.icon}</div>
                <h3>${spec.name}</h3>
            `;
            specElement.appendChild(headerElement);
            
            // Create content container
            const contentElement = document.createElement('div');
            contentElement.className = 'skill-tree-content';
            specElement.appendChild(contentElement);
            
            // Create grid
            const gridElement = document.createElement('div');
            gridElement.className = 'skill-tree-grid';
            contentElement.appendChild(gridElement);
            
            // Set up grid dimensions
            const gridSize = 4; // 4x4 grid
            gridElement.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
            gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
            
            // Create a 2D array to hold skills
            const skillGrid = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
            
            // Place skills in the grid
            spec.skills.forEach(skill => {
                if (skill.position) {
                    const { row, col } = skill.position;
                    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
                        skillGrid[row][col] = skill;
                    } else {
                        console.error(`Skill ${skill.name} has invalid position: [${row}, ${col}]`);
                    }
                } else {
                    console.error(`Skill ${skill.name} does not have a position property`);
                }
            });
            
            // Render grid cells
            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize; col++) {
                    const skill = skillGrid[row][col];
                    
                    // If no skill in this cell, create an empty cell
                    if (!skill) {
                        const emptyCell = document.createElement('div');
                        emptyCell.className = 'skill-cell empty';
                        emptyCell.style.gridRow = row + 1;
                        emptyCell.style.gridColumn = col + 1;
                        gridElement.appendChild(emptyCell);
                        continue;
                    }
                    
                    console.log(`Rendering skill at position [${row},${col}]: ${skill.name} (Level: ${skill.level})`);
                    
                    // Check if skill is available
                    const isAvailable = this.isSkillAvailable(spec.id, skill.id);
                    const isUnlocked = skill.level > 0;
                    
                    // Create skill node
                    const skillNode = document.createElement('div');
                    skillNode.className = 'skill-node';
                    skillNode.classList.add(isUnlocked ? 'unlocked' : (isAvailable ? 'available' : 'locked'));
                    if (skill.type === 'passive') skillNode.classList.add('passive');
                    
                    skillNode.style.gridRow = row + 1;
                    skillNode.style.gridColumn = col + 1;
                    
                    skillNode.innerHTML = `
                        <div class="skill-icon">${skill.icon}</div>
                        <div class="skill-info">
                            <h4>${skill.name}</h4>
                            <div class="skill-level">Level ${skill.level}/${skill.maxLevel}</div>
                        </div>
                    `;
                    
                    // Add click event to show skill details
                    skillNode.addEventListener('click', () => {
                        this.showSkillDetails(spec.id, skill.id, gridElement);
                    });
                    
                    gridElement.appendChild(skillNode);
                    
                    // Create connections to prerequisites
                    if (skill.prerequisites && skill.prerequisites.length > 0) {
                        skill.prerequisites.forEach(prereqId => {
                            // Find the prerequisite skill
                            const prereqSkill = spec.skills.find(s => s.id === prereqId);
                            if (!prereqSkill || !prereqSkill.position) return;
                            
                            const prereqPos = prereqSkill.position;
                            
                            // Skip if prereq is out of bounds
                            if (prereqPos.row < 0 || prereqPos.row >= gridSize || 
                                prereqPos.col < 0 || prereqPos.col >= gridSize) {
                                return;
                            }
                            
                            // Create connection element
                            const connection = document.createElement('div');
                            connection.className = 'skill-connection';
                            
                            if (isUnlocked || (prereqSkill.level > 0 && isAvailable)) {
                                connection.classList.add('unlocked');
                            }
                            
                            // Determine connection direction and position
                            if (prereqPos.row === row) {
                                // Horizontal connection
                                connection.classList.add('horizontal');
                                connection.style.gridRow = row + 1;
                                connection.style.gridColumn = `${Math.min(prereqPos.col, col) + 1} / ${Math.max(prereqPos.col, col) + 1}`;
                            } else if (prereqPos.col === col) {
                                // Vertical connection
                                connection.classList.add('vertical');
                                connection.style.gridColumn = col + 1;
                                connection.style.gridRow = `${Math.min(prereqPos.row, row) + 1} / ${Math.max(prereqPos.row, row) + 1}`;
                            } else {
                                // Diagonal connection (not implemented for simplicity)
                                return;
                            }
                            
                            gridElement.appendChild(connection);
                        });
                    }
                }
            }
            
            // Add the specialization element to the container
            container.appendChild(specElement);
        });
    }
    
    /**
     * Show skill details and upgrade options
     * @param {string} specId - Specialization ID
     * @param {string} skillId - Skill ID
     * @param {HTMLElement} container - The container element
     */
    showSkillDetails(specId, skillId, container) {
        console.log(`Showing skill details for ${skillId} in specialization ${specId}`);
        
        const skill = this.getSkillById(specId, skillId);
        if (!skill) {
            console.error(`Skill ${skillId} not found in specialization ${specId}`);
            return;
        }
        
        console.log(`Skill details: ${JSON.stringify(skill)}`);
        
        // Check if details panel already exists and remove it
        const existingPanel = document.querySelector('.skill-details-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        // Create details panel
        const detailsPanel = document.createElement('div');
        detailsPanel.className = 'skill-details-panel';
        
        // Check if skill is available
        const isAvailable = this.isSkillAvailable(specId, skillId);
        const isUnlocked = skill.level > 0;
        const canUpgrade = isAvailable && skill.level < skill.maxLevel && this.game.skillPoints > 0;
        
        console.log(`Skill status: available=${isAvailable}, unlocked=${isUnlocked}, canUpgrade=${canUpgrade}`);
        
        // Show appropriate message based on skill status
        let statusMessage = '';
        if (!isAvailable) {
            statusMessage = '<div class="status-message locked">Locked</div>';
            
            // Show requirements
            statusMessage += '<div class="requirements">';
            
            // Level requirement
            statusMessage += `<div class="requirement ${this.game.level >= skill.requiredLevel ? 'met' : 'not-met'}">
                Player Level ${skill.requiredLevel}
            </div>`;
            
            // Prerequisite skills
            if (skill.prerequisites && skill.prerequisites.length > 0) {
                skill.prerequisites.forEach(prereqId => {
                    const prereqSkill = this.getSkillById(specId, prereqId);
                    if (prereqSkill) {
                        statusMessage += `<div class="requirement ${prereqSkill.level > 0 ? 'met' : 'not-met'}">
                            ${prereqSkill.name}
                        </div>`;
                    }
                });
            }
            
            statusMessage += '</div>';
        } else if (skill.level === skill.maxLevel) {
            statusMessage = '<div class="status-message maxed">Maximized</div>';
        } else if (this.game.skillPoints <= 0) {
            statusMessage = '<div class="status-message no-points">No Skill Points</div>';
        } else {
            statusMessage = '<div class="status-message available">Available</div>';
        }
        
        detailsPanel.innerHTML = `
            <div class="skill-details-header">
                <h3>${skill.name}</h3>
                <div class="skill-level">Level ${skill.level}/${skill.maxLevel}</div>
                <button class="close-details">×</button>
            </div>
            <div class="skill-details-content">
                <div class="skill-icon large">${skill.icon}</div>
                <p class="skill-description">${skill.description}</p>
                <div class="skill-attributes">
                    ${skill.type === 'active' ? `<div class="attribute">Type: Active</div>` : `<div class="attribute">Type: Passive</div>`}
                    ${skill.cooldown ? `<div class="attribute">Cooldown: ${skill.cooldown}s</div>` : ''}
                    ${skill.duration ? `<div class="attribute">Duration: ${skill.duration}s</div>` : ''}
                </div>
                ${statusMessage}
                ${canUpgrade ? `<button class="upgrade-skill-button">Upgrade (1 SP)</button>` : ''}
            </div>
        `;
        
        // Add to container
        container.appendChild(detailsPanel);
        
        // Add event listeners
        const closeButton = detailsPanel.querySelector('.close-details');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                detailsPanel.remove();
            });
        }
        
        const upgradeButton = detailsPanel.querySelector('.upgrade-skill-button');
        if (upgradeButton) {
            upgradeButton.addEventListener('click', () => {
                console.log(`Upgrading skill ${skill.name}`);
                if (this.upgradeSkill(specId, skillId)) {
                    console.log(`Successfully upgraded skill ${skill.name} to level ${skill.level}`);
                    
                    // Refresh the skill tree
                    const skillTreeContainer = document.getElementById('skill-trees-container');
                    if (skillTreeContainer) {
                        this.renderSkillTree(skillTreeContainer);
                    } else {
                        console.error('Skill trees container not found for refresh');
                    }
                } else {
                    console.error(`Failed to upgrade skill ${skill.name}`);
                }
            });
        }
    }
    
    /**
     * Add a skill point to the player
     */
    addSkillPoint() {
        // Initialize skillPoints if it doesn't exist
        if (typeof this.game.skillPoints === 'undefined') {
            this.game.skillPoints = 0;
        }
        
        // Add a skill point
        this.game.skillPoints++;
        
        console.log(`Added skill point. Total: ${this.game.skillPoints}`);
        
        // Update UI if available
        if (this.game.uiSystem && this.game.uiSystem.updateStatsDisplay) {
            this.game.uiSystem.updateStatsDisplay();
        }
    }
    
    /**
     * Get specialization data for saving
     */
    getSpecializationData() {
        return this.selectedSpecializations || [];
    }
    
    /**
     * Get skill data for saving
     */
    getSkillData() {
        // Return an empty array for now, can be expanded later to save skill levels
        return [];
    }
    
    /**
     * Load specialization data from save
     */
    loadSpecializationData(specializationData) {
        this.selectedSpecializations = specializationData || [];
    }
    
    /**
     * Load skill data from save
     */
    loadSkillData(skillData) {
        // Placeholder for loading skill data
        // Can be expanded later to load skill levels
    }
    
    /**
     * Reset the specialization system
     */
    reset() {
        console.log('Resetting specialization system');
        
        // Reset selected specializations
        this.selectedSpecializations = [];
        
        // Reset pending unlock flag
        this.pendingSpecializationUnlock = false;
        
        // Reset all skills to their initial state
        this.availableSpecializations.forEach(spec => {
            spec.skills.forEach(skill => {
                // Reset all skills to level 0
                skill.level = 0;
            });
        });
        
        console.log('Specialization system reset');
    }
} 