class Terrain {
    constructor() {
        this.x = 0;
        this.y = 1324;
        this.width = 5200;
        this.height = 1500;
        this.colors = [
            {
                height: 30,
                color: '#92fd50'
            },
            {
                height: true,
                color: '#6a5537'
            }
        ];
        this.createBody();
    }

    createBody() {
        this.body = this.rectShape();
    }

    rectShape() {
        return Bodies.rectangle(this.x, this.y, this.width, this.height, {
            render: {
                afterRender: [this, this.render],
            },
            isStatic: true
        });
    }

    terrainShape() {
        let vertices = this.createShape();
        // 70, 99
        return Bodies.fromVertices(
            this.x,
            this.y,
            vertices,
            {
                render: {
                    fillStyle: "rgb(90,40,5)",
                    // strokeStyle: "green",

                },
                isStatic: true
            },
            true
        );
    }

    createShape() {
        let vert = "0 0";
        // vert += " 1000 0 500 1";
        for(let i = 10; i < 10000; i += 100) {
            vert += " " + i + " " + (Math.random() * 100 - 50);
        }
        vert += " " + 10000 + " " + "500";
        vert += " 0 500";
        return Vertices.fromPath(vert);
    }

    render(c) {
        // console.log(this.body.bounds);
        // console.log(this.body);
        let startPoint = this.body.bounds.min;
        let pos = 0;
        for (const color of this.colors) {
            c.fillStyle = color.color;
            c.beginPath();
            let hei;
            if(typeof(color.height) == "number") {
                hei = color.height;
            } else {
                hei = this.height - pos;
            }
            c.rect(startPoint.x, startPoint.y + pos, this.width, hei);
            c.fill();
            pos += hei;
        }

    }
}