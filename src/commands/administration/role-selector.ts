import Command, { Action } from '../../model/Command'
import RoleType from '../../constants/RoleType'
import { Text, List, Role, Int, Channel, Message, Switch } from '../../model/Arg'
import Io from '../../service/Io'
import CommandCategory from '../../constants/CommandCategory'
import { MessageActionRow, MessageSelectMenu, MessageSelectMenuOptions, MessageSelectOptionData } from 'discord.js'
import ComponentId from '../../constants/ComponentId'
import Config from '../../constants/Config'

// TODO: Try catch. 

export default new Command({
    name: 'role-selector',
    category: CommandCategory.ADMINISTRATION,
    description: 'Manage roles selector.',
    actions: [
        Action({
            name: 'source',
            args: [
                new Channel('channel').default(Channel.CURRENT),
                new Message('message', 'Command action.').req()
            ],
            auth: { permit: [RoleType.ADMIN] },
            execute: async ({ message }, { msg, server }) => {
                const { content, components, embeds } = Io.source(message)
                const result = [`${server.prefix}role-selector`, `${Config.SWITCH_PREFIX}channel ${message.channel}`]
                if (content) result.push(`${Config.SWITCH_PREFIX}description ${content}`)
                if (embeds?.[0]) result.push(...Object.entries(Io.unbuildEmbed(embeds[0])).map(([k, v]) => `${Config.SWITCH_PREFIX}${k} ${v}`))
                const select = (components?.[0] as MessageActionRow).components?.[0] as MessageSelectMenuOptions

                if (select?.type === 'SELECT_MENU' && select.options?.[0]) {
                    if (select.placeholder) result.push(`${Config.SWITCH_PREFIX}placeholder ${select.placeholder}`)
                    const [empty, ...values] = select.options
                    const hasEmpty = empty.value === ComponentId.EMPTY_VALUE
                    if (!hasEmpty) values.unshift(empty)
                    if (hasEmpty) result.push(`${Config.SWITCH_PREFIX}fixed`)
                    if (select.maxValues) result.push(`${Config.SWITCH_PREFIX}max ${select.maxValues}`)
                    result.push(`${Config.SWITCH_PREFIX}roles ${values.map(v => v.label).join(' ')}`)
                    let hasEmojis = false

                    const emojis = select.options.map(v => {
                        if (v.emoji) hasEmojis = true
                        return (v.emoji as any)?.name
                    })

                    if (hasEmojis) result.push(`${Config.SWITCH_PREFIX}emojis ${emojis.join(' ')}`)
                }

                Io.info(msg.channel, '```\n' + result.join(' ') + '\n```')
            }
        }),
        Action({
            name: 'create',
            args: [
                new List('roles', 'List of roles for selectbox.', new Role()).explicit().req(),
                new List('emojis', 'List of icons for roles.', new Text()).explicit().default([]),
                new Int('max', 'Max number of roles.').min(1).max(25).default(25),
                new Text('placeholder', 'Placeholder for selectbox.').explicit().multi(),
                new Switch('fixed', 'Role can\'t be changed.'),
                ...Io.getEchoArgs()
            ],
            auth: { permit: [RoleType.ADMIN] },
            execute: async ({ roles, emojis, max, placeholder, ...message }, meta) => {
                const options: MessageSelectOptionData[] = roles.map((r, i) => ({ label: r.name, value: r.id, emoji: emojis[i]}))
                options.unshift({ label: '___', value: ComponentId.EMPTY_VALUE })
                
                Io.echo({
                    ...message,
                    components: [
                        new MessageActionRow().addComponents(
                            new MessageSelectMenu()
                                .setCustomId(ComponentId.ROLE_SELECTOR)
                                .setMaxValues(Math.min(max, roles.length))
                                .setPlaceholder(placeholder || '')
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