class UserInput extends ForceGenerator {
  left: boolean = false;
  right: boolean = false;
  up: boolean = false;
  down: boolean = false;

  movingRight: boolean = false;
  movingDown: boolean = false;

  mf: MovementForce;
  force: number;

  constructor(force: number) {
    super();
    this.force = force;
    this.mf = new MovementForce()
  }

  setMovingRight(value: boolean): void {
    this.right = value;
    this.movingRight = value;
  }

  setMovingLeft(value: boolean): void {
    this.left = value;
    this.movingRight = !value;
  }

  setMovingDown(value: boolean): void {
    this.down = value;
    this.movingDown = value;
  }

  setMovingUp(value: boolean): void {
    this.up = value;
    this.movingDown = !value;
  }

  update(): void {
    let x: number = 0; 
    let y: number = 0;

    if (this.movingRight && this.right) {
      x = 1;
    } else if (!this.movingRight && this.left) {
      x = -1;
    } 

    if (this.movingDown && this.down) {
      y = 1;
    } else if (!this.movingDown && this.up) {
      y = -1;
    }

    if (!player.isRolling) {
      this.mf.set(x, y);
    }
  } 

  getDirection(): p5.Vector {
    return this.mf.direction.copy();
  }

  isMoving(): boolean {
    return this.mf.direction.mag() > 0;
  }

  setForce(force: number): void { 
    this.mf.setForce(force);
  }

  updateForce(object: PhysicsObject): void {
    this.mf.updateForce(object);
  }

}
