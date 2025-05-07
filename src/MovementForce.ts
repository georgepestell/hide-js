class MovementForce extends ForceGenerator {

  direction: p5.Vector;
  force: number;

  constructor() {
    super();
    this.direction = createVector(0, 0);
    this.force = 1.0;
  }

  set(x: number, y: number): void {
    this.direction.x = x;
    this.direction.y = y;
  }

  setX(x: number): void {
    this.direction.x = x;
  }
  setY(y: number): void {
    this.direction.y = y;
  }

  updateForce(object: PhysicsObject): void {
    let directionalForce: p5.Vector = createVector(0, 0);
    p5.Vector.mult(this.direction, this.force, directionalForce);

    if (directionalForce == null || directionalForce == undefined) {
      print("HELP");
      return;
    }

    object.addForce(directionalForce);

    if (this.direction.mag() > 0) {
      object.orientation = this.direction.copy();
    }
       
  }

  setForce(force: number): void {
    this.force = force; 
  }

}
