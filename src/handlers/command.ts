import Handler from '../model/Handler'
import CommandService from '../service/CommandService'

export default new Handler(() => {
    CommandService.load()
})