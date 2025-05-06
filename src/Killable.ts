interface Killable {
  readonly maxHealth: number;
  health: number;
  isDead: boolean;

  damage(): void;
}

