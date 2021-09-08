const Config = require('../../constants/Config')
const RoleType = require('../../constants/RoleType')
const MessageService = require('../../service/MessageService')
const ServerService = require('../../service/ServerService')
const { Text, Bool } = require('../../utils/Args')

module.exports = {
    name: 'prefix',
    description: 'Manage prefix for server.',
    aliases: ['pref'],
    actions: [
        {
            name: 'set',
            args: [
                Text('prefix', `New prefix (max. length ${Config.MAX_PREFIX_LENGTH}).`).max(Config.MAX_PREFIX_LENGTH).req()
            ],
            allowRoles: [RoleType.ADMIN],
            execute: async ({ prefix }, { msg }) => {
                await ServerService.updateById(msg.guild.id, { prefix })
                MessageService.sendSuccess(msg.channel, `Prefix for this server was set to \`${prefix}\``)
            },
            description: 'Set new prefix.',
            examples: [['&']]
        },
        {
            name: 'reset',
            args: [
                Bool('reset').req()
            ],
            allowRoles: [RoleType.ADMIN],
            execute: async (args, { msg }) => {
                await ServerService.updateById(msg.guild.id, { prefix: Config.DEFAULT_PREFIX })
                MessageService.sendSuccess(msg.channel, `Prefix for this server was reset to \`${Config.DEFAULT_PREFIX}\``)
            },
            description: `Reset prefix to default ${Config.DEFAULT_PREFIX}.`,
        },
        {
            name: 'get',
            execute: async (args, { msg, server }) => {
                MessageService.sendInfo(msg.channel, `Current prefix: \`${server.prefix}\``)
            },
            description: 'Show current prefix.',
        }
    ]
}