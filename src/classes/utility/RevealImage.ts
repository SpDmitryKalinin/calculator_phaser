import * as Phaser from 'phaser';
const frag = `
    #define SHADER_NAME REVEAL_IMAGE

    precision lowp float;

    uniform sampler2D uMainSampler;
    uniform sampler2D uNoiseTexture;
    
    uniform float uProgress;
    uniform float uEdgeSmoothness;

    varying vec2 outTexCoord;

    void main ()
    {   
       
        vec4 pixel = texture2D(uMainSampler, outTexCoord);
       
        float noise = texture2D(uNoiseTexture, outTexCoord).r;

        float pr = uProgress * (1.0 + uEdgeSmoothness) - uEdgeSmoothness/2.0;
        float edge0 = pr - uEdgeSmoothness/2.0;
        float edge1 = pr + uEdgeSmoothness/2.0;

        float alpha = (1.0 - smoothstep(edge0, edge1, noise)) * pixel.a;

        pixel *= alpha;
   
        gl_FragColor = vec4(pixel.rgba);
    }
    `;

export default class RevealImage extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {

    noiseTexture?: WebGLTexture;

    progress: number = 0;
    edgeSmooth: number = 0.05;

    constructor(game: Phaser.Game) {
        super({
            game,
            name: 'RevealImage',
            shaders: [
                {
                    name: 'RevealImage',
                    fragShader: frag,
                }
            ],
        });
    }

    onPreRender() {
        this.set1f('uProgress', this.progress);
        this.set1f('uEdgeSmoothness', this.edgeSmooth);
    }

    setProgress(progress: number) {
        this.progress = progress;
    }

    onBind(gameObject: Phaser.GameObjects.GameObject) {
        super.onBind(gameObject);
        this.attachNoiseTexture();
    }

    attachNoiseTexture() {
        if (!this.game.textures.exists('noise')) {
            console.warn('Noise texture not found');
            return;
        }

        const noiseImage = this.game.textures.get('noise').source[0].glTexture;
        this.noiseTexture = noiseImage?.webGLTexture || undefined;

        if (!this.noiseTexture) {
            return;
        }

        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);

        this.set1i('uNoiseTexture', 1);
    }
}
