import Color from '../constants/Color'

export class DefaultError extends Error {

    private title: string | null
    private color: Color

    constructor(message: string, title: string | null, color: Color) {
        super(message)
        this.title = title
        this.color = color
    }

    public getTitle() {
        return this.title
    }

    public getColor() {
        return this.color
    }

}

const factory = (color: Color, defaultTitle: string | null) => class extends DefaultError {

    constructor(message: string, title: string | null = defaultTitle) {
        super(message, title, color)
    }

}

export const InvalidInputError = factory(Color.RED, 'Invalid input')
export const UnauthorizedError = factory(Color.BLACK, 'Missing permissions')
export const ForbiddenError = factory(Color.ORANGE, 'Forbidden action')
export const NotFoundError = factory(Color.GRAY, null)
export const MentionNotFoundError = factory(Color.RED, 'Mention was not found')
export const MissingPermissionsError = factory(Color.BLACK, 'Missing permissions')