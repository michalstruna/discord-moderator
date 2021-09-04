const Emoji = require('../../constants/Emoji')
const { Flag } = require('../../constants/Pattern')
const Pattern = require('../../constants/Pattern')
const CommandService = require('../../service/CommandService')
const MessageService = require('../../service/MessageService')
const { InvalidInputError } = require('../../utils/Errors')
const { role } = require('../../utils/Outputs')

const getHelp = async (commands, { server }) => {
    return commands.map(command => `**${command.name}:** ${command.description} ${Emoji.SUCCESS}\n${command.actions.map(a => `> ${getActionPattern(server, command, a)} - ${a.description}`).join('\n')}`).join('\n\n')
}

const getActionPattern = (server, command, action) => {
    let result = [server.prefix + command.name]

    for (const arg of action.args || []) {
        let tmp = `${arg.name}${arg.required ? '' : '?'}`
        if (arg.pattern.prefix) tmp = arg.pattern.prefix[0] + tmp
        if (!(arg.pattern instanceof Flag)) tmp = `[${tmp}]`
        result.push(tmp)
    }

    return `\`${result.join(' ')}\``
}

const getCommandHelp = async (command, { server, msg }) => {
    let result = `**Description:** ${command.description || ''} ${Emoji.SUCCESS}`

    if (command.aliases) result += `\n**Aliases:** \`${command.aliases.map(a => `${server.prefix}${a}`).join('`, `')}\``
    result += `\n**Group:** Administration\n\n`

    for (const action of command.actions) {
        result += `**${action.description.replace(/\.$/, '')}:** ${getActionPattern(server, command, action)}\n`

        for (const arg of action.args || []) {
            if (!arg.description) {
                continue
            }

            result += `> \`${arg.name}\` - ${arg.description}\n`
        }

        if (action.examples?.length) {
            result += `Examples: \`${action.examples.map(e => `${server.prefix}${[command.name, ...e].join(' ')}`).join('`, `')}\`\n`
        }

        result += `Can use: ${action.roles && action.roles.length > 0 ? action.roles.map(r => role(server.roles.get(r))).join(', ') : msg.guild.roles.everyone}\n`
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
            name: 'command',
            args: [
                { name: 'command', pattern: Pattern.ANY, required: true, description: 'Name of command.' }
            ],
            execute: async (client, msg, { command: commandName }, meta) => {
                const command = await CommandService.getByName(commandName)

                if (!command) {
                    throw new InvalidInputError(`Command \`${commandName}\` was not found.`)
                }

                MessageService.sendInfo(msg.channel, await getCommandHelp(command, meta), `Help • ${command.name}`)
            },
            description: 'Show command help.',
            examples: [['prefix']]
        },
        {
            name: 'general',
            execute: async (client, msg, args, meta) => {
                const commands = await CommandService.getAll()
                MessageService.sendInfo(msg.channel, await getHelp(commands, meta), `Help • Administration`)
            },
            description: 'Show general help.'
        }
    ]
}