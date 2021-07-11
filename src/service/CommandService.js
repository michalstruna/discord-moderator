const MessageService = require('./MessageService')
const UserService = require('./UserService')
const { InvalidInputError, NotFoundError, UnauthorizedError } = require('../utils/Errors')

const checkPerms = (command, actionName, member, server) => {
    if (!server.commands || !server.commands[command.name] || !server.commands[command.name].actions[actionName]) {
        throw new UnauthorizedError(`You need to specify admin and mod roles using \`${server.prefix}perms @Admin @Mod\` command.`)
    }

    const reqRoles = server.commands[command.name].actions[actionName].roles

    if (reqRoles.length > 0 && !UserService.hasRole(member, ...reqRoles)) {
        throw new UnauthorizedError(`You need to be ${UserService.rolesToString(reqRoles)}`)
    }
}

const run = async (command, ...args) => {
    const [client, msg, { flags }, { server }] = args

    for (const flag in flags) {
        if (command.on[flag]) {
            checkPerms(command, flag, msg.member, server)
            return await command.on[flag](...args)
        }
    }

    if (!command.on.run) {
        throw new InvalidInputError(`You need to specify action. Possible actions are: ${Object.keys(command.on).map(f => `\`-${f}\``).join(',')}.`)
    }

    checkPerms(command, 'run', msg.member, server)
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