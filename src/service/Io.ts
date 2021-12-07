import { OAuth2Routes } from 'discord-api-types'
import { InteractionReplyOptions, Message, MessageComponentInteraction, MessageEditOptions, MessageEmbed, MessageEmbedOptions, MessageOptions, TextBasedChannels } from 'discord.js'

import Color from '../constants/Color'
import Emoji from '../constants/Emoji'
import { EmbedOptions } from './type'

type Theme = {
    color: Color
    emoji: Emoji
}

export const Theme = {
    SUCCESS: { color: Color.GREEN, emoji: Emoji.SUCCESS },
    FAIL: { color: Color.RED, emoji: Emoji.FAIL },
    INFO: { color: Color.BLUE, emoji: Emoji.INFO },
    WARNING: { color: Color.ORANGE, emoji: Emoji.WARNING }
}

type ThemedEmbed = MessageEmbedOptions & { theme?: Theme }
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