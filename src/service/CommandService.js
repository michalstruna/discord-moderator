const MessageService = require('../service/MessageService')

exports.execute = async (command, client, msg, args, metadata) => {
    try {
        console.log(`command: ${msg.content}`, args)
        const parsedArgs = MessageService.parseArgs(args, command.args)
        await command.execute(client, msg, parsedArgs, metadata)

        if (command.react !== false) {
            MessageService.reactSuccess(msg)
        }
    } catch (error) {
        console.error(error)
        MessageService.reactFail(msg)
        MessageService.sendEmbeddedFail(msg.channel, error.title || 'Something bad happened', error.message, error.color)
    }
}

exports.create = async (name, description, { args, onRun, onGet, onSet, onRemove, onEnd }) => {
    // { name: 'remove', value: '--rm' }
}