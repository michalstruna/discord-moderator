const Regex = require('../utils/Regex')
const MessagesService = require('../service/MessageService')
const { NotFoundError } = require('../utils/Errors')


const help = (client, msg, args, { server: { prefix } }) => `
Simple command for sending hello into chat. Its main purpose is to test if bot is working.

Alliases: *hello*, *hi*

**Send hello** - \`${prefix}hello [@user?] [#channel?]\`
> \`user\` - The user you wants to greet. *(default yourself)*
> \`channel\` - The channel where you want to greet. *(default current channel)*
> 
> **Examples**
> \`${prefix}hello\` - Send hello to current channel to yourself.
> \`${prefix}hi @Michal #general\` - Send hello to general chat to Michal.
`

const renderHelp = (command, ...args) => {
    const [client, msg, cmdArgs, { server: { prefix } }] = args

    let result = ''
    result += `${command.description}\n\n`
    result += `**Alliases**: ${command.names.map(c => `\`${prefix}${c}\``).join(', ')}`
    result += `\n\n`

    const help = command.help ? command.help(...args) : null

    if (help && help.useCases) {
        for (const useCase of help.useCases) {
            result += `**${useCase.name}** - \`${prefix}${useCase.pattern}\`\n`
            
            for (const arg of useCase.args) {
                result += `> \`${prefix}${arg.name}\` - ${arg.description}\n`
            }
    
            result += '> \n'
            result += '> **Examples**\n'
    
            for (const example of useCase.examples) {
                result += `> \`${prefix}${example.pattern}\` - ${example.description}\n`
            }
        }
    }

    return result
}

module.exports = {
    name: 'help',
    description: 'Show help.',
    args: [
        { name: 'commandName', value: Regex.Type.ANY }
    ],
    on: {
        async run(...args) {
            const [client, msg, { commandName }] = args

            if (commandName) {
                const command = client.commands.get(commandName)

                if (!command) {
                    throw new NotFoundError(`Command \`${commandName}\` was not found.`)
                }

                console.log(command)
                MessagesService.sendInfo(msg.channel, renderHelp(command, ...args), `Help • ${command.names[0]}`)
            } else {
                MessagesService.sendInfo(msg.channel, ``, 'Help')
            }
        }        
    }
}