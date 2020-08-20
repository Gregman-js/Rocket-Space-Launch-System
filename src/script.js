window.fireParticiples = []
setup = function() {

    var terrain = new Terrain();
    var rocket = new Rocket(terrain);
    var engine = new WorldEngine(rocket, terrain);
    var hud = new HUD(rocket, engine);
    var keyEvent = new Event(rocket, engine, hud);

};

setTimeout(setup, 200)