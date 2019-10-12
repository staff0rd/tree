import * as PIXI from "pixi.js";
import { Config } from './Config';
import { Analytics } from "./core/Analytics";
import { Colors } from './core/Colors';
import { PointValue } from './core/PointValue';
import { Tree } from './Tree';
import { Point } from "./core/Point";

export class Game {
    private pixi: PIXI.Application;
    private interactionHitBox: PIXI.Graphics;
    private config: Config;
    private tree: Tree;
    private growInterval: any;
    private stage: PIXI.Container;

    constructor(config: Config, pixi: PIXI.Application) {
        this.pixi = pixi;
        this.config = config;

        this.initInteraction();
        
        this.stage = new PIXI.Container();
        this.pixi.stage.addChild(this.stage);

        window.onresize = () => {
            this.pixi.view.width = window.innerWidth;
            this.pixi.view.height = window.innerHeight;
            this.interactionHitBox.width = window.innerWidth;
            this.interactionHitBox.height = window.innerHeight;
        }
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
        this.pixi.stage.addChild(this.interactionHitBox);
    }



    init() {
        Analytics.buttonClick("rengenerate");

        this.tree = new Tree(new Point(0, 0));
        this.growInterval && clearInterval(this.growInterval);
        this.growInterval = setInterval(() => {
            this.draw();
            this.tree.Grow();
        }, this.config.growSpeed)
    }

    draw() {
        this.stage.removeChildren();
        const status = this.tree.DoneGrowing ? "Done" : "Growing";
        const text = new PIXI.Text(`Status: ${status}`);
        text.pivot.set(0,text.height);
        text.position.set(5, window.innerHeight - 5);
        this.tree.Draw();
        this.tree.view.scale.set(3);
        this.tree.view.position.set(this.tree.view.width + 20 , this.tree.view.height + 100);
        this.stage.addChild(text, this.tree.view);
    }
}