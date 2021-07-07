const Emoji = require("../constants/Emoji")

exports.Emoji = Emoji

exports.react = (msg, emoji = Emoji.SUCCESS) => {
    msg.react(emoji)
}

exports.parseArgs = (args, rules) => {
    const named = {}
    const rest = []

    ARG: for (const arg of args) {
        for(const key in rules) {
            const rule = rules[key]
            const isRuleArray = Array.isArray(rule)

            if (rule instanceof RegeExp || rule[1] instanceof RegExp) { // Rule is regex.
                const regex = isRuleArray ? rule[1] : rule
                const defaultValue = isRuleArray ? rule[0] : undefined

                if (regex.test(arg)) {
                    named[key] = arg
                }
            }
        }
    }

    return { ...named, args: rest }
}