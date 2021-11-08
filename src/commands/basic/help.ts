import { ActionOptions, ActionMeta, CommandOptions, ServerData } from "../../model/types"
import Emoji from '../../constants/Emoji'
import CommandService from '../../service/CommandService'
import MessageService from '../../service/MessageService'
import { actionPerms } from '../../utils/Outputs'
import { Cmd } from "../../model/Arg"
import Command, { Action } from "../../model/Command"
import { truncate } from '../../utils/Strings'

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

export default new Command({
    name: 'help',
    description: 'Show help.',
    aliases: ['?', 'man', 'doc', 'docs', 'cmd', 'command', 'commands'],
    actions: [
        Action({
            name: 'get',
            args: [
                new Cmd('command', 'Name of command.')
            ],
            execute: async ({ command }, meta) => {
                if (command) {    
                    MessageService.sendInfo(meta.msg.channel, await getCommandHelp(command, meta), `Help • ${command.name}`)
                } else {
                    const commands = CommandService.getAll()
                    MessageService.sendInfo(meta.msg.channel, await getHelp(commands, meta), `Help • Administration`)
                }
            },
            description: 'Show general help or command help.',
            examples: [[], ['prefix']]
        })
    ]
})