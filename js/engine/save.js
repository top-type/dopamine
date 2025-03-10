/**
 * SaveSystem - Handles saving and loading game progress
 */
class SaveSystem {
    constructor() {
        this.saveKey = 'dopamine_save';
        console.log('Save system initialized');
    }
    
    /**
     * Save game state
     */
    saveGame(game) {
        try {
            // Create save data object
            const saveData = {
                version: 1,
                timestamp: Date.now(),
                player: {
                    level: game.level,
                    xp: game.xp,
                    xpToNextLevel: game.xpToNextLevel,
                    gold: game.gold,
                    depth: game.depth,
                    equipment: game.equipmentSystem.getEquipmentData(),
                    inventory: game.equipmentSystem.getInventoryData()
                },
                specializations: game.specializationSystem.getSpecializationData(),
                skills: game.specializationSystem.getSkillData()
            };
            
            // Save to local storage
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            
            console.log('Game saved successfully');
            return true;
        } catch (e) {
            console.error('Error saving game:', e);
            return false;
        }
    }
    
    /**
     * Load game state
     */
    loadGame(game) {
        try {
            // Get save data from local storage
            const saveDataString = localStorage.getItem(this.saveKey);
            
            if (!saveDataString) {
                console.log('No save data found');
                return false;
            }
            
            // Parse save data
            const saveData = JSON.parse(saveDataString);
            
            // Check version
            if (saveData.version !== 1) {
                console.warn('Save data version mismatch');
                return false;
            }
            
            // Load player data
            game.level = saveData.player.level;
            game.xp = saveData.player.xp;
            game.xpToNextLevel = saveData.player.xpToNextLevel;
            game.gold = saveData.player.gold;
            game.depth = saveData.player.depth;
            
            // Load equipment and inventory
            game.equipmentSystem.loadEquipmentData(saveData.player.equipment);
            game.equipmentSystem.loadInventoryData(saveData.player.inventory);
            
            // Load specializations and skills
            game.specializationSystem.loadSpecializationData(saveData.specializations);
            game.specializationSystem.loadSkillData(saveData.skills);
            
            console.log('Game loaded successfully');
            return true;
        } catch (e) {
            console.error('Error loading game:', e);
            return false;
        }
    }
    
    /**
     * Check if a save exists
     */
    hasSave() {
        return localStorage.getItem(this.saveKey) !== null;
    }
    
    /**
     * Delete save data
     */
    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            console.log('Save data deleted');
            return true;
        } catch (e) {
            console.error('Error deleting save data:', e);
            return false;
        }
    }
    
    /**
     * Get save info without loading the full game
     */
    getSaveInfo() {
        try {
            const saveDataString = localStorage.getItem(this.saveKey);
            
            if (!saveDataString) {
                return null;
            }
            
            const saveData = JSON.parse(saveDataString);
            
            return {
                timestamp: saveData.timestamp,
                level: saveData.player.level,
                depth: saveData.player.depth,
                gold: saveData.player.gold,
                specializations: saveData.specializations
            };
        } catch (e) {
            console.error('Error getting save info:', e);
            return null;
        }
    }
} 