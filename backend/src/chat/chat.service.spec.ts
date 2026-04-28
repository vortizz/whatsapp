import { Test, TestingModule } from '@nestjs/testing'
import { ChatService } from './chat.service'
import { getModelToken } from '@nestjs/mongoose'
import { Chat } from './entities/chat.schema'
import { ChatEvent } from './entities/chat-event.schema'
import { WsClientManager } from 'src/websocket/ws-client-manager.service'
import { BadRequestException } from '@nestjs/common'

const mockChatSave = jest.fn()
const mockChatModel: any = jest.fn().mockImplementation(() => ({ save: mockChatSave }))
mockChatModel.findOne = jest.fn()
mockChatModel.findById = jest.fn()
mockChatModel.findByIdAndUpdate = jest.fn()
mockChatModel.find = jest.fn()
mockChatModel.aggregate = jest.fn()

const mockChatEventSave = jest.fn()
const mockChatEventModel: any = jest.fn().mockImplementation(() => ({ save: mockChatEventSave }))
mockChatEventModel.findById = jest.fn()
mockChatEventModel.find = jest.fn()
mockChatEventModel.updateMany = jest.fn()

const mockWsClientManager = {
  sendChatEventToClients: jest.fn(),
  sendMessageToClient: jest.fn(),
}

const mockUser1: any = { _id: 'user-1', name: 'Victor' }
const mockUser2: any = { _id: 'user-2', name: 'Caren' }

const mockEncryptedKeys = [
  { userId: 'user-1', encryptedKey: 'enc-key-1' },
  { userId: 'user-2', encryptedKey: 'enc-key-2' },
]

describe('ChatService', () => {
  let service: ChatService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getModelToken(Chat.name), useValue: mockChatModel },
        { provide: getModelToken(ChatEvent.name), useValue: mockChatEventModel },
        { provide: WsClientManager, useValue: mockWsClientManager },
      ],
    }).compile()

    service = module.get<ChatService>(ChatService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should throw BadRequestException when chat between those users already exists', async () => {
      mockChatModel.findOne.mockResolvedValue({ _id: 'existing-chat' })

      await expect(service.create([mockUser1, mockUser2], mockEncryptedKeys)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should throw BadRequestException when both users are the same', async () => {
      mockChatModel.findOne.mockResolvedValue(null)

      await expect(service.create([mockUser1, mockUser1], mockEncryptedKeys)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should throw BadRequestException when encrypted keys do not match users', async () => {
      mockChatModel.findOne.mockResolvedValue(null)

      const badKeys = [
        { userId: 'user-1', encryptedKey: 'enc-key-1' },
        { userId: 'user-99', encryptedKey: 'enc-key-99' },
      ]

      await expect(service.create([mockUser1, mockUser2], badKeys)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should create and return the chat', async () => {
      mockChatModel.findOne.mockResolvedValue(null)
      const savedChat = { _id: 'new-chat', users: [mockUser1, mockUser2] }
      mockChatSave.mockResolvedValue(savedChat)

      const result = await service.create([mockUser1, mockUser2], mockEncryptedKeys)

      expect(mockChatSave).toHaveBeenCalled()
      expect(result).toEqual(savedChat)
    })
  })

  describe('updateGroupName', () => {
    it('should throw BadRequestException when chat does not exist', async () => {
      mockChatModel.findById.mockResolvedValue(null)

      await expect(service.updateGroupName('chat-id', 'New Name', mockUser1)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should throw BadRequestException when caller is not a group admin', async () => {
      mockChatModel.findById.mockResolvedValue({
        _id: 'chat-id',
        users: [mockUser1, mockUser2],
        groupAdmins: [{ _id: { toString: () => 'user-2' } }],
      })

      await expect(service.updateGroupName('chat-id', 'New Name', mockUser1)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should update the group name when caller is admin', async () => {
      const mockChat = {
        _id: 'chat-id',
        users: [{ _id: { toString: () => 'user-1' } }, { _id: { toString: () => 'user-2' } }],
        groupAdmins: [{ _id: { toString: () => 'user-1' } }],
      }
      mockChatModel.findById.mockResolvedValue(mockChat)

      const savedEvent = { _id: 'event-id' }
      mockChatEventSave.mockResolvedValue(savedEvent)
      mockChatEventModel.findById.mockResolvedValue(savedEvent)

      const updatedChat = { ...mockChat, name: 'New Name' }
      mockChatModel.findByIdAndUpdate.mockResolvedValue(updatedChat)

      const result = await service.updateGroupName('chat-id', 'New Name', mockUser1)

      expect(mockChatModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'chat-id',
        { name: 'New Name' },
        { new: true },
      )
      expect(result.name).toBe('New Name')
    })
  })
})
