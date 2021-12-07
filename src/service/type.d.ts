import { MessageButtonStyle, MessageEmbedOptions, MessageOptions as DiscordMessageOptions } from 'discord.js'

import Color from '../constants/Color'
import Emoji from '../constants/Emoji'
import Icon from '../constants/Icon'

export type EmbedOptions = MessageEmbedOptions & {
    theme?: Theme
}

export type MessageOptions = Omit<DiscordMessageOptions, 'embeds'> & {
    embeds?: EmbedOptions[]
    ephemeral?: boolean
}

export type PageTarget = Record<string, any>

export type PageButton<Target> = {
    label: string
    target: Target
    disabled?: boolean
    type?: MessageButtonStyle
}

export type PageSelect<Target> = {
    placeholder?: string
    options: {
        label: string
        description?: string
        target?: Target
    }[]
}

export type Page = {
    current: number
    nItems: number
    size: number
    recordsName?: string
    footerIcon?: Icon
    footerSuffix?: string
}

export type PageOptions<Target> = EmbedOptions & {
    buttons?: PageButton<Target>[]
    selects?: PageSelect<Target>[]
    page?: Page
}

export type PageRenderer<Target> = (target: Target) => Promise<PageOptions<Target>>
export type PagesOptions<Target> = {
    defaultPage: Target
    users?: string[]
}

export type Theme = {
    color: Color
    emoji: Emoji
}