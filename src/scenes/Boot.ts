import { Scene } from 'phaser';
import loadAssets, { AssetKey } from '../utils/load-assets';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        const usedAssets: AssetKey[] = [
            'background',
            'tempbg',
            'chalkFont'
            
        ];
        loadAssets(this, usedAssets)
    }

    create ()
    {
        this.scene.start('Preloader');
        this.scene.launch('background')
    }
}
