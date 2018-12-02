import { Physics } from 'phaser';

export default class DamageableEntity extends Physics.Arcade.Sprite {


  constructor(...args) {
    super(...args);
    this.alive = true;
    this.health = 100;
  }

  onDamage(weapon) {
    this.health -= weapon.damagePoints;

    if (this.health <= 0) {
      this.alive = false;
      this.destroy();
    }
  }
};
