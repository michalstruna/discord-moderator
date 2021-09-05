exports.getActionPerms = action => {
    if (action.perms.allowRoles.length + action.perms.forbidRoles.length > 0) {
        return { allow: action.perms.allowRoles || [], forbid: action.perms.forbidRoles || [] }
    } else {
        return { allow: action.perms.allowRolesDefault || [], forbid: action.perms.forbidRolesDefault || [] }
    }
}