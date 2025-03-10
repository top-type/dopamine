/**
 * CollisionSystem - Handles collision detection between game objects
 */
export class CollisionSystem {
    constructor() {
        console.log('Collision system initialized');
    }
    
    /**
     * Check for collisions between all relevant game objects
     */
    checkCollisions(game) {
        // Check player-enemy collisions
        if (game.player && !game.player.isInvulnerable) {
            for (const enemy of game.entities) {
                if (enemy.type === 'enemy' && this.checkCircleCollision(game.player, enemy)) {
                    // Handle player-enemy collision
                    game.combatSystem.handleCollision(game.player, enemy);
                }
            }
        }
        
        // Check player-item collisions
        if (game.player) {
            for (const entity of game.entities) {
                if (entity.type === 'item' && this.checkCircleCollision(game.player, entity)) {
                    // Collect the item
                    entity.collect();
                }
            }
        }
        
        // Check projectile-entity collisions
        for (const projectile of game.projectiles) {
            // Skip projectiles that have already hit something
            if (projectile.shouldRemove) continue;
            
            // Check collision with player (only enemy projectiles)
            if (game.player && !game.player.isInvulnerable && projectile.source === 'enemy') {
                if (this.checkCircleCollision(projectile, game.player)) {
                    // Handle projectile-player collision
                    game.combatSystem.handleProjectileHit(projectile, game.player);
                    projectile.shouldRemove = true;
                    continue;
                }
            }
            
            // Check collision with enemies (only player projectiles)
            if (projectile.source === 'player') {
                for (const enemy of game.entities) {
                    if (enemy.type === 'enemy' && this.checkCircleCollision(projectile, enemy)) {
                        // Handle projectile-enemy collision
                        game.combatSystem.handleProjectileHit(projectile, enemy);
                        projectile.shouldRemove = true;
                        break;
                    }
                }
            }
        }
    }
    
    /**
     * Check for collision between two circle-based objects
     */
    checkCircleCollision(obj1, obj2) {
        // Calculate distance between centers
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if distance is less than sum of radii
        return distance < obj1.radius + obj2.radius;
    }
    
    /**
     * Check for collision between two rectangle-based objects
     */
    checkRectCollision(obj1, obj2) {
        return (
            obj1.x - obj1.width / 2 < obj2.x + obj2.width / 2 &&
            obj1.x + obj1.width / 2 > obj2.x - obj2.width / 2 &&
            obj1.y - obj1.height / 2 < obj2.y + obj2.height / 2 &&
            obj1.y + obj1.height / 2 > obj2.y - obj2.height / 2
        );
    }
    
    /**
     * Check if an object is within the game bounds
     */
    isInBounds(obj, game) {
        const margin = 50; // Allow objects to go slightly off-screen
        
        return (
            obj.x + obj.radius > -margin &&
            obj.x - obj.radius < game.canvas.width + margin &&
            obj.y + obj.radius > -margin &&
            obj.y - obj.radius < game.canvas.height + margin
        );
    }
} 