const fs = require('fs')
const path = require('path')

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
            errors.push(error)
        }
    }
    
    throw errors[0]
}

exports.execute = async (command, client, msg, args, meta) => {
    try {
        console.log(`command: ${msg.content}`, args)
        const [action, parsedArgs] = await findAction(command.actions, args, meta)
        // TODO: Check perms
        await action.execute(client, msg, parsedArgs, meta)

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