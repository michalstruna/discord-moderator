import Command, { Action } from '../../model/Command'
import RoleType from '../../constants/RoleType'
import { Text, List, Role, Int } from '../../model/Arg'
import Io from '../../service/Io'
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
                new List('emojis', 'List of icons for roles.', new Text()).explicit().default([]),
                new Int('max', 'Max number of roles.').min(1).max(25).default(25),
                new Text('placeholder', 'Placeholder for selectbox.').explicit().multi(),
                new Text('empty', 'Label for empty option.').explicit().multi(),
                ...Io.getEchoArgs()
            ],
            auth: { permit: [RoleType.ADMIN] },
            execute: async ({ roles, emojis, max, placeholder, empty, ...message }, meta) => {
                const options: MessageSelectOptionData[] = roles.map((r, i) => ({ label: r.name, value: r.id, emoji: emojis[i]}))
                if (empty) options.unshift({ label: empty, value: ComponentId.EMPTY_VALUE })

                Io.echo({
                    ...message,
                    components: [
                        new MessageActionRow().addComponents(
                            new MessageSelectMenu()
                                .setCustomId(ComponentId.ROLE_SELECTOR)
                                .setMaxValues(Math.min(max, roles.length))
                                .setPlaceholder(placeholder)
                                .addOptions(options)
                            )
                    ]
                }, meta)
            },
            description: 'Create role collector.',
            examples: [['Select gender.', '--roles Female Male Other']]
        })
    ]
})