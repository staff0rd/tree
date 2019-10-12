
    import { Point as Vector2 } from './core/Point'
    import * as PIXI from "pixi.js"
    import { Colors } from './core/Colors';

    export class Branch
    {
        parent: Branch;
        GrowDirection: Vector2;
        OriginalGrowDirection: Vector2;
        GrowCount: number;
        position: Vector2;
        Size: number;

        constructor(parent: Branch, position: Vector2, growDirection: Vector2) {
            this.parent = parent;
            this.position = position;
            this.GrowDirection = growDirection;
            this.OriginalGrowDirection = growDirection;
            this.Size = 0.002;
            this.GrowCount = 0;
        }

        Reset()
        {
            this.GrowCount = 0;
            this.GrowDirection = this.OriginalGrowDirection;
        }

        private drawLine(g: PIXI.Graphics, width: number, color: number, point1: Vector2, point2: Vector2)
        {
            // const angle = Math.atan2(point2.y - point1.y, point2.x - point1.x);
            // let length = point1.distance(point2);
            // length = length / 10;
            g.lineStyle(Math.max(width, 1), color)
            .moveTo(point1.x, point1.y)
            .lineTo(point2.x, point2.y);
        }

        public draw(g: PIXI.Graphics)
        {
            if (this.parent != undefined)
                 this.drawLine(g, Math.sqrt(this.Size), Colors.Brown.C500, this.position, this.parent.position);
        }
    }

