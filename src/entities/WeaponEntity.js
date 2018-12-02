import DamageableEntity from './DamageableEntity';
import * as _ from 'lodash';

export default class WeaponEntity extends Phaser.GameObjects.Image {
  constructor(scene, image) {
    super(scene, 0, 0, image || 'weapon');
  }

  attack(scene, player) {
    console.log('attacking...');
  }
};

export class GunEntity extends WeaponEntity {

  constructor(scene, worldLayer) {
    super(scene, 'bullet');

    this.lastFired = 0;
    this.speed = Phaser.Math.GetSpeed(400, 1);

    this.bullets = this.scene.add.group({
      classType: BulletEntity,
      maxSize: 20,
      runChildUpdate: true
    });

    this.worldLayer = worldLayer;
    this.lastDirection = {
      right: true,
      left: false
    };
  }

  getBulletGroup() {
    return this.bullets;
  }

  attack(scene, player) {
    if (scene.time.now > this.lastFired) {
      const bullet = this.bullets.get();

      if (bullet) {
        bullet.setWorldLayer(this.worldLayer);
        bullet.lastDirection = Object.assign(
          {},
          player.lastDirection
        );

        bullet.fire(player.x, player.y);

        this.lastFired = scene.time.now + 50;
      }
    }
  }
};

export class BulletEntity extends Phaser.GameObjects.Image {

  constructor(scene) {
    super(scene, 0, 0, 'bullet');

    this.scene.physics.world.enable(this);
    this.body.setAllowGravity(false);
    this.body.collideWorldBounds = true;
    this.body.onWorldBounds = true;
    this.setSize(8, 8);

    this.lastFired = 0;
    this.speed = Phaser.Math.GetSpeed(400, 1);

    this.lastDirection = {
      right: true,
      left: false
    };

    this.alive = true;
    this.damagePoints = 25;
  }

  setWorldLayer(layer) {
    this.worldLayer = layer;
  }

  fallOutOfBounds() {
    this.destroy();
  }

  collideObstacle() {
    this.alive = false;
    this.destroy();
    // emit particle
  }

  fire(x, y) {
    if (this.lastDirection.right) {
      this.setPosition(x + 25, y);
    }

    if (this.lastDirection.left) {
      this.setPosition(x - 25, y);
    }

    this.setActive(true);
    this.setVisible(true);
  }

  update(time, delta) {
    this.scene.physics.overlap(this, this.worldLayer, (bullet, tile) => tile.properties.isCollidable ? bullet.collideObstacle() : null, null, this);

    if (!this.alive) {
      return;
    }

    if (this.lastDirection.right) {
      this.x += this.speed * delta;
    }

    if (this.lastDirection.left) {
      this.x -= this.speed * delta;
    }

    if (this.didDamage()) {
      return this.destroy();
    }
  }

  didDamage() {
    var didOverlap = false;

    var damageables = _.filter(this.scene.children.list, (item) => item instanceof DamageableEntity)
    this.scene.physics.overlap(this, damageables, null, (a, b, c) => {
      b.onDamage(a);

      didOverlap = true;
    }, this);

    return didOverlap;
  }
};
