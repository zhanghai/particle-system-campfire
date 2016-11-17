/*
 * Copyright (c) 2016 Zhang Hai <dreaming.in.code.zh@gmail.com>
 * All Rights Reserved.
 */

'use strict';

function random(min, max) {
    if (typeof max === 'undefined') {
        max = min;
        min = 0;
    }
    return min + Math.random() * (max - min);
}

class Aura {

    constructor(options) {
        this.aura = new Two.Ellipse(options.x, options.y, options.radius * 2);
        this.aura.id = options.id;
        this.aura.noStroke();
        this.aura.fill = new Two.RadialGradient(0, 0, options.radius, options.stops);
        options.group.add(this.aura);
        this.lastFlicker = 0;
        this.update();
    }

    update() {
        const now = Date.now();
        if (this.lastFlicker + 50 < now) {
            this.aura.opacity = (30 + random(25)) / 100;
            this.lastFlicker = now;
        }
    }
}

class WhiteBear {

    constructor(options) {
        const bearSvg = document.getElementById('white-bear');
        this.bear = two.interpret(bearSvg);
        two.remove(this.bear);
        this.bear.scale = 1 / 2.75;
        this.bear.translation.set(options.x + -bearSvg.width.baseVal.value / 2.75, options.y + -bearSvg.height.baseVal.value / 2.75);
        options.group.add(this.bear);
    }
}

class BlackBear {

    constructor(options) {

        this.bears = new Two.Group();
        this.bears.id = 'black-bear';

        const bear1Svg = document.getElementById('black-bear-1');
        this.bear1 = two.interpret(bear1Svg);
        two.remove(this.bear1);
        this.bear1.translation.set(0, -bear1Svg.height.baseVal.value);
        this.bears.add(this.bear1);

        const bear2Svg = document.getElementById('black-bear-2');
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

    update() {
        const now = Date.now();
        if (this.lastUpdate + 2500 < now) {
            this.showingBear1 = !this.showingBear1;
            this.bear1.opacity = this.showingBear1 ? 1 : 0;
            this.bear2.opacity = this.showingBear1 ? 0 : 1;
            this.lastUpdate = now;
        }
    }
}

class Particle {

    constructor(x, y, randomSpeedX, randomSpeedY) {
        this.shape = new Two.Rectangle(0, 0, 1, 1);
        this.shape.noStroke();
        this.x = x;
        this.y = y;
        this.randomSpeedX = randomSpeedX;
        this.randomSpeedY = randomSpeedY;
        this.lastRandomization = Date.now();
    }

    updateShape(x, y, size, color) {
        this.shape.translation.x = x + this.x;
        this.shape.translation.y = y + this.y;
        this.shape.scale = size;
        this.shape.fill = color;
    }
}

class ParticleSystem {

    constructor(options) {

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

    update() {

        const now = Date.now();
        const deltaSeconds = (now - this.lastUpdate) / 1000;
        this.lastUpdate = now;

        if (this.lastEmission + this.emissionInterval < now) {
            const randomX = random(-this.radius, this.radius);
            const particle = new Particle(randomX, 0, this._randomSpeedX(), this._randomSpeedY());
            this.particles.push(particle);
            this.shapes.add(particle.shape);
            this.lastEmission = Date.now();
        }

        for (let i = 0; i < this.particles.length; ) {

            const particle = this.particles[i];

            particle.x += (particle.randomSpeedX + this.speedX) * deltaSeconds;
            particle.y += (particle.randomSpeedY + this.speedY) * deltaSeconds;

            if (-particle.y > this.height) {
                this.particles.splice(i, 1);
                this.shapes.remove(particle.shape);
                continue;
            }

            particle.updateShape(this.x, this.y, this.particleSize, this._computeColor(particle));

            if (particle.lastRandomization + this.speedRandomizationInterval < now) {
                particle.randomSpeedX = this._randomSpeedX();
                particle.randomSpeedY = this._randomSpeedY();
                particle.lastRandomization = Date.now();
            }

            ++i;
        }
    }

    _randomSpeedX() {
        return random(-this.randomSpeedXRange, this.randomSpeedXRange);
    }

    _randomSpeedY() {
        return random(-this.randomSpeedYRange, this.randomSpeedYRange);
    }

    _computeColor(particle) {
        const scale = -particle.y / this.height;
        return this.gradient(scale).css();
    }
}

class Stones {

    constructor(options) {
        this.stones = new Two.Group();
        this.stones.id = 'stones';
        options.group.add(this.stones);
        const stoneSize = Math.sqrt(2);
        for (let i = 0; i < 4; ++i) {
            const stone = new Two.Rectangle(0, 0, stoneSize, stoneSize);
            stone.rotation = Math.PI / 4;
            stone.translation.x = -1.5 + i;
            stone.fill = 'black';
            stone.noStroke();
            this.stones.add(stone);
        }
        this.stones.translation.set(options.x, options.y);
        this.stones.scale = options.width / 5;
    }
}

const twoElement = document.getElementById('scene');
const two = new Two({
    width: twoElement.clientWidth,
    height: twoElement.clientHeight,
    autostart: true
}).appendTo(twoElement);

const background = two.makeRectangle(two.width / 2, two.height / 2, two.width, two.height);
background.fill = new Two.LinearGradient(-two.width / 2, -two.height / 2, two.width / 2, two.height / 2, [
    new Two.Stop(0, '#C68C94'),
    new Two.Stop(0.5, '#3A5067'),
    new Two.Stop(1, '#3A5067')
]);
background.noStroke();

const campfireGroup = two.makeGroup();
campfireGroup.id = 'campfire';
campfireGroup.scale = 4;
campfireGroup.translation.set(two.width / 2, two.height * 0.8);

const outerAura = new Aura({
    group: campfireGroup,
    id: 'outer-aura',
    x: 0,
    y: 0,
    radius: 0.36 * campfireGroup.translation.x / campfireGroup.scale,
    stops: [
        new Two.Stop(0, 'rgba(243, 241, 226, 148)'),
        new Two.Stop(1, 'rgba(243, 241, 226, 0)')
    ]
});

const innerAura = new Aura({
    group: campfireGroup,
    id: 'inner-aura',
    x: 0,
    y: 0,
    radius: 0.22 * campfireGroup.translation.x / campfireGroup.scale,
    stops: [
        new Two.Stop(0, 'rgba(232, 145, 130, 176)'),
        new Two.Stop(1, 'rgba(232, 145, 130, 0)')
    ]
});

const flames = new ParticleSystem({
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

const sparks = new ParticleSystem({
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

const stones = new Stones({
    group: campfireGroup,
    x: 0,
    y: 4,
    width: 20
});

const whiteBear = new WhiteBear({
    group: campfireGroup,
    x: -25,
    y: 8
});

const blackBear = new BlackBear({
    group: campfireGroup,
    x: 5,
    y: 8
});

two.bind('update', () => {
    outerAura.update();
    innerAura.update();
    flames.update();
    sparks.update();
    blackBear.update();
});

const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
document.getElementById('play-pause').addEventListener('click', event => {
    two.playing ? two.pause() : two.play();
    playIcon.classList.toggle('display-none', two.playing);
    pauseIcon.classList.toggle('display-none', !two.playing);
});

document.getElementById('wind-strength').addEventListener('input', event => {
    flames.speedX = sparks.speedX = Number.parseFloat(event.target.value) / 2.75;
});

document.getElementById('flames-height').addEventListener('input', event => {
    flames.height = Number.parseFloat(event.target.value) / 100 * 0.4 * campfireGroup.translation.y / campfireGroup.scale;
});
