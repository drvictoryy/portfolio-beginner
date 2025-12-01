// Canvas and Animation Setup
const canvas = document.getElementById('electricityCanvas');
const ctx = canvas.getContext('2d');
const boySprite = document.getElementById('boySprite');
const easterEggPrompt = document.getElementById('easterEggPrompt');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Power line coordinates (approximated based on typical Iron Giant scene)
// These will create electricity arcs along the power lines
const powerLines = [
    // Left tower to center
    { x1: 0.15, y1: 0.35, x2: 0.4, y2: 0.28 },
    { x1: 0.15, y1: 0.38, x2: 0.4, y2: 0.31 },
    // Center to right tower
    { x1: 0.4, y1: 0.28, x2: 0.75, y2: 0.32 },
    { x1: 0.4, y1: 0.31, x2: 0.75, y2: 0.35 },
    // Giant's connections
    { x1: 0.55, y1: 0.25, x2: 0.62, y2: 0.45 },
    { x1: 0.65, y1: 0.3, x2: 0.72, y2: 0.5 }
];

// Convert relative coordinates to absolute
function getAbsoluteCoords(line) {
    return {
        x1: line.x1 * canvas.width,
        y1: line.y1 * canvas.height,
        x2: line.x2 * canvas.width,
        y2: line.y2 * canvas.height
    };
}

// Draw electricity arc with lightning effect
function drawElectricArc(start, end, intensity = 1, segments = 8) {
    const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const displacement = distance / segments;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);

    let currentX = start.x;
    let currentY = start.y;

    for (let i = 0; i < segments; i++) {
        const progressX = Math.cos(angle) * displacement;
        const progressY = Math.sin(angle) * displacement;

        // Add random perpendicular offset for lightning effect
        const perpAngle = angle + Math.PI / 2;
        const offset = (Math.random() - 0.5) * displacement * 0.8 * intensity;

        currentX += progressX + Math.cos(perpAngle) * offset;
        currentY += progressY + Math.sin(perpAngle) * offset;

        ctx.lineTo(currentX, currentY);
    }

    ctx.lineTo(end.x, end.y);

    // Style the arc
    const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
    gradient.addColorStop(0, `rgba(255, 140, 66, ${0.8 * intensity})`);
    gradient.addColorStop(0.5, `rgba(255, 180, 100, ${1 * intensity})`);
    gradient.addColorStop(1, `rgba(255, 140, 66, ${0.8 * intensity})`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2 + (intensity * 2);
    ctx.shadowBlur = 15 * intensity;
    ctx.shadowColor = '#ff8c42';
    ctx.stroke();
}

// Draw glow effect at connection points
function drawGlow(x, y, intensity = 1) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30 * intensity);
    gradient.addColorStop(0, `rgba(255, 140, 66, ${0.8 * intensity})`);
    gradient.addColorStop(0.5, `rgba(255, 140, 66, ${0.3 * intensity})`);
    gradient.addColorStop(1, 'rgba(255, 140, 66, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 30 * intensity, 0, Math.PI * 2);
    ctx.fill();
}

// Initial surge animation (2-3 seconds)
function initialSurge() {
    const duration = 2500;
    const startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Create pulsing effect
            const pulseIntensity = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;
            const fadeOut = 1 - (progress * 0.3); // Gradually reduce intensity

            powerLines.forEach(line => {
                const coords = getAbsoluteCoords(line);
                drawElectricArc(
                    { x: coords.x1, y: coords.y1 },
                    { x: coords.x2, y: coords.y2 },
                    pulseIntensity * fadeOut,
                    10
                );

                // Add glows at endpoints
                drawGlow(coords.x1, coords.y1, pulseIntensity * fadeOut * 0.7);
                drawGlow(coords.x2, coords.y2, pulseIntensity * fadeOut * 0.7);
            });

            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            startRecurringPulse();
        }
    }

    animate();
}

// Recurring pulse every 3-4 seconds
function startRecurringPulse() {
    setInterval(() => {
        const duration = 800;
        const startTime = Date.now();

        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress < 1) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Subtle pulse
                const pulseIntensity = Math.sin(progress * Math.PI) * 0.4;

                powerLines.forEach(line => {
                    const coords = getAbsoluteCoords(line);
                    drawElectricArc(
                        { x: coords.x1, y: coords.y1 },
                        { x: coords.x2, y: coords.y2 },
                        pulseIntensity,
                        6
                    );
                });

                requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        animate();
    }, 3500 + Math.random() * 1000); // Random between 3.5-4.5 seconds
}

// Start initial animation on page load
window.addEventListener('load', () => {
    setTimeout(initialSurge, 500);
});

// Easter Egg Mechanic
let boyPosition = { x: 50, y: 80 };
let isWalking = false;
let hasReachedStation = false;
let walkProgress = 0;

const startPosition = { x: 50, y: 80, scale: 1 };
const endPosition = { x: window.innerWidth - 250, y: 120, scale: 0.6 };
const walkDuration = 5000; // 5 seconds

// Keyboard state
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;

    // Handle Easter egg
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        if (!isWalking && !hasReachedStation) {
            startWalking();
        }
    }

    if ((e.key.toLowerCase() === 'e') && hasReachedStation) {
        triggerUnlock();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;

    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        if (isWalking && !hasReachedStation) {
            pauseWalking();
        }
    }
});

// Walking animation
let walkStartTime = null;
let pausedProgress = 0;

function startWalking() {
    if (!isWalking) {
        isWalking = true;
        walkStartTime = Date.now() - (pausedProgress * walkDuration);
        animateWalk();
    }
}

function pauseWalking() {
    isWalking = false;
    pausedProgress = walkProgress;
}

function animateWalk() {
    if (!isWalking) return;

    const elapsed = Date.now() - walkStartTime;
    walkProgress = Math.min(elapsed / walkDuration, 1);

    // Ease-in-out interpolation
    const easeProgress = walkProgress < 0.5
        ? 2 * walkProgress * walkProgress
        : 1 - Math.pow(-2 * walkProgress + 2, 2) / 2;

    // Update position
    boyPosition.x = startPosition.x + (endPosition.x - startPosition.x) * easeProgress;
    boyPosition.y = startPosition.y + (endPosition.y - startPosition.y) * easeProgress;
    const scale = startPosition.scale + (endPosition.scale - startPosition.scale) * easeProgress;

    // Apply to sprite
    boySprite.style.left = `${boyPosition.x}px`;
    boySprite.style.bottom = `${boyPosition.y}px`;
    boySprite.style.transform = `scale(${scale})`;

    // Check if reached the power station
    if (walkProgress >= 1) {
        isWalking = false;
        hasReachedStation = true;
        showEasterEggPrompt();
    } else {
        requestAnimationFrame(animateWalk);
    }
}

function showEasterEggPrompt() {
    easterEggPrompt.classList.add('visible');
}

function triggerUnlock() {
    // Hide prompt
    easterEggPrompt.classList.remove('visible');

    // Trigger dramatic power down sequence
    powerDownSequence();
}

function powerDownSequence() {
    const duration = 3000;
    const startTime = Date.now();

    // Create intense electricity effect
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Intense flickering
            const flicker = Math.random();
            const intensity = flicker > 0.3 ? (1 - progress) : 0;

            powerLines.forEach(line => {
                const coords = getAbsoluteCoords(line);
                if (Math.random() > 0.2) {
                    drawElectricArc(
                        { x: coords.x1, y: coords.y1 },
                        { x: coords.x2, y: coords.y2 },
                        intensity * (0.5 + Math.random() * 0.5),
                        12
                    );
                }

                drawGlow(coords.x1, coords.y1, intensity);
                drawGlow(coords.x2, coords.y2, intensity);
            });

            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Show unlock message
            showUnlockMessage();
        }
    }

    animate();
}

function showUnlockMessage() {
    // Create unlock overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background-color: rgba(10, 22, 40, 0.95);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        animation: fadeIn 0.5s ease;
    `;

    const message = document.createElement('div');
    message.style.cssText = `
        font-size: 3rem;
        color: #ff8c42;
        font-weight: 700;
        text-align: center;
        margin-bottom: 2rem;
        text-shadow: 0 0 20px rgba(255, 140, 66, 0.5);
    `;
    message.textContent = '⚡ POWER DOWN INITIATED ⚡';

    const subMessage = document.createElement('div');
    subMessage.style.cssText = `
        font-size: 1.5rem;
        color: #e0e0e0;
        text-align: center;
        max-width: 600px;
        line-height: 1.6;
    `;
    subMessage.innerHTML = `
        <p>You found the secret path.</p>
        <p style="margin-top: 1rem; font-style: italic; color: rgba(255, 140, 66, 0.8);">
            Sometimes the most interesting discoveries come from exploring the unexpected.
        </p>
        <p style="margin-top: 2rem; font-size: 1rem;">
            This is where your custom unlock sequence will go...
        </p>
    `;

    const closeButton = document.createElement('button');
    closeButton.style.cssText = `
        margin-top: 3rem;
        padding: 1rem 2rem;
        background-color: #ff8c42;
        color: #0a1628;
        border: none;
        border-radius: 8px;
        font-size: 1.2rem;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s ease;
    `;
    closeButton.textContent = 'Continue Exploring';
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.transform = 'scale(1.05)';
    });
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.transform = 'scale(1)';
    });
    closeButton.addEventListener('click', () => {
        overlay.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => overlay.remove(), 500);
    });

    overlay.appendChild(message);
    overlay.appendChild(subMessage);
    overlay.appendChild(closeButton);
    document.body.appendChild(overlay);
}

// Responsive updates
window.addEventListener('resize', () => {
    endPosition.x = window.innerWidth - 250;
    resizeCanvas();
});

// Debug mode (optional - remove in production)
// console.log('Easter egg hint: Try holding the RIGHT ARROW key... 👀');
