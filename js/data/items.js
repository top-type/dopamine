/**
 * Items - Defines all equipment and items in the game
 */

// Item rarity tiers and their drop chances
const RARITY_TIERS = {
    common: { chance: 0.60, color: '#aaaaaa', multiplier: 1.0 },
    uncommon: { chance: 0.25, color: '#55aa55', multiplier: 1.2 },
    rare: { chance: 0.10, color: '#5555ff', multiplier: 1.5 },
    epic: { chance: 0.04, color: '#aa55aa', multiplier: 2.0 },
    legendary: { chance: 0.01, color: '#ffaa00', multiplier: 3.0 }
};

// Item type definitions with base stats
const ITEM_TYPES = {
    primaryWeapon: {
        slot: 'primaryWeapon',
        baseStats: {
            damage: 25,
            fireRate: 0.5, // shots per second
            projectileSpeed: 10,
            critChance: 0.05,
            critDamage: 1.5
        }
    },
    armor: {
        slot: 'armor',
        baseStats: {
            shieldCapacity: 25,
            damageReduction: 0.05
        }
    },
    engine: {
        slot: 'engine',
        baseStats: {
            speed: 5,
            acceleration: 0.5,
            handling: 0.8
        }
    },
    shield: {
        slot: 'shield',
        baseStats: {
            shieldCapacity: 50,
            shieldRegen: 2, // per second
            shieldDelay: 3 // seconds before regen starts
        }
    },
    special: {
        slot: 'special',
        baseStats: {
            cooldownReduction: 0.05,
            effectDuration: 0.1
        }
    },
    fluxPrimary: {
        slot: 'fluxPrimary',
        baseStats: {
            energyCapacity: 100,
            energyRegen: 5,
            weaponEfficiency: 0.1
        }
    },
    fluxSecondary: {
        slot: 'fluxSecondary',
        baseStats: {
            energyCapacity: 50,
            energyRegen: 8,
            abilityEfficiency: 0.1
        }
    },
    navigationCore: {
        slot: 'navigationCore',
        baseStats: {
            scanRange: 50,
            itemDropRate: 0.05,
            goldDropRate: 0.05
        }
    }
};

// Item templates for each type and rarity
const ITEM_TEMPLATES = {
    // Primary Weapons
    primaryWeapon: {
        common: [
            {
                id: 'laser_cannon',
                name: 'Laser Cannon',
                description: 'Standard issue laser cannon with balanced stats.',
                icon: '🔫',
                stats: {
                    damage: 10,
                    fireRate: 0.5,
                    projectileSpeed: 10,
                    critChance: 0.05,
                    critDamage: 1.5
                }
            },
            {
                id: 'pulse_rifle',
                name: 'Pulse Rifle',
                description: 'Rapid-fire weapon with lower damage per shot.',
                icon: '🔫',
                stats: {
                    damage: 7,
                    fireRate: 0.8,
                    projectileSpeed: 12,
                    critChance: 0.03,
                    critDamage: 1.3
                }
            }
        ],
        uncommon: [
            {
                id: 'heavy_cannon',
                name: 'Heavy Cannon',
                description: 'Slower firing but packs a punch.',
                icon: '🔫',
                stats: {
                    damage: 18,
                    fireRate: 0.3,
                    projectileSpeed: 9,
                    critChance: 0.07,
                    critDamage: 1.6
                }
            },
            {
                id: 'beam_laser',
                name: 'Beam Laser',
                description: 'Continuous beam weapon with good accuracy.',
                icon: '🔫',
                stats: {
                    damage: 12,
                    fireRate: 0.6,
                    projectileSpeed: 15,
                    critChance: 0.06,
                    critDamage: 1.4
                }
            }
        ],
        rare: [
            {
                id: 'plasma_cannon',
                name: 'Plasma Cannon',
                description: 'Fires superheated plasma bolts with high damage.',
                icon: '🔫',
                stats: {
                    damage: 22,
                    fireRate: 0.4,
                    projectileSpeed: 8,
                    critChance: 0.08,
                    critDamage: 1.7
                }
            },
            {
                id: 'quantum_rifle',
                name: 'Quantum Rifle',
                description: 'Fires quantum-entangled particles that bypass some defenses.',
                icon: '🔫',
                stats: {
                    damage: 15,
                    fireRate: 0.7,
                    projectileSpeed: 14,
                    critChance: 0.1,
                    critDamage: 1.8
                }
            }
        ],
        epic: [
            {
                id: 'neutron_blaster',
                name: 'Neutron Blaster',
                description: 'Devastating weapon that fires concentrated neutron beams.',
                icon: '🔫',
                stats: {
                    damage: 30,
                    fireRate: 0.5,
                    projectileSpeed: 12,
                    critChance: 0.12,
                    critDamage: 2.0
                }
            },
            {
                id: 'tachyon_array',
                name: 'Tachyon Array',
                description: 'Fires faster-than-light particles that hit almost instantly.',
                icon: '🔫',
                stats: {
                    damage: 20,
                    fireRate: 0.8,
                    projectileSpeed: 25,
                    critChance: 0.15,
                    critDamage: 1.9
                }
            }
        ],
        legendary: [
            {
                id: 'nova_cannon',
                name: 'Nova Cannon',
                description: 'Legendary weapon that harnesses the power of a dying star.',
                icon: '🔫',
                stats: {
                    damage: 40,
                    fireRate: 0.6,
                    projectileSpeed: 15,
                    critChance: 0.2,
                    critDamage: 2.5
                }
            },
            {
                id: 'singularity_gun',
                name: 'Singularity Gun',
                description: 'Fires miniature black holes that pull in and destroy enemies.',
                icon: '🔫',
                stats: {
                    damage: 35,
                    fireRate: 0.4,
                    projectileSpeed: 10,
                    critChance: 0.25,
                    critDamage: 3.0
                }
            }
        ]
    },
    
    // Armor
    armor: {
        common: [
            {
                id: 'titanium_plating',
                name: 'Titanium Plating',
                description: 'Basic armor plating that provides modest protection.',
                icon: '🛡️',
                stats: {
                    shieldCapacity: 25,
                    damageReduction: 0.05
                }
            }
        ],
        uncommon: [
            {
                id: 'reinforced_hull',
                name: 'Reinforced Hull',
                description: 'Strengthened hull with improved damage absorption.',
                icon: '🛡️',
                stats: {
                    shieldCapacity: 35,
                    damageReduction: 0.08
                }
            }
        ],
        rare: [
            {
                id: 'adaptive_plating',
                name: 'Adaptive Plating',
                description: 'Advanced armor that adapts to different damage types.',
                icon: '🛡️',
                stats: {
                    shieldCapacity: 50,
                    damageReduction: 0.12
                }
            }
        ],
        epic: [
            {
                id: 'quantum_armor',
                name: 'Quantum Armor',
                description: 'Cutting-edge armor utilizing quantum field technology.',
                icon: '🛡️',
                stats: {
                    shieldCapacity: 75,
                    damageReduction: 0.18
                }
            }
        ],
        legendary: [
            {
                id: 'neutronium_shell',
                name: 'Neutronium Shell',
                description: 'Nearly indestructible armor made from neutron star material.',
                icon: '🛡️',
                stats: {
                    shieldCapacity: 100,
                    damageReduction: 0.25
                }
            }
        ]
    },
    
    // Engine
    engine: {
        common: [
            {
                id: 'standard_thruster',
                name: 'Standard Thruster',
                description: 'Basic propulsion system with balanced performance.',
                icon: '🔥',
                stats: {
                    speed: 5,
                    acceleration: 0.5,
                    handling: 0.8
                }
            }
        ],
        uncommon: [
            {
                id: 'ion_drive',
                name: 'Ion Drive',
                description: 'Improved engine with better acceleration.',
                icon: '🔥',
                stats: {
                    speed: 6,
                    acceleration: 0.7,
                    handling: 0.9
                }
            }
        ],
        rare: [
            {
                id: 'fusion_engine',
                name: 'Fusion Engine',
                description: 'Advanced engine with excellent all-around performance.',
                icon: '🔥',
                stats: {
                    speed: 8,
                    acceleration: 0.8,
                    handling: 1.0
                }
            }
        ],
        epic: [
            {
                id: 'antimatter_drive',
                name: 'Antimatter Drive',
                description: 'Cutting-edge propulsion system with superior speed.',
                icon: '🔥',
                stats: {
                    speed: 10,
                    acceleration: 1.0,
                    handling: 1.2
                }
            }
        ],
        legendary: [
            {
                id: 'quantum_drive',
                name: 'Quantum Drive',
                description: 'Revolutionary engine that manipulates spacetime for movement.',
                icon: '🔥',
                stats: {
                    speed: 15,
                    acceleration: 1.5,
                    handling: 1.5
                }
            }
        ]
    },
    
    // Shield
    shield: {
        common: [
            {
                id: 'deflector_shield',
                name: 'Deflector Shield',
                description: 'Basic energy shield that absorbs incoming damage.',
                icon: '🔵',
                stats: {
                    shieldCapacity: 50,
                    shieldRegen: 2,
                    shieldDelay: 3
                }
            }
        ],
        uncommon: [
            {
                id: 'reactive_barrier',
                name: 'Reactive Barrier',
                description: 'Shield that adapts to incoming fire with improved regeneration.',
                icon: '🔵',
                stats: {
                    shieldCapacity: 65,
                    shieldRegen: 3,
                    shieldDelay: 2.5
                }
            }
        ],
        rare: [
            {
                id: 'phase_shield',
                name: 'Phase Shield',
                description: 'Advanced shield that can phase shift to avoid damage.',
                icon: '🔵',
                stats: {
                    shieldCapacity: 85,
                    shieldRegen: 4,
                    shieldDelay: 2
                }
            }
        ],
        epic: [
            {
                id: 'quantum_barrier',
                name: 'Quantum Barrier',
                description: 'Cutting-edge shield utilizing quantum field technology.',
                icon: '🔵',
                stats: {
                    shieldCapacity: 120,
                    shieldRegen: 6,
                    shieldDelay: 1.5
                }
            }
        ],
        legendary: [
            {
                id: 'tesseract_shield',
                name: 'Tesseract Shield',
                description: 'Legendary shield that exists partially in another dimension.',
                icon: '🔵',
                stats: {
                    shieldCapacity: 200,
                    shieldRegen: 10,
                    shieldDelay: 1
                }
            }
        ]
    },
    
    // Special
    special: {
        common: [
            {
                id: 'targeting_system',
                name: 'Targeting System',
                description: 'Basic targeting computer that improves accuracy.',
                icon: '🎯',
                stats: {
                    cooldownReduction: 0.05,
                    effectDuration: 0.1
                }
            }
        ],
        uncommon: [
            {
                id: 'energy_capacitor',
                name: 'Energy Capacitor',
                description: 'Stores additional energy for weapon systems.',
                icon: '🔋',
                stats: {
                    cooldownReduction: 0.08,
                    effectDuration: 0.15
                }
            }
        ],
        rare: [
            {
                id: 'cloaking_device',
                name: 'Cloaking Device',
                description: 'Temporarily renders the ship invisible to enemies.',
                icon: '👻',
                stats: {
                    cooldownReduction: 0.12,
                    effectDuration: 0.2
                }
            }
        ],
        epic: [
            {
                id: 'temporal_displacer',
                name: 'Temporal Displacer',
                description: 'Manipulates time around the ship for tactical advantages.',
                icon: '⏱️',
                stats: {
                    cooldownReduction: 0.18,
                    effectDuration: 0.3
                }
            }
        ],
        legendary: [
            {
                id: 'reality_anchor',
                name: 'Reality Anchor',
                description: 'Legendary device that can briefly alter the laws of physics.',
                icon: '✨',
                stats: {
                    cooldownReduction: 0.25,
                    effectDuration: 0.5
                }
            }
        ]
    },
    
    // Flux Capacitor (Primary)
    fluxPrimary: {
        common: [
            {
                id: 'standard_capacitor',
                name: 'Standard Capacitor',
                description: 'Basic energy regulation system for weapons.',
                icon: '⚡',
                stats: {
                    energyCapacity: 100,
                    energyRegen: 5,
                    weaponEfficiency: 0.1
                }
            }
        ],
        uncommon: [
            {
                id: 'enhanced_capacitor',
                name: 'Enhanced Capacitor',
                description: 'Improved energy system with better regeneration.',
                icon: '⚡',
                stats: {
                    energyCapacity: 125,
                    energyRegen: 7,
                    weaponEfficiency: 0.15
                }
            }
        ],
        rare: [
            {
                id: 'plasma_capacitor',
                name: 'Plasma Capacitor',
                description: 'Advanced energy system using plasma containment.',
                icon: '⚡',
                stats: {
                    energyCapacity: 150,
                    energyRegen: 9,
                    weaponEfficiency: 0.2
                }
            }
        ],
        epic: [
            {
                id: 'quantum_capacitor',
                name: 'Quantum Capacitor',
                description: 'Cutting-edge energy system with quantum storage.',
                icon: '⚡',
                stats: {
                    energyCapacity: 200,
                    energyRegen: 12,
                    weaponEfficiency: 0.3
                }
            }
        ],
        legendary: [
            {
                id: 'zero_point_module',
                name: 'Zero Point Module',
                description: 'Legendary energy source that extracts energy from vacuum.',
                icon: '⚡',
                stats: {
                    energyCapacity: 300,
                    energyRegen: 20,
                    weaponEfficiency: 0.5
                }
            }
        ]
    },
    
    // Flux Capacitor (Secondary)
    fluxSecondary: {
        common: [
            {
                id: 'auxiliary_capacitor',
                name: 'Auxiliary Capacitor',
                description: 'Basic energy system for ship abilities.',
                icon: '🔋',
                stats: {
                    energyCapacity: 50,
                    energyRegen: 8,
                    abilityEfficiency: 0.1
                }
            }
        ],
        uncommon: [
            {
                id: 'enhanced_auxiliary',
                name: 'Enhanced Auxiliary',
                description: 'Improved secondary energy system.',
                icon: '🔋',
                stats: {
                    energyCapacity: 65,
                    energyRegen: 10,
                    abilityEfficiency: 0.15
                }
            }
        ],
        rare: [
            {
                id: 'plasma_auxiliary',
                name: 'Plasma Auxiliary',
                description: 'Advanced secondary energy system.',
                icon: '🔋',
                stats: {
                    energyCapacity: 80,
                    energyRegen: 12,
                    abilityEfficiency: 0.2
                }
            }
        ],
        epic: [
            {
                id: 'quantum_auxiliary',
                name: 'Quantum Auxiliary',
                description: 'Cutting-edge secondary energy system.',
                icon: '🔋',
                stats: {
                    energyCapacity: 100,
                    energyRegen: 15,
                    abilityEfficiency: 0.3
                }
            }
        ],
        legendary: [
            {
                id: 'void_capacitor',
                name: 'Void Capacitor',
                description: 'Legendary secondary energy system that taps into void energy.',
                icon: '🔋',
                stats: {
                    energyCapacity: 150,
                    energyRegen: 25,
                    abilityEfficiency: 0.5
                }
            }
        ]
    },
    
    // Navigation Core
    navigationCore: {
        common: [
            {
                id: 'basic_nav_computer',
                name: 'Basic Nav Computer',
                description: 'Standard navigation system with basic scanning capabilities.',
                icon: '🧭',
                stats: {
                    scanRange: 50,
                    itemDropRate: 0.05,
                    goldDropRate: 0.05
                }
            }
        ],
        uncommon: [
            {
                id: 'enhanced_scanner',
                name: 'Enhanced Scanner',
                description: 'Improved navigation system with better scanning.',
                icon: '🧭',
                stats: {
                    scanRange: 75,
                    itemDropRate: 0.08,
                    goldDropRate: 0.08
                }
            }
        ],
        rare: [
            {
                id: 'quantum_scanner',
                name: 'Quantum Scanner',
                description: 'Advanced navigation system with quantum scanning.',
                icon: '🧭',
                stats: {
                    scanRange: 100,
                    itemDropRate: 0.12,
                    goldDropRate: 0.12
                }
            }
        ],
        epic: [
            {
                id: 'precognition_array',
                name: 'Precognition Array',
                description: 'Cutting-edge system that can predict enemy movements.',
                icon: '🧭',
                stats: {
                    scanRange: 150,
                    itemDropRate: 0.18,
                    goldDropRate: 0.18
                }
            }
        ],
        legendary: [
            {
                id: 'omniscient_core',
                name: 'Omniscient Core',
                description: 'Legendary navigation system with near-perfect awareness.',
                icon: '🧭',
                stats: {
                    scanRange: 250,
                    itemDropRate: 0.25,
                    goldDropRate: 0.25
                }
            }
        ]
    }
};

/**
 * Generate a random item based on depth and rarity chance
 * @param {number} depth - Current game depth
 * @returns {Object} Random item object
 */
function generateRandomItem(depth) {
    // Determine rarity based on depth and random chance
    const rarityRoll = Math.random();
    let selectedRarity = 'common';
    let cumulativeChance = 0;
    
    // Adjust rarity chances based on depth
    const depthMultiplier = Math.min(1 + (depth / 1000), 3);
    
    for (const [rarity, data] of Object.entries(RARITY_TIERS)) {
        // Higher depths increase chances for better rarities
        let adjustedChance = data.chance;
        if (rarity !== 'common') {
            adjustedChance *= depthMultiplier;
        }
        
        cumulativeChance += adjustedChance;
        if (rarityRoll <= cumulativeChance) {
            selectedRarity = rarity;
            break;
        }
    }
    
    // Select random item type
    const itemTypes = Object.keys(ITEM_TYPES);
    const selectedType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    
    // Get templates for this type and rarity
    const templates = ITEM_TEMPLATES[selectedType][selectedRarity];
    if (!templates || templates.length === 0) {
        // Fallback to common if no templates exist for this rarity
        return generateRandomItem(depth);
    }
    
    // Select random template
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Create item from template
    const item = {
        id: `${template.id}_${Date.now()}${Math.floor(Math.random() * 1000)}`, // Unique ID
        name: template.name,
        description: template.description,
        icon: template.icon,
        type: selectedType,
        rarity: selectedRarity,
        stats: { ...template.stats }
    };
    
    // Scale stats based on depth
    const depthScaling = 1 + (depth / 500);
    for (const stat in item.stats) {
        if (typeof item.stats[stat] === 'number') {
            item.stats[stat] *= depthScaling;
            
            // Round to 2 decimal places for cleaner numbers
            item.stats[stat] = Math.round(item.stats[stat] * 100) / 100;
        }
    }
    
    return item;
} 