function getRandomValue (min, max) {
  return Math.floor(Math.random() * max) + min
}

function getUnitHealth (current, max) {
  return { width: (current / max) * 100 + '%' }
}

function getCooldown (action, actionLog, cooldown, roundCounter) {
  if (action == 0) {
    return false
  } else if (action > 0 && !(actionLog + cooldown < roundCounter)) {
    // After a special, special will only available depends on cooldown duration
    return true
  }
}

const app = Vue.createApp({
  data () {
    return {
      playerHealth: 100,
      monsterHealth: 100,
      currentRound: 0,
      specialCounter: 0,
      specialLog: 0,
      healLog: 0,
      healCounter: 0,
      specialCooldownCounter: 4,
      healCooldownCounter: 3,
      playerMaxHealth: 100,
      monsterMaxHealth: 100,
      specialCooldown: 3,
      healCooldown: 2,
      winner: null,
      confirm: null,
      logMessages: []
    }
  },
  watch: {
    specialCounter (value) {
      if (value != 0) {
        return value--
      }
    }
  },
  computed: {
    playerCurrentHealth () {
      if (this.playerHealth < 0) {
        return { width: '0%' }
      }
      return getUnitHealth(this.playerHealth, this.playerMaxHealth)
    },
    monsterCurrentHealth () {
      if (this.monsterHealth < 0) {
        return { width: '0%' }
      }
      return getUnitHealth(this.monsterHealth, this.monsterMaxHealth)
    },
    specialAttackRestriction () {
      return getCooldown(
        this.specialCounter,
        this.specialLog,
        this.specialCooldown,
        this.currentRound
      )
    },
    healRestriction () {
      return getCooldown(
        this.healCounter,
        this.healLog,
        this.healCooldown,
        this.currentRound
      )
    }
  },
  watch: {
    specialCooldownCounter (value) {
      if (value == 0) return (this.specialCooldownCounter = 4)
    },
    healCooldownCounter (value) {
      if (value == 0) return (this.healCooldownCounter = 3)
    },
    playerHealth (value) {
      if (value <= 0 && this.monsterHealth <= 0) {
        this.winner = 'draw'
      } else if (value <= 0) {
        this.winner = 'monster'
      }
    },
    monsterHealth (value) {
      if (value <= 0 && this.playerHealth <= 0) {
        this.winner = 'draw'
      } else if (value <= 0) {
        this.winner = 'player'
      }
    }
  },
  methods: {
    startGame () {
      ;(this.playerHealth = 100),
        (this.monsterHealth = 100),
        (this.currentRound = 0),
        (this.specialCounter = 0),
        (this.specialLog = 0),
        (this.healLog = 0),
        (this.healCounter = 0),
        (this.winner = null),
        (this.confirm = null),
        (this.specialCooldownCounter = 4),
        (this.healCooldownCounter = 3),
        (this.logMessages = [])
    },
    attackPlayer () {
      const damage = getRandomValue(5, 15)

      this.playerHealth -= damage
      this.addLogMessage('monster', 'normal-attack', damage)

      if (
        this.specialAttackRestriction == true ||
        this.specialLog > this.currentRound
      ) {
        return this.specialCooldownCounter--
      }

      if (this.healRestriction == true || this.healLog > this.currentRound) {
        return this.healCooldownCounter--
      }
    },
    attackMonster () {
      const damage = getRandomValue(5, 10)

      this.monsterHealth -= damage
      this.addLogMessage('player', 'normal-attack', damage)
      this.attackPlayer()
      this.currentRound++
    },
    attackMonsterSpecial () {
      const damage = getRandomValue(10, 15)

      this.specialCounter++
      this.specialLog = this.currentRound
      this.monsterHealth -= damage
      this.addLogMessage('player', 'special-attack', damage)
      this.attackPlayer()
      this.currentRound++
    },
    healPlayer () {
      const heal = getRandomValue(10, 15)

      if (this.playerHealth + heal > this.playerMaxHealth) {
        this.playerHealth = this.playerMaxHealth
      } else {
        this.playerHealth += heal
      }

      this.healCounter++
      this.healLog = this.currentRound
      this.addLogMessage('player', 'heal', heal)
      this.attackPlayer()
      this.currentRound++
    },
    confirmation () {
      this.confirm = !this.confirm
    },
    surrender () {
      this.confirm = null
      this.winner = 'monster'
    },
    addLogMessage (who, what, value) {
      this.logMessages.unshift({
        actionBy: who,
        actionType: what,
        actionValue: value
      })
    }
  }
})

app.mount('#game')
