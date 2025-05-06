class Player extends PhysicsObject implements Wielder, Killable {
  w: number;
  h: number;

  isRolling: boolean = false;
  rollCooldown: number = 1000;
  rollTime: number = 550;
  lastRoll: number = -2000;
  lastRollFrame = 0;

  lastAnimation: number = 0;
  animationPhaseShift: number = PI;

  currentFrame: number;
  spriteDirection: number;
  offsetX: number;
  offsetY: number;
  totalFrames: number;
  row: number;
  sx: number;
  sy: number;

  now: number = 0;

  readonly maxHealth: number;
  health: number;
  isDead: boolean = false;

  readonly invulnerableTime: number = 2000;
  isInvulnerable: boolean = false;
  lastDamaged: number = 0;

  constructor(x: number, y: number, w: number, h: number) {
    super(1);
    this.position.set(x, y);
    this.w = w;
    this.h = h;

    this.currentFrame = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.totalFrames = 2;
    this.spriteDirection = 1;
    this.row = 0;
    this.sx = 0;
    this.sy = 0;

    this.maxHealth = 3;
    this.health = this.maxHealth;
  }

  update(): void {

    this.now = millis();

    if (this.isInvulnerable && this.lastDamaged + this.invulnerableTime < this.now) {
      this.isInvulnerable = false;
    }

    if (this.isRolling) {
      if (this.lastRoll + this.rollTime < this.now) {
        this.isRolling = false;
        this.currentFrame = 0;
        userInput.setForce(1);
        userInput.update();
      }
    } else {
      if (userInput.getDirection().mag() >= 1) {
        this.offsetX = 9;
        if (frameCount % 16 == 0) {
          this.currentFrame++;
          this.currentFrame %= this.totalFrames;
        }
      } else {
        this.offsetX = 0;
        this.currentFrame = 0;
      }
    }
  }

  display(): void {
    // fill(255);
    // rect(this.position.x - this.w / 2, this.position.y - this.h, this.w, this.h);
    
    let sprite: p5.Image;

    if (!this.isRolling) {
      if (this.orientation.mag() > 0) {
        if (Math.abs(this.orientation.x) < 0) {
          this.offsetY = 42;
        } else {
          this.offsetY = 0;
        }
        if (this.orientation.x > 0 && this.orientation.x > 0) {
          // Facing right
          this.spriteDirection = 1;
        } else if (this.orientation.x < 0) {
          // Facing left
          this.spriteDirection = -1;
        }

        if (this.orientation.y < 0) {
          this.offsetY += 21;
        } 
      } 

      sprite = playerArt.get(this.sx + this.offsetX + this.currentFrame * 9, this.sy + this.offsetY, 9, 21);
    } else {
      // Render roll animation
      this.offsetY = 0;
      this.offsetX = 0;

      if (frameCount % 3 == 0 && this.currentFrame < 10) {
        this.currentFrame++;
      }

      sprite = rollingArt.get(this.sx + this.offsetX + this.currentFrame*9, this.sy+this.offsetY, 9, 21);
    }

    push();

    if (this.isInvulnerable) {
      sprite.filter(GRAY);
      const time: number = this.now - this.lastAnimation;
      const a: number = Math.sin(TWO_PI * time * (1 / (this.invulnerableTime / 2)) + this.animationPhaseShift) * 55 + 200;
      tint(255, 255, 255, a);
    }

    imageMode(CENTER);
    translate(this.position.x, this.position.y - this.h / 2);
    scale(this.spriteDirection, 1);
    image(sprite, 0, 0, this.w, this.h);
    imageMode(CORNER);
    pop();

    // // DEBUG: display tile
    // const tile: p5.Vector = world.getTile(this.position.x, this.position.y);
    // fill(255, 0, 255, 100);
    // rect(tile.x * TILE_W, tile.y * TILE_H, TILE_W, TILE_H);

  }

  roll(): void {
    if (!userInput.isMoving()) {
      print("cannot roll");
      return;
    }

    if (this.isRolling || this.lastRoll + this.rollTime + this.rollCooldown > this.now) { 
      return;
    }

    userInput.setForce(3);
    this.lastRoll = this.now;
    this.lastRollFrame = frameCount;
    this.lastAnimation = this.now;
    this.isRolling = true;
    this.currentFrame = 0;

  }

  getZ(): number {
    return this.position.y;
  }

  getBBOX(): p5.Vector[] {
    let bbox: p5.Vector[] = [];

    let ul: p5.Vector = this.position.copy();
    ul.x -= this.w / 2;
    ul.y -= this.h;

    bbox.push(ul);
    bbox.push(ul.copy().add(createVector(this.w, 0)));
    bbox.push(ul.copy().add(createVector(this.w, this.h)));
    bbox.push(ul.copy().add(createVector(0, this.h)));

    return bbox;
  }

  getFloorBBOX(): p5.Vector[] {
    let bbox: p5.Vector[] = [];

    let ul: p5.Vector = this.position.copy();
    ul.x -= this.w / 2;
    ul.y -= this.h / 2;

    bbox.push(ul);
    bbox.push(ul.copy().add(createVector(this.w, 0)));
    bbox.push(ul.copy().add(createVector(this.w, this.h / 2)));
    bbox.push(ul.copy().add(createVector(0, this.h / 2)));

    return bbox;
  }

  getTile(): p5.Vector {
    return world.getTile(this.position.x, this.position.y - 1);
  }

  getOrigin(): p5.Vector {
    return createVector(this.position.x, this.position.y - 1);
  } 

  getWeaponOrigin(): p5.Vector {
    return this.getOrigin().sub(createVector(0, this.h / 2));
  }

  getRotation(): number {
    return Math.atan2(this.orientation.y, this.orientation.x);
  }

  damage(): void {
    if (!this.isInvulnerable && !this.isRolling) {
      this.health--;
      this.isInvulnerable = true;
      this.lastAnimation = this.now;
      this.lastDamaged = millis();

      if (this.health <= 0) {
        this.isDead = true;
      }

    } 
  }

} 
