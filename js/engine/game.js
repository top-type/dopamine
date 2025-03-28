/**
 * Game - Main game engine
 * Manages the game loop, entities, and game state
 */

// Import dependencies
import { InputHandler } from './input.js';
import { Renderer } from './renderer.js';
import { CollisionSystem } from './collision.js';
import { ParticleSystem } from './particle.js';
import { AudioSystem } from './audio.js';
import { SaveSystem } from './save.js';
import { StateManager, GameState } from './state-manager.js';

import { Player } from '../objects/player.js';

import { CombatSystem } from '../systems/combat.js';
import { ProgressionSystem } from '../systems/progression.js';
import { EquipmentSystem } from '../systems/equipment.js';
import { SpecializationSystem } from '../systems/specialization.js';
import { UISystem } from '../systems/ui.js';

// Import configuration
import { GameConfig } from '../config/game-config.js';

// Import skill configuration
import { SKILL_CONFIG, SKILL_EFFECTS } from '../data/skills.js';

// Import enemy spawning function
import { spawnEnemies } from '../data/enemies.js';

/**
 * Game - Core game engine class
 * Manages the game loop, state, and coordinates all game systems
 */
export class Game {
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
        this.stateManager = new StateManager(this);
        
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
        this.xpToNextLevel = GameConfig.progression.baseXpToNextLevel;
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
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('Game engine initialized');
    }
    
    /**
     * Set up event listeners for game controls
     */
    setupEventListeners() {
        // Start button
        document.getElementById('start-button').addEventListener('click', () => {
            this.start();
        });
        
        // Restart button
        document.getElementById('restart-button').addEventListener('click', () => {
            this.restart();
        });
        
        // Resume button
        document.getElementById('resume-button').addEventListener('click', () => {
            this.resume();
        });
        
        // Tab switching functionality
        const menuTabs = document.querySelectorAll('.menu-tab');
        menuTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and content
                menuTabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                const contentId = tab.id.replace('tab-', '') + '-content';
                const contentElement = document.getElementById(contentId);
                if (contentElement) {
                    contentElement.classList.add('active');
                }
                
                // Load content based on tab
                if (tab.id === 'tab-inventory') {
                    this.loadInventory();
                } else if (tab.id === 'tab-skills') {
                    this.loadSkillTree();
                } else if (tab.id === 'tab-shop') {
                    this.loadShop();
                }
            });
        });
        
        // Note: ESC key is now handled by the InputHandler
    }
    
    /**
     * Resize the canvas to fit the window
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Update config
        GameConfig.canvas.width = this.canvas.width;
        GameConfig.canvas.height = this.canvas.height;
        
        // Update renderer if it exists
        if (this.renderer) {
            this.renderer.updateDimensions(this.canvas.width, this.canvas.height);
        }
    }
    
    /**
     * Start the game
     */
    start() {
        console.log('Game starting...');
        
        // Initialize player
        this.player = new Player(this);
        
        // Initialize with empty specializations
        this.selectedSpecializations = [];
        
        // Initialize UI
        this.uiSystem.initialize();
        
        // Ensure menu screen is hidden
        const menuScreen = document.getElementById('menu-screen');
        if (menuScreen) {
            menuScreen.classList.add('hidden');
        }
        
        // Change state to playing
        this.stateManager.changeState(GameState.PLAYING);
        
        // Start the game loop
        this.lastTimestamp = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    /**
     * Pause the game
     */
    pause() {
        this.isPaused = true;
        this.stateManager.changeState(GameState.MENU);
    }
    
    /**
     * Resume the game
     */
    resume() {
        this.isPaused = false;
        this.stateManager.changeState(GameState.PLAYING);
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
        // Call the imported spawnEnemies function
        spawnEnemies(this);
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
        console.log(`Level up! Now level ${this.level}`);
        
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5); // Increase XP required for next level
        
        // Apply level up bonuses
        if (this.player) {
            console.log('Applying level up bonuses to player');
            this.player.onLevelUp();
        }
        
        // Update skill points
        console.log('Adding skill point');
        this.specializationSystem.addSkillPoint();
        
        // Show level up notification
        console.log('Showing level up notification');
        this.uiSystem.showLevelUpNotification();
        
        // Check if a specialization can be unlocked at this level
        console.log('Checking for specialization unlock');
        if (this.specializationSystem.checkSpecializationUnlock()) {
            // Show a notification that a specialization is available
            console.log('Specialization available, showing notification');
            this.uiSystem.showAlert('New specialization available! Check the Skills tab.', 5, true);
        }
        
        // Check if any skills are now available due to level requirements
        if (this.selectedSpecializations && this.selectedSpecializations.length > 0) {
            let newSkillsAvailable = false;
            
            this.selectedSpecializations.forEach(specId => {
                const spec = this.specializationSystem.getSpecializationById(specId);
                if (spec) {
                    spec.skills.forEach(skill => {
                        if (skill.requiredLevel === this.level && skill.level === 0) {
                            newSkillsAvailable = true;
                        }
                    });
                }
            });
            
            if (newSkillsAvailable) {
                this.uiSystem.showAlert('New skills available in the Skills tab!', 3, true);
            }
        }
    }
    
    /**
     * Add gold to the player
     */
    addGold(amount) {
        this.gold += amount;
        this.uiSystem.updateStatsDisplay();
    }
    
    /**
     * Open the inventory screen through the menu
     */
    openInventory() {
        console.log('Game openInventory called - opening inventory through menu system');
        this.pause();
        
        // Try to save the game before opening the menu
        try {
            console.log('Saving game before opening inventory...');
            this.saveSystem.saveGame(this);
            console.log('Game saved successfully');
        } catch (error) {
            console.error('Error saving game before opening inventory:', error);
            // Continue opening the inventory even if saving fails
        }
        
        // Show the menu screen
        const menuScreen = document.getElementById('menu-screen');
        if (menuScreen) {
            menuScreen.classList.remove('hidden');
            
            // Click the inventory tab
            const inventoryTab = document.getElementById('tab-inventory');
            if (inventoryTab) {
                inventoryTab.click();
            } else {
                console.error('Inventory tab not found in DOM');
            }
        } else {
            console.error('Menu screen not found in DOM');
        }
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
        console.log('=== LOAD INVENTORY DEBUGGING ===');
        console.log('loadInventory called');
        
        const inventoryContent = document.getElementById('inventory-content');
        
        if (!inventoryContent) {
            console.error('Inventory content element not found in DOM');
            console.log('=== END LOAD INVENTORY DEBUGGING ===');
            return;
        }
        
        if (!this.player) {
            console.error('Player does not exist in loadInventory');
            console.log('=== END LOAD INVENTORY DEBUGGING ===');
            return;
        }
        
        if (!this.player.inventory) {
            console.log('Player inventory does not exist, initializing empty array');
            this.player.inventory = [];
        }
        
        console.log('Player inventory before loading (length):', this.player.inventory.length);
        console.log('Player inventory contents:', JSON.stringify(this.player.inventory));
        
        // Clear existing content
        console.log('Clearing existing inventory content');
        inventoryContent.innerHTML = '';
        
        // Create inventory layout
        console.log('Creating inventory layout');
        const inventoryLayout = document.createElement('div');
        inventoryLayout.className = 'inventory-layout';
        inventoryLayout.innerHTML = `
            <div class="inventory-section">
                <h3>Equipment</h3>
                <div id="equipment-slots-menu" class="equipment-grid"></div>
            </div>
            <div class="inventory-section">
                <h3>Inventory <span id="inventory-count-menu">0/20</span></h3>
                <div id="inventory-grid-menu"></div>
            </div>
            <div class="inventory-section">
                <h3>Item Details</h3>
                <div id="item-details-menu" class="hidden">
                    <div id="item-details-content-menu"></div>
                    <div id="item-actions-menu">
                        <button id="equip-item-menu" class="action-button">Equip</button>
                        <button id="drop-item-menu" class="action-button">Drop</button>
                    </div>
                </div>
            </div>
        `;
        
        inventoryContent.appendChild(inventoryLayout);
        
        // Verify that the inventory grid was created
        const inventoryGrid = document.getElementById('inventory-grid-menu');
        if (!inventoryGrid) {
            console.error('Inventory grid element not found after creating layout');
            console.log('=== END LOAD INVENTORY DEBUGGING ===');
            return;
        }
        
        console.log('Inventory grid created successfully');
        
        // Update inventory count
        const inventoryCount = document.getElementById('inventory-count-menu');
        if (inventoryCount) {
            inventoryCount.textContent = `${this.player.inventory.length}/${this.player.maxInventorySize || 20}`;
        }
        
        // Manually populate the inventory grid
        if (this.player.inventory && this.player.inventory.length > 0) {
            console.log('Populating inventory grid with items...');
            this.player.inventory.forEach((item, index) => {
                console.log('Adding item to menu inventory grid:', item.name, 'at index:', index);
                
                const itemElement = document.createElement('div');
                itemElement.className = 'inventory-item';
                itemElement.dataset.itemId = item.id;
                itemElement.dataset.index = index;
                
                // Set rarity class
                itemElement.classList.add(`rarity-${item.rarity}`);
                
                // Make sure item has an icon
                const icon = item.icon || '📦';
                
                itemElement.innerHTML = `
                    <div class="item-icon">${icon}</div>
                    <div class="item-name">${item.name}</div>
                `;
                
                // Add click event
                itemElement.addEventListener('click', () => {
                    this.showItemDetailsInMenu(item, null, index);
                });
                
                inventoryGrid.appendChild(itemElement);
            });
            console.log('Finished populating inventory grid');
        } else {
            console.log('No items in inventory, showing empty message');
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-inventory-message';
            emptyMessage.textContent = 'Your inventory is empty';
            inventoryGrid.appendChild(emptyMessage);
        }
        
        // Update equipment slots
        this.updateEquipmentSlotsInMenu();
        
        console.log('Inventory loaded and updated');
        console.log('=== END LOAD INVENTORY DEBUGGING ===');
    }
    
    /**
     * Show item details in the menu
     */
    showItemDetailsInMenu(item, equipSlot = null, index = null) {
        const itemDetails = document.getElementById('item-details-menu');
        const itemDetailsContent = document.getElementById('item-details-content-menu');
        const equipButton = document.getElementById('equip-item-menu');
        const dropButton = document.getElementById('drop-item-menu');
        
        if (!itemDetails || !itemDetailsContent || !equipButton || !dropButton) {
            console.error('Item details elements not found in menu');
            return;
        }
        
        // Show the item details panel
        itemDetails.classList.remove('hidden');
        
        // Generate stats HTML
        let statsHtml = '';
        if (item.stats) {
            for (const [stat, value] of Object.entries(item.stats)) {
                const formattedStat = this.equipmentSystem.formatStatName(stat);
                statsHtml += `<div class="stat-row">
                    <span class="stat-name">${formattedStat}</span>
                    <span class="stat-value">${value > 0 ? '+' : ''}${value}</span>
                </div>`;
            }
        }
        
        // Set item details content
        itemDetailsContent.innerHTML = `
            <div class="item-header rarity-${item.rarity}">
                <div class="item-icon">${item.icon || '📦'}</div>
                <div class="item-title">
                    <div class="item-name">${item.name}</div>
                    <div class="item-type">${item.type || item.slot} - ${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}</div>
                </div>
            </div>
            <div class="item-description">${item.description || 'No description available.'}</div>
            <div class="item-stats">
                ${statsHtml}
            </div>
        `;
        
        // Update button states
        if (equipSlot) {
            // Item is equipped
            equipButton.textContent = 'Unequip';
            equipButton.onclick = () => {
                this.equipmentSystem.unequipItem(equipSlot);
                this.loadInventory(); // Reload the inventory display
                itemDetails.classList.add('hidden');
            };
        } else if (index !== null) {
            // Item is in inventory
            equipButton.textContent = 'Equip';
            equipButton.onclick = () => {
                this.equipmentSystem.equipItem(index);
                this.loadInventory(); // Reload the inventory display
                itemDetails.classList.add('hidden');
            };
            
            dropButton.onclick = () => {
                this.equipmentSystem.removeFromInventory(index);
                this.loadInventory(); // Reload the inventory display
                itemDetails.classList.add('hidden');
            };
        } else {
            // Item is not in inventory or equipped (e.g., in a shop)
            equipButton.textContent = 'Buy';
            equipButton.style.display = 'none'; // Hide for now
            dropButton.textContent = 'Close';
            dropButton.onclick = () => {
                itemDetails.classList.add('hidden');
            };
        }
    }
    
    /**
     * Update equipment slots in the menu
     */
    updateEquipmentSlotsInMenu() {
        const equipmentSlots = document.getElementById('equipment-slots-menu');
        if (!equipmentSlots) {
            console.error('Equipment slots element not found in menu');
            return;
        }
        
        // Clear existing slots
        equipmentSlots.innerHTML = '';
        
        // Create slots for each equipment type
        const slotTypes = [
            { id: 'primaryWeapon', name: 'Primary Weapon' },
            { id: 'armor', name: 'Armor' },
            { id: 'engine', name: 'Engine' },
            { id: 'shield', name: 'Shield' },
            { id: 'special', name: 'Special' },
            { id: 'fluxCapacitorPrimary', name: 'Flux Capacitor (Primary)' },
            { id: 'fluxCapacitorSecondary', name: 'Flux Capacitor (Secondary)' },
            { id: 'navigationCore', name: 'Navigation Core' }
        ];
        
        slotTypes.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = 'equipment-slot';
            slotElement.dataset.slot = slot.id;
            
            const slotContent = document.createElement('div');
            slotContent.className = 'slot-content';
            
            // Check if there's an item equipped in this slot
            const equippedItem = this.player.equipment[slot.id];
            
            if (equippedItem) {
                slotContent.classList.remove('empty');
                slotContent.innerHTML = `
                    <div class="item-icon rarity-${equippedItem.rarity}">${equippedItem.icon || '📦'}</div>
                    <div class="item-name">${equippedItem.name}</div>
                `;
                
                // Add click event to show item details
                slotContent.addEventListener('click', () => {
                    this.showItemDetailsInMenu(equippedItem, slot.id);
                });
            } else {
                slotContent.classList.add('empty');
                slotContent.textContent = 'Empty';
            }
            
            slotElement.innerHTML = `<div class="slot-label">${slot.name}</div>`;
            slotElement.appendChild(slotContent);
            
            equipmentSlots.appendChild(slotElement);
        });
    }
    
    /**
     * Load the skill tree tab content
     */
    loadSkillTree() {
        // Get the skills-content container
        const container = document.getElementById('skills-content');
        if (!container) {
            console.error('Skills content container not found');
            return;
        }
        
        // Clear the container
        container.innerHTML = '';
        
        // Check if there's a pending specialization unlock
        if (this.specializationSystem && this.specializationSystem.pendingSpecializationUnlock) {
            this.specializationSystem.showSpecializationSelection();
            return;
        }
        
        // Initialize skill points if not already done
        if (typeof this.skillPoints === 'undefined') {
            this.skillPoints = 0;
        }
        
        // Create the skill tree layout
        const skillTreeLayout = document.createElement('div');
        skillTreeLayout.className = 'skill-tree-layout';
        
        // Create the header
        const header = document.createElement('div');
        header.className = 'skill-tree-header';
        header.innerHTML = `
            <h3>Skill Trees</h3>
            <div id="skill-points-header">
                <p>Available Skill Points: <span id="skill-points">${this.skillPoints}</span></p>
            </div>
        `;
        skillTreeLayout.appendChild(header);
        
        // Create the skill trees container
        const skillTreesContainer = document.createElement('div');
        skillTreesContainer.id = 'skill-trees-container';
        skillTreeLayout.appendChild(skillTreesContainer);
        
        // Add the layout to the container
        container.appendChild(skillTreeLayout);
        
        // Create a hint box for skills if not unlocked yet
        if (!this.selectedSpecializations || this.selectedSpecializations.length === 0) {
            const hintBox = document.createElement('div');
            hintBox.className = 'skill-hint-box';
            hintBox.innerHTML = `
                <p>Specializations unlock at player level ${this.specializationSystem.specializationUnlockLevels[0]}.</p>
                <p>Each specialization grants unique passive and active abilities.</p>
                <p>Earn skill points as you level up to unlock and improve skills.</p>
            `;
            skillTreeLayout.appendChild(hintBox);
        }
        
        // Render skill trees
        if (this.specializationSystem) {
            this.specializationSystem.renderSkillTree(skillTreesContainer);
        } else {
            console.error('Specialization system not initialized');
            
            // Show an error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'empty-skill-tree-message';
            errorMessage.innerHTML = '<h3>Error: Specialization system not initialized</h3>';
            skillTreesContainer.appendChild(errorMessage);
        }
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
    
    /**
     * Restart the game by resetting all game state
     */
    restart() {
        console.log('Restarting game...');
        
        // Reset game state
        this.isRunning = false;
        this.isPaused = false;
        this.gameTime = 0;
        this.lastTimestamp = 0;
        this.deltaTime = 0;
        
        // Reset game objects
        this.player = null;
        this.entities = [];
        this.projectiles = [];
        this.effects = [];
        
        // Reset game data
        this.depth = 0;
        this.gold = 0;
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = GameConfig.progression.baseXpToNextLevel;
        this.skillPoints = 0;
        
        // Reset systems
        this.specializationSystem.reset();
        this.uiSystem.reset();
        
        if (this.particleSystem) {
            this.particleSystem.reset();
        }
        
        if (this.combatSystem) {
            this.combatSystem.reset();
        }
        
        if (this.progressionSystem) {
            this.progressionSystem.reset();
        }
        
        if (this.equipmentSystem) {
            this.equipmentSystem.reset();
        }
        
        // Reset specializations array
        this.selectedSpecializations = [];
        
        // Hide game over screen
        document.getElementById('game-over-screen').classList.add('hidden');
        
        // Show start screen
        document.getElementById('start-screen').classList.remove('hidden');
        
        console.log('Game restarted');
    }
    
    // Add a new method to toggle the menu
    toggleMenu() {
        const menuScreen = document.getElementById('menu-screen');
        if (!menuScreen) return;
        
        // Toggle the hidden class
        if (menuScreen.classList.contains('hidden')) {
            // Show menu
            menuScreen.classList.remove('hidden');
            this.isPaused = true;
            
            // Activate inventory tab
            const inventoryTab = document.getElementById('tab-inventory');
            if (inventoryTab) {
                inventoryTab.click();
            }
        } else {
            // Hide menu
            menuScreen.classList.add('hidden');
            this.isPaused = false;
        }
    }
} 