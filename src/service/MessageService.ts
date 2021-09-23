import { GuildMember, Message, MessageEmbedOptions, TextBasedChannels, TextChannel, Webhook, WebhookClient } from 'discord.js'

import Color from '../constants/Color'
import Emoji from '../constants/Emoji'
import { ArgParser } from '../utils/Args'

type Theme = [Color, Emoji]

module MessageService {

    export const Theme: Record<string, Theme> = {
        SUCCESS: [Color.GREEN, Emoji.SUCCESS],
        FAIL: [Color.RED, Emoji.FAIL],
        INFO: [Color.BLUE, Emoji.INFO]
    }

    export const react = (msg: Message, emoji: string) => msg.react(emoji)
    export const reactSuccess = (msg: Message) => react(msg, Emoji.SUCCESS)
    export const reactFail = (msg: Message) => react(msg, Emoji.FAIL)

    export const send = (channel: TextBasedChannels, data: MessageEmbedOptions = {}, [color, emoji]: Theme = Theme.INFO) => {
        const embed = { ...data, color: data.color || color }

        if (embed.title) {
            embed.title = emoji + ' ' + embed.title
        } else {
            embed.description = emoji + ' ' + embed.description
        }

        channel.send({ embeds: [embed] })
    }

    // Map webhooks per serber, channel
    type Webhooks = Record<string, [Webhook, WebhookClient]>
    type Channels = Record<string, Webhooks>
    type Server = Record<string, Channels>

    const webhooks: Server = {}

    export const sendMemberWebhook = async (channel: TextChannel, member: GuildMember, content: string | MessageEmbedOptions) => {
        return await sendWebhook(channel, member.user.displayAvatarURL({ dynamic: true }), member.displayName, content)
    }

    export const sendWebhook = async (channel: TextChannel, avatar: string, name: string, content: string | MessageEmbedOptions) => {
        if (!webhooks[channel.guild.id]) webhooks[channel.guild.id] = {}
        if (!webhooks[channel.guild.id][channel.id]) webhooks[channel.guild.id][channel.id] = {}

        const channelList = webhooks[channel.guild.id][channel.id]
        const id = `${avatar}___${name}`

        if (!channelList[id]) {
            if (Object.values(channelList).length >= 8) {
                for (const channelId in channelList) channelList[channelId][0].delete()

            }

            const webhook = await channel.createWebhook('Bot')
            const webhookClient = new WebhookClient(webhook)
            channelList[id] = [webhook, webhookClient]
        }

        const webhookClient = channelList[id][1]
        const isPlain = typeof content === 'string'
        await webhookClient.send({ content: isPlain ? content : undefined, username: name, avatarURL: avatar, embeds: isPlain ? undefined : [content] })
    }

    export const sendSuccess = (channel: TextBasedChannels, description: string, title?: string, color?: Color) => send(channel, { description, title, color }, Theme.SUCCESS)
    export const sendFail = (channel: TextBasedChannels, description: string, title?: string, color?: Color) => send(channel, { description, title, color }, Theme.FAIL)
    export const sendInfo = (channel: TextBasedChannels, description: string, title?: string, color?: Color) => send(channel, { description, title, color })

    export const parseCommand = (text: string, prefix: string): [string | null, ArgParser] => {
        const prefixRegex = new RegExp(`^${(/^[a-z0-9]/g.test(prefix) ? '' : '\\') + prefix} *`)
        const argParser = new ArgParser(text.trim().replace(prefixRegex, ''))
        const commandName = prefixRegex.test(text) ? argParser.shift()! : null
        return [commandName, argParser]
    }

}

export default MessageService