class HUD {
    constructor(rocket, engine) {
        this.rocket = rocket;
        this.engine = engine;
    }

    render(ctx) {
        this.renderRocketParams(ctx);
        this.renderFps(ctx);
    }

    renderRocketParams(ctx) {
        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.strokeStyle = "white";
        ctx.rect(5, 5, 150, 200);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(5, 35);
        ctx.lineTo(155, 35);
        ctx.stroke();
        ctx.font = '20px Arial';
        ctx.fillStyle = 'gray';
        ctx.fillText("rocket", 52, 27);
        ctx.fillStyle = 'white';
        ctx.fillText("power: " + this.rocket.power, 10, 60);
        ctx.fillText("velocity: " + Math.round(this.rocket.body.speed * 10) / 10, 10, 85);
        ctx.fillText("x: " + Math.round(this.rocket.body.velocity.x * 100) / 100, 40, 105);
        ctx.fillText("y: " + Math.round(this.rocket.body.velocity.y * 100) / 100, 40, 125);
        let hg = this.rocket.lastFetchedData ? this.rocket.lastFetchedData.height : 0;
        if(hg >= 2000) {
            hg = Math.round(hg / 10) / 100;
            hg += " km";
        } else {
            hg += " m";
        }
        ctx.fillText("H: " + hg, 10, 150);
    }

    renderFps(ctx) {
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText("fps: " + Math.round(this.engine.runner.fps), window.innerWidth - 80, 30);
    }
}