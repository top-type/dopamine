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

## Refactoring Changes

The codebase has been refactored with the following improvements:

1. **ES Modules**: Converted from global classes to ES modules for better encapsulation and dependency management.

2. **Configuration System**: Created a centralized configuration system to manage game settings.

3. **State Management**: Implemented a dedicated state manager to handle game state transitions.

4. **CSS Modularization**: Split the CSS into modular files for better organization.

5. **Utility Functions**: Created a utility module for common helper functions.

6. **Event Handling**: Centralized event handling in the Game class.

7. **Code Documentation**: Improved code documentation with JSDoc comments.

## Development

To run the game locally, simply open the `index.html` file in a modern web browser that supports ES modules.

## Browser Compatibility

The game requires a modern browser that supports:
- ES Modules
- Canvas API
- Web Audio API
- Local Storage API 