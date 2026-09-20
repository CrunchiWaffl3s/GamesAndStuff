const game_cards = document.getElementById('game-cards');

function GameCard(game) {
    const card = document.createElement('a');
    const card_img = document.createElement('img');
    const card_title = document.createElement('p');

    card.classList.add('a');
    card.href = `/game.html?id=${game.id}`;
    card.textContent = '';
    card_title.textContent = game.name.length > 17 ? game.name.slice(0, 14) + '...' : game.name;
    card_img.src = game.image ? game.image : `/images/${game.id}.png`;
    card_img.alt = game.name;

    card.appendChild(card_img);
    card.appendChild(card_title);
    game_cards.appendChild(card);
    VanillaTilt.init(card, { max: 20, speed: 400 });
}

function addGameCard() {
    const card = document.createElement('a');
    const card_img = document.createElement('img');
    const card_title = document.createElement('p');

    card.classList.add('a');
    card.href = '#';
    card_title.textContent = 'Add New Game';
    card_img.src = '/images/add.svg';

    card.addEventListener('click', (e) => {
        e.preventDefault();
        NewGame();
    });

    card.appendChild(card_img);
    card.appendChild(card_title);
    game_cards.appendChild(card);
    VanillaTilt.init(card, { max: 20, speed: 400 });
}

function loadAllGames() {
    game_cards.innerHTML = '';
    addGameCard();
    fetch('./games.json')
        .then(response => response.json())
        .then(jsonData => {
            const localGames = JSON.parse(localStorage.getItem('customGames')) || [];
            const allGames = [...jsonData, ...localGames];
            allGames.sort((a, b) => a.name.localeCompare(b.name));
            allGames.forEach(game => GameCard(game));
        })
}

function NewGame() {
  const name = prompt("Enter game name:"); 
  if (!name) return; 
  const url = prompt("Enter game URL:"); 
  if (!url) return; 

  const fileInput = document.createElement('input'); 
  fileInput.type = 'file'; 
  fileInput.accept = 'image/*'; 

  let fileSelected = false;

  fileInput.onchange = (e) => { 
      const file = e.target.files[0]; 
      if (!file) { 
          saveNewGame(name, url, '/images/default.svg'); 
          return; 
      } 
      
      fileSelected = true;
      const reader = new FileReader(); 
      reader.onload = (event) => { 
          saveNewGame(name, url, event.target.result); 
      }; 
      reader.readAsDataURL(file); 
  }; 

  window.addEventListener('focus', () => {
      setTimeout(() => {
          if (!fileSelected && !fileInput.value) {
              saveNewGame(name, url, '/images/default.svg');
          }
      }, 300);
  }, { once: true });
  fileInput.click(); 
} 

function saveNewGame(name, url, imageData) {
    const localGames = JSON.parse(localStorage.getItem('customGames')) || [];
    const newGame = {
        id: 'custom_' + Date.now(),
        name: name,
        url: url,
        image: imageData || '/images/default.svg' 
    };
    
    localGames.push(newGame);
    localStorage.setItem('customGames', JSON.stringify(localGames));
    loadAllGames();
}

loadAllGames();