import { EVENTS } from "../../constants/event";
import EventBus from "../../constants/event-bus";
import { AdaptiveDisplay } from "../utility/AdaptiveDisplay";
import { DynamiteTimer } from "../DynamiteTimer";
import { store } from "../../globalStore";
import { StageConfig } from "../../difficultConfig";
import { ButtonsManager } from "./ButtonManager";
import { ExampleGenerator } from "./ExampleGenerator";

export class GameController {
    stage: number = 0;
    scene: Phaser.Scene;
    currentAnswer: number;
    example: Phaser.GameObjects.BitmapText;
    examplePowerString: Phaser.GameObjects.BitmapText;
    buttonsManager: ButtonsManager;
    exampleGenerator: ExampleGenerator;
    timeBar: DynamiteTimer;
    config: StageConfig
    private adaptiveDisplay: AdaptiveDisplay;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.updateLayout = this.updateLayout.bind(this);

        this.adaptiveDisplay = new AdaptiveDisplay({
            designWidth: 360,
            designHeight: 720,
            scene: this.scene,
            debug: false
        });
        
        this.init();
        this.addListeners();
        
        this.scene.scale.on('resize', this.updateLayout, this);
    }

    addListeners() {
        EventBus.on(EVENTS.stageChanged, (stage: number) => {
            this.updateStage(stage);
        });
        EventBus.on(EVENTS.generateExample, () => {
            this.updateExample();
        });
    }

    updateStage(stage: number) {
        this.stage = stage;
    }

    init() {
        this.config = store.findCurrentConfig()!;
        
        this.exampleGenerator = new ExampleGenerator(this.config);
        
        this.createStringForExample();
        
        this.buttonsManager = new ButtonsManager(
            this.scene, 
            this.adaptiveDisplay, 
            (selectedValue, buttonIndex) => this.handleButtonSelection(selectedValue, buttonIndex)
        );
        
        // Создаем кнопки через менеджер
        this.buttonsManager.createButtons(
            this.config.buttonCount, 
            180, 
            300, 
            100
        );
        
        this.timeBar = new DynamiteTimer(
            this.scene, 
            300,  
            350,
            this.adaptiveDisplay 
        );
        
        this.timeBar.setTimeOutCallback(() => this.onTimeOut());
        this.updateLayout();
        this.updateExample();
    }

    updateLayout() {
        if (!this.adaptiveDisplay || !this.scene) return;
        if (this.example && this.example.active) {
            this.adaptiveDisplay.placeAt(180, 160, this.example);
            
            const scale = this.adaptiveDisplay.getScaleX();
            this.example.setFontSize(Math.floor(48 * scale));
            this.example.setMaxWidth(320 * scale);
        }

        if(this.examplePowerString) {
            this.adaptiveDisplay.placeAt(175, 145, this.examplePowerString);
            
            const scale = this.adaptiveDisplay.getScaleX();
            this.examplePowerString.setFontSize(Math.floor(24 * scale));
            this.examplePowerString.setMaxWidth(320 * scale);
        }
    
        // Обновляем layout через менеджер кнопок
        if (this.buttonsManager) {
            this.buttonsManager.updateLayout();
        }
    }

    setTimerDuration(time: number) {
        const timePost = time + store.timeCoeff < 3000 ? 3000 : time + store.timeCoeff;
        this.timeBar.setTime(timePost); 
    }

    onTimeOut() {
        store.setCounterTimeout();
        this.setTimerDuration(this.config.time);
        EventBus.emit(EVENTS.getDamage);
        this.timeBar.start();
    }

    updateExample() {
        this.setTimerDuration(this.config.time);
        if(this.stage >= this.config.lengthStage) {
            return;
        }
        
        const example = this.exampleGenerator.createExample(this.stage);
        if(!example) {
            return;
        }
        
        const {string, result, power} = example;
        this.example.setText(string);
        if(power === null) {
            this.examplePowerString.setAlpha(0);
            this.examplePowerString.setText('null');
        }
        else {
            this.examplePowerString.setText(String(power))
            this.examplePowerString.setAlpha(1);
        }
        this.currentAnswer = result;
        
        const wrongAnswers = this.exampleGenerator.generateWrongAnswers(result);
        
        // Создаем массив со всеми ответами: правильный и все неправильные
        const allAnswers = [result, ...wrongAnswers];
        
        this.exampleGenerator.shuffleArray(allAnswers);
        
        this.buttonsManager.updateButtonValues(allAnswers);

        this.timeBar.start();
    }

    handleButtonSelection(selectedValue: number, buttonIndex: number) {
        if(selectedValue === this.currentAnswer) {
            const timeMultiple = this.timeBar.getTimePercent().toFixed(2);
            this.buttonsManager.highlightButton(buttonIndex, 0x00ff00);
            if(this.example.text.includes('*')) {
                store.setCounterCurrentMultiply();
            }
            if(this.example.text.includes('/')) {
                store.setCounterCurrentDivider();
            }
            if(!this.examplePowerString.text.includes('null')) {
                store.setCounterCurrentPower();
            }
            store.setCounterCurrentTime();
            EventBus.emit(EVENTS.scoreChange, 100 * Number(timeMultiple));
            this.timeBar.stop();
            EventBus.emit(EVENTS.rightAnswer);
            
        } else {
            this.buttonsManager.highlightButton(buttonIndex, 0xff0000);
            if(this.example.text.includes('*')) {
                store.setCounterWrongMultiply();
            }
            if(this.example.text.includes('/')) {
                store.setCounterWrongDivider();
            }
            if(!this.examplePowerString.text.includes('null')) {
                store.setCounterWrongPower();
                console.log('wrong power')
            }
            store.resetCounterCurrentTime();
            EventBus.emit(EVENTS.getDamage);
        }
    }

    createStringForExample() {
        this.example = this.scene.add.bitmapText(0, 0, 'chalkFont', '', 48)
            .setOrigin(0.5, 0)
            .setMaxWidth(320)
            .setCenterAlign();
        this.examplePowerString = this.scene.add.bitmapText(0, 0, 'chalkFont', '2', 24)
        .setOrigin(0.5, 0)
        .setMaxWidth(320)
        .setCenterAlign();
    }
    
    destroy() {
        EventBus.removeListener(EVENTS.generateExample);
        EventBus.removeListener(EVENTS.difficultyChanged);
        
        this.scene.scale.off('resize', this.updateLayout, this);
        
        if (this.buttonsManager) {
            this.buttonsManager.destroy();
        }
        
        if (this.adaptiveDisplay) {
            this.adaptiveDisplay.destroy();
        }

        if (this.timeBar) {
            this.timeBar.destroy();
        }
    }
}