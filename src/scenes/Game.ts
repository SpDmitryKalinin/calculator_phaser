import { Scene } from 'phaser';
import EventBus from '../constants/event-bus';
import { EVENTS } from '../constants/event';
import { ExamplesController } from '../classes/ExamplesController';



export interface DifficultyLevel {
    level: number;
    pointsRequired: number;
    length: number;        
    time: number;
}

const DIFFICULTY_LEVELS: DifficultyLevel[] = [
    { level: 1, pointsRequired: 0, length: 2, time: 5000 },
    { level: 2, pointsRequired: 500, length: 2, time: 4000 },
    { level: 3, pointsRequired: 1000, length: 3, time: 5000 },
    { level: 4, pointsRequired: 1500, length: 3, time: 4000 },
    { level: 5, pointsRequired: 2000, length: 4, time: 6000 },
    { level: 6, pointsRequired: 3000, length: 4, time: 5000 },
    { level: 7, pointsRequired: 4000, length: 5, time: 4000 },
];


export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    controller: ExamplesController;
    currentDifficultyIndex: number = 0;
    currentDifficulty: DifficultyLevel;
    currentScore: number = 0;

    constructor () {
        super('Game');
    }


    create ()
    {
        this.addListeners();
        this.scene.launch('ui');
        this.currentScore = 0;
        this.controller = new ExamplesController(this);
    }

    difficultResolver(points: number) {
        // Находим подходящий уровень сложности на основе текущих очков
        for (let i = DIFFICULTY_LEVELS.length - 1; i >= 0; i--) {
            if (points >= DIFFICULTY_LEVELS[i].pointsRequired) {
                // Если нашли новый уровень сложности
                if (this.currentDifficultyIndex !== i) {
                    this.currentDifficultyIndex = i;
                    this.currentDifficulty = DIFFICULTY_LEVELS[i];
                    // Отправляем событие об изменении сложности
                    EventBus.emit(EVENTS.difficultyChanged, this.currentDifficulty);
                }
                break;
            }
        }
    }

    addListeners() {
        EventBus.removeListener(EVENTS.gameOver);
		EventBus.removeListener(EVENTS.scoreChanged);
		EventBus.removeListener(EVENTS.scoreChange);
        EventBus.removeListener(EVENTS.difficultyChanged);
        EventBus.removeListener(EVENTS.generateExample);
        EventBus.on(EVENTS.gameOver, () => {
            this.scene.stop('Game')
            this.scene.stop('ui')
            this.scene.start('GameOver', { score: this.currentScore * 10 });
            
        })
        EventBus.on(EVENTS.scoreChanged, (points: number) => {
            this.currentScore = points;
            this.difficultResolver(points);
        })
        this.input.keyboard?.on('keydown-SPACE', () => {
			EventBus.emit(EVENTS.scoreChange, 100);
		});
        this.input.keyboard?.on('keydown-J', () => {
            EventBus.emit(EVENTS.getDamage);
        });
    }
}
