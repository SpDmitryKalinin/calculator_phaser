import { Button } from "../Button";
import { AdaptiveDisplay } from "../utility/AdaptiveDisplay";

export class ButtonsManager {
    buttons: { button: Button, value: number }[] = [];
    scene: Phaser.Scene;
    adaptiveDisplay: AdaptiveDisplay;
    onButtonClickCallback: (selectedValue: number, buttonIndex: number) => void;

    constructor(scene: Phaser.Scene, adaptiveDisplay: AdaptiveDisplay, buttonClickCallback: (selectedValue: number, buttonIndex: number) => void) {
        this.scene = scene;
        this.adaptiveDisplay = adaptiveDisplay;
        this.onButtonClickCallback = buttonClickCallback;
    }

    createButtons(count: number, startX: number, startY: number, buttonSpacing: number) {
        this.buttons = [];
        const defaultWidth = 150; // Базовая ширина кнопки
        const gap = 20; // Промежуток между кнопками
        
        switch(count) {
            case 2:
                // Вертикальное расположение - две кнопки одна под другой
                for(let i = 0; i < count; i++) {
                    const buttonObj = this.createButton(startX, startY + i * buttonSpacing, i, defaultWidth * 2);
                    this.buttons.push(buttonObj);
                }
                break;
                
            case 3:
                // Две кнопки сверху, одна широкая снизу
                const topButtonWidth = defaultWidth - gap/2;
                
                // Верхние две кнопки - исправленный расчет позиций
                const totalTopWidth = 2 * topButtonWidth + gap;
                for(let i = 0; i < 2; i++) {
                    // Рассчитываем левый край первой кнопки
                    const leftEdge = startX - totalTopWidth/2;
                    // Позиционируем каждую кнопку с корректным отступом
                    const xPos = leftEdge + i * (topButtonWidth + gap) + topButtonWidth/2;
                    const buttonObj = this.createButton(xPos, startY, i, topButtonWidth);
                    this.buttons.push(buttonObj);
                }
                
                // Нижняя широкая кнопка - центрирована по startX
                const bottomButtonWidth = defaultWidth * 2;
                const bottomButtonObj = this.createButton(startX, startY + buttonSpacing, 2, bottomButtonWidth);
                this.buttons.push(bottomButtonObj);
                break;
                
            case 4:
                // Сетка 2x2 - тоже исправляем позиционирование
                const gridButtonWidth = defaultWidth;
                const totalGridWidth = 2 * gridButtonWidth + gap;
                
                for(let row = 0; row < 2; row++) {
                    const leftEdge = startX - totalGridWidth/2;
                    
                    for(let col = 0; col < 2; col++) {
                        const index = row * 2 + col;
                        const xPos = leftEdge + col * (gridButtonWidth + gap) + gridButtonWidth/2;
                        const yPos = startY + row * buttonSpacing;
                        
                        const buttonObj = this.createButton(xPos, yPos, index, gridButtonWidth);
                        this.buttons.push(buttonObj);
                    }
                }
                break;
                
            default:
                // Для других количеств делаем вертикальное расположение
                for(let i = 0; i < count; i++) {
                    const buttonObj = this.createButton(startX, startY + i * buttonSpacing, i, defaultWidth);
                    this.buttons.push(buttonObj);
                }
                break;
        }
    }
    createButton(x: number, y: number, index: number, width: number) {
        const button = new Button({
            scene: this.scene,
            x: x,
            y: y,
            text: '',
            callback: () => this.handleButtonClick(index),
            adaptiveDisplay: this.adaptiveDisplay
        }, width, false);
        
        return { button, value: 0 };
    }

    private handleButtonClick(index: number) {
        const currentButton = this.buttons[index];
        if (this.onButtonClickCallback) {
            this.onButtonClickCallback(currentButton.value, index);
        }
    }

    updateButtonValues(values: number[]) {
        for(let i = 0; i < Math.min(this.buttons.length, values.length); i++) {
            this.buttons[i].button.buttonText.setText(values[i].toString());
            this.buttons[i].value = values[i];
        }
    }

    highlightButton(index: number, color: number) {
        if (index >= 0 && index < this.buttons.length) {
            this.buttons[index].button.animate(color);
        }
    }

    getButtonValue(index: number): number {
        if (index >= 0 && index < this.buttons.length) {
            return this.buttons[index].value;
        }
        return 0;
    }

    findButtonIndexByValue(value: number): number {
        return this.buttons.findIndex(btn => btn.value === value);
    }

    updateLayout() {
        this.buttons.forEach(buttonObj => {
            if (buttonObj.button) {
                buttonObj.button.updateLayout();
            }
        });
    }

    destroy() {
        for (let i = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].button) {
                this.buttons[i].button.destroy();
            }
        }
        this.buttons = [];
    }
}