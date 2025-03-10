// Dopamine - Space Shooter RPG
// Main entry point for the game

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dopamine - Space Shooter RPG initializing...');
    
    // Initialize the game
    const game = new Game();
    
    // Set up event listeners for the start screen
    document.getElementById('start-button').addEventListener('click', () => {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('specialization-screen').classList.remove('hidden');
        game.initializeSpecializationSelection();
    });
    
    // Set up event listeners for the specialization screen
    document.getElementById('confirm-specializations').addEventListener('click', () => {
        document.getElementById('specialization-screen').classList.add('hidden');
        game.start();
    });
    
    // Set up event listeners for the game over screen
    document.getElementById('restart-button').addEventListener('click', () => {
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
    });
    
    // Set up event listeners for the menu screen
    document.getElementById('resume-button').addEventListener('click', () => {
        document.getElementById('menu-screen').classList.add('hidden');
        game.resume();
    });
    
    document.getElementById('inventory-button').addEventListener('click', () => {
        game.openInventory();
    });
    
    document.getElementById('skills-button').addEventListener('click', () => {
        game.openSkillTree();
    });
    
    document.getElementById('options-button').addEventListener('click', () => {
        // TODO: Implement options menu
    });
    
    // Set up keyboard event listener for the menu key (Escape)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (document.getElementById('menu-screen').classList.contains('hidden')) {
                document.getElementById('menu-screen').classList.remove('hidden');
                game.pause();
            } else {
                document.getElementById('menu-screen').classList.add('hidden');
                game.resume();
            }
        }
    });
}); 