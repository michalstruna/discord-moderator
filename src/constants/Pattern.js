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

module.exports = {
    ANY: new Validator(() => true),
    INT: new Regex('[0-9]+', parseInt),
    REAL: new Regex('[0-9]+(\.[0-9]+)?', parseFloat),
    REST: new Validator(() => '.*'),

    VAL: value => new Validator(val => val === value),

    FLAG: (...names) => new Validator(val => names.find(name => `-${val}`)),
    ENUM: (...values) => new Validator(val => values.includes(val)),
    VAL_OF_LENGTH: (max, min = 1) => new Validator(val => val.length >= min && val.length <= max && !/^-[a-z]+$/i.test(val))
}