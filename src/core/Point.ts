export class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    
    toString() { 
        return `(${this.x},${this.y})`
    }

    public get length() {
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }

    subtract(p: Point) {
        return new Point(this.x - p.x, this.y - p.y);
    }

    add (p: Point) {
        return new Point(this.x+ p.x, this.y + p.y);
    }

    divide(by: number) {
        return new Point(this.x / by, this.y / by);
    }

    multiply(by: number) {
        return new Point(this.x * by, this.y * by);
    }

    distance(to: Point) {
        return this.subtract(to).length;
    }

    public get normalized() {
      if ( this.length > 9.99999974737875E-06)
        return this.divide(this.length);
      else
        return new Point(0, 0);
    }
};
