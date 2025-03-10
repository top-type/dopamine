/**
 * InputHandler - Manages keyboard input for the game
 */
export class InputHandler {
    constructor() {
        // Key states
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            primary: false,
            special1: false,
            special2: false,
            '1': false,
            '2': false,
            '3': false,
            '4': false,
            '5': false
        };
        
        // Key mappings
        this.keyMap = {
            'w': 'up',
            'ArrowUp': 'up',
            's': 'down',
            'ArrowDown': 'down',
            'a': 'left',
            'ArrowLeft': 'left',
            'd': 'right',
            'ArrowRight': 'right',
            ' ': 'primary',    // Space bar for primary weapon
            'q': 'special1',   // Q for special ability 1
            'e': 'special2',   // E for special ability 2
            '1': '1',          // Number keys for abilities
            '2': '2',
            '3': '3',
            '4': '4',
            '5': '5'
        };
        
        // Track keys that were just pressed this frame
        this.keysPressed = {};
        
        // Set up event listeners
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        console.log('Input handler initialized');
    }
    
    /**
     * Handle key down events
     */
    handleKeyDown(event) {
        // Prevent default behavior for game keys
        if (this.keyMap[event.key] !== undefined) {
            event.preventDefault();
        }
        
        // Update key state
        const action = this.keyMap[event.key];
        if (action) {
            // If key wasn't already down, mark it as just pressed
            if (!this.keys[action]) {
                this.keysPressed[action] = true;
            }
            this.keys[action] = true;
        }
    }
    
    /**
     * Handle key up events
     */
    handleKeyUp(event) {
        // Update key state
        const action = this.keyMap[event.key];
        if (action) {
            this.keys[action] = false;
        }
    }
    
    /**
     * Check if a key is currently pressed
     */
    isKeyDown(key) {
        return this.keys[key] === true;
    }
    
    /**
     * Check if a key was just pressed this frame
     * This is used for actions that should only happen once per key press
     */
    isKeyPressed(key) {
        return this.keysPressed[key] === true;
    }
    
    /**
     * Clear the keys pressed this frame
     * This should be called at the end of each update cycle
     */
    clearKeysPressed() {
        this.keysPressed = {};
    }
    
    /**
     * Get the movement direction vector based on current key states
     * Returns normalized vector for consistent movement speed in all directions
     */
    getMovementDirection() {
        let dx = 0;
        let dy = 0;
        
        // Calculate direction based on keys
        if (this.keys.up) dy -= 1;
        if (this.keys.down) dy += 1;
        if (this.keys.left) dx -= 1;
        if (this.keys.right) dx += 1;
        
        // Normalize the vector for consistent speed in all directions
        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }
        
        return { x: dx, y: dy };
    }
} 