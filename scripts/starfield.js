const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
const stars = [];
const starCount = 500;

// Resize canvas to fit the screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
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
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    for (let i = 0; i < stars.length; i++) {

        // update
        stars[i].z -= 1;
        if (stars[i].z <= 0) stars[i] = createStar()


        const star = stars[i];
        const k = canvas.width / (2 * star.z); // Scaling factor for depth

        const x = star.x * k + canvas.width / 2;
        const y = star.y * k + canvas.height / 2;

        ctx.beginPath();
        ctx.arc(x, y, star.size * k, 0, Math.PI * 2);
        var brightness = Math.floor(star.max_brightness * (1 - Math.max(100 - star.age, 0) / 100));
        ctx.fillStyle = rgbToHex(brightness, brightness, brightness);

        ctx.fill();
        
        star.age += 1;
    }
}

// Animation loop
function animate() {
    drawStars();
    requestAnimationFrame(animate);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
initializeStars();
animate();
