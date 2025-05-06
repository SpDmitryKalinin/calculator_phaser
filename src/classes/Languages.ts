import { GameObjects } from "phaser";
import { translator } from "../component/Translator";
import { AdaptiveDisplay } from "./utility/AdaptiveDisplay";

export class Languages {
    y: number;
    x: number;
    scene: Phaser.Scene;
    enButton: GameObjects.BitmapText;
    ruButton: GameObjects.BitmapText;
    esButton: GameObjects.BitmapText;
    adaptiveDisplay: AdaptiveDisplay;
    gap: number = 20;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.init()
    }

    init() {
        this.adaptiveDisplay = new AdaptiveDisplay({
            designWidth: 360,
            designHeight: 720,
            scene: this.scene,
            debug: false
        });


        this.enButton = this.scene.add.localizedBitmapText(0, 0, 'EN', 'chalkFont', 24).setInteractive();
        this.ruButton = this.scene.add.localizedBitmapText(0, 0, 'RU', 'chalkFont', 24).setInteractive();
        this.esButton = this.scene.add.localizedBitmapText(0, 0, 'ES', 'chalkFont', 24).setInteractive();

        this.enButton.on('pointerdown', () => translator.changeLang('en'));
        this.ruButton.on('pointerdown', () => translator.changeLang('ru'));
        this.esButton.on('pointerdown', () => translator.changeLang('es'));
        this.updateLayout();
    }

    updateLayout() {
        const scale = this.adaptiveDisplay.getScaleX();
        this.adaptiveDisplay.placeAt(this.x, this.y, this.enButton);
        this.adaptiveDisplay.placeAt(this.x + 40, this.y, this.ruButton);
        this.adaptiveDisplay.placeAt(this.x + 75, this.y, this.esButton);
        this.enButton.setFontSize(Math.floor(24 * scale));
        this.ruButton.setFontSize(Math.floor(24 * scale));
        this.esButton.setFontSize(Math.floor(24 * scale));
    }
}