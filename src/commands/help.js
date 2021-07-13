const Regex = require('../utils/Regex')
const MessagesService = require('../service/MessageService')
const UserService = require('../service/UserService')
const CommandService = require('../service/CommandService')
const { NotFoundError } = require('../utils/Errors')
const Role = require('../constants/Role')

const renderHelp = (command, ...args) => {
    const [client, msg, cmdArgs, { server: { prefix, commands } }] = args
    const { name, description, actions } = command
    const commandData = commands.get(name[0])

    let result = ''
    result += `${description}\n\n`
    result += `**Aliases**: ${name.map(c => `\`${prefix}${c}\``).join(', ')}`
    result += `\n`

    for (const key in actions) {
        const { doc } = actions[key]

        if (!doc) {
            continue
        }

        const actionData = commandData.actions.get(key)
        result += `\n**${doc.name}** (\`${prefix}${doc.pattern}\`)\n`
        
        for (const arg of doc.args || []) {
            result += `> \`${prefix}${arg.name}\` - ${arg.description}${arg.default ? ` (default ${arg.default})` : ''}\n`
        }

        result += '> \n'
        result += '> **Examples**\n'

        for (const example of doc.examples || []) {
            result += `> \`${prefix}${example.pattern}\` - ${example.description}\n`
        }

        result += '> \n'
        result += `> **Required role**: ${actionData.roles.length > 0 ? UserService.rolesToString(actionData.roles) : '@everyone'}\n`
    }

    return result
}

module.exports = {
    name: ['help', 'h', '?', 'man'],
    description: 'Show help.',
    args: [
        { name: 'commandName', value: Regex.Type.ANY }
    ],
    actions: {
        run: {
            execute: async (...args) => {
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
            },
            perms: Role.MEMBER
        }
    }
}