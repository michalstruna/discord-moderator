import RoleType from '../../constants/RoleType'
import ServerService from '../../service/ServerService'
import { Text, List, Role, Cmd, Switch } from '../../model/Arg'
import { role, keyValueList, actionPerms, everyone } from '../../utils/Outputs'
import Command, { Action } from '../../model/Command'
import CommandCategory from '../../constants/CommandCategory'
import Io from '../../service/Io'
 
export default new Command({
    name: 'acl',
    category: CommandCategory.ADMINISTRATION,
    description: 'Manage command permissions.',
    actions: [
        Action({
            name: 'set',
            args: [
                new Cmd('command', 'Name of command.').req(),
                new Text('action', 'Command action.').explicit(),
                new List('permit', 'List of allowed roles.', new Role()).req(),
                new List('deny', 'List of denied roles.', new Role()).explicit()
            ],
            auth: { permit: [RoleType.ADMIN] },
            execute: async ({ command, action, permit, deny }, { server }) => {
                const actions = action ? [action] : undefined
                await ServerService.setCommandAcl(server.id, command.name, actions, { permit, deny })
            },
            description: 'Set perms for command/action.',
            examples: [['echo', '@Admin', '@Verified', '-except', '@Muted']]
        }),
        Action({
            name: 'default',
            args: [
                new Switch('default'),
                new Role('admin', 'Admin role.').default(Role.EVERYONE),
                new Role('mod', 'Mod role.').default(Role.EVERYONE),
                new Role('member', 'Member role.').default(Role.EVERYONE)
            ],
            auth: {permit: [RoleType.ADMIN] },
            execute: async ({ admin, mod, member }, { msg }) => {
                await ServerService.setRoles(msg.guild!, { [RoleType.ADMIN]: admin.id, [RoleType.MOD]: mod.id, [RoleType.MEMBER]: member.id })
                Io.success(msg.channel, `Admin (${admin.toString()}), mod (${mod.toString()}) and member (${member.toString()}) roles were set.`)
            },
            description: 'Set default perm roles.',
            examples: [['-default', '@Admin', '@Moderator']]
        }),
        Action({
            name: 'reset',
            args: [
                new Switch('reset'),
                new Cmd('command'),
                new Text('action')
            ],
            auth: { permit: [RoleType.ADMIN] },
            execute: async ({ command, action }, { server }) => {
                if (command) {
                    await ServerService.setCommandAcl(server.id, command.name, action ? [action] : undefined)
                } else {
                    // TODO
                }
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

                    Io.info(msg.channel, { description: keyValueList(command.actions.map(action => (
                        [action.name, actionPerms(serverCommand.actions[action.name], msg.guild!.roles.everyone.id)]
                    )), true), title: `ACL • ${command.name}` })
                } else {
                    const roles = keyValueList([
                        ['Admin', RoleType.ADMIN], ['Mod', RoleType.MOD], ['Member', RoleType.MEMBER]
                    ].map(([name, value]) => {
                        const r = server.roles[value as RoleType]
                        return ([name, r === msg.guild!.roles.everyone.id ? everyone() : role(r)])
                    }), true)
    
                    Io.info(msg.channel, { description: roles, title: 'Global perms' })
                }
            },
            description: 'Show global perms settings or perms for command.',
            examples: [['prefix']]
        }),
    ]
})