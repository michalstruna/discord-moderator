const Color = require('../constants/Color')
const Emoji = require('../constants/Emoji')
const { InvalidInputError } = require('../utils/Errors')

const Theme = exports.Theme = {
    SUCCESS: [Color.GREEN, Emoji.SUCCESS],
    FAIL: [Color.RED, Emoji.FAIL],
    INFO: [Color.BLUE, Emoji.INFO]
}

const react = exports.react = (msg, emoji) => msg.react(emoji)
const reactSuccess = exports.reactSuccess = msg => exports.react(msg, Emoji.SUCCESS)
const reactFail = exports.reactFail = msg => exports.react(msg, Emoji.FAIL)

const send = exports.send = (channel, data = {}, [color, emoji] = Theme.INFO) => {
    const embed = { ...data, color: data.color || color }

    if (embed.title) {
        embed.title = emoji + ' ' + embed.title
    } else {
        embed.description = emoji + ' ' + embed.description
    }

    channel.send({ embed })
}

exports.sendSuccess = (channel, description, title, color) => send(channel, { description, title, color }, Theme.SUCCESS)
exports.sendFail = (channel, description, title, color) => send(channel, { description, title, color }, Theme.FAIL)
exports.sendInfo = (channel, description, title, color) => send(channel, { description, title, color })

exports.parseCommand = (text, prefix) => {
    const prefixRegex = new RegExp(`^\\${prefix} *`)
    const args = text.trim().replace(prefixRegex, '').split(/ +/)
    const commandName = prefixRegex.test(text) ? args.shift().toLowerCase() : null

    return [commandName, args]
}

// TODO: rule.limit. One rule can consume multiple arguments.
exports.parseArgs = (args, rules = []) => {
    const named = {}
    const flags = {}
    const rest = []
    const usedRules = {}

    NEXT_ARG: for (const arg of args) {
        for (const { name, value, parse } of rules) {
            const arrayOk = Array.isArray(value) && value.includes(arg.toLowerCase())
            const regexOk = value instanceof RegExp && value.test(arg.toLowerCase())
            const equalOk = (typeof value === 'string' || typeof value === 'number') && value === arg.toLowerCase()
            const isNotFlag = !arg.startsWith('-')

            if (!usedRules[name] && isNotFlag && (arrayOk || regexOk || equalOk)) {
                usedRules[name] = true
                const tmp = arrayOk ? arg.toLowerCase() : arg
                named[name] = parse ? parse(tmp) : tmp
                continue NEXT_ARG
            }
        }

        if (arg.startsWith('-')) {
            flags[arg.substring(1)] = true
        } else {
            rest.push(arg)
        }
    }

    for (const { name, required, defaultValue } of rules) {
        if (!usedRules[name]) {
            if (defaultValue !== undefined) {
                named[name] = defaultValue
            } else {
                if (required) {
                    throw new InvalidInputError(`You need to specify **${name}**.`)
                }
            }
        }
    }

    return { ...named, flags, args: rest }
}