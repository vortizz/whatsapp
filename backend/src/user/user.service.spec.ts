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

const mockUserModel: any = jest.fn().mockImplementation(() => ({ save: mockSave }))
mockUserModel.findOne = jest.fn()
mockUserModel.findById = jest.fn()
mockUserModel.findByIdAndUpdate = jest.fn()

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
      mockUserModel.findOne.mockResolvedValue(null)
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never)
      mockSave.mockResolvedValue({
        ...baseCreateUserDto,
        _id: 'new-user',
        password: 'hashed-password',
      })

      const result = await service.create(baseCreateUserDto)

      expect(bcrypt.hash).toHaveBeenCalled()
      expect(result.password).toBe('hashed-password')
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
})
