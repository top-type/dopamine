/**
 * Game - Core game engine class
 * Manages the game loop, state, and coordinates all game systems
 */
class Game {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.gameTime = 0;
        this.lastTimestamp = 0;
        this.deltaTime = 0;
        
        // Game systems
        this.input = new InputHandler();
        this.renderer = new Renderer(this.canvas, this.ctx);
        this.collision = new CollisionSystem();
        this.particleSystem = new ParticleSystem();
        this.audioSystem = new AudioSystem();
        this.saveSystem = new SaveSystem();
        
        // Game objects
        this.player = null;
        this.entities = [];
        this.projectiles = [];
        this.effects = [];
        
        // Game data
        this.depth = 0;
        this.gold = 0;
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 100;
        this.skillPoints = 0;
        
        // Game systems
        this.combatSystem = new CombatSystem(this);
        this.progressionSystem = new ProgressionSystem(this);
        this.equipmentSystem = new EquipmentSystem(this);
        this.specializationSystem = new SpecializationSystem(this);
        this.uiSystem = new UISystem(this);
        
        // Specializations
        this.selectedSpecializations = [];
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        console.log('Game engine initialized');
    }
    
    /**
     * Resize the canvas to fill the window
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Update renderer with new dimensions
        if (this.renderer) {
            this.renderer.updateDimensions(this.canvas.width, this.canvas.height);
        }
    }
    
    /**
     * Initialize the specialization selection screen
     */
    initializeSpecializationSelection() {
        this.specializationSystem.initializeSelectionScreen();
    }
    
    /**
     * Start the game
     */
    start() {
        console.log('Starting game...');
        
        // Create player
        this.player = new Player(this);
        
        // Apply selected specializations
        this.specializationSystem.applySelectedSpecializations();
        
        // Initialize UI
        this.uiSystem.initialize();
        
        // Start game loop
        this.isRunning = true;
        this.isPaused = false;
        this.lastTimestamp = performance.now();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        
        console.log('Game started');
    }
    
    /**
     * Pause the game
     */
    pause() {
        this.isPaused = true;
        console.log('Game paused');
    }
    
    /**
     * Resume the game
     */
    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.lastTimestamp = performance.now();
            console.log('Game resumed');
        }
    }
    
    /**
     * End the game
     */
    gameOver() {
        this.isRunning = false;
        
        // Show game over screen with stats
        const statsElement = document.getElementById('game-stats');
        statsElement.innerHTML = `
            <p>Distance Traveled: ${Math.floor(this.depth)} light years</p>
            <p>Level Reached: ${this.level}</p>
            <p>Gold Collected: ${this.gold}</p>
        `;
        
        document.getElementById('game-over-screen').classList.remove('hidden');
        
        console.log('Game over');
    }
    
    /**
     * Main game loop
     */
    gameLoop(timestamp) {
        // Calculate delta time in seconds
        this.deltaTime = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;
        
        // Cap delta time to prevent large jumps
        if (this.deltaTime > 0.1) this.deltaTime = 0.1;
        
        if (this.isRunning && !this.isPaused) {
            // Update game time
            this.gameTime += this.deltaTime;
            
            // Update depth (constant forward progression)
            this.depth += this.deltaTime * 10; // 10 units per second
            
            // Update game systems
            this.update();
            
            // Render the game
            this.render();
        }
        
        // Continue the game loop if the game is still running
        if (this.isRunning) {
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        }
    }
    
    /**
     * Update game state
     */
    update() {
        // Update player
        if (this.player) {
            this.player.update(this.deltaTime);
        }
        
        // Update entities
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            entity.update(this.deltaTime);
            
            // Remove dead entities
            if (entity.shouldRemove) {
                this.entities.splice(i, 1);
            }
        }
        
        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(this.deltaTime);
            
            // Remove projectiles that are out of bounds or have hit something
            if (projectile.shouldRemove) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // Update effects
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.update(this.deltaTime);
            
            // Remove effects that have completed
            if (effect.shouldRemove) {
                this.effects.splice(i, 1);
            }
        }
        
        // Update particles
        this.particleSystem.update(this.deltaTime);
        
        // Check collisions
        this.collision.checkCollisions(this);
        
        // Spawn enemies based on depth
        this.spawnEnemies();
        
        // Update UI
        this.uiSystem.update();
        
        // Clear keys pressed this frame
        this.input.clearKeysPressed();
    }
    
    /**
     * Render the game
     */
    render() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render background
        this.renderer.renderBackground(this.depth);
        
        // Render effects (behind entities)
        for (const effect of this.effects) {
            if (effect.renderBehind) {
                effect.render(this.ctx);
            }
        }
        
        // Render entities
        for (const entity of this.entities) {
            entity.render(this.ctx);
        }
        
        // Render player
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        // Render projectiles
        for (const projectile of this.projectiles) {
            projectile.render(this.ctx);
        }
        
        // Render effects (in front of entities)
        for (const effect of this.effects) {
            if (!effect.renderBehind) {
                effect.render(this.ctx);
            }
        }
        
        // Render particles
        this.particleSystem.render(this.ctx);
        
        // UI is handled by the DOM, no need to render it on canvas
    }
    
    /**
     * Spawn enemies based on depth
     */
    spawnEnemies() {
        // Implementation is in js/data/enemies.js
        // The function is attached to Game.prototype in that file
    }
    
    /**
     * Add experience points to the player
     */
    addXP(amount) {
        this.xp += amount;
        
        // Check for level up
        if (this.xp >= this.xpToNextLevel) {
            this.levelUp();
        }
        
        // Update UI
        this.uiSystem.updateLevelDisplay();
    }
    
    /**
     * Level up the player
     */
    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5); // Increase XP required for next level
        
        // Apply level up bonuses
        if (this.player) {
            this.player.onLevelUp();
        }
        
        // Update skill points
        this.specializationSystem.addSkillPoint();
        
        console.log(`Level up! Now level ${this.level}`);
        
        // Show level up notification
        this.uiSystem.showLevelUpNotification();
    }
    
    /**
     * Add gold to the player
     */
    addGold(amount) {
        this.gold += amount;
        this.uiSystem.updateStatsDisplay();
    }
    
    /**
     * Open the inventory screen
     */
    openInventory() {
        this.pause();
        document.getElementById('menu-screen').classList.remove('hidden');
        document.getElementById('tab-inventory').click();
    }
    
    /**
     * Open the skill tree screen
     */
    openSkillTree() {
        this.pause();
        document.getElementById('menu-screen').classList.remove('hidden');
        document.getElementById('tab-skills').click();
    }
    
    /**
     * Load inventory content
     */
    loadInventory() {
        const inventoryContent = document.getElementById('inventory-content');
        
        // Clear existing content
        inventoryContent.innerHTML = '';
        
        // Create inventory layout
        const inventoryLayout = document.createElement('div');
        inventoryLayout.className = 'inventory-layout';
        inventoryLayout.innerHTML = `
            <div class="inventory-section">
                <h3>Equipment</h3>
                <div id="equipment-slots" class="equipment-grid"></div>
            </div>
            <div class="inventory-section">
                <h3>Inventory <span id="inventory-count">0/20</span></h3>
                <div id="inventory-grid"></div>
            </div>
            <div class="inventory-section">
                <h3>Item Details</h3>
                <div id="item-details" class="hidden">
                    <div id="item-details-content"></div>
                    <div id="item-actions">
                        <button id="equip-item" class="action-button">Equip</button>
                        <button id="drop-item" class="action-button">Drop</button>
                    </div>
                </div>
            </div>
        `;
        
        inventoryContent.appendChild(inventoryLayout);
        
        // Update inventory display
        this.uiSystem.updateInventoryDisplay();
        this.uiSystem.updateEquipmentDisplay();
    }
    
    /**
     * Load skill tree content
     */
    loadSkillTree() {
        const skillsContent = document.getElementById('skills-content');
        
        // Clear existing content
        skillsContent.innerHTML = '';
        
        // Create skill tree layout
        const skillTreeLayout = document.createElement('div');
        skillTreeLayout.className = 'skill-tree-layout';
        skillTreeLayout.innerHTML = `
            <div class="skill-tree-header">
                <h3>Available Skill Points: <span id="available-skill-points">${this.skillPoints}</span></h3>
            </div>
            <div id="skill-trees-container"></div>
        `;
        
        skillsContent.appendChild(skillTreeLayout);
        
        // Render skill trees
        this.specializationSystem.renderSkillTree(document.getElementById('skill-trees-container'));
    }
    
    /**
     * Load shop content
     */
    loadShop() {
        const shopContent = document.getElementById('shop-content');
        
        // Clear existing content
        shopContent.innerHTML = '';
        
        // Create shop layout
        const shopLayout = document.createElement('div');
        shopLayout.className = 'shop-layout';
        shopLayout.innerHTML = `
            <div class="shop-header">
                <h3>Shop</h3>
                <div class="player-gold">
                    <span class="gold-icon">💰</span>
                    <span id="shop-gold-amount">${this.gold}</span> Gold
                </div>
            </div>
            <div class="shop-items">
                <p>No items available for purchase at this time.</p>
                <p>Check back after defeating more enemies!</p>
            </div>
        `;
        
        shopContent.appendChild(shopLayout);
    }
} 