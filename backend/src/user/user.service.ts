import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User } from './entities/user.schema'
import * as mongoose from 'mongoose'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import * as bcrypt from 'bcrypt'
import { ConfigService } from '@nestjs/config'
import { ChatService } from 'src/chat/chat.service'

@Injectable()
export class UserService {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
    private readonly chatService: ChatService,
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
      password: hash,
    })
    await createdUser.save()
    return this.findById(createdUser._id)
  }

  async getAll(): Promise<User[]> {
    return await this.userModel.find()
  }

  async findById(_id: string): Promise<User> {
    return await this.userModel.findById(_id)
  }

  async getSensitivePropsByIds<T>(id: string, propNames: string): Promise<T>
  async getSensitivePropsByIds<T extends Record<string, unknown>>(
    id: string,
    propNames: string[],
  ): Promise<T>
  async getSensitivePropsByIds<T>(id: string, propNames: string | string[]): Promise<T> {
    const isArray = Array.isArray(propNames)
    const fields = isArray ? propNames : [propNames]
    const selectFields = fields.map((p) => `+${p}`).join(' ')
    const user = await this.userModel.findById(id).select(selectFields).lean()

    if (!isArray) return user?.[propNames] as T

    return fields.reduce((acc, prop) => {
      acc[prop] = user?.[prop]
      return acc
    }, {} as any) as T
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

    return await this.userModel.findByIdAndUpdate(_id, { $set: updateUserInput }, { new: true })
  }

  async updateToken(_id: string, token: string): Promise<User> {
    return await this.userModel
      .findByIdAndUpdate(_id, { $set: { token } }, { new: true })
      .lean({ getters: false })
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email })
  }

  async updateIsConnected(_id: string, isConnected: boolean): Promise<User> {
    if (!isConnected) {
      await this.updateLastSeenAt(_id)
    }
    return await this.userModel.findByIdAndUpdate(_id, { $set: { isConnected } }, { new: true })
  }

  async updateLastSeenAt(_id: string): Promise<User> {
    return await this.userModel.findByIdAndUpdate(
      _id,
      { $set: { lastSeenAt: new Date() } },
      { new: true },
    )
  }

  async blockUser(blockedByUserId: string, blockedUserId: string): Promise<User> {
    if (blockedByUserId === blockedUserId) {
      throw new BadRequestException('User cannot block themselves')
    }

    const [blockedByUser, blockedUser] = await Promise.all([
      this.findById(blockedByUserId),
      this.findById(blockedUserId),
    ])

    if (!blockedByUser) {
      throw new NotFoundException('User not found')
    }

    if (!blockedUser) {
      throw new NotFoundException('User to block not found')
    }

    const isAlreadyBlocked = blockedByUser.blockedUsers?.some(
      (userId) => userId.toString() === blockedUserId,
    )

    if (isAlreadyBlocked) {
      throw new BadRequestException('User already blocked')
    }

    return await this.userModel.findByIdAndUpdate(
      blockedByUserId,
      { $addToSet: { blockedUsers: blockedUser._id } },
      { new: true },
    )
  }

  async unblockUser(blockedByUserId: string, blockedUserId: string): Promise<User> {
    if (blockedByUserId === blockedUserId) {
      throw new BadRequestException('User cannot unblock themselves')
    }

    const [blockedByUser, blockedUser] = await Promise.all([
      this.findById(blockedByUserId),
      this.findById(blockedUserId),
    ])

    if (!blockedByUser) {
      throw new NotFoundException('User not found')
    }

    if (!blockedUser) {
      throw new NotFoundException('User to unblock not found')
    }

    const isBlocked = blockedByUser.blockedUsers?.some((userId) => {
      const currentBlockedUserId = userId?._id?.toString() || userId?.toString()
      return currentBlockedUserId === blockedUserId
    })

    if (!isBlocked) {
      throw new BadRequestException('User is not blocked')
    }

    return await this.userModel.findByIdAndUpdate(
      blockedByUserId,
      { $pull: { blockedUsers: blockedUser._id } },
      { new: true },
    )
  }

  async userWithNoChat(user: User, username: string): Promise<User[]> {
    const users = await this.userModel.find({
      name: { $regex: username, $options: 'i' },
      _id: { $ne: user._id },
    })

    if (!users?.length) {
      return []
    }

    const chats = await this.chatService.findByUserSimple(user)

    return users.filter(
      (user) =>
        !chats.some((chat) => chat.users.some((u) => u._id.toString() === user._id.toString())),
    )
  }

  async userNewChat(user: User, username?: string): Promise<User[]> {
    const filter = { _id: { $ne: user._id } }

    if (username) {
      filter['name'] = { $regex: username, $options: 'i' }
    }

    const users = await this.userModel.find(filter).sort('name')

    if (!users?.length) {
      return []
    }

    const chats = await this.chatService.findByUserSimple(user)

    return users.map((user) => ({
      ...JSON.parse(JSON.stringify(user)),
      chat: chats.find(
        (chat) => !chat.isGroup && chat.users.some((u) => u._id.toString() === user._id.toString()),
      ),
    }))
  }
}
