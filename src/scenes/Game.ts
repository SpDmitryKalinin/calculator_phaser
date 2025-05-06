import { Scene } from 'phaser';
import EventBus from '../constants/event-bus';
import { EVENTS } from '../constants/event';
import { GameController } from '../classes/core/GameController';
import { ProgressLevel } from '../classes/ProgressLevel';
import { StageConfig } from '../difficultConfig';
import { store } from '../globalStore';



export interface DifficultyLevel {
    level: number;
    pointsRequired: number;
    length: number;        
    time: number;
}


export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    controller: GameController;
    currentDifficultyIndex: number = 0;
    currentDifficulty: DifficultyLevel;
    currentScore: number = 0;
    counter: number = 0;
    progressLevel: ProgressLevel;
    configLevel: StageConfig

    constructor () {
        super('Game');
    }

    init() {
        this.counter = 0;
        const config = store.findCurrentConfig();
        if(!config) {
            return
        }
        this.configLevel = config;
    }

    create ()
    {
        this.addListeners();
        this.scene.launch('ui');
        this.currentScore = 0;
        this.controller = new GameController(this);
        this.progressLevel = new ProgressLevel(this, 40, 100, this.configLevel.lengthStage)
    }

    callbackAnswer() {
        this.progressLevel.setLevel()
        this.counter = this.counter + 1;
        EventBus.emit(EVENTS.stageChanged, this.counter)
        EventBus.emit(EVENTS.generateExample);
    }

    addListeners() {
        EventBus.removeListener(EVENTS.gameOver);
		EventBus.removeListener(EVENTS.scoreChanged);
		EventBus.removeListener(EVENTS.scoreChange);
        EventBus.removeListener(EVENTS.difficultyChanged);
        EventBus.removeListener(EVENTS.generateExample);
        EventBus.removeListener(EVENTS.rightAnswer);

        EventBus.on(EVENTS.rightAnswer, () => {
            this.callbackAnswer();
        })
        EventBus.on(EVENTS.gameOver, () => {
            this.scene.stop('Game')
            this.scene.stop('ui')
            this.scene.start('GameOver', { score: this.currentScore * 10 });
            
        })
        EventBus.on(EVENTS.scoreChanged, (points: number) => {
            this.currentScore = points;
        })
    }

}

