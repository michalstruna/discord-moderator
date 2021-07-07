const Color = require('../constants/Color')

const factory = (color, defaultTitle) => class extends Error {

    constructor(message, title = defaultTitle) {
        super(message)
        this.title = title
        this.color = color
    }

}

exports.InvalidInputError = factory(Color.RED, 'Invalid input')
exports.UnauthorizedError = factory(Color.BLACK, 'Missing permissions')
exports.ForbiddenError = factory(Color.ORANGE, 'Forbidden action')