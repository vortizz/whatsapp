import { Test, TestingModule } from '@nestjs/testing'
import { WsClientManager } from './ws-client-manager.service'
import { ModuleRef } from '@nestjs/core'

const mockModuleRef = {
  get: jest.fn(),
}

const createMockClient = (userId: string) => ({
  userId,
  send: jest.fn(),
  close: jest.fn(),
})

describe('WsClientManager', () => {
  let service: WsClientManager

  beforeEach(async () => {
    jest.useFakeTimers()

    const module: TestingModule = await Test.createTestingModule({
      providers: [WsClientManager, { provide: ModuleRef, useValue: mockModuleRef }],
    }).compile()

    service = module.get<WsClientManager>(WsClientManager)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  describe('isClientConnected', () => {
    it('should return false when client is not connected', () => {
      expect(service.isClientConnected('user-1')).toBe(false)
    })

    it('should return true when client is connected', async () => {
      const mockClient = createMockClient('user-1')
      const mockUserService = {
        updateIsConnected: jest.fn().mockResolvedValue({ lastSeenAt: new Date() }),
      }
      const mockChatService = {
        findByUserSimple: jest.fn().mockResolvedValue([]),
      }
      mockModuleRef.get
        .mockReturnValueOnce(mockUserService)
        .mockReturnValueOnce(mockChatService)
        .mockReturnValue(mockChatService)

      await service.addConnection(mockClient, {
        id: 'user-1',
        email: 'test@test.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      })

      expect(service.isClientConnected('user-1')).toBe(true)
    })
  })

  describe('sendMessageToClient', () => {
    it('should send message to both sender and recipient when both are connected', async () => {
      const senderClient = createMockClient('user-1')
      const recipientClient = createMockClient('user-2')
      const mockUserService = {
        updateIsConnected: jest.fn().mockResolvedValue({ lastSeenAt: new Date() }),
      }
      const mockChatService = {
        findByUserSimple: jest.fn().mockResolvedValue([]),
      }
      mockModuleRef.get.mockReturnValue(mockUserService)

      // add both connections
      mockModuleRef.get
        .mockReturnValueOnce(mockUserService)
        .mockReturnValueOnce(mockChatService)
        .mockReturnValueOnce(mockUserService)
        .mockReturnValueOnce(mockChatService)

      await service.addConnection(senderClient, {
        id: 'user-1',
        email: 'sender@test.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      })
      await service.addConnection(recipientClient, {
        id: 'user-2',
        email: 'recipient@test.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      })

      const mockMessage: any = {
        from: { _id: { toString: () => 'user-1' } },
        to: { _id: { toString: () => 'user-2' } },
        text: 'hello',
        deletedBy: [],
      }

      service.sendMessageToClient(mockMessage)

      expect(senderClient.send).toHaveBeenCalledWith(
        JSON.stringify({ name: 'new-message', data: mockMessage }),
      )
      expect(recipientClient.send).toHaveBeenCalledWith(
        JSON.stringify({ name: 'new-message', data: mockMessage }),
      )
    })

    it('should not send to recipient when message is deleted by them', async () => {
      const senderClient = createMockClient('user-1')
      const recipientClient = createMockClient('user-2')
      const mockUserService = {
        updateIsConnected: jest.fn().mockResolvedValue({ lastSeenAt: new Date() }),
      }
      const mockChatService = {
        findByUserSimple: jest.fn().mockResolvedValue([]),
      }

      mockModuleRef.get
        .mockReturnValueOnce(mockUserService)
        .mockReturnValueOnce(mockChatService)
        .mockReturnValueOnce(mockUserService)
        .mockReturnValueOnce(mockChatService)

      await service.addConnection(senderClient, {
        id: 'user-1',
        email: 'sender@test.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      })
      await service.addConnection(recipientClient, {
        id: 'user-2',
        email: 'recipient@test.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      })

      const mockMessage: any = {
        from: { _id: { toString: () => 'user-1' } },
        to: { _id: { toString: () => 'user-2' } },
        text: 'hello',
        deletedBy: [{ _id: { toString: () => 'user-2' } }],
      }

      service.sendMessageToClient(mockMessage)

      expect(senderClient.send).toHaveBeenCalled()
      expect(recipientClient.send).not.toHaveBeenCalled()
    })
  })

  describe('sendGroupMessageToClients', () => {
    it('should send message to all connected group members', async () => {
      const client1 = createMockClient('user-1')
      const client2 = createMockClient('user-2')
      const mockUserService = {
        updateIsConnected: jest.fn().mockResolvedValue({ lastSeenAt: new Date() }),
      }
      const mockChatService = {
        findByUserSimple: jest.fn().mockResolvedValue([]),
      }

      mockModuleRef.get
        .mockReturnValueOnce(mockUserService)
        .mockReturnValueOnce(mockChatService)
        .mockReturnValueOnce(mockUserService)
        .mockReturnValueOnce(mockChatService)

      await service.addConnection(client1, {
        id: 'user-1',
        email: 'user1@test.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      })
      await service.addConnection(client2, {
        id: 'user-2',
        email: 'user2@test.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      })

      const mockMessage: any = { text: 'hello group' }
      service.sendGroupMessageToClients(mockMessage, ['user-1', 'user-2', 'user-3'])

      expect(client1.send).toHaveBeenCalledWith(
        JSON.stringify({ name: 'new-message', data: mockMessage }),
      )
      expect(client2.send).toHaveBeenCalledWith(
        JSON.stringify({ name: 'new-message', data: mockMessage }),
      )
    })

    it('should skip offline members', async () => {
      const client1 = createMockClient('user-1')
      const mockUserService = {
        updateIsConnected: jest.fn().mockResolvedValue({ lastSeenAt: new Date() }),
      }
      const mockChatService = {
        findByUserSimple: jest.fn().mockResolvedValue([]),
      }

      mockModuleRef.get.mockReturnValueOnce(mockUserService).mockReturnValueOnce(mockChatService)

      await service.addConnection(client1, {
        id: 'user-1',
        email: 'user1@test.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      })

      const mockMessage: any = { text: 'hello group' }
      service.sendGroupMessageToClients(mockMessage, ['user-1', 'user-2']) // user-2 offline

      expect(client1.send).toHaveBeenCalled()
      // user-2 has no client so no send call for them
    })
  })
})
