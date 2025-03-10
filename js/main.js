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
            document.getElementById(contentId).classList.add('active');
            
            // Load content based on tab
            if (tab.id === 'tab-inventory') {
                game.loadInventory();
            } else if (tab.id === 'tab-skills') {
                game.loadSkillTree();
            } else if (tab.id === 'tab-shop') {
                game.loadShop();
            }
        });
    });
    
    // Set up keyboard event listener for the menu key (Escape)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (document.getElementById('menu-screen').classList.contains('hidden')) {
                document.getElementById('menu-screen').classList.remove('hidden');
                game.pause();
                // Activate inventory tab by default
                document.getElementById('tab-inventory').click();
            } else {
                document.getElementById('menu-screen').classList.add('hidden');
                game.resume();
            }
        }
    });
}); 