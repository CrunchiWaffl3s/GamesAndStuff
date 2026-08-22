const idValue = new URLSearchParams(window.location.search).get("id");

fetch('./games.json')
  .then(response => response.json())
  .then(games => {
    const game = games.find(game => game.id === idValue);
    
    const frame = document.createElement("iframe");
    frame.src = game.link;
    frame.title = game.name;

    document.body.appendChild(frame);
});