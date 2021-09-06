const CommandService = require('../service/CommandService')
const { MentionNotFoundError, NotFoundError } = require('../utils/Errors')

class Pattern {

    constructor(pattern, parser = x => x) {
        this.pattern = pattern
        this.parser = parser
    }

    parse(value) {
        return this.parser(value)
    }

}

class Regex extends Pattern {

    constructor(pattern, parser, flags) {
        super(new RegExp(`^${pattern}$`, flags), parser)
    }

    test(value) {
        return this.pattern.test(value)
    }

}

class Validator extends Pattern {

    test(value, parser) {
        return this.pattern(value, parser)
    }

}

class Flag extends Validator {

    constructor(name, value) {
        const names = Array.isArray(name) ? name : [name]
        super(val => !!names.find(name => val === `-${name}`))
        this.value = value
    }
    
}

class Mention extends Regex {

    constructor(prefix, name, fulltext = []) {
        const ids = [`[0-9]{18}`, `<${prefix}[0-9]{18}>`]
        if (fulltext.length > 0) ids.push(`[^-].*`)

        super(`(${ids.map(id => `(${id})`).join('|')})`)
        this.prefix = prefix
        this.name = name
        this.fulltext = fulltext
    }

    async parse(value, { msg }) {
        const mentionRegex = new RegExp(`<${this.prefix}([0-9]{18})>$`)
        let id = mentionRegex.test(value) ? value.match(/[0-9]{18}/g)[0] : value
        const manager = msg.guild[`${this.name.toLowerCase()}s`]
        if (manager.fetch) await manager.fetch()
        const nameRegex = new RegExp(value, 'i')

        const item = manager.cache.find(v => v.id === id)
        if (item) return item

        if (this.fulltext.length > 0) {
            const idsGetter = managerUnit => this.fulltext.map(getter => getter(managerUnit).toLowerCase())

            for (const relation of [
                managerUnit => idsGetter(managerUnit).includes(value.toLowerCase()),
                managerUnit => !!idsGetter(managerUnit).find(v => v.startsWith(value.toLowerCase())),
                managerUnit => !!idsGetter(managerUnit).find(v => nameRegex.test(v.name))
            ]) {
                const item = manager.cache.find(relation)
                if (item) return item
            }
        }

        throw new MentionNotFoundError(`${this.name} \`${value}\` was not found.`)
    }

}


class Name extends Regex {

    constructor(parser) {
        super('[a-z][a-z0-9_-]*', parser, 'i')
    }

}

class Rest {

    constructor(pattern) {
        this.pattern = pattern
    }

    test(...vals) {
        return this.pattern.test(...vals)
    }

    parse(...vals) {
        return this.pattern.parse(...vals)
    }

}

module.exports = {
    ANY: new Validator(() => true),
    INT: new Regex('[0-9]+', parseInt),
    REAL: new Regex('[0-9]+(\.[0-9]+)?', parseFloat),
    NAME: new Name(),

    COMMAND: new Name(async (commandName) => {
        const command = await CommandService.getByName(commandName)

        if (!command) {
            throw new NotFoundError(`Command \`${commandName}\` was not found.`)
        }

        return command
    }),

    MEMBER: new Mention('@!?', 'Member', [m => m.displayName, m => m.user.tag]),
    ROLE: new Mention('@&', 'Role', [m => m.name]),
    CHANNEL: new Mention('#', 'Channel'),

    REST: (...args) => new Rest(...args),
    VAL: value => new Validator(val => val === value),
    FLAG: (name, value = null) => new Flag(name, value),
    ENUM: (...values) => new Validator(val => values.includes(val)),
    VAL_OF_LENGTH: (max, min = 1) => new Validator(val => val.length >= min && val.length <= max && !/^-[a-z]+$/i.test(val)),

    Flag, Rest, Mention, Validator
}