const Regex = require('../utils/Regex')
const MessagesService = require('../service/MessageService')
const CommandService = require('../service/CommandService')

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
                MessagesService.sendInfo(msg.channel, command.help, `Help • ${commandName}`)
            } else {
                MessagesService.sendInfo(msg.channel, ``, 'Help')
            }
        }        
    }
}