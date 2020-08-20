class Event {
    constructor(rocket, worldEngine, hud) {
        this.rocket = rocket;
        this.worldEngine = worldEngine;
        this.hud = hud;
        this.keys = [];

        this.addListeners();

        this.bindKeys();

        this.bindView();

        this.bindHud();

        this.mouseWheelView = {
            val: 0,
            lasttime: (new Date())
        };

    }

    isPressed(code) {
        return code in this.keys && this.keys[code];
    }

    bindKeys() {
        Events.on(
            this.worldEngine.engine,
            "beforeTick",
            function (event) {
                if(!Config.autoPilot) {
                    if(this.isPressed(32)) {
                        this.rocket.power += 3;
                        this.rocket.savePower = false;
                    } else if(this.isPressed(65) || this.isPressed(38)) {
                        this.rocket.power += 1;
                        this.rocket.savePower = true;
                    } else if(this.isPressed(90) || this.isPressed(40)) {
                        this.rocket.power -= 1;
                        this.rocket.savePower = true;
                    } else if(!this.rocket.savePower) {
                        this.rocket.power -= 3;
                    }
                    this.rocket.goLeft(this.isPressed(37));
                    this.rocket.goRight(this.isPressed(39));
                }
                this.rocket.go();
                this.rocket.calculatePressure();
                this.worldEngine.setEnv();
            }.bind(this)
        );
    }

    bindView() {

        window.addEventListener('mousewheel', function(e) {
            let wd = e.wheelDelta / -10;
            this.mouseWheelView.val += wd;
            this.mouseWheelView.lasttime = new Date();
          }.bind(this));

        Events.on(this.worldEngine.engine, 'beforeTick', function() {
            if((new Date()) - this.mouseWheelView.lasttime > 6000) {
                if(this.mouseWheelView.val > 0) {
                    this.mouseWheelView.val -= 2;
                } else if(this.mouseWheelView.val < 0) {
                    this.mouseWheelView.val += 2;
                }
            }
            Render.lookAt(this.worldEngine.render, this.rocket.body, {
                x: (window.innerWidth <= 800 ? window.innerWidth * 1.5 : window.innerWidth) * this.rocket.getViewScale() + this.mouseWheelView.val,
                y: window.innerHeight * this.rocket.getViewScale() + this.mouseWheelView.val
              });
        }.bind(this));
    }

    bindHud() {
        Events.on(this.worldEngine.render, 'afterRender', function() {
            this.hud.render(this.worldEngine.render.context);
        }.bind(this));
    }

    addListeners() {
        document.body.addEventListener(
            "keydown",
            function (e) {
                this.keys[e.keyCode] = true;
            }.bind(this)
        );
        document.body.addEventListener(
            "keyup",
            function (e) {
                this.keys[e.keyCode] = false;
            }.bind(this)
        );
        document.addEventListener(
            "keypress",
            function (e) {
                if (e.keyCode == 113) {
                    Config.autoPilot = !Config.autoPilot;
                }
            }.bind(this)
        );
        document.addEventListener(
            "click",
            function (e) {
                this.rocket.setAutopilotTarget(this.worldEngine.render.mouse)
            }.bind(this)
        );
        document.addEventListener(
            "touchstart",
            function (e) {
                this.rocket.setAutopilotTarget(this.worldEngine.render.mouse)
            }.bind(this)
        );
    }
}
