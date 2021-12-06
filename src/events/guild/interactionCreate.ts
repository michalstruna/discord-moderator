import { Client, GuildMember, Interaction, MessageSelectMenu } from 'discord.js'
import Color from '../../constants/Color'

import ComponentId from '../../constants/ComponentId'
import MessageService from '../../service/MessageService'
import UserService from '../../service/UserService'
import { list, role } from '../../utils/Outputs'

const parseCustomId = (input: string) => {
    const [id, rawConfig] = input.split('__')
    return { id, config: rawConfig ? JSON.parse(rawConfig) : {} }
}

export default async (client: Client, i: Interaction) => {
    if (!i.member) return

    if (i.isSelectMenu()) {
        const component = i.component as MessageSelectMenu
        const allRoles = component.options.map(o => o.value)

        if (i.customId == ComponentId.ROLE_SELECTOR) {
            const addRoles = i.values.filter(v => v !== ComponentId.EMPTY_VALUE)
            const removed = await UserService.removeRole(i.member as GuildMember, ...allRoles)
            const added = await UserService.addRole(i.member as GuildMember, ...addRoles)
            await MessageService.sendInfo(i, `${list(addRoles.map(role))}`, undefined, { ephemeral: true })
        }

        //await i.deferUpdate()
    }

    if (i.isButton()) {

    }

    if (i.isCommand()) {

    }
}