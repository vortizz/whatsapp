import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { JwtService } from '@nestjs/jwt'
import { UserService } from 'src/user/user.service'
import * as bcrypt from 'bcrypt'

jest.mock('bcrypt')

const mockUserService = {
  findByEmail: jest.fn(),
  getSensitivePropsByIds: jest.fn(),
  updateToken: jest.fn(),
}

const mockJwtService = {
  sign: jest.fn(),
}

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('validateUser', () => {
    it('should return null when user is not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null)

      const result = await service.validateUser('test@email.com', 'anypassword')

      expect(result).toBeNull()
      expect(mockUserService.getSensitivePropsByIds).not.toHaveBeenCalled()
    })

    it('should return null when password is invalid', async () => {
      const mockUser = { _id: 'user-id-1', email: 'test@email.com', name: 'Victor' }
      mockUserService.findByEmail.mockResolvedValue(mockUser)
      mockUserService.getSensitivePropsByIds.mockResolvedValue('hashed-password')
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false as never)

      const result = await service.validateUser('test@email.com', 'wrongpassword')

      expect(result).toBeNull()
    })

    it('should return the user when credentials are valid', async () => {
      const mockUser = { _id: 'user-id-1', email: 'test@email.com', name: 'Victor' }
      mockUserService.findByEmail.mockResolvedValue(mockUser)
      mockUserService.getSensitivePropsByIds.mockResolvedValue('hashed-password')
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true as never)

      const result = await service.validateUser('test@email.com', 'correctpassword')

      expect(result).toEqual(mockUser)
    })
  })

  describe('login', () => {
    it('should sign a JWT token and update the user token', async () => {
      const mockUser = { _id: 'user-id-1', email: 'test@email.com' }
      const mockToken = 'signed-jwt-token'
      mockJwtService.sign.mockReturnValue(mockToken)
      mockUserService.updateToken.mockResolvedValue({ ...mockUser, token: mockToken })

      const result = await service.login({ id: 'user-id-1', email: 'test@email.com' })

      expect(mockJwtService.sign).toHaveBeenCalledWith({ id: 'user-id-1', email: 'test@email.com' })
      expect(mockUserService.updateToken).toHaveBeenCalledWith('user-id-1', mockToken)
      expect(result.token).toBe(mockToken)
    })
  })
})
