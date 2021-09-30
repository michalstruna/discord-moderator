import Command, { Action } from '../../model/Command'
import RoleType from '../../constants/RoleType'
import Config from '../../constants/Config'
import { Text, Switch } from '../../utils/Args'
import MessageService from '../../service/MessageService'
import ServerService from '../../service/ServerService'

export default new Command({
    name: 'prefix',
    description: 'Manage prefix for server.',
    aliases: ['pref'],
    actions: [
        Action({
            name: 'set',
            args: [
                new Text('prefix', `New prefix (max. length ${Config.MAX_PREFIX_LENGTH}).`).max(Config.MAX_PREFIX_LENGTH).req()
            ],
            auth: { permit: [RoleType.ADMIN] },
            execute: async ({ prefix }, { msg }) => {
                await ServerService.updateById(msg.guild!.id, { prefix })
                MessageService.sendSuccess(msg.channel, `Prefix for this server was set to \`${prefix}\``)
            },
            description: 'Set new prefix.',
            examples: [['&']]
        }),
        Action({
            name: 'reset',
            args: [
                new Switch('reset')
            ],
            auth: { permit: [RoleType.ADMIN] },
            execute: async (args, { msg }) => {
                await ServerService.updateById(msg.guild!.id, { prefix: Config.DEFAULT_PREFIX })
                MessageService.sendSuccess(msg.channel, `Prefix for this server was reset to \`${Config.DEFAULT_PREFIX}\``)
            },
            description: `Reset prefix to default ${Config.DEFAULT_PREFIX}.`,
        }),
        Action({
            name: 'get',
            execute: async (args, { msg, server }) => {
                MessageService.sendInfo(msg.channel, `Current prefix: \`${server.prefix}\``)
            },
            description: 'Show current prefix.',
        })
    ]
})