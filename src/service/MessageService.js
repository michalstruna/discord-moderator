const Discord = require('discord.js')

const Color = require('../constants/Color')
const Emoji = require('../constants/Emoji')
const Pattern = require('../constants/Pattern')
const { ArgsSet } = require('../utils/Args')
const { InvalidInputError } = require('../utils/Errors')
const { list } = require('../utils/Outputs')

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

const webhooks = {}

exports.sendMemberWebhook = async (channel, member, content) => {
    return await sendWebhook(channel, member.user.displayAvatarURL({ dynamic: true }), member.displayName, content)
}

const sendWebhook = exports.sendWebhook = async (channel, avatar, name, content) => {
    if (!webhooks[channel.guild.id]) webhooks[channel.guild.id] = {}
    if (!webhooks[channel.guild.id][channel.id]) webhooks[channel.guild.id][channel.id] = {}

    const channelList = webhooks[channel.guild.id][channel.id]
    const id = `${avatar}___${name}`

    if (!channelList[id]) {
        if (Object.values(channelList).length >= 8) {
            channelList.each(w => w.delete())
        }

        const webhook = await channel.createWebhook('Bot')
        const webhookClient = new Discord.WebhookClient(webhook.id, webhook.token)
        channelList[id] = [webhook, webhookClient]
    }

    const webhookClient = channelList[id][1]
    const isPlain = typeof content === 'string'
    await webhookClient.send(isPlain ? content : null, { username: name, avatarURL: avatar, embeds: isPlain ? undefined : [content] })
}

exports.sendSuccess = (channel, description, title, color) => send(channel, { description, title, color }, Theme.SUCCESS)
exports.sendFail = (channel, description, title, color) => send(channel, { description, title, color }, Theme.FAIL)
exports.sendInfo = (channel, description, title, color) => send(channel, { description, title, color })

exports.parseCommand = (text, prefix) => {
    const prefixRegex = new RegExp(`^${'\\' + prefix} *`)
    const argsSet = new ArgsSet(text.trim().replace(prefixRegex, ''))
    const commandName = prefixRegex.test(text) ? argsSet.shift() : null
    return [commandName, argsSet]
}

exports.parseArgs = async (argsSet, rules = [], meta) => { // TODO: Delete.
    const parsed = {}

    const tmpArgs = argsSet.copy()
    const tmpRules = [...rules]

    const formatRules = rules => list(rules.map(rule => rule.pattern instanceof Pattern.Flag ? `\`-${rule.name}\`` : `\`${rule.name}\``), 'and')

    while (true) {
        const arg = tmpArgs[0], rule = tmpRules[0]

        if (tmpArgs.length === 0 && tmpRules.length === 0) { // All rules and args were consumed.
            break
        }

        if (tmpArgs.length === 0 && tmpRules.length > 0) { // There are no args, but still some rules.
            const reqRules = tmpRules.filter(r => {
                if (!r.required) return false
                if (r.pattern instanceof Pattern.Rest && parsed[r.name] && parsed[r.name].length > 0) return false
                return true
            })

            if (reqRules.length > 0) {
                throw new InvalidInputError(`You have to specify ${formatRules(reqRules)}.`)
            }

            break
        }

        if (tmpArgs.length > 0 && tmpRules.length === 0) { // There are no rules, but still some args.
            throw new InvalidInputError(`Unknown arguments: \`${tmpArgs.join('`, `')}\``)
        }

        if (rule.pattern instanceof Pattern.Rest) { // Consume argument without rule.
            if (rule.pattern.test(arg)) {
                if (!parsed[rule.name]) parsed[rule.name] = []
                parsed[rule.name].push(await rule.pattern.parse(arg, meta))
                tmpArgs.shift()
            } else {
                tmpRules.shift()
            }

            continue
        }

        if (rule.pattern.test(arg)) { // Consume rule and argument.
            parsed[rule.name] = await rule.pattern.parse(arg, meta)
            tmpArgs.shift()
            tmpRules.shift()

            if (rule.pattern instanceof Pattern.Flag && rule.pattern.value) {
                tmpRules.unshift({ ...rule, pattern: rule.pattern.value })
            }

            continue
        }

        if (!rule.required) { // For optional argument, it is possible consume only rule.
            tmpRules.shift()
        } else {
            if (rule.pattern instanceof Pattern.Rest && parsed[rule.name] && parsed[rule.name].length > 0) {
                tmpRules.shift()
            } else {
                throw new InvalidInputError(`You have to specify ${formatRules([rule])}.`)
            }
        }
    }

    return parsed
}