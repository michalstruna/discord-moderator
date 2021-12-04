import Command, { Action } from '../../model/Command'
import RoleType from '../../constants/RoleType'
import MessageService from '../../service/MessageService'
import CommandCategory from '../../constants/CommandCategory'

export default new Command({
    name: 'echo',
    category: CommandCategory.MODERATION,
    description: 'Manage sending of messages.',
    actions: [
        Action({
            name: 'send',
            args: MessageService.getEchoArgs(),
            auth: { permit: [RoleType.ADMIN, RoleType.MOD] },
            execute: MessageService.echo,
            description: 'Send message to the channel.',
            examples: [['Text.'], ['#general', '-as', '@Michal', '-description', 'Announcement']]
        })
    ]
})