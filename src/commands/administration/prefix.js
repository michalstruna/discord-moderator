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
                { name: 'prefix', pattern: Pattern.VAL_OF_LENGTH(Config.MAX_PREFIX_LENGTH), required: true, description: 'New prefix (max. length 10).' }
            ],
            allowRoles: [Role.ADMIN],
            execute: async (client, msg, { prefix }) => {
                await ServerService.updateById(msg.guild.id, { prefix })
                MessageService.sendSuccess(msg.channel, `Prefix for this server was set to \`${prefix}\``)
            },
            description: 'Set new prefix.',
            pattern: 'prefix [prefix]',
            examples: ['prefix &']
        },
        {
            args: [
                { name: '-reset', pattern: Pattern.FLAG('-reset'), required: true }
            ],
            allowRoles: [Role.ADMIN],
            execute: async (client, msg) => {
                await ServerService.updateById(msg.guild.id, { prefix: Config.DEFAULT_PREFIX })
                MessageService.sendSuccess(msg.channel, `Prefix for this server was reset to \`${Config.DEFAULT_PREFIX}\``)
            },
            description: `Reset prefix to default ${Config.DEFAULT_PREFIX}.`,
            pattern: 'prefix -reset'
        },
        {
            execute: async (client, msg, args, { server }) => {
                MessageService.sendInfo(msg.channel, `Current prefix: \`${server.prefix}\``)
            },
            description: 'Show current prefix.',
            pattern: 'prefix'
        }
    ]
}