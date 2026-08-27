const idValue = new URLSearchParams(window.location.search).get("id");

fetch('./games.json')
  .then(response => response.json())
  .then(games => {
    const game = games.find(game => game.id === idValue);
    
    const frame = document.createElement("iframe");
    frame.src = game.link;
    document.body.appendChild(frame);

    const info_title = document.getElementById('info-title');
    info_title.textContent = game.name

    document.getElementById('fs-btn').addEventListener('click', function(e) {
      if (!document.fullscreenElement) {
        frame.requestFullscreen()
      }
    });
});