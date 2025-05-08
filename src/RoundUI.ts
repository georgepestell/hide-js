/// <reference path="./UIElement.ts" />

class RoundUI extends UIElement {

  spawnManager: SpawnManager

  constructor(spawnManager: SpawnManager, w: number, h: number) {
    super(w, h);
    this.spawnManager = spawnManager;
  }

  display(): void {
    textSize(14);
    fill(50);
    noStroke();
    rect(this.x, this.y, this.w, this.h);
    fill(255);
    textAlign(CENTER, CENTER);
    text("Round: " + this.spawnManager.getRound() + " : " + this.spawnManager.getRemaining(), this.x + this.w / 2, this.y + this.h / 2);
  }

}
   
