let allGames = [];
let selectMode = false;
let selectedGames = new Set();
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

async function deleteUserGame(gameId) {
    await openDB();
    if (!db || !db.objectStoreNames.contains(USER_GAMES_STORE)) return;
    return new Promise((resolve, reject) => {
        const tx = db.transaction(USER_GAMES_STORE, 'readwrite');
        const store = tx.objectStore(USER_GAMES_STORE);
        const request = store.delete(gameId);
        request.onsuccess = () => resolve();
        request.onerror = e => reject(e);
    });
}

function initializeGameLoader(cardStyleClass) {
    loadGames(cardStyleClass);
}

function renderGameCards(cardStyleClass, games) {
    const container = document.getElementById('game-grid');
    container.innerHTML = '';

    const addGameCardHtml = `
        <a href="/GamesAndStuff/add.html" class="rounded-3xl p-5 transform hover:scale-[1.04] transition duration-300 ease-in-out cursor-pointer group w-60 h-60 mx-auto border-2 relative flex flex-col justify-center items-center">
            <div class="w-32 h-32 overflow-hidden rounded-2xl bg-transparent flex justify-center">
                <div data-lucide="plus" class="icon-plus w-full h-full justify-center"></div>
            </div>
            <div class="mt-4 text-center">
                <h2 class="text-xl font-bold text-center">Add Game</h2>
            </div>
        </a>
    `;
    container.insertAdjacentHTML('beforeend', addGameCardHtml);

    if (window.lucide) {
        window.lucide.createIcons();
    }

    if (!games || games.length === 0) {
        container.innerHTML += '<div class="col-span-full text-center text-xl mt-6">No games found.</div>';
    } else {
        games.forEach(game => {
            const displayName = game.title;
            const gameId = game.id;
            const gameImageUrl = game.image || `/images/${gameId}.png`;
            const gameLink = `/GamesAndStuff/game.html?game=${gameId}`;

            const card = document.createElement('a');
            card.href = gameLink;
            card.className = 'block ' + cardStyleClass + ' rounded-3xl p-5 transform hover:scale-[1.04] transition duration-300 ease-in-out cursor-pointer group w-60 h-60 mx-auto border-2 relative';
            
            card.innerHTML = `
                <div class="w-full flex justify-center">
                    <div class="w-32 h-32 overflow-hidden rounded-2xl border-2 bg-transparent flex justify-center items-center">
                        <img src="${gameImageUrl}" 
                            class="max-w-full max-h-full object-contain transition-opacity duration-300" 
                            onerror="handleImageError(this)" 
                            alt="Cover image for ${displayName}">
                    </div>
                </div>
                <div class="mt-4 text-center">
                    <h2 class="text-xl font-bold text-current">${displayName}</h2>
                </div>
            `;

            if (selectMode) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'absolute top-2 left-2 peer shrink-0 border-2 appearance-none w-4 h-4 rounded-full mt-1 checked:bg-blue-400 checked:border-0'; 
                checkbox.checked = selectedGames.has(gameId);
                
                checkbox.addEventListener('change', (e) => {
                    e.stopPropagation(); 
                    if (checkbox.checked) {
                        selectedGames.add(gameId);
                    } else {
                        selectedGames.delete(gameId);
                    }
                });
                
                card.onclick = (e) => {
                    if (selectMode && e.target !== checkbox) {
                        e.preventDefault(); 
                        checkbox.checked = !checkbox.checked;
                        checkbox.dispatchEvent(new Event('change'));
                    }
                };

                card.appendChild(checkbox);
            }

            container.appendChild(card);
        });
        if (window.lucide) { lucide.createIcons(); }
    }
}

function handleImageError(imgElement) {
    const template = document.getElementById('game-placeholder-template');
    if (template) {
        const clone = template.content.cloneNode(true);
        const parent = imgElement.parentElement;
        parent.innerHTML = ''; 
        parent.appendChild(clone);

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
}

function toggleSelectMode() {
    selectMode = !selectMode;
    selectedGames.clear();
    renderGameCards('bg-transparent', allGames);
}

async function deleteSelectedGames() {
    if (selectedGames.size === 0) return alert("No games selected.");
    if (!confirm(`Delete ${selectedGames.size} selected game(s) from the database? This is permanent.`)) return;

    for (const gameId of selectedGames) {
        await deleteUserGame(gameId);
    }
    
    allGames = allGames.filter(g => !selectedGames.has(g.id));
    selectedGames.clear();
    renderGameCards('bg-transparent', allGames);
}

function applySearchFilter(cardStyleClass) {
    const query = document.getElementById('game-search').value.trim().toLowerCase();
    const filtered = allGames.filter(g => g.title.toLowerCase().includes(query));
    renderGameCards(cardStyleClass, filtered);
}

async function loadGames(cardStyleClass) {
    const container = document.getElementById('game-grid');
    try {
        const response = await fetch('/games.json');
        let defaultGames = await response.json();
        defaultGames = defaultGames.filter(g => g.id && g.title);
        
        const userGames = await getUserGames();

        allGames = [...defaultGames, ...userGames];
        allGames.sort((a, b) => a.title.localeCompare(b.title));

        renderGameCards(cardStyleClass, allGames);

        const searchInput = document.getElementById('game-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => applySearchFilter(cardStyleClass));
        }
    } catch (err) {
        container.innerHTML =
            '<div class="col-span-full text-center text-xl text-red-400 font-semibold mt-10">Error loading games.</div>';
        console.error(err);
    }
}

window.addEventListener('DOMContentLoaded', function () {
    initializeGameLoader('bg-transparent');

    const btnContainer = document.createElement('div');
    btnContainer.className = 'flex justify-center gap-4 mb-6';
    btnContainer.innerHTML = `
        <button id="select-mode-btn" class="px-4 py-2 rounded-full border-2">Select Games</button>
        <button id="delete-selected-btn" class="px-4 py-2 rounded-full border-2">Delete Selected</button>
    `;
    
    const maxWContainer = document.querySelector('.max-w-7xl');
    if (maxWContainer) {
        maxWContainer.prepend(btnContainer);
    }

    const selectBtn = document.getElementById('select-mode-btn');
    const deleteBtn = document.getElementById('delete-selected-btn');
    
    if (selectBtn) selectBtn.addEventListener('click', toggleSelectMode);
    if (deleteBtn) deleteBtn.addEventListener('click', deleteSelectedGames);
});