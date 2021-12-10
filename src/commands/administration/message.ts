import RoleType from '../../constants/RoleType'
import { Channel, Message } from '../../model/Arg'
import Command, { Action } from '../../model/Command'
import CommandCategory from '../../constants/CommandCategory'
import Io from '../../service/Io'
 
export default new Command({
    name: 'message',
    aliases: ['msg'],
    category: CommandCategory.ADMINISTRATION,
    description: 'Manage bot\'s message.',
    actions: [
        Action({
            name: 'source',
            args: [
                new Channel('channel').default(Channel.CURRENT),
                new Message('message', 'Command action.').req(),
            ],
            auth: { permit: [RoleType.ADMIN] },
            execute: async ({ message }, { msg }) => {
                Io.info(msg.channel, {
                    author: { icon_url: message.author.displayAvatarURL({ dynamic: true }), name: message.member?.displayName },
                    description: '```json\n' + JSON.stringify(Io.source(message), null, '  ').replace(/`/g, '\\`') + '\n```'
                })
            },
            description: 'Show source of message.',
            examples: [['#general', '918688063331389512']]
        })
    ]
})