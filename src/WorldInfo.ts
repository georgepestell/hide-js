class WorldInfo {
  static currentId: number = 0;

  static getNextId(): number {
    return WorldInfo.currentId++;
  }

}
