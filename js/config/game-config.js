/**
 * Game Configuration
 * Centralized configuration for game settings
 */

export const GameConfig = {
    // Canvas settings
    canvas: {
        width: window.innerWidth,
        height: window.innerHeight
    },
    
    // Player settings
    player: {
        radius: 25,
        baseSpeed: 300,
        maxShield: 100,
        shieldRegenRate: 5,
        shieldRegenDelay: 3,
        invulnerabilityDuration: 1,
        collisionDamage: 5,
        primaryWeapon: {
            damage: 25,
            fireRate: 5,
            projectileSpeed: 500
        },
        maxInventorySize: 20
    },
    
    // Enemy settings
    enemy: {
        spawnRate: {
            base: 1.5,
            decreasePerLevel: 0.1,
            minimum: 0.5
        },
        baseHealth: 50,
        healthIncreasePerLevel: 10,
        baseDamage: 15,
        damageIncreasePerLevel: 5
    },
    
    // Progression settings
    progression: {
        baseXpToNextLevel: 100,
        xpIncreasePerLevel: 50,
        skillPointsPerLevel: 1
    },
    
    // Item settings
    items: {
        dropRate: 0.2,
        goldDropBase: 10,
        goldDropVariance: 5
    },
    
    // UI settings
    ui: {
        hudOpacity: 0.8,
        animationSpeed: 0.3
    }
}; 