
// Component state
let activeSidebars = {
    left: false,
    right: false
};

// Import sound utilities
import { playSound } from './sound-utils.js';

// Define settings specific styles
const settingsSpecificStyles = `
    @keyframes grid-pulse {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
    }

    @keyframes nodes-pulse {
        0% { opacity: 0.4; }
        50% { opacity: 0.8; }
        100% { opacity: 0.6; }
    }

    @keyframes glass-shine {
        0%, 100% { left: -100%; }
        50% { left: 100%; }
    }

    @keyframes pulse-glow {
        0%, 100% { transform: scale(1); opacity: 0.4; }
        50% { transform: scale(1.1); opacity: 0.6; }
    }

    @keyframes hologram-flicker {
        0%, 100% { opacity: 0.8; }
        50% { opacity: 0.75; }
        52% { opacity: 0.6; }
        54% { opacity: 0.8; }
        75% { opacity: 0.78; }
    }

    .glass-panel {
        background: rgba(9, 28, 46, 0.6);
        border: 1.5px solid rgba(0, 255, 247, 0.7);
        box-shadow: 0 0 32px 0 rgba(0, 255, 247, 0.2), 0 0 0 1.5px rgba(0, 255, 247, 0.13) inset;
        backdrop-filter: blur(20px) brightness(1.08) saturate(1.2);
        -webkit-backdrop-filter: blur(20px) brightness(1.08) saturate(1.2);
        border-radius: 1rem;
        position: relative;
        overflow: hidden;
    }

    .glass-panel::before {
        content: '';
        position: absolute;
        top: 0;
        left: -50%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.05) 50%,
            rgba(255, 255, 255, 0) 100%
        );
        transform: skewX(-15deg);
        pointer-events: none;
        animation: glass-shine 8s infinite ease-in-out;
    }
    
    /* Inner glass highlight */
    .glass-panel::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 40%;
        background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.08) 0%,
            rgba(255, 255, 255, 0) 100%
        );
        border-radius: 1rem 1rem 0 0;
        pointer-events: none;
    }

    .hologram-container {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        height: 100%;
        padding-bottom: 3%;
    }

    .hologram-base {
        width: 80%;
        height: 30px;
        background: radial-gradient(ellipse at center, rgba(0, 255, 255, 0.4) 0%, rgba(0, 255, 255, 0) 70%);
        border-radius: 50%;
        position: absolute;
        bottom: 0;
        animation: pulse-glow 3s infinite ease-in-out;
        z-index: 5;
    }

    .hologram-ambient {
        position: absolute;
        bottom: 15px;
        left: 50%;
        transform: translateX(-50%);
        width: 70%;
        height: 60%;
        pointer-events: none;
        z-index: 6;
        background: radial-gradient(ellipse at 50% 100%, 
            rgba(0,255,255,0.18) 0%, 
            rgba(0,255,255,0.12) 30%, 
            rgba(0,255,255,0.08) 60%, 
            rgba(0,255,255,0) 100%);
        filter: blur(12px) brightness(1.2) saturate(1.5);
        opacity: 0.85;
    }

    .hologram-image {
        opacity: 1;
        animation: hologram-flicker 5s infinite linear;
        max-height: 85%;
        position: relative;
        z-index: 10;
        display: inline-block;
        overflow: hidden;
    }

    .hologram-image img {
        display: block;
        width: 100%;
        height: auto;
        filter: brightness(1.2) contrast(1.1);
    }    .custom-select {
        appearance: none;
        -webkit-appearance: none;
        background-color: rgba(0, 20, 30, 0.55);
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2300ffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 0.5rem center;
        background-repeat: no-repeat;
        background-size: 1.5em 1.5em;
        backdrop-filter: blur(16px) saturate(180%);
        -webkit-backdrop-filter: blur(16px) saturate(180%);
        border: 1.5px solid #00fff7;
        color: #00fff7 !important;
        transition: all 0.3s ease;
        position: relative;
        cursor: pointer;
        box-shadow: 0 0 0 rgba(0, 255, 247, 0.4);
        font-family: monospace, sans-serif;
        letter-spacing: 1px;
        padding-right: 2.5rem;
    }

    /* Style for the dropdown options */
    .custom-select option {
        background: #061a23;
        color: #00fff7;
        padding: 10px;
        margin: 5px;
    }
    
    /* Animation for select on open/close */
    .custom-select:focus option:hover {
        background-color: rgba(0, 255, 247, 0.2);
    }

    /* Add dropdown opening animation */
    .select-opening {
        animation: select-open 0.3s forwards ease-out;
    }
    
    .select-closing {
        animation: select-close 0.2s forwards ease-in;
    }
    
    @keyframes select-open {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes select-close {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-5px); }
    }

    /* Dropdown hover and focus states */
    .custom-select:hover {
        background-color: rgba(0, 30, 40, 0.65);
        border-color: #4dffff;
        box-shadow: 0 0 12px rgba(0, 255, 247, 0.5);
        transform: translateY(-1px);
    }
    
    .custom-select:focus {
        outline: none;
        background-color: rgba(0, 35, 45, 0.75);
        border-color: #7fffff;
        box-shadow: 0 0 0 3px rgba(0, 255, 247, 0.3), 0 0 16px rgba(0, 255, 247, 0.5) inset;
        transform: translateY(-2px);
        animation: pulse-border 1.5s infinite ease-in-out;
    }

    /* Animated dropdown arrow */
    .custom-select:focus {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%237fffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    }

    /* Animation for the border glow */
    @keyframes pulse-border {
        0% { box-shadow: 0 0 0 3px rgba(0, 255, 247, 0.3), 0 0 16px rgba(0, 255, 247, 0.3) inset; }
        50% { box-shadow: 0 0 0 3px rgba(0, 255, 247, 0.6), 0 0 16px rgba(0, 255, 247, 0.6) inset; }
        100% { box-shadow: 0 0 0 3px rgba(0, 255, 247, 0.3), 0 0 16px rgba(0, 255, 247, 0.3) inset; }
    }

    .text-glow {
        color: #00fff7;
        text-shadow: 0 0 12px #00fff7, 0 0 32px #00fff799;
        letter-spacing: 2px;
    }

    .hologram-image::before,
    .hologram-image::after {
        content: '';
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: inherit;
        z-index: 2;
        pointer-events: none;
    }

    .hologram-image::before {
        background: url('/static/assets/images/genisys_bot-removebg.png');
        left: 2px;
        text-shadow: -2px 0 #0ff;
        mix-blend-mode: lighten;
        opacity: 0.7;
        animation: glitch-anim-1 2s infinite linear alternate-reverse;
    }

    .hologram-image::after {
        background: url('/static/assets/images/genisys_bot-removebg.png');
        left: -2px;
        text-shadow: -2px 0 #f0f;
        mix-blend-mode: lighten;
        opacity: 0.7;
        animation: glitch-anim-2 2s infinite linear alternate-reverse;
    }

    @keyframes glitch-anim-1 {
        0% { clip-path: inset(0 0 80% 0); transform: translate(-2px, -2px);}
        20% { clip-path: inset(10% 0 60% 0); transform: translate(2px, 2px);}
        40% { clip-path: inset(20% 0 40% 0); transform: translate(-2px, 2px);}
        60% { clip-path: inset(30% 0 20% 0); transform: translate(2px, -2px);}
        80% { clip-path: inset(40% 0 10% 0); transform: translate(-2px, 2px);}
        100% { clip-path: inset(0 0 80% 0); transform: translate(0, 0);}
    }

    @keyframes glitch-anim-2 {
        0% { clip-path: inset(80% 0 0 0); transform: translate(2px, 2px);}
        20% { clip-path: inset(60% 0 10% 0); transform: translate(-2px, -2px);}
        40% { clip-path: inset(40% 0 20% 0); transform: translate(2px, -2px);}
        60% { clip-path: inset(20% 0 30% 0); transform: translate(-2px, 2px);}
        80% { clip-path: inset(10% 0 40% 0); transform: translate(2px, -2px);}
        100% { clip-path: inset(80% 0 0 0); transform: translate(0, 0);}
    }

    @keyframes ambient-glitch {
        0% { opacity: 0.85; filter: blur(12px) brightness(1.2) saturate(1.5); }
        10% { opacity: 0.95; filter: blur(14px) brightness(1.3) saturate(2); }
        20% { opacity: 0.7; filter: blur(10px) brightness(1.1) saturate(1.2); }
        30% { opacity: 0.9; filter: blur(13px) brightness(1.4) saturate(1.7); }
        40% { opacity: 0.8; filter: blur(11px) brightness(1.2) saturate(1.3); }
        50% { opacity: 1; filter: blur(16px) brightness(1.5) saturate(2.2); }
        60% { opacity: 0.7; filter: blur(10px) brightness(1.1) saturate(1.1); }
        70% { opacity: 0.92; filter: blur(13px) brightness(1.3) saturate(1.8); }
        80% { opacity: 0.8; filter: blur(12px) brightness(1.2) saturate(1.4); }
        90% { opacity: 0.97; filter: blur(15px) brightness(1.4) saturate(2); }
        100% { opacity: 0.85; filter: blur(12px) brightness(1.2) saturate(1.5); }
    }
`;

// Settings Component State
let componentsLoaded = {
    pomodoro: false,
    tasklist: false,
    settings: false
};

// Store component-specific 3D scenes
let componentScenes = {
    pomodoro: null,
    tasklist: null
};

// Make activeSidebars globally accessible
window.activeSidebars = activeSidebars;

// Add responsive breakpoints and mobile detection
const BREAKPOINTS = {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
};

let isMobile = window.innerWidth <= BREAKPOINTS.mobile;
let isTablet = window.innerWidth <= BREAKPOINTS.tablet;

// Update mobile detection on resize
window.addEventListener('resize', () => {
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= BREAKPOINTS.mobile;
    isTablet = window.innerWidth <= BREAKPOINTS.tablet;
    
    // If switching between mobile/desktop, update sidebar behavior
    if (wasMobile !== isMobile) {
        handleResponsiveChange();
    }
    
    updateMainContentPosition();
});

function handleResponsiveChange() {
    // Close all sidebars when switching to mobile
    if (isMobile) {
        if (activeSidebars.left) closeSidebar('left');
        if (activeSidebars.right) closeSidebar('right');
    }
}

// Sidebar management functions
window.toggleSidebar = function(side) {
    const sidebar = document.getElementById(side === 'left' ? 'leftSidebar' : 'rightSidebar');
    const isOpen = activeSidebars[side];
    
    // Play sound effect
    playSound('dynamicIsland');
    
    if (isOpen) {
        closeSidebar(side);
    } else {
        // On mobile, close other sidebar first
        if (isMobile) {
            const otherSide = side === 'left' ? 'right' : 'left';
            if (activeSidebars[otherSide]) {
                closeSidebar(otherSide);
            }
        }
        openSidebar(side);
    }
};

window.openSidebar = function(side) {
    const sidebar = document.getElementById(side === 'left' ? 'leftSidebar' : 'rightSidebar');
    
    // Load component if not already loaded
    if (side === 'left' && !componentsLoaded.pomodoro) {
        loadPomodoroComponent();
    } else if (side === 'right' && !componentsLoaded.tasklist) {
        loadTasklistComponent();
    }
    
    sidebar.classList.add('open');
    activeSidebars[side] = true;
    
    // Add mobile-specific classes
    if (isMobile) {
        sidebar.classList.add('mobile-fullscreen');
        document.body.classList.add('sidebar-open-mobile');
    }
    
    updateMainContentPosition();
    
    // Start the appropriate animation
    if (side === 'left' && componentScenes.pomodoro) {
        componentScenes.pomodoro.animate();
    } else if (side === 'right' && componentScenes.tasklist) {
        componentScenes.tasklist.animate();
    }
};

window.closeSidebar = function(side) {
    const sidebar = document.getElementById(side === 'left' ? 'leftSidebar' : 'rightSidebar');
    sidebar.classList.remove('open', 'mobile-fullscreen');
    activeSidebars[side] = false;
    
    // Remove mobile-specific classes if no sidebars are open
    if (isMobile && !activeSidebars.left && !activeSidebars.right) {
        document.body.classList.remove('sidebar-open-mobile');
    }
    
    updateMainContentPosition();
    // Play sound effect when sidebar is closed
    playSound('uiInteract');
};

function updateMainContentPosition() {
    const mainContent = document.getElementById('mainContent');
    const canvasContainer = document.getElementById('canvas-container');
    
    // Remove all position classes
    mainContent.classList.remove('content-shifted-left', 'content-shifted-right', 'content-shifted-both');
    canvasContainer.classList.remove('content-shifted-left', 'content-shifted-right', 'content-shifted-both');
    
    // On mobile, don't shift content - sidebars overlay
    if (isMobile) {
        return;
    }
    
    // Apply appropriate position class for desktop/tablet
    if (activeSidebars.left && activeSidebars.right) {
        mainContent.classList.add('content-shifted-both');
        canvasContainer.classList.add('content-shifted-both');
    } else if (activeSidebars.left) {
        mainContent.classList.add('content-shifted-left');
        canvasContainer.classList.add('content-shifted-left');
    } else if (activeSidebars.right) {
        mainContent.classList.add('content-shifted-right');
        canvasContainer.classList.add('content-shifted-right');
    }
}

// Add responsive styles for components
function addComponentStyles(componentName, styles) {
    // Remove existing styles for this component
    const existingStyle = document.getElementById(`${componentName}-styles`);
    if (existingStyle) {
        existingStyle.remove();
    }

    // Always append to <head> after DOM is ready and after HTML is injected
    function inject() {
        const styleElement = document.createElement('style');
        styleElement.id = `${componentName}-styles`;
        styleElement.textContent = styles + `
            /* Ensure .control-button styles always apply */
            .control-button, .control-button.active, .control-button:active, .control-button:hover {
                background-color: rgba(0, 255, 255, 0.1);
                border: 1px solid rgba(0, 255, 255, 0.3);
                color: #c8f5ff;
                transition: all 0.2s ease-in-out;
            }
            .control-button.active, .control-button:active {
                background-color: rgba(0, 255, 255, 0.3);
                box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
            }
            .control-button:hover {
                background-color: rgba(0, 255, 255, 0.25);
                box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
            }
        `;
        document.head.appendChild(styleElement);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inject);
    } else {
        inject();
    }
}

// Enhanced Pomodoro component with mobile considerations
function loadPomodoroComponent() {
    if (componentsLoaded.pomodoro) return;
    
    const container = document.getElementById('pomodoroContainer');
    
    // Add Pomodoro-specific styles with responsive enhancements
    const pomodoroStyles = `
        .pomodoro-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        }
        
        .timer-panel {
            background-color: rgba(10, 20, 25, 0.25);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            padding: 1.5rem 2rem;
            border-radius: 1rem;
            border: 1px solid rgba(0, 255, 255, 0.15);
            position: relative;
            z-index: 2;
        }
        
        .control-button {
            background-color: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.3);
            transition: all 0.2s ease-in-out;
            position: relative;
            z-index: 2;
            color: #c8f5ff;
            cursor: pointer;
        }
        .control-button:hover {
            background-color: rgba(0, 255, 255, 0.25);
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
        }
        .control-button.active {
            background-color: rgba(0, 255, 255, 0.3);
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
        }
        
        .pomodoro-container {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 500px;
        }
        
        .pomodoro-ui {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
            min-height: 500px;
            padding: 1rem;
        }
        
        /* Mobile-specific timer display */
        @media (max-width: ${BREAKPOINTS.mobile}px) {
            #time-display {
                font-size: 2.5rem;
            }
            
            #timer-mode {
                font-size: 1.1rem;
            }
            
            .pomodoro-ui {
                justify-content: flex-start;
                gap: 1rem;
            }
            
            .timer-panel {
                padding: 1rem 1.5rem;
                margin-bottom: auto;
            }
            
            #mode-selector {
                order: 2;
            }
            
            .control-buttons {
                order: 3;
                margin-top: auto;
            }
        }
    `;
    
    addComponentStyles('pomodoro', pomodoroStyles);
    
    // Enhanced HTML with better mobile structure
    container.innerHTML = `
        <div class="pomodoro-container">
            <!-- 3D Canvas for Hourglass -->
            <canvas id="pomodoroCanvas" class="pomodoro-canvas"></canvas>
            
            <!-- UI Overlay -->
            <div class="pomodoro-ui">
                <!-- Timer Display -->
                <div class="timer-panel text-center">
                    <h1 id="timer-mode" class="text-xl text-cyan-200">POMODORO</h1>
                    <div id="time-display" class="text-4xl font-bold text-glow my-2">25:00</div>
                </div>

                <!-- Mode Selection -->
                <div id="mode-selector" class="flex flex-col gap-2 timer-panel p-3 w-full">
                    <button data-mode="pomodoro" class="control-button px-4 py-2 rounded-lg text-sm active">Pomodoro</button>
                    <button data-mode="shortBreak" class="control-button px-4 py-2 rounded-lg text-sm">Short Break</button>
                    <button data-mode="longBreak" class="control-button px-4 py-2 rounded-lg text-sm">Long Break</button>
                </div>
                
                <!-- Action Buttons -->
                <div class="control-buttons flex flex-col gap-2 w-full">
                    <button id="start-pause-btn" class="control-button px-8 py-3 rounded-lg text-xl">START</button>
                    <button id="reset-btn" class="control-button p-3 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5M4 4l16 16"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Wait a bit for the DOM to be ready, then initialize
    setTimeout(() => {
        initializePomodoroWith3D();
    }, 100);
    
    componentsLoaded.pomodoro = true;
}

// Enhanced 3D initialization with responsive canvas handling
function initializePomodoroWith3D() {
    const canvas = document.getElementById('pomodoroCanvas');
    if (!canvas) {
        console.error('Pomodoro canvas not found');
        return;
    }

    // Wait for canvas to have proper dimensions
    if (canvas.clientWidth === 0 || canvas.clientHeight === 0) {
        setTimeout(() => initializePomodoroWith3D(), 100);
        return;
    }

    // Setup 3D Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);
    
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // --- Hourglass Model ---
    const hourglassGroup = new THREE.Group();
    const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0xADD8E6,
        metalness: 0.1,
        roughness: 0.1,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x7a9a9a,
        metalness: 0.8,
        roughness: 0.4
    });
    
    // Define dimensions for the hourglass shape
    const totalGlassHeight = 4;
    const bulbHeight = 1.8;
    const neckHeight = 0.5;
    const radius = 1.2;
    const neckRadius = 0.12;

    // Create the curved profile using Vector2 points
    const points = [];
    points.push(new THREE.Vector2(radius, totalGlassHeight / 2));
    points.push(new THREE.Vector2(radius, bulbHeight / 2));
    points.push(new THREE.Vector2(neckRadius, neckHeight / 2));
    points.push(new THREE.Vector2(neckRadius, -neckHeight / 2));
    points.push(new THREE.Vector2(radius, -bulbHeight / 2));
    points.push(new THREE.Vector2(radius, -totalGlassHeight / 2));

    // Create the hourglass shape by revolving the profile
    const hourglassGeometry = new THREE.LatheGeometry(points, 32, 0, Math.PI * 2);
    const hourglassMesh = new THREE.Mesh(hourglassGeometry, glassMaterial);
    hourglassGroup.add(hourglassMesh);

    // Create frame pillars
    const framePillarGeom = new THREE.CylinderGeometry(0.08, 0.08, totalGlassHeight, 6);
    for(let i = 0; i < 3; i++){
        const pillar = new THREE.Mesh(framePillarGeom, frameMaterial);
        const angle = (i/3) * Math.PI * 2;
        pillar.position.set(Math.cos(angle) * (radius + 0.15), 0, Math.sin(angle) * (radius + 0.15));
        hourglassGroup.add(pillar);
    }

    // Add top/bottom caps
    const capGeom = new THREE.TorusGeometry(radius + 0.15, 0.06, 6, 32);
    const topCap = new THREE.Mesh(capGeom, frameMaterial);
    topCap.rotation.x = Math.PI / 2;
    topCap.position.y = totalGlassHeight / 2;
    hourglassGroup.add(topCap);

    const bottomCap = topCap.clone();
    bottomCap.position.y = -totalGlassHeight / 2;
    hourglassGroup.add(bottomCap);
    
    scene.add(hourglassGroup);

    // --- "Energy Sand" Particle System ---
    const particleCount = 5000;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const velocityArray = new Float32Array(particleCount * 3).fill(0);
    const initialPosArray = new Float32Array(particleCount * 3);

    // Hourglass dimensions for particle physics
    const topY = bulbHeight / 2;
    const bottomY = -totalGlassHeight / 2;
    const gravity = 9.8;
    
    // Helper function to get the radius of the hourglass at a given height
    const getHourglassRadius = (y) => {
         if (Math.abs(y) < neckHeight / 2) return neckRadius;
         if (Math.abs(y) > bulbHeight / 2) return radius;
         const t = (Math.abs(y) - neckHeight / 2) / (bulbHeight / 2 - neckHeight / 2);
         return neckRadius + t * (radius - neckRadius);
    }

    const resetParticles = () => {
         let placed = 0;
         while(placed < particleCount) {
            const y = (neckHeight / 2) + Math.random() * (topY - (neckHeight / 2));
            const r = getHourglassRadius(y) * Math.sqrt(Math.random());
            const angle = Math.random() * Math.PI * 2;
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            
            const i3 = placed * 3;
            posArray[i3] = x;
            posArray[i3 + 1] = y;
            posArray[i3 + 2] = z;
            placed++;
         }

         const particles = [];
         for (let i = 0; i < particleCount; i++) {
             particles.push({ index: i, y: posArray[i * 3 + 1] });
         }
         particles.sort((a, b) => a.y - b.y);

         const sortedInitialPos = new Float32Array(particleCount * 3);
         for (let i = 0; i < particleCount; i++) {
             const originalIndex = particles[i].index * 3;
             const newIndex = i * 3;
             sortedInitialPos[newIndex] = posArray[originalIndex];
             sortedInitialPos[newIndex + 1] = posArray[originalIndex + 1];
             sortedInitialPos[newIndex + 2] = posArray[originalIndex + 2];
         }

         initialPosArray.set(sortedInitialPos);
         posArray.set(initialPosArray);
         velocityArray.fill(0);
         if(particleSystem) particleSystem.geometry.attributes.position.needsUpdate = true;
    };
    
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x00ffff,
        size: 0.025,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.7
    });
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);
    
    // Timer Logic
    const timeDisplay = document.getElementById('time-display');
    const timerModeDisplay = document.getElementById('timer-mode');
    const startPauseBtn = document.getElementById('start-pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const modeSelector = document.getElementById('mode-selector');

    if (!timeDisplay || !timerModeDisplay || !startPauseBtn || !resetBtn || !modeSelector) {
        console.error('Timer UI elements not found');
        return;
    }

    const times = { pomodoro: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
    let currentMode = 'pomodoro';
    let timeLeft = times[currentMode];
    let totalTime = times[currentMode];
    let isRunning = false;
    let timerInterval = null;

    const updateDisplay = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const switchMode = (mode) => {
        clearInterval(timerInterval);
        isRunning = false;
        startPauseBtn.textContent = 'START';
        currentMode = mode;
        timeLeft = times[currentMode];
        totalTime = times[currentMode];
        timerModeDisplay.textContent = mode.replace(/([A-Z])/g, ' $1').toUpperCase();
        updateDisplay();
        resetParticles();
        
        modeSelector.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        const modeButton = modeSelector.querySelector(`[data-mode=${mode}]`);
        if (modeButton) modeButton.classList.add('active');
    };

    const startTimer = () => {
        if (timeLeft <= 0) switchMode(currentMode);
        isRunning = true;
        startPauseBtn.textContent = 'PAUSE';
        timerInterval = setInterval(() => {
            timeLeft--;
            updateDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                isRunning = false;
                startPauseBtn.textContent = 'START';
            }
        }, 1000);
    };

    const pauseTimer = () => {
        isRunning = false;
        startPauseBtn.textContent = 'START';
        clearInterval(timerInterval);
    };
    
    // Event Listeners with sound effects
    startPauseBtn.addEventListener('click', () => {
        playSound('uiInteract');
        isRunning ? pauseTimer() : startTimer();
    });
    
    resetBtn.addEventListener('click', () => {
        playSound('uiInteract');
        switchMode(currentMode);
    });
    
    modeSelector.addEventListener('click', (e) => {
        if(e.target.tagName === 'BUTTON'){
            playSound('uiInteract');
            switchMode(e.target.dataset.mode);
        }
    });
    
    // Animation Loop
    const clock = new THREE.Clock();
    let animationId;
    
    function animate() {
        if (!activeSidebars.left) return; // Stop animation when sidebar is closed
        
        animationId = requestAnimationFrame(animate);
        
        // Reduce animation complexity on mobile for performance
        const deltaTime = Math.min(clock.getDelta(), isMobile ? 0.03 : 0.05);
        
        const positions = particleSystem.geometry.attributes.position.array;
        
        let fallenParticlesTarget = 0;
        if (isRunning) {
            const progress = 1 - (timeLeft / totalTime);
            fallenParticlesTarget = Math.floor(particleCount * progress);
        }

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            if (i >= fallenParticlesTarget) {
                positions[i3] = initialPosArray[i3] + (Math.random() - 0.5) * 0.01;
                positions[i3+2] = initialPosArray[i3+2] + (Math.random() - 0.5) * 0.01;
                continue;
            }

            let x = positions[i3];
            let y = positions[i3 + 1];
            let z = positions[i3 + 2];

            const pileHeightRatio = (bulbHeight/2) / particleCount;
            const targetY = bottomY + i * pileHeightRatio;

            if (y > targetY) {
                velocityArray[i3+1] -= gravity * deltaTime * 0.2;

                if (y > 0) { 
                   velocityArray[i3] -= x * 1.5 * deltaTime;
                   velocityArray[i3+2] -= z * 1.5 * deltaTime;
                }

                positions[i3] += velocityArray[i3] * deltaTime;
                positions[i3+1] += velocityArray[i3+1] * deltaTime;
                positions[i3+2] += velocityArray[i3+2] * deltaTime;
                
                const r = getHourglassRadius(positions[i3+1]);
                const dSq = positions[i3] * positions[i3] + positions[i3+2] * positions[i3+2];
                if (dSq > r*r) {
                    velocityArray[i3+1] *= 0.5;
                    velocityArray[i3] *= -0.5;
                    velocityArray[i3+2] *= -0.5;
                }

            } else {
               positions[i3+1] = targetY;
               velocityArray[i3+1] = 0;
            }
        }

        particleSystem.geometry.attributes.position.needsUpdate = true;
        hourglassGroup.rotation.y += 0.0005;
        
        // Resize canvas if needed
        if (canvas.clientWidth !== renderer.domElement.width || canvas.clientHeight !== renderer.domElement.height) {
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        
        renderer.render(scene, camera);
    }
    
    // Store scene reference
    componentScenes.pomodoro = { 
        animate, 
        cleanup: () => {
            if (animationId) cancelAnimationFrame(animationId);
            scene.clear();
            renderer.dispose();
        }
    };
    
    // Initial setup
    switchMode('pomodoro');
    
    // Start animation if sidebar is open
    if (activeSidebars.left) {
        animate();
    }
}

function loadTasklistComponent() {
    if (componentsLoaded.tasklist) return;
    
    const container = document.getElementById('tasklistContainer');
    
    // Add Tasklist-specific styles
    const tasklistStyles = `
        .tasklist-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        }
        
        .hud-panel {
            background-color: rgba(10, 20, 25, 0.35);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(0, 255, 255, 0.2);
            border-radius: 1rem;
            box-shadow: 0 0 25px rgba(0, 255, 255, 0.1);
            position: relative;
            z-index: 2;
        }
        .task-input {
            background-color: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 0.5rem;
            color: #c8f5ff;
        }
        .task-input::placeholder {
            color: rgba(200, 245, 255, 0.5);
        }
        .task-item {
            background-color: rgba(0, 255, 255, 0.05);
            border-left: 3px solid rgba(0, 255, 255, 0.4);
            transition: all 0.3s ease;
        }
        .task-item.completed {
            background-color: rgba(0, 255, 255, 0.15);
            border-left-color: #00ff00;
        }
        .task-item.completed span {
            text-decoration: line-through;
            color: rgba(200, 245, 255, 0.5);
        }
        .task-button {
            transition: transform 0.2s ease;
            color: #c8f5ff;
        }
        .task-button:hover { transform: scale(1.1); }
        .icon-complete:hover { color: #00ff00; }
        .icon-reactivate:hover { color: #ffae42; }
        .icon-delete:hover { color: #ff4d4d; }
        
        .tasklist-container {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 600px;
        }
        
        .tasklist-ui {
            position: relative;
            z-index: 2;
            padding: 1rem;
            height: 100%;
            min-height: 600px;
            overflow-y: auto;
        }
        
        /* Heatmap Styling */
        #heatmap-grid {
            display: grid;
            grid-template-rows: repeat(7, 1fr);
            grid-auto-flow: column;
            gap: 2px;
        }
        .heatmap-cell {
            width: 12px;
            height: 12px;
            background-color: rgba(0, 255, 255, 0.1);
            border-radius: 2px;
            transition: background-color 0.3s;
        }
        .heatmap-cell:hover {
            border: 1px solid #00ffff;
        }
        #heatmap-labels {
            display: flex;
            justify-content: space-around;
            padding: 0 10px 5px 15px;
        }
    `;
    
    addComponentStyles('tasklist', tasklistStyles);
    
    // Add Tasklist HTML with 3D canvas
    container.innerHTML = `
        <div class="tasklist-container">
            <!-- 3D Canvas for Crystal -->
            <canvas id="tasklistCanvas" class="tasklist-canvas"></canvas>
            
            <!-- UI Overlay -->
            <div class="tasklist-ui">
                <!-- Task List Component -->
                <div class="hud-panel p-4 w-full mb-4">
                    <h1 class="text-xl text-center font-bold text-glow mb-4">DATA-DRIVEN TASKS</h1>
                    <form id="add-task-form" class="flex flex-col gap-2 mb-4">
                        <input type="text" id="task-input" class="task-input flex-grow p-2" placeholder="Synchronize new task..." required>
                        <button type="submit" class="control-button px-4 py-2 rounded-lg font-bold">ADD</button>
                    </form>
                    <div id="filter-buttons" class="flex justify-center gap-2 mb-4">
                        <button data-filter="all" class="control-button px-3 py-1 rounded-md text-sm active">All</button>
                        <button data-filter="active" class="control-button px-3 py-1 rounded-md text-sm">Active</button>
                        <button data-filter="completed" class="control-button px-3 py-1 rounded-md text-sm">Completed</button>
                    </div>
                    <ul id="task-list" class="space-y-2 h-48 overflow-y-auto pr-2"></ul>
                </div>
                
                <!-- Heatmap Section -->
                <div class="hud-panel p-4 w-full">
                     <h2 class="text-lg text-center font-bold text-glow mb-4">ACTIVITY MATRIX</h2>
                     <div id="heatmap-labels" class="text-xs text-cyan-300 opacity-70"></div>
                     <div id="heatmap-grid"></div>
                </div>
            </div>
        </div>
    `;
    
    // Wait a bit for the DOM to be ready, then initialize
    setTimeout(() => {
        initializeTasklistWith3D();
    }, 100);
    
    componentsLoaded.tasklist = true;
}

function initializeTasklistWith3D() {
    // Check if canvas exists
    const canvas = document.getElementById('tasklistCanvas');
    if (!canvas) {
        console.error('Tasklist canvas not found');
        return;
    }

    // Wait for canvas to have proper dimensions
    if (canvas.clientWidth === 0 || canvas.clientHeight === 0) {
        setTimeout(() => initializeTasklistWith3D(), 100);
        return;
    }

    // Setup 3D Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 1, 6);
    
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00ffff, 1.5, 100);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // --- 3D Crystal Object ---
    const crystalGroup = new THREE.Group();
    const crystalGeom = new THREE.IcosahedronGeometry(1.5, 0);
    const crystalMat = new THREE.MeshStandardMaterial({ 
        color: 0x00ffff, 
        metalness: 0.2, 
        roughness: 0.1, 
        transparent: true, 
        opacity: 0.7, 
        emissive: 0x00ffff, 
        emissiveIntensity: 0.3 
    });
    const crystal = new THREE.Mesh(crystalGeom, crystalMat);
    const wireframeGeom = new THREE.IcosahedronGeometry(1.55, 0);
    const wireframeMat = new THREE.MeshBasicMaterial({ 
        color: 0x88ffff, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.3 
    });
    const wireframe = new THREE.Mesh(wireframeGeom, wireframeMat);
    crystalGroup.add(crystal, wireframe);
    scene.add(crystalGroup);
    
    // DOM Elements
    const taskListEl = document.getElementById('task-list');
    const addTaskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const filterButtons = document.getElementById('filter-buttons');
    const heatmapGrid = document.getElementById('heatmap-grid');
    const heatmapLabels = document.getElementById('heatmap-labels');

    if (!taskListEl || !addTaskForm || !taskInput || !filterButtons || !heatmapGrid || !heatmapLabels) {
        console.error('Task UI elements not found');
        return;
    }

    // App State & LocalStorage
    let tasks = JSON.parse(localStorage.getItem('todo-tasks-sidebar')) || [];
    let heatmapData = JSON.parse(localStorage.getItem('todo-heatmap-sidebar')) || {};
    let currentFilter = 'all';

    function saveState() {
        localStorage.setItem('todo-tasks-sidebar', JSON.stringify(tasks));
        localStorage.setItem('todo-heatmap-sidebar', JSON.stringify(heatmapData));
    }

    function pulseCrystal() {
        let scale = 1;
        const pulseInterval = setInterval(() => {
            scale += 0.08;
            crystalGroup.scale.set(scale, scale, scale);
            if (scale >= 1.2) {
                clearInterval(pulseInterval);
                const shrinkInterval = setInterval(() => {
                     scale -= 0.01;
                     crystalGroup.scale.set(scale, scale, scale);
                     if(scale <= 1) {
                        crystalGroup.scale.set(1,1,1);
                        clearInterval(shrinkInterval);
                     }
                }, 20);
            }
        }, 20);
    }

    function renderTasks() {
        taskListEl.innerHTML = '';
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        if(filteredTasks.length === 0) {
             taskListEl.innerHTML = `<li class="text-center text-cyan-400 opacity-60 p-4">No tasks in this category.</li>`;
        }

        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.id = `task-${task.id}`;
            taskItem.className = 'task-item flex items-center justify-between p-2 rounded-md';
            if(task.completed) taskItem.classList.add('completed');
            
            const completeButton = `
                <button data-action="complete" class="task-button icon-complete" title="Complete Task">
                    <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </button>`;
            const reactivateButton = `
                <button data-action="reactivate" class="task-button icon-reactivate" title="Re-activate Task">
                     <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </button>`;

            taskItem.innerHTML = `
                <span class="flex-grow mr-2 text-sm">${task.text}</span>
                <div class="flex items-center gap-2">
                    ${task.completed ? reactivateButton : completeButton}
                    <button data-action="delete" class="task-button icon-delete" title="Delete Task">
                        <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            `;
            taskListEl.prepend(taskItem);
        });
    }
    
    function renderHeatmap() {
        heatmapGrid.innerHTML = '';
        heatmapLabels.innerHTML = '';
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 15 * 7); // ~15 weeks
        
        let currentMonth = -1;
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            // Add month labels
            if (d.getMonth() !== currentMonth) {
                currentMonth = d.getMonth();
                const monthName = d.toLocaleString('default', { month: 'short' });
                heatmapLabels.innerHTML += `<span class="flex-1 text-center">${monthName}</span>`;
            }
            
            const cell = document.createElement('div');
            const dateString = d.toISOString().split('T')[0]; // YYYY-MM-DD
            const count = heatmapData[dateString] || 0;
            
            let opacity = 0.1;
            if(count > 0) opacity = 0.3;
            if(count > 2) opacity = 0.6;
            if(count > 5) opacity = 0.8;
            if(count > 8) opacity = 1.0;
            
            cell.className = 'heatmap-cell';
            cell.style.backgroundColor = `rgba(0, 255, 255, ${opacity})`;
            cell.title = `${count} tasks on ${dateString}`;
            heatmapGrid.appendChild(cell);
        }
    }
    
    // Event Handlers with sound effects
    addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        if (taskText) {
            playSound('uiInteract');
            tasks.push({
                id: Date.now(),
                text: taskText,
                completed: false,
            });
            taskInput.value = '';
            saveState();
            renderTasks();
            pulseCrystal();
        }
    });

    taskListEl.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        // Only stop propagation for task action buttons, not for all clicks
        e.stopPropagation();
        
        const taskItem = e.target.closest('li');
        const taskId = parseInt(taskItem.id.replace('task-', ''));
        const action = button.dataset.action;
        const taskIndex = tasks.findIndex(t => t.id === taskId);

        if (taskIndex === -1) return;

        if (action === 'delete') {
            playSound('uiInteract');
            tasks.splice(taskIndex, 1);
        } else if (action === 'complete') {
            // Play task completion sound
            playSound('taskComplete');
            tasks[taskIndex].completed = true;
            const today = new Date().toISOString().split('T')[0];
            heatmapData[today] = (heatmapData[today] || 0) + 1;
        } else if (action === 'reactivate') {
            playSound('uiInteract');
            tasks[taskIndex].completed = false;
        }
        
        saveState();
        renderTasks();
        renderHeatmap();
        pulseCrystal();
    });
    
    filterButtons.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-filter]');
        if(!button) return;
        
        playSound('uiInteract');
        filterButtons.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        currentFilter = button.dataset.filter;
        renderTasks();
    });

    // Animation Loop
    let animationId;
    
    function animate() {
        if (!activeSidebars.right) return; // Stop animation when sidebar is closed
        
        animationId = requestAnimationFrame(animate);
        crystalGroup.rotation.x += 0.001;
        crystalGroup.rotation.y += 0.002;
        
        // Resize canvas if needed
        if (canvas.clientWidth !== renderer.domElement.width || canvas.clientHeight !== renderer.domElement.height) {
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        
        renderer.render(scene, camera);
    }

    // Store scene reference
    componentScenes.tasklist = { 
        animate, 
        cleanup: () => {
            if (animationId) cancelAnimationFrame(animationId);
            scene.clear();
            renderer.dispose();
        }
    };

    // Initialisation
    renderTasks();
    renderHeatmap();
    
    // Start animation if sidebar is open
    if (activeSidebars.right) {
        animate();
    }
}

// Add mobile-specific touch gestures for sidebar closing
function addMobileGestures() {
    if (!isMobile) return;
    
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Swipe gestures to close sidebars
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
            if (activeSidebars.left && deltaX < -100) {
                closeSidebar('left');
            } else if (activeSidebars.right && deltaX > 100) {
                closeSidebar('right');
            }
        }
    });
}

// Initialize mobile gestures when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    addMobileGestures();
});

// Add Settings Component
function loadSettingsComponent() {
    if (componentsLoaded.settings) return;
    
    // Create settings container if it doesn't exist
    let settingsContainer = document.getElementById('settingsContainer');
    if (!settingsContainer) {
        settingsContainer = document.createElement('div');
        settingsContainer.id = 'settingsContainer';
        settingsContainer.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300';
        document.body.appendChild(settingsContainer);
    }

    // Add Settings-specific styles
    const settingsStyles = `
        #settingsContainer {
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        #settingsContainer.active {
            display: flex;
            opacity: 1;
        }        /* HUD Corner borders */
        .corner-border {
            position: fixed;
            width: 100px;
            height: 100px;
            border: 2px solid rgba(0, 242, 255, 0.17);
            pointer-events: none;
            z-index: 100;
        }
        
        .corner-border.top-left { top: 1.5rem; left: 1.5rem; border-right: none; border-bottom: none; }
        .corner-border.top-right { top: 1.5rem; right: 1.5rem; border-left: none; border-bottom: none; }
        .corner-border.bottom-left { bottom: 1.5rem; left: 1.5rem; border-right: none; border-top: none; }
        .corner-border.bottom-right { bottom: 1.5rem; right: 1.5rem; border-left: none; border-top: none; }

        .settings-wrapper {
            max-height: 100vh;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
            padding: 1rem;
            position: relative;
        }

        .settings-wrapper::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px),
                radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.12) 0%, transparent 20%);
            background-size: 
                35px 35px,
                35px 35px,
                100% 100%;
            animation: grid-pulse 8s infinite ease-in-out;
            pointer-events: none;
            z-index: -1;
        }

        .settings-wrapper::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: radial-gradient(circle at 35px 35px, rgba(0, 255, 255, 0.25) 1px, transparent 2px);
            background-size: 35px 35px;
            animation: nodes-pulse 4s infinite alternate ease-in-out;
            pointer-events: none;
            z-index: -1;
        }

        /* Copy all styles from genisys_settings.html except body styles */
        ${settingsSpecificStyles}

        /* Additional styles for close button */
        .settings-close-btn {
            position: absolute;
            top: 2rem;
            right: 1rem;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.3);
            color: rgba(0, 255, 255, 0.8);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            z-index: 60;
        }

        .settings-close-btn:hover {
            background: rgba(0, 255, 255, 0.2);
            transform: scale(1.1);
        }

        /* Ensure content is centered and has proper spacing on small screens */
        @media (max-width: ${BREAKPOINTS.mobile}px) {
            .main-content-grid {
                min-height: auto;
                padding: 2rem 1rem;
            }

            .settings-wrapper {
                padding: 0.5rem;
            }
            
            .hologram-container {
                height: 280px;  /* Reduce hologram height on mobile */
                min-height: 280px;
            }
        }
    `;

    addComponentStyles('settings', settingsStyles);

    // Settings HTML Structure
    settingsContainer.innerHTML = `
        <!-- HUD Elements -->
        <div class="corner-border top-left"></div>
        <div class="corner-border top-right"></div>
        <div class="corner-border bottom-left"></div>
        <div class="corner-border bottom-right"></div>

        <div class="settings-wrapper relative w-full h-full p-6">
            <button class="settings-close-btn" onclick="closeSettings()">×</button>
            
            <!-- Main Content Grid -->
            <div class="main-content-grid min-h-screen flex flex-col lg:flex-row items-center justify-center p-6 sm:p-8 gap-8 lg:gap-4 xl:gap-2">
                <!-- Left Side: Hologram Display -->
                <div class="w-full lg:w-1/2 h-96 lg:h-full flex items-center justify-center">
                    <div class="hologram-container w-full h-full">
                        <div class="hologram-base"></div>
                        <div class="hologram-ambient"></div>
                        <div class="hologram-image">
                            <img src="/static/assets/images/genisys_bot-removebg.png" alt="Hologram" />
                        </div>
                    </div>
                </div>

                <!-- Right Side: Settings Panel -->
                <div class="w-full lg:w-1/2 flex justify-center items-center">
                    <div class="glass-panel w-full max-w-md p-6 sm:p-8 space-y-8">
                        <h1 class="text-center text-3xl font-bold text-glow">CUSTOMIZE</h1>
                        
                        <!-- Voice Selection -->
                        <div class="space-y-2">
                            <label for="voice-select" class="text-cyan-200">VOICE</label>
                            <select id="voice-select" class="custom-select w-full p-3 rounded-lg text-lg">
                                <option>Puck (Default)</option>
                                <option>Charon</option>
                                <option>Kore</option>
                                <option>Fenrir</option>
                                <option>Aoede</option>
                                <option>Leda</option>
                                <option>Orus</option>
                                <option>Zephyr</option>
                            </select>
                        </div>
                        
                        <!-- Persona Selection -->
                        <div class="space-y-2">
                            <label for="persona-select" class="text-cyan-200">PERSONA</label>
                            <select id="persona-select" class="custom-select w-full p-3 rounded-lg text-lg">
                                <option>Professional</option>
                                <option>Friendly (Default)</option>
                                <option>Sarcastic</option>
                                <option>Enthusiastic</option>
                            </select>
                        </div>

                        <!-- Action Buttons -->
                        <div class="pt-6 flex justify-between gap-4">
                            <button id="reset-btn" class="control-button w-1/2 py-3 rounded-lg text-xl">RESET</button>
                            <button id="save-btn" class="control-button primary w-1/2 py-3 rounded-lg text-xl">SAVE</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize settings interactions
    initializeSettings();
    componentsLoaded.settings = true;
}

function initializeSettings() {
    const selectElements = document.querySelectorAll('.custom-select');
    
    selectElements.forEach(select => {
        select.addEventListener('mousedown', function() {
            playSound('uiInteract');
            this.classList.add('select-opening');
        });
        
        select.addEventListener('focus', function() {
            this.style.transition = 'all 0.3s ease';
        });
        
        select.addEventListener('blur', function() {
            this.classList.remove('select-opening');
            this.classList.add('select-closing');
            
            setTimeout(() => {
                this.classList.remove('select-closing');
            }, 200);
        });
        
        select.addEventListener('change', function() {
            playSound('uiInteract');
            this.style.boxShadow = '0 0 20px rgba(0, 255, 247, 0.8), 0 0 30px rgba(0, 255, 247, 0.6) inset';
            setTimeout(() => {
                this.style.boxShadow = '';
            }, 300);
        });
    });

    // Add event listeners for save and reset buttons
    document.getElementById('save-btn').addEventListener('click', () => {
        playSound('uiInteract');
        saveSettings();
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        playSound('uiInteract');
        resetSettings();
    });
}

// Settings Management Functions
window.openSettings = function() {
    loadSettingsComponent();
    const settingsContainer = document.getElementById('settingsContainer');
    settingsContainer.classList.add('active');
    playSound('dynamicIsland');
};

window.closeSettings = function() {
    const settingsContainer = document.getElementById('settingsContainer');
    if (settingsContainer) {
        settingsContainer.classList.remove('active');
        playSound('uiInteract');
    }
};

import { updateSettings } from './app.js';

function saveSettings() {
    const voiceSelect = document.getElementById('voice-select');
    const personaSelect = document.getElementById('persona-select');
    
    const settings = {
        voice: voiceSelect.value,
        persona: personaSelect.value
    };
    
    updateSettings(settings);
    playSound('uiInteract');
    closeSettings();
}

function resetSettings() {
    const voiceSelect = document.getElementById('voice-select');
    const personaSelect = document.getElementById('persona-select');
    
    const defaultSettings = {
        voice: 'Puck (Default)',
        persona: 'Friendly (Default)'
    };
    
    voiceSelect.value = defaultSettings.voice;
    personaSelect.value = defaultSettings.persona;
    
    // Call app.js updateSettings function
    updateSettings(defaultSettings);
    playSound('uiInteract');
}

// Add keyboard shortcut for settings
document.addEventListener('keydown', function(e) {
    if (e.altKey && e.key === 's') {
        e.preventDefault();
        window.openSettings();
    } else if (e.key === 'Escape') {
        const settingsContainer = document.getElementById('settingsContainer');
        if (settingsContainer && settingsContainer.classList.contains('active')) {
            closeSettings();
        }
    }
});