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
    
    // speed = Phaser.Math.GetSpeed(300, 1);
  }

  fire(x, y) {
      this.setPosition(x, y - 50);

      this.setActive(true);
      this.setVisible(true);
  }

  update(time, delta) {
      this.y -= this.speed * delta;

      if (this.y < -50)
      {
          this.setActive(false);
          this.setVisible(false);
      }
  }

  attack(scene, player) {
    if (scene.time.now > this.lastFired)
    {
        var bullet = this.bullets.get();

        if (bullet)
        {
            bullet.fire(player.x, player.y);

            this.lastFired = scene.time.now + 50;
        }
    }
  }
};
