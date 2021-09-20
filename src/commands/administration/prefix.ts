import Command from '../../model/Command'

import RoleType from '../../constants/RoleType'
import Config from '../../constants/Config'
import { Text, Switch } from '../../utils/Args'

const MessageService = require('../../service/MessageService')
const ServerService = require('../../service/ServerService')

export default new Command({
    name: 'prefix',
    description: 'Manage prefix for server.',
    aliases: ['pref'],
    actions: [
        {
            name: 'set',
            args: [
                new Text('prefix', `New prefix (max. length ${Config.MAX_PREFIX_LENGTH}).`).max(Config.MAX_PREFIX_LENGTH).req()
            ],
            auth: { permit: [RoleType.ADMIN] },
            execute: async ({ prefix }, { channel, guild }) => { // TODO: Typed args.
                await ServerService.updateById(guild.id, { prefix })
                MessageService.sendSuccess(channel, `Prefix for this server was set to \`${prefix}\``)
            },
            description: 'Set new prefix.',
            examples: [['&']]
        },
        {
            name: 'reset',
            args: [
                new Switch('reset')
            ],
            auth: { permit: [RoleType.ADMIN] },
            execute: async (args, { channel, guild }) => {
                await ServerService.updateById(guild.id, { prefix: Config.DEFAULT_PREFIX })
                MessageService.sendSuccess(channel, `Prefix for this server was reset to \`${Config.DEFAULT_PREFIX}\``)
            },
            description: `Reset prefix to default ${Config.DEFAULT_PREFIX}.`,
        },
        {
            name: 'get',
            execute: async (args, { channel, server }) => {
                MessageService.sendInfo(channel, `Current prefix: \`${server.prefix}\``)
            },
            description: 'Show current prefix.',
        }
    ]
})