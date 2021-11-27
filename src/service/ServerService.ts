
import { Guild } from 'discord.js'

import Db from './Db'
import RoleType from '../constants/RoleType'
import CommandService from './CommandService'
import { Auth, ServerData, ServerRoles } from '../model/types'

module ServerService {

    export const getById = async (id: string, guild?: Guild): Promise<ServerData> => {
        let server: ServerData = await Db.Server.findOne({ id }).lean()
    
        if (!server && guild) {
            server = await new Db.Server({ id }).save()
            server = await setRoles(guild)
        }
        
        return server
    }
    
    export const setRoles = async (guild: Guild, roles?: ServerRoles) => {
        const everyoneId = guild.roles.everyone.id
        roles = roles || { [RoleType.ADMIN]: everyoneId, [RoleType.MOD]: everyoneId, [RoleType.MEMBER]: everyoneId }
        return await Db.update(Db.Server, { id: guild.id }, { roles, commands: CommandService.exportAll(roles, guild) })
    }

    export const setCommandAcl = async (serverId: string, commandName: string, actionNames?: string[], auth?: Auth) => {
        const actions = (await getById(serverId)).commands[commandName].actions

        const permit = auth ? auth.permit.map(r => r.id) : []
        const deny = auth ? (auth.deny || []).map(r => r.id) : []

        for (const actionName in actions) {
            if (actionNames && !actionNames.includes(actionName)) continue
            const action = actions[actionName]
            action.auth.permit = permit
            action.auth.deny = deny
        }

        return await updateById(serverId, { [`commands.${commandName}.actions`]: actions })        
    }

    export const resetAcl = async (sererId: string) => {

    }
    
    export const updateById = async (id: string, update: Partial<ServerData>) => {
        return await Db.update(Db.Server, { id }, update as ServerData)
    }

}

export default ServerService