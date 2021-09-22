import { ServerAction } from '../model/types'

export const getActionPerms = (action: ServerAction) => {
    const permit = action.auth?.permit
    const deny = action.auth?.deny

    if ((permit && permit.length > 0) || deny && deny.length) {
        return { allow: action?.auth?.permit || [], forbid: action?.auth?.deny || [] }
    } else {
        return { allow: action.auth?.permitDefault || [], forbid: action.auth?.denyDefault || [] }
    }
}