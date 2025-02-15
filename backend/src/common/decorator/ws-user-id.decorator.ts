import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WsAuthUserId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient()
    return client.userId
})