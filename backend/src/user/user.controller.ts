import { UserService } from './user.service'
import { User } from './entities/user.schema'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { BlockUserDto } from './dtos/block-user.dto'
import { Auth } from 'src/common/decorator/auth.decorator'
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { AuthUser } from 'src/common/decorator/user.decorator'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.create(createUserDto)
  }

  @Auth()
  @Get()
  async users(): Promise<User[]> {
    return await this.userService.getAll()
  }

  @Auth()
  @Get('/no-chat')
  async userWithNoChat(
    @AuthUser() user: User,
    @Query('username') username: string,
  ): Promise<User[]> {
    return await this.userService.userWithNoChat(user, username)
  }

  @Auth()
  @Get('/new-chat')
  async userNewChat(@AuthUser() user: User, @Query('username') username: string): Promise<User[]> {
    return await this.userService.userNewChat(user, username)
  }

  @Auth()
  @Get('/:_id')
  async user(@Param('_id') _id: string): Promise<User> {
    return await this.userService.findById(_id)
  }

  @Auth()
  @Delete('/:_id')
  async deleteUser(@Param('_id') _id: string): Promise<User> {
    return await this.userService.delete(_id)
  }

  @Auth()
  @Put()
  async updateUser(@Body() updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userService.update(updateUserDto._id, updateUserDto)
  }

  @Auth()
  @Post('/block')
  async blockUser(@AuthUser() user: User, @Body() blockUserDto: BlockUserDto): Promise<User> {
    return await this.userService.blockUser(user._id, blockUserDto.user_id)
  }

  @Auth()
  @Delete('/block/:user_id')
  async unblockUser(@AuthUser() user: User, @Param('user_id') userId: string): Promise<User> {
    return await this.userService.unblockUser(user._id, userId)
  }

  @Auth()
  @Put('/public-key')
  async uploadPublicKey(
    @AuthUser() user: User,
    @Body('publicKey') publicKey: string,
  ): Promise<void> {
    await this.userService.updatePublicKey(user._id, publicKey)
  }

  @Auth()
  @Get('/:_id/public-key')
  async getPublicKey(@Param('_id') _id: string): Promise<{ publicKey: string }> {
    const publicKey = await this.userService.getPublicKey(_id)
    if (!publicKey) throw new NotFoundException('Public key not found for this user')
    return { publicKey }
  }
}
