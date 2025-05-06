import * as Phaser from 'phaser';
import EventBus from '../../constants/event-bus';
import { EVENTS } from '../../constants/event';
import { store } from '../../globalStore';

const bgmKey: {last: string|undefined} = {
    last: undefined,
};

export default class AudioPlayer {
    scene : Phaser.Scene;

    get volumeFX() {
        return Number(localStorage.getItem('volumeFX') ?? 1);
    }

    get volumeBG() {
        return Number(localStorage.getItem('volumeBG') ?? 1);
    }

    get enabled(): boolean {
        return store.isSound
    }
    
    timer : number = 0;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.addListeners();
    }

    addListeners() {
        EventBus.removeAllListeners(EVENTS.playBGM);
        EventBus.removeAllListeners(EVENTS.playFX);
        EventBus.removeAllListeners(EVENTS.toggleSound);

        EventBus.on(EVENTS.toggleSound, (value: boolean) => {
            if (value === false) {
                this.scene.sound.stopAll();
                return;
            }

            if (bgmKey.last) {
                this.playBGM(bgmKey.last);
            }
        });

        EventBus.on(EVENTS.playFX, (key : string, volume?: number, pitch?: number) => {
            this.playFX(key, volume || this.volumeFX, pitch || 1);
        });

        EventBus.on(EVENTS.playBGM, (key : string, loop : boolean = true) => {
            this.playBGM(key, loop);
        });
    }

    playFX(key : string, volume: number, pitch: number) {
        if (!this.enabled) {
            return;
        }

        if (!key) {
            return;
        }
        try {
            this.scene.sound.stopByKey(key);
            this.scene.sound.play(key, {
                volume: volume,
                loop: false,
                rate: pitch
            });
        } catch (error) {
            console.warn((error as Error).message);
        }
    }

    playBGM(key: string, loop: boolean = true) {
        bgmKey.last = key;

        if (!this.enabled) {
            return;
        }

        if (!key) {
            return;
        }

        const playingSounds = this.scene.sound.getAllPlaying();
        const sound = playingSounds.find(s => s.key === key);

        if (sound) {
            return;
        }

        try {
            playingSounds.forEach(s => {
                if (s.key.includes('music_')) {
                    s.stop();
                }
            });

            this.scene.sound.play(key, {
                volume: this.volumeBG,
                loop: loop,
            });
        } catch (error) {
            console.warn((error as Error).message);
        }
    }

    changeVolume(vol : number, key : string) {
        if (key === 'volumeFX') {
            return;
        }

        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
            const playingSounds = this.scene.sound.getAllPlaying();
            const keys : string[] = [];
            playingSounds.forEach(s => {
                if (s.key.includes('bgm')) {
                    s.stop();
                    keys.push(s.key);
                }
            });

            keys.forEach(key => {
                this.scene.sound.play(key, {
                    volume: this.volumeBG,
                    loop: true,
                });
            });
        }, 50);
    }
}
