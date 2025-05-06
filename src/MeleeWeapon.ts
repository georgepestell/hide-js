/// <reference path="./Weapon.ts" />

class MeleeWeapon extends Weapon {
  readonly attackSound: p5.SoundFile;
  
  now: number = 0;

  attackRadius: number = QUARTER_PI;
  attackRangeW: number = 100;
  attackRangeH: number = 120;

  constructor(icon: p5.Image, attackSound: p5.SoundFile) { 
    super(icon);
    this.attackSound = attackSound;
  }

  update(): void {
    this.now = millis();
    if (this.isAttacking && this.lastAttack + this.attackLength < this.now) {
      this.isAttacking = false;
    }
  } 

  attack(): void {
    if (this.lastAttack + this.attackLength + this.attackCooldown < this.now) {
      this.attackSound.play();
      this.isAttacking = true;
      this.lastAttack = this.now;
    } 
  }

  getPointOnEllipse(angle: number) { 
    return createVector(this.origin.x + (this.attackRangeW / 2) * Math.cos(angle), this.origin.y + (this.attackRangeH / 2) * Math.sin(angle));
  }

  // TODO: Melee weapon bbox
  // getBBOX(): p5.Vector[] {
  //   let bbox: p5.Vector[] = [];
  // }

  display(): void {
    if (this.isAttacking) {
      noStroke();
      fill(255, 255, 255, 200);
      push();
      translate(this.origin.x, this.origin.y);
      arc(0, 0, this.attackRangeW, this.attackRangeH, this.rotation - this.attackRadius, this.rotation + this.attackRadius);
      pop();
    }
  }
    
  getZ(): number {
    return Infinity;
  }


}
