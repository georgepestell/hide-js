class Contact {
  o1: PhysicsObject;
  o2: PhysicsObject;

  c: number;
  penDepth: number;
  
  contactNormal: p5.Vector;

  // TODO: WEAPON
  weapon: Weapon | null = null;

  constructor(o1: PhysicsObject, o2: PhysicsObject, c: number, penDepth: number, contactNormal : p5.Vector ) {
    this.o1 = o1;
    this.o2 = o2;
    this.c = c;
    this.penDepth = penDepth;
    this.contactNormal = contactNormal;
  }

  calculateSepVelocity(): number {
    let relativeVelocity: p5.Vector = this.o1.velocity.copy();
    relativeVelocity.sub(this.o2.velocity);
    return relativeVelocity.dot(this.contactNormal);
  }

  resolve(): void {
    this.resolveVelocity();

    if (this.penDepth > 0) {
      this.removePenetration();
    }
  }

  resolveKnockback(): void {

    if (this.weapon == null) {
      Error("Weapon is null - cannot resolve knockback");
      return;
    }

    if (this.o2.invMass == 0) {
      return;
    }

    const relVel: p5.Vector = this.o1.velocity.copy().sub(this.o2.velocity);
    let velAlongNormal: number = relVel.copy().dot(this.contactNormal);

    if (velAlongNormal > 0) {
      velAlongNormal = 0;
    }

    const impulseMag = ((-(1 - this.c) * velAlongNormal) + this.weapon.knockback) / this.o2.invMass;

    const impulse: p5.Vector = this.contactNormal.copy().mult(impulseMag);
    this.o2.velocity.set(impulse.copy().mult(-this.o2.invMass));
    this.o2.forceAccumulator.set(0, 0);

  }

  removePenetration(): void {
    const totalInvM = this.o1.invMass + this.o2.invMass;

    if (totalInvM == 0) {
      return;
    }

    let correction = this.contactNormal.copy();
    correction.mult(this.penDepth / totalInvM);

    let correction_o1 = correction.copy();
    correction_o1.mult(this.o1.invMass);

    let correction_o2 = correction.copy();
    correction_o2.mult(this.o2.invMass);

    this.o1.position.add(correction_o1);
    this.o2.position.sub(correction_o2);

  } 

  resolveVelocity(): void {
    const relVel: p5.Vector = p5.Vector.sub(this.o1.velocity, this.o2.velocity);
    const velAlongNorm: number = p5.Vector.dot(relVel, this.contactNormal);

    if (velAlongNorm > 0) return;

    const totalInvM: number = this.o1.invMass + this.o2.invMass;
    if (totalInvM == 0) {
      return;
    } 

    const impulseMag: number = (-(1 - this.c) * velAlongNorm) / totalInvM;


    let impulse_o1: p5.Vector = this.contactNormal.copy().mult(impulseMag);
    let impulse_o2: p5.Vector = impulse_o1.copy();

    impulse_o1.mult(this.o1.invMass);
    impulse_o2.mult(this.o2.invMass);

    this.o1.velocity.add(impulse_o1);
    this.o1.velocity.sub(impulse_o2);

  } 

}
