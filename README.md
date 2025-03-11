# Dopamine - Space Shooter RPG

A browser-based space shooter game with RPG elements.

## Project Structure

The project has been refactored to use a modular architecture with ES modules:

```
dopamine/
├── css/
│   ├── style.css       # Main CSS file that imports all other CSS files
│   ├── base.css        # Base styling for the game
│   ├── ui.css          # UI-specific styling
│   └── menu.css        # Menu-specific styling
├── js/
│   ├── config/
│   │   └── game-config.js  # Centralized game configuration
│   ├── data/
│   │   ├── enemies.js      # Enemy data definitions
│   │   ├── items.js        # Item data definitions
│   │   └── skills.js       # Skill data definitions
│   ├── engine/
│   │   ├── audio.js        # Audio system
│   │   ├── collision.js    # Collision detection system
│   │   ├── game.js         # Main game engine
│   │   ├── input.js        # Input handling
│   │   ├── particle.js     # Particle system
│   │   ├── renderer.js     # Rendering system
│   │   ├── save.js         # Save/load system
│   │   └── state-manager.js # Game state management
│   ├── objects/
│   │   ├── effect.js       # Visual effects
│   │   ├── enemy.js        # Enemy entities
│   │   ├── entity.js       # Base entity class
│   │   ├── item.js         # Item entities
│   │   ├── player.js       # Player entity
│   │   └── projectile.js   # Projectile entities
│   ├── systems/
│   │   ├── combat.js       # Combat mechanics
│   │   ├── equipment.js    # Equipment management
│   │   ├── progression.js  # Level progression
│   │   ├── specialization.js # Character specializations
│   │   └── ui.js           # UI management
│   ├── utils/
│   │   └── helpers.js      # Utility functions
│   └── main.js             # Main entry point
└── index.html              # Main HTML file
```

## Recent Improvements

The codebase has been optimized with the following changes:

1. **Removed Debug Logging**: Eliminated unnecessary console.log statements that were slowing down the game.

2. **Fixed Multi-Shot Skill**: Improved the implementation of the multi-shot skill to ensure consistent behavior.

3. **Enhanced Critical Hit Logic**: Fixed critical strike logic in projectile firing.

4. **Improved Server Performance**: Enhanced the Python server for better MIME type handling and error reporting.

5. **DOM Element Handling**: Implemented a helper function to ensure UI elements exist when needed.

6. **HTML Optimization**: Added preloading directives and improved meta tags.

7. **Fixed Race Conditions**: Corrected issues with loading UI components.

## Development

### Running the Game Locally

To run the game, use the included Python server:

```bash
python server.py
```

This will start a server at http://localhost:8000 and automatically open the game in your default browser.

### System Requirements

The game requires a modern browser that supports:
- ES Modules
- Canvas API
- Web Audio API
- Local Storage API

### Controls

- **WASD or Arrow Keys**: Movement
- **Space**: Fire primary weapon
- **1-5**: Special abilities (when unlocked)
- **ESC**: Open/close menu

## Character Specializations

The game features multiple character specializations:

1. **Gunner**: Focused on weapons and offensive capabilities
   - Multi Shot: Fire additional projectiles
   - Precision Targeting: Increased damage
   - Critical Strike: Chance for double damage

2. **Juggernaut**: Defensive capabilities and shield enhancements
   - Shield Surge: Temporarily increases shield capacity
   - Reinforced Hull: Increases shield capacity
   - Ramming Speed: Increases collision damage

Other specializations include Chronos, Amplifier, and Mechanic, each with unique abilities.

## Future Development

Planned features include:
- Additional enemy types
- Boss battles
- More specializations and skills
- Enhanced shop functionality
- Achievements system
- Multiplayer mode 