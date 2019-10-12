import * as PIXI from "pixi.js";
import { Config } from './Config';
import { Analytics } from "./core/Analytics";
import { Point } from "./core/Point";
import { Tree } from './Tree';
import { throwStatement } from "@babel/types";

export class Game {
    private pixi: PIXI.Application;
    private interactionHitBox: PIXI.Graphics;
    private config: Config;
    private tree: Tree;
    private growInterval: any;
    private stage: PIXI.Container;
    private status: PIXI.Text;

    constructor(config: Config, pixi: PIXI.Application) {
        this.pixi = pixi;
        this.config = config;

        this.initInteraction();
        
        this.stage = new PIXI.Container();
        this.status = new PIXI.Text("");
        this.pixi.stage.addChild(this.stage, this.status);

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
        this.tree && this.stage.removeChild(this.tree.view);
        this.tree = new Tree(new Point(window.innerWidth/2/this.config.scale, window.innerHeight/this.config.scale), this.config.scale);
        this.stage.addChild(this.tree.view);
        this.growInterval && clearInterval(this.growInterval);
        this.growInterval = setInterval(() => {
            this.draw();
            this.tree.Grow();
        }, this.config.growSpeed)
    }

    draw() {
        const status = this.tree.doneGrowing ? "Done" : "Growing";
        const message = `Status: ${status}\n` + this.tree.status;
        this.status.text = message;
        this.status.pivot.set(0,this.status.height);
        this.status.position.set(5, window.innerHeight - 5);
        this.tree.Draw();
        this.tree.view.scale.set(this.config.scale);        
    }
}