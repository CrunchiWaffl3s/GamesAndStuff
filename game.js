const DB_NAME = 'gameLoaderDB';
const USER_GAMES_STORE = 'userGames';
let db;

async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 3);
        request.onupgradeneeded = e => {
            db = e.target.result;
            if (!db.objectStoreNames.contains(USER_GAMES_STORE)) {
                db.createObjectStore(USER_GAMES_STORE, { keyPath: 'id' });
            }
        };
        request.onsuccess = e => { db = e.target.result; resolve(db); };
        request.onerror = e => reject(e);
    });
}

async function getUserGames() {
    await openDB();
    if (!db || !db.objectStoreNames.contains(USER_GAMES_STORE)) return [];
    return new Promise((resolve, reject) => {
        const tx = db.transaction(USER_GAMES_STORE, 'readonly');
        const store = tx.objectStore(USER_GAMES_STORE);
        const request = store.getAll();
        request.onsuccess = e => resolve(e.target.result);
        request.onerror = e => reject(e);
    });
}

async function loadGameData() {
    try {
        const response = await fetch('/games.json');
        let defaultGames = await response.json();
        const userGames = await getUserGames();
        return [...defaultGames, ...userGames];
    } catch (error) {
        console.error('Error loading game data:', error);
        return null;
    }
}

function formatTitle(name) {
    if (!name) return "Unknown Game";
    return name.replace(/[-_]/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function reloadGame() {
    const iframe = document.getElementById('game-iframe');
    if (iframe) iframe.src = iframe.src;
}

function toggleFullscreen() {
    const container = document.getElementById('game-iframe-container');
    const buttonIcon = document.querySelector('#fullscreen-btn i');

    if (document.fullscreenElement) {
        document.exitFullscreen();
        container.classList.remove('fullscreen-active');
        lucide.replace(buttonIcon.parentElement);
    } else {
        container.requestFullscreen();
        container.classList.add('fullscreen-active');
        buttonIcon.setAttribute('data-lucide', 'minimize-2'); 
        lucide.replace(buttonIcon.parentElement);
    }
}

document.addEventListener('fullscreenchange', () => {
    const container = document.getElementById('game-iframe-container');
    const button = document.getElementById('fullscreen-btn');

    if (document.fullscreenElement) {
        container.classList.add('fullscreen-active');
        button.querySelector('i').setAttribute('data-lucide', 'minimize-2');
    } else {
        container.classList.remove('fullscreen-active');
        button.querySelector('i').setAttribute('data-lucide', 'maximize-2');
    }
    lucide.replace(button);
});

document.addEventListener('DOMContentLoaded', async function() {
    if (typeof lucide !== 'undefined') lucide.createIcons();

    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');
    const iframe = document.getElementById('game-iframe');
    const titleElement = document.getElementById('game-title');
    const coverPlaceholder = document.getElementById('game-cover-placeholder');
    const gameDisplayContainer = document.getElementById('game-display-container');

    let displayTitle = "Unknown Game";
    let gameLink = null;

    if (gameId) {
        const allGamesData = await loadGameData();
        
        if (allGamesData && Array.isArray(allGamesData)) {
            const gameData = allGamesData.find(g => g.id === gameId);
            
            if (gameData) {
                displayTitle = gameData.title || formatTitle(gameId);

                if (gameData.link) {
                    gameLink = gameData.link;
                } else {
                    gameLink = `/games/${gameId}/index.html`;
                }

                if (titleElement) titleElement.textContent = displayTitle;
                document.title = displayTitle + ' | Games & Stuff';
                if (iframe) iframe.src = gameLink;

                if (coverPlaceholder) {
                    const img = document.createElement('img');
                    img.src = gameData.image || `/images/${gameId}.png`;
                    img.alt = `Cover image for ${displayTitle}`;
                    img.className = 'max-w-full max-h-full object-contain object-cover';
                    img.onload = function() {
                        coverPlaceholder.innerHTML = '';
                        coverPlaceholder.appendChild(img);
                    };
                    if (img.complete && img.naturalHeight !== 0) {
                        coverPlaceholder.innerHTML = '';
                        coverPlaceholder.appendChild(img);
                    }
                }
                return;
            }
        }
    }
    
    if (gameDisplayContainer) {
        gameDisplayContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-[50vh] text-center p-10 rounded-3xl border-2">
                <h1 class="text-4xl font-bold mb-4">Game Not Found</h1>
                <p class="text-xl mb-6">No game ID found, or the game data is incomplete.</p>
            </div>
        `;
        document.title = 'Error | Games & Stuff';
    }
});