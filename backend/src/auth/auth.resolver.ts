import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { AuthService } from './auth.service'
import { LoginResponse } from './models/login.response'
import { LoginUserInput } from './dtos/login-user.input'
import { UseGuards } from '@nestjs/common'
import { GqlLocalAuthGuard } from 'src/guard/local-auth.guard'

@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService) {}

    @Mutation(() => LoginResponse)
    @UseGuards(GqlLocalAuthGuard)
    async login(
        @Args('loginUserInput') loginUserInput: LoginUserInput,
        @Context() context
    ): Promise<LoginResponse> {
        return await this.authService.login(context.user)
    }
}