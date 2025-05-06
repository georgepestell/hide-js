class Spawner extends Renderable {

  tile_x: number; 
  tile_y: number;

  tx: number;
  ty: number;

  x: number;
  y: number;

  spawnTileX: number;
  spawnTileY: number;

  spawnCenterX: number;
  spawnCenterY: number;

  spawning: number = 0;
  rotation: number = 0;

  fontSize: number = min(TILE_W, TILE_H);

  readonly spawnTime: number = 4000;
  readonly animationTime: number = this.spawnTime / 3;

  lastSpawn: number = 0;
  now: number = 0;

  constructor(tile_x: number, tile_y: number, offsetX: number, offsetY: number) {
    super();
    this.tile_x = tile_x;
    this.tile_y = tile_y;
    this.x = tile_x * TILE_W + ((offsetX + 1) * TILE_W / 2);
    this.y = tile_y * TILE_H + ((offsetY + 1) * TILE_H / 2);
    this.spawnTileX = tile_x + offsetX;
    this.spawnTileY = tile_y + offsetY;

    this.spawnCenterX = (this.spawnTileX + 0.5) * TILE_W;
    this.spawnCenterY = (this.spawnTileY + 0.5) * TILE_W;

    if (offsetX != 0) {
     this.rotation = radians(90 * -offsetX);
    } if (offsetY == -1) {
      this.rotation = radians(180);
    }

    this.tx = (tile_x + 0.5) * TILE_W;
    this.ty = (tile_y + 0.5) * TILE_H;

  }

  spawn(): void {
    if (this.lastSpawn + this.spawnTime < this.now) {
      this.lastSpawn = this.now;
    }
    this.spawning++;
  }

  update(): void  {
    this.now = millis();

    if (this.spawning > 0) {
      if (this.lastSpawn + this.spawnTime < this.now) {
        const blob: BlobEnemy = new BlobEnemy(this.spawnTileX * TILE_W, this.spawnTileY * TILE_H, TILE_W, TILE_H);
        fr.register(blob, drag);
        blobs.push(blob);
        world.addEntity(blob);
        this.lastSpawn = this.now;
        this.spawning--;
      }
    }

  }

  display(): void {

    push();
    imageMode(CENTER);
    translate(this.tx, this.ty);
    rotate(this.rotation);
    image(windowArt, 0, 0, TILE_W, TILE_H);
    pop();

    // Draw an ora around the spawner
    fill(10, 255, 0, 30);
    circle(this.tx, this.ty, 100);

    if (this.spawning > 0) {
      const a: number = 127.5 + (sin(TWO_PI * (this.now % this.animationTime) / this.animationTime) + 1) * 127.5;
      push();
      textSize(this.fontSize);
      textAlign(CENTER, CENTER);
      translate(this.spawnCenterX, this.spawnCenterY);
      rotate(this.rotation + PI);
      fill(255, 0, 0, a);
      text("!", 0, 0);
      textAlign(LEFT);
      pop();
    }

  }

  getZ(): number {
    return Infinity;
  }

}
