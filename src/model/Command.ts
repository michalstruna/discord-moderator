import { CommandOptions } from './types'

class Command {

    private options: CommandOptions

    public constructor(options: CommandOptions) {
        this.options = options
    }

    public getName() {
        return this.options.name
    }

    public getAliases() {
        return this.options.aliases
    }

    public getDescription() {
        return this.options.description
    }

    public getActions() {
        return this.options.actions
    }

}

export default Command