import Command, { Action } from '../../model/Command'
import RoleType from '../../constants/RoleType'
import { Text, List, Role, Int } from '../../model/Arg'
import MessageService from '../../service/MessageService'
import CommandCategory from '../../constants/CommandCategory'
import { MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from 'discord.js'
import ComponentId from '../../constants/ComponentId'

// TODO: Try catch. 

export default new Command({
    name: 'role-selector',
    category: CommandCategory.ADMINISTRATION,
    description: 'Manage roles selector.',
    actions: [
        Action({
            name: 'create',
            args: [
                new List('roles', 'List of roles for selectbox.', new Role()).explicit().req(),
                new Int('max', 'Max number of roles.').min(1).max(25).default(25),
                new Text('placeholder', 'Placeholder for selectbox.').explicit().multi(),
                new Text('empty', 'Label for empty option.').explicit().multi(),
                ...MessageService.getEchoArgs()
            ],
            auth: { permit: [RoleType.ADMIN] },
            execute: async ({ roles, max, placeholder, empty, ...message }, meta) => {
                const config = {
                    roles: roles.map(r => r.id)
                }

                const options: MessageSelectOptionData[] = roles.map(r => ({ label: r.name, value: r.id }))
                if (empty) options.unshift({ label: empty, value: '' })

                MessageService.echo({
                    ...message,
                    components: [
                        new MessageActionRow().addComponents(
                            new MessageSelectMenu()
                                .setCustomId(ComponentId.ROLE_SELECTOR + '__' + JSON.stringify(config))
                                .setMaxValues(Math.min(max, roles.length))
                                .setPlaceholder(placeholder)
                                .addOptions(options)
                            )
                    ]
                }, meta)
            },
            description: 'Create new collector.',
            examples: [['']] // TODO    
        })
    ]
})