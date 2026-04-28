import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compareSync } from 'bcrypt'
import { User } from 'src/user/entities/user.schema'
import { UserService } from 'src/user/user.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ id, email }): Promise<User> {
    const token = this.jwtService.sign({ id, email })
    return await this.userService.updateToken(id, token)
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email)

    if (!user) {
      return null
    }

    const passwordDb = await this.userService.getSensitivePropsByIds<string>(user._id, 'password')

    const isPasswordValid = compareSync(password, passwordDb)

    if (!isPasswordValid) {
      return null
    }

    return user
  }
}
