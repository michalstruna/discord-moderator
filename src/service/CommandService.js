const fs = require('fs')
const path = require('path')

const MessageService = require('./MessageService')
const UserService = require('./UserService')
const ServerService = require('./ServerService')
const { InvalidInputError, UnauthorizedError } = require('../utils/Errors')

const commands = new Map()
const aliases = new Map()

exports.load = () => {
    commands.clear()
    aliases.clear()

    const categories = fs.readdirSync(path.join(__dirname, '..', 'commands'))

    for (const category of categories) {
        const files = fs.readdirSync(path.join(__dirname, '..', 'commands', category))

        for (const file of files) {
            const command = require(`../commands/${category}/${file}`)
            command.category = category
            commands.set(command.name, command)
        
            for (const alias of command.aliases || []) {
                aliases.set(alias, command.name)
            }
        }
    }
}

exports.getByAlias = alias => {
    return commands.get(aliases.get(alias) || alias)
}

const initialize = async (client, server) => {
    const serverCommands = JSON.parse(JSON.stringify(server.commands))

    for (const [name, command] of commands) {
        let serverCommand = serverCommands[name]

        if (!serverCommand) {
            serverCommand = serverCommands[name] = { actions: {} }
        }

        for (const actionName in command.actions) {
            let serverAction = serverCommand.actions[actionName]

            if (!serverAction) {
                serverCommand.actions[actionName] = { roles: [] } // TODO: Roles.
            }
        }
    }

    await ServerService.updateById(server.id, { commands: serverCommands })
}

const checkPerms = async (client, command, actionName, msg, server) => {
    const commandData = server.commands[command.name[0]]

    if (!commandData || !commandData.actions[actionName]) {
        await initialize(client, server)
    }

    if (server.roles) {
        MessageService.sendInfo(msg.channel, `You didn't specify command permissions, so everyone can use all commands. For more help type \`${server.prefix}help perms\`.`)
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
        if (command.actions[flag]) {
            await checkPerms(client, command, flag, msg, server)
            return await command.actions[flag].execute(...args)
        }
    }

    if (!command.actions.run) {
        throw new InvalidInputError(`You need to specify action. Possible actions are: ${Object.keys(command.actions).map(f => `\`-${f}\``).join(',')}.`)
    }

    await checkPerms(client, command, 'run', msg, server)
    return await command.actions.run.execute(...args)
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