import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { WsAdapter } from '@nestjs/platform-ws'
import helmet from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(helmet())
  app.useGlobalPipes(new ValidationPipe())

  app.useWebSocketAdapter(new WsAdapter(app))

  const configService: ConfigService = app.get<ConfigService>(ConfigService)
  const port: number = configService.get<number>('app.port')
  const corsOrigin: string = configService.get<string>('app.corsOrigin')

  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })

  await app.listen(port)
}
bootstrap()
