
import { Guild } from 'discord.js'

import * as Db from './Db'
import RoleType from '../constants/RoleType'
import CommandService from './CommandService'
import { ServerData, ServerRoles } from '../model/types'

module ServerService {

    export const getById = async (id: string, guild: Guild): Promise<ServerData> => {
        let server: ServerData = await Db.Server.findOne({ id }).lean()
    
        if (!server && guild) {
            server = await new Db.Server({ id }).save()
            server = await setRoles(guild)
        }
        
        return server
    }
    
    export const setRoles = async (guild: Guild, roles?: ServerRoles) => {
        const id = guild.id
        const everyoneId = guild.roles.everyone.id
        roles = roles || { [RoleType.ADMIN]: everyoneId, [RoleType.MOD]: everyoneId, [RoleType.MEMBER]: everyoneId }
        return await Db.update(Db.Server, { id }, { roles, commands: CommandService.exportAll(roles, guild) })
    }
    
    export const updateById = async (id: string, update: Partial<ServerData>) => {
        return await Db.update(Db.Server, { id }, update as ServerData)
    }

}

export default ServerService