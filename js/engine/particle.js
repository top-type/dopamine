/**
 * ParticleSystem - Manages particle effects in the game
 */
export class ParticleSystem {
    constructor() {
        this.particles = [];
        console.log('Particle system initialized');
    }
    
    /**
     * Update all particles
     */
    update(deltaTime) {
        // Update each particle and remove expired ones
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update particle
            particle.life -= deltaTime;
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.size *= particle.shrink;
            particle.alpha = (particle.life / particle.maxLife) * particle.startAlpha;
            
            // Remove expired particles
            if (particle.life <= 0 || particle.size <= 0.1) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    /**
     * Render all particles
     */
    render(ctx) {
        for (const particle of this.particles) {
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Reset alpha
        ctx.globalAlpha = 1;
    }
    
    /**
     * Create an explosion effect
     */
    createExplosion(x, y, color, count = 20, size = 3, speed = 100) {
        for (let i = 0; i < count; i++) {
            // Random direction
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * speed;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: Math.random() * size + 1,
                color: color,
                life: Math.random() * 0.5 + 0.5, // 0.5 to 1 second
                maxLife: 1,
                shrink: 0.95,
                startAlpha: 1,
                alpha: 1
            });
        }
    }
    
    /**
     * Create a thruster effect
     */
    createThruster(x, y, direction, color) {
        // Direction should be in radians, pointing away from the ship
        const spread = Math.PI / 6; // 30 degree spread
        
        for (let i = 0; i < 2; i++) {
            // Random angle within spread
            const angle = direction + (Math.random() * spread - spread / 2);
            const velocity = Math.random() * 50 + 50;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: Math.random() * 2 + 1,
                color: color,
                life: Math.random() * 0.2 + 0.1, // 0.1 to 0.3 seconds
                maxLife: 0.3,
                shrink: 0.9,
                startAlpha: 0.7,
                alpha: 0.7
            });
        }
    }
    
    /**
     * Create a shield impact effect
     */
    createShieldImpact(x, y, angle) {
        const colors = ['#00ffff', '#0088ff', '#0044ff'];
        
        for (let i = 0; i < 15; i++) {
            // Particles mostly in the direction of the impact
            const particleAngle = angle + (Math.random() * Math.PI / 2 - Math.PI / 4);
            const velocity = Math.random() * 100 + 50;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(particleAngle) * velocity,
                vy: Math.sin(particleAngle) * velocity,
                size: Math.random() * 3 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: Math.random() * 0.3 + 0.2, // 0.2 to 0.5 seconds
                maxLife: 0.5,
                shrink: 0.95,
                startAlpha: 0.8,
                alpha: 0.8
            });
        }
    }
    
    /**
     * Create a weapon fire effect
     */
    createWeaponFire(x, y, angle, color) {
        const count = 5;
        const spread = Math.PI / 8; // 22.5 degree spread
        
        for (let i = 0; i < count; i++) {
            // Random angle within spread
            const particleAngle = angle + (Math.random() * spread - spread / 2);
            const velocity = Math.random() * 30 + 20;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(particleAngle) * velocity,
                vy: Math.sin(particleAngle) * velocity,
                size: Math.random() * 2 + 1,
                color: color,
                life: Math.random() * 0.2 + 0.1, // 0.1 to 0.3 seconds
                maxLife: 0.3,
                shrink: 0.9,
                startAlpha: 0.7,
                alpha: 0.7
            });
        }
    }
    
    /**
     * Create a trail effect
     */
    createTrail(x, y, color, size = 2) {
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            size: size,
            color: color,
            life: Math.random() * 0.3 + 0.2, // 0.2 to 0.5 seconds
            maxLife: 0.5,
            shrink: 0.95,
            startAlpha: 0.5,
            alpha: 0.5
        });
    }
    
    /**
     * Create a star effect (for background)
     */
    createStarEffect(x, y, color = '#ffffff') {
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            size: Math.random() * 1 + 0.5,
            color: color,
            life: Math.random() * 1 + 1, // 1 to 2 seconds
            maxLife: 2,
            shrink: 1, // Don't shrink
            startAlpha: 0.8,
            alpha: 0.8
        });
    }
    
    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
    }
    
    /**
     * Reset the particle system
     */
    reset() {
        console.log('Resetting particle system');
        
        // Clear all particles
        this.particles = [];
        
        console.log('Particle system reset');
    }
} 