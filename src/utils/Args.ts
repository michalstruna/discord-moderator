import argv, { Arguments } from 'yargs-parser'

const { InvalidInputError, NotFoundError } = require('./Errors')
const { codeList } = require('./Outputs')
const CommandService = require('../service/CommandService')

const formatList = (vals: string[], getter = (x: string) => x) => codeList(vals.map(getter), 'and')

export class TestedArgsSet {

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

export class ArgsSet {

    private args: Arguments

    constructor(input: string) {
        this.args = argv(input)
    }

    public shift() {
        return this.args._.shift()
    }

    /** Test if args set can accept all rules. */
    public test(rules: Arg[]) {
        const tested = {}
        let tmpRules = [...rules]
        let reqRules = [...rules.filter(r => r.isRequired())]
        let tmpArgs = [...this.args._]

        for (const key in this.args) {
            if (key === '_') continue
            const rule = tmpRules.find(r => r.getName() === key)
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

export abstract class Arg {

    protected name: string
    protected description?: string
    
    protected needName?: boolean
    protected required?: boolean
    protected defaultValue?: any
    protected maximum?: number
    protected minimum?: number

    constructor(name: string, description?: string) {
        this.name = name
        this.description = description
    }

    public getName() {
        return this.name
    }

    public isRequired() {
        return this.required
    }

    public isExplicit() {
        return this.needName
    }

    public test(value: string) {
        return true
    }

    public toString() {
        let result = this.name
        if (this.needName) result = `-${this.name} ${this.name}`
        if (!this.required) result += '?'
        result = `[${result}]`
        return result
    }

    public default(value: any) {
        this.defaultValue = value
        return this
    }

    public req(required: boolean = true) {
        this.required = required
        return this
    }

    public max(max: number) {
        this.maximum = max
        return this
    }

    public min(min: number) {
        this.minimum = min
        return this
    }

    public explicit(needName: boolean = true) {
        this.needName = needName
        return this
    }

}

export class Text extends Arg {

    public async parse(input: string) {
        return input
    }

}

export class Command extends Text {

    async parse(value: string) {
        const command = await CommandService.getByName(value)

        if (!command) {
            throw new NotFoundError(`Command \`${value}\` was not found.`)
        }

        return command
    }

}

export class Mention extends Text {

    public elseCurrent() {
        
    }

}

export class Member extends Mention {

    public static CURRENT = { description: 'yourself' }

}

export class Role extends Mention {

    public static EVERYONE = { description: 'everyone' }

}

export class Channel extends Mention {

    public static CURRENT = { description: 'current channel' }

}

export class Real extends Arg {

}

export class Int extends Real {

}

export class Bool extends Arg {

    constructor(name: string, description?: string) {
        super(name, description)
        this.explicit()
    }

    public toString() {
        return super.toString().replace('[', '[-')
    }

}

export class Switch extends Bool {

    constructor(name: string, description?: string) {
        super(name, description)
        this.req()
    }

}

export class List extends Arg {

    protected type: Text
    protected withJoin?: boolean

    constructor(name: string, description?: string) {
        super(name, description)
        this.type = new Text(name, description)
    }

    public toString() {
        return super.toString().replace(']', '...]')
    }

    public test(value: string) {
        return this.type.test(value)
    }

    public async parse(values: string[]) {
        const parsed = await Promise.all(values.map(this.type.parse))
        return this.withJoin ? parsed.join(' ') : parsed
    }

    public of(type: Text) {
        this.type = type
        return this
    }

    public join(withJoin: boolean = true) {
        this.withJoin = withJoin
        return this
    }

}
