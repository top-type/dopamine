/**
 * SpecializationSystem - Manages player specializations and skill trees
 * Handles the selection, application, and progression of player specializations
 */
class SpecializationSystem {
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
                        id: 'rapid_fire',
                        name: 'Rapid Fire',
                        description: 'Temporarily increases fire rate by 50%',
                        type: 'active',
                        cooldown: 15,
                        duration: 5,
                        level: 1,
                        maxLevel: 3,
                        specialization: 'gunner',
                        icon: '🔥',
                        effect: function(game, player) {
                            // Use the effect from skills.js if available
                            if (typeof SKILL_EFFECTS !== 'undefined' && SKILL_EFFECTS.RAPID_FIRE) {
                                SKILL_EFFECTS.RAPID_FIRE(game, player);
                            } else {
                                // Fallback implementation
                                // Temporary fire rate boost
                                const originalFireRate = player.primaryWeapon.fireRate;
                                player.primaryWeapon.fireRate *= 1.5;
                                
                                // Create visual effect
                                game.particleSystem.createExplosion(player.x, player.y, '#ff5555', 20, 3, 100);
                                
                                // Show message
                                game.uiSystem.showAlert('Rapid Fire activated!', 1);
                                
                                // Reset after duration
                                setTimeout(() => {
                                    player.primaryWeapon.fireRate = originalFireRate;
                                    game.uiSystem.showAlert('Rapid Fire ended', 1);
                                }, this.duration * 1000);
                            }
                        }
                    },
                    {
                        id: 'precision_shot',
                        name: 'Precision Shot',
                        description: 'Fire a high-damage shot with 100% critical chance',
                        type: 'active',
                        cooldown: 20,
                        level: 1,
                        maxLevel: 3,
                        specialization: 'gunner',
                        icon: '🎯',
                        effect: function(game, player) {
                            // Use the effect from skills.js if available
                            if (typeof SKILL_EFFECTS !== 'undefined' && SKILL_EFFECTS.PRECISION_SHOT) {
                                SKILL_EFFECTS.PRECISION_SHOT(game, player);
                            } else {
                                // Fallback implementation
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
                            }
                        }
                    },
                    {
                        id: 'weapon_mastery',
                        name: 'Weapon Mastery',
                        description: 'Permanently increases weapon damage by 10%',
                        type: 'passive',
                        level: 0,
                        maxLevel: 5,
                        specialization: 'gunner',
                        icon: '⚔️',
                        effects: [
                            {
                                type: 'damage',
                                value: 0.1 // 10% increase
                            }
                        ]
                    }
                ]
            },
            {
                id: 'chronos',
                name: 'Chronos',
                description: 'Time manipulation and movement. Faster ship movement and reduced cooldowns.',
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
                        level: 1,
                        maxLevel: 3,
                        specialization: 'chronos',
                        icon: '⚡',
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
                        level: 1,
                        maxLevel: 3,
                        specialization: 'juggernaut',
                        icon: '🛡️',
                        effect: function(game, player) {
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
                            }, this.duration * 1000);
                        }
                    },
                    {
                        id: 'ram_charge',
                        name: 'Ram Charge',
                        description: 'Charge forward, dealing heavy damage to enemies in your path',
                        type: 'active',
                        cooldown: 15,
                        level: 1,
                        maxLevel: 3,
                        specialization: 'juggernaut',
                        icon: '🏃',
                        effect: function(game, player) {
                            // Charge parameters
                            const chargeDistance = 300;
                            const chargeSpeed = 800; // pixels per second
                            const chargeDamage = player.primaryWeapon.damage * 3;
                            
                            // Store original speed
                            const originalSpeed = player.baseSpeed;
                            const originalY = player.y;
                            
                            // Make player invulnerable during charge
                            player.isInvulnerable = true;
                            
                            // Set charge direction (up)
                            player.vy = -chargeSpeed;
                            
                            // Create charge effect
                            const createTrail = () => {
                                if (!game.isRunning || player.y <= originalY - chargeDistance) {
                                    clearInterval(trailInterval);
                                    return;
                                }
                                
                                game.particleSystem.createExplosion(player.x, player.y + player.radius, '#55ff55', 5, 2, 30);
                            };
                            
                            // Create trail effect
                            const trailInterval = setInterval(createTrail, 50);
                            
                            // Show message
                            game.uiSystem.showAlert('Ram Charge!', 1);
                            
                            // Check for collisions with enemies
                            const checkCollisions = () => {
                                if (!game.isRunning || player.y <= originalY - chargeDistance) {
                                    clearInterval(collisionInterval);
                                    
                                    // End charge
                                    player.vy = 0;
                                    player.isInvulnerable = false;
                                    
                                    // Create end effect
                                    game.particleSystem.createExplosion(player.x, player.y, '#55ff55', 20, 4, 100);
                                    
                                    return;
                                }
                                
                                // Check for collisions with enemies
                                game.entities.forEach(entity => {
                                    if (entity.type === 'enemy') {
                                        const dx = entity.x - player.x;
                                        const dy = entity.y - player.y;
                                        const distance = Math.sqrt(dx * dx + dy * dy);
                                        
                                        if (distance <= player.radius + entity.radius) {
                                            // Damage enemy
                                            entity.takeDamage(chargeDamage);
                                            
                                            // Create hit effect
                                            game.particleSystem.createExplosion(entity.x, entity.y, '#ff0000', 15, 3, 80);
                                        }
                                    }
                                });
                            };
                            
                            // Check for collisions
                            const collisionInterval = setInterval(checkCollisions, 50);
                            
                            // End charge after distance is covered
                            setTimeout(() => {
                                clearInterval(trailInterval);
                                clearInterval(collisionInterval);
                                
                                player.vy = 0;
                                player.isInvulnerable = false;
                                
                                // Create end effect
                                game.particleSystem.createExplosion(player.x, player.y, '#55ff55', 20, 4, 100);
                            }, chargeDistance / chargeSpeed * 1000);
                        }
                    },
                    {
                        id: 'shield_mastery',
                        name: 'Shield Mastery',
                        description: 'Increases shield capacity by 20% and collision damage by 50%',
                        type: 'passive',
                        level: 0,
                        maxLevel: 3,
                        specialization: 'juggernaut',
                        icon: '🔋',
                        effects: [
                            {
                                type: 'shield',
                                value: 0.2 // 20% increase
                            },
                            {
                                type: 'collisionDamage',
                                value: 0.5 // 50% increase
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
                        level: 1,
                        maxLevel: 3,
                        specialization: 'mechanic',
                        icon: '🔧',
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
                        level: 1,
                        maxLevel: 3,
                        specialization: 'mechanic',
                        icon: '⚡',
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
    }
    
    /**
     * Initialize the specialization selection screen
     */
    initializeSelectionScreen() {
        const container = document.getElementById('specialization-options');
        container.innerHTML = '';
        
        this.availableSpecializations.forEach(spec => {
            const specElement = document.createElement('div');
            specElement.className = 'specialization-option';
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
        
        this.updateConfirmButton();
    }
    
    /**
     * Update the confirm button state based on selections
     */
    updateConfirmButton() {
        const confirmButton = document.getElementById('confirm-specializations');
        confirmButton.disabled = this.selectedSpecializations.length !== this.maxSelections;
        confirmButton.textContent = `Confirm Selections (${this.selectedSpecializations.length}/${this.maxSelections})`;
    }
    
    /**
     * Apply the selected specializations to the player
     */
    applySelectedSpecializations() {
        this.game.selectedSpecializations = this.selectedSpecializations;
        
        // Apply initial skills
        this.selectedSpecializations.forEach(specId => {
            const spec = this.getSpecializationById(specId);
            console.log(`Applying specialization: ${spec.name}`);
            
            // Apply level 1 active skills
            spec.skills.forEach(skill => {
                if (skill.level > 0) {
                    this.game.player.addSkill(skill);
                }
            });
        });
    }
    
    /**
     * Get a specialization by ID
     * @param {string} id - Specialization ID
     * @returns {Object} The specialization object
     */
    getSpecializationById(id) {
        return this.availableSpecializations.find(spec => spec.id === id);
    }
    
    /**
     * Check if the player has a specific specialization
     * @param {string} id - Specialization ID to check
     * @returns {boolean} True if the player has the specialization
     */
    hasSpecialization(id) {
        return this.selectedSpecializations.includes(id);
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
        const skill = this.getSkillById(specId, skillId);
        if (!skill) return false;
        
        if (skill.level < skill.maxLevel && this.game.skillPoints > 0) {
            skill.level++;
            this.game.skillPoints--;
            
            // If it's a passive skill being upgraded from 0, apply it
            if (skill.passive && skill.level === 1) {
                skill.effect(this.game.player);
            }
            
            // Update the player's skills
            if (skill.level === 1) {
                this.game.player.addSkill(skill);
            } else {
                this.game.player.updateSkill(skill);
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Render the skill tree UI
     * @param {HTMLElement} container - The container element
     */
    renderSkillTree(container) {
        container.innerHTML = '';
        
        this.selectedSpecializations.forEach(specId => {
            const spec = this.getSpecializationById(specId);
            
            const specElement = document.createElement('div');
            specElement.className = 'skill-tree';
            specElement.style.borderColor = spec.color;
            
            specElement.innerHTML = `
                <div class="skill-tree-header" style="background-color: ${spec.color}">
                    <div class="spec-icon">${spec.icon}</div>
                    <h3>${spec.name}</h3>
                </div>
                <div class="skill-tree-skills"></div>
            `;
            
            const skillsContainer = specElement.querySelector('.skill-tree-skills');
            
            spec.skills.forEach(skill => {
                const skillElement = document.createElement('div');
                skillElement.className = 'skill';
                skillElement.classList.add(skill.level > 0 ? 'unlocked' : 'locked');
                if (skill.passive) skillElement.classList.add('passive');
                
                skillElement.innerHTML = `
                    <div class="skill-header">
                        <h4>${skill.name}</h4>
                        <div class="skill-level">Level ${skill.level}/${skill.maxLevel}</div>
                    </div>
                    <p>${skill.description}</p>
                    <div class="skill-details">
                        ${skill.passive ? '<span class="passive-tag">Passive</span>' : ''}
                        ${!skill.passive ? `<span class="cooldown">Cooldown: ${skill.cooldown}s</span>` : ''}
                        ${skill.duration ? `<span class="duration">Duration: ${skill.duration}s</span>` : ''}
                    </div>
                    <button class="upgrade-skill" ${skill.level >= skill.maxLevel || this.game.skillPoints <= 0 ? 'disabled' : ''}>
                        Upgrade (1 SP)
                    </button>
                `;
                
                const upgradeButton = skillElement.querySelector('.upgrade-skill');
                upgradeButton.addEventListener('click', () => {
                    if (this.upgradeSkill(specId, skill.id)) {
                        // Update UI
                        skillElement.classList.add('unlocked');
                        skillElement.classList.remove('locked');
                        skillElement.querySelector('.skill-level').textContent = `Level ${skill.level}/${skill.maxLevel}`;
                        
                        if (skill.level >= skill.maxLevel || this.game.skillPoints <= 0) {
                            upgradeButton.disabled = true;
                        }
                        
                        // Update skill points display
                        document.getElementById('skill-points').textContent = this.game.skillPoints;
                    }
                });
                
                skillsContainer.appendChild(skillElement);
            });
            
            container.appendChild(specElement);
        });
    }
    
    /**
     * Add a skill point when the player levels up
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
} 