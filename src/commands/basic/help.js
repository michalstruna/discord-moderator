const Emoji = require('../../constants/Emoji')
const CommandService = require('../../service/CommandService')
const MessageService = require('../../service/MessageService')
const { Command } = require('../../utils/Args')
const { actionPerms } = require('../../utils/Outputs')

const getHelp = async (commands, { server }) => {
    return commands.map(command => `**${command.name}:** ${command.description} ${Emoji.SUCCESS}\n${command.actions.map(a => `> **${a.name}:** ${getActionPattern(server, command, a)} - ${a.description}`).join('\n')}`).join('\n\n')
}

const getActionPattern = (server, command, action) => {
    return `\`${[server.prefix + command.name, ...(action.args || []).map(arg => arg.toString())].join(' ')}\``
}

const getCommandHelp = async (command, { server, msg }) => {
    let result = `**Description:** ${command.description || ''} ${Emoji.SUCCESS}`
    const serverCommand = server.commands.get(command.name)

    if (command.aliases) result += `\n**Aliases:** \`${command.aliases.map(a => `${server.prefix}${a}`).join('`, `')}\``
    result += `\n**Group:** Administration\n\n`

    for (const action of command.actions) {
        result += `**${action.name}:** ${action.description}\nUsage: ${getActionPattern(server, command, action)}\n`

        for (const arg of action.args || []) {
            if (!arg.description) {
                continue
            }

            result += `> \`${arg.name}\` - ${arg.description}${arg.defaultValue ? ` *(default \`${arg.defaultValue.description || args.defaultValue}\`)*` : ''}\n`
        }

        const renderExample = example => `${server.prefix}${[command.name, ...example].join(' ')}`

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

        result += `Can use: ${actionPerms(serverCommand.actions.get(action.name), msg.guild.roles.everyone.id)}\n`
        result += `Limit usage: 1x / 5 s / user\n\n`
    }

    return result
}

module.exports = {
    name: 'help',
    description: 'Show help.',
    aliases: ['?', 'man', 'doc', 'docs', 'cmd', 'command', 'commands'],
    actions: [
        {
            name: 'get',
            args: [
                Command('command', 'Name of command.')
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
        }
    ]
}