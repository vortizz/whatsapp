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

const mockUser: any = { _id: 'user-1', name: 'Victor', blockedUsers: [] }

const mockChat = {
  isGroup: false,
  users: [{ _id: { toString: () => 'user-1' } }, { _id: { toString: () => 'user-2' } }],
}

const mockDto = { chat: 'chat-id', to: 'user-2', text: 'hello' }

const mockMessageBase = {
  chat: { _id: { toString: () => 'chat-id' } },
  from: { _id: { toString: () => 'user-1' } },
  to: { _id: { toString: () => 'user-2' } },
  text: 'hello',
}

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
        users: [{ _id: { toString: () => 'user-1' } }], // user-2 is not here
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
      mockUserService.findById.mockResolvedValue({ _id: 'user-2', blockedUsers: [] })
      mockWsClientManager.isClientConnected.mockReturnValue(true)
      mockSave.mockResolvedValue({ ...mockMessageBase, status: Status.RECEIVED })

      const result = await service.create(mockUser, mockDto)

      expect(result.status).toBe(Status.RECEIVED)
    })

    it('should set status to SENT when recipient is offline', async () => {
      mockChatService.findById.mockResolvedValue(mockChat)
      mockUserService.findById.mockResolvedValue({ _id: 'user-2', blockedUsers: [] })
      mockWsClientManager.isClientConnected.mockReturnValue(false)
      mockSave.mockResolvedValue({ ...mockMessageBase, status: Status.SENT })

      const result = await service.create(mockUser, mockDto)

      expect(result.status).toBe(Status.SENT)
    })
  })
})
