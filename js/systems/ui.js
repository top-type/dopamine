/**
 * UISystem - Manages all game UI elements and interactions
 * Handles HUD, menus, inventory, and other UI components
 */
export class UISystem {
    constructor(game) {
        this.game = game;
        this.uiOverlay = document.getElementById('ui-overlay');
        this.isInventoryOpen = false;
        this.isSkillTreeOpen = false;
    }
    
    /**
     * Initialize the UI system
     */
    initialize() {
        this.uiOverlay.innerHTML = '';
        this.uiOverlay.classList.remove('hidden');
        
        // Create HUD elements
        this.createHUD();
        
        // Create inventory panel (hidden initially)
        this.createInventoryPanel();
        
        // Create skill tree panel (hidden initially)
        this.createSkillTreePanel();
    }
    
    /**
     * Create the HUD elements
     */
    createHUD() {
        const hud = document.createElement('div');
        hud.id = 'hud';
        
        hud.innerHTML = `
            <div id="top-hud">
                <div id="player-info">
                    <div id="level-badge">
                        <span id="level-value">1</span>
                    </div>
                    <div id="player-bars">
                        <div id="shield-container">
                            <div class="bar-label">
                                <span class="icon">🛡️</span>
                                <span>Shield</span>
                                <span id="shield-value">100/100</span>
                            </div>
                            <div class="progress-bar">
                                <div id="shield-fill" class="fill-bar shield-fill"></div>
                            </div>
                        </div>
                        <div id="xp-container">
                            <div class="bar-label">
                                <span class="icon">✨</span>
                                <span>XP</span>
                                <span id="xp-value">0/100</span>
                            </div>
                            <div class="progress-bar">
                                <div id="xp-fill" class="fill-bar xp-fill"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="game-stats">
                    <div class="stat-item" id="depth-display">
                        <div class="stat-icon">🚀</div>
                        <div class="stat-info">
                            <div class="stat-label">Distance</div>
                            <div class="stat-value"><span id="depth-value">0</span> ly</div>
                        </div>
                    </div>
                    <div class="stat-item" id="gold-display">
                        <div class="stat-icon">💰</div>
                        <div class="stat-info">
                            <div class="stat-label">Gold</div>
                            <div class="stat-value"><span id="gold-value">0</span></div>
                        </div>
                    </div>
                    <div class="stat-item" id="skill-points-display">
                        <div class="stat-icon">🌟</div>
                        <div class="stat-info">
                            <div class="stat-label">Skill Points</div>
                            <div class="stat-value"><span id="skill-points">0</span></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="bottom-hud">
                <div id="weapon-info">
                    <div class="weapon-slot primary">
                        <div class="weapon-icon">🔫</div>
                        <div class="weapon-label">Primary [SPACE]</div>
                    </div>
                </div>
                
                <div id="skill-container"></div>
                
                <div id="menu-hint">
                    <div class="key-badge">ESC</div>
                    <div class="hint-text">Menu</div>
                </div>
            </div>
        `;
        
        this.uiOverlay.appendChild(hud);
        
        // Initialize skill icons
        this.updateSkillIcons();
    }
    
    /**
     * Create the inventory panel
     */
    createInventoryPanel() {
        const inventoryPanel = document.createElement('div');
        inventoryPanel.id = 'inventory-panel';
        inventoryPanel.className = 'game-panel hidden';
        
        inventoryPanel.innerHTML = `
            <div class="panel-header">
                <h2>Inventory & Equipment</h2>
                <button id="close-inventory" class="close-button">×</button>
            </div>
            
            <div class="panel-content">
                <div id="equipment-slots">
                    <h3>Equipment</h3>
                    <div class="equipment-grid">
                        <div class="equipment-slot" data-slot="primaryWeapon">
                            <div class="slot-label">Primary Weapon</div>
                            <div class="slot-content empty"></div>
                        </div>
                        <div class="equipment-slot" data-slot="armor">
                            <div class="slot-label">Armor</div>
                            <div class="slot-content empty"></div>
                        </div>
                        <div class="equipment-slot" data-slot="engine">
                            <div class="slot-label">Engine</div>
                            <div class="slot-content empty"></div>
                        </div>
                        <div class="equipment-slot" data-slot="shield">
                            <div class="slot-label">Shield</div>
                            <div class="slot-content empty"></div>
                        </div>
                        <div class="equipment-slot" data-slot="special">
                            <div class="slot-label">Special</div>
                            <div class="slot-content empty"></div>
                        </div>
                        <div class="equipment-slot" data-slot="fluxPrimary">
                            <div class="slot-label">Flux Capacitor (Primary)</div>
                            <div class="slot-content empty"></div>
                        </div>
                        <div class="equipment-slot" data-slot="fluxSecondary">
                            <div class="slot-label">Flux Capacitor (Secondary)</div>
                            <div class="slot-content empty"></div>
                        </div>
                        <div class="equipment-slot" data-slot="navigationCore">
                            <div class="slot-label">Navigation Core</div>
                            <div class="slot-content empty"></div>
                        </div>
                    </div>
                </div>
                
                <div id="inventory-container">
                    <h3>Inventory <span id="inventory-count">0/20</span></h3>
                    <div id="inventory-grid"></div>
                </div>
                
                <div id="item-details" class="hidden">
                    <h3>Item Details</h3>
                    <div id="item-details-content"></div>
                    <div id="item-actions">
                        <button id="equip-item" class="action-button">Equip</button>
                        <button id="drop-item" class="action-button">Drop</button>
                    </div>
                </div>
            </div>
        `;
        
        this.uiOverlay.appendChild(inventoryPanel);
        
        // Add event listeners
        document.getElementById('close-inventory').addEventListener('click', () => {
            this.closeInventory();
        });
    }
    
    /**
     * Create the skill tree panel
     */
    createSkillTreePanel() {
        const skillTreePanel = document.createElement('div');
        skillTreePanel.id = 'skill-tree-panel';
        skillTreePanel.className = 'game-panel hidden';
        
        skillTreePanel.innerHTML = `
            <div class="panel-header">
                <h2>Skill Trees</h2>
                <button id="close-skill-tree" class="close-button">×</button>
            </div>
            
            <div class="panel-content">
                <div id="skill-points-header">
                    <h3>Available Skill Points: <span id="available-skill-points">0</span></h3>
                </div>
                
                <div id="skill-trees-container"></div>
            </div>
        `;
        
        this.uiOverlay.appendChild(skillTreePanel);
        
        // Add event listeners
        document.getElementById('close-skill-tree').addEventListener('click', () => {
            this.closeSkillTree();
        });
    }
    
    /**
     * Update the shield display
     */
    updateShieldDisplay() {
        const shieldFill = document.getElementById('shield-fill');
        const shieldValue = document.getElementById('shield-value');
        
        // Check if elements exist before updating
        if (!shieldFill || !shieldValue || !this.game.player) return;
        
        const shieldPercent = (this.game.player.shield / this.game.player.maxShield) * 100;
        shieldFill.style.width = `${shieldPercent}%`;
        
        shieldValue.textContent = `${Math.floor(this.game.player.shield)}/${this.game.player.maxShield}`;
        
        // Change color based on shield level
        if (shieldPercent < 25) {
            shieldFill.style.background = 'linear-gradient(90deg, #ff3333, #ff6666)';
            shieldFill.style.boxShadow = '0 0 8px rgba(255, 51, 51, 0.7)';
        } else if (shieldPercent < 50) {
            shieldFill.style.background = 'linear-gradient(90deg, #ffaa33, #ffcc33)';
            shieldFill.style.boxShadow = '0 0 8px rgba(255, 170, 51, 0.7)';
        } else {
            shieldFill.style.background = 'linear-gradient(90deg, #33aaff, #66ccff)';
            shieldFill.style.boxShadow = '0 0 8px rgba(51, 170, 255, 0.7)';
        }
    }
    
    /**
     * Update the level display
     */
    updateLevelDisplay() {
        const levelValue = document.getElementById('level-value');
        const xpFill = document.getElementById('xp-fill');
        const xpValue = document.getElementById('xp-value');
        
        // Check if elements exist before updating
        if (!levelValue || !xpFill || !xpValue || !this.game.player) return;
        
        levelValue.textContent = this.game.level;
        
        const xpPercent = (this.game.xp / this.game.xpToNextLevel) * 100;
        xpFill.style.width = `${xpPercent}%`;
        
        xpValue.textContent = `${this.game.xp}/${this.game.xpToNextLevel}`;
    }
    
    /**
     * Update the stats display
     */
    updateStatsDisplay() {
        const statsContainer = document.getElementById('stats-container');
        
        // Check if elements exist before updating
        if (!statsContainer || !this.game.player) return;
        
        // Only update if the stats container is visible
        if (statsContainer.offsetParent === null) return;
        
        // Update stats here
        // This is a placeholder for actual stats display
    }
    
    /**
     * Show an alert message to the player
     * @param {string} message - The message to display
     * @param {number} duration - How long to show the message in seconds
     * @param {boolean} isHTML - Whether the message contains HTML
     */
    showAlert(message, duration = 2, isHTML = false) {
        // Check if an alert container already exists
        let alertContainer = document.getElementById('alert-container');
        
        // Create alert container if it doesn't exist
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'alert-container';
            this.uiOverlay.appendChild(alertContainer);
        }
        
        // Create the alert element
        const alert = document.createElement('div');
        alert.className = 'game-alert';
        
        // Set content as text or HTML
        if (isHTML) {
            alert.innerHTML = message;
        } else {
            alert.textContent = message;
        }
        
        // Check if this is a boss alert
        if (message.includes('Destroyer') || message.includes('Dreadnought')) {
            alert.classList.add('boss-alert');
            // Play boss warning sound if available
            if (this.game.audioSystem && this.game.audioSystem.playSound) {
                this.game.audioSystem.playSound('boss_warning');
            }
        }
        
        // Add to container
        alertContainer.appendChild(alert);
        
        // Animate in
        setTimeout(() => {
            alert.classList.add('visible');
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            alert.classList.remove('visible');
            
            // Remove from DOM after fade out animation
            setTimeout(() => {
                alertContainer.removeChild(alert);
            }, 500);
        }, duration * 1000);
    }
    
    /**
     * Show item notification when player collects an item
     * @param {Object} itemData - The item data
     */
    showItemNotification(itemData) {
        // Get rarity color
        const rarityColors = {
            common: '#aaaaaa',
            uncommon: '#55aa55',
            rare: '#5555ff',
            epic: '#aa55aa',
            legendary: '#ffaa00'
        };
        
        const color = rarityColors[itemData.rarity] || '#ffffff';
        
        // Create message with colored item name
        const message = `Collected: <span style="color: ${color}">${itemData.name}</span>`;
        
        // Show alert with HTML content
        this.showAlert(message, 3, true);
    }
    
    /**
     * Update the skill icons in the HUD
     */
    updateSkillIcons() {
        const skillContainer = document.getElementById('skill-container');
        skillContainer.innerHTML = '';
        
        if (!this.game.player) return;
        
        // Check if player has special abilities
        if (!this.game.player.specialAbilities) {
            console.log('Player has no special abilities yet');
            return;
        }
        
        this.game.player.specialAbilities.forEach((ability, index) => {
            const skillIcon = document.createElement('div');
            skillIcon.className = 'skill-icon';
            skillIcon.dataset.skillId = ability.id;
            skillIcon.dataset.index = index;
            
            // Create skill icon content
            let iconContent = '';
            
            // Set icon content
            if (ability.icon) {
                iconContent = `<span class="skill-icon-emoji">${ability.icon}</span>`;
            } else {
                iconContent = `<span class="skill-icon-emoji">✨</span>`;
            }
            
            // Add skill name
            iconContent += `<span class="skill-icon-text">${ability.name}</span>`;
            
            skillIcon.innerHTML = iconContent;
            
            // Set tooltip
            skillIcon.title = `${ability.name} (${ability.cooldown}s cooldown): ${ability.description}`;
            
            // Set color based on specialization if available
            if (ability.specialization) {
                const spec = this.game.specializationSystem.getSpecializationById(ability.specialization);
                if (spec) {
                    skillIcon.style.borderColor = spec.color;
                }
            }
            
            // Add cooldown overlay
            const cooldownOverlay = document.createElement('div');
            cooldownOverlay.className = 'cooldown-overlay';
            cooldownOverlay.style.display = 'none';
            skillIcon.appendChild(cooldownOverlay);
            
            // Add click handler
            skillIcon.addEventListener('click', () => {
                this.game.player.useSpecialAbility(index);
            });
            
            // Add to container
            skillContainer.appendChild(skillIcon);
            
            // Add key binding indicator
            const keyIndicator = document.createElement('div');
            keyIndicator.className = 'key-indicator';
            keyIndicator.textContent = index + 1;
            skillIcon.appendChild(keyIndicator);
        });
    }
    
    /**
     * Update the cooldown display for a skill
     * @param {string} skillId - The ID of the skill
     * @param {number} remainingCooldown - The remaining cooldown time in seconds
     * @param {number} totalCooldown - The total cooldown time in seconds
     */
    updateSkillCooldown(skillId, remainingCooldown, totalCooldown) {
        // Try to find by skill ID first
        let skillIcon = document.querySelector(`.skill-icon[data-skill-id="${skillId}"]`);
        
        // If not found, try to find by index (for abilities without IDs)
        if (!skillIcon && typeof skillId === 'number') {
            skillIcon = document.querySelector(`.skill-icon[data-index="${skillId}"]`);
        }
        
        if (!skillIcon) {
            console.log(`Skill icon not found for ID: ${skillId}`);
            return;
        }
        
        const cooldownOverlay = skillIcon.querySelector('.cooldown-overlay');
        if (!cooldownOverlay) return;
        
        const cooldownPercent = (remainingCooldown / totalCooldown) * 100;
        
        if (remainingCooldown <= 0) {
            cooldownOverlay.style.display = 'none';
            skillIcon.classList.remove('on-cooldown');
        } else {
            cooldownOverlay.style.display = 'block';
            cooldownOverlay.style.transform = `rotate(${360 * (remainingCooldown / totalCooldown)}deg)`;
            skillIcon.classList.add('on-cooldown');
        }
    }
    
    /**
     * Open the inventory panel
     */
    openInventory() {
        console.log('=== OPEN INVENTORY DEBUGGING ===');
        console.log('openInventory called');
        
        if (!this.game.player) {
            console.error('Player does not exist in openInventory');
            console.log('=== END OPEN INVENTORY DEBUGGING ===');
            return;
        }
        
        if (!this.game.player.inventory) {
            console.log('Player inventory does not exist, initializing empty array');
            this.game.player.inventory = [];
        }
        
        console.log('Player inventory before opening (length):', this.game.player.inventory.length);
        console.log('Player inventory contents:', JSON.stringify(this.game.player.inventory));
        
        if (this.isSkillTreeOpen) {
            console.log('Skill tree is open, closing it first');
            this.closeSkillTree();
        }
        
        const inventoryPanel = document.getElementById('inventory-panel');
        const menuScreen = document.getElementById('menu-screen');
        
        if (!inventoryPanel) {
            console.error('Inventory panel not found in DOM');
            console.log('=== END OPEN INVENTORY DEBUGGING ===');
            return;
        }
        
        if (!menuScreen) {
            console.error('Menu screen not found in DOM');
            console.log('=== END OPEN INVENTORY DEBUGGING ===');
            return;
        }
        
        console.log('Showing inventory panel, hiding menu screen');
        inventoryPanel.classList.remove('hidden');
        menuScreen.classList.add('hidden');
        this.isInventoryOpen = true;
        this.game.pause();
        
        // Update inventory display
        console.log('Updating inventory display...');
        this.updateInventoryDisplay();
        
        console.log('Inventory opened and updated');
        console.log('=== END OPEN INVENTORY DEBUGGING ===');
    }
    
    /**
     * Close the inventory panel
     */
    closeInventory() {
        document.getElementById('inventory-panel').classList.add('hidden');
        document.getElementById('menu-screen').classList.remove('hidden');
        this.isInventoryOpen = false;
        this.game.pause();
    }
    
    /**
     * Update the inventory display
     */
    updateInventoryDisplay() {
        console.log('=== UI INVENTORY DISPLAY UPDATE DEBUGGING ===');
        console.log('UI updateInventoryDisplay called');
        
        // Get inventory elements
        const inventoryPanel = document.getElementById('inventory-panel');
        const inventoryGrid = document.getElementById('inventory-grid');
        const inventoryCount = document.getElementById('inventory-count');
        
        // Check if inventory panel exists
        if (!inventoryPanel) {
            console.error('Inventory panel not found in DOM');
            console.log('=== END UI INVENTORY DISPLAY UPDATE DEBUGGING ===');
            return;
        }
        
        // Check if inventory grid exists
        if (!inventoryGrid) {
            console.error('Inventory grid not found in DOM');
            console.log('=== END UI INVENTORY DISPLAY UPDATE DEBUGGING ===');
            return;
        }
        
        // Check if inventory count exists
        if (!inventoryCount) {
            console.error('Inventory count not found in DOM');
            console.log('=== END UI INVENTORY DISPLAY UPDATE DEBUGGING ===');
            return;
        }
        
        if (!this.game.player) {
            console.error('Player does not exist in UI updateInventoryDisplay');
            console.log('=== END UI INVENTORY DISPLAY UPDATE DEBUGGING ===');
            return;
        }
        
        // Initialize inventory array if it doesn't exist
        if (!this.game.player.inventory) {
            console.log('Initializing player inventory array in UI');
            this.game.player.inventory = [];
        }
        
        console.log('Player inventory in UI (length):', this.game.player.inventory.length);
        console.log('Player inventory contents:', JSON.stringify(this.game.player.inventory));
        console.log('Inventory panel visibility:', inventoryPanel.classList.contains('hidden') ? 'hidden' : 'visible');
        
        // Clear existing items
        console.log('Clearing existing inventory grid items');
        inventoryGrid.innerHTML = '';
        
        // Update inventory count
        inventoryCount.textContent = `${this.game.player.inventory.length}/${this.game.player.maxInventorySize || 20}`;
        console.log('Updated inventory count display:', inventoryCount.textContent);
        
        // Add items to inventory grid
        if (this.game.player.inventory && this.game.player.inventory.length > 0) {
            console.log('Adding items to inventory grid...');
            this.game.player.inventory.forEach((item, index) => {
                console.log('Adding item to inventory grid:', item.name, 'at index:', index);
                
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
                    this.showItemDetails(item, null, index);
                });
                
                inventoryGrid.appendChild(itemElement);
            });
            console.log('Finished adding items to inventory grid');
        } else {
            console.log('No items in inventory, showing empty message');
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-inventory-message';
            emptyMessage.textContent = 'Your inventory is empty';
            inventoryGrid.appendChild(emptyMessage);
        }
        
        console.log('Inventory grid after update:', inventoryGrid.innerHTML);
        
        // Update equipment slots
        console.log('Updating equipment display...');
        this.updateEquipmentDisplay();
        
        console.log('=== END UI INVENTORY DISPLAY UPDATE DEBUGGING ===');
    }
    
    /**
     * Update the equipment display
     */
    updateEquipmentDisplay() {
        const slots = document.querySelectorAll('.equipment-slot');
        
        slots.forEach(slot => {
            const slotName = slot.dataset.slot;
            const slotContent = slot.querySelector('.slot-content');
            const equippedItem = this.game.player.equipment[slotName];
            
            if (equippedItem) {
                slotContent.classList.remove('empty');
                slotContent.classList.add(`rarity-${equippedItem.rarity}`);
                
                slotContent.innerHTML = `
                    <div class="item-icon">${equippedItem.icon}</div>
                    <div class="item-name">${equippedItem.name}</div>
                `;
                
                // Add click event
                slotContent.addEventListener('click', () => {
                    this.showItemDetails(equippedItem, slotName);
                });
            } else {
                slotContent.classList.add('empty');
                slotContent.classList.remove('rarity-common', 'rarity-uncommon', 'rarity-rare', 'rarity-epic', 'rarity-legendary');
                slotContent.innerHTML = '';
            }
        });
    }
    
    /**
     * Show item details
     * @param {Object} item - The item to show details for
     * @param {string} [equipSlot] - The equipment slot if the item is equipped
     */
    showItemDetails(item, equipSlot = null, index = null) {
        const itemDetails = document.getElementById('item-details');
        const itemDetailsContent = document.getElementById('item-details-content');
        const equipButton = document.getElementById('equip-item');
        const dropButton = document.getElementById('drop-item');
        
        if (!itemDetails || !itemDetailsContent || !equipButton || !dropButton) {
            console.error('Item details elements not found');
            return;
        }
        
        // Show the item details panel
        itemDetails.classList.remove('hidden');
        
        // Generate stats HTML
        let statsHtml = '';
        if (item.stats) {
            for (const [stat, value] of Object.entries(item.stats)) {
                const formattedStat = this.game.equipmentSystem.formatStatName(stat);
                statsHtml += `<div class="stat-row">
                    <span class="stat-name">${formattedStat}</span>
                    <span class="stat-value">${value > 0 ? '+' : ''}${value}</span>
                </div>`;
            }
        }
        
        // Set item details content
        itemDetailsContent.innerHTML = `
            <div class="item-header rarity-${item.rarity}">
                <div class="item-icon">${item.icon}</div>
                <div class="item-title">
                    <div class="item-name">${item.name}</div>
                    <div class="item-type">${item.type} - ${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}</div>
                </div>
            </div>
            <div class="item-description">${item.description}</div>
            <div class="item-stats">
                ${statsHtml}
            </div>
        `;
        
        // Update button states
        if (equipSlot) {
            // Item is equipped
            equipButton.textContent = 'Unequip';
            equipButton.onclick = () => {
                this.game.equipmentSystem.unequipItem(equipSlot);
                this.updateInventoryDisplay();
                itemDetails.classList.add('hidden');
            };
        } else if (index !== null) {
            // Item is in inventory
            equipButton.textContent = 'Equip';
            equipButton.onclick = () => {
                this.game.equipmentSystem.equipItem(index);
                this.updateInventoryDisplay();
                itemDetails.classList.add('hidden');
            };
            
            dropButton.onclick = () => {
                this.game.equipmentSystem.removeFromInventory(index);
                this.updateInventoryDisplay();
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
     * Open the skill tree panel
     */
    openSkillTree() {
        if (this.isInventoryOpen) {
            this.closeInventory();
        }
        
        // Check if there's a pending specialization unlock
        if (this.game.specializationSystem.pendingSpecializationUnlock) {
            this.game.specializationSystem.showSpecializationSelection();
            return;
        }
        
        document.getElementById('skill-tree-panel').classList.remove('hidden');
        document.getElementById('menu-screen').classList.add('hidden');
        this.isSkillTreeOpen = true;
        this.game.pause();
        
        // Update skill points display
        document.getElementById('available-skill-points').textContent = this.game.skillPoints;
        
        // Render skill trees
        const skillTreesContainer = document.getElementById('skill-trees-container');
        this.game.specializationSystem.renderSkillTree(skillTreesContainer);
    }
    
    /**
     * Close the skill tree panel
     */
    closeSkillTree() {
        document.getElementById('skill-tree-panel').classList.add('hidden');
        document.getElementById('menu-screen').classList.remove('hidden');
        this.isSkillTreeOpen = false;
        this.game.pause();
    }
    
    /**
     * Show game over screen with stats
     */
    showGameOver() {
        const gameOverScreen = document.getElementById('game-over-screen');
        const gameStats = document.getElementById('game-stats');
        
        gameStats.innerHTML = `
            <div class="stat-row">
                <div class="stat-label">Distance Traveled:</div>
                <div class="stat-value">${Math.floor(this.game.depth)} light years</div>
            </div>
            <div class="stat-row">
                <div class="stat-label">Level Reached:</div>
                <div class="stat-value">${this.game.level}</div>
            </div>
            <div class="stat-row">
                <div class="stat-label">Gold Collected:</div>
                <div class="stat-value">${this.game.gold}</div>
            </div>
            <div class="stat-row">
                <div class="stat-label">Enemies Defeated:</div>
                <div class="stat-value">${this.game.enemiesDefeated || 0}</div>
            </div>
            <div class="stat-row">
                <div class="stat-label">Time Survived:</div>
                <div class="stat-value">${this.formatTime(this.game.gameTime / 1000)}</div>
            </div>
        `;
        
        gameOverScreen.classList.remove('hidden');
    }
    
    /**
     * Format time in seconds to MM:SS format
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Update all UI elements
     */
    update() {
        // Check if player exists and UI is initialized
        if (!this.game.player || !document.getElementById('hud')) return;
        
        this.updateShieldDisplay();
        this.updateLevelDisplay();
        this.updateStatsDisplay();
        
        // Update skill cooldowns
        if (this.game.player.specialAbilities) {
            this.game.player.specialAbilities.forEach((ability, index) => {
                if (ability.currentCooldown > 0) {
                    this.updateSkillCooldown(ability.id || index, ability.currentCooldown, ability.cooldown);
                }
            });
        }
    }
    
    /**
     * Render method - UI is handled by the DOM, so this is a no-op
     * This method exists to satisfy the Game class's render call
     */
    render() {
        // UI is handled by the DOM, no need to render anything here
    }
    
    /**
     * Show a level up notification
     */
    showLevelUpNotification() {
        // Show a level up alert
        this.showAlert(`Level Up! Now level ${this.game.level}`, 3);
        
        // Play level up sound if available
        if (this.game.audioSystem && this.game.audioSystem.playSound) {
            this.game.audioSystem.playSound('level_up');
        }
        
        // Add a visual effect
        if (this.game.player && this.game.particleSystem) {
            this.game.particleSystem.createExplosion(
                this.game.player.x,
                this.game.player.y,
                '#ffff00', // Yellow
                30, // Particle count
                5, // Particle size
                150 // Explosion radius
            );
        }
    }
    
    /**
     * Reset the UI system
     */
    reset() {
        console.log('Resetting UI system');
        
        // Reset UI state
        this.isInventoryOpen = false;
        this.isSkillTreeOpen = false;
        
        // Clear UI overlay
        this.uiOverlay.innerHTML = '';
        this.uiOverlay.classList.add('hidden');
        
        // Hide any open panels
        const panels = document.querySelectorAll('.game-panel');
        panels.forEach(panel => {
            panel.classList.add('hidden');
        });
        
        // Hide menu screen
        const menuScreen = document.getElementById('menu-screen');
        if (menuScreen) {
            menuScreen.classList.add('hidden');
        }
        
        console.log('UI system reset');
    }
} 