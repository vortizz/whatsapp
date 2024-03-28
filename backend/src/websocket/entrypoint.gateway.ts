import { ClassSerializerInterceptor, UseInterceptors } from "@nestjs/common";
import { WebSocketGateway } from "@nestjs/websockets"

@UseInterceptors(ClassSerializerInterceptor)
@WebSocketGateway({ path: '/entrypoint' })
export class EntrypointGateway {}