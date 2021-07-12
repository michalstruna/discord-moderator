const Regex = require('../utils/Regex')
const ServerService = require('../service/ServerService')
const MessageService = require('../service/MessageService')
const Config = require('../constants/Config')
const Role = require('../constants/Role')

module.exports = {
    name: ['prefix'],
    description: 'Set prefix for server.',
    args: [
        { name: 'prefix', value: Regex.Type.ANY, flag: 'set' }
    ],
    perms: { set: Role.ADMIN, rm: Role.ADMIN },
    on: {
        async run(client, msg, { prefix }, { server }) {
            MessageService.sendInfo(msg.channel, `Prefix for this server is \`${server.prefix}\`.`)
        },
        async set(client, msg, { prefix }) {
            await ServerService.updateById(msg.guild.id, { prefix })
            MessageService.sendSuccess(msg.channel, `Prefix for this server was set to \`${prefix}\``)
        },
        async rm(client, msg) {
            await ServerService.updateById(msg.guild.id, { prefix: Config.DEFAULT_PREFIX })
            MessageService.sendSuccess(msg.channel, `Prefix for this server was set to default \`${Config.DEFAULT_PREFIX}\``)
        }
    }
}