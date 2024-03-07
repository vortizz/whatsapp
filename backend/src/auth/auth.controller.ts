import { AuthService } from './auth.service'
import { LoginResponse } from './models/login.response'
import { Controller, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Req() req: any): Promise<LoginResponse> {
        return await this.authService.login(req.user)
    }
}