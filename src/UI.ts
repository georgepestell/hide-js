class UI extends Renderable {

  elements: UIElement[];

  x: number;
  y: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;

    this.elements = [];
  }

  add(element: UIElement): void {

    let newX: number = this.x;
    let newY: number = this.y;

    for (const e of this.elements) {
      newX += e.w;
    }

    element.x = newX;
    element.y = newY;

    this.elements.push(element);
  }

  display(): void {
    for (const e of this.elements) {
      e.display(); 
    }
  }

  getZ(): number {
    return Infinity;
  } 

}
