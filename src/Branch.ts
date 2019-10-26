import { Point as Vector2 } from './core/Point'
import * as PIXI from "pixi.js"
import { Colors } from './core/Colors';

export class Branch
{
    static readonly growIncrement = .1;
    static readonly initialSize = .2;
    parent: Branch;
    growDirection: Vector2;
    originalGrowDirection: Vector2;
    growCount: number;
    position: Vector2;
    size: number;

    constructor(parent: Branch, position: Vector2, growDirection: Vector2) {
        this.parent = parent;
        this.position = position;
        this.growDirection = growDirection;
        this.originalGrowDirection = growDirection;
        this.size = Branch.initialSize;
        this.growCount = 0;
    }

    reset()
    {
        this.growCount = 0;
        this.growDirection = this.originalGrowDirection;
    }

    private drawLine(g: PIXI.Graphics, width: number, color: number, point1: Vector2, point2: Vector2)
    {
        g.lineStyle(Math.max(width, .33), color)
        .moveTo(point1.x, point1.y)
        .lineTo(point2.x, point2.y);
    }

    public draw(g: PIXI.Graphics)
    {
        if (this.parent != undefined)
                this.drawLine(g, Math.sqrt(this.size), Colors.Brown.C600, this.position, this.parent.position);
    }
}
