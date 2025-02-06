
import { FruitGame } from './src/FruitGame'

declare global {
  interface Window {
    fruitGame: FruitGame | undefined;
  }
}

async function main(): Promise<void> {
  const fruitGame = new FruitGame();
  window.fruitGame = fruitGame;
  await fruitGame.init();
}

main();

