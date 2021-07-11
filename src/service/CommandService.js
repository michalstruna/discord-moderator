const MessageService = require('./MessageService')
const UserService = require('./UserService')
const { InvalidInputError, NotFoundError, UnauthorizedError } = require('../utils/Errors')

const checkPerms = (command, actionName, msg, server) => {
    const commandData = server.commands[command.name]

    if (!commandData || commandData[actionName] || commandData[actionName].roles === 0) {
        MessageService.sendInfo(msg.channel, `You didn't specity command permissions, so everyone can use all commands. For more help type \`${server.prefix}help perms\`.`)
        return
    }

    const reqRoles = commandData.actions[actionName].roles

    if (reqRoles.length > 0 && !UserService.hasRole(msg.member, ...reqRoles)) {
        throw new UnauthorizedError(`You need to be ${UserService.rolesToString(reqRoles)}`)
    }
}

const run = async (command, ...args) => {
    const [client, msg, { flags }, { server }] = args

    for (const flag in flags) {
        if (command.on[flag]) {
            checkPerms(command, flag, msg, server)
            return await command.on[flag](...args)
        }
    }

    if (!command.on.run) {
        throw new InvalidInputError(`You need to specify action. Possible actions are: ${Object.keys(command.on).map(f => `\`-${f}\``).join(',')}.`)
    }

    checkPerms(command, 'run', msg, server)
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