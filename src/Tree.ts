import * as PIXI from "pixi.js"
import { Branch } from './Branch'
import { Point as Vector2 } from './core/Point'
import { Random } from './core/Random'
import { Rect } from './core/Rect'
import { Leaf } from './Leaf'

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
  
    view: PIXI.Container;
    private leafView: PIXI.Graphics;
    private branchView: PIXI.Graphics;

    constructor(position: Vector2) {
        
        this.Position = position;
        this.view = new PIXI.Container();
        this.leafView = new PIXI.Graphics();
        this.branchView = new PIXI.Graphics();

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
        this.Branches[this.Root.position.toString()] = this.Root;

        let current = new Branch(this.Root, new Vector2(this.Position.x, this.Position.y - this.BranchLength), new Vector2(0, -1));
        this.Branches[current.position.toString()] = current;

        //Keep growing trunk upwards until we reach a leaf       
        while (this.Root.position.subtract(current.position).length < this.TrunkHeight)
        {
            const trunk = new Branch(current, new Vector2(current.position.x, current.position.y - this.BranchLength), new Vector2(0, -1));
            this.Branches[trunk.position.toString()] = trunk;
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

            this.Leaves[i].closedBranch = null;
            let direction = new Vector2(0, 0);

            //Find the nearest branch for this leaf
            
            for (let b of Object.values(this.Branches))
            {
                direction = this.Leaves[i].position.subtract(b.position);                       //direction to branch from leaf
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
                    if (this.Leaves[i].closedBranch == null)
                        this.Leaves[i].closedBranch = b;
                    else if (this.Leaves[i].position.subtract(this.Leaves[i].closedBranch.position).length > distance)
                        this.Leaves[i].closedBranch = b;
                }
            }

            if (!leafRemoved)
            {
                //Set the grow parameters on all the closest branches that are in range
                if (this.Leaves[i].closedBranch != null)
                {
                    const dir = this.Leaves[i].position.subtract(this.Leaves[i].closedBranch.position);
                    const closedBranch = this.Leaves[i].closedBranch;
                    closedBranch.GrowDirection = this.Leaves[i].closedBranch.GrowDirection.add(dir.normalized);       //add to grow direction of branch
                    closedBranch.GrowCount++;
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

                const newBranch = new Branch(b, b.position.add(avgDirection.multiply(this.BranchLength)), avgDirection);

                newBranches.add(newBranch);
                b.Reset();
            }
        }

        if (newBranches.size == 0) { this.DoneGrowing = true; return; }

        //Add the new branches to the tree
        let branchAdded = false;
        newBranches.forEach(b => {
            //Check if branch already exists.  These cases seem to happen when leaf is in specific areas
            let existing = this.Branches[b.position.toString()];
            if (!existing)
            {
                this.Branches[b.position.toString()] = b;
                branchAdded = true;

                //increment the size of the older branches, direct path to root
                b.Size = 0.002;
                let p = b.parent;
                while (p != undefined)
                {
                    if (p.parent != undefined)
                        p.parent.Size = p.Size + 0.001;

                    p = p.parent;
                }
            }
        });

        if (!branchAdded) 
            this.DoneGrowing = true;
    }

    public Draw()
    {        
        this.leafView.clear();
        this.branchView.clear();
        
        for (let l of this.Leaves)
            l.draw(this.leafView);

        for (let b of Object.values(this.Branches))
            b.draw(this.branchView);

        this.view.addChild(this.branchView, this.leafView);

        // spritebatch.DrawString(Font, "CONTROLS:  P = New Random Tree,  Spacebar = Grow Tree,  MouseWheel = Zoom,  J/I/K/L = Move Camera", new Vector2(0, 0), Color.Black);

        console.log("Total Branches: " + this.Branches.length);
        console.log("Total Leaves: " + this.Leaves.length);
        console.log("Crown Width: " + this.TreeWidth);
        console.log("Crown Height: " + this.TreeHeight);
        console.log("Trunk Height: " + this.TrunkHeight);
        console.log("Min. Leaf Distance: " + this.MinDistance);
        console.log("Max. Leaf Distance: " + this.MaxDistance);
        console.log("Branch Length: " + this.BranchLength);
    }
}
