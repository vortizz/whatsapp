import { Test, TestingModule } from '@nestjs/testing'
import { JwtStrategy } from './jwt.strategy'
import { ConfigService } from '@nestjs/config'

const mockConfigService = {
  get: jest.fn().mockReturnValue('test-secret'),
}

describe('JwtStrategy', () => {
  let strategy: JwtStrategy

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy, { provide: ConfigService, useValue: mockConfigService }],
    }).compile()

    strategy = module.get<JwtStrategy>(JwtStrategy)
  })

  describe('validate', () => {
    it('should return user object from JWT payload', async () => {
      const payload = { id: 'user-1', email: 'test@test.com' }

      const result = await strategy.validate(payload)

      expect(result).toEqual({ _id: 'user-1', email: 'test@test.com' })
    })

    it('should map id to _id', async () => {
      const payload = { id: 'user-id-123', email: 'test@test.com' }

      const result = await strategy.validate(payload)

      expect(result._id).toBe('user-id-123')
      expect(result).not.toHaveProperty('id')
    })
  })
})
