class Wall extends PhysicsObject {
  w: number;
  h: number;

  imageRepeatsX: number;
  imageRepeatsY: number;

  constructor(x: number, y: number, w: number, h: number) {
    super(0);
    this.position = new p5.Vector(x, y);
    this.w = w;
    this.h = h;
    this.imageRepeatsX = Math.floor(w / TILE_W);
    this.imageRepeatsY = Math.floor(h / TILE_H);
  }

  display(): void {
    noStroke();
    image(wallArt, this.position.x, this.position.y, this.w, this.h);
  }

  getZ(): number  {
    return this.position.y + this.h;
  }


  getBBOX(): p5.Vector[] {
    let bbox: p5.Vector[] = [];

    const origin: p5.Vector = this.position.copy();

    bbox.push(origin);
    bbox.push(origin.copy().add(createVector(this.w, 0)));
    bbox.push(origin.copy().add(createVector(this.w, this.h)));
    bbox.push(origin.copy().add(createVector(0, this.h)));

    return bbox;
  }

  getFloorBBOX(): p5.Vector[] {
    return this.getBBOX();
  }

  getOrigin(): p5.Vector {
    return this.position.copy();
  }

}
