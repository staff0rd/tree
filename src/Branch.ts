
    import { Point as Vector2 } from './core/Point'

    export class Branch
    {
        Parent: Branch;
        GrowDirection: Vector2;
        OriginalGrowDirection: Vector2;
        GrowCount: number;
        Position: Vector2;
        Size: number;

        constructor(parent: Branch, position: Vector2, growDirection: Vector2) {
            this.Parent = parent;
            this.Position = position;
            this.GrowDirection = growDirection;
            this.OriginalGrowDirection = growDirection;
            this.Size = 0.002;
        }

        Reset()
        {
            this.GrowCount = 0;
            this.GrowDirection = this.OriginalGrowDirection;
        }

        // private void DrawLine(SpriteBatch spritebatch, float width, Color color, Vector2 point1, Vector2 point2)
        // {
        //     float angle = (float)Math.Atan2(point2.Y - point1.Y, point2.X - point1.X);
        //     float length = Vector2.Distance(point1, point2);
        //     length = length / 10;
        //     spritebatch.Draw(Texture, point1, null, color, angle, Vector2.Zero, new Vector2(length, width), SpriteEffects.None, 0);
        // }

        // public void Draw(SpriteBatch spritebatch)
        // {
        //     if (Parent != null)
        //         DrawLine(spritebatch, (float)Math.Sqrt(Size), Color.Brown, Position, Parent.Position);
        // }
    }

