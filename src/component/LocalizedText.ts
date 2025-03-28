import { Scene, GameObjects } from 'phaser';
import { translator } from './Translator';

/**
 * Расширение класса Text для того чтобы поддерживался переводы
 */
export class LocalizedText extends GameObjects.Text {
    private translationKey: string;
    private translationParams: object;
    private currentStyle: Phaser.Types.GameObjects.Text.TextStyle;

    /**
     * @param scene
     * @param x 
     * @param y 
     * @param translationKey 
     * @param style 
     * @param translationParams 
     */
    constructor(
        scene: Scene, 
        x: number, 
        y: number, 
        translationKey: string, 
        style?:  object | GameObjects.TextStyle | undefined,
        translationParams: object = {}
    ) {
        const translatedText = translator.t(translationKey, translationParams);
        super(scene, x, y, translatedText, style);

        this.translationKey = translationKey;
        this.translationParams = translationParams;
        this.currentStyle = this.style;

        scene.add.existing(this);

        translator.onLangChange(this.updateTranslation.bind(this));

        this.on('destroy', () => {
            translator.offLangChange(this.updateTranslation.bind(this));
        });
    }

    /**
     * Обновляет текст при смене языка
     */
    private updateTranslation(): void {
        if (this.scene && this.scene.sys.game && !this.destroyed) {
            const translatedText = translator.t(this.translationKey, this.translationParams);
            
            
            // Обновляем текст
            this.setText(translatedText);
            
            // Явно применяем сохраненный стиль снова, чтобы избежать его потери
            this.setStyle(this.currentStyle);
        }
    }

    /**
     * Обновляет параметры перевода и сам текст
     * @param params
     */
    public updateParams(params: object): LocalizedText {
        this.translationParams = { ...this.translationParams, ...params };
        this.updateTranslation();
        return this;
    }

    /**
     * Изменяет ключ перевода
     * @param key - Новый ключ перевода
     */
    public setTranslationKey(key: string, params?: object): LocalizedText {
        this.translationKey = key;
        if (params) {
            this.translationParams = params;
        }
        
        // Сохраняем текущий стиль перед обновлением текста
        const currentStyle = this.style;
        
        // Обновляем текст
        this.updateTranslation();
        
        // Явно применяем сохраненный стиль снова
        this.setStyle(currentStyle);
        
        return this;
    }
    
    /**
     * Переопределяем setStyle, чтобы сохранять текущий стиль
     */
    public setStyle(style: object | Phaser.Types.GameObjects.Text.TextStyle): this {
        this.currentStyle = style as Phaser.Types.GameObjects.Text.TextStyle;
        return super.setStyle(style);
    }
}

declare global {
    namespace Phaser.GameObjects {
        interface GameObjectFactory {
            localizedText(
                x: number,
                y: number,
                translationKey: string,
                style?: GameObjects.TextStyle | object,
                translationParams?: object
            ): LocalizedText;
        }
    }
}

Phaser.GameObjects.GameObjectFactory.prototype.localizedText = function (
    x: number,
    y: number,
    translationKey: string,
    style?: GameObjects.TextStyle | object,
    translationParams: object = {}
): LocalizedText {
    return new LocalizedText(this.scene, x, y, translationKey, style, translationParams);
};