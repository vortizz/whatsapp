import { UserService } from './user.service'
import { User } from './entities/user.schema'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { Auth } from 'src/common/decorator/auth.decorator'
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'

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
