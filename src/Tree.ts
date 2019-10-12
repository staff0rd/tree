import { Point as Vector2 } from './core/Point'
import { Branch } from './Branch'
import { Leaf } from './Leaf'
import { Rect } from './core/Rect'
import { Random } from './core/Random'

export class Tree
{
    DoneGrowing = false;

    Position = new Vector2(0, 0);

    LeafCount = 400;
    TreeWidth = 80;    
    TreeHeight = 150;   
    TrunkHeight = 40;
    MinDistance = 2;
    MaxDistance = 15;
    BranchLength = 2;

    Root: Branch;
    Leaves: Leaf[];
    Branches: { [key: string]: Branch };

    Crown: Rect;
  

    constructor(position: Vector2) {
        
        this.Position = position;

        this.LeafCount = Random.between(400, 600);
        this.TreeWidth = Random.between(50, 200);
        this.TreeHeight = Random.between(100, 150);
        this.TrunkHeight = Random.between(30, 60);
        this.MinDistance = Random.between(2, 4);
        this.MaxDistance = Random.between(15, 30);
        this.BranchLength = Random.between(2, 6);

        //LoadContent(gd, content);
        this.GenerateCrown();
        this.GenerateTrunk();
    }

    // private void LoadContent(GraphicsDevice gd, ContentManager content)
    // {
    //     int width = 10, height = 10;
    //     BlankTexture = new Texture2D(gd, 10, 10, false, SurfaceFormat.Color);
    //     Color[] color = new Color[width * height];
    //     for (int i = 0; i < color.Length; i++)
    //     {
    //         color[i] = Color.White;
    //     }
    //     BlankTexture.SetData(color);
        
    //     Font = content.Load<SpriteFont>(@"font");
    // }

    private GenerateCrown()
    {
        this.Crown = new Rect(this.Position.x - this.TreeWidth / 2, this.Position.y - this.TreeHeight - this.TrunkHeight, this.TreeWidth, this.TreeHeight);
        this.Leaves = [];
        
        //randomly place leaves within our rectangle
        for (let i = 0; i < this.LeafCount; i++)
        {
            const location = new Vector2(Random.between(this.Crown.left, this.Crown.right + 1), Random.between(this.Crown.top, this.Crown.bottom + 1));
            let leaf = new Leaf(location);
            this.Leaves.push(leaf);
        }
    }
    
    private GenerateTrunk()
    {
        this.Branches = {};

        this.Root = new Branch(null, this.Position, new Vector2(0, -1));
        this.Branches[this.Root.Position.toString()] = this.Root;

        let current = new Branch(this.Root, new Vector2(this.Position.x, this.Position.y - this.BranchLength), new Vector2(0, -1));
        this.Branches[current.Position.toString()] = current;

        //Keep growing trunk upwards until we reach a leaf       
        while (this.Root.Position.subtract(current.Position).length < this.TrunkHeight)
        {
            const trunk = new Branch(current, new Vector2(current.Position.x, current.Position.y - this.BranchLength), new Vector2(0, -1));
            this.Branches[trunk.Position.toString()] = trunk;
            current = trunk;                
        }         
    }

    Grow()
    {
        if (this.DoneGrowing) return;

        //If no leaves left, we are done
        if (this.Leaves.length == 0) { this.DoneGrowing = true; return; }

        //process the leaves
        for (let i = 0; i < this.Leaves.length; i++)
        {
            let leafRemoved = false;

            this.Leaves[i].ClosestBranch = null;
            let direction = new Vector2(0, 0);

            //Find the nearest branch for this leaf
            
            for (let b of Object.values(this.Branches))
            {
                direction = this.Leaves[i].Position.subtract(b.Position);                       //direction to branch from leaf
                const distance = Math.round(direction.length);           // TODO: check round
                direction = direction.normalized;

                if (distance <= this.MinDistance)            //Min leaf distance reached, we remove it
                {
                    this.Leaves.splice(this.Leaves.indexOf(this.Leaves[i]), 1);
                    i--;
                    leafRemoved = true;
                    break;
                }
                else if (distance <= this.MaxDistance)       //branch in range, determine if it is the nearest
                {
                    if (this.Leaves[i].ClosestBranch == null)
                        this.Leaves[i].ClosestBranch = b;
                    else if (this.Leaves[i].Position.subtract(this.Leaves[i].ClosestBranch.Position).length > distance)
                        this.Leaves[i].ClosestBranch = b;
                }
            }

            if (!leafRemoved)
            {
                //Set the grow parameters on all the closest branches that are in range
                if (this.Leaves[i].ClosestBranch != null)
                {
                    const dir = this.Leaves[i].Position.subtract(this.Leaves[i].ClosestBranch.Position);;
                    this.Leaves[i].ClosestBranch.GrowDirection = this.Leaves[i].ClosestBranch.GrowDirection.add(dir.normalized);       //add to grow direction of branch
                    this.Leaves[i].ClosestBranch.GrowCount++;
                }
            }
        }

        //Generate the new branches
        const newBranches = new Set<Branch>();

        for(let b of Object.values(this.Branches))
        {
            if (b.GrowCount > 0)    //if at least one leaf is affecting the branch
            {
                const avgDirection = b.GrowDirection.divide(b.GrowCount).normalized;

                const newBranch = new Branch(b, b.Position.add(avgDirection.multiply(this.BranchLength)), avgDirection);

                newBranches.add(newBranch);
                b.Reset();
            }
        }

        if (newBranches.size == 0) { this.DoneGrowing = true; return; }

        //Add the new branches to the tree
        let branchAdded = false;
        newBranches.forEach(b => {
            //Check if branch already exists.  These cases seem to happen when leaf is in specific areas
            let existing = this.Branches[b.Position.toString()];
            if (!existing)
            {
                this.Branches[b.Position.toString()] = b;
                branchAdded = true;

                //increment the size of the older branches, direct path to root
                b.Size = 0.002;
                let p = b.Parent;
                while (p != undefined)
                {
                    if (p.Parent != undefined)
                        p.Parent.Size = p.Size + 0.001;

                    p = p.Parent;
                }
            }
        });

        if (!branchAdded) 
            this.DoneGrowing = true;
    }

    public Draw()
    {        
        for (let l of this.Leaves)
            l.Draw();

        for (let b of Object.values(this.Branches))
            b.Draw();

        // spritebatch.DrawString(Font, "CONTROLS:  P = New Random Tree,  Spacebar = Grow Tree,  MouseWheel = Zoom,  J/I/K/L = Move Camera", new Vector2(0, 0), Color.Black);

        // spritebatch.DrawString(Font,"Total Branches: " + Branches.Count.ToString(), new Vector2(0,28), Color.White);
        // spritebatch.DrawString(Font, "Total Leaves: " + Leaves.Count.ToString(), new Vector2(0, 42), Color.White);
        // spritebatch.DrawString(Font, "Crown Width: " + TreeWidth.ToString(), new Vector2(0, 56), Color.White);
        // spritebatch.DrawString(Font, "Crown Height: " + TreeHeight.ToString(), new Vector2(0, 70), Color.White);
        // spritebatch.DrawString(Font, "Trunk Height: " + TrunkHeight.ToString(), new Vector2(0, 84), Color.White);
        // spritebatch.DrawString(Font, "Min. Leaf Distance: " + MinDistance.ToString(), new Vector2(0, 98), Color.White);
        // spritebatch.DrawString(Font, "Max. Leaf Distance: " + MaxDistance.ToString(), new Vector2(0, 112), Color.White);
        // spritebatch.DrawString(Font, "Branch Length: " + BranchLength.ToString(), new Vector2(0, 126), Color.White);
    }
}
