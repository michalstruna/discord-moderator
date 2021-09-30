import Command, { Action } from '../../model/Command'
import RoleType from '../../constants/RoleType'
import MessageService from '../../service/MessageService'
import { Member, Channel, Text, Bool } from '../../utils/Args'

export default new Command({
    name: 'echo',
    description: 'Manage sending .',
    actions: [
        Action({
            name: 'send',
            args: [
                new Channel('channel', 'If not provided, send to current channel.' ).default(Channel.CURRENT),
                new Member('as', 'Send message as webhook with identity of specified user.').default(Member.CURRENT).explicit(),
                new Bool('server', 'Send message as webhook with identity of server.'),
                new Text('message', 'Text you want to send.').req().multi()
            ],
            auth: { permit: [RoleType.ADMIN, RoleType.MOD] },
            execute: async ({ as, server, channel, message }) => {
                if (server) {

                } else if (as) {
                    MessageService.sendMemberWebhook(channel, as, message)
                } else {
                    channel.send(message)
                }
            },
            description: 'Send text to specified channel.',
            examples: [['Text.'], ['#general', 'Text.'], ['-as', '@Michal', '#general', 'Text.']]
        })
    ]
})