export type DicePair = [number, number];

const rollDie = (): number => Math.floor(Math.random() * 6);

export const rollDice = (): DicePair => [rollDie(), rollDie()];

// Die faces are 0-based (0 → one dot)
export const diceSum = ([a, b]: DicePair): number => a + b + 2;
