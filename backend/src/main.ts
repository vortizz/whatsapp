import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())

  const configService: ConfigService = app.get<ConfigService>(ConfigService)
  const port: number = configService.get<number>('app.port')
  await app.listen(port)
}
bootstrap()
