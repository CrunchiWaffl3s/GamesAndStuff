const game_cards = document.getElementById('game-cards');

fetch('./games.json')
  .then(response => response.json())
  .then(data => {
    data.sort((a, b) => a.name.localeCompare(b.name));
    data.forEach(game => {
      const card = document.createElement('a');
      const card_img = document.createElement('img')
      const card_title = document.createElement('p');

      card.classList.add('a');
      card.href = `/game.html?id=${game.id}`;
      card_title.textContent = game.name.length > 17 
        ? game.name.slice(0, 14) + '...' 
        : game.name;

      card.classList.add('img');
      card_img.src = `/images/${game.id}.png`;

      card.appendChild(card_img);
      card.appendChild(card_title);
      game_cards.appendChild(card);

      VanillaTilt.init(card, {
          max: 20,
          speed: 400
      });
    });
  });