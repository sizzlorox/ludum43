export default {
  randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },

  enumHelper: {
    memoryTypes: {
      personal: 1
    },
    damage: {
      fall: 25
    }
  }
}