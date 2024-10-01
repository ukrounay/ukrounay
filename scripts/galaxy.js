// Setup the canvas for galaxy and stars
const canvas = document.getElementById('galaxy');
const ctx = canvas.getContext('2d');

// Noise generator
const simplex = new SimplexNoise();
let time = 0;

// Galaxy color noise canvas (static)
const colorNoiseCanvas = document.createElement('canvas');
const colorCtx = colorNoiseCanvas.getContext('2d');

// Tiling noise texture canvas
const noiseCanvas = document.createElement('canvas');
const noiseCtx = noiseCanvas.getContext('2d');
const tileSize = 1024;  // Size of the tiling noise texture (optimized for seamless tiling)

let noiseImageData;

// Stars setup
const stars = [];
const starCount = 500;

// Resize canvas to fit the screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Generate static galaxy-colored noise
    colorNoiseCanvas.width = canvas.width;
    colorNoiseCanvas.height = canvas.height;
    generateColorNoise();

    // Generate tiling noise once (seamless)
    noiseCanvas.width = tileSize;
    noiseCanvas.height = tileSize;
    generateSeamlessTilingNoise();

    // Cache the noise image data
    // noiseImageData = noiseCtx.getImageData(0, 0, tileSize, tileSize);

    // Resize stars canvas
    stars.length = 0; // Clear the star array
    initializeStars(); // Reinitialize stars
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Generate static galaxy color noise (done once)
function generateColorNoise() {
    const imgData = colorCtx.createImageData(canvas.width, canvas.height);

    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            const noiseValue = (simplex.noise2D(x / 400, y / 400) + 1) / 2;  // Static noise

            // Color mapping: Create deep space colors
            let r, g, b;
            // Create a color gradient resembling a galaxy gas cloud
            r = lerp(20, 80, noiseValue);  // Range for red
            g = lerp(10, 50, noiseValue);  // Range for green
            b = lerp(50, 200, noiseValue);  // Range for blue
            
            // Optional: Add some noise variation to colors for a more dynamic look
            const colorNoise = (simplex.noise2D(x / 600, y / 600) + 1) / 2; // Slightly smaller scale noise
            r += colorNoise * 20;  // Add some variation to red
            g += colorNoise * 10;  // Add some variation to green
            b += colorNoise * 10;  // Add some variation to blue

            // Clamp the values to [0, 255]
            r = Math.min(255, Math.max(0, r));
            g = Math.min(255, Math.max(0, g));
            b = Math.min(255, Math.max(0, b));

            const index = (x + y * canvas.width) * 4;
            imgData.data[index] = r;
            imgData.data[index + 1] = g;
            imgData.data[index + 2] = b;
            imgData.data[index + 3] = 255;  // Full opacity
        }
    }

    colorCtx.putImageData(imgData, 0, 0);
}

// Lerp function for smooth color transitions
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Generate seamless tiling noise with edge blending
function generateSeamlessTilingNoise() {
    const imgData = noiseCtx.createImageData(tileSize, tileSize);

    for (let x = 0; x < tileSize; x++) {
        for (let y = 0; y < tileSize; y++) {
            // Generate noise value
            let noiseValue = simplex.noise2D(x / 100, y / 100);  // 100 determines scale of the noise
            noiseValue = (noiseValue * 0.5 + 0.5);  // Map noise to [0, 1]

            // Edge fading factor (for smooth tiling)
            const fadeFactor = getEdgeFadeFactor(x, y, tileSize);

            // Adjust noise alpha for blending at edges
            const alpha = Math.floor(noiseValue * fadeFactor * 180);  // Adjust the alpha with fade

            const index = (x + y * tileSize) * 4;
            imgData.data[index] = 0;  // R (dark background)
            imgData.data[index + 1] = 0;  // G (dark background)
            imgData.data[index + 2] = 0;  // B (dark background)
            imgData.data[index + 3] = alpha;  // Alpha with edge fade
        }
    }

    noiseCtx.putImageData(imgData, 0, 0);
}

// Get the edge fade factor to smoothly blend the noise at the edges
function getEdgeFadeFactor(x, y, size) {
    const fadeDistance = size / 2;  // Distance from the edge where fading starts

    // Distance to nearest edge
    const distX = Math.min(x, size - x);
    const distY = Math.min(y, size - y);

    // Calculate fade factor based on distance to edge (linear falloff)
    const fadeX = Math.min(1, distX / fadeDistance);
    const fadeY = Math.min(1, distY / fadeDistance);

    return fadeX * fadeY;  // Combine both directions for corner fading
}

// Draw the noise by tiling it across the canvas and moving it
function drawTiledNoise(offsetX, offsetY) {
    // Calculate how many tiles are needed to cover the screen
    const tilesX = Math.ceil(canvas.width / tileSize) + 1;
    const tilesY = Math.ceil(canvas.height / tileSize) + 1;

    for (let x = -1; x < tilesX; x++) {
        for (let y = -1; y < tilesY; y++) {
            ctx.drawImage(noiseCanvas, (x * tileSize) + offsetX, (y * tileSize) + offsetY, tileSize * 2, tileSize * 2);  // Scale noise up by 2x
        }
    }
}

// Create a star with previous position tracking
function createStar() {
    const star = {
        age: 0,
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * 1000, // Depth for 3D effect
        size: Math.random() * 2,
        max_brightness: Math.floor(Math.random() * 100) + 100
    };
    star.prevX = star.x; // Initialize previous X position
    star.prevY = star.y; // Initialize previous Y position
    return star;
}

// Initialize the starfield
function initializeStars() {
    for (let i = 0; i < starCount; i++) {
        stars.push(createStar());
    }
}

// Draw stars and their trails
function drawStars() {
    for (let i = 0; i < stars.length; i++) {
        // update
        stars[i].z -= 3;
        if (stars[i].z <= 0) stars[i] = createStar()

        const star = stars[i];
        const k = canvas.width / (2 * star.z); // Scaling factor for depth

        const x = star.x * k + canvas.width / 2;
        const y = star.y * k + canvas.height / 2;

        ctx.beginPath();
        ctx.arc(x, y, star.size * k, 0, Math.PI * 2);
        var brightness = Math.floor(star.max_brightness * (1 - Math.max(100 - star.age, 0) / 100));
        ctx.fillStyle = "#ffffff" + componentToHex(brightness);

        ctx.fill();
        
        star.age += 1;
    }
}

// Animation loop
function animate() {
    time += 0.005;  // Adjust speed of the movement
    const offsetX = Math.sin(time) * 100;  // Move left/right
    const offsetY = Math.cos(time) * 100;  // Move up/down

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the static background color noise
    ctx.drawImage(colorNoiseCanvas, 0, 0, canvas.width, canvas.height);

    // Draw the moving noise
    drawTiledNoise(offsetX, offsetY);

    // Draw stars
    drawStars();

    requestAnimationFrame(animate);
}

// Start the animation
resizeCanvas();
initializeStars();
animate();

window.addEventListener('resize', resizeCanvas);
