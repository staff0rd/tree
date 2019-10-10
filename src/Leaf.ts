import { Point as Vector2 } from './core/Point'
import { Branch } from './Branch'
import { Rect } from './core/Rect';

export class Leaf
{        

    Position: Vector2;
    ClosestBranch: Branch;
    public get rect() {
        return new Rect(this.Position.x, this.Position.y, 1, 1); 
    }

    constructor(position: Vector2)
    {
        this.Position = position;
    }

    Draw()//SpriteBatch spritebatch)
    {
        // spritebatch.Draw(Texture, Rectangle, Color.Green);
    }
}

