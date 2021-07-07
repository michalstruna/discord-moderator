const MessageService = require('../service/MessageService')

exports.execute = async (command, client, msg, args) => {
    try {
        console.log(`command: ${msg.content}`, args)
        await command.execute(client, msg, args)

        if (command.react !== false) {
            MessageService.reactSuccess(msg)
        }
    } catch (error) {
        console.error(error)
        MessageService.reactFail(msg)
        MessageService.sendEmbeddedFail({ title: error.title || 'Something bad happened', description: error.message, color: error.color })
    }
}