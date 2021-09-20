import Color from '../constants/Color'

const factory = (color: Color, defaultTitle: string | null) => class extends Error {

    private _title: string | null
    private _color: Color

    constructor(message: string, title: string | null = defaultTitle) {
        super(message)
        this._title = title
        this._color = color
    }

    public get title() {
        return this._title
    }

    public get color() {
        return this._color
    }

}

exports.InvalidInputError = factory(Color.RED, 'Invalid input')
exports.UnauthorizedError = factory(Color.BLACK, 'Missing permissions')
exports.ForbiddenError = factory(Color.ORANGE, 'Forbidden action')
exports.NotFoundError = factory(Color.GRAY, null)
exports.MentionNotFoundError = factory(Color.RED, 'Mention was not found')
exports.MissingPermissionsError = factory(Color.BLACK, 'Missing permissions')