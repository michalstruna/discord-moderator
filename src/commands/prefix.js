const Regex = require('../utils/Regex')
const ServerService = require('../service/ServerService')
const MessageService = require('../service/MessageService')
const Config = require('../constants/Config')

module.exports = {
    name: 'prefix',
    description: 'Set prefix for server.',
    args: [
        { name: 'prefix', value: Regex.Type.ANY, main: true }
    ],
    on: {
        async run(client, msg, { prefix }, { server }) {
            if (prefix) {
                await ServerService.updateById(msg.guild.id, { prefix })
                MessageService.sendSuccess(msg.channel, `Prefix for this server was set to \`${prefix}\``)
            } else {
                MessageService.sendInfo(msg.channel, `Prefix for this server is \`${server.prefix}\`.`)
            }
        },
        async rm() {
            await ServerService.updateById(msg.guild.id, { prefix: Config.DEFAULT_PREFIX })
            MessageService.sendSuccess(msg.channel, `Prefix for this server was set to default \`${Config.DEFAULT_PREFIX}\``)
        }
        
    }
}