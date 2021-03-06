export default {
    ANY: /^.*$/,
    INT: /^[0-9]$/,
    REAL: /^[0-9]+(\.[0-9]+)?$/,
    MEMBER: /^<@!?[0-9]{18}>$/,
    ROLE: /^<&@[0-9]{18}>$/,
    CHANNEL: /^<#[0-9]{18}>$/,
    MESSAGE: /^[0-9]{18}$/
}