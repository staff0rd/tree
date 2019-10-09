import * as PIXI from "pixi.js";
import { Config } from './Config';
import { Analytics } from "./core/Analytics";
import { Colors } from './core/Colors';
import { PointValue } from './core/PointValue';

export class Game {
    private pixi: PIXI.Application;
    private interactionHitBox: PIXI.Graphics;
    private pointerBlock: PIXI.Graphics;
    private lastPoint: PointValue<any>;
    private config: Config;

    constructor(config: Config, pixi: PIXI.Application) {
        this.pixi = pixi;
        this.config = config;
        this.initInteraction();
        
        this.initPointer();

        window.onresize = () => {
            this.pixi.view.width = window.innerWidth;
            this.pixi.view.height = window.innerHeight;
            this.interactionHitBox.width = window.innerWidth;
            this.interactionHitBox.height = window.innerHeight;
        }
    }

    initPointer() {
        const g = new PIXI.Graphics();
        g.beginFill(Colors.Red.C100);
        g.alpha = .25;
        g.drawRect(0, 0, 1, 1);
        g.endFill();
        this.pointerBlock = g;
    }

    initInteraction() {
        this.pixi.stage.interactive =true;
        this.interactionHitBox = new PIXI.Graphics();
        this.interactionHitBox.beginFill();
        this.interactionHitBox.drawRect(0, 0, 1, 1);
        this.interactionHitBox.endFill();
        this.interactionHitBox.width = window.innerWidth;
        this.interactionHitBox.height = window.innerHeight;
        this.interactionHitBox.interactive = true;
        this.interactionHitBox.on('pointertap', () => this.init());
        this.interactionHitBox.alpha = 0;
    }



    init() {
        Analytics.buttonClick("rengenerate");

        const blueBox = new PIXI.Graphics()
        .beginFill(Colors.Blue.C500)
        .drawRect(100, 100, 100, 100)

        this.pixi.stage.addChild(blueBox);
    }
}