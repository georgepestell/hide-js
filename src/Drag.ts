/// <reference path="./ForceGenerator.ts" />

class Drag extends ForceGenerator {
  k1: number;
  k2: number;

  constructor(k1: number, k2: number) {
    super();
    this.k1 = k1;
    this.k2 = k2;
  }

  updateForce(object: PhysicsObject): void {
    let force: p5.Vector = object.velocity.copy();

    let drag_coeff: number = force.mag();
    drag_coeff = this.k1 * drag_coeff + this.k2 * drag_coeff * drag_coeff;

    force.normalize();
    force.mult(-drag_coeff);

    object.addForce(force);
  }

}
