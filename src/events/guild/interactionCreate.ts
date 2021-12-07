import { Client, GuildMember, Interaction, MessageSelectMenu } from 'discord.js'

import ComponentId from '../../constants/ComponentId'
import Io from '../../service/Io'
import UserService from '../../service/UserService'
import { subtract } from '../../utils/Collections'
import { role } from '../../utils/Outputs'

export default async (client: Client, i: Interaction) => {
    if (!i.member) return

    if (i.isSelectMenu()) {
        const component = i.component as MessageSelectMenu
        const allRoles = component.options.map(o => o.value)

        if (i.customId == ComponentId.ROLE_SELECTOR) {
            const addRoles = i.values.filter(v => v !== ComponentId.EMPTY_VALUE)
            const removed = await UserService.removeRole(i.member as GuildMember, ...allRoles)
            const added = await UserService.addRole(i.member as GuildMember, ...addRoles)
            const uniqueRemoved = subtract(removed, added)
            const uniqueAdded = subtract(added, removed)

            const changes = []
            if (uniqueRemoved.length > 0) changes.push(`Removed: ${role(uniqueRemoved)}.`)
            if (uniqueAdded.length > 0) changes.push(`Added: ${role(uniqueAdded)}.`)
            if (changes.length === 0) changes.push('No changes.')
            await Io.embed(i, { description: changes.join('\n'), theme: Io.Theme.INFO }, { ephemeral: true })
        }

        //await i.deferUpdate()
    }

    if (i.isButton()) {

    }

    if (i.isCommand()) {

    }
}