const Color = require('../constants/Color')
const Emoji = require('../constants/Emoji')
const { InvalidInputError } = require('../utils/Errors')

exports.Emoji = Emoji

exports.react = (msg, emoji) => msg.react(emoji)
exports.reactSuccess = msg => exports.react(msg, Emoji.SUCCESS)
exports.reactFail = msg => exports.react(msg, Emoji.FAIL)

exports.sendEmbedded = (channel, title, description, color) => channel.send({ embed: { title, description, color } })
exports.sendEmbeddedSuccess = (channel, title, description, color = Color.GREEN) => exports.sendEmbedded(channel, title, description, color)
exports.sendEmbeddedFail = (channel, title, description, color = Color.RED) => exports.sendEmbedded(channel, title, description, color)

exports.parseCommand = (text, prefix) => {
    const prefixRegex = new RegExp(`^\\${prefix} *`)
    const args = text.toLowerCase().trim().replace(prefixRegex, '').split(/ +/)
    const commandName = prefixRegex.test(text) ? args.shift() : null

    return [commandName, args]
}

// TODO: rule.limit. One rule can consume multiple arguments.
exports.parseArgs = (args, rules = []) => {
    const named = {}
    const rest = []
    const usedRules = {}

    NEXT_ARG: for (const arg of args) {
        for (const { name, value, parse } of rules) {
            const arrayOk = Array.isArray(value) && value.includes(arg)
            const regexOk = value instanceof RegExp && value.test(arg)
            const equalOk = (typeof value === 'string' || typeof value === 'number') && value === arg

            if (!usedRules[name] && (arrayOk || regexOk || equalOk)) {
                usedRules[name] = true
                named[name] = parse ? parse(arg) : arg
                continue NEXT_ARG
            }
        }

        rest.push(arg)
    }

    for (const { name, required, defaultValue } of rules) {
        if (!usedRules[name]) {
            if (defaultValue) {
                named[name] = defaultValue
            } else {
                if (required) {
                    throw new InvalidInputError(`You have to specify **${name}**.`)
                }
            }
        }
    }

    return { ...named, args: rest }
}