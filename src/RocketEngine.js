class RocketEngine {
    constructor(rocket, pos, ang) {
        this.pos = pos;
        this.rocket = rocket;
        this.posAngle = ang;
        this.createBody();
    }

    createBody() {
        this.body = Bodies.rectangle(200, 300, 10, 10, {
            collisionFilter: {
                group: -1,
                category: 100,
                mask: 0,
            },
            density: 0.000001,
            render: {
                customRender: "rocketEngine",
                beforeRender: [this, this.runParticiples],
                visible: Config.wireFrames,
                engineOn: false,
            },
        });
    }
    getBodyObjects() {
        return [
            this.body,
            Constraint.create({
                bodyA: this.rocket.body,
                bodyB: this.body,
                pointA: {
                    x: this.pos[0],
                    y: this.pos[1],
                },
                stiffness: 1,
                length: 0,
                render: {
                    visible: false,
                },
            }),
        ];
    }

    go(power) {
        let angle = this.rocket.body.angle + this.posAngle;
        let mult = 0.0002 * (power / 100);
        this.forceX = Math.sin(angle) * mult;
        this.forceY = -Math.cos(angle) * mult;
        this.body.force = {
            x: this.forceX,
            y: this.forceY,
        };
    }

    runParticiples(c) {
        if (this.body.render.engineOn) {
            window.fireParticiples.push(
                new EngineFireParticiple(
                    1,
                    this.body.position.x + this.forceX,
                    this.body.position.y + this.forceY,
                    60,
                    this.rocket.body.angle + this.posAngle,
                    2,
                    true
                )
            );
        }
        window.fireParticiples.forEach((part) => {
            if (part.group == 1) {
                part.update();
                part.render(c);
                if (part.alpha <= 0) {
                    window.fireParticiples.splice(
                        window.fireParticiples.indexOf(part),
                        1
                    );
                }
            }
        });
    }
}
