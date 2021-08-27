const Pattern = require('../../constants/Pattern')
const Role = require('../../constants/Role')
const MessageService = require('../../service/MessageService')
const ServerService = require('../../service/ServerService')

module.exports = {
    name: 'help',
    description: 'Show help.',
    aliases: ['?', 'man', 'doc', 'docs', 'cmd', 'command', 'commands'],
    actions: [
        {
            args: [
                { name: 'prefix', pattern: Pattern.ANY, required: true }
            ],
            allowRoles: [Role.ADMIN],
            execute: async (client, msg, { prefix }) => {
                await ServerService.updateById(msg.guild.id, { prefix })
                MessageService.sendSuccess(msg.channel, `Prefix for this server was set to \`${prefix}\``)
            },
            description: 'Set new prefix.',
            examples: ['prefix &']
        },
        {
            execute: async (client, msg, args, { server }) => {
                MessageService.sendInfo(msg.channel, `Current prefix: \`${server.prefix}\``)
            },
            description: 'Show current prefix.',
            examples: ['prefix'],
        }
    ]
}