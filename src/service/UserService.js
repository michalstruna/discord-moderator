exports.hasRole = (member, ...roles) => {
    for (const role of roles) {
        if (member.roles.cache.has(role)) {
            return true
        }
    }

    return false
}

const getRoleMention = exports.getRoleMention = roleId => `<@&${roleId}>`

exports.rolesToString = rolesId => {
    if (rolesId.length === 1) {
        return getRoleMention(roles[0])
    }

    const lastRoleId = rolesId.pop()

    return rolesId.map(getRoleMention) + ' or ' + getRoleMention(lastRoleId)
}
