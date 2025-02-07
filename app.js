/// <reference types="node" path="./node_modules/@types/p5/index.d.ts" />;

let spriteImage; // Variable to hold the sprite image
let spriteX, spriteY; // Sprite's x and y coordinates
let spriteWidth = 25; // Width of the sprite
let spriteHeight = 25; // Height of the sprite
let speed = 2;

let streets = []; // [startx, starty, endx, endy]

function preload() {
  // Load the sprite image (replace with your image path)
  spriteImage = loadImage("mario.png"); // Or comment this out if you're not using an image
}

function setup() {
  createCanvas(500, 500);
  //   spriteX = width / 2 - spriteWidth / 2; // Center the sprite horizontally
  //   spriteY = height / 2 - spriteHeight / 2; // Center the sprite vertically
  spriteX = 50;
  spriteY = 10;

  streets.push([10, 10, 100, 10]);
  streets.push([10, 100, 100, 100]);
  streets.push([20, 5, 20, 110]);
  streets.push([90, 5, 90, 110]);

  // If you are NOT using an image, you can create a p5.js shape here. For example:
  // sprite = createGraphics(spriteWidth, spriteHeight); // Create an off-screen graphics buffer
  // sprite.fill(0, 0, 255); // Blue color
  // sprite.rect(0, 0, spriteWidth, spriteHeight); // Draw a rectangle
}

function draw() {
  background(220); // Set a light gray background

  //   if (keyIsDown(LEFT_ARROW)) {
  //     spriteX -= 1;
  //     console.log(spriteX, spriteY);
  //   } else if (keyIsDown(RIGHT_ARROW)) {
  //     spriteX += 1;
  //   } else if (keyIsDown(UP_ARROW)) {
  //     spriteY -= 1;
  //   } else if (keyIsDown(DOWN_ARROW)) {
  //     spriteY += 1;
  //   }
  if (keyIsDown(LEFT_ARROW)) {
    moveAlongLine(-1);
  } else if (keyIsDown(RIGHT_ARROW)) {
    moveAlongLine(1);
  } else if (keyIsDown(UP_ARROW)) {
    moveAlongLine(1);
  } else if (keyIsDown(DOWN_ARROW)) {
    moveAlongLine(-1);
  }

  for (i = 0; i < streets.length; i++) {
    line(...streets[i]);
  }

  renderSprite();

  //   // Draw the sprite
  //   if (spriteImage) {
  //     image(spriteImage, spriteX, spriteY, spriteWidth, spriteHeight);
  //   } else if (sprite) {
  //     // If you created a p5.js shape
  //     image(sprite, spriteX, spriteY);
  //   } else {
  //     // Fallback: draw a rectangle if no image or shape
  //     fill(0, 0, 255);
  //     rect(spriteX, spriteY, spriteWidth, spriteHeight);
  //   }
}

function renderSprite() {
  fill(0, 0, 255);
  circle(spriteX, spriteY, spriteWidth / 2);
}

function moveAlongLine(direction) {
  let currentLineIndex = findCurrentLine(); // Find the line the character is on

  if (currentLineIndex !== -1) {
    //check if character is on line
    let line = streets[currentLineIndex];
    let dx = line[2] - line[0];
    let dy = line[3] - line[1];
    let lineLength = sqrt(dx * dx + dy * dy);

    // Calculate how far along the line the character is (0 to 1)
    let progress = calculateProgress(line);

    progress += (direction * speed) / lineLength; // Update progress

    // Constrain progress to 0-1
    progress = constrain(progress, 0, 1);

    // Calculate new character position
    spriteX = line[0] + dx * progress;
    spriteY = line[1] + dy * progress;
  }
}

function findCurrentLine() {
  for (let i = 0; i < streets.length; i++) {
    let line = streets[i];
    let d1 = dist(spriteX, spriteY, line[0], line[1]);
    let d2 = dist(spriteX, spriteY, line[2], line[3]);
    let lineLength = dist(line[0], line[1], line[2], line[3]);
    let tolerance = 5; // Adjust this value for how close the character must be

    if (d1 + d2 <= lineLength + tolerance) {
      //check if character is near line
      return i; // Return the index of the line
    }
  }
  return -1; // Return -1 if not on any line (error)
}

function calculateProgress(line) {
  let dx = line[2] - line[0];
  let dy = line[3] - line[1];
  let lineLengthSquared = dx * dx + dy * dy;

  // Dot product of vector from line start to character and the line vector
  let dotProduct = (spriteX - line[0]) * dx + (spriteY - line[1]) * dy;
  return dotProduct / lineLengthSquared; // Normalized progress (0 to 1)
}
