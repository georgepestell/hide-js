class World {
  readonly w: number;
  readonly h: number;

  readonly tile_w: number;
  readonly tile_h: number;

  readonly tiles_x: number;
  readonly tiles_y: number;

  rq: RenderQueue;
  tiles: (Renderable | null)[][];
  tilesBlocked: boolean[][];

  walls: Wall[];
  entities: Map<number, Renderable>;

  // player: Player;
  // playerTile: p5.Vector;

  constructor(w: number, h: number, tile_w: number, tile_h: number) {
    this.w = w;
    this.h = h;
    this.tile_w = tile_w;
    this.tile_h = tile_h;

    this.tiles_x = Math.floor(w / tile_w);
    this.tiles_y = Math.floor(h / tile_h);

    this.rq = new RenderQueue();

    this.tiles = new Array(this.tiles_x).fill(null).map(() => new Array(this.tiles_y).fill(null));
    this.tilesBlocked = new Array(this.tiles_x).fill(null).map(() => new Array(this.tiles_y).fill(false));

    this.walls = [];
    this.entities = new Map<number, Renderable>;

  }

  integrate(): void {
    // Update the entity ordering in the render queue
    for (const [id, entity] of this.entities) {
      this.rq.remove(id);
      this.rq.add(id, entity);
    }
  }

  // setPlayer(player: Player): void {
  //   this.player = player;
  // }

  setTile(tx: number, ty: number, tile: Renderable): void {
    const old_tile: Renderable | null = this.tiles[tx][ty];
    if (old_tile != null) {

      this.rq.remove(old_tile.id);

      if (old_tile instanceof Wall) {
        const id = this.walls.indexOf(old_tile as Wall);
        this.walls.splice(id, 1);
      }

    }

    if (tile != null) {
      const isBlocking = tile instanceof Wall;
      this.tilesBlocked[tx][ty] = isBlocking;
    } else {
      this.tilesBlocked[tx][ty] = false;
    }

    if (tile instanceof Wall) {
      this.walls.push(tile as Wall);
    }

    this.rq.add(tile.id, tile);
    this.tiles[tx][ty] = tile;

  }

  removeTile(tx: number, ty: number): void {
    const old_tile: Renderable | null = this.tiles[tx][ty];
    if (old_tile != null) {
      this.rq.remove(old_tile.id);
    }

    this.tiles[tx][ty] = null;
    this.tilesBlocked[tx][ty] = false;
  }

  isWall(tx: number, ty: number): boolean {
    const tile: Renderable | null = this.tiles[tx][tx];
    return tile != null && tile instanceof Wall;
  }

  addEntity(entity: Renderable): void {
    this.entities.set(entity.id, entity);
  }

  removeEntity(entity: Renderable): void {
    this.entities.delete(entity.id);
    this.rq.remove(entity.id);
  }

  getTile(x: number, y: number): p5.Vector {
     const tX: number = constrain(Math.floor(x / this.tile_w), 0, this.tiles_x - 1);
     const tY: number = constrain(Math.floor(y / this.tile_h), 0, this.tiles_y - 1);
     return createVector(tX, tY);
  }

  display(): void {
    this.rq.display();

  }

  getWallContact(entity: PhysicsObject): Contact | null {
    let contacts: ScoreSortedSet = new ScoreSortedSet();

    const eOrigin: p5.Vector = entity.getOrigin();
    const tilePos: p5.Vector = this.getTile(eOrigin.x, eOrigin.y);

    let normal: p5.Vector = createVector(0, 0);
    for (let tx: number = max(Math.floor(tilePos.x) - 3, 0); tx < min(Math.floor(tilePos.x) + 4, this.tiles_x); tx++) {
      for (let ty: number = max(Math.floor(tilePos.y) - 3, 0); ty < min(Math.floor(tilePos.y) + 4, this.tiles_y); ty++) {
        const tile: Renderable | null = this.tiles[tx][ty];
        if (tile != null && tile instanceof Wall) {
          const contact: Contact | null = ch.detectFloorContact(entity, tile as Wall, 0);
          if (contact != null) {
            normal.add(contact.contactNormal);
            contacts.add(- contact.penDepth, contact);
          }
        }
      }
    }

    if (contacts.size <= 0) {
      return null;
    } 

    normal.normalize();
    
    let contact: Contact = contacts.values()[0][1];
    contact.contactNormal = normal;

    return contact;
  }


}
