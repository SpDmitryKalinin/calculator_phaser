import { Scene, GameObjects } from 'phaser';
import { AdaptiveDisplay } from '../classes/utility/AdaptiveDisplay';

import { Button } from '../classes/Button';
import { Languages } from '../classes/Languages';

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.BitmapText | null;
    languages: Languages
    

    private adaptiveDisplay: AdaptiveDisplay | null;

    // UI элементы
    private playButton: Button | null;
    private initialLayoutComplete: boolean = false;

    constructor() {
        super('MainMenu');

        // Привязываем метод к this, чтобы сохранить контекст
        this.updateLayout = this.updateLayout.bind(this);
    }

    create() {
        // Ожидаем стабилизации размера игры
        this.game.canvas.style.visibility = 'hidden';

        // Создаем адаптивный дисплей
        this.adaptiveDisplay = new AdaptiveDisplay({
            designWidth: 360,
            designHeight: 720,
            scene: this,
            debug: false
        });

        // Создаем заголовок
        this.title = this.add.localizedBitmapText(
            500,
            400,
            '1 + 2 = 3',
            'chalkFont',
            50,
        ).setOrigin(0.5);
        
        // Создаем кнопку с помощью нового компонента
        this.playButton = new Button({
            scene: this,
            x: 180,
            y: 250,
            text: 'play',
            callback: () => {
                this.scale.off('resize', this.updateLayout, this);
                this.scene.start('Game');
            },
            adaptiveDisplay: this.adaptiveDisplay
        });

        this.time.delayedCall(50, () => {
            this.updateLayout();
            this.time.delayedCall(50, () => {
                this.updateLayout();
                this.game.canvas.style.visibility = 'visible';
                this.initialLayoutComplete = true;
            });
        });

        // Слушаем событие изменения размера окна ПОСЛЕ создания всех элементов
        this.scale.on('resize', this.updateLayout, this);

        // Регистрируем обработчик shutdown и destroy для очистки ресурсов
        this.events.once('shutdown', this.shutdown, this);
        this.events.once('destroy', this.destroy, this);

        this.languages = new Languages(this, 200, 32)
    }

    /**
     * Обновляет позиции и масштабы элементов
     */
    updateLayout() {
        // Проверяем, что сцена активна
        if (!this.scene.isActive('MainMenu')) return;

        // Проверяем, что адаптивный дисплей существует
        if (!this.adaptiveDisplay) return;
        const scale = this.adaptiveDisplay.getScaleX();

        // Принудительное обновление масштаба для первого рендера
        if (!this.initialLayoutComplete) {
            this.adaptiveDisplay.updateScale();
        }

        // Обновляем позицию заголовка
        if (this.title && this.title.active) {
            this.adaptiveDisplay.placeAt(180, 120, this.title);

            // Обновляем размер шрифта заголовка
            
            this.title.setFontSize(Math.floor(48 * scale));
        }
        

        // Обновляем кнопку через метод компонента
        if (this.playButton) {
            this.playButton.updateLayout();
        }

        this.languages.updateLayout();
    }

    /**
     * Очищаем ресурсы при закрытии сцены
     */
    shutdown() {
        // Отписываемся от события resize
        this.scale.off('resize', this.updateLayout, this);

        if (this.adaptiveDisplay) {
            this.adaptiveDisplay.destroy();
            this.adaptiveDisplay = null; // Явно обнуляем ссылку
        }

        // Уничтожаем компонент кнопки
        if (this.playButton) {
            this.playButton.destroy();
            this.playButton = null;
        }

        // Обнуляем ссылку на заголовок
        if (this.title) {
            this.title = null;
        }
    }

    /**
     * Дополнительная очистка при уничтожении сцены
     */
    destroy() {
        this.shutdown();
    }
}