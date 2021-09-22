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

}

export default UserService