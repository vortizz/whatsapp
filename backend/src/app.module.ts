import { Module } from '@nestjs/common'
import { UserModule } from './user/user.module'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule, ConfigService } from '@nestjs/config'
import configuration from './common/config/configuration'
import { AuthModule } from './auth/auth.module'
import { ChatModule } from './chat/chat.module'
import { MessageModule } from './message/message.module'
import { WebsocketModule } from './websocket/websocket.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongo.uri'),
        user: config.get<string>('mongo.user'),
        pass: config.get<string>('mongo.password'),
        dbName: config.get<string>('mongo.db')
      }),
      inject: [ConfigService]
    }),
    UserModule,
    AuthModule,
    ChatModule,
    MessageModule,
    WebsocketModule
  ]
})
export class AppModule {}
