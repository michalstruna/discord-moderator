const Pattern = require('../../constants/Pattern')
const Role = require('../../constants/Role')

module.exports = {
    name: 'prefix',
    description: 'Manage prefix for server.',
    aliases: ['pref'],
    actions: [
        {
            args: [
                { name: 'prefix', pattern: Pattern.ANY, required: true }
            ],
            allowRoles: [Role.ADMIN],
            description: 'Set new prefix.',
            examples: ['prefix &']
        },
        {
            description: 'Show current prefix.',
            examples: ['prefix']
        }
    ]
}