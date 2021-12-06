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
        const added = roleId.filter(r => !member.roles.cache.find(role => role.id === r))
        await member.roles.add(added)
        return added
    }
    
    export const removeRole = async (member: GuildMember, ...roleId: string[]) => {
        const removed = roleId.filter(r => member.roles.cache.find(role => role.id === r))
        await member.roles.remove(removed)
        return removed
    }
    

}

export default UserService