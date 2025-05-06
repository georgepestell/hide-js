class SpawnManager {

  readonly baseEnemies: number;
  readonly growthFactor: number;

  round: number;
  spawnRemaining: number;
  enemiesRemaining: number;

  lastSpawn: number;

  readonly spawnRate = 2000;

  spawners: Spawner[];

  readonly showNewRoundTextTime: number = 2000;
  showNewRoundText: boolean = false;
  lastNewRound: number = 0;

  constructor(baseEnemies: number, growthFactor: number) {
    this.baseEnemies = baseEnemies;
    this.growthFactor = growthFactor;

    this.round = 0;
    this.spawners = [];
    this.spawnRemaining = 0;
    this.enemiesRemaining = 0;
    this.lastSpawn = 0;
  }

  add(spawner: Spawner): void {
    this.spawners.push(spawner);
  }

  nextRound(): void {
    this.round++;

    const expGrowth = Math.pow(this.growthFactor, this.round);
    const logGrowth = Math.log(this.round + 1) + 1;
    this.spawnRemaining = Math.floor(this.baseEnemies * (expGrowth + logGrowth) / 2 );

    this.lastNewRound = millis();
    this.showNewRoundText = true;
  } 

  update(): void {

    let deadBlobs: BlobEnemy[] = [];
    for (const blob of blobs) {
      if (blob.isDead) {
        deadBlobs.push(blob);
      }
    }

    this.enemiesRemaining -= deadBlobs.length;
    for (const blob of deadBlobs) {
      blobs.splice(blobs.indexOf(blob), 0);
    }

    for (const spawner of this.spawners) {
      spawner.update(); 
    }

    // TODO: int now = millis and onwards 

    const now = millis();

    if (this.lastSpawn + this.spawnRate < now) {
      this.lastSpawn = now;
      this.spawn();
    }

    if (this.lastNewRound + this.showNewRoundTextTime < now) {
      this.showNewRoundText = false;
    }

  }

  spawn(): void {
    if (this.spawners.length == 0) {
      return;
    }

    if (this.spawnRemaining > 0) {
      const spawnerId: number = Math.floor(Math.random() * this.spawners.length);
      const spawner: Spawner = this.spawners[spawnerId];
      spawner.spawn();
      this.spawnRemaining--;
      this.enemiesRemaining++;
    }
    
  }

  kill(): void {
    this.enemiesRemaining--;
  }

  getRound(): number {
    return this.round;
  }

  getEnemiesRemaining(): number {
    return this.enemiesRemaining;
  }

  getSpawnRemaining(): number {
    return this.spawnRemaining;
  }

  getRemaining(): number {
    return this.enemiesRemaining + this.spawnRemaining;
  }


}
