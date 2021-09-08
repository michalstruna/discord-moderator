const Db = require('./Db')
const RoleType = require('../constants/RoleType')
const CommandService = require('./CommandService')

exports.getById = async (id, guild = null) => {
    let server = await Db.Server.findOne({ id })

    if (!server && guild) {
        server = await new Db.Server({ id }).save()
        server = await exports.setPerms(guild)
    }
    
    return server
}

exports.setPerms = async (guild, roles = null) => {
    const id = guild.id
    const everyoneId = guild.roles.everyone.id
    roles = roles || { [RoleType.ADMIN]: everyoneId, [RoleType.MOD]: everyoneId, [RoleType.MEMBER]: everyoneId }
    return await Db.update(Db.Server, { id }, { roles, commands: CommandService.exportAll(roles, guild) })
}

exports.updateById = async (id, update) => {
    return await Db.update(Db.Server, { id }, update)
}