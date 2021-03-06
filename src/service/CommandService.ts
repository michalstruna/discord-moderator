import { Guild } from 'discord.js'
import fs from 'fs'
import path from 'path'
import { findBestMatch, Rating } from 'string-similarity'

import Command from '../model/Command'
import { ActionOptions, ActionMeta, CommandOptions, Part, ServerAction, ServerCommand, ServerRoles } from '../model/types'
import { ArgParser, ParsedArgs } from '../model/Arg'
import { CanceledError, DefaultError } from '../model/Error'
import Io from './Io'
import Config from '../constants/Config'
import CommandCategory from '../constants/CommandCategory'

const commands = new Map<string, CommandOptions>()
const aliases = new Map<string, string>()
const mapLowerCaseToName = new Map<string, string>()

module CommandService {

    export const load = () => {
        commands.clear()
        aliases.clear()

        const categories = fs.readdirSync(path.join(__dirname, '..', 'commands'))
        Object.values(CommandCategory).forEach(c => mapLowerCaseToName.set(c.toLowerCase(), c))

        for (const category of categories) {
            const files = fs.readdirSync(path.join(__dirname, '..', 'commands', category))

            for (const file of files) {
                const command: Command = require(`../commands/${category}/${file}`).default
                command.setCategory(category)
                commands.set(command.getName(), command.getOptions())
                aliases.set(command.getName(), command.getName())
                mapLowerCaseToName.set(command.getName().toLowerCase(), command.getName())

                for (const alias of command.getAliases() || []) {
                    aliases.set(alias, command.getName())
                    mapLowerCaseToName.set(alias.toLowerCase(), alias)
                }
            }
        }
    }

    export const exportAll = (roles: ServerRoles, guild: Guild) => {
        const result: Record<string, Part<ServerCommand>> = {}

        commands.forEach(command => {
            const actions: Record<string, Part<ServerAction>> = {}

            command.actions.forEach(action => {
                actions[action.name] = {
                    auth: {
                        permitDefault: action.auth?.permit ? action.auth.permit.map(r => roles[r]) : [guild.roles.everyone.id],
                        denyDefault: action.auth?.deny ? action.auth.deny.map(r => roles[r]) : []
                    }
                }
            })

            result[command.name] = { actions }
        })

        return result
    }

    export const getByName = (name: string): CommandOptions | undefined => {
        return commands.get(aliases.get(name) || name)
    }

    export const getBySimilarName = (name: string, threshold: number = Config.COMMAND_SIMILARITY_TRESHOLD): CommandOptions | undefined => {
        const { bestMatch, bestMatchIndex } = findBestMatch(name.toLowerCase(), Array.from(aliases.keys()))
        if (bestMatchIndex >= threshold) return commands.get(aliases.get(bestMatch.target)!)
    }

    export const getTopResult = (keyword: string, threshold: number = Config.COMMAND_SIMILARITY_TRESHOLD): Rating | undefined => {
        const allItems = Array.from(mapLowerCaseToName.keys())
        const { bestMatch } = findBestMatch(keyword.toLowerCase(), allItems)
        if (bestMatch.rating >= threshold) return { ...bestMatch, target: mapLowerCaseToName.get(bestMatch.target)! }
    }

    export const getAll = () => {
        return Array.from(commands.values())
    }

    const findAction = (actions: ActionOptions[], argParser: ArgParser): [ActionOptions, ParsedArgs] => {
        const errors = []

        for (const action of actions) {
            try {
                return [action, argParser.parse(action.args)]
            } catch (error) {
                errors.push(error)
            }
        }

        throw errors[0]
    }

    export const execute = async (command: CommandOptions, argParser: ArgParser, meta: ActionMeta) => {
        try {
            console.log(`${new Date().toISOString()}: ${meta.msg.author.tag}: command: ${meta.msg.content}`, argParser)
            const [action, testedArgsSet] = findAction(command.actions, argParser)
            const analyzedArgs = await testedArgsSet.analyze(meta)

            await action.execute(analyzedArgs, meta) // TODO: Check perms.
            if (action.react !== false) Io.reactSuccess(meta.msg)
        } catch (error) {
            if (error instanceof CanceledError) return
            console.log('CommandService.execute', error)
            Io.reactFail(meta.msg)

            if (error instanceof DefaultError) { // TODO: Not working.
                Io.embed(meta.msg.channel, { title: error.getTitle() || undefined, description: error.getMessage(), color: error.getColor(), theme: Io.Theme.FAIL })
            } else if (error instanceof Error) {
                Io.fail(meta.msg.channel, error.message)
            }
        }
    }

    export const getAllByCategory = (category: CommandCategory) => {
        return getAll().filter(c => c.category === category)
    }

    export const getAllCategories = () => {
        return Object.values(CommandCategory)
    }

}

export default CommandService