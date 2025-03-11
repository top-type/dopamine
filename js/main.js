// Dopamine - Space Shooter RPG
// Main entry point for the game

import { Game } from './engine/game.js';

/**
 * Ensures a DOM element exists, creating it if needed
 * @param {string} id - Element ID
 * @param {string} className - CSS class to apply
 * @param {string} parentId - Parent element ID
 * @returns {HTMLElement} - The existing or created element
 */
function ensureElementExists(id, className, parentId) {
    let element = document.getElementById(id);
    
    if (!element) {
        const parent = document.getElementById(parentId);
        if (parent) {
            element = document.createElement('div');
            element.id = id;
            element.className = className;
            parent.appendChild(element);
            console.log(`Created missing element: ${id}`);
        }
    }
    
    return element;
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dopamine - Space Shooter RPG initializing...');
    
    // Initialize the game
    const game = new Game();
    
    // Ensure all required UI elements exist
    ensureElementExists('skills-content', 'tab-content', 'menu-content');
    ensureElementExists('inventory-content', 'tab-content', 'menu-content');
    ensureElementExists('shop-content', 'tab-content', 'menu-content');
    
    // Set up event listeners for the start screen
    document.getElementById('start-button').addEventListener('click', () => {
        document.getElementById('start-screen').classList.add('hidden');
        game.start();
    });
    
    // Set up event listeners for the game over screen
    document.getElementById('restart-button').addEventListener('click', () => {
        game.restart();
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
            
            // Ensure the content element exists and activate it
            const contentElement = ensureElementExists(contentId, 'tab-content', 'menu-content');
            contentElement.classList.add('active');
            
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
    let escKeyPressed = false;
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !escKeyPressed) {
            escKeyPressed = true;
            const menuScreen = document.getElementById('menu-screen');
            
            if (menuScreen.classList.contains('hidden')) {
                // Show menu
                menuScreen.classList.remove('hidden');
                game.isPaused = true;
                // Activate inventory tab by default
                document.getElementById('tab-inventory').click();
            } else {
                // Hide menu
                menuScreen.classList.add('hidden');
                game.isPaused = false;
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
            escKeyPressed = false;
        }
    });
}); 