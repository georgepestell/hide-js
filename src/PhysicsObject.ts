/// <reference path="./Renderable.ts" />

abstract class PhysicsObject extends Renderable {

  position: p5.Vector = new p5.Vector(0, 0);
  orientation: p5.Vector = createVector(1, 0);
  
  velocity: p5.Vector = createVector(0, 0);
  forceAccumulator: p5.Vector = createVector(0, 0);

  invMass: number;

  constructor(invMass: number) {
    super();
    this.invMass = invMass;
  }

  addForce(force: p5.Vector): void {
    this.forceAccumulator.add(force);
  }

  integrate(): void {

    // Do not move immovable objects
    if (this.invMass <= 0) {
      return;
    }

    let resultingAcceleration: p5.Vector = this.forceAccumulator.copy();
    resultingAcceleration.mult(this.invMass);

    this.velocity.add(resultingAcceleration);
    this.position.add(this.velocity);

    this.forceAccumulator.set(0, 0);
  } 

  abstract getOrigin(): p5.Vector;
  abstract getBBOX(): p5.Vector[];
  abstract getFloorBBOX(): p5.Vector[];
  // TODO: abstract Arraylist<PVector> getTile();

}
