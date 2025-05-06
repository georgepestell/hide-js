abstract class UIElement extends Renderable {
  x: number = 0;
  y: number = 0;

  w: number;
  h: number;

  constructor(w: number, h: number) {
    super();
    this.w = w;
    this.h = h;
  }

  abstract display(): void;

  getZ(): number {
    return Infinity;
  }
  
  
}
