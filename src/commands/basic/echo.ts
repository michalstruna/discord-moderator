import Command from '../../model/Command'
import RoleType from '../../constants/RoleType'
import MessageService from '../../service/MessageService'
import { Member, Channel, List, Bool } from '../../utils/Args'

export default new Command({
    name: 'echo',
    description: 'Manage sending .',
    actions: [
        {
            name: 'send',
            args: [
                new Channel('channel', 'If not provided, send to current channel.' ).elseCurrent(),
                new Member('as', 'Send message as webhook with identity of specified user.').explicit(),
                new Bool('server', 'Send message as webhook with identity of server.'),
                new List('message', 'Text you want to send.').req().join()
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
        }
    ]
})