const Color = require('../constants/Color')
const Emoji = require('../constants/Emoji')
const { InvalidInputError } = require('../utils/Errors')

exports.Emoji = Emoji

exports.react = (msg, emoji) => msg.react(emoji)
exports.reactSuccess = msg => exports.react(msg, Emoji.SUCCESS)
exports.reactFail = msg => exports.react(msg, Emoji.FAIL)

exports.sendEmbedded = (channel, data = {}) => channel.send({ embed: data })
exports.sendEmbeddedSuccess = (channel, description) => exports.sendEmbedded(channel, { description: Emoji.SUCCESS + ' ' + description, color: Color.GREEN })
exports.sendEmbeddedFail = (channel, title, description, color = Color.RED) => exports.sendEmbedded(channel, { title, description, color })
exports.sendEmbeddedInfo = (channel, description) => exports.sendEmbedded(channel, { description: Emoji.INFO + ' ' + description, color: Color.BLUE })

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

            if (!usedRules[name] && (arrayOk || regexOk || equalOk)) {
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