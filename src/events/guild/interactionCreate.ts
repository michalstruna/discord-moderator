import { Client, GuildMember, Interaction } from 'discord.js'

import ComponentId from '../../constants/ComponentId'
import UserService from '../../service/UserService'

const parseCustomId = (input: string) => {
    const [id, rawConfig] = input.split('__')
    return { id, config: rawConfig ? JSON.parse(rawConfig) : {} }
}

export default async (client: Client, i: Interaction) => {
    if (!i.member) return

    if (i.isSelectMenu()) {
        const { id, config } = parseCustomId(i.customId)

        if (id == ComponentId.ROLE_SELECTOR) {
            await UserService.removeRole(i.member as GuildMember, ...config.roles)
            await UserService.addRole(i.member as GuildMember, ...i.values)
        }

        i.deferUpdate()
    }

    if (i.isButton()) {

    }

    if (i.isCommand()) {

    }
}