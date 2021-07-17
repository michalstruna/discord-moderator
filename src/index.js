require('dotenv').config()
require('./service/Db')

const Discord = require('discord.js')
const Buttons = require('discord-buttons')

const client = new Discord.Client()
Buttons(client)

for (const handler of ['command', 'event']) {
    require(`./handlers/${handler}`)(client)
}

client.login(process.env.TOKEN).then(async () => {

})

// TODO: Commando: https://discord.js.org/#/docs/commando/master/general/welcome