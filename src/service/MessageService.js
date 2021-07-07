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
exports.parseArgs = (args, rules) => {
    const named = {}
    const rest = []
    const usedRules = {}

    for (const { name, value, required, defaultValue, parse } of rules) {
        const test = arg => {
            const argVal = parse ? parse(arg) : arg
            const arrayOk = Array.isArray(value) && value.includes(argVal)
            const regexOk = value instanceof RegExp && value.test(argVal)
            const equalOk = (typeof value === 'string' || typeof value === 'number') && value === argVal

            if (!usedRules[name] && (arrayOk || regexOk || equalOk)) {
                named[name] = argVal
                usedRules[name] = true
                return true
            }

            if (defaultValue !== undefined) {
                named[name] = defaultValue
                return false
            }

            if (!required) {
                return false
            }

            throw new InvalidInputError(`You have to specify **${name}**.`)
        }

        for (const arg of args) {
            if (!test(arg)) {
                rest.push(arg)
            }
        }
    }

    return { ...named, args: rest }
}