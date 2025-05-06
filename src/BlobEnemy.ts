/// <reference path="./PhysicsObject.ts" />

enum State {
  SEARCHING,
  HUNTING,
  HURT,
  JUMPING,
  DISABLED
}

class BlobEnemy extends PhysicsObject implements Killable {

  readonly jumpTime: number     = 500;
  readonly jumpCooldown: number = 2000;
  readonly jumpForce: number    = 3;
  lastJump: number              = 0;

  readonly attackDistance: number = 4;

  readonly speed: number  = 0.8;
  readonly pathThreshold: number;

  path: p5.Vector[] | null = null;
  state: State            = State.HUNTING;

  readonly pathUpdateTime: number  = 500;

  lastUpdate: number      = -Infinity;
  now: number             = 0;

  readonly invulnerableTime: number = 500;
  lastInvulnerable: number          = 0;
  isInvulnerable: boolean           = false;
  
  readonly disableTime: number  = 1000;
  lastDisabled: number          = 0;

  readonly w: number;
  readonly h: number;

  readonly maxHealth: number;
  health: number;
  isDead: boolean = false;

  blobInput: MovementForce;

  constructor(x: number, y: number, w: number, h: number) {
    super(0.5);
    this.position = createVector(x, y);
    this.w = w;
    this.h = h;
    this.pathThreshold = w; 
    this.health = 2;

    this.blobInput = new MovementForce();
    fr.register(this, this.blobInput);

    this.maxHealth = 2;
    this.health = this.maxHealth;
  }

  update(): void {
    this.now = millis();

    // Stop being invulnerable
    if (this.isInvulnerable && this.lastInvulnerable + this.invulnerableTime < this.now) {
      this.isInvulnerable = false;
    } 

    if (this.state == State.DISABLED) {
      return;
    }

    // Only update state if we are not disabled
    if (this.state != State.HURT || this.lastDisabled + this.disableTime < this.now) {

      // Keep jumping until jumping is complete
      const jumpEnd: number = this.lastJump + this.jumpTime;
      if (this.state != State.JUMPING || jumpEnd < this.now) {

        // Update the path
        if (this.path == null || this.lastUpdate + this.pathUpdateTime < this.now) {
          this.updatePath();
        }

        if (jumpEnd + this.jumpCooldown < this.now && this.path != null && this.path.length <= this.attackDistance && pathFinder.canSee(this, player, world.tilesBlocked)) {
            this.jump();
        // Otherwise, hunt the player
        } else {
          this.setHunting();
        }

      } 
    }
  }

  setHunting(): void {
    this.state = State.HUNTING;

    const direction: p5.Vector = this.getPathDirection();
    this.blobInput.setForce(this.speed);
    this.blobInput.set(direction.x, direction.y);
  }

  jump(): void {
    this.state = State.JUMPING;
    this.lastJump = this.now;

    const direction: p5.Vector = this.getPathDirection();
    this.blobInput.set(direction.x, direction.y);
    this.blobInput.setForce(this.jumpForce);
  }

  updatePath(): void {
    this.lastUpdate = this.now;
    let origin: p5.Vector = this.position;
    let pOrigin: p5.Vector = player.getOrigin();
    this.path = pathFinder.generatePath(world.getTile(origin.x, origin.y), world.getTile(pOrigin.x, pOrigin.y), world.tilesBlocked);
  }

  disable(): void {
    this.state = State.DISABLED;
    this.blobInput.set(0, 0);
  }

  enable(): void {
    this.state = State.HUNTING;
  }

  getPathDirection(): p5.Vector {
    if (this.path == null) {
      return createVector(0, 0);
    }
      
    let source: p5.Vector = this.position.copy();
    source.y -= this.h / 2;

    let distance: number;
    while (this.path.length > 0) {
      let target: p5.Vector = this.path[0].copy();
      target.x *= world.tile_w;
      target.y *= world.tile_h;

      target.x += world.tile_w / 2;
      target.y += world.tile_h / 2;

      let direction: p5.Vector = target.copy();
      direction.sub(source);

      if (direction.mag() > this.pathThreshold) {
        return direction.normalize();
      } else {
        this.path.shift();
      }
      
    }

    return createVector(0, 0);

  }

  display(): void {
    noStroke();
    if (this.state == State.HURT) {
      fill(0, 255, 0, 120);
    } else {
      fill(0, 255, 0, 200);
    }

    rectMode(CENTER);
    rect(this.position.x, this.position.y - this.h / 2, this.w, this.h);
    rectMode(CORNER);

    // // DEBUG: Display path direction
    // const dir = this.getPathDirection();
    // stroke(255, 255, 255);
    // line(this.position.x, this.position.y, this.position.x + dir.x * 5, this.position.y + dir.y * 5);

    // // DEBUG: dispay tile
    // const tile: p5.Vector = world.getTile(this.position.x, this.position.y);
    // fill(0, 0, 255, 100);
    // rect(tile.x * TILE_W, tile.y * TILE_H, TILE_W, TILE_H);

    // DEBUG: display path
    // fill(255, 255, 0, 100);
    // if (this.path != null) {
    //   for (const p of this.path) {
    //     rect(p.x * TILE_W, p.y * TILE_H, TILE_W, TILE_H); 
    //   }
    // }

  }

  getBBOX(): p5.Vector[] {
    let bbox: p5.Vector[] = [];

    let ul = this.position.copy();
    ul.x -= this.w / 2;
    ul.y -= this.h;

    bbox.push(ul);
    bbox.push(ul.copy().add(createVector(this.w, 0)));
    bbox.push(ul.copy().add(createVector(this.w, this.h)));
    bbox.push(ul.copy().add(createVector(0, this.h)));

    return bbox;
  }

  getFloorBBOX(): p5.Vector[] {
    return this.getBBOX();
  }

  getOrigin() {
    return createVector(this.position.x, this.position.y - this.h / 2);
  }

  getZ(): number {
    return this.position.y;
  }

  damage(): void {

    if (this.isInvulnerable) {
      return;
    }

    this.health--;
    if (this.health <= 0) {
      this.isDead = true;
    }
    
    this.isInvulnerable = true;
    this.lastInvulnerable = millis();
    this.state = State.HURT;
    this.blobInput.set(0, 0);
    this.lastDisabled = this.now;

  }
     


}
