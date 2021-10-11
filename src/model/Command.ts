import { Arg } from './Arg'
import { ActionOptions, CommandOptions } from './types'

export const Action = <A extends readonly Arg<any, any>[]>(options: ActionOptions<A>) => {
    return options
}

class Command {

    private options: CommandOptions
    private category: string

    public constructor(options: CommandOptions) {
        this.options = options
        this.category = 'basic'
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

    public getCategory() {
        return this.category
    }

    public setCategory(category: string) {
        this.category = category
    }

    public getOptions() {
        return this.options
    }

}

export default Command