const THEMES = {
    'default': { name: 'Default (Red/Blue)', bg: 'bg-gradient-to-br from-[#ff0000] to-[#0000ff]', card: 'border-2', text: 'text-white' },
    'ocean': { name: 'Ocean', bg: 'bg-gradient-to-br from-blue-900 to-teal-500', card: 'border-2', text: 'text-white' },
    'forest': { name: 'Forest', bg: 'bg-gradient-to-br from-green-700 to-lime-300', card: 'border-2', text: 'text-white' },
    'sunset': { name: 'Sunset', bg: 'bg-gradient-to-br from-red-600 to-yellow-300', card: 'border-2', text: 'text-white' },
    'dark': { name: 'Dark', bg: 'bg-gray-800 bg-fixed', card: 'border-2', text: 'text-white' },
    'puredarkness': { name: 'Pure Darkness', bg: 'bg-black', card: 'border-2', text: 'text-white' },
    'blinding': { name: 'Blinding', bg: 'bg-white', card: 'border-2', text: 'text-black' },
    'bubblegum': { name: 'Bubblegum', bg: 'bg-pink-500', card: 'border-2', text: 'text-white' },
};

const body = document.body;

function applyTheme(themeKey) {
    const theme = THEMES[themeKey] || THEMES['default'];
    Object.values(THEMES).forEach(t => {
        if (t.bg) body.classList.remove(...t.bg.split(' ')); 
        if (t.text) body.classList.remove(...t.text.split(' ')); 
    });

    body.classList.add(...theme.bg.split(' '));
    body.classList.add(theme.text);
}

function saveTheme(themeKey) {
    try {
        localStorage.setItem('theme', themeKey);
    } catch (error) {
        console.error("Error saving theme to localStorage:", error);
    }
}

function createThemeButton(themeKey, theme) {
    const button = document.createElement('button');
    button.className = `p-6 rounded-2xl ${theme.card} transform hover:scale-[1.03] transition duration-300 ease-in-out cursor-pointer flex flex-col items-center`;
    button.innerHTML = `
        <div class="w-full h-24 rounded-lg mb-4 ${theme.bg} border-2 border-white"></div>
        <span class="text-xl font-bold">${theme.name}</span>
    `;
    button.addEventListener('click', () => {
        applyTheme(themeKey);
        saveTheme(themeKey);
    });
    return button;
}

function renderThemeButtons() {
    const container = document.getElementById('theme-buttons');
    Object.keys(THEMES).forEach(key => {
        container.appendChild(createThemeButton(key, THEMES[key]));
    });
}

function loadAndApplyInitialTheme() {
    try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && THEMES[savedTheme]) {
            applyTheme(savedTheme);
        } else {
            applyTheme('default');
        }
    } catch (error) {
        console.error("Error loading theme from localStorage:", error);
        applyTheme('default');
    }
}

loadAndApplyInitialTheme();
renderThemeButtons();