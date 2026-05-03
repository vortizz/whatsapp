import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { ConfigService } from '@nestjs/config'
import * as mongoose from 'mongoose'
import * as cookieParser from 'cookie-parser'
import { WsAdapter } from '@nestjs/platform-ws'

let mongod: MongoMemoryServer
let app: INestApplication

let authCookie: string
let userId: string
let secondUserId: string
let chatId: string

const userOnePayload = {
  name: 'Victor',
  email: 'victor@test.com',
  password: 'Password123',
  about: 'Hey there',
  publicKey: 'public-key-1',
  encryptedPrivateKey: 'enc-private-key-1',
  iv: 'iv-1',
  recoveryCodes: [{ encryptedPrivateKey: 'enc', iv: 'iv' }],
}

const userTwoPayload = {
  name: 'Caren',
  email: 'caren@test.com',
  password: 'Password456',
  about: 'Hey',
  publicKey: 'public-key-2',
  encryptedPrivateKey: 'enc-private-key-2',
  iv: 'iv-2',
  recoveryCodes: [{ encryptedPrivateKey: 'enc', iv: 'iv' }],
}

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ConfigService)
    .useValue({
      get: (key: string) => {
        const config: Record<string, any> = {
          'mongo.uri': uri,
          'mongo.user': '',
          'mongo.password': '',
          'mongo.db': 'test',
          'app.jwtSecretKey': 'test-secret-key',
          'app.saltRound': 10,
          'app.port': 3001,
          'app.corsOrigin': '*',
        }
        return config[key]
      },
    })
    .compile()

  app = moduleFixture.createNestApplication()
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe())
  app.useWebSocketAdapter(new WsAdapter(app))
  await app.init()
}, 120000)

afterAll(async () => {
  await app.close()
  await mongoose.disconnect()
  await mongod.stop()
})

// ─────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────
describe('User (e2e)', () => {
  it('POST /user — should register user one and return the user', async () => {
    const res = await request(app.getHttpServer()).post('/user').send(userOnePayload).expect(201)
    expect(res.body.email).toBe(userOnePayload.email)
    expect(res.body.password).toBeUndefined()
    userId = res.body._id
  })

  it('POST /user — should register user two', async () => {
    const res = await request(app.getHttpServer()).post('/user').send(userTwoPayload).expect(201)

    secondUserId = res.body._id
  })

  it('POST /user — should return 400 when email is already registered', () => {
    return request(app.getHttpServer()).post('/user').send(userOnePayload).expect(400)
  })

  it('POST /user — should return 400 when required fields are missing', () => {
    return request(app.getHttpServer())
      .post('/user')
      .send({ email: 'incomplete@test.com' })
      .expect(400)
  })

  it('GET /user — should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).get('/user').expect(401)
  })
})

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
describe('Auth (e2e)', () => {
  it('POST /auth/login — should return 401 when password is wrong', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userOnePayload.email, password: 'wrongpassword' })
      .expect(401)
  })

  it('POST /auth/login — should return 201 and set a cookie when credentials are correct', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userOnePayload.email, password: userOnePayload.password })
      .expect(201)

    expect(res.body.email).toBe(userOnePayload.email)
    expect(res.body.password).toBeUndefined()
    expect(res.headers['set-cookie']).toBeDefined()

    authCookie = res.headers['set-cookie'][0]
  })

  it('POST /auth/valid-token — should return 201 when token is valid', () => {
    return request(app.getHttpServer())
      .post('/auth/valid-token')
      .set('Cookie', authCookie)
      .expect(201)
      .expect({ valid: true })
  })

  it('POST /auth/valid-token — should return 401 when no token is provided', () => {
    return request(app.getHttpServer()).post('/auth/valid-token').expect(401)
  })
})

// ─────────────────────────────────────────────
// CHAT
// ─────────────────────────────────────────────
describe('Chat (e2e)', () => {
  it('GET /chat — should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).get('/chat').expect(401)
  })

  it('GET /chat — should return empty array when user has no chats', () => {
    return request(app.getHttpServer())
      .get('/chat')
      .set('Cookie', authCookie)
      .expect(200)
      .expect([])
  })

  it('POST /chat — should create a chat between two users', async () => {
    const res = await request(app.getHttpServer())
      .post('/chat')
      .set('Cookie', authCookie)
      .send({
        user_id: secondUserId,
        encryptedKeys: [
          { userId: userId, encryptedKey: 'enc-key-for-user-1' },
          { userId: secondUserId, encryptedKey: 'enc-key-for-user-2' },
        ],
      })
      .expect(201)

    expect(res.body._id).toBeDefined()
    expect(res.body.isGroup).toBe(false)
    chatId = res.body._id
  })

  it('POST /chat — should return 400 when chat between same users already exists', () => {
    return request(app.getHttpServer())
      .post('/chat')
      .set('Cookie', authCookie)
      .send({
        user_id: secondUserId,
        encryptedKeys: [
          { userId: userId, encryptedKey: 'enc-key-for-user-1' },
          { userId: secondUserId, encryptedKey: 'enc-key-for-user-2' },
        ],
      })
      .expect(400)
  })

  it('GET /chat — should return the created chat', async () => {
    const res = await request(app.getHttpServer())
      .get('/chat')
      .set('Cookie', authCookie)
      .expect(200)

    expect(res.body.length).toBe(1)
    expect(res.body[0]._id).toBe(chatId)
  })
})

// ─────────────────────────────────────────────
// MESSAGE
// ─────────────────────────────────────────────
describe('Message (e2e)', () => {
  it('POST /message — should return 401 when not authenticated', () => {
    return request(app.getHttpServer())
      .post('/message')
      .send({ chat: chatId, to: secondUserId, text: 'hello' })
      .expect(401)
  })

  it('POST /message — should send a message successfully', async () => {
    const res = await request(app.getHttpServer())
      .post('/message')
      .set('Cookie', authCookie)
      .send({ chat: chatId, to: secondUserId, text: 'hello' })
      .expect(201)

    expect(res.body.text).toBe('hello')
    expect(res.body.status).toBeDefined()
  })

  it('GET /message/:chat_id — should return 401 when not authenticated', () => {
    return request(app.getHttpServer()).get(`/message/${chatId}`).expect(401)
  })

  it('GET /message/:chat_id — should return messages for the chat', async () => {
    const res = await request(app.getHttpServer())
      .get(`/message/${chatId}`)
      .set('Cookie', authCookie)
      .expect(200)

    expect(res.body.length).toBe(1)
    expect(res.body[0].text).toBe('hello')
  })

  it('POST /auth/logout — should return 201 and clear the cookie', () => {
    return request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', authCookie)
      .expect(201)
      .expect({ success: true })
  })

  it('POST /auth/valid-token — should return 401 after logout', () => {
    return request(app.getHttpServer()).post('/auth/valid-token').expect(401)
  })
})
