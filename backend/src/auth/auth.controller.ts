import { User } from 'src/user/entities/user.schema'
import { AuthService } from './auth.service'
import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Auth } from 'src/common/decorator/auth.decorator'
import { Response } from 'express'
import { UserService } from 'src/user/user.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: any, @Res({ passthrough: true }) res: Response): Promise<User> {
    const user = await this.authService.login(req.user)
    const sensitiveProps = await this.userService.getSensitivePropsByIds<{
      token: string
      recoveryCodes: {
        encryptedPrivateKey: string
        iv: string
      }[]
      encryptedPrivateKey: string
      iv: string
    }>(user._id, ['token', 'recoveryCodes', 'encryptedPrivateKey', 'iv'])
    res.cookie('token', sensitiveProps.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    return {
      ...user,
      ...sensitiveProps,
    }
  }

  @Auth()
  @Post('valid-token')
  async validToken() {
    return { valid: true }
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    return { success: true }
  }
}
