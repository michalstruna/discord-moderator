exports.member = id => `<@${id}>`
exports.role = id => `<@&${id}>`
exports.channel = id => `<#${id}>`
exports.everyone = () => '@everyone'

exports.list = (values, lastSeparator = 'or') => values.join(', ').replace(/, ([^,]*)$/, ` ${lastSeparator} $1`)