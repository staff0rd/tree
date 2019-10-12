import { Point as Vector2 } from './core/Point'
import { Branch } from './Branch'
import { Rect } from './core/Rect';
import { Colors } from './core/Colors'
import * as PIXI from "pixi.js"

export class AttractionPoint
{        
    position: Vector2;
    closedBranch: Branch;
    private width = 1;
    private height = 1;
    public get rect() { return new Rect(this.position.x, this.position.y, this.width, this.height); }

    constructor(position: Vector2)
    {
        this.position = position;
    }

    draw(g: PIXI.Graphics)
    {
        g.beginFill(Colors.Green.C500)
            .drawRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    }
}

