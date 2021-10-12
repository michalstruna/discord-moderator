import RoleType from '../../constants/RoleType'
import MessageService from '../../service/MessageService'
import ServerService from '../../service/ServerService'
import { Text, List, Role, Bool, Cmd } from '../../model/Arg'
import { role, keyValueList, actionPerms, everyone } from '../../utils/Outputs'
import Command, { Action } from '../../model/Command'
 
export default new Command({
    name: 'perms',
    description: 'Manage command permissions.',
    actions: [
        Action({
            name: 'set',
            args: [
                new Cmd('command', 'Name of command.').req(),
                new Text('action', 'Command action.'),
                new List('roles', 'List of allowed roles.', new Role()).req(),
                new List('except', 'List of forbidden roles.', new Role()).explicit()
            ],
            auth: { permit: [RoleType.ADMIN] },
            execute: async ({ command, action, roles, except }, {  }) => {
                
            },
            description: 'Set perms for command/action.',
            examples: [['echo', '@Admin', '@Verified', '-except', '@Muted']]
        }),
        Action({
            name: 'default',
            args: [
                new Bool('default').req(),
                new Role('admin', 'Admin role.').default(Role.EVERYONE),
                new Role('mod', 'Mod role.').default(Role.EVERYONE),
                new Role('member', 'Member role.').default(Role.EVERYONE)
            ],
            auth: {permit: [RoleType.ADMIN] },
            execute: async ({ admin, mod, member }, { msg }) => {
                await ServerService.setRoles(msg.guild!, { [RoleType.ADMIN]: admin.id, [RoleType.MOD]: mod.id, [RoleType.MEMBER]: member.id })
                MessageService.sendSuccess(msg.channel, `Admin (${admin}), mod (${mod}) and member (${member}) roles were set.`)
            },
            description: 'Set default perm roles.',
            examples: [['-default', '@Admin', '@Moderator']]
        }),
        Action({
            name: 'reset',
            args: [
                new Bool('reset').req(),
                new Cmd('command')
            ],
            auth: {permit: [RoleType.ADMIN] },
            execute: async (args, meta) => {

            },
            description: 'Reset all perms or perms of command.',
            examples: [['-reset'], ['-reset', 'prefix']]
        }),
        Action({
            name: 'get',
            args: [
                new Cmd('command')
            ],
            execute: async ({ command }, { msg, server }) => {
                if (command) {
                    const serverCommand = server.commands[command.name]

                    MessageService.sendInfo(msg.channel, keyValueList(command.actions.map(action => (
                        [action.name, actionPerms(serverCommand.actions[action.name], msg.guild!.roles.everyone.id)]
                    )), true), `Perms • ${command.name}`)
                } else {
                    const roles = keyValueList([
                        ['Admin', RoleType.ADMIN], ['Mod', RoleType.MOD], ['Member', RoleType.MEMBER]
                    ].map(([name, value]) => {
                        const r = server.roles[value as RoleType]
                        return ([name, r === msg.guild!.roles.everyone.id ? everyone() : role(r)])
                    }), true)
    
                    MessageService.sendInfo(msg.channel, roles, 'Global perms')
                }
            },
            description: 'Show global perms settings or perms for command.',
            examples: [['prefix']]
        }),
    ]
})