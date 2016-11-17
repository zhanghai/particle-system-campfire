/*
 * Copyright (c) 2016 Zhang Hai <dreaming.in.code.zh@gmail.com>
 * All Rights Reserved.
 */

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function random(min, max) {
    if (typeof max === 'undefined') {
        max = min;
        min = 0;
    }
    return min + Math.random() * (max - min);
}

var Aura = function () {
    function Aura(options) {
        _classCallCheck(this, Aura);

        this.aura = new Two.Ellipse(options.x, options.y, options.radius * 2);
        this.aura.id = options.id;
        this.aura.noStroke();
        this.aura.fill = new Two.RadialGradient(0, 0, options.radius, options.stops);
        options.group.add(this.aura);
        this.lastFlicker = 0;
        this.update();
    }

    _createClass(Aura, [{
        key: 'update',
        value: function update() {
            var now = Date.now();
            if (this.lastFlicker + 50 < now) {
                this.aura.opacity = (30 + random(25)) / 100;
                this.lastFlicker = now;
            }
        }
    }]);

    return Aura;
}();

var WhiteBear = function WhiteBear(options) {
    _classCallCheck(this, WhiteBear);

    var bearSvg = document.getElementById('white-bear');
    this.bear = two.interpret(bearSvg);
    two.remove(this.bear);
    this.bear.scale = 1 / 2.75;
    this.bear.translation.set(options.x + -bearSvg.width.baseVal.value / 2.75, options.y + -bearSvg.height.baseVal.value / 2.75);
    options.group.add(this.bear);
};

var BlackBear = function () {
    function BlackBear(options) {
        _classCallCheck(this, BlackBear);

        this.bears = new Two.Group();
        this.bears.id = 'black-bear';

        var bear1Svg = document.getElementById('black-bear-1');
        this.bear1 = two.interpret(bear1Svg);
        two.remove(this.bear1);
        this.bear1.translation.set(0, -bear1Svg.height.baseVal.value);
        this.bears.add(this.bear1);

        var bear2Svg = document.getElementById('black-bear-2');
        this.bear2 = two.interpret(bear2Svg);
        two.remove(this.bear2);
        this.bear2.translation.set(0, -bear2Svg.height.baseVal.value);
        this.bears.add(this.bear2);

        this.bears.translation.set(options.x, options.y);
        options.group.add(this.bears);

        this.bears.scale = 1 / 2.75;

        this.showingBear1 = false;
        this.lastUpdate = 0;
        this.update();
    }

    _createClass(BlackBear, [{
        key: 'update',
        value: function update() {
            var now = Date.now();
            if (this.lastUpdate + 2500 < now) {
                this.showingBear1 = !this.showingBear1;
                this.bear1.opacity = this.showingBear1 ? 1 : 0;
                this.bear2.opacity = this.showingBear1 ? 0 : 1;
                this.lastUpdate = now;
            }
        }
    }]);

    return BlackBear;
}();

var Particle = function () {
    function Particle(x, y, randomSpeedX, randomSpeedY) {
        _classCallCheck(this, Particle);

        this.shape = new Two.Rectangle(0, 0, 1, 1);
        this.shape.noStroke();
        this.x = x;
        this.y = y;
        this.randomSpeedX = randomSpeedX;
        this.randomSpeedY = randomSpeedY;
        this.lastRandomization = Date.now();
    }

    _createClass(Particle, [{
        key: 'updateShape',
        value: function updateShape(x, y, size, color) {
            this.shape.translation.x = x + this.x;
            this.shape.translation.y = y + this.y;
            this.shape.scale = size;
            this.shape.fill = color;
        }
    }]);

    return Particle;
}();

var ParticleSystem = function () {
    function ParticleSystem(options) {
        _classCallCheck(this, ParticleSystem);

        this.x = options.x;
        this.y = options.y;
        this.radius = options.radius;
        this.height = options.height;

        this.emissionInterval = options.emissionInterval;
        this.lastEmission = 0;

        this.speedX = options.speedX;
        this.speedY = options.speedY;
        this.randomSpeedXRange = options.randomSpeedXRange;
        this.randomSpeedYRange = options.randomSpeedYRange;
        this.speedRandomizationInterval = options.speedRandomizationInterval;

        this.particleSize = options.particleSize;
        this.gradient = chroma.scale([options.startColor, options.endColor, 'rgba(0, 0, 0, 0)']);

        this.particles = [];
        this.shapes = new Two.Group();
        this.shapes.id = options.id;
        options.group.add(this.shapes);

        this.lastUpdate = 0;
        this.update();
    }

    _createClass(ParticleSystem, [{
        key: 'update',
        value: function update() {

            var now = Date.now();
            var deltaSeconds = (now - this.lastUpdate) / 1000;
            this.lastUpdate = now;

            if (this.lastEmission + this.emissionInterval < now) {
                var randomX = random(-this.radius, this.radius);
                var particle = new Particle(randomX, 0, this._randomSpeedX(), this._randomSpeedY());
                this.particles.push(particle);
                this.shapes.add(particle.shape);
                this.lastEmission = Date.now();
            }

            for (var i = 0; i < this.particles.length;) {

                var _particle = this.particles[i];

                _particle.x += (_particle.randomSpeedX + this.speedX) * deltaSeconds;
                _particle.y += (_particle.randomSpeedY + this.speedY) * deltaSeconds;

                if (-_particle.y > this.height) {
                    this.particles.splice(i, 1);
                    this.shapes.remove(_particle.shape);
                    continue;
                }

                _particle.updateShape(this.x, this.y, this.particleSize, this._computeColor(_particle));

                if (_particle.lastRandomization + this.speedRandomizationInterval < now) {
                    _particle.randomSpeedX = this._randomSpeedX();
                    _particle.randomSpeedY = this._randomSpeedY();
                    _particle.lastRandomization = Date.now();
                }

                ++i;
            }
        }
    }, {
        key: '_randomSpeedX',
        value: function _randomSpeedX() {
            return random(-this.randomSpeedXRange, this.randomSpeedXRange);
        }
    }, {
        key: '_randomSpeedY',
        value: function _randomSpeedY() {
            return random(-this.randomSpeedYRange, this.randomSpeedYRange);
        }
    }, {
        key: '_computeColor',
        value: function _computeColor(particle) {
            var scale = -particle.y / this.height;
            return this.gradient(scale).css();
        }
    }]);

    return ParticleSystem;
}();

var Stones = function Stones(options) {
    _classCallCheck(this, Stones);

    this.stones = new Two.Group();
    this.stones.id = 'stones';
    options.group.add(this.stones);
    var stoneSize = Math.sqrt(2);
    for (var i = 0; i < 4; ++i) {
        var stone = new Two.Rectangle(0, 0, stoneSize, stoneSize);
        stone.rotation = Math.PI / 4;
        stone.translation.x = -1.5 + i;
        stone.fill = 'black';
        stone.noStroke();
        this.stones.add(stone);
    }
    this.stones.translation.set(options.x, options.y);
    this.stones.scale = options.width / 5;
};

var twoElement = document.getElementById('scene');
var two = new Two({
    width: twoElement.clientWidth,
    height: twoElement.clientHeight,
    autostart: true
}).appendTo(twoElement);

var background = two.makeRectangle(two.width / 2, two.height / 2, two.width, two.height);
background.fill = new Two.LinearGradient(-two.width / 2, -two.height / 2, two.width / 2, two.height / 2, [new Two.Stop(0, '#C68C94'), new Two.Stop(0.5, '#3A5067'), new Two.Stop(1, '#3A5067')]);
background.noStroke();

var campfireGroup = two.makeGroup();
campfireGroup.id = 'campfire';
campfireGroup.scale = 4;
campfireGroup.translation.set(two.width / 2, two.height * 0.8);

var outerAura = new Aura({
    group: campfireGroup,
    id: 'outer-aura',
    x: 0,
    y: 0,
    radius: 0.36 * campfireGroup.translation.x / campfireGroup.scale,
    stops: [new Two.Stop(0, 'rgba(243, 241, 226, 148)'), new Two.Stop(1, 'rgba(243, 241, 226, 0)')]
});

var innerAura = new Aura({
    group: campfireGroup,
    id: 'inner-aura',
    x: 0,
    y: 0,
    radius: 0.22 * campfireGroup.translation.x / campfireGroup.scale,
    stops: [new Two.Stop(0, 'rgba(232, 145, 130, 176)'), new Two.Stop(1, 'rgba(232, 145, 130, 0)')]
});

var flames = new ParticleSystem({
    group: campfireGroup,
    id: 'flames',
    x: 0,
    y: 0,
    radius: 5,
    height: 0.6 * 0.4 * campfireGroup.translation.y / campfireGroup.scale,
    emissionInterval: 30,
    speedX: 0,
    speedY: -30,
    randomSpeedXRange: 20,
    randomSpeedYRange: 1.5,
    speedRandomizationInterval: 2000,
    particleSize: 8,
    startColor: '#FCFBEB',
    endColor: '#E89183'
});

var sparks = new ParticleSystem({
    group: campfireGroup,
    id: 'sparks',
    x: 0,
    y: 0,
    radius: 5,
    height: campfireGroup.translation.y / campfireGroup.scale,
    emissionInterval: 600,
    speedX: 0,
    speedY: -30,
    randomSpeedXRange: 25,
    randomSpeedYRange: 2.5,
    speedRandomizationInterval: 900,
    particleSize: 1,
    startColor: '#FCFBEB',
    endColor: '#E89183'
});

var stones = new Stones({
    group: campfireGroup,
    x: 0,
    y: 4,
    width: 20
});

var whiteBear = new WhiteBear({
    group: campfireGroup,
    x: -25,
    y: 8
});

var blackBear = new BlackBear({
    group: campfireGroup,
    x: 5,
    y: 8
});

two.bind('update', function () {
    outerAura.update();
    innerAura.update();
    flames.update();
    sparks.update();
    blackBear.update();
});

var playIcon = document.getElementById('play-icon');
var pauseIcon = document.getElementById('pause-icon');
document.getElementById('play-pause').addEventListener('click', function (event) {
    two.playing ? two.pause() : two.play();
    playIcon.classList.toggle('display-none', two.playing);
    pauseIcon.classList.toggle('display-none', !two.playing);
});

document.getElementById('wind-strength').addEventListener('input', function (event) {
    flames.speedX = sparks.speedX = Number.parseFloat(event.target.value) / 2.75;
});

document.getElementById('flames-height').addEventListener('input', function (event) {
    flames.height = Number.parseFloat(event.target.value) / 100 * 0.4 * campfireGroup.translation.y / campfireGroup.scale;
});