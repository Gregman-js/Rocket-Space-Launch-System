window.onload = setup;

function setup() {
    var c = document.getElementById("canvas");
    window.img = document.getElementById("img-rocket");
    c.width = img.width*2;
    c.height = img.height;
    window.ctx = c.getContext("2d");
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0);
    c.addEventListener('mousedown', function(e) {
        getCursorPosition(c, e)
    })
    window.points = [];
}

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = Math.round(event.clientX - rect.left)
    const y = Math.round(event.clientY - rect.top)
    console.log("x: " + x + " y: " + y)
    window.points.push([x, y])
    ctx.fillStyle = 'white';
    window.ctx.fillRect(img.width + x,y,2,2);
}

function pointsToString() {
    return points.map(a => a.join(" ")).join(" ");
}