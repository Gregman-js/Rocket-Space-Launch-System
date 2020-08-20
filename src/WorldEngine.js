var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composites = Matter.Composites,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Vertices = Matter.Vertices,
    Events = Matter.Events,
    Query = Matter.Query,
    Composite = Matter.Composite,
    Vector = Matter.Vector;

class WorldEngine {
    constructor(rocket, terrain) {
        // create engine
        this.rocket = rocket;
        this.engine = Engine.create();
        var world = this.engine.world;
        // world.gravity.y = 0;

        // create renderer
        this.render = Render.create({
            element: document.body,
            engine: this.engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                showAngleIndicator: false,
                showCollisions: false,
                showVelocity: true,
                wireframes: Config.wireFrames,
                // background: 'red'
            },
        });

        Render.run(this.render);

        // create runner
        this.runner = Runner.create();
        Runner.run(this.runner, this.engine);

        // add bodies
        var group = Body.nextGroup(true);

        var catapult = Bodies.rectangle(400, 520, 320, 20, {
            collisionFilter: { group: group },
        });

        var worldObjects = [
            catapult,
            terrain.body,
            Bodies.rectangle(400, 535, 20, 80, {
                isStatic: true,
                collisionFilter: { group: group },
            }),
            Bodies.rectangle(250, 555, 20, 50, { isStatic: true }),
            Bodies.rectangle(0, 580, 160, 20, { isStatic: true }),
            Bodies.circle( 560, -100000, 50, { density: 0.005 }),
            Constraint.create({
                bodyA: catapult,
                pointB: Vector.clone(catapult.position),
                stiffness: 1,
                length: 0,
            }),
        ];

        rocket.setTerrainsObject(worldObjects.filter(a => a.type == 'body'));

        // add rocket related parts
        worldObjects.push(...rocket.getBodyObjects());


        World.add(world, worldObjects);

        // add mouse control
        var mouse = Mouse.create(this.render.canvas),
            mouseConstraint = MouseConstraint.create(this.engine, {
                mouse: mouse,
                constraint: {
                    stiffness: 0.2,
                    render: {
                        visible: false,
                    },
                },
            });

        World.add(world, mouseConstraint);

        // keep the mouse in sync with rendering
        this.render.mouse = mouse;

        // fit the render viewport to the scene
        Render.lookAt(this.render, rocket.body, {
            x: window.innerWidth,
            y: window.innerHeight
          });
    }

    setEnv() {
        let rocketHeight = this.rocket.lastFetchedData.height;
        if(rocketHeight < 0) {
            rocketHeight = 0;
        }
        let map = 4000;
        let mult = (rocketHeight + map) / map;
        let color = [135, 206, 235];
        if(mult > 50) {
            mult = 50;
        } else if(mult < 1) {
            mult = 1;
        }
        color = color.map(a => a/mult);
        // 135, 206, 235 blue
        this.render.options.background = "rgb(" + color.join(",") + ")";
        let airmult = ((mult / 10) + 0.9);
        let gravmult = ((mult /2) + 0.5);
        this.rocket.body.frictionAir = 0.01 / airmult;
        this.engine.world.gravity.y = 1 / gravmult;
        // console.log(rocketHeight, mult, this.rocket.body.frictionAir, this.engine.world.gravity.y);
    }
}
