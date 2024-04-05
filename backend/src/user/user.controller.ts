import { UserService } from './user.service'
import { User } from './entities/user.schema'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { Auth } from 'src/common/decorator/auth.decorator'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
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
        @Query('username') username: string
    ): Promise<User[]> {
        return await this.userService.userWithNoChat(user, username)
    }

    @Auth()
    @Get('/new-chat')
    async userNewChat(
        @AuthUser() user: User,
        @Query('username') username: string
    ): Promise<User[]> {
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
}
