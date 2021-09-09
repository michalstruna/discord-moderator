const RoleType = require('../../constants/RoleType')
const MessageService = require('../../service/MessageService')
const { Member, Channel, List, Bool, ChannelClass } = require('../../utils/Args')

module.exports = {
    name: 'echo',
    description: 'Manage sending .',
    actions: [
        {
            name: 'send',
            args: [
                Channel('channel', 'If not provided, send to current channel.' ).default(ChannelClass.CURRENT),
                Member('as', 'Send message as webhook with identity of specified user.').explicit(),
                Bool('server', 'Send message as webhook with identity of server.'),
                List('message', 'Text you want to send.').req().join()
            ],
            allowRoles: [RoleType.ADMIN, RoleType.MOD],
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
}