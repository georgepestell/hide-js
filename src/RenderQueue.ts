class RenderQueue {

  queue: ScoreSortedSet<number>;
  elements: Map<number, Renderable>;

  constructor() {
    this.queue = new ScoreSortedSet<number>();
    this.elements = new Map<number, Renderable>();
  }

  add(id: number, element: Renderable): void {
    this.queue.add(element.getZ(), id);
    this.elements.set(id, element);
  }

  remove(id: number): void {
    this.queue.delete(id);
    this.elements.delete(id);
  }

  display(): void {
    for (const [score, id] of this.queue.values()) {
      const element: Renderable | undefined = this.elements.get(id);
      if (element == undefined) {
        continue;
      } else {
        element.display();
      }
    }
  } 

  size(): number {
    return this.queue.size;
  }
}
