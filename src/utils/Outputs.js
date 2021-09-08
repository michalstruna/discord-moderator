const { getActionPerms } = require('./Perms')

const member = exports.member = id => `<@${id}>`
const role = exports.role = id => `<@&${id}>`
const channel = exports.channel = id => `<#${id}>`
const everyone = exports.everyone = () => '@everyone'

const list = exports.list = (values, lastSeparator = 'or') => [...new Set(values)].join(', ').replace(/, ([^,]*)$/, ` ${lastSeparator} $1`)
const codeList = exports.codeList = (values, lastSeparator = 'or') => list(values.map(val => `\`${val}\``), lastSeparator)

const keyValueList = exports.keyValueList = (pairs, bold = false) => pairs.map(([key, value]) => {
    const edge = bold ? '**' : ''
    return `${edge}${key}:${edge} ${value}`
}).join('\n')

exports.actionPerms = (serverAction, everyoneId) => {
    const { allow, forbid } = getActionPerms(serverAction)
    const allowRoles = list(allow.length > 0 ? allow.map(r => r === everyoneId ? everyone() : role(r)) : [everyone()], 'and')
    const forbidRoles = list(forbid.map(r => r === everyoneId ? everyone() : role(r)), 'and')

    return [allowRoles, ...(forbid.length > 0 ? ['except', forbidRoles] : [])].join(' ')
}