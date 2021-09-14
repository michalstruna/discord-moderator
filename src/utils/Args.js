const argv = require('yargs-parser')

const { InvalidInputError, NotFoundError } = require('./Errors')
const { codeList } = require('./Outputs')
const CommandService = require('../service/CommandService')

const formatList = (vals, getter = x => x) => codeList(vals.map(getter), 'and')

class TestedArgsSet {

    constructor(args, rules) {
        this.args = args
        this.rules = rules
    }

    async parse(meta) {
        const parsed = {}

        for (const rule of this.rules) {
            const arg = this.args[rule.name]

            if (arg !== undefined) {
                parsed[rule.name] = await rule.parse(arg, meta) // TODO: Promise.all?
            }
        }

        return parsed
    }

}

class ArgsSet {

    constructor(input) {
        this.input = input
        this.args = argv(input)
    }

    shift() {
        return this.args._.shift()
    }

    /** Test if args set can accept all rules. */
    test(rules) {
        const tested = {}
        let tmpRules = [...rules]
        let reqRules = [...rules.filter(r => r.required)]
        let tmpArgs = [...this.args._]

        for (const key in this.args) {
            if (key === '_') continue
            const rule = tmpRules.find(r => r.name === key)
            const isList = rule instanceof List
            if (!rule) throw new InvalidInputError(`Unexpected argument \`${key}\`.`)
            if (!rule.test(this.args[key])) throw InvalidInputError(`Invalid argument \`${key}\`.`)
            tested[key] = isList ? [this.args[key]] : this.args[key]

            if (!isList || reqRules.length > tmpArgs.length) {
                tmpRules = tmpRules.filter(r => r.name !== key)
                reqRules = reqRules.filter(r => r.name != key)
            }
        }

        const reqExplRules = reqRules.filter(r => r.needName)
        if (reqExplRules.length > 0) throw new InvalidInputError(`You have to specify ${formatList(reqExplRules, r => r.name)}`)
        tmpRules = tmpRules.filter(r => !r.needName)

        while (true) {
            if (tmpRules.length === 0 && tmpArgs.length === 0) { // All rules and args are consumed.
                return new TestedArgsSet(tested, rules)
            }

            if (tmpRules.length === 0 && tmpArgs.length > 0) { // There are args, but no rules.
                throw new InvalidInputError(`Unknown argument ${formatList(tmpArgs)}.`)
            }

            if (tmpArgs.length === 0 && tmpRules.length > 0) { // There are rules, but no args.
                if (reqRules.length == 0) return new TestedArgsSet(tested, rules)
                throw new InvalidInputError(`You have to specify ${formatList(reqRules, r => r.name)}.`)
            }

            const rule = tmpRules[0], arg = tmpArgs[0]
            const isList = rule instanceof List

            if ((rule.required || reqRules.length < tmpArgs.length) && rule.test(arg)) { // Consume rule and arg.
                tested[rule.name] = isList ? [...(tested[rule.name] || []), arg] : arg

                if (!isList || reqRules.length > tmpArgs.length - 1) {
                    tmpRules.shift()
                    if (rule.required) reqRules.shift()
                }

                tmpArgs.shift()
                continue
            }

            if (!rule.required || (isList && tested[rule.name].length > 0)) { // For optional argument, it is possible consume only rule.
                tmpRules.shift()
                continue
            } else {
                throw new InvalidInputError(`You have to specify ${formatList([rule.name])}.`)
            }

        }
    }

}



class Arg {

    constructor(name, description) {
        this.name = name
        this.description = description
    }

    test(value) {
        return true
    }

    async parse(input) {
        return input
    }

    toString() {
        let result = this.name
        if (this.needName) result = `-${this.name} ${this.name}`
        if (!this.required) result += '?'
        result = `[${result}]`
        return result
    }

    set(name, value) {
        this[name] = value
        return this
    }

    default(value) {
        return this.set('defaultValue', value)
    }

    req(required = true) {
        return this.set('required', required)
    }

    max(max) {
        return this.set('maximum', max)
    }

    min(min) {
        return this.set('minimum', min)
    }

    explicit(needName = true) {
        return this.set('needName', needName)
    }

}

class Text extends Arg {

}

class Command extends Text {

    async parse(value) {
        const command = await CommandService.getByName(value)

        if (!command) {
            throw new NotFoundError(`Command \`${value}\` was not found.`)
        }

        return command
    }

}

class Mention extends Text {

    elseCurrent() {
        
    }

}

class Member extends Mention {

    static CURRENT = { description: 'yourself' }

}

class Role extends Mention {

    static EVERYONE = { description: 'everyone' }

}

class Channel extends Mention {

    static CURRENT = { description: 'current channel' }

}

class Real extends Arg {

}

class Int extends Real {

}

class Bool extends Arg {

    constructor(...args) {
        super(...args)
        this.explicit = true
    }

    toString() {
        return super.toString().replace('[', '[-')
    }

}

class List extends Arg {

    constructor(...args) {
        super(...args)
        this.type = new Text()
    }

    toString() {
        return super.toString().replace(']', '...]')
    }

    test(value) {
        return this.type.test(value)
    }

    async parse(values) {
        const parsed = await Promise.all(values.map(this.type.parse))
        return this.withJoin ? parsed.join(' ') : parsed
    }

    of(arg) {
        return this.set('arg', arg)
    }

    join(join = true) {
        return this.set('withJoin', join)
    }

}

const factory = type => (...args) => new type(...args)

module.exports = {
    ArgsSet,
    Text: factory(Text),
    Command: factory(Command),
    Mention: factory(Mention),
    Member: factory(Member),
    Role: factory(Role),
    Channel: factory(Channel),
    Real: factory(Real),
    Int: factory(Int),
    Bool: factory(Bool),
    List: factory(List),

    TextClass: Text,
    CommandClass: Command,
    MentionClass: Mention,
    MemberClass: Member,
    RoleClass: Role,
    ChannelClass: Channel,
    RealClass: Real,
    IntClass: Int,
    BoolClass: Bool,
    ListClass: List
}