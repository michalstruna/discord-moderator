import { ActionOptions, ActionMeta, CommandOptions, ServerData } from "../../model/types"
import Emoji from '../../constants/Emoji'
import CommandService from '../../service/CommandService'
import MessageService from '../../service/MessageService'
import { actionPerms } from '../../utils/Outputs'
import { Text } from "../../model/Arg"
import Command, { Action } from "../../model/Command"
import { truncate } from '../../utils/Strings'
import CommandCategory from '../../constants/CommandCategory'
import { InvalidInputError } from '../../model/Error'

const getHelp = async (commands: CommandOptions[], { server }: ActionMeta) => {
    return commands.map(command => `**${command.name}:** ${command.description} ${Emoji.SUCCESS}\n${command.actions.map(a => `> **${a.name}:** ${truncate(getActionPattern(server, command, a), 100, '...`')} - ${a.description}`).join('\n')}`).join('\n\n')
}

const getActionPattern = (server: ServerData, command: CommandOptions, action: ActionOptions) => {
    return `\`${[server.prefix + command.name, ...(action.args || []).map(arg => arg.toString())].join(' ')}\``
}

const getCommandHelp = async (command: CommandOptions, { server, msg }: ActionMeta) => {
    let result = `**Description:** ${command.description || ''} ${Emoji.SUCCESS}`
    const serverCommand = server.commands[command.name]

    if (command.aliases) result += `\n**Aliases:** \`${command.aliases.map(a => `${server.prefix}${a}`).join('`, `')}\``
    result += `\n**Group:** Administration\n\n`

    for (const action of command.actions) {
        result += `**${action.name}:** ${action.description}\nUsage: ${getActionPattern(server, command, action)}\n`

        for (const arg of action.args || []) {
            if (!arg.getDescription()) continue
            result += `> \`${arg.getName()}\` - ${arg.getDescription()}${arg.getDefault() ? ` *(default \`${arg.getDefault().toString?.() ?? arg.getDefault()}\`)*` : ''}\n`
        }

        const renderExample = (example: string[]) => `${server.prefix}${[command.name, ...example].join(' ')}`

        if (action.examples?.length) {
            if (action.examples.length === 1) {
                result += `Example: \`${renderExample(action.examples[0])}\`\n`
            } else {
                result += `Examples:\n`

                for (const example of action.examples) {
                    result += `> \`${renderExample(example)}\`\n`
                }
            }
        }

        result += `Can use: ${actionPerms(serverCommand.actions[action.name], msg.guild!.roles.everyone.id)}\n`
        result += `Limit usage: 1x / 5 s / user\n\n`
    }

    return result
}

enum Level {
    COMMAND,
    CATEGORY
}

const COMMAND_PAGE_SIZE = 1

export default new Command({
    name: 'help',
    category: CommandCategory.BASIC,
    description: 'Show help.',
    aliases: ['?', 'man', 'doc', 'docs', 'cmd', 'command', 'commands'],
    actions: [
        Action({
            name: 'get',
            args: [
                new Text('item', 'Name of command or category.')
            ],
            execute: async ({ item }, meta) => {
                const isCommand = !!CommandService.getByName(item)
                const isCategory = CommandService.getAllCategories().map(c => c.toLowerCase()).includes(item)
                if (item && !isCommand && !isCategory) throw new InvalidInputError(`Unrecognized command or category \`${item}\`.`)

                MessageService.pages(meta.msg.channel, async ({ level, item }) => {
                    switch (level) {
                        case Level.COMMAND:
                            const command = CommandService.getByName(item)!

                            return {
                                title: `Help • ${item}`,
                                description: await getCommandHelp(command, meta),
                                theme: MessageService.Theme.INFO,
                                buttons: [
                                    { label: 'Back to ' + command.category, target: { level: Level.CATEGORY, item: command.category } }
                                ]
                            }
                        default:
                            const categories = CommandService.getAllCategories()
                            const commands = CommandService.getAllByCategory(item as CommandCategory)
    
                            return {
                                title: `Help • ${item}`,
                                description: await getHelp(commands, meta),
                                theme: MessageService.Theme.INFO,
                                buttons: categories.map(c => ({ label: c, target: { level: Level.CATEGORY, item: c } })),
                                selects: [{
                                    placeholder: 'Select command',
                                    options: commands.map(c => ({
                                        label: c.name,
                                        description: c.description,
                                        target: { level: Level.COMMAND, item: c.name }
                                    }))
                                }]
                            }
                    }
                }, {
                    defaultPage: isCommand ? { level: Level.COMMAND, item } : { level: Level.CATEGORY, item: item || CommandCategory.BASIC },
                    users: [meta.msg.author.id]
                })
            },
            description: 'Show general help or command help.',
            examples: [[], ['prefix']]
        })
    ]
})