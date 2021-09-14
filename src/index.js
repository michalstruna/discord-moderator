require('dotenv').config()
require('./service/Db')

const Discord = require('discord.js')

const client = new Discord.Client({
    intents: []
})

for (const handler of ['command', 'event']) {
    require(`./handlers/${handler}`)(client)
}

client.login(process.env.TOKEN).then(async () => {

})