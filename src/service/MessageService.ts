import { GuildMember, Interaction, Message, MessageActionRow, MessageButton, MessageEmbedOptions, MessageOptions as DiscordMessageOptions, TextBasedChannels, Webhook, WebhookClient } from 'discord.js'

import Color from '../constants/Color'
import Config from '../constants/Config'
import Emoji from '../constants/Emoji'
import { ArgParser } from '../model/Arg'
import { ForbiddenError } from '../model/Error'

type Theme = [Color, Emoji]

type MessageOptions = Omit<DiscordMessageOptions, 'embeds'> & {
    embeds?: (MessageEmbedOptions & { theme?: Theme })[]
}

module MessageService {

    export const Theme: Record<string, Theme> = {
        SUCCESS: [Color.GREEN, Emoji.SUCCESS],
        FAIL: [Color.RED, Emoji.FAIL],
        INFO: [Color.BLUE, Emoji.INFO],
        WARNING: [Color.GOLD, Emoji.WARNING]
    }

    export const react = async (msg: Message, emoji: string) => {
        try {
            await msg.react(emoji)
        } catch (error) {
            console.error('MessageService.react', error)
        }
    }

    export const reactSuccess = (msg: Message) => react(msg, Emoji.SUCCESS)
    export const reactFail = (msg: Message) => react(msg, Emoji.FAIL)

    export const send = (channel: TextBasedChannels, message: MessageOptions = {}) => {
        for (const i in message.embeds || []) {
            const { theme, ...embed } = message.embeds![i]
            if (!theme) continue
            embed.color = embed.color || theme[0]

            if (embed.title) {
                embed.title = theme[1] + ' ' + embed.title
            } else {
                embed.description = theme[1] + ' ' + embed.description
            }

            message.embeds![i] = embed
        }

        return channel.send(message)
    }

    // Map webhooks per server and channel.
    type Webhooks = Record<string, [Webhook, WebhookClient]>
    type Channels = Record<string, Webhooks>
    type Server = Record<string, Channels>

    const webhooks: Server = {}

    export const sendMemberWebhook = async (channel: TextBasedChannels, member: GuildMember, content: string | MessageEmbedOptions) => {
        return await sendWebhook(channel, member.user.displayAvatarURL({ dynamic: true }), member.displayName, content)
    }

    export const sendWebhook = async (channel: TextBasedChannels, avatar: string, name: string, content: string | MessageEmbedOptions) => {
        if (!('guild' in channel) || !('createWebhook' in channel)) throw new ForbiddenError('Webhooks are not supported here.')
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

    export const sendSuccess = (channel: TextBasedChannels, description: string, title?: string, color?: Color) => send(channel, { embeds: [{ description, title, color, theme: Theme.SUCCESS }] })
    export const sendFail = (channel: TextBasedChannels, description: string, title?: string, color?: Color) => send(channel, { embeds: [{ description, title, color, theme: Theme.FAIL }] })
    export const sendInfo = (channel: TextBasedChannels, description: string, title?: string, color?: Color) => send(channel, { embeds: [{ description, title, color, theme: Theme.INFO }] })
    export const sendWarning = (channel: TextBasedChannels, description: string, title?: string, color?: Color) => send(channel, { embeds: [{ description, title, color, theme: Theme.WARNING }] })

    export const parseCommand = (text: string, prefix: string): [string | null, ArgParser | null] => {
        let input = text.trim()
        if (!input.startsWith(prefix)) return [null, null]
        input = input.replace(prefix, '').trim()
        const parts = input.split(/[ \n]+/)
        const commandName = parts.shift()!
        input = input.replace(commandName, '').trim()
        const argParser = new ArgParser(input)
        return [commandName, argParser]
    }

    export const confirm = async (channel: TextBasedChannels, description: string, userIds?: string[]) => {
        return new Promise(async resolve => {
            const msgOptions = { embeds: [{ description, theme: Theme.WARNING }], components: [
                new MessageActionRow().addComponents([
                    new MessageButton().setCustomId('yes').setLabel('Yes').setStyle('PRIMARY').setEmoji(Emoji.SUCCESS),
                    new MessageButton().setCustomId('no').setLabel('No').setStyle('SECONDARY').setEmoji(Emoji.FAIL)
                ])
            ] }
            
            const msg = await send(channel, msgOptions)
            const filter = (interaction: Interaction) => userIds?.includes(interaction.user.id) || false
            const collector = msg.createMessageComponentCollector({ filter, time: Config.BUTTONS_DURATION, max: 1 }) 
            
            collector.on('end', async interactions => {
                if (msg.deletable) msg.delete()
                resolve(interactions.first() && interactions.first()?.customId === 'yes')
            })
        })
    }

}

export default MessageService