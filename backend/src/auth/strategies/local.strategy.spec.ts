import { Test, TestingModule } from '@nestjs/testing'
import { LocalStrategy } from './local.strategy'
import { AuthService } from '../auth.service'
import { UnauthorizedException } from '@nestjs/common'

const mockAuthService = {
  validateUser: jest.fn(),
}

describe('LocalStrategy', () => {
  let strategy: LocalStrategy

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalStrategy, { provide: AuthService, useValue: mockAuthService }],
    }).compile()

    strategy = module.get<LocalStrategy>(LocalStrategy)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return the user when credentials are valid', async () => {
    const mockUser = { _id: 'user-1', email: 'test@test.com' }
    mockAuthService.validateUser.mockResolvedValue(mockUser)

    const result = await strategy.validate('test@test.com', 'password')

    expect(result).toEqual(mockUser)
  })

  it('should throw UnauthorizedException when credentials are invalid', async () => {
    mockAuthService.validateUser.mockResolvedValue(null)

    await expect(strategy.validate('wrong@test.com', 'wrongpassword')).rejects.toThrow(
      UnauthorizedException,
    )
  })
})
