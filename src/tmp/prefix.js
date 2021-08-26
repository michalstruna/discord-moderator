const Regex = require('../utils/Regex')
const ServerService = require('../service/ServerService')
const MessageService = require('../service/MessageService')
const Config = require('../constants/Config')
const Role = require('../constants/Role')

module.exports = {
    name: ['prefix'],
    description: 'Manage prefix for server.',
    args: [
        { name: 'prefix', value: Regex.Type.ANY, flag: 'set' }
    ],
    actions: {
        run: {
            execute: async (client, msg, { prefix }, { server }) => {
                MessageService.sendInfo(msg.channel, `Prefix for this server is \`${server.prefix}\`.`)
            },
            perms: Role.MEMBER,
            doc: {
                name: 'Show current prefix',
                pattern: 'prefix',
                examples: ['prefix']
            }
        },
        set: {
            execute: async (client, msg, { prefix }, { server }) => {
                await ServerService.updateById(msg.guild.id, { prefix })
                MessageService.sendSuccess(msg.channel, `Prefix for this server was set to \`${prefix}\``)
            },
            perms: Role.ADMIN,
            doc: {
                name: 'Set new prefix',
                pattern: 'prefix [prefix]',
                args: [
                    { name: 'prefix', description: 'New prefix.' }
                ],
                examples: ['prefix &']
            }
        },
        rm: {
            execute: async (client, msg, { prefix }, { server }) => {
                await ServerService.updateById(msg.guild.id, { prefix: Config.DEFAULT_PREFIX })
                MessageService.sendSuccess(msg.channel, `Prefix for this server was set to default \`${Config.DEFAULT_PREFIX}\``)
            },
            perms: Role.ADMIN,
            doc: {
                name: 'Reset prefix to default',
                pattern: 'prefix -rm',
                examples: ['prefix -rm']
            }
        }
    }
}