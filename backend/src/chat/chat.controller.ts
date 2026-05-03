import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ChatService } from './chat.service'
import { Chat } from './entities/chat.schema'
import { Auth } from 'src/common/decorator/auth.decorator'
import { AuthUser } from 'src/common/decorator/user.decorator'
import { User } from 'src/user/entities/user.schema'
import { CreateChatDto } from './dtos/create-chat.dto'
import { CreateGroupChatDto } from './dtos/create-group-chat.dto'
import { AddMemberGroupChatDto } from './dtos/add-member-group-chat.dto'

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Auth()
  @Get()
  async findByUser(@AuthUser() user: User, @Query('username') username: string): Promise<Chat[]> {
    return await this.chatService.findByUser(user, username)
  }

  @Auth()
  @Post()
  async create(@AuthUser() user: User, @Body() createChatDto: CreateChatDto): Promise<Chat> {
    const userWith = new User()
    userWith._id = createChatDto.user_id
    return await this.chatService.create([user, userWith], createChatDto.encryptedKeys)
  }

  @Auth()
  @Post('group')
  async createGroup(@AuthUser() user: User, @Body() dto: CreateGroupChatDto): Promise<Chat> {
    const users = dto.user_ids.map((id) => {
      const u = new User()
      u._id = id
      return u
    })
    return await this.chatService.createGroup([user, ...users], dto.name, dto.encryptedKeys)
  }

  @Auth()
  @Get(':id/events')
  async findEventsByChatId(@AuthUser() user: User, @Param('id') id: string) {
    return await this.chatService.findEventsByChatId(user._id, id)
  }

  @Auth()
  @Patch(':id/name')
  async updateGroupName(
    @AuthUser() user: User,
    @Param('id') id: string,
    @Body('name') name: string,
  ): Promise<Chat> {
    return await this.chatService.updateGroupName(id, name, user)
  }

  @Auth()
  @Patch(':id/description')
  async updateGroupDescription(
    @AuthUser() user: User,
    @Param('id') id: string,
    @Body('description') description: string,
  ): Promise<Chat> {
    return await this.chatService.updateGroupDescription(id, description, user)
  }

  @Auth()
  @Patch(':id/members')
  async addGroupMembers(
    @AuthUser() user: User,
    @Param('id') id: string,
    @Body() dto: AddMemberGroupChatDto,
  ): Promise<Chat> {
    return await this.chatService.addGroupMembers(id, dto, user)
  }

  @Auth()
  @Patch(':id/member/:user_id')
  async removeGroupMember(
    @AuthUser() user: User,
    @Param('id') id: string,
    @Param('user_id') userId: string,
  ): Promise<Chat> {
    return await this.chatService.removeGroupMember(id, userId, user)
  }

  @Auth()
  @Patch(':id/exit')
  async exitGroup(@AuthUser() user: User, @Param('id') id: string): Promise<Chat> {
    return await this.chatService.exitGroup(id, user)
  }

  @Auth()
  @Patch(':id/group-admin/:user_id')
  async setUserGroupAdmin(
    @AuthUser() user: User,
    @Param('id') id: string,
    @Param('user_id') userId: string,
    @Body('is_admin') isAdmin: boolean,
  ): Promise<Chat> {
    return await this.chatService.setUserGroupAdmin(id, userId, isAdmin, user)
  }
}
