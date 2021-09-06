const Pattern = require('../../constants/Pattern')
const Role = require('../../constants/Role')
const MessageService = require('../../service/MessageService')

module.exports = {
    name: 'echo',
    description: 'Manage sending .',
    actions: [
        {
            name: 'send',
            args: [
                { name: 'as', pattern: Pattern.FLAG('as', Pattern.MEMBER), required: false, description: 'Send message as webhook with identity of specified user.' },
                //{ name: 'title', pattern: Pattern.FLAG('title', Pattern.REST(Pattern.ANY)), required: false, description: 'Send message as webhook with identity of specified user.' },
                //{ name: 'color', pattern: Pattern.FLAG('title', Pattern.REST(Pattern.ANY)), required: false, description: 'Send message as webhook with identity of specified user.' },
                //{ name: 'footer', pattern: Pattern.FLAG('title', Pattern.REST(Pattern.ANY)), required: false, description: 'Send message as webhook with identity of specified user.' },
                { name: 'channel', pattern: Pattern.CHANNEL, required: false, description: 'If not provided, send to current channel.' },
                { name: 'message', pattern: Pattern.REST(Pattern.ANY), required: true, description: 'Text you want to send.' }
            ],
            allowRoles: [Role.ADMIN, Role.MOD],
            execute: async (client, msg, { as, channel, message }) => {
                if (as) {
                    MessageService.sendMemberWebhook(channel || msg.channel, as, message.join(' '))
                } else {
                    (channel || msg.channel).send(message.join(' '))
                }
            },
            description: 'Send text to specified channel.',
            examples: [['Text.'], ['#general', 'Text.'], ['-as', '@Michal', '#general', 'Text.']]
        }
    ]
}