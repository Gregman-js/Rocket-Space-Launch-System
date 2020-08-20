class Rocket {
    constructor(terrain) {
        this.terrain = terrain;
        this.x = 0;
        this.y = 532;
        // this.color = "#4ECDC4";
        this.createBody();
        this.prevSpeed = this.body.speed;
        this.dead = false;
        this.camSpeed = 0.3;
        this.power = 0;
        this.savePower = false;

        this.setSound();

    }

    go() {
        this.boundPower();
        this.fetchRocketData();
        if(Config.autoPilot) {
            if(!this.autoPilot) {
                this.autoPilot = new AutoPilot();
            }
            let calculatedPower = this.autoPilot.ster(this.lastFetchedData);
            this.power = calculatedPower.main;
            this.goLeft(true, calculatedPower.right);
            this.goRight(true, calculatedPower.left);
            if(calculatedPower.finished == true){
                Config.autoPilot = false;
            }
        } else {
            if(this.autoPilot) {
                this.autoPilot = false;
            }
        }

        this.boundPower();

        if(this.dead) {
            this.power = 0;
        }

        this.sound(this.power);

        this.body.render.engineOn = this.power != 0;
        this.body.render.enginePower = this.power;

        if(this.power != 0) {
            this.mainEngine(this.power);
        }
    }

    boundPower() {
        if(this.power > 100) {
            this.power = 100;
        }
        if(this.power < 0) {
            this.power = 0;
        }
    }

    goLeft(state, power = 100) {
        this.runSterEngine(1, state, power)
    }

    goRight(state, power = 100) {
        this.runSterEngine(0, state, power)
    }

    runSterEngine(index, state, power = 100) {
        if(power == 0 && state) {
            state = false;
        }
        if(state && !this.dead) {
            this.upperEngines[index].go(power)
            this.upperEngines[index].body.render.engineOn = true;
        } else {
            this.upperEngines[index].body.render.engineOn = false;
        }
    }

    mainEngine(power) {
        let angle = this.body.angle;
        let mult = 0.005 * (power/100) * Config.rocketScale * Config.rocketScale;
        let x = Math.sin(angle) * mult;
        let y = - Math.cos(angle) * mult;
        this.body.force = {
            x: x,
            y: y,
        };
    }

    fetchRocketData(){
        let pos = {
            x: this.body.parts[3].position.x,
            y: this.body.parts[3].position.y
        };
        this.collisions = raycast(this.terrainBodies || [], pos, {x: pos.x, y: pos.y + 100000});
        let height = false;
        if(this.collisions.length > 0) {
            height = Math.round((this.collisions[0].point.y) - pos.y);
        } else {
            height = Math.round(this.terrain.body.bounds.min.y - pos.y);
        }

        this.lastFetchedData =  {
            angle: this.body.angle,
            power: this.power,
            pos: pos,
            height: height,
            speed: this.body.speed,
            velocity: this.body.velocity
        };
    }

    setTerrainsObject(obj) {
        this.terrainBodies = obj;
    }

    createBody() {
        this.body = this.rocketShape();
        Matter.Body.scale(this.body, Config.rocketScale, Config.rocketScale);

        this.upperEngines = [
            new RocketEngine(this, [-10, -20], Math.PI/2),
            new RocketEngine(this, [10, -20], - Math.PI/2)
        ];
    }

    rocketShape() {
        let vertices = Vertices.fromPath(
            "35 1 49 11 53 24 53 63 70 83 70 97 53 89 53 93 48 93 50 99 19 99 22 94 17 94 17 89 0 95 0 83 17 63 17 23 23 8"
        );
        // 70, 99
        return Bodies.fromVertices(
            this.x,
            this.y,
            vertices,
            {
                render: {
                    beforeRender: [this, this.renderParts],
                    sprite: {
                        // https://www.hiclipart.com/free-transparent-background-png-clipart-zklpq
                        texture: 'img/rocket.png',
                        single: true,
                        yScale: Config.rocketScale,
                        xScale: Config.rocketScale
                    }
                },
                // frictionAir: 0,
                isStatic: false
            },
            true
        );
    }

    renderParts(c) {
        var rocketX = this.body.parts[3].position.x;
        var rocketY = this.body.parts[3].position.y;
        let whatX = - Math.sin(this.body.angle + Math.PI / 2);
        let whatY = Math.cos(this.body.angle + Math.PI / 2); // Math.random() * 18 - 9
        let whatRowX = - Math.sin(this.body.angle);
        let whatRowY = Math.cos(this.body.angle);
        if(Config.showRocketRay) {
            if(this.collisions && this.collisions.length > 0) {
                let col = this.collisions[0];
                c.moveTo(this.body.parts[3].position.x, this.body.parts[3].position.y);
                c.lineTo(col.point.x, col.point.y);
                c.strokeStyle = '#fff';
                c.lineWidth = 0.5;
                c.stroke();
            }
        }
        if(Config.showAutopilotLanding && this.autoPilot) {
            this.autoPilot.showLanding(c, this.terrainBodies);
        }
        if(this.body.render.engineOn) {
            for(let i = 0; i < 8; i++){
                let whatScale = Math.random() * 18 - 9;
                let rowScale = Math.random() * 8 - 4;
                window.fireParticiples.push(new EngineFireParticiple(0, rocketX + whatX * whatScale + whatRowX * rowScale, rocketY + 2 + whatY * whatScale +  + whatRowY * rowScale, 100 - this.body.render.enginePower, this.body.angle))
            }
        }
        window.fireParticiples.forEach(part => {
            if(part.group == 0) {
                part.update();
                part.render(c);
                if(part.alpha <= 0) {
                    window.fireParticiples.splice(window.fireParticiples.indexOf(part), 1)
                }
            }
        });
    }

    getBodyObjects(){
        var bodies = [
            this.body,
        ];
        this.upperEngines.forEach(engine => {
            bodies.push(...engine.getBodyObjects())
        });
        return bodies;
    }

    calculatePressure() {
        if(this.prevSpeed - this.body.speed > 2) {
            this.body.render.sprite.texture = 'img/rocket-dead.png';
            this.dead = true;
        }
        this.prevSpeed = this.body.speed;
    }

    getViewScale(){
        if(this.camSpeed != 0.3 + 0.07 * Math.round(this.body.speed * 100) / 100)
            this.camSpeed = this.camSpeed + (this.camSpeed < (0.3 + 0.07 * Math.round(this.body.speed * 100) / 100) ? 0.001 : -0.001)
        if(this.camSpeed < 0.3) {
            this.camSpeed = 0.3;
        } else if(this.camSpeed > 1.5) {
            this.camSpeed = 1.5;
        }
        return this.camSpeed < 0.4 ? 0.4 : this.camSpeed;
    }

    setAutopilotTarget(mouse) {
        this.autoPilot = new AutoPilot(mouse.position.x, mouse.position.y);
        Config.autoPilot = true;
    }


    setSound() {
        // Fire Loop by Iwan 'qubodup' Gabovitch http://opengameart.org/users/qubodup
        this.audioTrack = new Audio('/audio/rocketFire.ogg');
        // gapless Loop
        this.audioTrack.addEventListener('timeupdate', function(){
            var buffer = 1
            if(this.currentTime > this.duration - buffer){
                this.currentTime = 0
            }
        });
        this.audioTrack.volume = 0;
        this.audioTrack.play();
    }

    sound(power) {
        this.audioTrack.volume = power / 150;
        if(this.audioTrack.paused) {
            this.audioTrack.play();
        }
    }
}
