import { GuildMember } from 'discord.js'

module UserService {

    export const hasRole = (member: GuildMember, ...roles: string[]) => {
        for (const role of roles) {
            if (member.roles.cache.has(role)) {
                return true
            }
        }

        return false
    }

    export const addRole = async (member: GuildMember, ...roleId: string[]) => {
        return await member.roles.add(roleId.filter(r => !member.roles.cache.find(role => role.id === r)))
    }
    
    export const removeRole = async (member: GuildMember, ...roleId: string[]) => {
        return await member.roles.remove(roleId.filter(r => member.roles.cache.find(role => role.id === r)))
    }
    

}

export default UserService