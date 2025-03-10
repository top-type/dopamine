/**
 * Enemies - Data and spawning patterns for enemy ships
 * Contains enemy type definitions, spawn patterns, and difficulty scaling
 */

// Enemy Types with base stats (before depth scaling)
const ENEMY_TYPES = {
    // Basic enemies
    SCOUT: {
        type: 'scout',
        name: 'Scout',
        description: 'Fast but fragile reconnaissance ship',
        tier: 1,
        radius: 15,
        baseSpeed: 150,
        maxShield: 20,
        damage: 5,
        collisionDamage: 10,
        xpValue: 5,
        goldValue: 3,
        behaviorType: 'strafe',
        fireInterval: 2,
        color: '#00ff00',
        spawnWeight: 30
    },
    
    FIGHTER: {
        type: 'fighter',
        name: 'Fighter',
        description: 'Balanced attack ship with moderate shields',
        tier: 1,
        radius: 20,
        baseSpeed: 120,
        maxShield: 40,
        damage: 10,
        collisionDamage: 15,
        xpValue: 10,
        goldValue: 5,
        behaviorType: 'chase',
        fireInterval: 1.5,
        color: '#ff0000',
        spawnWeight: 25
    },
    
    BOMBER: {
        type: 'bomber',
        name: 'Bomber',
        description: 'Slow but powerful ship with heavy weapons',
        tier: 2,
        radius: 25,
        baseSpeed: 80,
        maxShield: 60,
        damage: 20,
        collisionDamage: 25,
        xpValue: 15,
        goldValue: 8,
        behaviorType: 'shoot',
        fireInterval: 3,
        color: '#ff00ff',
        spawnWeight: 20
    },
    
    // Advanced enemies
    ELITE_FIGHTER: {
        type: 'elite',
        name: 'Elite Fighter',
        description: 'Advanced fighter with enhanced capabilities',
        tier: 3,
        radius: 30,
        baseSpeed: 100,
        maxShield: 100,
        damage: 15,
        collisionDamage: 20,
        xpValue: 25,
        goldValue: 15,
        behaviorType: 'complex',
        fireInterval: 1,
        color: '#ffaa00',
        spawnWeight: 15
    },
    
    STEALTH: {
        type: 'stealth',
        name: 'Stealth Ship',
        description: 'Partially cloaked ship that appears and disappears',
        tier: 3,
        radius: 18,
        baseSpeed: 130,
        maxShield: 50,
        damage: 12,
        collisionDamage: 18,
        xpValue: 20,
        goldValue: 12,
        behaviorType: 'stealth',
        fireInterval: 2,
        color: '#8800ff',
        spawnWeight: 10
    },
    
    DRONE_CARRIER: {
        type: 'carrier',
        name: 'Drone Carrier',
        description: 'Deploys smaller attack drones',
        tier: 4,
        radius: 35,
        baseSpeed: 70,
        maxShield: 120,
        damage: 8,
        collisionDamage: 15,
        xpValue: 30,
        goldValue: 18,
        behaviorType: 'carrier',
        fireInterval: 4,
        color: '#0088ff',
        spawnWeight: 8
    },
    
    // Boss enemies
    DESTROYER: {
        type: 'boss',
        name: 'Destroyer',
        description: 'Heavy battleship with multiple weapon systems',
        tier: 5,
        radius: 50,
        baseSpeed: 70,
        maxShield: 300,
        damage: 25,
        collisionDamage: 40,
        xpValue: 100,
        goldValue: 50,
        behaviorType: 'boss',
        fireInterval: 0.5,
        color: '#ff0000',
        spawnWeight: 0 // Bosses are spawned at specific depths, not randomly
    },
    
    DREADNOUGHT: {
        type: 'megaboss',
        name: 'Dreadnought',
        description: 'Massive capital ship with devastating firepower',
        tier: 6,
        radius: 70,
        baseSpeed: 50,
        maxShield: 500,
        damage: 35,
        collisionDamage: 60,
        xpValue: 200,
        goldValue: 100,
        behaviorType: 'megaboss',
        fireInterval: 0.3,
        color: '#880000',
        spawnWeight: 0 // Bosses are spawned at specific depths, not randomly
    }
};

// Spawn Patterns - Define how enemies spawn based on depth
const SPAWN_PATTERNS = [
    // Early game (0-500 depth)
    {
        depthRange: [0, 500],
        baseSpawnRate: 2, // Enemies per second
        maxActiveEnemies: 10,
        allowedTypes: ['scout', 'fighter'],
        formations: ['random', 'line'],
        bossDepths: [] // No bosses in early game
    },
    
    // Mid game (500-2000 depth)
    {
        depthRange: [500, 2000],
        baseSpawnRate: 3,
        maxActiveEnemies: 15,
        allowedTypes: ['scout', 'fighter', 'bomber', 'elite'],
        formations: ['random', 'line', 'circle'],
        bossDepths: [1000] // Destroyer boss at depth 1000
    },
    
    // Late game (2000-5000 depth)
    {
        depthRange: [2000, 5000],
        baseSpawnRate: 4,
        maxActiveEnemies: 20,
        allowedTypes: ['fighter', 'bomber', 'elite', 'stealth', 'carrier'],
        formations: ['random', 'line', 'circle', 'vformation'],
        bossDepths: [3000] // Destroyer boss at depth 3000
    },
    
    // End game (5000+ depth)
    {
        depthRange: [5000, Infinity],
        baseSpawnRate: 5,
        maxActiveEnemies: 25,
        allowedTypes: ['bomber', 'elite', 'stealth', 'carrier'],
        formations: ['random', 'line', 'circle', 'vformation', 'grid'],
        bossDepths: [5000, 7500, 10000] // Dreadnought bosses at these depths
    }
];

// Special formations for enemy spawning
const FORMATIONS = {
    random: (count, canvasWidth, depth) => {
        const positions = [];
        for (let i = 0; i < count; i++) {
            positions.push({
                x: Math.random() * canvasWidth,
                y: -50 - Math.random() * 200
            });
        }
        return positions;
    },
    
    line: (count, canvasWidth, depth) => {
        const positions = [];
        const spacing = canvasWidth / (count + 1);
        for (let i = 0; i < count; i++) {
            positions.push({
                x: spacing * (i + 1),
                y: -50
            });
        }
        return positions;
    },
    
    circle: (count, canvasWidth, depth) => {
        const positions = [];
        const radius = 150;
        const centerX = canvasWidth / 2;
        const centerY = -150;
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            positions.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });
        }
        return positions;
    },
    
    vformation: (count, canvasWidth, depth) => {
        const positions = [];
        const spacing = 40;
        const centerX = canvasWidth / 2;
        
        for (let i = 0; i < count; i++) {
            // Alternate sides for V formation
            const side = i % 2 === 0 ? 1 : -1;
            const row = Math.floor(i / 2);
            positions.push({
                x: centerX + side * spacing * (row + 1),
                y: -50 - row * spacing
            });
        }
        return positions;
    },
    
    grid: (count, canvasWidth, depth) => {
        const positions = [];
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const spacing = 60;
        const startX = canvasWidth / 2 - (cols - 1) * spacing / 2;
        
        for (let i = 0; i < count; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            positions.push({
                x: startX + col * spacing,
                y: -50 - row * spacing
            });
        }
        return positions;
    }
};

// Special events that can occur during gameplay
const SPECIAL_EVENTS = [
    {
        name: 'Asteroid Field',
        depthRange: [300, Infinity],
        chance: 0.001, // Chance per update to trigger
        duration: 30, // seconds
        effect: (game) => {
            // Spawn asteroids and reduce enemy spawn rate
            console.log('Asteroid field event triggered');
            // Implementation would be in the game's event system
        }
    },
    {
        name: 'Enemy Ambush',
        depthRange: [1000, Infinity],
        chance: 0.0005,
        duration: 15,
        effect: (game) => {
            // Spawn a large number of enemies at once
            console.log('Enemy ambush event triggered');
            // Implementation would be in the game's event system
        }
    },
    {
        name: 'Nebula Cloud',
        depthRange: [2000, Infinity],
        chance: 0.0008,
        duration: 20,
        effect: (game) => {
            // Reduce visibility and enemy detection range
            console.log('Nebula cloud event triggered');
            // Implementation would be in the game's event system
        }
    }
];

// Helper function to get current spawn pattern based on depth
function getSpawnPatternForDepth(depth) {
    for (const pattern of SPAWN_PATTERNS) {
        if (depth >= pattern.depthRange[0] && depth < pattern.depthRange[1]) {
            return pattern;
        }
    }
    // Default to the last pattern if none match
    return SPAWN_PATTERNS[SPAWN_PATTERNS.length - 1];
}

// Helper function to get enemy types available at current depth
function getAvailableEnemyTypes(allowedTypes) {
    return Object.values(ENEMY_TYPES).filter(enemy => 
        allowedTypes.includes(enemy.type) && enemy.spawnWeight > 0
    );
}

// Helper function to select a random enemy type based on spawn weights
function selectRandomEnemyType(availableTypes) {
    const totalWeight = availableTypes.reduce((sum, enemy) => sum + enemy.spawnWeight, 0);
    let random = Math.random() * totalWeight;
    
    for (const enemy of availableTypes) {
        random -= enemy.spawnWeight;
        if (random <= 0) {
            return enemy;
        }
    }
    
    // Fallback to first enemy if something goes wrong
    return availableTypes[0];
}

// Helper function to check if a boss should spawn at current depth
function shouldSpawnBoss(depth, pattern) {
    // Check if current depth is within 5 units of a boss depth
    return pattern.bossDepths.some(bossDepth => 
        Math.abs(depth - bossDepth) < 5
    );
}

// Helper function to get boss type based on depth
function getBossTypeForDepth(depth) {
    if (depth >= 5000) {
        return ENEMY_TYPES.DREADNOUGHT;
    }
    return ENEMY_TYPES.DESTROYER;
}

// Main function to handle enemy spawning logic
function spawnEnemies(game) {
    const depth = game.depth;
    const pattern = getSpawnPatternForDepth(depth);
    
    // Count current active enemies
    const activeEnemies = game.entities.filter(entity => entity.type === 'enemy');
    
    // Check if we should spawn a boss
    if (shouldSpawnBoss(depth, pattern) && !activeEnemies.some(enemy => enemy.enemyType === 'boss' || enemy.enemyType === 'megaboss')) {
        // Spawn boss at center of screen
        const bossType = getBossTypeForDepth(depth);
        const x = game.canvas.width / 2;
        const y = -100;
        
        const boss = new Enemy(game, x, y, bossType.type);
        game.entities.push(boss);
        
        // Create boss entrance effect
        game.particleSystem.createExplosion(x, y, 100, 50, bossType.color);
        
        // Alert player
        game.uiSystem.showAlert(`${bossType.name} Approaching!`, 3);
        
        return; // Don't spawn regular enemies when boss appears
    }
    
    // Regular enemy spawning
    if (activeEnemies.length < pattern.maxActiveEnemies) {
        // Calculate spawn chance based on spawn rate and delta time
        const spawnChance = pattern.baseSpawnRate * game.deltaTime;
        
        if (Math.random() < spawnChance) {
            // Determine number of enemies to spawn (formation)
            const formationSize = Math.floor(Math.random() * 3) + 1; // 1-3 enemies
            const availableSlots = pattern.maxActiveEnemies - activeEnemies.length;
            const enemiesToSpawn = Math.min(formationSize, availableSlots);
            
            if (enemiesToSpawn <= 0) return;
            
            // Select formation type
            const formationType = pattern.formations[Math.floor(Math.random() * pattern.formations.length)];
            
            // Get enemy positions based on formation
            const positions = FORMATIONS[formationType](enemiesToSpawn, game.canvas.width, depth);
            
            // Get available enemy types for this depth
            const availableTypes = getAvailableEnemyTypes(pattern.allowedTypes);
            
            // Spawn enemies
            for (let i = 0; i < enemiesToSpawn; i++) {
                const enemyType = selectRandomEnemyType(availableTypes);
                const enemy = new Enemy(game, positions[i].x, positions[i].y, enemyType.type);
                game.entities.push(enemy);
            }
        }
    }
    
    // Check for special events
    for (const event of SPECIAL_EVENTS) {
        if (depth >= event.depthRange[0] && depth < event.depthRange[1]) {
            if (Math.random() < event.chance * game.deltaTime) {
                event.effect(game);
            }
        }
    }
}

// Export the spawning function and enemy data
Game.prototype.spawnEnemies = function() {
    spawnEnemies(this);
}; 