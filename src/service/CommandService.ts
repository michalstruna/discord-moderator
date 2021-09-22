import { Guild } from 'discord.js'
import fs from 'fs'
import path from 'path'

import { Action, ActionMeta, CommandOptions, ServerAction, ServerAuth, ServerCommand, ServerRoles } from '../model/types'
import { ArgParser, ParsedArgs } from '../utils/Args'
import { DefaultError } from '../utils/Errors'
import MessageService from './MessageService'

const commands = new Map<string, CommandOptions>()
const aliases = new Map<string, string>()

module CommandService {

    export const load = () => {
        commands.clear()
        aliases.clear()

        const categories = fs.readdirSync(path.join(__dirname, '..', 'commands'))

        for (const category of categories) {
            const files = fs.readdirSync(path.join(__dirname, '..', 'commands', category))

            for (const file of files) {
                const command = require(`../commands/${category}/${file}`)
                command.category = category
                commands.set(command.name, command)

                for (const alias of command.aliases || []) {
                    aliases.set(alias, command.name)
                }
            }
        }
    }

    export const exportAll = (roles: ServerRoles, guild: Guild) => {
        const result: Record<string, Partial<ServerCommand>> = {}

        commands.forEach(command => {
            const actions: Record<string, ServerAction> = {}

            command.actions.forEach(action => {
                actions[action.name] = {
                    auth: {
                        permitDefault: action.auth?.permit ? action.auth.permit.map(r => roles[r]) : [guild.roles.everyone.id],
                        denyDefault: action.auth?.deny ? action.auth.deny.map(r => roles[r]) : []
                    } as ServerAuth
                }
            })

            result[command.name] = { actions }
        })

        return result
    }

    export const getByName = (name: string) => {
        return commands.get(aliases.get(name) || name)
    }

    export const getAll = () => {
        return Array.from(commands.values())
    }

    const findAction = (actions: Action[], argParser: ArgParser): [Action, ParsedArgs] => {
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
            console.log(`command: ${meta.msg.content}`, argParser)
            const [action, testedArgsSet] = findAction(command.actions, argParser)
            const analyzedArgs = await testedArgsSet.analyze(meta)
            await action.execute(analyzedArgs, meta) // TODO: Check perms.

            if (action.react !== false) {
                MessageService.reactSuccess(meta.msg)
            }
        } catch (error) {
            console.error(error)
            MessageService.reactFail(meta.msg)

            if (error instanceof DefaultError) {
                const errTitle = error.getTitle() === undefined ? 'Something bad happened' : error.getTitle()
                MessageService.sendFail(meta.msg.channel, error.message, errTitle, error.getColor())
            }
        }
    }

}

export default CommandService