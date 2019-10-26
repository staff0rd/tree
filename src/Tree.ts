import * as PIXI from "pixi.js"
import { Branch } from './Branch'
import { Point as Vector2 } from './core/Point'
import { Random } from './core/Random'
import { Rect } from './core/Rect'
import { AttractionPoint } from './AttractionPoint'
import { Colors } from "./core/Colors"

export class Tree
{
    doneGrowing = false;

    position = new Vector2(0, 0);

    attractionPointCount = 400;
    treeWidth = 80;    
    treeHeight = 150;   
    trunkHeight = 40;
    minDistance = 2;
    maxDistance = 15;
    branchLength = 2;

    root: Branch;
    attractionPoints: AttractionPoint[];
    branches: { [key: string]: Branch };

    crown: Rect;
  
    view: PIXI.Container;
    private attractionPointView: PIXI.Graphics;
    private branchView: PIXI.Graphics;
    private scale: number;
    private margin = 20;

    constructor(position: Vector2, scale: number) {
        this.scale = scale;
        this.position = position;
        this.view = new PIXI.Container();
        this.attractionPointView = new PIXI.Graphics();
        this.branchView = new PIXI.Graphics();
        this.view.addChild(this.branchView, this.attractionPointView);
        
        this.attractionPointCount = Random.between(400, 600);
        this.trunkHeight = Random.between(window.innerHeight / scale * .05, window.innerHeight / scale * .35);
        const maxHeight = window.innerHeight / this.scale - this.margin - this.trunkHeight;
        this.treeWidth = Random.between(window.innerHeight / this.scale * .2, window.innerHeight / this.scale * .75);
        this.treeHeight = Random.between(maxHeight * .75, maxHeight);
        this.minDistance = Random.between(3, 8);
        this.maxDistance = Random.between(15, 30);
        this.branchLength = Random.between(4, 10);

        this.generateCrown();
        this.generateTrunk();
    }

    private generateCrown()
    {
        this.crown = new Rect(this.position.x - this.treeWidth / 2, this.position.y - this.treeHeight - this.trunkHeight, this.treeWidth, this.treeHeight);
        this.attractionPoints = [];
        
        //randomly place leaves within our rectangle
        for (let i = 0; i < this.attractionPointCount; i++)
        {
            const location = new Vector2(Random.between(this.crown.left, this.crown.right + 1), Random.between(this.crown.top, this.crown.bottom + 1));
            let point = new AttractionPoint(location);
            this.attractionPoints.push(point);
        }
    }
    
    private generateTrunk()
    {
        this.branches = {};

        this.root = new Branch(null, this.position, new Vector2(0, -1));
        this.branches[this.root.position.toString()] = this.root;

        let current = new Branch(this.root, new Vector2(this.position.x, this.position.y - this.branchLength), new Vector2(0, -1));
        this.branches[current.position.toString()] = current;

        //Keep growing trunk upwards until we reach an attraction point       
        while (this.root.position.subtract(current.position).length < this.trunkHeight)
        {
            const trunk = new Branch(current, new Vector2(current.position.x, current.position.y - this.branchLength), new Vector2(0, -1));
            this.branches[trunk.position.toString()] = trunk;
            current = trunk;                
        }         
    }

    grow()
    {
        if (this.doneGrowing) return;

        //If no leaves left, we are done
        if (this.attractionPoints.length == 0) { this.doneGrowing = true; return; }

        //process the leaves
        for (let i = 0; i < this.attractionPoints.length; i++)
        {
            let attractionPointRemoved = false;

            this.attractionPoints[i].closedBranch = null;
            let direction = new Vector2(0, 0);

            //Find the nearest branch for this attraction point
            
            for (let b of Object.values(this.branches))
            {
                direction = this.attractionPoints[i].position.subtract(b.position); //direction to branch from attraction point
                const distance = Math.round(direction.length);          
                direction = direction.normalized;

                if (distance <= this.minDistance) //Min attraction point distance reached, we remove it
                {
                    this.attractionPoints.splice(this.attractionPoints.indexOf(this.attractionPoints[i]), 1);
                    i--;
                    attractionPointRemoved = true;
                    break;
                }
                else if (distance <= this.maxDistance)       //branch in range, determine if it is the nearest
                {
                    if (this.attractionPoints[i].closedBranch == null)
                        this.attractionPoints[i].closedBranch = b;
                    else if (this.attractionPoints[i].position.subtract(this.attractionPoints[i].closedBranch.position).length > distance)
                        this.attractionPoints[i].closedBranch = b;
                }
            }

            if (!attractionPointRemoved)
            {
                //Set the grow parameters on all the closest branches that are in range
                if (this.attractionPoints[i].closedBranch != null)
                {
                    const dir = this.attractionPoints[i].position.subtract(this.attractionPoints[i].closedBranch.position);
                    const closedBranch = this.attractionPoints[i].closedBranch;
                    closedBranch.growDirection = this.attractionPoints[i].closedBranch.growDirection.add(dir.normalized);       //add to grow direction of branch
                    closedBranch.growCount++;
                }
            }
        }

        //Generate the new branches
        const newBranches = new Set<Branch>();

        for(let b of Object.values(this.branches))
        {
            if (b.growCount > 0)    //if at least one attraction point is affecting the branch
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
            //Check if branch already exists.  These cases seem to happen when attraction point is in specific areas
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

    public draw()
    {        
        this.attractionPointView.clear();
        this.branchView.clear();
        
        for (let l of this.attractionPoints)
            l.draw(this.attractionPointView);

        for (let b of Object.values(this.branches))
            b.draw(this.branchView);

        if (this.doneGrowing)
            this.drawLeaves(this.branchView);
    }

    public drawLeaves(g: PIXI.Graphics) {
        return;
        let max = 0;
        let min = 10;
        let branches = Object.values(this.branches); 
        for (let b of branches) {
            max = Math.max(max, b.size);
            min = Math.min(min, b.size);
        }
        let half = (max - min) / 2 + min/2;
        for (let b of branches) {
            if (b.size < half) {
                g.lineStyle(0)
                    .beginFill(Colors.Green.C500)
                    .drawCircle(b.position.x, b.position.y, 2)
                    .endFill();
                console.log(b.growDirection);
            }
        }
        console.log(`min: ${min}, max: ${max}, half: ${half}`)
    }

    get status() {
        return "Total Branches: " + Object.values(this.branches).length + "\n" +
        "Total Leaves: " + this.attractionPoints.length + "\n" +
        "Crown Width: " + Math.round(this.treeWidth) + "\n" +
        "Crown Height: " + Math.round(this.treeHeight) + "\n" +
        "Trunk Height: " + Math.round(this.trunkHeight) + "\n" +
        "Min. Point Distance: " + this.minDistance + "\n" +
        "Max. Point Distance: " + this.maxDistance + "\n" +
        "Branch Length: " + this.branchLength + "\n";
    }
}
