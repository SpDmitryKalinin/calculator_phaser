import Phaser from 'phaser';

import { BackgroundScene } from './scenes/Background';
import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { UI } from './scenes/UI';
import './component/LocalizedText';
import './component/LocalizedBitmap';

import { Game, Types } from "phaser";
//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig


const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#222222',
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'game-container',
        width: window.innerWidth,  // Используем конкретные значения вместо строк
        height: window.innerHeight,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    // Убрано дублирование parent, так как оно уже указано в scale
    scene: [
        Boot,
        BackgroundScene,
        Preloader,
        MainMenu,
        MainGame,
        GameOver,
        UI
    ]
};


// Проверяем, что DOM полностью загружен перед созданием игры
document.addEventListener('DOMContentLoaded', () => {
    new Game(config);
});
