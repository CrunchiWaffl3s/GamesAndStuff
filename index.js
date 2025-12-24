function updateStatus() {
    const now = new Date();
    const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
    const timeString = now.toLocaleTimeString('en-US', timeOptions);
    const timeElement = document.getElementById('time-status');

    if (timeElement) timeElement.textContent = timeString;
}

function displayBatteryStatus(level) {
    const batteryElement = document.getElementById('battery-status');
    if (!batteryElement) return;

    const percentage = Math.round(level);
    batteryElement.textContent = `${percentage}%`;
}

function initializeBatteryAPI() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            displayBatteryStatus(battery.level * 100);

            battery.addEventListener('levelchange', () => {
                displayBatteryStatus(battery.level * 100);
            });

            battery.addEventListener('chargingchange', () => {
                displayBatteryStatus(battery.level * 100);
            });
        }).catch(error => {
            console.error("Could not access Battery Status API:", error);
            setupMockBatteryStatus();
        });
    } else {
        setupMockBatteryStatus();
    }
}

function setupMockBatteryStatus() {
    const batteryElement = document.getElementById('battery-status');
    if (batteryElement) batteryElement.textContent = `--%`;
}

let lastTime = 0;
let fpsCounter = 0;

function updateFPS(timestamp) {
    const fpsElement = document.getElementById('fps-status');
    const deltaTime = timestamp - lastTime;

    if (deltaTime >= 1000) {
        const calculatedFps = fpsCounter;
        if (fpsElement) {
            fpsElement.textContent = `FPS: ${Math.min(60, calculatedFps)}`;
        }

        fpsCounter = 0;
        lastTime = timestamp;
    } else {
        fpsCounter++;
    }

    requestAnimationFrame(updateFPS);
}

window.onload = function() {
    updateStatus();
    initializeBatteryAPI();
    setInterval(updateStatus, 1000);
    requestAnimationFrame(updateFPS);
};

const phrases = [
    "Yeah, we have games and stuff",
    "Be sure to try some other themes!",
    "Isn't this cool?",
    "hi",
    "I like waffles",
];

document.addEventListener('DOMContentLoaded', (event) => {
    const randomTextDisplay = document.getElementById('random-text');

    function generateRandomText() {
        const randomIndex = Math.floor(Math.random() * phrases.length);
        randomTextDisplay.innerHTML = phrases[randomIndex];
    }

    generateRandomText();
    randomTextDisplay.addEventListener('click', generateRandomText);
});

const menuButton = document.getElementById('menu-button');
const sidebarMenu = document.getElementById('sidebar-menu');
const sidebarOverlay = document.getElementById('sidebar-overlay');

function toggleMenu() {
    const isOpen = sidebarMenu.classList.toggle('-translate-x-full');
    
    if (isOpen) {
        sidebarOverlay.classList.remove('opacity-100');
        sidebarOverlay.classList.add('opacity-0');
        sidebarOverlay.classList.add('pointer-events-none');
    } else {
        sidebarOverlay.classList.remove('opacity-0');
        sidebarOverlay.classList.remove('pointer-events-none');
        sidebarOverlay.classList.add('opacity-100');
    }
}

menuButton.addEventListener('click', toggleMenu);
sidebarOverlay.addEventListener('click', toggleMenu);