const MessageService = require('../service/MessageService')
const { InvalidInputError } = require('../utils/Errors')

const processCommandBranch = async (fun, args, msg) => {
    const result = await fun(...args)

    if (result) {
        result && MessageService.sendEmbeddedSuccess(msg.channel, result)
    }
}

const run = async (...args) => {
    const [command, client, msg, { flags }, meta] = args

    for (const flag of flags) {
        if (command.on[flag]) {
            processCommandBranch(command.on[flag], args, msg)
            return
        }
    }

    if (!command.on.run) {
        throw new InvalidInputError(`You need to specify action. Possible actions are: ${Object.keys(flags).map(f => `\`-${f}\``).join(',')}.`)
    }

    processCommandBranch(command.on.run, args, msg)
}

exports.execute = async (command, client, msg, args, meta) => {
    try {
        console.log(`command: ${msg.content}`, args)
        const parsedArgs = MessageService.parseArgs(args, command.args)
        await run(command, client, msg, parsedArgs, meta)

        if (command.react !== false) {
            MessageService.reactSuccess(msg)
        }
    } catch (error) {
        console.error(error)
        MessageService.reactFail(msg)
        MessageService.sendEmbeddedFail(msg.channel, error.title || 'Something bad happened', error.message, error.color)
    }
}