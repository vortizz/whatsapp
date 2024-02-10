import { UserService } from './user.service'
import { User } from './entities/user.schema'
import { CreateUserInput } from './dtos/create-user.input'
import { UpdateUserInput } from './dtos/update-user.input'
import * as mongoose from 'mongoose'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Auth } from 'src/decorator/auth.decorator'

@Resolver(() => User)
export class UserResolver {
    constructor(private readonly userService: UserService) {}

    @Mutation(() => User)
    async createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<User> {
        return await this.userService.create(createUserInput)
    }

    @Query(() => [User])
    @Auth()
    async users(): Promise<User[]> {
        return await this.userService.getAll()
    }

    @Query(() => User)
    async user(@Args('_id', { type: () => String }) _id: mongoose.Schema.Types.ObjectId): Promise<User> {
        return await this.userService.findById(_id)
    }

    @Mutation(() => User)
    async deleteUser(@Args('_id', { type: () => String }) _id: mongoose.Schema.Types.ObjectId): Promise<User> {
        return await this.userService.delete(_id)
    }

    @Mutation(() => User)
    async updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput): Promise<User> {
        return await this.userService.update(updateUserInput._id, updateUserInput)
    }
}
