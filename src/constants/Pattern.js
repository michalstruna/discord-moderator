class Pattern extends RegExp {

    static init(pattern, flags, parser) {
        return new Pattern(`^${pattern}$`, flags, parser)
    }

    constructor(pattern, flags = null, parser = x => x) {
        super(pattern, flags || undefined)
        this.parser = parser
    }

    parse(value) {
        return this.parser(value)
    }

}

module.exports = {
    ANY: Pattern.init('.*'),
    INT: Pattern.init('[0-9]+', null, parseInt),
    REAL: Pattern.init('[0-9]+(\.[0-9]+)?', null, parseFloat),
    REST: Pattern.init('.*'),

    ANY_OF_MAX_LENGTH: length => Pattern.init(`.{0,${length}}`)
}