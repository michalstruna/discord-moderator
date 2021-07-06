require('dotenv').config()
require('./service/db')

const Discord = require('discord.js')
const Buttons = require('discord-buttons')

const client = new Discord.Client()
Buttons(client)

client.commands = new Discord.Collection()
client.events = new Discord.Collection()

for (const handler of ['command', 'event']) {
    require(`./handlers/${handler}`)(client)
}

client.login(process.env.TOKEN).then(async () => {

})