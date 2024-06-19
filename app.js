import game from './game.js';

const nxC = 100;
const nyC = 100;

const gHeight = 600;
const gWidth = 600;

const app = document.querySelector('#app');

window.game = new game(nxC, nyC);

