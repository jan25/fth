/// <reference types="node" path="./node_modules/@types/p5/index.d.ts" />;

let map;
let sprite;
let spriteX, spriteY; // Sprite's x and y coordinates
let spriteWidth = 25; // Width of the sprite
let spriteHeight = 25; // Height of the sprite
let speed = 1;

let INF = 1000000;
let streets = []; // [startx, starty, endx, endy]
let hearts = [];

let points = [
  [296, 250.5],
  [376, 175.5],
  [436, 241.5],
  [360, 248.5],
  [354, 317.5],
  [428, 316.5],
  [377, 219.5],
  [449, 175.5],
  [365, 46.5],
  [230, 177.5],
  [324, 268.5],
  [142, 258.5],
  [281, 189.5],
  [227, 63.5],
  [191, 310.5],
  [297, 314.5],
  [291, 386.5],
  [188, 381.5],
  [190, 309.5],
  [101, 316.5],
  [98, 388.5],
  [123, 466.5],
  [198, 444.5],
  [187, 379.5],
  [95, 388.5],
];
let SPACE = 32;
let PRINT = 80;

let targetPoints = [];

let debugEnabled = false;

function preload() {
  // Load the sprite image (replace with your image path)
  spriteImage = loadImage("mario.png"); // Or comment this out if you're not using an image
  // Non synchronous file load, map maybe undefined if used here.
  map = loadJSON(
    "/preprocess_map_output.json",
    (data) => console.log("data", JSON.parse(JSON.stringify(data))),
    (err) => console.error("err", err)
  );
}

function setup() {
  createCanvas(500, 500);

  map = new Map(map.map);
  console.log(map);

  //   spriteX = width / 2 - spriteWidth / 2; // Center the sprite horizontally
  //   spriteY = height / 2 - spriteHeight / 2; // Center the sprite vertically
  //   spriteX = 50;
  //   spriteY = 10;

  const startPos = map.entries().next().value[0];
  console.log("startPos", startPos);

  [spriteX, spriteY] = [startPos.x, startPos.y];

  streets.push([10, 10, 100, 10]);
  streets.push([10, 100, 100, 100]);
  streets.push([20, 5, 20, 110]);
  streets.push([90, 5, 90, 110]);

  for (i = 1; i < points.length; ++i) {
    streets.push([...points[i - 1], ...points[i]]);

    let [x1, y1] = points[i - 1];
    let [x2, y2] = points[i];
    hearts.push([(x1 + x2) / 2, (y1 + y2) / 2]);
  }

  for (h = 0; h < 5; ++h) {
    hearts.push([
      Math.round(Math.random() * 500),
      Math.round(Math.random() * 500),
    ]);
  }

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
    spriteX -= speed;
    moveAlongLine(-1);
  } else if (keyIsDown(RIGHT_ARROW)) {
    spriteX += speed;
    moveAlongLine(1);
  } else if (keyIsDown(UP_ARROW)) {
    spriteY -= speed;
    moveAlongLine(-1);
  } else if (keyIsDown(DOWN_ARROW)) {
    spriteY += speed;
    moveAlongLine(1);
  }

  if (keyIsDown(SPACE)) {
    console.log(points);
  }

  debugDrawLines();

  for (i = 0; i < streets.length; i++) {
    line(...streets[i]);
  }

  if (targetPoints.length > 0) {
    updateSprite();
  }
  renderSprite();

  renderHearts();
  const nearestHeartIdx = findNearestHeart();
  if (nearestHeartIdx !== null) {
    renderQuestion(nearestHeartIdx);
  }

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

function updateSprite() {
  let [targetX, targetY] = targetPoints[targetPoints.length - 1];
  const tolerance = 3;
  if (dist(spriteX, spriteY, targetX, targetY) < tolerance) {
    [spriteX, spriteY] = [targetX, targetY];
    targetPoints.pop();
    return;
  }

  const directionVec = createVector(targetX, targetY)
    .sub(createVector(spriteX, spriteY))
    .normalize();

  spriteX += speed * directionVec.x;
  spriteY += speed * directionVec.y;
}

function mouseClicked() {
  if (debugEnabled) {
    points.push([mouseX, mouseY]);
  }

  targetPoints = getTargetPoints(mouseX, mouseY);
}

function getTargetPoints(destX, destY) {
  return [[destX, destY]];
}

function debugDrawLines() {
  if (!debugEnabled) {
    return false;
  }
  if (points.length == 0) {
    return;
  }
  for (i = 1; i < points.length; ++i) {
    line(...points[i - 1], ...points[i]);
  }

  line(...points[points.length - 1], mouseX, mouseY);
}

function dist(x1, y1, x2, y2) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function findNearestHeart() {
  let nearestDist = dist(spriteX, spriteY, ...hearts[0]);
  let nearest = 0;
  for (i = 0; i < hearts.length; ++i) {
    let d = dist(spriteX, spriteY, ...hearts[i]);
    if (d < nearestDist) {
      nearest = i;
      nearestDist = d;
    }
  }

  let closestDist = 5;
  return nearestDist < closestDist ? nearest : null;
}

function renderQuestion(nearestHeartIdx) {
  fill("black");
  text(
    `At a heart: (${hearts[nearestHeartIdx][0]}, ${hearts[nearestHeartIdx][1]})`,
    250,
    450
  );
}

function renderHearts() {
  fill("green");
  const radius = 10;
  for (i = 0; i < hearts.length; ++i) {
    circle(hearts[i][0], hearts[i][1], radius);
  }
}

function renderSprite() {
  fill("red");
  circle(spriteX, spriteY, spriteWidth / 2);
}

function moveAlongLine(direction) {
  return;
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
