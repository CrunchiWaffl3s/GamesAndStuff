const game_cards = document.getElementById('game-cards');

function GameCard(game) {
  const card = document.createElement('a');
  const card_img = document.createElement('img');
  const card_title = document.createElement('p');

  card.classList.add('game-card');
  card.dataset.gameId = game.id;
  card.href = `/game.html?id=${game.id}`
  card.classList.add('a');
  card_img.src = game.image ? game.image : (game.isCustom ? '/images/default.svg' : `/images/${game.id}.png`);
  card.textContent = '';
  card_title.textContent = game.name.length > 17 ? game.name.slice(0, 14) + '...' : game.name;
  card_img.alt = game.name;

  card.appendChild(card_img);
  card.appendChild(card_title);
  game_cards.appendChild(card);

  VanillaTilt.init(card, { max: 20, speed: 400 });
}

function loadAllGames() {
  game_cards.innerHTML = '';
  fetch('./games.json')
    .then(response => response.json())
    .then(jsonData => {
      const localGames = JSON.parse(localStorage.getItem('customGames')) || [];
      const allGames = [...jsonData, ...localGames];
      allGames.sort((a, b) => a.name.localeCompare(b.name));
      allGames.forEach(game => GameCard(game));
    })
}

window.newGame = function() {
  const name = prompt("Enter game name:");
  if (!name) return;
  const url = prompt("Enter game URL:");
  if (!url) return;
  saveNewGame(name, url);
};

function saveNewGame(name, url) {
  const localGames = JSON.parse(localStorage.getItem('customGames')) || [];
  const newGame = { id: Date.now(), name: name, url: url, isCustom: true };
  
  localGames.push(newGame);
  localStorage.setItem('customGames', JSON.stringify(localGames));
  loadAllGames();
}

loadAllGames();

const selecto = new Selecto({
  container: game_cards,
  dragContainer: game_cards,
  selectableTargets: ['.game-card'],
  selectByClick: true,
  selectFromInside: true,
  continueSelect: true,
  keyContainer: window,
  hitRate: 100
});

selecto.on('select', e => {
  if (!removeMode) return;
  e.added.forEach(el => { el.classList.add('selected'); });
  e.removed.forEach(el => { el.classList.remove('selected'); });
});

const removeButton = document.getElementById('rmv-game-btn');
const deleteButton = document.getElementById('del-btn');
let removeMode = false;

removeButton.addEventListener('click', () => {
  removeMode = !removeMode;
  if (removeMode) {
    document.body.classList.add('remove-mode');
    deleteButton.classList.remove('hidden');
    deleteButton.classList.add('flex');
  } else {
    document.body.classList.remove('remove-mode');
    deleteButton.classList.add('hidden');
    deleteButton.classList.remove('flex');
    selecto.setSelectedTargets([]);
  }
});

game_cards.addEventListener('click', e => {
  if (removeMode && e.target.closest('.game-card')) {
    e.preventDefault();
  }
});

deleteButton.addEventListener('click', () => {
  const selectedCards = selecto.getSelectedTargets();
  if (selectedCards.length === 0) return;

  const selectedIds = selectedCards.map(card => String(card.dataset.gameId));
  let localGames = JSON.parse(localStorage.getItem('customGames')) || [];

  localGames = localGames.filter(game => !selectedIds.includes(String(game.id)));
  localStorage.setItem('customGames', JSON.stringify(localGames));

  removeMode = false;
  document.body.classList.remove('remove-mode');
  deleteButton.classList.add('hidden');
  deleteButton.classList.remove('flex');
  selecto.setSelectedTargets([]);
  loadAllGames();
});

const searchInput = document.getElementById('game-search');

searchInput.addEventListener('input', () => {
  const search = searchInput.value.toLowerCase().trim();
  const cards = document.querySelectorAll('.game-card');

  cards.forEach(card => {
    const name = card.querySelector('p').textContent.toLowerCase();
    card.style.display = name.includes(search) ? '' : 'none';
  });
});