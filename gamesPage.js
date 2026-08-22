document.addEventListener("DOMContentLoaded", () => {
  const game_cards = document.getElementById('game-cards');
  if (!game_cards) return;

  fetch('./games.json')
    .then(response => response.json())
    .then(data => {
      data.forEach(game => {
        const card = document.createElement('a');
        const card_title = document.createElement('p');

        card.classList.add('a');
        card.href = `/game.html?id=${game.id}`;
        card_title.textContent = game.name;
        
        card.appendChild(card_title);
        game_cards.appendChild(card);
      });
    });
});
