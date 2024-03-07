import { UseGuards, applyDecorators } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TokenGuard } from "../guard/token.guard";

export function Auth() {
  return applyDecorators(
    UseGuards(AuthGuard('jwt'), TokenGuard)
  )
}