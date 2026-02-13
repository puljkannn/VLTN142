// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    questionText: "Luco Lukic Otona Ivekovica 66 31400 Đakovo \n broj osobne iskaznice 117246302,\n budi \"my valentine\"?",
    yesText: "DA",
    noText: "NE",
    imagePath: "./assets/center.jpg",
    particleRate: 200,
    maxParticles: 50,
    soundDefaultOn: false,
    introAudioPath: "./assets/intromusic.mp3",
    audioPath: "./assets/romantic.mp3",
    audioVolume: 0.4,
    confettiCount: 80,
    confettiDurationMs: 800,
    triggerDistance: 120,
    escapeRadius: 160,
    padding: 12,
    maxEscapeAttempts: 8
};

// ============================================
// STATE
// ============================================
const state = {
    soundEnabled: CONFIG.soundDefaultOn,
    introAudio: null,
    audio: null,
    particlesInterval: null,
    particleCount: 0,
    confettiAnimationId: null,
    confettiParticles: [],
    noButtonPositioned: false,
    introStarted: false
};

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    soundToggle: null,
    soundIcon: null,
    screen1: null,
    screen2: null,
    questionText: null,
    yesBtn: null,
    noBtn: null,
    confettiCanvas: null,
    particlesContainer: null,
    centerImage: null
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
    // Get DOM elements
    elements.soundToggle = document.getElementById('soundToggle');
    elements.soundIcon = document.getElementById('soundIcon');
    elements.screen1 = document.getElementById('screen1');
    elements.screen2 = document.getElementById('screen2');
    elements.questionText = document.getElementById('questionText');
    elements.yesBtn = document.getElementById('yesBtn');
    elements.noBtn = document.getElementById('noBtn');
    elements.confettiCanvas = document.getElementById('confettiCanvas');
    elements.particlesContainer = document.getElementById('particlesContainer');
    elements.centerImage = document.getElementById('centerImage');

    // Set text content
    elements.questionText.textContent = CONFIG.questionText;
    elements.yesBtn.textContent = CONFIG.yesText;
    elements.noBtn.textContent = CONFIG.noText;

    // Setup confetti canvas
    setupConfettiCanvas();

    // Setup event listeners
    setupEventListeners();

    // Update sound icon
    updateSoundIcon();

    // Load audio (but don't play)
    loadAudio();
}

// ============================================
// SOUND FUNCTIONALITY
// ============================================
function loadAudio() {
    try {
        state.introAudio = new Audio(CONFIG.introAudioPath);
        state.introAudio.volume = CONFIG.audioVolume;
        state.introAudio.loop = true;
    } catch (error) {
        console.warn('Failed to load intro audio:', error.message);
    }

    try {
        state.audio = new Audio(CONFIG.audioPath);
        state.audio.volume = CONFIG.audioVolume;
        state.audio.loop = true;
    } catch (error) {
        console.warn('Failed to load audio:', error.message);
    }
}

function playIntroAudio() {
    if (!state.soundEnabled || !state.introAudio || state.introStarted) return;
    
    try {
        state.introAudio.play().then(() => {
            state.introStarted = true;
        }).catch(error => {
            console.warn('Intro audio play failed:', error.message);
        });
    } catch (error) {
        console.warn('Intro audio play error:', error.message);
    }
}

function stopIntroAudio() {
    if (!state.introAudio) return;
    
    try {
        state.introAudio.pause();
        state.introAudio.currentTime = 0;
    } catch (error) {
        console.warn('Intro audio stop error:', error.message);
    }
}

function playRomanticAudio() {
    if (!state.soundEnabled || !state.audio) return;
    
    try {
        state.audio.play().catch(error => {
            console.warn('Romantic audio play failed:', error.message);
        });
    } catch (error) {
        console.warn('Romantic audio play error:', error.message);
    }
}

function stopAudio() {
    if (!state.audio) return;
    
    try {
        state.audio.pause();
        state.audio.currentTime = 0;
    } catch (error) {
        console.warn('Audio stop error:', error.message);
    }
}

function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    updateSoundIcon();
    
    // If sound is enabled and intro hasn't started, try to play intro
    if (state.soundEnabled && !state.introStarted) {
        playIntroAudio();
    }
}

function updateSoundIcon() {
    elements.soundIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
}

// ============================================
// NO BUTTON ESCAPE BEHAVIOR
// ============================================
function escapeFromPointer(pointerX, pointerY) {
    const btnRect = elements.noBtn.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;

    // Calculate distance from pointer to button center
    const dx = btnCenterX - pointerX;
    const dy = btnCenterY - pointerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Only escape if within trigger distance
    if (dist >= CONFIG.triggerDistance) return;

    // Calculate escape direction (away from pointer)
    let escapeX, escapeY;
    
    if (dist === 0) {
        // Pointer is exactly on center, pick random direction
        const angle = Math.random() * Math.PI * 2;
        escapeX = Math.cos(angle);
        escapeY = Math.sin(angle);
    } else {
        // Normalize direction away from pointer
        escapeX = dx / dist;
        escapeY = dy / dist;
    }

    // Try to find a valid position
    let newX, newY;
    let attempts = 0;
    let found = false;

    while (attempts < CONFIG.maxEscapeAttempts && !found) {
        // Calculate new position
        newX = pointerX + escapeX * CONFIG.escapeRadius - btnRect.width / 2;
        newY = pointerY + escapeY * CONFIG.escapeRadius - btnRect.height / 2;

        // Clamp to viewport with padding
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        newX = Math.max(CONFIG.padding, Math.min(newX, viewportWidth - btnRect.width - CONFIG.padding));
        newY = Math.max(CONFIG.padding, Math.min(newY, viewportHeight - btnRect.height - CONFIG.padding));

        // Check if new position is far enough from pointer
        const newCenterX = newX + btnRect.width / 2;
        const newCenterY = newY + btnRect.height / 2;
        const newDx = newCenterX - pointerX;
        const newDy = newCenterY - pointerY;
        const newDist = Math.sqrt(newDx * newDx + newDy * newDy);

        if (newDist >= CONFIG.escapeRadius * 0.8) {
            found = true;
        } else {
            // Rotate escape direction and try again
            const rotationAngle = (Math.PI / 4) + (Math.random() * 0.2 - 0.1);
            const cos = Math.cos(rotationAngle);
            const sin = Math.sin(rotationAngle);
            const tempX = escapeX * cos - escapeY * sin;
            const tempY = escapeX * sin + escapeY * cos;
            escapeX = tempX;
            escapeY = tempY;
        }

        attempts++;
    }

    // Apply new position
    elements.noBtn.style.position = 'fixed';
    elements.noBtn.style.left = newX + 'px';
    elements.noBtn.style.top = newY + 'px';
    elements.noButtonPositioned = true;
}

function handlePointerMove(e) {
    let pointerX, pointerY;
    
    if (e.touches && e.touches.length > 0) {
        pointerX = e.touches[0].clientX;
        pointerY = e.touches[0].clientY;
    } else {
        pointerX = e.clientX;
        pointerY = e.clientY;
    }
    
    escapeFromPointer(pointerX, pointerY);
}

function handleNoButtonPointerDown(e) {
    e.preventDefault();
    let pointerX, pointerY;
    
    if (e.touches && e.touches.length > 0) {
        pointerX = e.touches[0].clientX;
        pointerY = e.touches[0].clientY;
    } else {
        pointerX = e.clientX;
        pointerY = e.clientY;
    }
    
    escapeFromPointer(pointerX, pointerY);
}

// ============================================
// CONFETTI BURST
// ============================================
function setupConfettiCanvas() {
    const canvas = elements.confettiCanvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function triggerConfettiBurst() {
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');
    const btnRect = elements.yesBtn.getBoundingClientRect();
    const originX = btnRect.left + btnRect.width / 2;
    const originY = btnRect.top + btnRect.height / 2;

    // Confetti colors
    const colors = ['#ff6b6b', '#ee5a5a', '#ff8e8e', '#ffb3b3', '#d63384', '#e83e8c', '#ff69b4', '#ff1493'];

    // Create particles
    for (let i = 0; i < CONFIG.confettiCount; i++) {
        const angle = (Math.PI * 2 * i / CONFIG.confettiCount) + (Math.random() * 0.5 - 0.25);
        const speed = 3 + Math.random() * 5;
        const size = 4 + Math.random() * 8;

        state.confettiParticles.push({
            x: originX,
            y: originY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2 - Math.random() * 3,
            size: size,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.3,
            opacity: 1,
            gravity: 0.15,
            drag: 0.98
        });
    }

    // Animate
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        
        if (elapsed >= CONFIG.confettiDurationMs) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            state.confettiParticles = [];
            state.confettiAnimationId = null;
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        state.confettiParticles.forEach(p => {
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= p.drag;
            p.vy *= p.drag;
            p.rotation += p.rotationSpeed;

            // Fade out
            p.opacity = 1 - (elapsed / CONFIG.confettiDurationMs);

            // Draw particle
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });

        state.confettiAnimationId = requestAnimationFrame(animate);
    }

    animate();
}

// ============================================
// SCREEN TRANSITION
// ============================================
function transitionToScreen2() {
    // Stop intro audio and play romantic audio
    stopIntroAudio();
    playRomanticAudio();

    // Trigger confetti burst
    triggerConfettiBurst();

    // Wait a bit for confetti to be visible
    setTimeout(() => {
        // Hide screen 1
        elements.screen1.classList.add('hidden');

        // Show screen 2
        elements.screen2.classList.remove('hidden');

        // Start particle animation
        startParticleAnimation();
    }, 300);
}

// ============================================
// PARTICLE ANIMATION (Screen 2)
// ============================================
function createParticle() {
    if (state.particleCount >= CONFIG.maxParticles) return;

    const emojis = ['❤️', '🌷'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.textContent = emoji;
    
    // Random position
    const x = Math.random() * 100;
    particle.style.left = x + '%';
    particle.style.top = '-50px';
    
    // Random size
    const size = 20 + Math.random() * 20;
    particle.style.fontSize = size + 'px';
    
    // Random duration
    const duration = 4 + Math.random() * 4;
    particle.style.animationDuration = duration + 's';
    
    // Random delay
    const delay = Math.random() * 2;
    particle.style.animationDelay = delay + 's';
    
    // Add to container
    elements.particlesContainer.appendChild(particle);
    state.particleCount++;
    
    // Remove after animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
            state.particleCount--;
        }
    }, (duration + delay) * 1000);
}

function startParticleAnimation() {
    state.particlesInterval = setInterval(() => {
        createParticle();
    }, CONFIG.particleRate);
}

function stopParticleAnimation() {
    if (state.particlesInterval) {
        clearInterval(state.particlesInterval);
        state.particlesInterval = null;
    }
}

// ============================================
// IMAGE HANDLING
// ============================================
function handleImageError() {
    const card = elements.centerImage.parentElement;
    const fallback = document.createElement('div');
    fallback.className = 'fallback';
    fallback.innerHTML = '💕<br>Valentine<br>💕';
    card.appendChild(fallback);
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Sound toggle
    elements.soundToggle.addEventListener('click', toggleSound);

    // YES button click
    elements.yesBtn.addEventListener('click', transitionToScreen2);

    // NO button escape behavior
    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    elements.noBtn.addEventListener('pointerdown', handleNoButtonPointerDown);

    // Image error handling
    elements.centerImage.addEventListener('error', handleImageError);

    // Window resize - reset NO button position if it was moved
    window.addEventListener('resize', () => {
        if (state.noButtonPositioned) {
            elements.noBtn.style.position = '';
            elements.noBtn.style.left = '';
            elements.noBtn.style.top = '';
            state.noButtonPositioned = false;
        }
    });

    // Click anywhere to start intro music (user gesture required)
    document.addEventListener('click', function startIntroOnClick() {
        playIntroAudio();
        document.removeEventListener('click', startIntroOnClick);
    }, { once: true });
}

// ============================================
// START APP
// ============================================
document.addEventListener('DOMContentLoaded', init);
