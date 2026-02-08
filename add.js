const DB_NAME = 'gameLoaderDB';
const DB_VERSION = 3; 
const USER_GAMES_STORE = 'userGames';
let db;

async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = e => {
            db = e.target.result;
            if (!db.objectStoreNames.contains(USER_GAMES_STORE)) {
                db.createObjectStore(USER_GAMES_STORE, { keyPath: 'id' });
            }
        };

        request.onsuccess = e => { 
            db = e.target.result; 
            resolve(db);
        };
        request.onerror = e => reject(e);
    });
}

async function saveUserGame(game) {
    await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(USER_GAMES_STORE, 'readwrite');
        const store = tx.objectStore(USER_GAMES_STORE);
        const request = store.put(game);
        request.onsuccess = () => resolve();
        request.onerror = e => reject(e);
    });
}

function convertGitHubToGitHack(repoUrl) {
    const fileRegex = /^(?:https?:\/\/)?github\.com\/([^\/]+)\/([^\/]+)\/(?:tree|blob)\/([^\/]+)\/(.+?\.html)$/i;
    const simplifiedFileRegex = /^(?:https?:\/\/)?github\.com\/([^\/]+)\/([^\/]+)\/([^/]+?\.html)$/i;
    const repoRootRegex = /^(?:https?:\/\/)?github\.com\/([^\/]+)\/([^\/]+)\/?$/i;
    let match;
    match = repoUrl.match(fileRegex);
    if (match) {
        const user = match[1];
        const repo = match[2].replace(/\.git$/, ''); 
        const branch = match[3];
        const filePath = match[4];
        return `https://raw.githack.com/${user}/${repo}/${branch}/${filePath}`;
    }
    match = repoUrl.match(simplifiedFileRegex);
    if (match) {
        const user = match[1];
        const repo = match[2].replace(/\.git$/, ''); 
        const filePath = match[3];
        return `https://raw.githack.com/${user}/${repo}/master/${filePath}`;
    }
    match = repoUrl.match(repoRootRegex);
    if (match) {
        const user = match[1];
        const repo = match[2].replace(/\.git$/, ''); 
        return `https://raw.githack.com/${user}/${repo}/master/index.html`;
    }

    return null;
}

let selectedMethod = null;

document.querySelectorAll('.method-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        selectedMethod = btn.dataset.method;
        document.getElementById('method-selection').classList.add('hidden');
        document.getElementById('addGameForm').classList.remove('hidden');

        const dynamicInput = document.getElementById('dynamic-input');
        dynamicInput.innerHTML = ''; 

        if (selectedMethod === 'repo') {
            dynamicInput.innerHTML = `
                <label class="block mb-2 font-bold text-lg">GitHub File URL *</label>
                <input type="text" id="repoLink" placeholder="https://github.com/user/repo/index.html"
                    class="w-full px-4 py-3 rounded-full bg-transparent border-2 focus:outline-none">
            `;
        } else if (selectedMethod === 'embed') {
            dynamicInput.innerHTML = `
                <label class="block mb-2 font-bold text-lg">Embed Link *</label>
                <input type="text" id="embedLink" placeholder="example.com/game.html"
                    class="w-full px-4 py-3 rounded-full bg-transparent border-2 focus:outline-none">
            `;
        }
    });
});

document.getElementById('addGameForm').addEventListener('submit', async e => {
    e.preventDefault();

    const name = document.getElementById('gameName').value.trim();
    if (!name) { alert("Game name is required!"); return; }

    let finalLink = null;
    let rawLink = null; 

    if (selectedMethod === 'repo') {
        rawLink = document.getElementById('repoLink').value.trim();
        if (!rawLink) { alert("Repo URL is required!"); return; }
        
        finalLink = convertGitHubToGitHack(rawLink);
        if (!finalLink) { alert("Invalid GitHub URL format. Please provide the full path to an .html file (e.g., github.com/user/repo/index.html)."); return; }

    } else if (selectedMethod === 'embed') {
        rawLink = document.getElementById('embedLink').value.trim();
        if (!rawLink) { alert("Embed link is required!"); return; }
        if (!/^https?:\/\//i.test(rawLink)) rawLink = 'https://' + rawLink;
        finalLink = rawLink;
    }

    let image = document.getElementById('imageLink')?.value.trim() || null;
    const imageFile = document.getElementById('imageUpload')?.files[0];

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = async function() {
            image = reader.result;
            await storeAndRedirect();
        };
        reader.readAsDataURL(imageFile);
    } else {
        await storeAndRedirect();
    }

    async function storeAndRedirect() {
        if (!finalLink) { alert("A valid link is required"); return; }
        
        const newGame = {
            id: name.replace(/\s+/g, '_').toLowerCase(),
            title: name,
            link: finalLink, 
            image: image
        };
        await saveUserGame(newGame);

        alert('Game added successfully!');
        window.location.href = '/games.html';
    }
});