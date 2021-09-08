const fs = require('fs')
const path = require('path')
const { InvalidInputError } = require('../utils/Errors')

const MessageService = require('./MessageService')

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

const findAction = (actions, argsSet) => {
    const errors = []

    for (const action of actions) {
        try {
            return [action, argsSet.test(action.args)]
        } catch (error) {
            errors.push(error)
        }
    }

    throw errors[0]
}

exports.execute = async (command, argsSet, meta) => {
    try {
        console.log(`command: ${meta.msg.content}`, argsSet)
        const [action, testedArgsSet] = findAction(command.actions, argsSet)
        const parsedArgs = await testedArgsSet.parse(meta)
        await action.execute(parsedArgs, meta) // TODO: Check perms.

        if (action.react !== false) { // TODO: If --delete arg, delete message.
            MessageService.reactSuccess(meta.msg)
        }
    } catch (error) {
        console.error(error)
        MessageService.reactFail(meta.msg)
        const errTitle = error.title === undefined ? 'Something bad happened' : error.title
        MessageService.sendFail(meta.msg.channel, error.message, errTitle, error.color)
    }
}