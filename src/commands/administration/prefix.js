const Config = require('../../constants/Config')
const Pattern = require('../../constants/Pattern')
const Role = require('../../constants/Role')
const MessageService = require('../../service/MessageService')
const ServerService = require('../../service/ServerService')

module.exports = {
    name: 'prefix',
    description: 'Manage prefix for server.',
    aliases: ['pref'],
    actions: [
        {
            args: [
                { name: 'prefix', pattern: Pattern.ANY_OF_MAX_LENGTH(Config.MAX_PREFIX_LENGTH), required: true, description: 'New prefix (max. length 10).' },
                { name: 'reason', pattern: Pattern.REST, required: true }
            ],
            allowRoles: [Role.ADMIN],
            execute: async (client, msg, { prefix, reason }) => {
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