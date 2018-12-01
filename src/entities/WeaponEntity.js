export default class WeaponEntity extends Phaser.GameObjects.Image {
  constructor(scene, image) {
    super(scene, 0, 0, image || 'weapon');
  }

  attack(scene, player) {
    console.log('attacking...');
  }
};

export class GunEntity extends WeaponEntity {

  constructor(scene) {
    super(scene, 'bullet');

    this.lastFired = 0;
    this.speed = Phaser.Math.GetSpeed(400, 1);

    this.bullets = scene.add.group({
      classType: GunEntity,
      maxSize: 20,
      runChildUpdate: true
    });

    this.lastDirection = {
      right: true,
      left: false
    };
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
    if (this.lastDirection.right) {
      this.x += this.speed * delta;
    }
    if (this.lastDirection.left) {
      this.x -= this.speed * delta;
    }

    if (this.x < this.x - 50 || this.x > this.x + 50) {
      this.setActive(false);
      this.setVisible(false);
    }
  }

  attack(scene, player) {
    if (scene.time.now > this.lastFired) {
      const bullet = this.bullets.get();

      if (bullet) {
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
