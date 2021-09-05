const fs = require('fs')
const path = require('path')
const { MissingPermissionsError, InvalidInputError } = require('../utils/Errors')

const MessageService = require('./MessageService')
const UserService = require('./UserService')
const { role, list } = require('../utils/Outputs')

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

exports.exportAll = (roles, guild) => {
    const result = {}

    commands.forEach(command => {
        const actions = {}

        command.actions.forEach(action => {
            actions[action.name] = {
                perms: {
                    allowRolesDefault: action.allowRoles ? action.allowRoles.map(r => roles[r]) : [guild.roles.everyone.id],
                    forbidRolesDefault: action.forbidRoles ? action.forbidRoles.map(r => roles[r]) : []
                }
            }
        })

        result[command.name] = { actions }
    })

    return result
}

exports.getByName = name => {
    return commands.get(aliases.get(name) || name)
}

exports.getAll = () => {
    return Array.from(commands.values())
}

const findAction = async (actions, args, meta) => {
    const errors = []

    for (const action of actions) {
        try {
            const parsedArgs = await MessageService.parseArgs(args, action.args, meta) // TODO: Separe find action (seq) and parse args (async)?
            return [action, parsedArgs]
        } catch (error) {
            if (!(error instanceof InvalidInputError)) {
                throw error
            }

            errors.push(error)
        }
    }
    
    throw errors[0]
}

exports.execute = async (command, client, msg, args, meta) => {
    try {
        console.log(`command: ${msg.content}`, args)
        const [action, parsedArgs] = await findAction(command.actions, args, meta)
        //const perms = meta.server.commands.get(command.name).actions.get(action.name).perms
        const reqRoles = []

        if (true || UserService.hasRole(msg.member, ...reqRoles)) {
            await action.execute(client, msg, parsedArgs, meta)
        } else {
            throw new MissingPermissionsError(`${msg.member} needs to be ${list(reqRoles.map(role))}.`)
        }

        if (action.react !== false) {
            MessageService.reactSuccess(msg)
        }
    } catch (error) {
        console.error(error)
        MessageService.reactFail(msg)
        const errTitle = error.title === undefined ? 'Something bad happened' : error.title
        MessageService.sendFail(msg.channel, error.message, errTitle, error.color)
    }
}