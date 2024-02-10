import { UseGuards, applyDecorators } from '@nestjs/common'
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard'

export function Auth() {
  return applyDecorators(
    UseGuards(JwtAuthGuard)
  )
}