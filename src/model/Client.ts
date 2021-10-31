import dotenv from 'dotenv'
dotenv.config()
import '../service/Db'

import { Client } from 'discord.js'

import Config from '../constants/Config'

export const createClient = async () => {
    const client = new Client(Config.CLIENT_OPTIONS)

    for (const handler of ['command', 'event']) {
        require(`../handlers/${handler}`).default.run(client)
    }
    
    await client.login(process.env.TOKEN)

    return client
}