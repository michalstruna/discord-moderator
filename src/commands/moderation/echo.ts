import { ColorResolvable, MessageEmbedOptions, MessageOptions } from 'discord.js'

import Command, { Action } from '../../model/Command'
import RoleType from '../../constants/RoleType'
import MessageService from '../../service/MessageService'
import { Member, Channel, Text, Bool, Color } from '../../model/Arg'
import CommandCategory from '../../constants/CommandCategory'

type ArgsEmbed = {
    title: string
    color: ColorResolvable
    url: string
    'author-name': string
    'author-icon_url': string
    'thumbnail-url': string
    'image-url': string
    timestamp: string
    'footer-text': string
    'footer-icon_url': string
    description: string
}

const buildMessage = (embed: MessageEmbedOptions | string): MessageOptions | string => {
    return typeof embed === 'string' ? embed as string : { embeds: [embed] }
}

const buildEmbed = (src: ArgsEmbed): MessageEmbedOptions | string => {
    const { title, color } = src

    if (title || color) {
        const result: Record<string, any> = {}

        for (const prop in src) {
            if (prop.includes('-')) {
                const [outer, inner] = prop.split('-')
                if (!result[outer]) result[outer] = {}
                result[outer][inner] = src[prop as keyof ArgsEmbed]
            } else {
                result[prop] = src[prop as keyof ArgsEmbed]
            }
        }

        return result
    }

    return src.description!
}

export default new Command({
    name: 'echo',
    category: CommandCategory.MODERATION,
    description: 'Manage sending of messages.',
    actions: [
        Action({
            name: 'send',
            args: [
                new Bool('server'),
                new Member('as', 'Send message with identity of the user.').explicit(),
                new Text('title').explicit().multi(),
                new Color('color', 'Color in hex format.').explicit(),
                new Text('url').explicit(),
                new Text('author-name').explicit().multi(),
                new Text('author-icon_url').explicit(),
                new Text('thumbnail-url').explicit(),
                new Text('image-url').explicit(),
                new Text('timestamp').explicit(),
                new Text('footer-text').explicit().multi(),
                new Text('footer-icon_url').explicit(),
                new Channel('channel').default(Channel.CURRENT),
                new Text('description', 'Text you want to send.').req().multi()
            ],
            auth: { permit: [RoleType.ADMIN, RoleType.MOD] },
            execute: async ({ channel, server, as, ...message }, { msg }) => {
                if (server) {
                    MessageService.sendWebhook(channel, msg.guild!.iconURL({ dynamic: true })!, msg.guild!.name, buildEmbed(message))
                } else if (as) {
                    MessageService.sendMemberWebhook(channel, as, buildEmbed(message))
                } else {
                    channel.send(buildMessage(buildEmbed(message)))
                }
            },
            description: 'Send message to the channel.',
            examples: [['Text.'], ['#general', 'Text.']]
        })
    ]
})