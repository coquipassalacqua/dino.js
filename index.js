const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");

let gameSpeed = 5;
let gravity = 0.5;
let gameOver = false;
let score = 0;
let highScore = Number(localStorage.getItem("dinoHighScore")) || 0;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.frequency.value = frequency;
  oscillator.type = "square";

  gain.gain.setValueAtTime(0.08, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration
  );

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

let dino = {
  x: 50,
  y: canvas.height - 47,
  width: 44,
  height: 47,
  vy: 0,
  isJumping: false
};

let obstacle = {
  x: canvas.width,
  y: canvas.height - 40,
  width: 25,
  height: 40
};

let dinoImg = new Image();
dinoImg.src = "dino.png";

let pinkImg = new Image();
pinkImg.src = "pink.png";

let cactusImg = new Image();
cactusImg.src = "cactus.png";

function gameLoop() {
  if (!gameOver) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  } else {
    draw();

    ctx.fillStyle = "#000";
    ctx.font = "24px Arial";
    ctx.fillText("¡Oops!", 230, 80);
  }
}

function update() {
  score++;

  highScore = Math.max(highScore, score);
  localStorage.setItem("dinoHighScore", highScore);

  // Aumenta la velocidad cada 100 puntos.
  gameSpeed = 5 + Math.floor(score / 100);

  // Sonido cada 100 puntos.
  if (score % 100 === 0) {
    playSound(880, 0.12);
  }

  // Física del salto.
  if (dino.isJumping) {
    dino.vy += gravity;
    dino.y += dino.vy;

    if (dino.y >= canvas.height - dino.height) {
      dino.y = canvas.height - dino.height;
      dino.isJumping = false;
      dino.vy = 0;
    }
  }

  // Movimiento del obstáculo.
  obstacle.x -= gameSpeed;

  if (obstacle.x + obstacle.width < 0) {
    obstacle.x = canvas.width + Math.random() * 200;
  }

  // Detección de colisiones.
  if (collision(dino, obstacle)) {
    gameOver = true;
  }
}

function collision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";

  ctx.fillText("Score: " + score, 10, 25);
  ctx.fillText("Record: " + highScore, 150, 25);

  // Usa pink.png cuando salta y dino.png cuando está en el suelo.
  const currentDinoImg = dino.isJumping ? pinkImg : dinoImg;

  if (
    currentDinoImg.complete &&
    currentDinoImg.naturalWidth > 0
  ) {
    ctx.drawImage(
      currentDinoImg,
      dino.x,
      dino.y,
      dino.width,
      dino.height
    );
  } else {
    ctx.fillStyle = dino.isJumping ? "blue" : "green";
    ctx.fillRect(
      dino.x,
      dino.y,
      dino.width,
      dino.height
    );
  }

  if (cactusImg.complete && cactusImg.naturalWidth > 0) {
    ctx.drawImage(
      cactusImg,
      obstacle.x,
      obstacle.y,
      obstacle.width,
      obstacle.height
    );
  } else {
    ctx.fillStyle = "brown";
    ctx.fillRect(
      obstacle.x,
      obstacle.y,
      obstacle.width,
      obstacle.height
    );
  }
}

document.addEventListener("keydown", function (e) {
  if (
    e.code === "Space" &&
    !dino.isJumping &&
    !gameOver
  ) {
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    dino.isJumping = true;
    dino.vy = -10;

    playSound(440, 0.1);

    e.preventDefault();
  }
});

restartBtn.addEventListener("click", function () {
  gameOver = false;
  score = 0;
  gameSpeed = 5;

  dino.y = canvas.height - dino.height;
  dino.isJumping = false;
  dino.vy = 0;

  obstacle.x = canvas.width;

  gameLoop();
});

window.onload = function () {
  gameLoop();
};