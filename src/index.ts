import dotenv from 'dotenv'
dotenv.config()
import './service/Db'

import { Client } from 'discord.js'

const client = new Client({
    intents: []
})

for (const handler of ['command', 'event']) {
    require(`./handlers/${handler}`).default.run(client)
}

client.login(process.env.TOKEN).then(async () => {

})