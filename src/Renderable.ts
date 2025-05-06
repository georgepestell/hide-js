abstract class Renderable {
  
  id: number = WorldInfo.getNextId();

  abstract display(): void;
  abstract getZ(): number;

  getId(): number {
    return this.id;
  }

}
