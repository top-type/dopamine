/**
 * State Manager
 * Handles game state transitions and management
 */

// Game states
export const GameState = {
    LOADING: 'loading',
    START_SCREEN: 'start_screen',
    PLAYING: 'playing',
    PAUSED: 'paused',
    MENU: 'menu',
    GAME_OVER: 'game_over'
};

export class StateManager {
    constructor(game) {
        this.game = game;
        this.currentState = GameState.START_SCREEN;
        this.previousState = null;
        
        // State change callbacks
        this.onStateChangeCallbacks = {};
        
        // Initialize state elements
        this.stateElements = {
            [GameState.START_SCREEN]: document.getElementById('start-screen'),
            [GameState.MENU]: document.getElementById('menu-screen'),
            [GameState.GAME_OVER]: document.getElementById('game-over-screen')
        };
    }
    
    /**
     * Change the current game state
     * @param {string} newState - The new state to transition to
     */
    changeState(newState) {
        if (newState === this.currentState) return;
        
        console.log(`State change: ${this.currentState} -> ${newState}`);
        
        this.previousState = this.currentState;
        this.currentState = newState;
        
        // Hide all state elements
        Object.values(this.stateElements).forEach(element => {
            if (element) element.classList.add('hidden');
        });
        
        // Show the current state element
        const currentElement = this.stateElements[newState];
        if (currentElement) currentElement.classList.remove('hidden');
        
        // Execute state change callbacks
        if (this.onStateChangeCallbacks[newState]) {
            this.onStateChangeCallbacks[newState].forEach(callback => callback());
        }
        
        // Handle specific state transitions
        switch (newState) {
            case GameState.PLAYING:
                this.game.isRunning = true;
                this.game.isPaused = false;
                break;
                
            case GameState.PAUSED:
            case GameState.MENU:
                this.game.isPaused = true;
                break;
                
            case GameState.GAME_OVER:
                this.game.isRunning = false;
                this.game.isPaused = true;
                break;
        }
    }
    
    /**
     * Register a callback for a state change
     * @param {string} state - The state to listen for
     * @param {Function} callback - The function to call when the state changes
     */
    onStateChange(state, callback) {
        if (!this.onStateChangeCallbacks[state]) {
            this.onStateChangeCallbacks[state] = [];
        }
        
        this.onStateChangeCallbacks[state].push(callback);
    }
    
    /**
     * Return to the previous state
     */
    returnToPreviousState() {
        if (this.previousState) {
            this.changeState(this.previousState);
        }
    }
    
    /**
     * Check if the game is in a specific state
     * @param {string} state - The state to check
     * @returns {boolean} - Whether the game is in the specified state
     */
    isInState(state) {
        return this.currentState === state;
    }
} 