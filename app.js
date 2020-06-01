import game from './game.js';

const nxC = 200;
const nyC = 200;

const gHeight = 1000;
const gWidth = 1000;

const app = document.querySelector('#app');


window.game = new game(app, gWidth, gHeight, nxC, nyC);

