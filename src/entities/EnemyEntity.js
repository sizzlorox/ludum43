
import SPEECH from '../data/enemySpeech';
import util from '../util';
import DamageableEntity from './DamageableEntity';

// CONSTANTS
const SPEED = 75;

export default class Enemy extends DamageableEntity {
  constructor(config, worldLayer, npcAvoidLayer) {
    super(config.scene, config.x, config.y, config.key);
    this.spawnPosition = { x: config.x, y: config.y };
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.scene.physics.add.collider(this, [worldLayer, npcAvoidLayer]);
    this.body.collideWorldBounds = true;
    this.body.onWorldBounds = true;

    this.alive = true;

    // TIMERS
    this.speechTimer = util.randomIntFromInterval(0, 30000);
    this.decisionTimer = 0;

    // Speech text
    this.speechText = this.scene.make.text({
      add: true,
      x: config.x - 8,
      y: config.y - 16,
      text: 'ARGGHHH',
      style: {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#ffffff',
        align: 'center'
      }
    });
    this.speechText.visible = false;
  }

  fallOutOfBounds() {
    this.alive = false;
    this.destroy();
  }

  randomSpeech() {
    const randomInt = util.randomIntFromInterval(0, SPEECH.length - 1);
    this.speechText.text = SPEECH[randomInt].description;
  }

  update() {
    if (!this.alive) {
      return;
    }

    if ((this.scene.time.now - this.decisionTimer) > 250) {
      if (util.randomIntFromInterval(0, 1) === 1) {
        this.body.setVelocityX(SPEED);
      } else {
        this.body.setVelocityX(-SPEED);
      }
      this.decisionTimer = this.scene.time.now;
    }
    this.speechText.setPosition(this.body.x - (this.speechText.displayWidth / 3), this.body.y - (16 + this.speechText.displayHeight));

    if (!this.speechText.visible && (this.scene.time.now - this.speechTimer) > 6000) {
      this.speechText.visible = true;
      this.randomSpeech();
      this.speechTimer = this.scene.time.now;
    }

    if (this.speechText.visible && (this.scene.time.now - this.speechTimer) > 1750) {
      this.speechText.visible = false;
      this.speechTimer = this.scene.time.now + util.randomIntFromInterval(0, 30000);
    }
  }
};
