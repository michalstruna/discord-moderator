const Pattern = require('../../constants/Pattern')
const Role = require('../../constants/Role')
const MessageService = require('../../service/MessageService')
const ServerService = require('../../service/ServerService')
const { role, keyValueList, actionPerms, everyone } = require('../../utils/Outputs')

module.exports = {
    name: 'perms',
    description: 'Manage command permissions.',
    actions: [
        {
            name: 'set',
            args: [
                { name: 'command', pattern: Pattern.COMMAND, required: true },
                { name: 'action', pattern: Pattern.NAME, required: false },
                { name: 'roles', pattern: Pattern.REST(Pattern.ROLE), required: true },
                { name: 'except', pattern: Pattern.FLAG('except'), required: false },
                { name: 'exceptRoles', pattern: Pattern.REST(Pattern.ROLE), required: false },
            ],
            allowRoles: [Role.ADMIN],
            execute: async (client, msg, { command, action, roles, except, exceptRoles }, meta) => {

            },
            description: 'Set perms for command/action.',
            examples: [['echo', '@Admin', '@Verified', '-except', '@Muted']]
        },
        {
            name: 'default',
            args: [
                { name: 'default', pattern: Pattern.FLAG('default'), required: true },
                { name: 'admin', pattern: Pattern.ROLE, required: true, description: 'Admin role.' },
                { name: 'mod', pattern: Pattern.ROLE, required: false, description: 'Mod role.' },
                { name: 'member', pattern: Pattern.ROLE, required: false, description: 'Member role.' }
            ],
            allowRoles: [Role.ADMIN],
            execute: async (client, msg, { admin, mod, member }) => {
                mod = mod || msg.guild.roles.everyone
                member = member || msg.guild.roles.everyone

                await ServerService.setPerms(msg.guild, { [Role.ADMIN]: admin.id, [Role.MOD]: mod.id, [Role.MEMBER]: member.id })
                MessageService.sendSuccess(msg.channel, `Admin (${admin}), mod (${mod}) and member (${member}) roles were set.`)
            },
            description: 'Set default perm roles.',
            examples: [['-default', '@Admin', '@Moderator']]
        },
        {
            name: 'reset',
            args: [
                { name: 'reset', pattern: Pattern.FLAG('reset'), required: true },
                { name: 'command', pattern: Pattern.COMMAND, required: false }
            ],
            allowRoles: [Role.ADMIN],
            execute: async (client, msg, args, meta) => {

            },
            description: 'Reset all perms or perms of command.',
            examples: [['-reset'], ['-reset', 'prefix']]
        },
        {
            name: 'get',
            args: [
                { name: 'command', pattern: Pattern.COMMAND, required: false }
            ],
            execute: async (client, msg, { command }, { server }) => {
                if (command) {
                    const serverCommand = server.commands.get(command.name)
                    MessageService.sendInfo(msg.channel, keyValueList(command.actions.map(a => (
                        [a.name, actionPerms(serverCommand.actions.get(a.name), msg.guild.roles.everyone.id)]
                    )), true), `Perms • ${command.name}`)
                } else {
                    const roles = keyValueList([
                        ['Admin', Role.ADMIN], ['Mod', Role.MOD],['Member', Role.MEMBER]
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