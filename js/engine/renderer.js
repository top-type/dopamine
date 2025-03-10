/**
 * Renderer - Handles rendering the game to the canvas
 */
class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Background layers for parallax effect
        this.backgroundLayers = [];
        this.initializeBackgroundLayers();
        
        // Star field
        this.stars = [];
        this.initializeStars();
        
        console.log('Renderer initialized');
    }
    
    /**
     * Update canvas dimensions
     */
    updateDimensions(width, height) {
        this.width = width;
        this.height = height;
        
        // Reinitialize stars for new dimensions
        this.initializeStars();
    }
    
    /**
     * Initialize background layers for parallax effect
     */
    initializeBackgroundLayers() {
        // Create different space background layers
        this.backgroundLayers = [
            { speed: 0.1, color: '#000000' },  // Deep space (slowest)
            { speed: 0.2, color: '#0a0a20' },  // Distant nebula
            { speed: 0.3, color: '#0f0f30' }   // Closer nebula
        ];
    }
    
    /**
     * Initialize star field
     */
    initializeStars() {
        this.stars = [];
        
        // Create stars with different sizes and speeds
        const numStars = Math.floor(this.width * this.height / 2000); // Adjust density as needed
        
        for (let i = 0; i < numStars; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 30 + 10,
                brightness: Math.random() * 0.8 + 0.2
            });
        }
    }
    
    /**
     * Render the background with parallax effect
     */
    renderBackground(depth) {
        // Clear the canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Render background layers with parallax effect
        for (const layer of this.backgroundLayers) {
            // Calculate offset based on depth and layer speed
            const offset = (depth * layer.speed) % this.height;
            
            // Draw the layer
            this.ctx.fillStyle = layer.color;
            this.ctx.globalAlpha = 0.3; // Semi-transparent
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // Reset alpha
        this.ctx.globalAlpha = 1;
        
        // Render stars with parallax effect
        this.renderStars(depth);
        
        // Render environment based on depth
        this.renderEnvironment(depth);
    }
    
    /**
     * Render the star field with parallax effect
     */
    renderStars(depth) {
        for (const star of this.stars) {
            // Update star position based on depth
            const y = (star.y + depth * star.speed) % this.height;
            
            // Draw the star
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    /**
     * Render environment elements based on depth
     */
    renderEnvironment(depth) {
        // Different space regions based on depth
        const region = Math.floor(depth / 1000) % 5;
        
        switch (region) {
            case 0: // Normal space
                // No special environment
                break;
                
            case 1: // Asteroid field
                this.renderAsteroidField(depth);
                break;
                
            case 2: // Nebula
                this.renderNebula(depth);
                break;
                
            case 3: // Dust cloud
                this.renderDustCloud(depth);
                break;
                
            case 4: // Solar system
                this.renderSolarSystem(depth);
                break;
        }
    }
    
    /**
     * Render asteroid field environment
     */
    renderAsteroidField(depth) {
        // TODO: Implement asteroid field rendering
        // This will be a visual effect only, actual obstacles will be handled by the game logic
    }
    
    /**
     * Render nebula environment
     */
    renderNebula(depth) {
        // Create a colorful nebula effect
        const regionProgress = (depth % 1000) / 1000;
        
        // Nebula colors based on progress through the region
        const colors = [
            `rgba(50, 0, 80, ${0.1 + regionProgress * 0.1})`,
            `rgba(80, 0, 120, ${0.05 + regionProgress * 0.1})`,
            `rgba(120, 20, 150, ${0.05 + regionProgress * 0.05})`
        ];
        
        // Draw nebula clouds
        for (let i = 0; i < colors.length; i++) {
            this.ctx.fillStyle = colors[i];
            
            // Create cloud-like shapes
            for (let j = 0; j < 3; j++) {
                const x = (depth * 0.1 * (i + 1) + j * 500) % this.width;
                const y = (j * this.height / 3 + i * 100) % this.height;
                const size = this.width * 0.5 + i * 100;
                
                this.ctx.beginPath();
                this.ctx.ellipse(x, y, size, size * 0.6, 0, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    /**
     * Render dust cloud environment
     */
    renderDustCloud(depth) {
        // TODO: Implement dust cloud rendering
    }
    
    /**
     * Render solar system environment
     */
    renderSolarSystem(depth) {
        // TODO: Implement solar system rendering with a distant sun and planets
    }
    
    /**
     * Draw a sprite at the specified position
     */
    drawSprite(sprite, x, y, width, height, rotation = 0) {
        this.ctx.save();
        
        // Translate to the center of the sprite
        this.ctx.translate(x, y);
        
        // Rotate if needed
        if (rotation !== 0) {
            this.ctx.rotate(rotation);
        }
        
        // Draw the sprite centered
        this.ctx.drawImage(sprite, -width / 2, -height / 2, width, height);
        
        this.ctx.restore();
    }
    
    /**
     * Draw a circle
     */
    drawCircle(x, y, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * Draw a rectangle
     */
    drawRect(x, y, width, height, color, rotation = 0) {
        this.ctx.save();
        
        // Translate to the center of the rectangle
        this.ctx.translate(x, y);
        
        // Rotate if needed
        if (rotation !== 0) {
            this.ctx.rotate(rotation);
        }
        
        // Draw the rectangle centered
        this.ctx.fillStyle = color;
        this.ctx.fillRect(-width / 2, -height / 2, width, height);
        
        this.ctx.restore();
    }
    
    /**
     * Draw text
     */
    drawText(text, x, y, color, fontSize, align = 'center') {
        this.ctx.fillStyle = color;
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, x, y);
    }
    
    /**
     * Draw a health/shield bar
     */
    drawBar(x, y, width, height, fillPercent, fillColor, borderColor) {
        // Draw border
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // Draw fill
        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(x, y, width * fillPercent, height);
    }
} 