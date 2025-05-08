/// <reference path="./UIElement.ts" />

class HealthUI extends UIElement {
  constructor(w: number, h: number) {
    super(w, h);
  }

  display(): void {
    fill(0);
    textSize(14);
    rect(this.x, this.y, this.w, this.h);
    fill(255);
    textAlign(CENTER, CENTER);
    text("hp: " + player.health, this.x + this.w/2, this.y + this.h/2);
  }
     
}
