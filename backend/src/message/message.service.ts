import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Message } from "./entities/message.schema";
import { User } from "src/user/entities/user.schema";
import { CreateMessageDto } from "./dtos/create-message.dto";
import { InjectModel } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { ChatService } from "src/chat/chat.service";
import { UserService } from "src/user/user.service";
import { Status } from "./entities/status.enum";
import { WsClientManager } from "src/websocket/ws-client-manager.service";

@Injectable()
export class MessageService {
    constructor(
        @InjectModel(Message.name) private messageModel: mongoose.Model<Message>,
        private readonly chatService: ChatService,
        private readonly userService: UserService,
        private readonly wsClientManager: WsClientManager
    ) {}

    async create(user: User, createMessageDto: CreateMessageDto): Promise<Message> {
        const chat = await this.chatService.findById(createMessageDto.chat)

        if (!chat) {
            throw new NotFoundException('Chat not found')
        }

        if (chat.isGroup) {
            const nonSenderIds = chat.users
                .map(u => u._id.toString())
                .filter(id => id !== user._id.toString())

            const onlineNonSenderIds = nonSenderIds.filter(id =>
                this.wsClientManager.isClientConnected(id)
            )

            const allReceived = onlineNonSenderIds.length === nonSenderIds.length && nonSenderIds.length > 0

            const newMessage = new this.messageModel({
                ...createMessageDto,
                from: user,
                status: allReceived ? Status.RECEIVED : Status.SENT,
                receivedBy: onlineNonSenderIds.map(id => new mongoose.Types.ObjectId(id)),
            })
            const messageCreated = <Message>await newMessage.save()

            const memberIds = chat.users.map(u => u._id.toString())
            this.wsClientManager.sendGroupMessageToClients(messageCreated, memberIds)

            if (allReceived) {
                this.wsClientManager.sendStatusReceivedToClient([{
                    chat: messageCreated.chat._id.toString(),
                    from: messageCreated.from._id.toString(),
                    messages: [messageCreated]
                }])
            }

            return messageCreated
        }

        if (!chat.users.some(user => user._id.toString() === createMessageDto.to)) {
            throw new BadRequestException('Receiver does not belong to the chat')
        }

        const to = await this.userService.findById(createMessageDto.to)

        if (!to) {
            throw new NotFoundException('User not found')
        }

        if (to._id.toString() === user._id) {
            throw new BadRequestException('Recipient must be different from the receiver')
        }

        const recipientBlockedSender = to.blockedUsers?.some(blockedUser => {
            const blockedUserId = blockedUser?._id?.toString() || blockedUser?.toString()
            return blockedUserId === user._id.toString()
        })

        const newMessage = new this.messageModel({
            ...createMessageDto,
            from: user,
            status: !recipientBlockedSender && this.wsClientManager.isClientConnected(createMessageDto.to)
                ? Status.RECEIVED
                : Status.SENT,
            ...(recipientBlockedSender ? { deletedBy: [to] } : {})
        })
        const messageCreated = <Message>await newMessage.save()

        this.wsClientManager.sendMessageToClient(messageCreated)

        if (messageCreated.status === Status.RECEIVED) {
            this.wsClientManager.sendStatusReceivedToClient([{
                chat: messageCreated.chat._id.toString(),
                from: messageCreated.from._id.toString(),
                messages: [messageCreated]
            }])
        }

        return messageCreated
    }

    async findByChat(user: User, chat: string): Promise<Message[]> {
        return await this.messageModel.find({
            chat,
            clearedBy: { $ne: user._id },
            deletedBy: { $ne: user._id },
        }).sort({ createdAt: 1 })
    }

    async updateStatusToReceived(user: User): Promise<void> {
        const userObjectId = new mongoose.Types.ObjectId(user._id)

        // Fetch 1:1 pending messages and the user's group chats in parallel
        const [messagesToBeUpdated, groupChats] = await Promise.all([
            this.messageModel.aggregate([
                {
                    $match: {
                        to: userObjectId,
                        status: Status.SENT,
                        deletedBy: { $ne: userObjectId }
                    }
                },
                { $group: { _id: { chat: '$chat', from: '$from' }, messages: { $push: '$$ROOT' } } },
                { $project: { _id: 0, chat: '$_id.chat', from: '$_id.from', messages: '$messages' } }
            ]),
            this.chatService.findGroupChatsByUser(user._id)
        ])

        // Update 1:1 messages
        await this.messageModel.updateMany(
            { to: user._id, status: Status.SENT, deletedBy: { $ne: user._id } },
            { $set: { status: Status.RECEIVED } }
        )
        this.wsClientManager.sendStatusReceivedToClient(messagesToBeUpdated)

        if (groupChats.length === 0) return

        // Process all group chats in bulk — track that this user received each message
        const groupChatIds = groupChats.map(c => new mongoose.Types.ObjectId(c._id.toString()))
        await this.messageModel.updateMany(
            {
                chat: { $in: groupChatIds },
                status: Status.SENT,
                from: { $ne: userObjectId },
                receivedBy: { $nin: [userObjectId] }
            },
            { $addToSet: { receivedBy: userObjectId } }
        )

        // Promote to RECEIVED where all non-sender members have received the message.
        // $lookup avoids a per-chat loop: member count is resolved inline per message.
        const groupMessagesToUpdate = await this.messageModel.aggregate([
            { $match: { chat: { $in: groupChatIds }, status: Status.SENT } },
            { $lookup: { from: 'chats', localField: 'chat', foreignField: '_id', as: 'chatData' } },
            {
                $match: {
                    $expr: {
                        $gte: [
                            { $size: { $ifNull: ['$receivedBy', []] } },
                            { $subtract: [{ $size: { $arrayElemAt: ['$chatData.users', 0] } }, 1] }
                        ]
                    }
                }
            },
            { $group: { _id: { chat: '$chat', from: '$from' }, messages: { $push: '$$ROOT' } } },
            { $project: { _id: 0, chat: '$_id.chat', from: '$_id.from', messages: '$messages' } }
        ])

        if (groupMessagesToUpdate.length > 0) {
            const messageIds = groupMessagesToUpdate.flatMap(g => g.messages.map(m => m._id))
            await this.messageModel.updateMany(
                { _id: { $in: messageIds } },
                { $set: { status: Status.RECEIVED } }
            )
            this.wsClientManager.sendStatusReceivedToClient(groupMessagesToUpdate)
        }
    }

    async updateStatusToRead(user: User, chat: string) {
        const userObjectId = new mongoose.Types.ObjectId(user._id)
        const chatObjectId = new mongoose.Types.ObjectId(chat)
        const chatDoc = await this.chatService.findById(chat)

        if (chatDoc?.isGroup) {
            const memberCount = chatDoc.users.length

            // Track that this user has read group messages they didn't send
            await this.messageModel.updateMany(
                {
                    chat: chatObjectId,
                    status: { $in: [Status.SENT, Status.RECEIVED] },
                    from: { $ne: userObjectId },
                    readBy: { $nin: [userObjectId] }
                },
                {
                    $addToSet: {
                        readBy: userObjectId,
                        receivedBy: userObjectId
                    }
                }
            )

            // Promote messages to READ when all non-sender members have read them
            const groupMessagesToUpdate = await this.messageModel.aggregate([
                {
                    $match: {
                        chat: chatObjectId,
                        status: { $in: [Status.SENT, Status.RECEIVED] },
                        $expr: { $gte: [{ $size: { $ifNull: ['$readBy', []] } }, memberCount - 1] }
                    }
                },
                { $group: {
                    _id: { chat: '$chat', from: '$from' },
                    messages: { $push: '$$ROOT' }
                } },
                { $project: { _id: 0, chat: '$_id.chat', from: '$_id.from', messages: '$messages' } }
            ])

            if (groupMessagesToUpdate.length > 0) {
                const messageIds = groupMessagesToUpdate.flatMap(g => g.messages.map(m => m._id))
                await this.messageModel.updateMany(
                    { _id: { $in: messageIds } },
                    { $set: { status: Status.READ } }
                )
                this.wsClientManager.sendStatusReadToClient(groupMessagesToUpdate)
            }

            return
        }

        // 1:1 messages
        const messagesToBeUpdated = await this.messageModel.aggregate([
            { $match: {
                to: userObjectId,
                chat: chatObjectId,
                status: Status.RECEIVED,
                clearedBy: { $ne: userObjectId },
                deletedBy: { $ne: userObjectId },
            } },
            { $group: {
                _id: { chat: '$chat', from: '$from' },
                messages: { $push: '$$ROOT' }
            } },
            { $project: { _id: 0, 'chat': '$_id.chat', 'from': '$_id.from', 'messages': '$messages' } }
        ])

        await this.messageModel.updateMany(
            {
                to: user._id,
                chat,
                status: Status.RECEIVED,
                clearedBy: { $ne: user._id },
                deletedBy: { $ne: user._id },
            },
            { $set: { status: Status.READ } }
        )

        this.wsClientManager.sendStatusReadToClient(messagesToBeUpdated)
    }

    async clearMessages(user: User, chat: string) {
        await this.messageModel.updateMany(
            { chat, $or: [ { from: user._id}, { to: user._id } ] },
            { $addToSet: { clearedBy: user } }
        )
    }

    async deleteMessages(user: User, chat: string) {
        await this.messageModel.updateMany(
            { chat, $or: [ { from: user._id }, { to: user._id } ] },
            { $addToSet: { deletedBy: user } }
        )
    }

    async deleteMultipleMessages(user: User, messageIds: string[]): Promise<void> {
        await this.messageModel.updateMany(
            { _id: { $in: messageIds }, $or: [{ from: user._id }, { to: user._id }] },
            { $addToSet: { deletedBy: user } }
        )
    }
}
