import { ServerAction } from '../model/types'
import { unique } from './Collections'
import { getActionPerms } from './Perms'

export const member = (id: string) => `<@${id}>`
export const role = (id: string) => `<@&${id}>`
export const channel = (id: string) => `<#${id}>`
export const everyone = () => '@everyone'

export const list = (values: string[], lastSeparator = 'or') => values.join(', ').replace(/, ([^,]*)$/, ` ${lastSeparator} $1`)
export const codeList = (values: string[], lastSeparator = 'or') => list(values.map(val => `\`${val}\``), lastSeparator)

export const keyValueList = (pairs: [string, string][], bold = false) => pairs.map(([key, value]) => {
    const edge = bold ? '**' : ''
    return `${edge}${key}:${edge} ${value}`
}).join('\n')

export const actionPerms = (serverAction: ServerAction, everyoneId: string) => { // TODO: Move to action.
    const { allow, forbid } = getActionPerms(serverAction)
    const allowRoles = list(allow.length > 0 ? unique(allow).map((r: string) => r === everyoneId ? everyone() : role(r)) : [everyone()], 'and')
    const forbidRoles = list(unique(forbid).map((r: string) => r === everyoneId ? everyone() : role(r)), 'and')

    return [allowRoles, ...(forbid.length > 0 ? ['except', forbidRoles] : [])].join(' ')
}