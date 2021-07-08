const Regex = require('../utils/Regex')
const Argument = require('../constants/Argument')
const ServerService = require('../service/ServerService')
const MessageService = require('../service/MessageService')
const Config = require('../constants/Config')
const CommandService = require('../service/CommandService')

module.exports = {
    name: 'prefix',
    description: 'Set prefix for server.',
    args: [
        Argument.REMOVE,
        { name: 'prefix', value: Regex.Type.ANY }
    ],
    async execute(client, msg, { prefix, remove }, { server }) {
        if (prefix) {
            if (remove) {
                await ServerService.updateById(msg.guild.id, { prefix: Config.DEFAULT_PREFIX })
                MessageService.sendEmbeddedSuccess(msg.channel, `Prefix for this server was set to default \`${Config.DEFAULT_PREFIX}\``)
            } else {
                await ServerService.updateById(msg.guild.id, { prefix })
                MessageService.sendEmbeddedSuccess(msg.channel, `Prefix for this server changed from \`${server.prefix}\` to \`${prefix}\`.`)
            }
        } else {
            MessageService.sendEmbeddedInfo(msg.channel, `Prefix for this server is: \`${server.prefix}\`.`)
        }

    }
}

/*
CommandService.create('prefix', 'Set prefix for server', {
    args: [
        { name: 'prefix', value: Regex.Type.ANY }
    ],
    onRun: (client, msg, { prefix, remove }, { server }) => {

    },
    onGet: (client, msg, { prefix, remove }, { server }) => {
        await ServerService.updateById(msg.guild.id, { prefix: Config.DEFAULT_PREFIX })
        return `Prefix for this server was set to default \`${Config.DEFAULT_PREFIX}\``
    },
    onSet: (client, msg, { prefix, remove }, { server }) => {
        await ServerService.updateById(msg.guild.id, { prefix })
        return `Prefix for this server changed from \`${server.prefix}\` to \`${prefix}\`.`
    },
    onRemove: (client, msg, { prefix, remove }, { server }) => {
        await ServerService.updateById(msg.guild.id, { prefix: Config.DEFAULT_PREFIX })
        return `Prefix for this server was set to default \`${Config.DEFAULT_PREFIX}\``
    },
    onEnd: (client, msg, { prefix, remove }, { server }) => {

    }
})
*/