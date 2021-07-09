const Regex = require('../utils/Regex')
const MessagesService = require('../service/MessageService')
const CommandService = require('../service/CommandService')
const { NotFoundError } = require('../utils/Errors')

module.exports = {
    name: 'help',
    description: 'Show help.',
    args: [
        { name: 'commandName', value: Regex.Type.ANY }
    ],
    on: {
        async run(client, msg, { commandName, ...args }) {
            if (commandName) {
                const command = CommandService.getByName(commandName)

                if (!command.help) {
                    throw new NotFoundError(`Manual of \`${commandName}\` was not found.`)
                }

                MessagesService.sendInfo(msg.channel, command.help, `Help • ${commandName}`)
            } else {
                MessagesService.sendInfo(msg.channel, ``, 'Help')
            }
        }        
    }
}