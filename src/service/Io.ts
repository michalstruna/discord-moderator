import { ColorResolvable, GuildMember, Interaction, InteractionReplyOptions, Message, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEditOptions, MessageEmbedOptions, MessageOptions, MessageReaction, MessageSelectMenu, TextBasedChannels, Webhook, WebhookClient } from 'discord.js'
import { v4 as Id } from 'uuid'

import Color from '../constants/Color'
import Config from '../constants/Config'
import Emoji from '../constants/Emoji'
import { ArgParser, Bool, Channel, List, Member, Text, Color as ColorType } from '../model/Arg'
import { ForbiddenError } from '../model/Error'
import { ActionMeta } from '../model/types'
import { equals } from '../utils/Objects'
import { truncate } from '../utils/Strings'
import { EmbedOptions, Page, PageButton, PageOptions, PageRenderer, PageSelect, PagesOptions, Theme as ThemeType } from './type'


module Io {

    export const Theme = {
        SUCCESS: { color: Color.GREEN, emoji: Emoji.SUCCESS },
        FAIL: { color: Color.RED, emoji: Emoji.FAIL },
        INFO: { color: Color.BLUE, emoji: Emoji.INFO },
        WARNING: { color: Color.ORANGE, emoji: Emoji.WARNING }
    }

    type ThemedEmbed = MessageEmbedOptions & { theme?: ThemeType }
    type Themeable<Type> = Omit<Type, 'embeds'> & { embeds?: ThemedEmbed[] }
    type Untheme<Type> = Omit<Type, 'embeds'> & { embeds?: EmbedOptions[] }

    type ThemedMessageOptions = Themeable<MessageOptions>
    type ThemedMessageEditOptions = Themeable<MessageEditOptions>
    type ThemedInteractionReplyOptions = Themeable<InteractionReplyOptions>

    type SendOutput = TextBasedChannels | Message | MessageComponentInteraction
    type SendPayload<Out> = Out extends TextBasedChannels ? ThemedMessageOptions : (Out extends Message ? ThemedMessageEditOptions : ThemedInteractionReplyOptions)
    type SendReturn<Out> = Promise<Out extends TextBasedChannels ? Message : (Out extends Message ? Message : void)>

    const theme = <Out>(themedPayload: SendPayload<Out>): Untheme<SendPayload<Out>> => ({
        ...themedPayload, embeds: themedPayload.embeds?.map(themeEmbed)
    })

    const themeEmbed = (themedEmbed: ThemedEmbed) => {
        const { theme, ...embed } = themedEmbed
        const result = { ...embed }

        if (theme) {
            result.color = result.color ?? theme.color
            if (embed.title) embed.title = `${theme.emoji} ${embed.title}`
            if (!embed.title) embed.description = `${theme.emoji} ${embed.description}`
        }

        return result
    }

    export const send = <Out extends SendOutput>(output: Out, payload: SendPayload<Out>): SendReturn<Out> => {
        const realPayload = theme(payload)
        if ('send' in output) return (output as TextBasedChannels).send(realPayload) as SendReturn<Out>
        if ('edit' in output) return (output as Message).edit(realPayload) as SendReturn<Out>
        return (output as MessageComponentInteraction).reply(realPayload) as SendReturn<Out>
    }

    export const embed = <Out extends SendOutput>(output: Out, payload: ThemedEmbed, options: SendPayload<Out> = {}): SendReturn<Out> => send(output, { embeds: [payload], ...options })
    const getPayloadOptions = (payload: MessageEmbedOptions | string) => typeof payload === 'string' ? { description: payload } : payload
    export const success = <Out extends SendOutput>(output: Out, payload: MessageEmbedOptions | string, options?: SendPayload<Out>): SendReturn<Out> => embed(output, { ...getPayloadOptions(payload), theme: Theme.SUCCESS }, options)
    export const fail = <Out extends SendOutput>(output: Out, payload: MessageEmbedOptions | string, options?: SendPayload<Out>): SendReturn<Out> => embed(output, { ...getPayloadOptions(payload), theme: Theme.FAIL }, options)
    export const info = <Out extends SendOutput>(output: Out, payload: MessageEmbedOptions | string, options?: SendPayload<Out>): SendReturn<Out> => embed(output, { ...getPayloadOptions(payload), theme: Theme.INFO }, options)
    export const warning = <Out extends SendOutput>(output: Out, payload: MessageEmbedOptions | string, options?: SendPayload<Out>): SendReturn<Out> => embed(output, { ...getPayloadOptions(payload), theme: Theme.WARNING }, options)


    export const react = (msg: Message, emoji: Emoji): Promise<MessageReaction> => msg.react(emoji)
    export const reactSuccess = (msg: Message) => react(msg, Emoji.SUCCESS)
    export const reactFail = (msg: Message) => react(msg, Emoji.FAIL)

    // Map webhooks per server and channel.
    type Webhooks = Record<string, [Webhook, WebhookClient]>
    type Channels = Record<string, Webhooks>
    type Server = Record<string, Channels>
    const webhooks: Server = {}

    export const sendMemberWebhook = async (channel: TextBasedChannels, member: GuildMember, message: MessageOptions) => {
        return await sendWebhook(channel, member.user.displayAvatarURL({ dynamic: true }), member.displayName, message)
    }

    export const sendWebhook = async (channel: TextBasedChannels, avatar: string, name: string, message: MessageOptions) => {
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
        await webhookClient.send({ ...message, username: name, avatarURL: avatar })
    }

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
            const msgOptions = {
                embeds: [{ description, theme: Theme.WARNING }], components: [
                    new MessageActionRow().addComponents([
                        new MessageButton().setCustomId('yes').setLabel('Yes').setStyle('SUCCESS').setEmoji(Emoji.SUCCESS),
                        new MessageButton().setCustomId('no').setLabel('No').setStyle('SECONDARY').setEmoji(Emoji.FAIL)
                    ])
                ]
            }

            const msg = await send(channel, msgOptions)
            const filter = (interaction: Interaction) => userIds?.includes(interaction.user.id) || false
            const collector = msg.createMessageComponentCollector({ filter, time: Config.BUTTONS_DURATION, max: 1 })

            collector.on('end', async interactions => {
                if (msg.deletable) msg.delete()
                resolve(interactions.first() && interactions.first()?.customId === 'yes')
            })
        })
    }

    export const pages = async <Target>(channel: TextBasedChannels, render: PageRenderer<Target>, options: PagesOptions<Target>) => {
        new PageManager<Target>(channel, render, options)
    }



    type ArgsEmbed = {
        title?: string
        color?: ColorResolvable
        url?: string
        'author-name'?: string
        'author-icon_url'?: string
        'thumbnail-url'?: string
        'image-url'?: string
        timestamp?: string
        'footer-text'?: string
        'footer-icon_url'?: string
        description?: string
        fields?: string[]
    }

    type EchoArgs = ArgsEmbed & MessageOptions & {
        channel: TextBasedChannels
        server?: boolean
        as?: GuildMember
    }

    export const echo = async ({ channel, server, as, ...message }: EchoArgs, { msg }: ActionMeta) => {
        if (server) {
            sendWebhook(channel, msg.guild!.iconURL({ dynamic: true })!, msg.guild!.name, buildMessage(message))
        } else if (as) {
            sendMemberWebhook(channel, as, buildMessage(message))
        } else {
            channel.send(buildMessage(message))
        }
    }

    const buildMessage = (src: ArgsEmbed): MessageOptions => {
        const buildEmbed = (src: ArgsEmbed): MessageEmbedOptions => {
            const result: Record<string, any> = {}

            for (const prop in src) {
                if (prop === 'fields') {
                    result.fields = src[prop]!.map(f => {
                        const [name, value, inline] = f.split('++')
                        return { name, value, inline: inline === 'inline' }
                    })
                } else if (prop.includes('-')) {
                    const [outer, inner] = prop.split('-')
                    if (!result[outer]) result[outer] = {}
                    result[outer][inner] = src[prop as keyof ArgsEmbed]
                } else {
                    result[prop] = src[prop as keyof ArgsEmbed]
                }
            }

            return result
        }

        const isEmbed = src.title || src.color
        let result = isEmbed ? { ...src, embeds: [buildEmbed(src)] } : { ...src, content: src.description }

        return result
    }

    export const getEchoArgs = () => {
        return [
            new Bool('server'),
            new Member('as', 'Send message with identity of the user.').explicit(),
            new Text('title').explicit().multi(),
            new ColorType('color', 'Color in hex format.').explicit(),
            new Text('url').explicit(),
            new Text('author-name').explicit().multi(),
            new Text('author-icon_url').explicit(),
            new Text('thumbnail-url').explicit(),
            new Text('image-url').explicit(),
            new Text('timestamp').explicit(),
            new Text('footer-text').explicit().multi(),
            new Text('footer-icon_url').explicit(),
            new List('fields', 'List of fields title||description||inline', new Text()).explicit(),
            new Channel('channel').default(Channel.CURRENT),
            new Text('description', 'Text you want to send.').multi()
        ]
    }




    class PageManager<Target> {

        private channel: TextBasedChannels
        private renderer: PageRenderer<Target>
        private page: Target
        private options: PagesOptions<Target>
        private targets: Record<string, Target | undefined>

        public constructor(channel: TextBasedChannels, renderer: PageRenderer<Target>, options: PagesOptions<Target>) {
            this.channel = channel
            this.renderer = renderer
            this.page = options.defaultPage
            this.options = options
            this.targets = {} // TODO: Cleaning.

            this.render()
        }

        private createButtons(pageButtons: PageButton<Target>[], page?: Page) {
            let prevButton: PageButton<Target>, nextButton: PageButton<Target>

            if (page) {
                const nPages = Math.ceil(page.nItems / page.size)
                pageButtons.push(prevButton = { label: 'Previous', target: { ...this.page, page: page.current - 1 }, disabled: page.current === 0, type: 'SECONDARY' })
                pageButtons.push(nextButton = { label: 'Next', target: { ...this.page, page: page.current + 1 }, disabled: page.current === nPages - 1, type: 'SECONDARY' })
            }

            const buttons = pageButtons.map(b => {
                const id = Id()
                this.targets[id] = b.target
                const targetExclude = prevButton === b || nextButton === b ? [] : ['page']

                return new MessageButton()
                    .setLabel(b.label)
                    .setStyle(b.type || 'PRIMARY')
                    .setCustomId(id)
                    .setDisabled(equals(b.target, this.page, targetExclude) || b.disabled || false)
            })

            const rows = []

            if (buttons) {
                for (let i = 0; i < buttons.length; i += 5) {
                    rows.push(new MessageActionRow().addComponents(...buttons.slice(i, i + 5)))
                }
            }

            return rows
        }

        private createSelects(pageSelects: PageSelect<Target>[]) {
            return pageSelects.map((s, i) => (
                new MessageActionRow().addComponents(
                    new MessageSelectMenu()
                        .setCustomId(`select_${i}`)
                        .setPlaceholder(s.placeholder || '')
                        .addOptions(
                            s.options.map((item, i) => {
                                const id = Id()
                                this.targets[id] = item.target

                                return {
                                    label: item.label,
                                    description: truncate(item.description || '', Config.SELECT_DESCRIPTION_MAX_LENGTH),
                                    value: id
                                }
                            })
                        )
                )
            ))
        }

        private async createCollector(message: Message) {
            const filter = (i: Interaction) => this.options.users ? this.options.users.includes(i.user.id) : true
            const collector = message.createMessageComponentCollector({ filter, time: Config.BUTTONS_DURATION })

            collector.on('collect', async i => {
                let id = null
                if (i.isButton()) id = i.customId
                if (i.isSelectMenu()) id = i.values[0]
                const target = this.targets[id!]
                if (target) this.page = target

                this.render(message)
                i.deferUpdate()
            })

            collector.on('end', async () => {
                try {
                    await message.edit({ components: [] })
                } catch (e) {
                    console.error(e)
                }
            })
        }

        private async addPageFooter(options: PageOptions<Target>) {
            const { current, nItems, size, recordsName, footerIcon, footerSuffix } = options.page!

            options.footer = {
                text: `Page: ${current + 1}/${Math.ceil(nItems / size)} • Total ${recordsName || 'records'}: ${nItems}${footerSuffix ? `• ${footerSuffix}` : ''}`,
                icon_url: footerIcon
            }
        }

        private async render(editedMessage?: Message) {
            let content = await this.renderer(this.page)

            if (content.page) {
                const maxPage = Math.ceil(content.page.nItems / content.page.size) - 1
                if (content.page.current > maxPage) content = await this.renderer({ ...this.page, page: maxPage })
                this.addPageFooter(content)
            }

            const buttonRows = this.createButtons(content.buttons || [], content.page)
            const selectRows = this.createSelects(content.selects || [])

            const messageContent = {
                embeds: [content],
                components: [...buttonRows, ...selectRows]
            }

            const message = await send(editedMessage || this.channel, messageContent)
            if (!editedMessage) this.createCollector(message)
        }

    }

}

export default Io