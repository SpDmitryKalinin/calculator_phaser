import { Scene } from "phaser";
import { AdaptiveDisplay } from "../classes/utility/AdaptiveDisplay";
import { store } from "../globalStore";
import EventBus from "../constants/event-bus";
import { EVENTS } from "../constants/event";

export class Settings extends Scene {
    adaptiveDisplay: AdaptiveDisplay;
    soundIcon: Phaser.GameObjects.Sprite;
    
    constructor() {
        super('settings');
    }

    create() {
        this.adaptiveDisplay = new AdaptiveDisplay({
            designWidth: 360,
            designHeight: 720,
            scene: this,
            debug: false
        });

        this.createSoundIcon();
        this.updateLayout();

        this.scale.on('resize', this.updateLayout, this);
    }

    createSoundIcon() {
        this.soundIcon = this.add.sprite(0, 0, 'sound');
        this.soundIcon.setOrigin(1, 0);
        
        // Make the sound icon interactive
        this.soundIcon.setInteractive();
        
        // Add the click event listener
        this.soundIcon.on('pointerdown', this.toggleSound, this);
    }

    toggleSound() {
        store.setSound(!store.isSound)
        EventBus.emit(EVENTS.toggleSound, store.isSound)
        
        // Update the opacity based on the sound state
        this.soundIcon.setAlpha(store.isSound ? 1 : 0.5);
        
        // Here you would also add code to actually mute/unmute the game sound
        // For example:
        // this.sound.mute = !this.soundEnabled;
    }

    updateLayout() {
        const scale = this.adaptiveDisplay.getScaleX();
        this.adaptiveDisplay.placeAt(340, 30, this.soundIcon);
        this.soundIcon.setDisplaySize(25 * scale, 25 * scale);
    }
}