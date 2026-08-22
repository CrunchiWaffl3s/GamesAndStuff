const randomList = [
  "Welcome!",
  "This is the third verion of G&S btw!",
  "Hi",
  "Do you like waffles?",
  "Go ahead, play some games",
]

function randomText(list) {
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

const randomtext = document.getElementById("randomtext");
randomtext.textContent = randomText(randomList)