import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { UserService } from 'src/user/user.service'

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, headers } = context.switchToHttp().getRequest()

    const token = headers.authorization?.replace('Bearer ', '')
    const userDb = await this.userService.findById(user._id)

    return token === userDb.token
  }
}