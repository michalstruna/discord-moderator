const MessageService = require('../service/MessageService')
const { InvalidInputError, NotFoundError } = require('../utils/Errors')

const run = async (command, ...args) => {
    const [client, msg, { flags }, meta] = args

    for (const flag in flags) {
        if (command.on[flag]) {
            return await command.on[flag](...args)
        }
    }

    if (!command.on.run) {
        throw new InvalidInputError(`You need to specify action. Possible actions are: ${Object.keys(command.on).map(f => `\`-${f}\``).join(',')}.`)
    }

    return await command.on.run(...args)
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
        const errTitle = error.title === undefined ? 'Something bad happened' : error.title
        MessageService.sendFail(msg.channel, error.message, errTitle, error.color)
    }
}

exports.getByName = name => {
    try {
        return require(`../commands/${name}.js`)
    } catch {
        throw new NotFoundError(`Command \`${name}\` was not found.`)
    }
}