import { Scene } from 'phaser';

export type LoadType = 'atlas' | 'image' | 'bitmapFont' | 'audio';

interface AssetData {
    type: LoadType;
    params: string[];
}

const assetsData: Record<string, AssetData> = {
    'chalkFont': {
        type: 'bitmapFont',
        params: ['/assets/fonts/chalk0.png', '/assets/fonts/chalk.xml']
    },
    'background': {
        type: 'image',
        params: ['/assets/background/background.png'],
    },
    'heart': {
        type: 'image',
        params: ['/assets/heart.png'],
    },
    'hearts': {
        type: 'atlas',
        params: ['/assets/ui/hearts.png', '/assets/ui/hearts.json'],
    },
    'dinamit': {
        type: 'atlas',
        params: ['/assets/dinamit.png', '/assets/dinamit.json'],
    },
    'phetil': {
        type: 'atlas',
        params: ['/assets/ph.png', '/assets/ph.json'],
    },
    'progressBg':{
        type: 'image',
        params: ['/assets/progress_bg.png'],
    },
    'progressMask': {
        type: 'image',
        params: ['/assets/progress_mask.png'],
    },
    'progressBar': {
        type: 'image',
        params: ['/assets/progress_bar.png'],
    },
    'textureMask': {
        type: 'image',
        params: ['/assets/texture-mask.png']
    },
    'frame': {
        type: 'image',
        params: ['/assets/background/frame.png']
    },
    'noise': {
        type: 'image',
        params: ['/assets/noises/noise-linear.png']
    },
    'reward1': {
        type: 'image',
        params: ['/assets/rewards/reward1.webp']
    },
    'reward2': {
        type: 'image',
        params: ['/assets/rewards/reward2.webp']
    },
    'sound': {
        type: 'image',
        params: ['/assets/ui/sound.png']
    }
};

const soundData: Record<string, AssetData> = {
    'click': {
        type: 'audio',
        params: ['/assets/sfx/219145__reitanna__ratsneeze7.mp3'],
    },
    'hover': {
        type: 'audio',
        params: ['/assets/sfx/219137__reitanna__ratsneeze2.mp3'],
    },
    'right_answer': {
        type: 'audio',
        params: ['/assets/sfx/219145__reitanna__ratsneeze7.mp3'],
    },
    'lose': {
        type: 'audio',
        params: ['/assets/sfx/241228__reitanna__pinkie-pie-evil-giggle.mp3'],
    },
    'success': {
        type: 'audio',
        params: ['/assets/sfx/323695__reitanna__clear-throat10.mp3'],
    },
    'reward': {
        type: 'audio',
        params: ['/assets/sfx/242902__reitanna__exasperated-growl.mp3'],
    },
    'boom': {
        type: 'audio',
        params: ['/assets/sfx/211976__qubodup__boom2.mp3'],
    },
    'time': {
        type: 'audio',
        params: ['/assets/sfx/401876__gcguest1__cameroon_at_ti_03_tom-tick.mp3'],
    }
    
};

export type AssetKey = keyof typeof assetsData | keyof typeof soundData;

function checkAssetInCache(scene: Scene, key: AssetKey, type: LoadType): boolean {
    const checkFn: Record<LoadType, () => boolean> = {
        atlas: () => scene.textures.exists(key),
        image: () => scene.textures.exists(key),
        bitmapFont: () => !!scene.cache.bitmapFont.get(key),
        audio: () => !!scene.cache.audio.get(key),
    }

    return checkFn[type]();
}

export default function loadAssets(scene: Scene, usedAssets: AssetKey[]) {
    usedAssets.forEach((key) => {
        const data = (assetsData[key] || soundData[key]) as { type: LoadType, params: string[] } | undefined;
        if (!data) {
            console.warn(`Asset "${key}" not found in asset data`);
            return;
        }

        if (checkAssetInCache(scene, key, data.type)) {
            console.warn(`"${key}" already loaded`);
            return;
        }

        try {
            scene.load[data.type](key, ...data.params);
        } catch (error) {
            console.warn(`Error loading asset "${key}":`, error);
        }
    });
}