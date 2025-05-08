let CANVAS_W: number = 800;
let CANVAS_H: number = 608;

let TILE_W: number = 32;
let TILE_H: number = 32;

let TILES_X: number;
let TILES_Y: number;

let NUM_SPAWNERS = 5;

let ui: UI;

let player: Player;
let weaponManager: WeaponManager<Weapon>;
let sword: MeleeWeapon;

let fr: ForceRegistry;

let drag: Drag;
let userInput: UserInput;

let ch: ContactHelper;

// Artwork
let playerArt: p5.Image;
let weaponArt: p5.Image;
let weaponPlaceholderArt: p5.Image;
let rollingArt: p5.Image;
let wallArt: p5.Image;
let windowArt: p5.Image;
let wallCanvas: HTMLCanvasElement;
let wallPattern: CanvasPattern;
let grassArt: p5.Image[];

let attackSound: p5.SoundFile;
let mainFont: p5.Font;

let world: World;

let spawnManager: SpawnManager;
let blobs: BlobEnemy[];

let pathFinder: PathFinder;

// Textures
let floorTexture: p5.Graphics;

let gameover: boolean = false;
let startNewGame: boolean = false;

function preload() {
  grassArt = new Array();
  grassArt.push(loadImage("assets/grass_tile_0.png"));
  grassArt.push(loadImage("assets/grass_tile_1.png"));
  grassArt.push(loadImage("assets/grass_tile_2.png"));
  grassArt.push(loadImage("assets/grass_tile_3.png"));

  mainFont = loadFont("data/AtkinsonHyperlegible-Regular.ttf");

}

function setup() {
  // Setup
  createCanvas(CANVAS_W, CANVAS_H);

  noSmooth();
  
  TILES_X = Math.floor(CANVAS_W / TILE_W);
  TILES_Y = Math.floor(CANVAS_H / TILE_H);

  world = new World(CANVAS_W, CANVAS_H, TILE_W, TILE_H);

  pathFinder = new PathFinder(TILES_X, TILES_Y);

  // Create UI
  ui = new UI(0, 0);
  world.addStaticEntity(ui);

  // Create objects
  player = new Player(width / 2, height / 2, TILE_W * 0.8, TILE_W * 1.6);
  world.addEntity(player);

  weaponArt = loadImage("assets/sword_wooden.png");
  weaponPlaceholderArt = loadImage("assets/weapon_placeholder.png");
  attackSound = loadSound("data/swoosh.wav");

  spawnManager = new SpawnManager(3, 1.15);

  weaponManager = new WeaponManager<Weapon>(player, TILE_W, TILE_H);

  const roundUI = new RoundUI(spawnManager, TILE_W * 3, TILE_W);
  const healthUI = new HealthUI(TILE_W * 2, TILE_W);
  
  ui.add(roundUI);
  ui.add(healthUI);
  ui.add(weaponManager);

  sword = new MeleeWeapon(weaponArt, attackSound);
  world.addStaticEntity(sword);

  weaponManager.setWeapon(sword);

  // Vertical walls
  for (let i: number = 0; i < TILES_Y; i++) {
    world.setTile(0, i, new Wall(0,                     i * TILE_H, TILE_W, TILE_H));
    world.setTile(TILES_X - 1, i, new Wall((TILES_X - 1) * TILE_W,i * TILE_H, TILE_W, TILE_H));
  } 

  // Horizontal walls
  for (let i: number = 1; i < TILES_X - 1; i++) {
    world.setTile(i, 0, new Wall(i * TILE_W, 0,                      TILE_W, TILE_H));
    world.setTile(i, 1, new Wall(i * TILE_W, 1 * TILE_H,            TILE_W, TILE_H));
    world.setTile(i, TILES_Y - 1, new Wall(i * TILE_W, (TILES_Y - 1) * TILE_H, TILE_W, TILE_H));
  } 

  // Add inner walls
  const innerSize: number = 0.5;
  const doorSize: number = 0.3;

  const ulx: number = Math.floor((TILES_X * (1 - innerSize)) / 2);
  const uly: number = Math.floor(((TILES_Y - 1) * (1 - innerSize)) / 2) + 1;

  const innerWidth: number = Math.floor(TILES_X * innerSize);
  const innerHeight: number = Math.floor(TILES_Y * innerSize);
  const innerDoorHeight: number = Math.floor(innerHeight * doorSize);

  for (let i: number = ulx; i < ulx + innerWidth; i++) {
    world.setTile(i, uly, new Wall(i * TILE_W, uly * TILE_H,                     TILE_W, TILE_H));
    world.setTile(i, uly + innerHeight - 1, new Wall(i * TILE_W, (uly + innerHeight - 1) * TILE_H, TILE_W, TILE_H));
  } 

  let doorMin: number = uly + innerDoorHeight;
  let doorMax: number = uly + innerHeight - innerDoorHeight;
  for (let i: number = uly; i < uly + innerHeight; i++) {
    world.setTile(ulx, i, new Wall(ulx * TILE_W, i * TILE_H, TILE_W, TILE_H));

    if (doorMin > i || i >= doorMax) {
      world.setTile(ulx + innerWidth - 1, i, new Wall((ulx + innerWidth - 1) * TILE_W, i * TILE_H, TILE_W, TILE_H));
    }
  }

  // Create spawners
  blobs = [];
  let spawnPositions: Set<p5.Vector> = new Set<p5.Vector>();
  for (let i: number = 0; i < NUM_SPAWNERS; i++) {
    let y: number;
    let x: number;
    let offsetX: number = 0;
    let offsetY: number = 0;
    let valid: boolean = true;
    let pos: p5.Vector;

    do {
      let leftRight: number = Math.floor(Math.random() * 2);
      let ab: number = Math.floor(Math.random() * 2);

      if (leftRight == 1) {
        y = Math.floor(Math.random() * TILES_Y);
        if (ab == 1) {
          x = 0;
        } else {
          x = TILES_X - 1;
        }
      } else {
        x = Math.floor(Math.random() * TILES_X);
        if (ab == 1) {
          y = 1;
        } else {
          y = TILES_Y - 1;
        }
      }

      pos = createVector(x, y);
      if (spawnPositions.has(pos)) {
        valid = false;
        continue;
      }

      // Check and fetch the valid spawn position around the spawner
      valid = false;
      if (y > 0 && !world.tilesBlocked[x][y-1]) {
        offsetY = -1;
        valid = true;
        continue;
      }
      if (y < TILES_Y - 1 && !world.tilesBlocked[x][y+1]) {
        offsetY = 1;
        valid = true;
        continue;
      }
      if (x > 0 && !world.tilesBlocked[x-1][y]) {
        offsetX = -1;
        valid = true;
        continue;
      }
      if (x < TILES_X - 1 && !world.tilesBlocked[x+1][y]) {
        offsetX = 1;
        valid = true;
        continue;
      }
      
    } while (!valid);

    spawnPositions.add(pos);

    const spawner: Spawner = new Spawner(x, y, offsetX, offsetY); // Spawn on the right of tile 1, 3
    spawnManager.add(spawner);
    world.rq.add(spawner.getId(), spawner);
  }


  // Create forces
  fr = new ForceRegistry();
  ch = new ContactHelper();

  userInput = new UserInput(1);
  drag = new Drag(0.1, 0.1);

  fr.register(player, userInput);
  fr.register(player, drag);

  // Load artwork
  playerArt = loadImage("assets/spriteSheet.png");
  rollingArt = loadImage("assets/rolling.png");
  wallArt = loadImage("assets/brick_tile.png");
  windowArt = loadImage("assets/window.png");

  textFont(mainFont);

  generateFloorTexture();

  gameover = false;
  startNewGame = false;
  spawnManager.nextRound();
}

function draw() {

  // Check end game
  if (gameover) {
    if (startNewGame) {
      setup();
    } else {
      return;
    }
  }

  // Initialize background
  background(100);

  // Update 
  
  pathFinder.updateEnemyWeights(blobs);
 
  player.update();
  sword.update();

  blobs.forEach((blob: BlobEnemy) => {
    blob.update();
  });

  // Spawn enemies
  spawnManager.update();

  // Updates forces
  fr.updateForces();

  // Contacts
  let playerWallContact: Contact | null = world.getWallContact(player);

  for (let bId: number = 0; bId < blobs.length; bId++) {
    const blob = blobs[bId];

    const blobWallContact : Contact | null = world.getWallContact(blob);
    if (blobWallContact != null) {
      blobWallContact.resolve();
    }

    if (weaponManager.weapon != null) {
      const blobWeaponContact: Contact | null = weaponManager.detectContact(blob);


      if (blobWeaponContact != null) {
        blobWeaponContact.resolveKnockback();
        blob.damage();
      }

    }

    const blobPlayerContact: Contact | null = ch.detectFloorContact(blob, player, 0);
    if (blobPlayerContact != null) {
      player.damage();
    }

    for (let b2Id: number = bId + 1; b2Id < blobs.length; b2Id++) {

      const blobBlobContact = ch.detectFloorContact(blob, blobs[b2Id], 1);

      if (blobBlobContact != null) {
        blobBlobContact.resolve();
      }

    }

  }
  
  if (playerWallContact != null) {
    playerWallContact.resolve();
  } 

  // Integrate
  player.integrate();
  weaponManager.integrate();

  blobs.forEach((blob: BlobEnemy) => {
    blob.integrate();
  });

  // Re-Add entities to render queue
  world.integrate();
  
  // Draw world
  image(floorTexture, 0, 0);
  world.display();

  // Draw UI
  
  // Check end game
  if (player.isDead) {
    gameover = true;

    // Display end screen
    noStroke();
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);

    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("     Memento Mori...", width/2, height/2 - 32);
    textSize(24);
    text("Round: " + spawnManager.getRound(), width/2, height/2);
    text("RESTART\n<r>", width/2, height/2 + 92);
    return;
  }

  if (spawnManager.showNewRoundText) {
    textSize(50);
    noStroke();
    fill(100);
    textAlign(CENTER, CENTER);
    text("Round: " + spawnManager.getRound(), width / 2, height / 2);
  }

} 

function keyPressed() {

  // Player movement
  if (key == 'w') {
    userInput.setMovingUp(true);
  } 
  if (key == 's') {
    userInput.setMovingDown(true);
  }
  if (key == 'a') 
    userInput.setMovingLeft(true);
  if (key == 'd') 
    userInput.setMovingRight(true);

  if (key == 'w' || key == 'a' || key == 's' || key == 'd') {
    userInput.update();
  } 

  if (key == ' ') {
    player.roll();
  }

  if (key == 'k') {
    weaponManager.attack();
  }

  if (key == 'r' && gameover) {
    startNewGame = true;
  }

}

function keyReleased() {

  // Player movement
  if (key == 'w') {
    userInput.setMovingUp(false);
  } 
  if (key == 's') {
    userInput.setMovingDown(false);
  }
  if (key == 'a') {
    userInput.setMovingLeft(false);
  }
  if( key== 'd') {
    userInput.setMovingRight(false);
  }

  if (key == 'w' || key == 'a' || key == 's' || key == 'd') {
    userInput.update();
  } 
  
  if (key == 'R') {
    setup();
  }
}

function generateFloorTexture() {
  floorTexture = createGraphics(CANVAS_W, CANVAS_H);

  floorTexture.background(0);
  
  for (let x = 0; x < TILES_X; x++) {
    for (let y = 0; y < TILES_Y; y++) {
      let asset: p5.Image;

      let isEmpty: number = Math.random();
      if (isEmpty > 0.99) {
        asset = grassArt[0];
      } else {
        let idx: number = Math.floor(Math.random() * 3) + 1;
        asset = grassArt[idx];
      }

      floorTexture.image(asset, x * TILE_W, y * TILE_H, TILE_W, TILE_H);
    } 
  }


} 

