abstract class Weapon extends Renderable {

  readonly icon: p5.Image;

  origin: p5.Vector;
  rotation: number;

  knockback: number;

  isAttacking: boolean = false;
  lastAttack: number = -Infinity;
  attackLength: number = 100;
  attackCooldown: number = 500;

  constructor(icon: p5.Image) {
    super();
    this.icon = icon;
    this.origin = createVector(width / 2, height / 2);
    this.rotation = 0;
    this.knockback = 10;
  }

  abstract display(): void;
  abstract attack(): void;

}
