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
exports.NotFoundError = factory(Color.GRAY, null)
exports.MentionNotFoundError = factory(Color.RED, 'Mention was not found')
exports.MissingPermissionsError = factory(Color.BLACK, 'Missing permissions')