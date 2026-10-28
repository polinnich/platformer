import { initInput } from './input.js';
import { Game } from './game.js';

const canvas = document.getElementById('gameCanvas');

// Инициализация ввода
initInput();

// Создание игры
const game = new Game(canvas);

// Первый рендер (меню)
game.render();