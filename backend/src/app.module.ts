import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { UserModule } from './user/user.module'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule, ConfigService } from '@nestjs/config'
import configuration from './common/config/configuration'
import { AuthModule } from './auth/auth.module'
import { ChatModule } from './chat/chat.module'
import { MessageModule } from './message/message.module'
import { WebsocketModule } from './websocket/websocket.module'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongo.uri'),
        user: config.get<string>('mongo.user'),
        pass: config.get<string>('mongo.password'),
        dbName: config.get<string>('mongo.db'),
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'default',
          ttl: config.get<number>('app.throttle.ttl'),
          limit: config.get<number>('app.throttle.limit'),
        },
      ],
    }),
    UserModule,
    AuthModule,
    ChatModule,
    MessageModule,
    WebsocketModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
