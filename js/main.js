// Dopamine - Space Shooter RPG
// Main entry point for the game

import { Game } from './engine/game.js';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dopamine - Space Shooter RPG initializing...');
    
    // Initialize the game
    const game = new Game();
    
    // Ensure skills-content exists
    const menuContent = document.getElementById('menu-content');
    if (menuContent) {
        const skillsContent = document.getElementById('skills-content');
        if (!skillsContent) {
            console.log('Creating skills-content element');
            const newSkillsContent = document.createElement('div');
            newSkillsContent.id = 'skills-content';
            newSkillsContent.className = 'tab-content';
            menuContent.appendChild(newSkillsContent);
        }
    }
    
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
            
            // Ensure the content element exists
            let contentElement = document.getElementById(contentId);
            if (!contentElement && menuContent) {
                console.log(`Creating missing content element: ${contentId}`);
                contentElement = document.createElement('div');
                contentElement.id = contentId;
                contentElement.className = 'tab-content';
                menuContent.appendChild(contentElement);
            }
            
            if (contentElement) {
                contentElement.classList.add('active');
            }
            
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