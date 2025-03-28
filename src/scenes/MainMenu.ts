import { Scene, GameObjects } from 'phaser';
import { AdaptiveDisplay } from './AdaptiveDisplay';
import { translator } from '../component/Translator';

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text | null;


    private adaptiveDisplay: AdaptiveDisplay | null;;

    // UI элементы
    private playButton: GameObjects.Rectangle | null;;
    private playButtonText: GameObjects.Text | null;;
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
            designHeight: 800,
            scene: this,
            debug: false
        });

        // Создаем заголовок
        this.title = this.add.localizedText(
            180,
            400,
            '1 + 2 = 3',
            {
                fontSize: '48px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);


        const buttonData = this.createButton(180, 400, 'play', () => {
            this.scale.off('resize', this.updateLayout, this);
            this.scene.start('Game');
        });

        this.playButton = buttonData.button;
        this.playButtonText = buttonData.buttonText;

        // Отложенное обновление макета для гарантии правильного первого рендера
        this.time.delayedCall(50, () => {
            // Обновляем layout дважды для гарантии
            this.updateLayout();

            // Небольшая задержка для второго обновления
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

        const enButton = this.add.text(700, 20, 'EN', { fontSize: '20px' }).setInteractive();
        const ruButton = this.add.text(700, 50, 'RU', { fontSize: '20px' }).setInteractive();
        const esButton = this.add.text(700, 80, 'ES', { fontSize: '20px' }).setInteractive();

        enButton.on('pointerdown', () => translator.changeLang('en'));
        ruButton.on('pointerdown', () => translator.changeLang('ru'));
        esButton.on('pointerdown', () => translator.changeLang('es'));
    }

    /**
     * Обновляет позиции и масштабы элементов
     */
    updateLayout() {
        // Проверяем, что сцена активна
        if (!this.scene.isActive('MainMenu')) return;

        // Проверяем, что адаптивный дисплей существует
        if (!this.adaptiveDisplay) return;

        // Принудительное обновление масштаба для первого рендера
        if (!this.initialLayoutComplete) {
            this.adaptiveDisplay.updateScale();
        }

        // Обновляем позицию заголовка
        if (this.title && this.title.active) {
            this.adaptiveDisplay.placeAt(180, 100, this.title);

            // Обновляем размер шрифта заголовка
            const scale = this.adaptiveDisplay.getScaleX();
            this.title.setFontSize(Math.floor(48 * scale) + 'px');
        }

        // Обновляем кнопку
        if (this.playButton && this.playButton.active && this.playButtonText && this.playButtonText.active) {
            this.adaptiveDisplay.placeAt(180, 250, this.playButton);
            this.adaptiveDisplay.placeAt(180, 250, this.playButtonText);

            // Обновляем размер кнопки
            const scaleX = this.adaptiveDisplay.getScaleX();
            const scaleY = this.adaptiveDisplay.getScaleY();
            this.playButton.setSize(240 * scaleX, 60 * scaleY);

            // Обновляем размер шрифта кнопки
            this.playButtonText.setFontSize(Math.floor(28 * scaleX) + 'px');
        }
    }

    /**
     * Создает интерактивную кнопку
     */
    createButton(x: number, y: number, text: string, callback: Function) {
        // Фон кнопки
        const button = this.add.rectangle(x, y, 240, 60,)
            .setOrigin(0.5)
            .setInteractive()
            .setStrokeStyle(2, 0xffffff);

        // Текст кнопки
        const buttonText = this.add.localizedText(x, y, text, {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        button.on('pointerdown', () => {
            callback();
        });

        return { button, buttonText };
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

        // Удаляем обработчики событий кнопки
        if (this.playButton) {
            this.playButton.removeAllListeners();
            this.playButton = null; // Явно обнуляем ссылку
        }

        // Обнуляем ссылку на текст кнопки
        if (this.playButtonText) {
            this.playButtonText = null;
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