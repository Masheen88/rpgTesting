//3:03:44 in tutorial vid.

console.log("First Test");

console.log("Imported collsions array:", collisions);

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

//Desktop 16/9 aspect ratio
canvas.width = 1024;
canvas.height = 576;
console.log("Canvas element:", canvas);
console.log("Canvas context:", context);

const collisionsMap = [];
//70 is the width of the map. 70 * 16 = 1120
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, i + 70));
}
console.log("Collision Map:", collisionsMap);

class Boundary {
  static width = 64;
  static height = 64;
  constructor({ position }) {
    this.position = position;
    this.width = 64; // This is due to the size of the tiles being zoomed x4
    this.height = 64; // ^ same as above.
  }

  drawBoundary() {
    context.fillStyle = "red";
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

const boundaries = []; //array to hold all the boundaries

const offset = {
  x: -1605,
  y: -1195,
};

//loops through the collision map
collisionsMap.forEach((row, rowIndex) => {
  // loops through each symbol in the row
  row.forEach((symbol, symbolIndex) => {
    //13 is the symbol for a boundary exported from the Tiled map
    if (symbol === 13) {
      boundaries.push(
        new Boundary({
          position: {
            x: symbolIndex * Boundary.width + offset.x,
            y: rowIndex * Boundary.width + offset.y,
          },
        })
      );
    }
  });
});

console.log("Boundaries:", boundaries);

//Creates a white rectangle width and height of the canvas
// context.fillStyle = "white";
// context.fillRect(0, 0, canvas.width, canvas.height);

const backgroundImage = new Image(); // Used to load an image into the canvas
// image.src = "./images/mattTesting.png"; //map image with no zoom
backgroundImage.src = "./images/mattTesting400Zoom.png"; //map image with 400% zoom
console.log("Image element:", backgroundImage);

// context.drawImage(document.querySelector(image, 0, 0)); //draws the image from the top left corner

const playerImage = new Image(); // Used to load an image into the canvas
playerImage.src = "./images/characters.png"; //player image
console.log("Player image element:", playerImage);

//When the image loads in the object, execute the code in the function
//Ensures the image is able to load first before drawing it
// backgroundImage.onload = function () {
//   // context.drawImage(image, -1605, -1195); //loads the map
//   /* //loads the player
//   context.drawImage(
//     playerImage,
//     0, //x position of the image - cropping
//     0, //y position of the image - cropping
//     playerImage.width / 8, // 8 is the number of frames in the sprite sheet - cropping
//     playerImage.height / 3, // 3 is the number of rows in the sprite sheet - cropping
//     canvas.width / 2 - playerImage.width / 4 / 8, //x position of the image on the canvas - actual position
//     canvas.height / 2, //y position of the image on the canvas - actual position
//     playerImage.width / 2, //width of the image on the canvas - actual size
//     playerImage.height / 1 //height of the image on the canvas - actual size
//   );*/
// };

//class to store sprite data
class Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = {
      maxCropWidth: 1,
      maxCropHeight: 1,
      maxImageWidth: 1,
      maxImageHeight: 1,
    },
  }) {
    this.position = position;
    this.image = image;
    this.frames = frames;
    this.image.onload = () => {
      this.imageWidth = this.image.width / this.frames.maxCropWidth;
      this.imageHeight = this.image.height / this.frames.maxCropHeight;
      //   console.log("Image width:", this.imageWidth);
      //   console.log("Image height:", this.imageHeight);
    };
  }

  //method to update the sprite's position
  drawCharacter() {
    // console.log("drawCharacter:", this.image);
    // context.drawImage(this.image, this.position.x, this.position.y); //loads the map

    context.drawImage(
      this.image,
      0, //x position of the image - cropping
      0, //y position of the image - cropping
      this.image.width / this.frames.maxCropWidth, // 8 is the number of frames in the sprite sheet - cropping
      this.image.height / this.frames.maxCropHeight, // 3 is the number of rows in the sprite sheet - cropping
      this.position.x,
      this.position.y,
      this.image.width / this.frames.maxImageWidth, //width of the image on the canvas - actual size
      this.image.height / this.frames.maxImageHeight //height of the image on the canvas - actual size
    );
  }
}

// canvas.width / 2 - this.image.width / 4 / 8, //x position of the image on the canvas - actual position
// canvas.height / 2, //y position of the image on the canvas - actual position

const player = new Sprite({
  position: {
    x: canvas.width / 2 - 144 / 4 / 8,
    y: canvas.height / 4 - -180 / 2,
  },
  image: playerImage,
  frames: {
    maxCropWidth: 8,
    maxCropHeight: 3,
    maxImageWidth: 2,
    maxImageHeight: 1,
  },
});

const background = new Sprite({
  position: { x: offset.x, y: offset.y },
  image: backgroundImage,
});
console.log("background Class:", background);

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};
// const testingBoundary = new Boundary({
//   position: { x: 400, y: 400 },
// });

const movables = [background, ...boundaries];
function collisionDetection({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.imageWidth >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
    rectangle1.position.y + rectangle1.imageHeight >= rectangle2.position.y &&
    rectangle1.position.y + rectangle1.imageHeight >= rectangle2.position.y
  );
}

function animateCharacter() {
  window.requestAnimationFrame(animateCharacter); //uses an infinite loop to keep the character 'moving'
  //draws the background
  background.drawCharacter();

  //draws the boundaries
  boundaries.forEach((boundary) => {
    boundary.drawBoundary();
  });
  //   testingBoundary.drawBoundary();

  player.drawCharacter();
  let moving = true;
  if (keys.w.pressed && lastKey === "w") {
    // console.log("w pressed");

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collisionDetection({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: { x: boundary.position.x, y: boundary.position.y + 3 },
          },
        })
      ) {
        console.log("Boundary hit");
        moving = false;
        break;
      }
    }

    if (moving) {
      movables.forEach((movable) => {
        movable.position.y += 3;
      });
    }
  } else if (keys.a.pressed && lastKey === "a") {
    // console.log("a pressed");

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collisionDetection({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: { x: boundary.position.x + 1, y: boundary.position.y },
          },
        })
      ) {
        console.log("Boundary hit");
        moving = false;
        break;
      }
    }

    if (moving) {
      movables.forEach((movable) => {
        movable.position.x += 3;
      });
    }
  } else if (keys.s.pressed && lastKey === "s") {
    // console.log("s pressed");

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collisionDetection({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: { x: boundary.position.x, y: boundary.position.y - 48 },
          },
        })
      ) {
        console.log("Boundary hit");
        moving = false;
        break;
      }
    }

    if (moving) {
      movables.forEach((movable) => {
        movable.position.y -= 3;
      });
    }
  } else if (keys.d.pressed && lastKey === "d") {
    // console.log("d pressed");

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collisionDetection({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: { x: boundary.position.x - 48, y: boundary.position.y },
          },
        })
      ) {
        console.log("Boundary hit");
        moving = false;
        break;
      }
    }

    if (moving) {
      movables.forEach((movable) => {
        movable.position.x -= 3;
      });
    }
  }
}
animateCharacter();

//event listener for keydown that takes in an event
//This uses a switch case to determine if w, a, s, or d is pressed
let lastKey = "";
window.addEventListener("keydown", function (event) {
  //   console.log("Event Key pressed:", event.key);
  switch (event.key) {
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      //   console.log("W pressed");
      break;
    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      //   console.log("A pressed");
      break;
    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      //   console.log("S pressed");
      break;
    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      //   console.log("D pressed");
      break;
  }
  //   console.log("Keys True:", keys);
});

//event listener for keyup that takes in an event
//This uses a switch case to determine if w, a, s, or d is released
window.addEventListener("keyup", function (event) {
  //   console.log("Event Key released:", event.key);
  switch (event.key) {
    case "w":
      keys.w.pressed = false;
      //   console.log("W released");
      break;
    case "a":
      keys.a.pressed = false;
      //   console.log("A released");
      break;
    case "s":
      keys.s.pressed = false;
      //   console.log("S released");
      break;
    case "d":
      keys.d.pressed = false;
      //   console.log("D released");
      break;
  }
  //   console.log("Keys False:", keys);
});
