import { EVENTS } from "../constants/event";
import EventBus from "../constants/event-bus";
import { AdaptiveDisplay } from "../scenes/AdaptiveDisplay";
import { DifficultyLevel } from "../scenes/Game";
import { DynamiteTimer } from "./DynamiteTimer";

export class ExamplesController {
    difficult: number = 1;
    lengthExmaples: number = 2;
    scene: Phaser.Scene;
    currentAnswer: number;
    example: Phaser.GameObjects.Text;
    buttons: { button: Phaser.GameObjects.Rectangle, buttonText: Phaser.GameObjects.Text, value: number }[] = [];
    timeBar: DynamiteTimer;
    private adaptiveDisplay: AdaptiveDisplay;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        
        // Привязываем методы к this, чтобы сохранить контекст
        this.updateLayout = this.updateLayout.bind(this);
        
        // Создаем AdaptiveDisplay
        this.adaptiveDisplay = new AdaptiveDisplay({
            designWidth: 360,
            designHeight: 800,
            scene: this.scene,
            debug: false
        });
        
        this.init();
        this.addListeners();
        
        // Добавляем обработчик изменения размера окна
        this.scene.scale.on('resize', this.updateLayout, this);
    }

    addListeners() {
        EventBus.on(EVENTS.generateExample, () => {
            this.updateExample();
        });
        
        EventBus.on(EVENTS.difficultyChanged, (difficult: DifficultyLevel) => {
            this.updateDiffuclty(difficult);
        });
    }

    updateDiffuclty(difficult: DifficultyLevel) {
        this.difficult = difficult.level;
        this.lengthExmaples = difficult.length;
        this.setTimerDuration(difficult.time);
    }

    init() {
        this.createStringForExample();
        this.createButtonsForAnswers();
        
        // Создаем таймер с передачей AdaptiveDisplay
        this.timeBar = new DynamiteTimer(
            this.scene, 
            180,  // дизайнерская X-координата
            50,  // дизайнерская Y-координата
            380,  // дизайнерская ширина
            190,   // дизайнерская высота
            this.adaptiveDisplay // передаем AdaptiveDisplay
        );
        
        // Устанавливаем начальную длительность таймера
        this.setTimerDuration(5000);
        
        // Устанавливаем обработчик истечения времени
        this.timeBar.setTimeOutCallback(() => this.onTimeOut());
        
        // Начальное обновление макета
        this.updateLayout();
        
        // Генерируем первый пример
        this.updateExample();
    }

    // Метод для обновления всех элементов при изменении размера
    updateLayout() {
        // Проверяем, что все объекты существуют
        if (!this.adaptiveDisplay || !this.scene) return;
        
        // Обновляем позицию и размер текста примера
        if (this.example && this.example.active) {
            this.adaptiveDisplay.placeAt(180, 240, this.example);
            
            const scale = this.adaptiveDisplay.getScaleX();
            this.example.setFontSize(Math.floor(36 * scale) + 'px');
            (this.example.style as any).wordWrapWidth = 320 * scale;
        }
        
        // Обновляем позиции и размеры кнопок
        for (let i = 0; i < this.buttons.length; i++) {
            if (!this.buttons[i].button || !this.buttons[i].button.active) continue;
            
            const y = 420 + i * 100; // дизайнерская Y-координата
            
            this.adaptiveDisplay.placeAt(180, y, this.buttons[i].button);
            this.adaptiveDisplay.placeAt(180, y, this.buttons[i].buttonText);
            
            const scaleX = this.adaptiveDisplay.getScaleX();
            const scaleY = this.adaptiveDisplay.getScaleY();
            
            this.buttons[i].button.setSize(240 * scaleX, 60 * scaleY);
            this.buttons[i].buttonText.setFontSize(Math.floor(28 * scaleX) + 'px');
        }
    }

    setTimerDuration(time: number) {
        this.timeBar.setTime(time); 
    }

    onTimeOut() {
        EventBus.emit(EVENTS.getDamage);
        EventBus.emit(EVENTS.generateExample);
    }

    updateExample() {
        const {string, result} = this.createExampleString();
        this.example.setText(string);
        this.currentAnswer = result;
        
        const wrongAnswers = this.generateWrongAnswers(result);
        
        const allAnswers = [result, wrongAnswers[0], wrongAnswers[1]];
        this.shuffleArray(allAnswers);
        
        for(let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].buttonText.setText(allAnswers[i].toString());
            this.buttons[i].value = allAnswers[i];
        }
        
        this.timeBar.start();
    }

    handleButtonClick(index: number) {
        const currentButton = this.buttons[index];
        const selectedValue = currentButton.value;
        
        if(selectedValue === this.currentAnswer) {
            const timeMultiple = this.timeBar.getTimePercent().toFixed(2);
            this.scene.tweens.add({
                targets: currentButton.button,
                fillColor: {from: 0x00ff00, to: 0x00ff00},
                fillAlpha: {from: 0, to: 1},
                duration: 100,
                ease: 'Power1',
                yoyo: true,
                repeat: 0
            });
            
            EventBus.emit(EVENTS.scoreChange, 100 * Number(timeMultiple) * (this.difficult + 1));
            this.timeBar.stop();
            EventBus.emit(EVENTS.generateExample);
        } else {
            this.scene.tweens.add({
                targets: currentButton.button,
                fillColor: {from: 0xff0000, to: 0xff0000},
                fillAlpha: {from: 0, to: 1},
                duration: 100,
                ease: 'Power1',
                yoyo: true,
                repeat: 0
            });
            EventBus.emit(EVENTS.getDamage);
        }

        
        
    }

    // Генерируем похожие, но неправильные ответы
    generateWrongAnswers(correctAnswer: number): number[] {
        const wrongAnswers: number[] = [];
        
        const offset1 = Math.floor(Math.random() * 3) + 1;
        const firstWrong = Math.random() > 0.5 
            ? correctAnswer + offset1 
            : correctAnswer - offset1;
        
        let offset2;
        let secondWrong;
        do {
            offset2 = Math.floor(Math.random() * 4) + 2;
            secondWrong = Math.random() > 0.5 
                ? correctAnswer + offset2 
                : correctAnswer - offset2;
        } while(secondWrong === firstWrong);
        
        wrongAnswers.push(firstWrong, secondWrong);
        return wrongAnswers;
    }

    // Перемешивание массива (алгоритм Фишера-Йейтса)
    shuffleArray(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    getRandomNumber() {
        return Math.floor(Math.random() * 3) + 1;
    }

    createButtonsForAnswers() {
        this.buttons = [];
        
        // Используем дизайнерские координаты
        for(let i = 0; i < 3; i++) {
            const buttonObj = this.createButton(180, 400 + i * 100, i);
            this.buttons.push(buttonObj);
        }
    }

    createStringForExample() {
        // Создаем текст примера в центре по X
        this.example = this.scene.add.text(0, 0, '', {
            fontSize: '36px',
            align: 'center',
            fontStyle: 'bold',
            wordWrap: { width: 320, useAdvancedWrap: true }
        }).setOrigin(0.5, 0);
    }

    createButton(x: number, y: number, index: number) {
        // Создаем кнопку с начальным цветом
        const button = this.scene.add.rectangle(x, y, 240, 60, 0xffffff)
            .setInteractive()
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xffffff);
        
        button.fillAlpha = 0;
        
        // Создаем текст кнопки
        const buttonText = this.scene.add.text(x, y, '', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        const buttonIndex = index;
        
        // Добавляем визуальные эффекты и обработчик клика

        button.on('pointerdown', () => {
            this.handleButtonClick(buttonIndex);
        });

        return { button, buttonText, value: 0 };
    }

    createExampleString() {
        const operators = ['+', '-', '*'];
        const arrayNumbers = [];
        const arrayOperators = [];
        
        for (let i = 0; i < this.lengthExmaples; i++) {
            arrayNumbers.push(this.getRandomNumber());
        }
        
        for (let i = 0; i < this.lengthExmaples - 1; i++) {
            arrayOperators.push(operators[this.getRandomNumber() - 1]);
        }

        let stringForEval = '';
        let stringForUser = '';
        
        for (let i = 0; i < arrayNumbers.length; i++) {
            stringForEval += arrayNumbers[i];
            stringForUser += arrayNumbers[i] + ' ';
            
            if (i < arrayOperators.length) {
                stringForEval += arrayOperators[i];
                stringForUser += arrayOperators[i] + ' ';
            }
        }
        
        stringForUser += '= ?';
        const result = eval(stringForEval);
        
        return {string: stringForUser, result: result};
    }
    
    // Метод для очистки ресурсов при уничтожении
    destroy() {
        // Удаляем слушатели событий EventBus
        EventBus.removeListener(EVENTS.generateExample);
        EventBus.removeListener(EVENTS.difficultyChanged);
        
        // Отписываемся от слушателя изменения размера
        this.scene.scale.off('resize', this.updateLayout, this);
        
        // Очищаем кнопки
        for (let i = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].button) {
                this.buttons[i].button.removeAllListeners();
            }
        }
        
        // Очищаем адаптивный дисплей
        if (this.adaptiveDisplay) {
            this.adaptiveDisplay.destroy();
        }
        
        // Очищаем таймер
        if (this.timeBar) {
            this.timeBar.destroy();
        }
    }
}