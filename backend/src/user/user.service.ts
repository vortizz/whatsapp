import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User } from './entities/user.schema'
import * as mongoose from 'mongoose'
import { CreateUserInput } from './dtos/create-user.input'
import { UpdateUserInput } from './dtos/update-user.input'
import * as bcrypt from 'bcrypt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UserService {
    constructor(
        private configService: ConfigService,
        @InjectModel(User.name) private userModel: mongoose.Model<User>
    ) {}

    async create(createUserInput: CreateUserInput): Promise<User> {
        const userFound = await this.findByEmail(createUserInput.email)

        if (userFound) {
            throw new BadRequestException('User already registered')
        }

        const saltRound: number = this.configService.get<number>('app.saltRound')
        const hash = await bcrypt.hash(createUserInput.password, saltRound)

        const createdUser = new this.userModel({
            ...createUserInput,
            password: hash
        })
        return await createdUser.save()
    }

    async getAll(): Promise<User[]> {
        return await this.userModel.find()
    }

    async findById(_id: mongoose.Schema.Types.ObjectId): Promise<User> {
        return await this.userModel.findById(_id)
    }

    async delete(_id: mongoose.Schema.Types.ObjectId): Promise<User> {
        return await this.userModel.findByIdAndDelete(_id)
    }

    async update(_id: mongoose.Schema.Types.ObjectId, updateUserInput: UpdateUserInput): Promise<User> {
        const userFound = await this.findById(_id)

        if (!userFound) {
            throw new NotFoundException('User not found')
        }

        return await this.userModel.findByIdAndUpdate(
            _id,
            { $set: updateUserInput },
            { new: true }
        )      
    }

    async findByEmail(email: string): Promise<User> {
        return await this.userModel.findOne({ email })
    }
}
