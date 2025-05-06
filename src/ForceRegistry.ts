class ForceRegistration {
  object: PhysicsObject;
  fg: ForceGenerator;
  constructor(object: PhysicsObject, fg: ForceGenerator) {
    this.object = object;
    this.fg = fg;
  }
}

class ForceRegistry {
  registry: ForceRegistration[];

  constructor() {
    this.registry = [];
  }

  register(object: PhysicsObject, fg: ForceGenerator) : void {
    this.registry.push(new ForceRegistration(object, fg));
  }

  clear(): void {
    this.registry = [];
  }

  updateForces(): void {
    this.registry.forEach((fr : ForceRegistration) => {
      fr.fg.updateForce(fr.object);
    });
  }

  
}
