import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User } from './entities/user.schema'
import * as mongoose from 'mongoose'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import * as bcrypt from 'bcrypt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UserService {
    constructor(
        private configService: ConfigService,
        @InjectModel(User.name) private userModel: mongoose.Model<User>
    ) {}

    async create(createUserInput: CreateUserDto): Promise<User> {
        // CHECK IF EMAIL ALREADY EXISTS
        const userFound = await this.findByEmail(createUserInput.email)

        if (userFound) {
            throw new BadRequestException('User already registered')
        }

        // ENCRYPT THE USER'S PASSWORD
        const saltRound: number = this.configService.get<number>('app.saltRound')
        const hash = await bcrypt.hash(createUserInput.password, saltRound)

        // CREATE USER
        const createdUser = new this.userModel({
            ...createUserInput,
            password: hash
        })
        return await createdUser.save()
    }

    async getAll(): Promise<User[]> {
        return await this.userModel.find()
    }

    async findById(_id: string): Promise<User> {
        return await this.userModel.findById(_id)
    }

    async delete(_id: string): Promise<User> {
        return await this.userModel.findByIdAndDelete(_id)
    }

    async update(_id: string, updateUserInput: UpdateUserDto): Promise<User> {
        // CHECK IF USER IS REGISTERED
        const userFoundById = await this.findById(_id)

        if (!userFoundById) {
            throw new NotFoundException('User not found')
        }

        // CHECK IF EMAIL ALREADY EXISTS
        if (updateUserInput.email) {
            const userFoundByEmail = await this.findByEmail(updateUserInput.email)

            if (userFoundByEmail._id?.toString() !== _id) {
                throw new BadRequestException('Email is already registered')
            }
        }

        if (updateUserInput.password) {
            // ENCRYPT THE USER'S PASSWORD
            const saltRound: number = this.configService.get<number>('app.saltRound')
            updateUserInput.password = await bcrypt.hash(updateUserInput.password, saltRound)
        }

        return await this.userModel.findByIdAndUpdate(
            _id,
            { $set: updateUserInput },
            { new: true }
        )      
    }

    async updateToken(_id: string, token: string): Promise<User> {
        return await this.userModel.findByIdAndUpdate(
            _id,
            { $set: { token } },
            { new: true }
        )
    }

    async findByEmail(email: string): Promise<User> {
        return await this.userModel.findOne({ email })
    }
}
