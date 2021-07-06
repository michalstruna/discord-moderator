const MessageService = require('../service/MessageService')

exports.execute = async (command, client, msg, args) => {
    try {
        console.log(`command: ${msg.content}`, args)
        await command.execute(client, msg, args)

        if (command.react !== false) {
            MessageService.react(msg, MessageService.Emoji.SUCCESS)
        }
    } catch (error) {
        console.error(error)
        MessageService.react(msg, MessageService.Emoji.FAIL)
    }
}