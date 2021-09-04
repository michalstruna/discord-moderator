const Color = require('../constants/Color')
const Emoji = require('../constants/Emoji')
const Pattern = require('../constants/Pattern')
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
    const prefixRegex = new RegExp(`^${prefix} *`)
    const args = text.trim().replace(prefixRegex, '').split(/ +/)
    const commandName = prefixRegex.test(text) ? args.shift().toLowerCase() : null

    return [commandName, args]
}

exports.parseArgs = async (args, rules = [], meta) => {
    const tmpArgs = [...args]
    const tmpRules = [...rules]
    const parsed = {}

    while (true) {
        if (tmpRules[0] && tmpRules[0].pattern === Pattern.REST) { // Rest of parameters.
            if (tmpRules[0].required && tmpArgs.length === 0) throw new InvalidInputError(`You have to specify \`${tmpRules[0].name}\`.`)
            parsed[tmpRules[0].name] = tmpArgs.join(' ')
            break
        }

        if (tmpArgs.length === 0 && tmpRules.length === 0) { // All rules and args were consumed.
            break
        }

        if (tmpArgs.length === 0 && tmpRules.length > 0) { // There are no args, but still some rules.
            const reqRules = tmpRules.filter(r => r.required)

            if (reqRules.length > 0) {
                throw new InvalidInputError(`You have to specify \`${reqRules.map(r => r.name).join(', ')}\`.`)
            }

            break
        }

        if (tmpArgs.length > 0 && tmpRules.length === 0) { // There are no rules, but still some args.
            throw new InvalidInputError(`Unknown arguments: \`${tmpArgs.join('`, `')}\``)
        }

        if (tmpRules[0].pattern.test(tmpArgs[0])) { // Consume rule and argument.
            parsed[tmpRules[0].name] = await tmpRules[0].pattern.parse(tmpArgs[0], meta)
            tmpArgs.shift()
            tmpRules.shift()
            continue
        }

        if (!tmpRules[0].required) { // For optional argument, it is possible consume only rule.
            tmpRules.shift()
        } else {
            throw new InvalidInputError(`You have to specify \`${tmpRules[0].name}\`.`)
        }
    }

    return parsed
}