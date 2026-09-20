const idValue = new URLSearchParams(window.location.search).get("id");

fetch('./games.json')
  .then(response => response.json())
  .then(games => {
    const game = games.find(game => game.id === idValue);
    
    const frame = document.getElementById("frame");
    frame.src = game.link;

    const info_title = document.getElementById('info-title');
    info_title.textContent = game.name

    const battery_level = document.getElementById('battery');

    function updateBatteryUI(battery) {
      if (!battery || battery.level === undefined || battery.level === null || battery.chargingTime === 0 || battery.dischargingTime === Infinity) {
        battery_level.innerHTML = `
          <span class="material-symbols-rounded">battery_unknown</span>
          <span>N/A</span>
        `;
        return;
      }

      const level = Math.round(battery.level * 100);
      battery_level.innerHTML = `
        <span class="material-symbols-rounded">battery_full</span>
        <span>${level}%</span>
      `;
    }


    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        updateBatteryUI(battery);
        battery.addEventListener('levelchange', () => updateBatteryUI(battery));
      });
    };

    function update_clock() {
      const now = new Date();

      const time_string = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const time = document.getElementById('time');
      if (time) {
        time.innerHTML = `
          <span class="mr-1 material-symbols-rounded">nest_clock_farsight_analog</span>
          <span>${time_string}</span>
          `;
        };
    };

    update_clock();
    setInterval(update_clock, 1000);

    document.getElementById('fs-btn').addEventListener('click', function(e) {
      if (!document.fullscreenElement) {
        frame.requestFullscreen()
      }
    });

    document.getElementById('reload-btn').addEventListener('click', function(e) {
      frame.src = game.link;
    });

    document.getElementById('newtab-btn').addEventListener('click', function(e) {
      const new_tab = window.open('about:blank', '_blank');
      
      new_tab.document.body.style.margin = '0';
      new_tab.document.body.style.height = '100vh';
      new_tab.document.body.style.width = '100vw';
      new_tab.document.body.style.overflow = 'hidden';

      const newtab_frame = new_tab.document.createElement('iframe');

      newtab_frame.src = frame.src;
      newtab_frame.style.width = '100%';
      newtab_frame.style.height = '100%';
      newtab_frame.style.border = 'none';

      new_tab.document.body.appendChild(newtab_frame);
    });
    document.getElementById('home-btn').addEventListener('click', function(e) {
      window.location.replace("/");
    });
});