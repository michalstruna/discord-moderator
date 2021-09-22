import { Action } from '../model/types'

exports.getActionPerms = (action: Action) => {
    const permit = action.auth?.permit
    const deny = action.auth?.deny

    if ((permit && permit.length > 0) || deny && deny.length) {
        return { allow: action?.auth?.permit || [], forbid: action?.auth?.deny || [] }
    } else {
        return { allow: action.auth?.permit || [], forbid: action.auth?.deny || [] }
    }
}