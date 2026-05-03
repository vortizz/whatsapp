import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { UserService } from 'src/user/user.service'

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, cookies } = context.switchToHttp().getRequest()

    const token = cookies?.token
    const tokenDb = await this.userService.getSensitivePropsByIds<string>(user._id, 'token')

    return token === tokenDb
  }
}
