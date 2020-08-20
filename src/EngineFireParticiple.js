class EngineFireParticiple {
    constructor(group, x, y, power, angle, size = 4, white = false) {
        this.group = group;
        this.x = x;
        this.y = y;
        this.size = size;
        this.alpha = 1;
        this.startGreen = 230;
        this.power = power;
        this.angle = angle;
        this.white = white;
    }
    update() {
        let x = Math.sin(this.angle) * 2;
        let y = - Math.cos(this.angle) * 2;
        this.x -= x
        this.y -= y
        this.alpha -= 0.02 + Math.random()  * 0.03 + (this.power * 0.001);
        if(!this.white) {
            this.startGreen -= 5 + this.power / 6;
        }
    }

    render(c) {
        c.fillStyle = this.getColor();
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        c.fill();
    }

    getColor(){
        if(this.white) {
            return 'rgba(255, 255, 255, ' + this.alpha + ')';
        } else {
            return 'rgba(255, ' + Math.round(this.startGreen) + ', 0, ' + this.alpha + ')';
        }
    }
}