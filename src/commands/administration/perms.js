const RoleType = require('../../constants/RoleType')
const MessageService = require('../../service/MessageService')
const ServerService = require('../../service/ServerService')
const { Command, Text, List, Role, Bool, RoleClass } = require('../../utils/Args')
const { role, keyValueList, actionPerms, everyone } = require('../../utils/Outputs')

module.exports = {
    name: 'perms',
    description: 'Manage command permissions.',
    actions: [
        {
            name: 'set',
            args: [
                Command('command', 'Name of command.').req(),
                Text('action', 'Command action.'),
                List('roles', 'List of allowed roles.').of(Role()).req(),
                List('except', 'List of forbidden roles.').of(Role()).explicit()
            ],
            allowRoles: [RoleType.ADMIN],
            execute: async ({ command, action, roles, except }, {  }) => {

            },
            description: 'Set perms for command/action.',
            examples: [['echo', '@Admin', '@Verified', '-except', '@Muted']]
        },
        {
            name: 'default',
            args: [
                Bool('default').req(),
                Role('admin', 'Admin role.').default(RoleClass.EVERYONE),
                Role('mod', 'Mod role.').default(RoleClass.EVERYONE),
                Role('member', 'Member role.').default(RoleClass.EVERYONE)
            ],
            allowRoles: [RoleType.ADMIN],
            execute: async ({ admin, mod, member }, { msg }) => {
                await ServerService.setPerms(msg.guild, { [RoleType.ADMIN]: admin.id, [RoleType.MOD]: mod.id, [RoleType.MEMBER]: member.id })
                MessageService.sendSuccess(msg.channel, `Admin (${admin}), mod (${mod}) and member (${member}) roles were set.`)
            },
            description: 'Set default perm roles.',
            examples: [['-default', '@Admin', '@Moderator']]
        },
        {
            name: 'reset',
            args: [
                Bool('reset').req(),
                Command('command')
            ],
            allowRoles: [RoleType.ADMIN],
            execute: async (args, meta) => {

            },
            description: 'Reset all perms or perms of command.',
            examples: [['-reset'], ['-reset', 'prefix']]
        },
        {
            name: 'get',
            args: [
                Command('command')
            ],
            execute: async ({ command }, { msg, server }) => {
                if (command) {
                    const serverCommand = server.commands.get(command.name)
                    MessageService.sendInfo(msg.channel, keyValueList(command.actions.map(a => (
                        [a.name, actionPerms(serverCommand.actions.get(a.name), msg.guild.roles.everyone.id)]
                    )), true), `Perms • ${command.name}`)
                } else {
                    const roles = keyValueList([
                        ['Admin', RoleType.ADMIN], ['Mod', RoleType.MOD],['Member', RoleType.MEMBER]
                    ].map(([name, value]) => {
                        const r = server.roles.get(value)
                        return ([name, r === msg.guild.roles.everyone.id ? everyone() : role(r)])
                    }), true)
    
                    MessageService.sendInfo(msg.channel, roles, 'Global perms')
                }
            },
            description: 'Show global perms settings or perms for command.',
            examples: [['prefix']]
        },
    ]
}