import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { WsAdapter } from '@nestjs/platform-ws'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })
  app.useGlobalPipes(new ValidationPipe())

  app.useWebSocketAdapter(new WsAdapter(app))

  const configService: ConfigService = app.get<ConfigService>(ConfigService)
  const port: number = configService.get<number>('app.port')
  await app.listen(port)
}
bootstrap()
