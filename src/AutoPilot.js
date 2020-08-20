class AutoPilot {

    constructor(x = false, y = false) {
        this.spec = {
            x: x != false,
            y: y != false
        };
        this.doc = {x: x, y: y};
        this.centered = false;
        this.upStreamHold = 300;
    }

    ster(rp) {
        if(!this.spec.y) {
            this.doc.y = rp.height + rp.pos.y;
        }
        if(!this.spec.x) {
            this.doc.x = rp.pos.x;
            this.spec.x = true;
        }

        if(this.centered) {
            this.upStreamHold -= 3;
        }
        if(this.upStreamHold < 0) {
            this.upStreamHold = 0;
        }

        let power = rp.power + (this.mainEnginePilot(rp, this.upStreamHold) || 0);

        let outEngine = rp.height < 10 ? 0 : (this.extraEngines(rp) || 0);

        // stable engine throttle 77
        return {
            main: power,
            left: outEngine > 0 ? outEngine * 100 : 0,
            right: outEngine < 0 ? -outEngine * 100 : 0,
            finished: power == 0 && rp.height < 10
        };
    }

    extraEngines(rp) {
        let angMargin = 0.10;
        let outEngine = 0;


        // v2
        let ang = rp.angle;
        let diff = this.doc.x - rp.pos.x;
        let docang = diff / 100;
        let diffang = docang - ang;
        if(diffang > 0.5) {
            diffang = 0.5;
        } else if (diffang < -0.5) {
            diffang = -0.5;
        }
        if(Math.abs(diffang) < 0.2 && Math.abs(ang) < 0.05 && Math.abs(rp.velocity.x) < 2) {
            this.centered = true;
        }

        if(rp.angle > angMargin){
            outEngine = -1;
        } else if(rp.angle < -angMargin){
            outEngine = 1;
        }
        if(rp.angle < angMargin && rp.angle > -angMargin) {
            if(this.prevAng - rp.angle > angMargin) {
                outEngine = -1;
            } else if(this.prevAng - rp.angle < -angMargin) {
                outEngine = 1;
            }
        }
        if(this.spec.x) {
            outEngine += diffang;
        }
        this.prevAng = rp.angle;
        return outEngine;
    }

    mainEnginePilot(rp, upStay = 0) {

        let power = 0;
        // unstable variable, im trying to round it a little
        let vely = ((this.prevVelocity ? this.prevVelocity.y : rp.velocity.y) + rp.velocity.y) / 2 - 0.2;
        vely = Math.round(vely * 100) / 100;
        let doc;
        if(this.spec.y) {
            doc = ((this.doc.y - rp.pos.y) - upStay) / 100;
        } else {
            doc = (rp.height - upStay) / 100;
        }
        // console.log(((this.doc.y - rp.pos.y) - upStay) / 100, (rp.height - upStay) / 100);

        let diff = vely - doc;
        let comp = (this.prevDiff || diff) - diff;

        if(diff > 1){
            power += 3;
        } else if(diff > 0){
            if(comp > 0.02) {
                power -= 1;
            } else  if (comp < 0) {
                power += 1;
            }
        } else if(diff < 0) {
            power -= 1;
        }
        // console.log("vel:", vely,"doc:", doc,"diff:", Math.round(diff * 100) / 100,"power:", power, "comp", Math.round(comp * 100) / 100);
        this.prevVelocity = rp.velocity;
        this.prevDiff = diff;
        return power;
    }

    showLanding(c, bodies) {
        if(this.spec.y) {
            c.beginPath();
            c.arc(this.doc.x, this.doc.y || 0, 10, 0, 2 * Math.PI);
            c.stroke();
            return;
        } else {
            let pos = {
                x: this.doc.x,
                y: -10000
            };
            let landing = raycast(bodies || [], pos, {x: pos.x, y: pos.y + 100000});
            if(landing.length) {
                let land = landing[0];
                for (let i = 1; i < landing.length; i++) {
                    if(landing[i].point.y < land.point.y) {
                        land = landing[i];
                    }
                }
                c.beginPath();
                c.arc(this.doc.x, land.point.y || 0, 10, 3, 2 * Math.PI);
                c.stroke();
            }
        }
    }
}