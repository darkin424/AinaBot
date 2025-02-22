const CommandoClient = require('discord.js-commando').CommandoClient
const Structures = require('discord.js').Structures
const Levels = require('discord-xp')
const path = require('path')

Levels.setURL(process.env.mongoPath)

const dotenv = require('dotenv')

dotenv.config({
  path: path.join(__dirname, '..', '.env')
})

Structures.extend('Guild', function (Guild) {
  class MusicGuild extends Guild {
    constructor (client, data) {
      super(client, data)
      this.musicData = {
        queue: [],
        isPlaying: false,
        nowPlaying: null,
        songDispatcher: null,
        skipTimer: false,
        loopSong: false,
        loopQueue: false,
        volume: 1
      }
    }
  }
  return MusicGuild
})

const client = new CommandoClient({
  commandPrefix: process.env.BOT_PREFIX,
  owner: process.env.BOT_OWNER
})

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['music', 'Music Commands'],
    ['moderation', 'Server Moderation'],
    ['level', 'Level Commands'],
    ['misc', 'Misc Commands']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    eval: true,
    help: true,
    prefix: true,
    ping: true,
    unknownCommand: false,
    commandState: false
  })
  .registerCommandsIn(path.join(__dirname, 'commands'))

client.once('ready', () => {
  console.log('Ready!')

  setInterval(
    () =>
      client.user.setActivity(
        `${client.commandPrefix}help | Contributing to Open Source`,
        {
          type: 'LISTENING'
        }
      ),
    10000
  )
})

client.on('message', async (message) => {
  if (message.author.bot) return
  if (message.channel.type === 'dm') return
  const randomXp = Math.floor(Math.random() * 10) + 10
  const hasLevelUp = await Levels.appendXp(message.author.id, message.guild.id, randomXp)
  
  if (hasLevelUp) {
    message.reply(`Congrats! You've leveled up to level: ${(await Levels.fetch(message.author.id, message.guild.id)).level}`)
  }
})

client.login(process.env.BOT_TOKEN)

const keep_alive = require('../keep_alive.js')
