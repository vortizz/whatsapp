import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from './user.service'
import { getModelToken } from '@nestjs/mongoose'
import { User } from './entities/user.schema'
import { ConfigService } from '@nestjs/config'
import { ChatService } from 'src/chat/chat.service'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

jest.mock('bcrypt')

const mockSave = jest.fn()

const mockUserModel: any = Object.assign(
  jest.fn().mockImplementation(() => ({ save: mockSave })),
  {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
)

const mockConfigService = {
  get: jest.fn().mockReturnValue(10),
}

const mockChatService = {
  findByUserSimple: jest.fn(),
}

const baseCreateUserDto = {
  name: 'Victor',
  email: 'victor@email.com',
  password: 'plaintext',
  about: 'Hey there!',
  publicKey: 'public-key',
  encryptedPrivateKey: 'encrypted-private-key',
  iv: 'iv-value',
  recoveryCodes: [{ encryptedPrivateKey: 'enc', iv: 'iv' }],
}

describe('UserService', () => {
  let service: UserService

  beforeEach(async () => {
    mockUserModel.mockImplementation(() => ({ save: mockSave }))
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never)

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: ChatService, useValue: mockChatService },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should throw BadRequestException when email is already registered', async () => {
      mockUserModel.findOne.mockResolvedValue({ _id: 'existing-user' })

      await expect(
        service.create({ ...baseCreateUserDto, email: 'taken@email.com' }),
      ).rejects.toThrow(BadRequestException)
    })

    it('should hash the password and create the user', async () => {
      const savedUser = { ...baseCreateUserDto, _id: 'new-user', password: 'hashed-password' }

      mockUserModel.findOne.mockResolvedValue(null)
      mockSave.mockResolvedValue(savedUser)
      mockUserModel.findById.mockResolvedValue(savedUser)

      const result = await service.create(baseCreateUserDto)

      expect(bcrypt.hash).toHaveBeenCalled()
      expect(result).toBeDefined()
      expect(result._id).toBe('new-user')
    })
  })

  describe('blockUser', () => {
    it('should throw BadRequestException when user tries to block themselves', async () => {
      await expect(service.blockUser('same-id', 'same-id')).rejects.toThrow(BadRequestException)
    })

    it('should throw NotFoundException when the blocking user does not exist', async () => {
      mockUserModel.findById.mockResolvedValueOnce(null).mockResolvedValueOnce({ _id: 'user-2' })

      await expect(service.blockUser('missing-id', 'user-2')).rejects.toThrow(NotFoundException)
    })

    it('should throw NotFoundException when user to block does not exist', async () => {
      mockUserModel.findById
        .mockResolvedValueOnce({ _id: 'user-1', blockedUsers: [] })
        .mockResolvedValueOnce(null)

      await expect(service.blockUser('user-1', 'missing-id')).rejects.toThrow(NotFoundException)
    })

    it('should throw BadRequestException when user is already blocked', async () => {
      mockUserModel.findById
        .mockResolvedValueOnce({ _id: 'user-1', blockedUsers: [{ toString: () => 'user-2' }] })
        .mockResolvedValueOnce({ _id: 'user-2' })

      await expect(service.blockUser('user-1', 'user-2')).rejects.toThrow(BadRequestException)
    })

    it('should block the user successfully', async () => {
      const updatedUser = { _id: 'user-1', blockedUsers: ['user-2'] }
      mockUserModel.findById
        .mockResolvedValueOnce({ _id: 'user-1', blockedUsers: [] })
        .mockResolvedValueOnce({ _id: 'user-2' })
      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser)

      const result = await service.blockUser('user-1', 'user-2')

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalled()
      expect(result).toEqual(updatedUser)
    })
  })

  describe('unblockUser', () => {
    it('should throw BadRequestException when user tries to unblock themselves', async () => {
      await expect(service.unblockUser('same-id', 'same-id')).rejects.toThrow(BadRequestException)
    })

    it('should throw NotFoundException when the unblocking user does not exist', async () => {
      mockUserModel.findById.mockResolvedValueOnce(null).mockResolvedValueOnce({ _id: 'user-2' })

      await expect(service.unblockUser('missing-id', 'user-2')).rejects.toThrow(NotFoundException)
    })

    it('should throw NotFoundException when user to unblock does not exist', async () => {
      mockUserModel.findById
        .mockResolvedValueOnce({ _id: 'user-1', blockedUsers: [] })
        .mockResolvedValueOnce(null)

      await expect(service.unblockUser('user-1', 'missing-id')).rejects.toThrow(NotFoundException)
    })

    it('should throw BadRequestException when user is not blocked', async () => {
      mockUserModel.findById
        .mockResolvedValueOnce({ _id: 'user-1', blockedUsers: [] })
        .mockResolvedValueOnce({ _id: 'user-2' })

      await expect(service.unblockUser('user-1', 'user-2')).rejects.toThrow(BadRequestException)
    })

    it('should unblock the user successfully', async () => {
      const updatedUser = { _id: 'user-1', blockedUsers: [] }
      mockUserModel.findById
        .mockResolvedValueOnce({
          _id: 'user-1',
          blockedUsers: [{ toString: () => 'user-2' }],
        })
        .mockResolvedValueOnce({ _id: 'user-2' })
      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser)

      const result = await service.unblockUser('user-1', 'user-2')

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalled()
      expect(result).toEqual(updatedUser)
    })
  })

  describe('update', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      mockUserModel.findById.mockResolvedValue(null)

      await expect(
        service.update('user-id-1', { _id: 'user-id-1', name: 'New Name' }),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw BadRequestException when email belongs to a different user', async () => {
      mockUserModel.findById.mockResolvedValue({ _id: 'user-id-1' })
      mockUserModel.findOne.mockResolvedValue({ _id: 'user-id-2' })

      await expect(
        service.update('user-id-1', { _id: 'user-id-1', email: 'taken@email.com' }),
      ).rejects.toThrow(BadRequestException)
    })

    it('should hash the password when updating it', async () => {
      mockUserModel.findById.mockResolvedValue({ _id: 'user-id-1' })
      mockUserModel.findOne.mockResolvedValue({ _id: 'user-id-1' })
      mockUserModel.findByIdAndUpdate.mockResolvedValue({ _id: 'user-id-1', name: 'Victor' })

      await service.update('user-id-1', { _id: 'user-id-1', password: 'newpassword' })

      expect(bcrypt.hash).toHaveBeenCalled()
    })

    it('should update and return the user', async () => {
      const updatedUser = { _id: 'user-id-1', name: 'New Name' }
      mockUserModel.findById.mockResolvedValue({ _id: 'user-id-1' })
      mockUserModel.findOne.mockResolvedValue(null)
      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser)

      const result = await service.update('user-id-1', { _id: 'user-id-1', name: 'New Name' })

      expect(result).toEqual(updatedUser)
    })
  })
})
