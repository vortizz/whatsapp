import { Test, TestingModule } from '@nestjs/testing'
import { TokenGuard } from './token.guard'
import { UserService } from 'src/user/user.service'
import { ExecutionContext } from '@nestjs/common'

const mockUserService = {
  getSensitivePropsByIds: jest.fn(),
}

const createMockContext = (token: string, userId: string): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        user: { _id: userId },
        cookies: { token },
      }),
    }),
  }) as any

describe('TokenGuard', () => {
  let guard: TokenGuard

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenGuard, { provide: UserService, useValue: mockUserService }],
    }).compile()

    guard = module.get<TokenGuard>(TokenGuard)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return true when cookie token matches database token', async () => {
    mockUserService.getSensitivePropsByIds.mockResolvedValue('valid-token')
    const context = createMockContext('valid-token', 'user-1')

    const result = await guard.canActivate(context)

    expect(result).toBe(true)
  })

  it('should return false when cookie token does not match database token', async () => {
    mockUserService.getSensitivePropsByIds.mockResolvedValue('valid-token')
    const context = createMockContext('wrong-token', 'user-1')

    const result = await guard.canActivate(context)

    expect(result).toBe(false)
  })

  it('should return false when no token cookie is present', async () => {
    mockUserService.getSensitivePropsByIds.mockResolvedValue('valid-token')
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { _id: 'user-1' },
          cookies: {},
        }),
      }),
    } as any

    const result = await guard.canActivate(context)

    expect(result).toBe(false)
  })
})
