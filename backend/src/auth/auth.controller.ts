import { User } from 'src/user/entities/user.schema'
import { AuthService } from './auth.service'
import { Controller, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Auth } from 'src/common/decorator/auth.decorator'
import { Throttle } from '@nestjs/throttler'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: any): Promise<User> {
    return await this.authService.login(req.user)
  }

  @Auth()
  @Post('valid-token')
  async validToken() {
    return { valid: true }
  }
}
