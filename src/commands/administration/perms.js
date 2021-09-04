const Pattern = require('../../constants/Pattern')
const Role = require('../../constants/Role')
const MessageService = require('../../service/MessageService')
const ServerService = require('../../service/ServerService')
const { role } = require('../../utils/Outputs')

module.exports = {
    name: 'perms',
    description: 'Set perms roles.',
    actions: [
        {
            name: 'set',
            args: [
                { name: 'admin', pattern: Pattern.ROLE, required: true, description: 'Admin role.' },
                { name: 'mod', pattern: Pattern.ROLE, required: false, description: 'Mod role.' },
                { name: 'member', pattern: Pattern.ROLE, required: false, description: 'Member role.' }
            ],
            roles: [Role.ADMIN],
            execute: async (client, msg, { admin, mod, member }) => {
                mod = mod || msg.guild.roles.everyone
                member = member || msg.guild.roles.everyone

                await ServerService.setPerms(msg.guild.id, { [Role.ADMIN]: admin.id, [Role.MOD]: mod.id, [Role.MEMBER]: member.id }, msg.guild)
                MessageService.sendSuccess(msg.channel, `Admin (${admin}), mod (${mod}) and member (${member}) roles were set.`)
            },
            description: 'Set perm roles for commands.',
            examples: [['@Admin', '@Moderator', '@Member'], ['@Admin']]
        },
        {
            name: 'get',
            roles: [Role.ADMIN],
            execute: async (client, msg, args, { server }) => {
                const roles = [
                    ['Admin', Role.ADMIN],
                    ['Mod', Role.MOD],
                    ['Member', Role.MEMBER]
                ].map(([name, value]) => `**${name}:** ${role(server.roles.get(value))}`).join('\n')

                MessageService.sendInfo(msg.channel, roles, 'Global perms')
            },
            description: 'Show global perms settings.'
        },
    ]
}