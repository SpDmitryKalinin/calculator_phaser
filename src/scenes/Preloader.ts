import { Scene } from 'phaser';
import { AdaptiveDisplay } from '../classes/utility/AdaptiveDisplay';
import loadAssets, { AssetKey } from '../utils/load-assets';
import { LocalizedBitmapText } from '../component/LocalizedBitmap';

export class Preloader extends Scene {
    private adaptiveDisplay: AdaptiveDisplay;
    private spinner: Phaser.GameObjects.Container;
    private spinnerCircle: Phaser.GameObjects.Arc;
    private spinnerDot: Phaser.GameObjects.Arc;
    private loadingText: LocalizedBitmapText;
    private spinnerTween: Phaser.Tweens.Tween;
    
    // Новые свойства для маски
    private spinnerMask: Phaser.GameObjects.Image;
    private spinnerMaskObject: Phaser.Display.Masks.BitmapMask;
    
    constructor() {
        super('Preloader');
    }
    
    init() {
        // Инициализируем адаптивный дисплей
        this.adaptiveDisplay = new AdaptiveDisplay({
            designWidth: 360,
            designHeight: 720,
            scene: this,
            debug: false
        });
        
        // Привязываем метод обновления к контексту
        this.updateLayout = this.updateLayout.bind(this);
        
        // Создаем минималистичный спиннер
        this.createSimpleSpinner();
        
        // Добавляем обработчики событий
        this.setupEventListeners();
    }
    
    preload() {
        // Используем функцию loadAssets для загрузки необходимых ресурсов
        const requiredAssets: AssetKey[] = [
            'tempbg',
            'background',
            'hearts',
            'dinamit',
            'phetil',
            'music_menu',
            'progressBg',
            'progressMask',
            'progressBar',
            'textureMask',
            'noise',
            'reward1',
            'reward2',
            'sound',
            'click',
            'hover',
            'lose',
            'success',
            'reward',
            'boom',
            'time'
        ];
        
        // Загружаем ассеты через утилиту loadAssets
        loadAssets(this, requiredAssets);
    }
    
    create() {
        // Задержка перед переходом к следующей сцене
        this.time.delayedCall(1500, () => {
            this.scene.start('MainMenu');
            this.scene.start('settings')
        });
    }
    
    /**
     * Создает простой спиннер в виде белого круга
     */
    private createSimpleSpinner() {
        this.spinner = this.add.container(0, 0);
        this.adaptiveDisplay.placeAt(340, 640, this.spinner);
        
        const scale = this.adaptiveDisplay.getScaleX();
        const spinnerSize = 20 * scale;
        
        this.spinnerCircle = this.add.circle(0, 0, spinnerSize, 0xffffff);
        this.spinnerCircle.setStrokeStyle(2 * scale, 0xffffff);
        this.spinnerCircle.setFillStyle(0xffffff, 0.2);
        
        // Добавляем маркер для видимости вращения
        this.spinnerDot = this.add.circle(spinnerSize - 4 * scale, 0, 4 * scale, 0xffffff);
        
        // Добавляем элементы в контейнер
        this.spinner.add(this.spinnerCircle);
        this.spinner.add(this.spinnerDot);
        
        // Создаем текст загрузки в центре экрана
        this.loadingText = this.add.localizedBitmapText(
            0, 0,
            'load',
            'chalkFont',
            50
        ).setOrigin(0.5);
        
        this.adaptiveDisplay.placeAt(180, 360, this.loadingText);
        
        // Создаем анимацию вращения
        this.spinnerTween = this.tweens.add({
            targets: this.spinner,
            angle: 360,
            duration: 1200,
            repeat: -1,
            ease: 'Linear'
        });
        
        // Создаем маску для спиннера (аналогично как в классе Button)
        this.spinnerMask = this.make.image({
            x: 0,
            y: 0,
            key: 'textureMask',
            add: false
        });
        
        // Позиционируем маску там же, где и спиннер
        this.adaptiveDisplay.placeAt(340, 640, this.spinnerMask);
        
        // Устанавливаем размер маски в соответствии с размером спиннера
        const maskSize = spinnerSize * 2.5; // Делаем маску немного больше спиннера
        this.spinnerMask.setDisplaySize(maskSize, maskSize);
        
        // Создаем объект маски из изображения
        this.spinnerMaskObject = this.spinnerMask.createBitmapMask();
        
        // Применяем маску к контейнеру спиннера
        this.spinner.setMask(this.spinnerMaskObject);
    }
    
    /**
     * Настраивает обработчики событий
     */
    private setupEventListeners() {
        // Обработчик прогресса загрузки
        this.load.on('progress', this.updateProgress, this);
        
        // Обработчик завершения загрузки
        this.load.on('complete', this.onLoadComplete, this);
        
        // Обработчик изменения размера окна
        this.scale.on('resize', this.updateLayout, this);
    }
    
    /**
     * Обновляет отображение прогресса загрузки
     */
    private updateProgress(progress: number) {
        const percent = Math.floor(progress * 100);
        
        // Обновляем текст загрузки
        if (this.loadingText && this.loadingText.active) {
            this.loadingText.setTranslationKey(`loadingProgress`, {percent: percent});
        }
    }
    
    /**
     * Обработчик завершения загрузки
     */
    private onLoadComplete() {
        if (this.loadingText && this.loadingText.active) {
            this.loadingText.setTranslationKey('done');
        }
    }
    
    /**
     * Обновляет макет при изменении размера экрана
     */
    private updateLayout() {
        // Проверяем активность сцены
        if (!this.scene.isActive('Preloader') || !this.adaptiveDisplay) {
            return;
        }
        
        // Получаем новый масштаб
        const scale = this.adaptiveDisplay.getScaleX();
        
        // Обновляем позицию спиннера (правый нижний угол)
        if (this.spinner && this.spinner.active) {
            this.adaptiveDisplay.placeAt(340, 640, this.spinner);
            
            // Обновляем размеры спиннера
            const spinnerSize = 20 * scale;
            
            if (this.spinnerCircle && this.spinnerCircle.active) {
                this.spinnerCircle.setRadius(spinnerSize);
                this.spinnerCircle.setStrokeStyle(2 * scale, 0xffffff);
            }
            
            if (this.spinnerDot && this.spinnerDot.active) {
                this.spinnerDot.setPosition(spinnerSize - 4 * scale, 0);
                this.spinnerDot.setRadius(4 * scale);
            }
            
            // Обновляем маску спиннера
            if (this.spinnerMask && this.spinnerMask.active) {
                this.adaptiveDisplay.placeAt(340, 640, this.spinnerMask);
                
                // Обновляем размер маски
                const maskSize = spinnerSize * 2.5; // Чуть больше спиннера
                this.spinnerMask.setDisplaySize(maskSize, maskSize);
            }
        }
        
        // Обновляем текст загрузки (в центре экрана)
        if (this.loadingText && this.loadingText.active) {
            this.adaptiveDisplay.placeAt(180, 360, this.loadingText);
            this.loadingText.setFontSize(Math.floor(50 * scale));
        }
    }
    
    /**
     * Очистка ресурсов при закрытии сцены
     */
    shutdown() {
        // Отписываемся от событий
        this.load.off('progress', this.updateProgress, this);
        this.load.off('complete', this.onLoadComplete, this);
        this.scale.off('resize', this.updateLayout, this);
        
        // Останавливаем анимацию
        if (this.spinnerTween && this.spinnerTween.isPlaying()) {
            this.spinnerTween.stop();
        }
        
        // Очищаем маску
        if (this.spinnerMaskObject) {
            this.spinnerMaskObject.destroy();
        }
        
        if (this.spinnerMask) {
            this.spinnerMask.destroy();
        }
        
        // Очищаем адаптивный дисплей
        if (this.adaptiveDisplay) {
            this.adaptiveDisplay.destroy();
        }
    }
    
    /**
     * Дополнительная очистка ресурсов при уничтожении сцены
     */
    destroy() {
        this.shutdown();
    }
}