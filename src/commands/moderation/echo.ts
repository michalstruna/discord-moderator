import Command, { Action } from '../../model/Command'
import RoleType from '../../constants/RoleType'
import MessageService from '../../service/MessageService'
import { Member, Channel, Text, Bool } from '../../model/Arg'

export default new Command({
    name: 'echo',
    description: 'Manage sending .',
    actions: [
        Action({
            name: 'send',
            args: [
                new Channel('channel').default(Channel.CURRENT),
                new Text('message', 'Text you want to send.').req().multi()
            ],
            auth: { permit: [RoleType.ADMIN, RoleType.MOD] },
            execute: async ({ channel, message }) => {
                channel.send(message)
            },
            description: 'Send text to the channel.',
            examples: [['Text.'], ['#general', 'Text.']]
        }),
        Action({
            name: 'as-user',
            args: [
                new Channel('channel', 'If not provided, send to current channel.' ).default(Channel.CURRENT),
                new Member('as', 'Send message with identity of the user.').default(Member.CURRENT).explicit().req(),
                new Text('message', 'Text you want to send.').req().multi()
            ],
            auth: { permit: [RoleType.ADMIN, RoleType.MOD] },
            execute: async ({ as, channel, message }) => {
                MessageService.sendMemberWebhook(channel, as, message)
            },
            description: 'Send text to the channel as the member.',
            examples: [['-as', '@Michal', '#general', 'Text.']]
        }),
        Action({
            name: 'as-server',
            args: [
                new Channel('channel', 'If not provided, send to current channel.' ).default(Channel.CURRENT),
                new Bool('server', 'Send message with identity of the server.').req(),
                new Text('message', 'Text you want to send.').req().multi()
            ],
            auth: { permit: [RoleType.ADMIN, RoleType.MOD] },
            execute: async ({ channel, message }, { msg }) => {
                MessageService.sendWebhook(channel, msg.guild!.iconURL({ dynamic: true })!, msg.guild!.name, message)
            },
            description: 'Send text to the channel as the server.',
            examples: [['-server', '#general', 'Text.']]
        })
    ]
})