const Regex = require('../utils/Regex')
const MessagesService = require('../service/MessageService')
const UserService = require('../service/UserService')
const CommandService = require('../service/CommandService')
const { NotFoundError } = require('../utils/Errors')

const renderHelp = (command, ...args) => {
    const [client, msg, cmdArgs, { server: { prefix, commands } }] = args
    const commandData = commands.get(command.name[0])

    let result = ''
    result += `${command.description}\n\n`
    result += `**Aliases**: ${command.name.map(c => `\`${prefix}${c}\``).join(', ')}`
    result += `\n`

    const help = command.help ? command.help(...args) : null

    if (help && help.actions) {
        for (const action of help.actions) {
            const actionData = commandData.actions.get(action.key)

            result += `\n**${action.name}** (\`${prefix}${action.pattern}\`)\n`
            
            for (const arg of action.args) {
                result += `> \`${prefix}${arg.name}\` - ${arg.description}${arg.default ? ` (default ${arg.default})` : ''}\n`
            }
    
            result += '> \n'
            result += '> **Examples**\n'
    
            for (const example of action.examples) {
                result += `> \`${prefix}${example.pattern}\` - ${example.description}\n`
            }

            result += '> \n'
            result += `> **Required role**: ${actionData.roles.length > 0 ? UserService.rolesToString(actionData.roles) : '@everyone'}\n`
        }
    }

    return result
}

module.exports = {
    name: ['help', 'h', '?', 'man'],
    description: 'Show help.',
    args: [
        { name: 'commandName', value: Regex.Type.ANY }
    ],
    on: {
        async run(...args) {
            const [client, msg, { commandName }] = args

            if (commandName) {
                const command = CommandService.getByAlias(commandName)

                if (!command) {
                    throw new NotFoundError(`Command \`${commandName}\` was not found.`)
                }

                MessagesService.sendInfo(msg.channel, renderHelp(command, ...args), `Help • ${command.name[0]}`)
            } else {
                MessagesService.sendInfo(msg.channel, ``, 'Help')
            }
        }        
    }
}