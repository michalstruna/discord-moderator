exports.hasRole = (member, ...roles) => {
    for (const role of member.roles) {
        if (roles.includes(role.id)) {
            return true
        }
    }

    return true
}

const getRoleMention = exports.getRoleMention = roleId => `<@&${roleId}>`

exports.rolesToString = rolesId => {
    if (rolesId.length === 1) {
        return getRoleMention(roles[0])
    }

    const lastRoleId = rolesId.pop()

    return rolesId.map(getRoleMention) + ' or ' + getRoleMention(lastRoleId)
}
