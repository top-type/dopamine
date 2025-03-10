/**
 * ProgressionSystem - Handles player progression, levels, and difficulty scaling
 */
class ProgressionSystem {
    constructor(game) {
        this.game = game;
        
        // Level progression settings
        this.baseXpToLevel = 100;
        this.xpLevelMultiplier = 1.5;
        
        // Difficulty scaling settings
        this.difficultyScalingFactor = 0.1; // 10% increase per 100 depth
        
        // Enemy spawn settings
        this.baseEnemySpawnRate = 2; // Enemies per second
        this.enemySpawnRateIncrease = 0.05; // Increase per 100 depth
        this.lastEnemySpawnTime = 0;
        
        // Boss spawn settings
        this.bossSpawnDepthInterval = 1000; // Boss every 1000 depth
        this.lastBossSpawnDepth = 0;
        
        console.log('Progression system initialized');
    }
    
    /**
     * Update progression system
     */
    update(deltaTime) {
        // Update enemy spawning
        this.updateEnemySpawning(deltaTime);
        
        // Check for boss spawn
        this.checkBossSpawn();
    }
    
    /**
     * Calculate XP required for a given level
     */
    calculateXpForLevel(level) {
        return Math.floor(this.baseXpToLevel * Math.pow(this.xpLevelMultiplier, level - 1));
    }
    
    /**
     * Calculate current difficulty multiplier based on depth
     */
    calculateDifficultyMultiplier() {
        return 1 + (this.game.depth / 100) * this.difficultyScalingFactor;
    }
    
    /**
     * Update enemy spawning based on depth and time
     */
    updateEnemySpawning(deltaTime) {
        const currentTime = this.game.gameTime;
        
        // Calculate current spawn rate based on depth
        const spawnRate = this.baseEnemySpawnRate + 
            (this.game.depth / 100) * this.enemySpawnRateIncrease;
        
        // Calculate time between spawns
        const spawnInterval = 1 / spawnRate;
        
        // Check if it's time to spawn a new enemy
        if (currentTime - this.lastEnemySpawnTime >= spawnInterval) {
            this.spawnEnemy();
            this.lastEnemySpawnTime = currentTime;
        }
    }
    
    /**
     * Spawn an enemy based on current depth
     */
    spawnEnemy() {
        // Determine enemy type based on depth
        const enemyType = this.determineEnemyType();
        
        // Calculate spawn position (off-screen, top or sides)
        const spawnPosition = this.calculateEnemySpawnPosition();
        
        // Create enemy
        const enemy = new Enemy(
            this.game,
            spawnPosition.x,
            spawnPosition.y,
            enemyType
        );
        
        // Add to game entities
        this.game.entities.push(enemy);
    }
    
    /**
     * Determine enemy type based on current depth
     */
    determineEnemyType() {
        const depth = this.game.depth;
        
        // Random chance for different enemy types
        const random = Math.random();
        
        // Elite enemies start appearing at depth 500
        if (depth >= 500 && random < 0.1) {
            return 'elite';
        }
        
        // Bomber enemies start appearing at depth 300
        if (depth >= 300 && random < 0.3) {
            return 'bomber';
        }
        
        // Fighter enemies start appearing at depth 100
        if (depth >= 100 && random < 0.5) {
            return 'fighter';
        }
        
        // Scout enemies start appearing at depth 50
        if (depth >= 50 && random < 0.7) {
            return 'scout';
        }
        
        // Default to basic enemy
        return 'basic';
    }
    
    /**
     * Calculate enemy spawn position (off-screen)
     */
    calculateEnemySpawnPosition() {
        const canvas = this.game.canvas;
        const margin = 50; // Spawn just off-screen
        
        // Randomly choose spawn edge (top, left, right)
        const edge = Math.floor(Math.random() * 3);
        
        switch (edge) {
            case 0: // Top
                return {
                    x: Math.random() * canvas.width,
                    y: -margin
                };
                
            case 1: // Left
                return {
                    x: -margin,
                    y: Math.random() * canvas.height * 0.7 // Don't spawn too low
                };
                
            case 2: // Right
                return {
                    x: canvas.width + margin,
                    y: Math.random() * canvas.height * 0.7 // Don't spawn too low
                };
        }
    }
    
    /**
     * Check if it's time to spawn a boss
     */
    checkBossSpawn() {
        const depth = this.game.depth;
        const bossDepthThreshold = Math.floor(depth / this.bossSpawnDepthInterval) * this.bossSpawnDepthInterval;
        
        // Check if we've crossed a boss depth threshold
        if (bossDepthThreshold > this.lastBossSpawnDepth) {
            this.spawnBoss();
            this.lastBossSpawnDepth = bossDepthThreshold;
        }
    }
    
    /**
     * Spawn a boss enemy
     */
    spawnBoss() {
        // Calculate spawn position (center top)
        const x = this.game.canvas.width / 2;
        const y = -50; // Off-screen at the top
        
        // Create boss enemy
        const boss = new Enemy(
            this.game,
            x,
            y,
            'boss'
        );
        
        // Add to game entities
        this.game.entities.push(boss);
        
        // Show boss warning
        this.game.uiSystem.showBossWarning();
        
        console.log(`Boss spawned at depth ${this.game.depth}`);
    }
    
    /**
     * Award XP to player
     */
    awardXP(amount) {
        // Apply XP multipliers from equipment and specializations
        // This will be expanded with the equipment and specialization systems
        
        // Add XP to player
        this.game.addXP(amount);
    }
} 