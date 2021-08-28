const Pattern = require('../../constants/Pattern')
const CommandService = require('../../service/CommandService')
const MessageService = require('../../service/MessageService')
const { InvalidInputError } = require('../../utils/Errors')

const getCommandHelp = async (command, { server }) => {
    let result = `**Description:** ${command.description || ''}
                  **Aliases:** \`${command.aliases.map(a => `${server.prefix}${a}`).join('`, `')}\`
                  **Group:** Administration\n\n` // TODO: Group, Cooldown.

    for (const action of command.actions) {
        result += `**${action.description.replace(/\.$/, '')}:** \`${server.prefix}${action.pattern}\`\n`

        for (const arg of action.args || []) {
            result += `> \`${arg.name}\` - ${arg.description}\n`
        }

        result += `Examples: \`${action.examples.map(e => `${server.prefix}${e}`).join('`, `')}\`\n`
        result += `Limit usage: 1x per 5 s\n\n`
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
            description: 'Set new prefix.',
            pattern: 'help [command]',
            examples: ['help prefix']
        }
    ]
}