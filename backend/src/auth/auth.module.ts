import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UserModule } from 'src/user/user.module'
import { PassportModule } from '@nestjs/passport'

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                signOptions: {
                    expiresIn: '1d',
                },
                secret: config.get<string>('app.jwtSecretKey')
            })
        }),
        UserModule,
        PassportModule
    ],
    providers: [AuthResolver, AuthService, LocalStrategy, JwtStrategy]
})
export class AuthModule {}