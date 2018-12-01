import { Scene } from 'phaser';

// Entities
import MemoryEntity from '../entities/MemoryEntity';
import PlayerEntity from '../entities/PlayerEntity';

export default class GameScene extends Scene {
  constructor(config) {
    super(config);
    this.DEBUG = process.env.NODE_ENV !== 'production' ? true : false;        // Defines debug mode to render collision stuffs
    this.DEBUG = false; // OVERRIDE

    // GameObjects
    this.Player;        // The player object
    this.memoryList;        // List of memorys in scene
  }

  preload() {
    // MAP ASSETS
    this.load.image('tiles', 'assets/tileset.png');       // Loads tileset
    this.load.tilemapTiledJSON('map', 'assets/tilemaps/default.json');        // Loads tilemap from JSON genereted from Tilemap

    // GAME ASSETS
    this.load.image('player', 'assets/player.png');       // Loads player image
    this.load.image('memory', 'assets/memory.png');       // Loads memory image
  }

  create() {
    this.input.mouse.disableContextMenu();          // Removes right click
    const map = this.make.tilemap({ key: 'map' });        // Creates map
    const tileset = map.addTilesetImage('tileset', 'tiles');        // adds tileset to map
    const belowLayer = map.createStaticLayer('Below Player', tileset, 0, 0);        // Creates layer that renders above player
    const worldLayer = map.createStaticLayer('World', tileset, 0, 0);       // Creates world layer that blocks player
    worldLayer.setCollisionByProperty({ isCollidable: true });        // Sets world layer to collide with player by tilemap tile property
    const aboveLayer = map.createStaticLayer('Above Player', tileset, 0, 0);        // Sets layer to render below player
    aboveLayer.setDepth(10);        // Sets layer depth

    // Spawns
    const spawnPoint = map.findObject('Player Spawn', obj => obj.name === 'Player Spawn');        // Gets player spawnpoint by object layer name (set by tilemap)
    const memorySpawns = map.filterObjects('Memory Spawn', objs => objs);         // Loads memory spawns set by tilemap

    // Player
    this.Player = new PlayerEntity(
      { scene: this, x: spawnPoint.x, y: spawnPoint.y, key: 'player' },       // Pass player initialize info
      worldLayer,       // Pass world layer to set it to collide with worldLayer
      this.input.keyboard.createCursorKeys()        // Pass input cursor object to allow input to be handled
    );

    // Camera
    const camera = this.cameras.main;
    camera.startFollow(this.Player);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    camera.setZoom(2.5);

    // Lists
    this.memoryList = this.physics.add.group({
      classType: MemoryEntity,
      maxSize: 16,
      runChildUpdate: true
    });
    this.physics.add.collider(this.memoryList, worldLayer)
    memorySpawns.forEach(memory => this.memoryList.get(memory.x, memory.y));

    // World events
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels, true, true, true, true);

    if (this.DEBUG) {
      const debugGraphics = this.add.graphics().setAlpha(0.75);
      worldLayer.renderDebug(debugGraphics, {
        tileColor: null,
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
        faceColor: new Phaser.Display.Color(40, 39, 37, 255),
      });
    }
  }

  update() {
    this.Player.update();
    this.physics.overlap(this.Player, this.memoryList, this.Player.getMemory, (player, memory) => memory.destroy(), this);
  }
}
