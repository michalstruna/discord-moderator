const Emoji = require('../../constants/Emoji')
const { Flag, Rest } = require('../../constants/Pattern')
const Pattern = require('../../constants/Pattern')
const CommandService = require('../../service/CommandService')
const MessageService = require('../../service/MessageService')
const { InvalidInputError } = require('../../utils/Errors')
const { actionPerms } = require('../../utils/Outputs')

const getHelp = async (commands, { server }) => {
    return commands.map(command => `**${command.name}:** ${command.description} ${Emoji.SUCCESS}\n${command.actions.map(a => `> **${a.name}:** ${getActionPattern(server, command, a)} - ${a.description}`).join('\n')}`).join('\n\n')
}

const getActionPattern = (server, command, action) => {
    let result = [server.prefix + command.name]

    for (const arg of action.args || []) {
        let tmp = `${arg.name}${arg.required ? '' : '?'}`
        if (arg.pattern.prefix) tmp = arg.pattern.prefix[0] + tmp
        if (arg.pattern instanceof Flag) tmp = `-${tmp}`
        if (arg.pattern instanceof Rest) tmp = `...${tmp}`
        if (!(arg.pattern instanceof Flag)) tmp = `[${tmp}]`
        result.push(tmp)
    }

    return `\`${result.join(' ')}\``
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

            result += `> \`${arg.name}\` - ${arg.description}\n`
        }

        if (action.examples?.length) {
            result += `Examples: \`${action.examples.map(e => `${server.prefix}${[command.name, ...e].join(' ')}`).join('`, `')}\`\n`
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
                { name: 'command', pattern: Pattern.COMMAND, required: false, description: 'Name of command.' }
            ],
            execute: async (client, msg, { command }, meta) => {
                if (command) {    
                    MessageService.sendInfo(msg.channel, await getCommandHelp(command, meta), `Help • ${command.name}`)
                } else {
                    const commands = await CommandService.getAll()
                    MessageService.sendInfo(msg.channel, await getHelp(commands, meta), `Help • Administration`)
                }
            },
            description: 'Show general help or command help.',
            examples: [[], ['prefix']]
        }
    ]
}