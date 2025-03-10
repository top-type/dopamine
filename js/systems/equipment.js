/**
 * EquipmentSystem - Handles player equipment and inventory
 */
class EquipmentSystem {
    constructor(game) {
        this.game = game;
        
        // Equipment slots
        this.equipmentSlots = [
            'primaryWeapon',
            'armor',
            'engine',
            'shield',
            'special',
            'fluxCapacitorPrimary',
            'fluxCapacitorSecondary',
            'navigationCore'
        ];
        
        // Item generation settings
        this.rarityChances = {
            common: 0.6,
            uncommon: 0.25,
            rare: 0.1,
            epic: 0.04,
            legendary: 0.01
        };
        
        console.log('Equipment system initialized');
    }
    
    /**
     * Open the inventory screen
     */
    openInventoryScreen() {
        // Create inventory screen if it doesn't exist
        let inventoryScreen = document.getElementById('inventory-screen');
        
        if (!inventoryScreen) {
            inventoryScreen = document.createElement('div');
            inventoryScreen.id = 'inventory-screen';
            inventoryScreen.className = 'screen';
            
            // Create inventory grid
            const inventoryGrid = document.createElement('div');
            inventoryGrid.id = 'inventory-grid';
            
            // Create equipment slots
            const equipmentSlotsContainer = document.createElement('div');
            equipmentSlotsContainer.id = 'equipment-slots';
            
            // Add to inventory screen
            inventoryScreen.appendChild(inventoryGrid);
            inventoryScreen.appendChild(equipmentSlotsContainer);
            
            // Add close button
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.addEventListener('click', () => {
                inventoryScreen.classList.add('hidden');
                this.game.resume();
            });
            
            inventoryScreen.appendChild(closeButton);
            
            // Add to game container
            document.getElementById('game-container').appendChild(inventoryScreen);
        }
        
        // Show inventory screen
        inventoryScreen.classList.remove('hidden');
        
        // Update inventory display
        this.updateInventoryDisplay();
    }
    
    /**
     * Update the inventory display
     */
    updateInventoryDisplay() {
        const inventoryGrid = document.getElementById('inventory-grid');
        const equipmentSlotsContainer = document.getElementById('equipment-slots');
        
        // Clear existing content
        inventoryGrid.innerHTML = '';
        equipmentSlotsContainer.innerHTML = '';
        
        // Add equipment slots
        for (const slotName of this.equipmentSlots) {
            const slotElement = document.createElement('div');
            slotElement.className = 'equipment-slot';
            slotElement.dataset.slot = slotName;
            
            // Add slot name
            const slotNameElement = document.createElement('div');
            slotNameElement.className = 'equipment-slot-name';
            slotNameElement.textContent = this.formatSlotName(slotName);
            slotElement.appendChild(slotNameElement);
            
            // Add item if equipped
            const equippedItem = this.getEquippedItem(slotName);
            if (equippedItem) {
                const itemElement = this.createItemElement(equippedItem);
                slotElement.appendChild(itemElement);
                
                // Add unequip button
                const unequipButton = document.createElement('button');
                unequipButton.textContent = 'Unequip';
                unequipButton.className = 'unequip-button';
                unequipButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.unequipItem(slotName);
                });
                
                slotElement.appendChild(unequipButton);
            }
            
            // Add click handler to show equippable items
            slotElement.addEventListener('click', () => {
                this.showEquippableItems(slotName);
            });
            
            equipmentSlotsContainer.appendChild(slotElement);
        }
        
        // Add inventory items
        if (this.game.player && this.game.player.inventory) {
            const maxSlots = this.game.player.maxInventorySize || 20;
            for (let i = 0; i < maxSlots; i++) {
                const slotElement = document.createElement('div');
                slotElement.className = 'inventory-slot';
                slotElement.dataset.index = i;
                
                // Add item if exists
                if (i < this.game.player.inventory.length) {
                    const itemElement = this.createItemElement(this.game.player.inventory[i]);
                    slotElement.appendChild(itemElement);
                    
                    // Add click handler to equip item
                    slotElement.addEventListener('click', () => {
                        this.equipItem(i);
                    });
                }
                
                inventoryGrid.appendChild(slotElement);
            }
        }
    }
    
    /**
     * Create an item element for display
     */
    createItemElement(item) {
        const itemElement = document.createElement('div');
        itemElement.className = `item item-${item.rarity}`;
        
        // Add item icon based on slot and rarity
        const iconElement = document.createElement('div');
        iconElement.className = 'item-icon';
        iconElement.style.backgroundColor = this.getItemColor(item.rarity);
        itemElement.appendChild(iconElement);
        
        // Add tooltip
        itemElement.addEventListener('mouseenter', (e) => {
            this.showItemTooltip(item, e.target);
        });
        
        itemElement.addEventListener('mouseleave', () => {
            this.hideItemTooltip();
        });
        
        return itemElement;
    }
    
    /**
     * Show tooltip for an item
     */
    showItemTooltip(item, target) {
        // Remove existing tooltip
        this.hideItemTooltip();
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        
        // Add item name
        const nameElement = document.createElement('div');
        nameElement.className = `item-name item-${item.rarity}`;
        nameElement.textContent = item.name;
        tooltip.appendChild(nameElement);
        
        // Add item stats
        const statsElement = document.createElement('div');
        statsElement.className = 'item-stats';
        
        for (const [stat, value] of Object.entries(item.stats)) {
            const statElement = document.createElement('div');
            statElement.textContent = `${this.formatStatName(stat)}: ${value}`;
            statsElement.appendChild(statElement);
        }
        
        tooltip.appendChild(statsElement);
        
        // Add item description
        const descElement = document.createElement('div');
        descElement.className = 'item-description';
        descElement.textContent = item.description;
        tooltip.appendChild(descElement);
        
        // Position tooltip
        const rect = target.getBoundingClientRect();
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.top = `${rect.top}px`;
        
        // Add to document
        document.body.appendChild(tooltip);
    }
    
    /**
     * Hide item tooltip
     */
    hideItemTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
    
    /**
     * Show equippable items for a slot
     */
    showEquippableItems(slotName) {
        if (!this.game.player || !this.game.player.inventory) return;
        
        // Find items that can be equipped in this slot
        const equippableItems = this.game.player.inventory.filter(item => item.slot === slotName);
        
        // Highlight equippable items
        const inventorySlots = document.querySelectorAll('.inventory-slot');
        
        inventorySlots.forEach((slot, index) => {
            if (index < this.game.player.inventory.length) {
                const item = this.game.player.inventory[index];
                
                if (item.slot === slotName) {
                    slot.classList.add('equippable');
                } else {
                    slot.classList.remove('equippable');
                }
            } else {
                slot.classList.remove('equippable');
            }
        });
    }
    
    /**
     * Format slot name for display
     */
    formatSlotName(slotName) {
        // Convert camelCase to Title Case with spaces
        return slotName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }
    
    /**
     * Format stat name for display
     */
    formatStatName(statName) {
        // Convert camelCase to Title Case with spaces
        return statName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }
    
    /**
     * Get color for item based on rarity
     */
    getItemColor(rarity) {
        switch (rarity) {
            case 'common':
                return '#ffffff';
            case 'uncommon':
                return '#00ff00';
            case 'rare':
                return '#0088ff';
            case 'epic':
                return '#aa00ff';
            case 'legendary':
                return '#ffaa00';
            default:
                return '#ffffff';
        }
    }
    
    /**
     * Add an item to the inventory
     */
    addToInventory(itemData) {
        console.log('=== EQUIPMENT SYSTEM ADD TO INVENTORY DEBUGGING ===');
        console.log('addToInventory called with:', JSON.stringify(itemData));
        
        // Check if itemData is valid
        if (!itemData) {
            console.error('Invalid item data: null or undefined');
            return false;
        }
        
        // If slot is missing but type exists, use type as slot
        if (!itemData.slot && itemData.type) {
            console.log(`Item missing slot property, using type '${itemData.type}' as slot`);
            itemData.slot = itemData.type;
        }
        
        // Check if required properties exist
        if (!itemData.name || !itemData.slot || !itemData.rarity) {
            console.error('Item missing required properties:', JSON.stringify(itemData));
            return false;
        }
        
        // Check if player exists
        if (!this.game.player) {
            console.error('Player does not exist');
            return false;
        }
        
        console.log('Player object:', this.game.player);
        console.log('Player inventory exists:', !!this.game.player.inventory);
        
        // Initialize inventory array if it doesn't exist
        if (!this.game.player.inventory) {
            console.log('Initializing player inventory array');
            this.game.player.inventory = [];
        }
        
        // Check if inventory is full
        if (this.game.player.inventory.length >= this.game.player.maxInventorySize) {
            console.log('Inventory is full');
            return false;
        }
        
        // Create a deep copy of the item data to avoid reference issues
        const itemCopy = JSON.parse(JSON.stringify(itemData));
        
        // Ensure the item has an ID
        if (!itemCopy.id) {
            itemCopy.id = 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            console.log('Generated new ID for item:', itemCopy.id);
        }
        
        // Ensure the item has an icon
        if (!itemCopy.icon) {
            itemCopy.icon = this.getDefaultIconForSlot(itemCopy.slot);
            console.log('Added default icon for item:', itemCopy.icon);
        }
        
        // Add item to player's inventory
        console.log('Player inventory before adding item (length):', this.game.player.inventory.length);
        this.game.player.inventory.push(itemCopy);
        console.log('Player inventory after adding item (length):', this.game.player.inventory.length);
        
        // Log the entire inventory for debugging
        console.log('Player inventory contents after adding item:', JSON.stringify(this.game.player.inventory));
        
        // Update the inventory display if UI system exists
        if (this.game.uiSystem) {
            console.log('Updating UI inventory display from equipment system...');
            this.game.uiSystem.updateInventoryDisplay();
        } else {
            console.log('UI system not available for inventory display update');
        }
        
        console.log(`Added ${itemData.name} to inventory`);
        console.log('=== END EQUIPMENT SYSTEM ADD TO INVENTORY DEBUGGING ===');
        return true;
    }
    
    /**
     * Get default icon for a slot
     */
    getDefaultIconForSlot(slot) {
        const icons = {
            primaryWeapon: '🔫',
            armor: '🛡️',
            engine: '🚀',
            shield: '🔰',
            special: '✨',
            fluxCapacitorPrimary: '⚡',
            fluxCapacitorSecondary: '⚡',
            navigationCore: '🧭'
        };
        
        return icons[slot] || '📦';
    }
    
    /**
     * Remove an item from the inventory
     */
    removeFromInventory(index) {
        // Check if player exists
        if (!this.game.player) {
            console.log('Player does not exist');
            return null;
        }
        
        if (index >= 0 && index < this.game.player.inventory.length) {
            const item = this.game.player.inventory[index];
            this.game.player.inventory.splice(index, 1);
            
            // Update the inventory display if UI system exists
            if (this.game.uiSystem) {
                this.game.uiSystem.updateInventoryDisplay();
            }
            
            console.log(`Removed ${item.name} from inventory`);
            return item;
        }
        
        return null;
    }
    
    /**
     * Equip an item from inventory
     */
    equipItem(inventoryIndex) {
        if (!this.game.player) return;
        
        // Check if inventory exists
        if (!this.game.player.inventory) {
            console.log('Player inventory does not exist');
            return;
        }
        
        // Check if index is valid
        if (inventoryIndex < 0 || inventoryIndex >= this.game.player.inventory.length) {
            console.log(`Invalid inventory index: ${inventoryIndex}`);
            return;
        }
        
        const item = this.game.player.inventory[inventoryIndex];
        
        if (!item) {
            console.log('No item found at index:', inventoryIndex);
            return;
        }
        
        console.log('Equipping item:', item, 'from index:', inventoryIndex);
        
        // Check if item slot is valid
        if (!this.equipmentSlots.includes(item.slot)) {
            console.log(`Invalid equipment slot: ${item.slot}`);
            return;
        }
        
        // Unequip current item in that slot
        const currentItem = this.getEquippedItem(item.slot);
        if (currentItem) {
            this.unequipItem(item.slot);
        }
        
        // Remove from inventory
        this.removeFromInventory(inventoryIndex);
        
        // Equip item
        this.game.player.equipment[item.slot] = item;
        
        // Apply item stats
        this.applyItemStats(item);
        
        console.log(`Equipped ${item.name} in ${item.slot} slot`);
        
        // Update inventory display
        this.game.uiSystem.updateInventoryDisplay();
    }
    
    /**
     * Unequip an item from a slot
     */
    unequipItem(slotName) {
        const item = this.getEquippedItem(slotName);
        
        if (!item) return;
        
        // Remove item stats
        this.removeItemStats(item);
        
        // Remove from equipment
        if (this.game.player) {
            this.game.player.equipment[slotName] = null;
        }
        
        // Add to inventory
        this.addToInventory(item);
        
        console.log(`Unequipped ${item.name} from ${slotName} slot`);
        
        // Update inventory display
        if (this.game.uiSystem) {
            this.game.uiSystem.updateInventoryDisplay();
        }
    }
    
    /**
     * Get equipped item in a slot
     */
    getEquippedItem(slotName) {
        if (this.game.player && this.game.player.equipment[slotName]) {
            return this.game.player.equipment[slotName];
        }
        
        return null;
    }
    
    /**
     * Apply item stats to player
     */
    applyItemStats(item) {
        if (!this.game.player) return;
        
        // Apply stats based on item slot
        switch (item.slot) {
            case 'primaryWeapon':
                if (item.stats.damage) {
                    this.game.player.primaryWeapon.damage = item.stats.damage;
                }
                if (item.stats.fireRate) {
                    this.game.player.primaryWeapon.fireRate = item.stats.fireRate;
                }
                if (item.stats.projectileSpeed) {
                    this.game.player.primaryWeapon.projectileSpeed = item.stats.projectileSpeed;
                }
                break;
                
            case 'armor':
                if (item.stats.shieldCapacity) {
                    const oldMaxShield = this.game.player.maxShield;
                    this.game.player.maxShield += item.stats.shieldCapacity;
                    
                    // Increase current shield by the same proportion
                    this.game.player.shield = (this.game.player.shield / oldMaxShield) * this.game.player.maxShield;
                }
                break;
                
            case 'engine':
                if (item.stats.speed) {
                    this.game.player.baseSpeed += item.stats.speed;
                    this.game.player.currentSpeed = this.game.player.baseSpeed;
                }
                break;
                
            case 'shield':
                if (item.stats.shieldRegenRate) {
                    this.game.player.shieldRegenRate += item.stats.shieldRegenRate;
                }
                if (item.stats.shieldRegenDelay) {
                    this.game.player.shieldRegenDelay -= item.stats.shieldRegenDelay;
                    // Ensure minimum delay
                    this.game.player.shieldRegenDelay = Math.max(0.5, this.game.player.shieldRegenDelay);
                }
                break;
                
            // Other slots will be implemented as needed
        }
        
        // Update UI
        this.game.uiSystem.updatePlayerStats();
    }
    
    /**
     * Remove item stats from player
     */
    removeItemStats(item) {
        if (!this.game.player) return;
        
        // Remove stats based on item slot
        switch (item.slot) {
            case 'primaryWeapon':
                // Reset to default values
                this.game.player.primaryWeapon.damage = 10;
                this.game.player.primaryWeapon.fireRate = 5;
                this.game.player.primaryWeapon.projectileSpeed = 500;
                break;
                
            case 'armor':
                if (item.stats.shieldCapacity) {
                    const oldMaxShield = this.game.player.maxShield;
                    this.game.player.maxShield -= item.stats.shieldCapacity;
                    
                    // Decrease current shield by the same proportion
                    this.game.player.shield = (this.game.player.shield / oldMaxShield) * this.game.player.maxShield;
                }
                break;
                
            case 'engine':
                if (item.stats.speed) {
                    this.game.player.baseSpeed -= item.stats.speed;
                    this.game.player.currentSpeed = this.game.player.baseSpeed;
                }
                break;
                
            case 'shield':
                if (item.stats.shieldRegenRate) {
                    this.game.player.shieldRegenRate -= item.stats.shieldRegenRate;
                }
                if (item.stats.shieldRegenDelay) {
                    this.game.player.shieldRegenDelay += item.stats.shieldRegenDelay;
                }
                break;
                
            // Other slots will be implemented as needed
        }
        
        // Update UI
        this.game.uiSystem.updatePlayerStats();
    }
    
    /**
     * Generate a random item based on depth
     */
    generateRandomItem(depth) {
        // Determine item slot
        const slot = this.getRandomSlot();
        
        // Determine item rarity based on depth
        const rarity = this.determineItemRarity(depth);
        
        // Generate item stats based on slot and rarity
        const stats = this.generateItemStats(slot, rarity, depth);
        
        // Generate item name
        const name = this.generateItemName(slot, rarity);
        
        // Generate item description
        const description = this.generateItemDescription(slot, rarity, stats);
        
        // Create item data
        const itemData = {
            slot: slot,
            name: name,
            rarity: rarity,
            stats: stats,
            description: description
        };
        
        return itemData;
    }
    
    /**
     * Get a random equipment slot
     */
    getRandomSlot() {
        return this.equipmentSlots[Math.floor(Math.random() * this.equipmentSlots.length)];
    }
    
    /**
     * Determine item rarity based on depth
     */
    determineItemRarity(depth) {
        // Adjust rarity chances based on depth
        const depthFactor = Math.min(1, depth / 5000);
        
        const adjustedChances = {
            legendary: this.rarityChances.legendary + depthFactor * 0.05,
            epic: this.rarityChances.epic + depthFactor * 0.1,
            rare: this.rarityChances.rare + depthFactor * 0.15,
            uncommon: this.rarityChances.uncommon,
            common: this.rarityChances.common - depthFactor * 0.3
        };
        
        // Ensure chances are positive
        for (const rarity in adjustedChances) {
            adjustedChances[rarity] = Math.max(0, adjustedChances[rarity]);
        }
        
        // Roll for rarity
        const roll = Math.random();
        let cumulativeChance = 0;
        
        for (const [rarity, chance] of Object.entries(adjustedChances)) {
            cumulativeChance += chance;
            if (roll < cumulativeChance) {
                return rarity;
            }
        }
        
        // Default to common
        return 'common';
    }
    
    /**
     * Generate item stats based on slot and rarity
     */
    generateItemStats(slot, rarity, depth) {
        // Base stats multiplier based on rarity
        const rarityMultipliers = {
            common: 1,
            uncommon: 1.5,
            rare: 2,
            epic: 3,
            legendary: 5
        };
        
        // Depth multiplier
        const depthMultiplier = 1 + (depth / 1000);
        
        // Base stats by slot
        const baseStats = {};
        
        switch (slot) {
            case 'primaryWeapon':
                baseStats.damage = 5 * rarityMultipliers[rarity] * depthMultiplier;
                baseStats.fireRate = 1 + Math.random() * 2 * rarityMultipliers[rarity];
                baseStats.projectileSpeed = 100 * rarityMultipliers[rarity];
                break;
                
            case 'armor':
                baseStats.shieldCapacity = 20 * rarityMultipliers[rarity] * depthMultiplier;
                break;
                
            case 'engine':
                baseStats.speed = 20 * rarityMultipliers[rarity];
                break;
                
            case 'shield':
                baseStats.shieldRegenRate = 1 * rarityMultipliers[rarity];
                baseStats.shieldRegenDelay = 0.2 * rarityMultipliers[rarity];
                break;
                
            case 'special':
                // Special items have unique effects
                baseStats.specialEffect = true;
                break;
                
            case 'fluxCapacitorPrimary':
            case 'fluxCapacitorSecondary':
                baseStats.cooldownReduction = 0.05 * rarityMultipliers[rarity];
                break;
                
            case 'navigationCore':
                baseStats.criticalChance = 0.02 * rarityMultipliers[rarity];
                baseStats.criticalDamage = 0.1 * rarityMultipliers[rarity];
                break;
        }
        
        // Round numeric stats to reasonable precision
        for (const stat in baseStats) {
            if (typeof baseStats[stat] === 'number') {
                baseStats[stat] = Math.round(baseStats[stat] * 10) / 10;
            }
        }
        
        return baseStats;
    }
    
    /**
     * Generate item name based on slot and rarity
     */
    generateItemName(slot, rarity) {
        // Prefixes by rarity
        const rarityPrefixes = {
            common: ['Basic', 'Standard', 'Simple'],
            uncommon: ['Enhanced', 'Improved', 'Advanced'],
            rare: ['Superior', 'Exceptional', 'Refined'],
            epic: ['Mastercraft', 'Extraordinary', 'Phenomenal'],
            legendary: ['Mythical', 'Legendary', 'Godlike']
        };
        
        // Suffixes by slot
        const slotNames = {
            primaryWeapon: ['Blaster', 'Cannon', 'Laser'],
            armor: ['Plating', 'Armor', 'Shell'],
            engine: ['Thruster', 'Engine', 'Drive'],
            shield: ['Shield', 'Barrier', 'Deflector'],
            special: ['Device', 'Gadget', 'Tool'],
            fluxCapacitorPrimary: ['Flux Capacitor', 'Energy Regulator', 'Power Core'],
            fluxCapacitorSecondary: ['Auxiliary Capacitor', 'Backup Regulator', 'Secondary Core'],
            navigationCore: ['Navigation Core', 'Guidance System', 'Targeting Array']
        };
        
        // Random prefix and suffix
        const prefix = rarityPrefixes[rarity][Math.floor(Math.random() * rarityPrefixes[rarity].length)];
        const suffix = slotNames[slot][Math.floor(Math.random() * slotNames[slot].length)];
        
        return `${prefix} ${suffix}`;
    }
    
    /**
     * Generate item description based on slot, rarity, and stats
     */
    generateItemDescription(slot, rarity, stats) {
        // Base descriptions by slot
        const slotDescriptions = {
            primaryWeapon: 'A weapon designed for consistent damage output.',
            armor: 'Reinforced plating that increases shield capacity.',
            engine: 'Propulsion system that enhances ship speed.',
            shield: 'Energy barrier that improves shield regeneration.',
            special: 'A specialized device with unique capabilities.',
            fluxCapacitorPrimary: 'Regulates energy flow to primary systems.',
            fluxCapacitorSecondary: 'Provides auxiliary power regulation.',
            navigationCore: 'Enhances ship targeting and critical systems.'
        };
        
        // Rarity descriptions
        const rarityDescriptions = {
            common: 'Standard issue equipment.',
            uncommon: 'Above average quality.',
            rare: 'Exceptional craftsmanship.',
            epic: 'A remarkable piece of technology.',
            legendary: 'An artifact of immense power.'
        };
        
        return `${slotDescriptions[slot]} ${rarityDescriptions[rarity]}`;
    }
    
    /**
     * Get equipment data for saving
     */
    getEquipmentData() {
        if (!this.game.player) return {};
        
        const equipmentData = {};
        
        for (const slot of this.equipmentSlots) {
            equipmentData[slot] = this.game.player.equipment[slot];
        }
        
        return equipmentData;
    }
    
    /**
     * Get inventory data for saving
     */
    getInventoryData() {
        if (!this.game.player) return [];
        return [...this.game.player.inventory];
    }
    
    /**
     * Load equipment data from save
     */
    loadEquipmentData(equipmentData) {
        if (!this.game.player) return;
        
        for (const slot of this.equipmentSlots) {
            if (equipmentData[slot]) {
                this.game.player.equipment[slot] = equipmentData[slot];
                this.applyItemStats(equipmentData[slot]);
            }
        }
    }
    
    /**
     * Load inventory data from save
     */
    loadInventoryData(inventoryData) {
        if (!this.game.player) return;
        this.game.player.inventory = [...inventoryData];
        
        // Update the inventory display if UI system exists
        if (this.game.uiSystem) {
            this.game.uiSystem.updateInventoryDisplay();
        }
    }
} 