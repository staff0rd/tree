import * as PIXI from "pixi.js"
import { Branch } from './Branch'
import { Point as Vector2 } from './core/Point'
import { Random } from './core/Random'
import { Rect } from './core/Rect'
import { Leaf } from './Leaf'

export class Tree
{
    doneGrowing = false;

    position = new Vector2(0, 0);

    leafCount = 400;
    treeWidth = 80;    
    treeHeight = 150;   
    trunkHeight = 40;
    minDistance = 2;
    maxDistance = 15;
    branchLength = 2;

    root: Branch;
    leaves: Leaf[];
    branches: { [key: string]: Branch };

    crown: Rect;
  
    view: PIXI.Container;
    private leafView: PIXI.Graphics;
    private branchView: PIXI.Graphics;
    private scale: number;
    private margin = 20;

    constructor(position: Vector2, scale: number) {
        this.scale = scale;
        this.position = position;
        this.view = new PIXI.Container();
        this.leafView = new PIXI.Graphics();
        this.branchView = new PIXI.Graphics();
        this.view.addChild(this.branchView, this.leafView);
        
        this.leafCount = Random.between(400, 600);
        this.trunkHeight = Random.between(window.innerHeight / scale * .05, window.innerHeight / scale * .35);
        const maxHeight = window.innerHeight / this.scale - this.margin - this.trunkHeight;
        this.treeWidth = Random.between(window.innerHeight / this.scale * .2, window.innerHeight / this.scale * .75);
        this.treeHeight = Random.between(maxHeight * .75, maxHeight);
        this.minDistance = Random.between(3, 8);
        this.maxDistance = Random.between(15, 30);
        this.branchLength = Random.between(2, 6);

        this.generateCrown();
        this.generateTrunk();
    }

    private generateCrown()
    {
        this.crown = new Rect(this.position.x - this.treeWidth / 2, this.position.y - this.treeHeight - this.trunkHeight, this.treeWidth, this.treeHeight);
        this.leaves = [];
        
        //randomly place leaves within our rectangle
        for (let i = 0; i < this.leafCount; i++)
        {
            const location = new Vector2(Random.between(this.crown.left, this.crown.right + 1), Random.between(this.crown.top, this.crown.bottom + 1));
            let leaf = new Leaf(location);
            this.leaves.push(leaf);
        }
    }
    
    private generateTrunk()
    {
        this.branches = {};

        this.root = new Branch(null, this.position, new Vector2(0, -1));
        this.branches[this.root.position.toString()] = this.root;

        let current = new Branch(this.root, new Vector2(this.position.x, this.position.y - this.branchLength), new Vector2(0, -1));
        this.branches[current.position.toString()] = current;

        //Keep growing trunk upwards until we reach a leaf       
        while (this.root.position.subtract(current.position).length < this.trunkHeight)
        {
            const trunk = new Branch(current, new Vector2(current.position.x, current.position.y - this.branchLength), new Vector2(0, -1));
            this.branches[trunk.position.toString()] = trunk;
            current = trunk;                
        }         
    }

    Grow()
    {
        if (this.doneGrowing) return;

        //If no leaves left, we are done
        if (this.leaves.length == 0) { this.doneGrowing = true; return; }

        //process the leaves
        for (let i = 0; i < this.leaves.length; i++)
        {
            let leafRemoved = false;

            this.leaves[i].closedBranch = null;
            let direction = new Vector2(0, 0);

            //Find the nearest branch for this leaf
            
            for (let b of Object.values(this.branches))
            {
                direction = this.leaves[i].position.subtract(b.position);                       //direction to branch from leaf
                const distance = Math.round(direction.length);           // TODO: check round
                direction = direction.normalized;

                if (distance <= this.minDistance)            //Min leaf distance reached, we remove it
                {
                    this.leaves.splice(this.leaves.indexOf(this.leaves[i]), 1);
                    i--;
                    leafRemoved = true;
                    break;
                }
                else if (distance <= this.maxDistance)       //branch in range, determine if it is the nearest
                {
                    if (this.leaves[i].closedBranch == null)
                        this.leaves[i].closedBranch = b;
                    else if (this.leaves[i].position.subtract(this.leaves[i].closedBranch.position).length > distance)
                        this.leaves[i].closedBranch = b;
                }
            }

            if (!leafRemoved)
            {
                //Set the grow parameters on all the closest branches that are in range
                if (this.leaves[i].closedBranch != null)
                {
                    const dir = this.leaves[i].position.subtract(this.leaves[i].closedBranch.position);
                    const closedBranch = this.leaves[i].closedBranch;
                    closedBranch.growDirection = this.leaves[i].closedBranch.growDirection.add(dir.normalized);       //add to grow direction of branch
                    closedBranch.growCount++;
                }
            }
        }

        //Generate the new branches
        const newBranches = new Set<Branch>();

        for(let b of Object.values(this.branches))
        {
            if (b.growCount > 0)    //if at least one leaf is affecting the branch
            {
                const avgDirection = b.growDirection.divide(b.growCount).normalized;

                const newBranch = new Branch(b, b.position.add(avgDirection.multiply(this.branchLength)), avgDirection);

                newBranches.add(newBranch);
                b.reset();
            }
        }

        if (newBranches.size == 0) { this.doneGrowing = true; return; }

        //Add the new branches to the tree
        let branchAdded = false;
        newBranches.forEach(b => {
            //Check if branch already exists.  These cases seem to happen when leaf is in specific areas
            let existing = this.branches[b.position.toString()];
            if (!existing)
            {
                this.branches[b.position.toString()] = b;
                branchAdded = true;

                //increment the size of the older branches, direct path to root
                b.size = Branch.initialSize;
                let p = b.parent;
                while (p != undefined)
                {
                    if (p.parent != undefined)
                        p.parent.size = p.size + Branch.growIncrement;

                    p = p.parent;
                }
            }
        });

        if (!branchAdded) 
            this.doneGrowing = true;
    }

    public Draw()
    {        
        this.leafView.clear();
        this.branchView.clear();
        
        for (let l of this.leaves)
            l.draw(this.leafView);

        for (let b of Object.values(this.branches))
            b.draw(this.branchView);

        console.log("Total Branches: " + this.branches.length);
        console.log("Total Leaves: " + this.leaves.length);
        console.log("Crown Width: " + this.treeWidth);
        console.log("Crown Height: " + this.treeHeight);
        console.log("Trunk Height: " + this.trunkHeight);
        console.log("Min. Leaf Distance: " + this.minDistance);
        console.log("Max. Leaf Distance: " + this.maxDistance);
        console.log("Branch Length: " + this.branchLength);
    }
}
