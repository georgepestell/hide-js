class PathState {

  tx: number;
  ty: number;

  constructor(tx: number, ty: number) {
    this.tx = tx;
    this.ty = ty;
  }

  toString(): string {
    return this.tx.toString() + "," + this.ty.toString();
  }

}

class PathNode {

  state: PathState;
  parent: PathNode | null;

  gCost: number;
  hCost: number;

  constructor(state: PathState, parent: PathNode | null, gCost: number, hCost: number) {
    this.state = state;
    this.parent = parent;
    this.gCost = gCost;
    this.hCost = hCost;
  }

  getFCost(): number {
    return this.gCost + this.hCost;
  }
}

class PathFinder {

  enemyWeight: number = (TILE_W + TILE_H) / 2;
  
  tiles_x: number;
  tiles_y: number;

  weights: number[][];

  constructor(tiles_x: number, tiles_y: number) {
    this.tiles_x = tiles_x;
    this.tiles_y = tiles_y;
    this.weights = new Array(this.tiles_x).fill(null).map(() => new Array(this.tiles_y).fill(1));
  }

  getTilesAlongLine(x1: number, y1: number, x2: number, y2: number): p5.Vector[] {

    let tiles: p5.Vector[] = [];

    const dy: number = abs(y2 - y1);
    const dx: number = abs(x2 - x1);

    const sx: number = (x1 < x2) ? 1 : -1;
    const sy: number = (y1 < y2) ? 1 : -1;

    let err: number = dx - dy;

    while (true) {

      tiles.push(createVector(x1, y1));

      if (x1 == x2 && y1 == y2) {
        break;
      }

      const e2 = 2 * err;
      
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }

      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }
    
    }

    return tiles;

  }

  canSee(o1: PhysicsObject, o2: PhysicsObject, tilesBlocked: boolean[][]): boolean {
    const o1Tile: p5.Vector = world.getTile(o1.position.x, o1.position.y);
    const o2Tile: p5.Vector = world.getTile(o2.position.x, o2.position.y);

    const tiles : p5.Vector[] = this.getTilesAlongLine(o1Tile.x, o1Tile.y, o2Tile.x, o2Tile.y);

    for (const tile of tiles) {
      if (tilesBlocked[tile.x][tile.y]) {
        return false;
      }
    }

    return true;
  } 

  setupWeights(): void {
    this.weights = new Array(this.tiles_x).fill(null).map(() => new Array(this.tiles_y).fill(1));
  }

  updateEnemyWeights(blobs: BlobEnemy[]) {
    this.setupWeights();
    for (const blob of blobs) {
      const bPos: p5.Vector = world.getTile(blob.position.x, blob.position.y);
      this.weights[bPos.x][bPos.y] += this.enemyWeight;
    } 
  }

  fetch_path(goal: PathNode | null): p5.Vector[] {

    let path: p5.Vector[] = [];
    
    while (goal != null) {
      path.unshift(createVector(goal.state.tx, goal.state.ty));
      goal = goal.parent;
    }

    return path;
  }

  cost_fn(state: PathState, tilesBlocked: boolean[][]): number {
    if (tilesBlocked[state.tx][state.ty]) {
      return Infinity;
    } 

    return this.weights[state.tx][state.ty];
  }

  heuristic_fn(state: PathState, goal: PathState): number {
    return dist(state.tx, state.ty, goal.tx, goal.ty);
  }

  goal_check(state: PathState, goal: PathState): boolean {
    if (state.tx == goal.tx && state.ty == goal.ty) {
      return true;
    }
    return false;

  }

  get_neighbours(node: PathNode, goal: PathState, tilesBlocked: boolean[][]): PathNode[] {
    let nodes: PathNode[] = [];
    if (node.state.tx >= 1) {
      const state: PathState = new PathState(node.state.tx - 1, node.state.ty);
      nodes.push(new PathNode(state, node, this.cost_fn(state,tilesBlocked) + node.gCost, this.heuristic_fn(state, goal)));
    }

    if (node.state.tx < TILES_X - 1) {
      const state: PathState = new PathState(node.state.tx + 1, node.state.ty);
      nodes.push(new PathNode(state, node, this.cost_fn(state,tilesBlocked) + node.gCost, this.heuristic_fn(state, goal)));
    }

    if (node.state.ty >= 1) {
      const state: PathState = new PathState(node.state.tx, node.state.ty - 1);
      nodes.push(new PathNode(state, node, this.cost_fn(state,tilesBlocked) + node.gCost, this.heuristic_fn(state, goal)));
    }

    if (node.state.ty < TILES_Y - 1) {
      const state: PathState = new PathState(node.state.tx, node.state.ty + 1);
      nodes.push(new PathNode(state, node, this.cost_fn(state,tilesBlocked) + node.gCost, this.heuristic_fn(state, goal)));
    }

    return nodes;
  }


  generatePath(start: p5.Vector, goal: p5.Vector, tilesBlocked: boolean[][]): p5.Vector[] | null {

    const startPathState: PathState = new PathState(start.x, start.y);
    const goalPathState: PathState = new PathState(goal.x, goal.y);

    let openSet: ScoreSortedSet<PathNode> = new ScoreSortedSet<PathNode>();
    let closedSet: Set<String> = new Set<String>();

    openSet.add(0, new PathNode(startPathState, null, 0, this.heuristic_fn(startPathState, goalPathState)));

    while (openSet.size != 0) {

      const currentPathNode: PathNode = openSet.values()[0][1];
      if (!openSet.delete(currentPathNode)) {
        Error("Failed to delete node in path find");
        return null;
      }

      if (closedSet.has(currentPathNode.state.toString())) {
        continue;
      }

      closedSet.add(currentPathNode.state.toString());

      if (this.goal_check(currentPathNode.state, goalPathState)) {
        const p = this.fetch_path(currentPathNode);
        return p;
      }

      if (currentPathNode.gCost >= Infinity) {
        continue;
      }

      closedSet.add(currentPathNode.state.toString());

      // Add all of the adjacent directions to the frontier
      for (const node of this.get_neighbours(currentPathNode, goalPathState, tilesBlocked)) {
        if (!closedSet.has(node.state.toString()) && node.getFCost() < Infinity) {
          openSet.add(node.getFCost(), node);
        }
      }
    }

    return null;

  }
     

}
