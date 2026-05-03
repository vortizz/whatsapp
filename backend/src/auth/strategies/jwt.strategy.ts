import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req?.cookies?.token ?? null]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('app.jwtSecretKey'),
    })
  }

  async validate(payload: any) {
    return {
      _id: payload.id,
      email: payload.email,
    }
  }
}
