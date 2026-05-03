import { Test, TestingModule } from '@nestjs/testing'
import { MessageService } from './message.service'
import { getModelToken } from '@nestjs/mongoose'
import { Message } from './entities/message.schema'
import { ChatService } from 'src/chat/chat.service'
import { UserService } from 'src/user/user.service'
import { WsClientManager } from 'src/websocket/ws-client-manager.service'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Status } from './entities/status.enum'

const mockSave = jest.fn()
const mockMessageModel: any = jest.fn().mockImplementation(() => ({ save: mockSave }))
mockMessageModel.findById = jest.fn()
mockMessageModel.find = jest.fn()
mockMessageModel.updateMany = jest.fn()
mockMessageModel.aggregate = jest.fn()

const mockChatService = {
  findById: jest.fn(),
  clearEvents: jest.fn(),
  findGroupChatsByUser: jest.fn(),
}

const mockUserService = {
  findById: jest.fn(),
}

const mockWsClientManager = {
  isClientConnected: jest.fn(),
  sendMessageToClient: jest.fn(),
  sendGroupMessageToClients: jest.fn(),
  sendStatusReceivedToClient: jest.fn(),
  sendStatusReadToClient: jest.fn(),
}

const SENDER_ID = '507f1f77bcf86cd799439011'
const RECEIVER_ID = '507f1f77bcf86cd799439012'
const MEMBER_ID = '507f1f77bcf86cd799439013'

const mockUser: any = { _id: SENDER_ID, name: 'Victor', blockedUsers: [] }

const mockChat = {
  isGroup: false,
  users: [{ _id: { toString: () => SENDER_ID } }, { _id: { toString: () => RECEIVER_ID } }],
}

const mockDto = { chat: 'chat-id', to: RECEIVER_ID, text: 'hello' }

const mockMessageBase = {
  chat: { _id: { toString: () => 'chat-id' } },
  from: { _id: { toString: () => SENDER_ID } },
  to: { _id: { toString: () => RECEIVER_ID } },
  text: 'hello',
}

const mockGroupChat = {
  isGroup: true,
  users: [
    { _id: { toString: () => SENDER_ID } },
    { _id: { toString: () => RECEIVER_ID } },
    { _id: { toString: () => MEMBER_ID } },
  ],
}

const mockGroupDto = { chat: 'chat-id', text: 'hello group' }

describe('MessageService', () => {
  let service: MessageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: getModelToken(Message.name), useValue: mockMessageModel },
        { provide: ChatService, useValue: mockChatService },
        { provide: UserService, useValue: mockUserService },
        { provide: WsClientManager, useValue: mockWsClientManager },
      ],
    }).compile()

    service = module.get<MessageService>(MessageService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create (1:1)', () => {
    it('should throw NotFoundException when chat does not exist', async () => {
      mockChatService.findById.mockResolvedValue(null)
      await expect(service.create(mockUser, mockDto)).rejects.toThrow(NotFoundException)
    })

    it('should throw BadRequestException when receiver does not belong to the chat', async () => {
      mockChatService.findById.mockResolvedValue({
        isGroup: false,
        users: [{ _id: { toString: () => SENDER_ID } }],
      })
      await expect(service.create(mockUser, mockDto)).rejects.toThrow(BadRequestException)
    })

    it('should throw NotFoundException when receiver does not exist in DB', async () => {
      mockChatService.findById.mockResolvedValue(mockChat)
      mockUserService.findById.mockResolvedValue(null)
      await expect(service.create(mockUser, mockDto)).rejects.toThrow(NotFoundException)
    })

    it('should set status to RECEIVED when recipient is online', async () => {
      mockChatService.findById.mockResolvedValue(mockChat)
      mockUserService.findById.mockResolvedValue({ _id: RECEIVER_ID, blockedUsers: [] })
      mockWsClientManager.isClientConnected.mockReturnValue(true)
      mockSave.mockResolvedValue({ ...mockMessageBase, status: Status.RECEIVED })

      const result = await service.create(mockUser, mockDto)
      expect(result.status).toBe(Status.RECEIVED)
    })

    it('should set status to SENT when recipient is offline', async () => {
      mockChatService.findById.mockResolvedValue(mockChat)
      mockUserService.findById.mockResolvedValue({ _id: RECEIVER_ID, blockedUsers: [] })
      mockWsClientManager.isClientConnected.mockReturnValue(false)
      mockSave.mockResolvedValue({ ...mockMessageBase, status: Status.SENT })

      const result = await service.create(mockUser, mockDto)
      expect(result.status).toBe(Status.SENT)
    })
  })

  describe('create_group', () => {
    it('should throw NotFoundException when group chat does not exist', async () => {
      mockChatService.findById.mockResolvedValue(null)
      await expect(service.create(mockUser, mockGroupDto)).rejects.toThrow(NotFoundException)
    })

    it('should set status to RECEIVED when all members are online', async () => {
      mockChatService.findById.mockResolvedValue(mockGroupChat)
      mockWsClientManager.isClientConnected.mockReturnValue(true)
      mockSave.mockResolvedValue({
        ...mockGroupDto,
        status: Status.RECEIVED,
        chat: { _id: { toString: () => 'chat-id' } },
        from: { _id: { toString: () => SENDER_ID } },
      })

      const result = await service.create(mockUser, mockGroupDto)
      expect(result.status).toBe(Status.RECEIVED)
    })

    it('should set status to SENT when all members are offline', async () => {
      mockChatService.findById.mockResolvedValue(mockGroupChat)
      mockWsClientManager.isClientConnected.mockReturnValue(false)
      mockSave.mockResolvedValue({ ...mockGroupDto, status: Status.SENT })

      const result = await service.create(mockUser, mockGroupDto)
      expect(result.status).toBe(Status.SENT)
    })
  })
})
