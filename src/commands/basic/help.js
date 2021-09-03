const Emoji = require('../../constants/Emoji')
const Pattern = require('../../constants/Pattern')
const CommandService = require('../../service/CommandService')
const MessageService = require('../../service/MessageService')
const { InvalidInputError } = require('../../utils/Errors')

const getHelp = async (commands, { server }) => {
    return commands.map(command => `**${command.name}:** ${command.description} ${Emoji.SUCCESS}\n${command.actions.map(a => `> \`${server.prefix}${a.pattern}\` - ${a.description}`).join('\n')}`).join('\n\n')
}

const getCommandHelp = async (command, { server }) => {
    let result = `**Description:** ${command.description || ''} ${Emoji.SUCCESS}
                  **Aliases:** \`${command.aliases.map(a => `${server.prefix}${a}`).join('`, `')}\`
                  **Group:** Administration\n\n` // TODO: Group, Cooldown.

    for (const action of command.actions) {
        result += `**${action.description.replace(/\.$/, '')}:** \`${server.prefix}${action.pattern}\`\n`

        for (const arg of action.args || []) {
            if (!arg.description) {
                continue
            }

            result += `> \`${arg.name}\` - ${arg.description}\n`
        }

        if (action.examples?.length) {
            result += `Examples: \`${action.examples.map(e => `${server.prefix}${e}`).join('`, `')}\`\n`
        }

        result += `Can use: <@&851746742742679604>, <@&852186757890048060>\n`
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
            pattern: 'help [command]',
            examples: ['help prefix']
        },
        {
            execute: async (client, msg, args, meta) => {
                const commands = await CommandService.getAll()
                MessageService.sendInfo(msg.channel, await getHelp(commands, meta), `Help • Administration`)
            },
            description: 'Show general help.',
            pattern: 'help'
        }
    ]
}