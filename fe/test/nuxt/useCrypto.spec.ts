import { describe, it, expect } from 'vitest'
import { useCrypto } from '../../composables/useCrypto'

describe('useCrypto', () => {
  const {
    generateKeyPair,
    encryptPrivateKey,
    decryptPrivateKey,
    generateRecoveryCodes,
    encryptMessage,
    decryptMessage,
    generateSharedKeys,
  } = useCrypto()

  describe('generateKeyPair', () => {
    it('should generate a public and private key', async () => {
      const { publicKey, privateKey } = await generateKeyPair()

      expect(publicKey).toBeTruthy()
      expect(privateKey).toBeTruthy()
    })

    it('should generate keys as base64 strings', async () => {
      const { publicKey, privateKey } = await generateKeyPair()

      // base64 only contains these characters
      expect(publicKey).toMatch(/^[A-Za-z0-9+/]+=*$/)
      expect(privateKey).toMatch(/^[A-Za-z0-9+/]+=*$/)
    })

    it('should generate different key pairs each time', async () => {
      const pair1 = await generateKeyPair()
      const pair2 = await generateKeyPair()

      expect(pair1.publicKey).not.toBe(pair2.publicKey)
      expect(pair1.privateKey).not.toBe(pair2.privateKey)
    })
  })

  describe('encryptPrivateKey / decryptPrivateKey', () => {
    it('should encrypt and decrypt the private key with a passphrase', async () => {
      const { privateKey } = await generateKeyPair()
      const passphrase = 'my-secret-passphrase'

      const { encryptedPrivateKey, iv } = await encryptPrivateKey(privateKey, passphrase)
      const decrypted = await decryptPrivateKey(encryptedPrivateKey, passphrase, iv)

      expect(decrypted).toBe(privateKey)
    })

    it('should produce different ciphertext each time due to random IV', async () => {
      const { privateKey } = await generateKeyPair()
      const passphrase = 'my-secret-passphrase'

      const result1 = await encryptPrivateKey(privateKey, passphrase)
      const result2 = await encryptPrivateKey(privateKey, passphrase)

      expect(result1.encryptedPrivateKey).not.toBe(result2.encryptedPrivateKey)
      expect(result1.iv).not.toBe(result2.iv)
    })

    it('should fail to decrypt with wrong passphrase', async () => {
      const { privateKey } = await generateKeyPair()

      const { encryptedPrivateKey, iv } = await encryptPrivateKey(privateKey, 'correct-passphrase')

      await expect(decryptPrivateKey(encryptedPrivateKey, 'wrong-passphrase', iv)).rejects.toThrow()
    })

    it('should fail to decrypt with wrong IV', async () => {
      const { privateKey } = await generateKeyPair()
      const passphrase = 'my-passphrase'

      const { encryptedPrivateKey } = await encryptPrivateKey(privateKey, passphrase)
      const { iv: wrongIv } = await encryptPrivateKey(privateKey, passphrase)

      await expect(decryptPrivateKey(encryptedPrivateKey, passphrase, wrongIv)).rejects.toThrow()
    })
  })

  describe('generateSharedKeys', () => {
    it('should generate an encrypted key for each member', async () => {
      const pair1 = await generateKeyPair()
      const pair2 = await generateKeyPair()

      const sharedKeys = await generateSharedKeys([
        { userId: 'user-1', publicKeyBase64: pair1.publicKey },
        { userId: 'user-2', publicKeyBase64: pair2.publicKey },
      ])

      expect(sharedKeys.length).toBe(2)
      expect(sharedKeys[0].userId).toBe('user-1')
      expect(sharedKeys[1].userId).toBe('user-2')
      expect(sharedKeys[0].encryptedKey).toBeTruthy()
      expect(sharedKeys[1].encryptedKey).toBeTruthy()
    })

    it('should generate different encrypted keys per member', async () => {
      const pair1 = await generateKeyPair()
      const pair2 = await generateKeyPair()

      const sharedKeys = await generateSharedKeys([
        { userId: 'user-1', publicKeyBase64: pair1.publicKey },
        { userId: 'user-2', publicKeyBase64: pair2.publicKey },
      ])

      // same AES key but encrypted with different public keys — results differ
      expect(sharedKeys[0].encryptedKey).not.toBe(sharedKeys[1].encryptedKey)
    })
  })

  describe('encryptMessage / decryptMessage', () => {
    it('should encrypt and decrypt a message correctly', async () => {
      const { publicKey, privateKey } = await generateKeyPair()
      const plaintext = 'Hello Victor!'

      const sharedKeys = await generateSharedKeys([
        { userId: 'user-1', publicKeyBase64: publicKey },
      ])
      const encryptedAESKey = sharedKeys[0].encryptedKey

      const { ciphertext, iv } = await encryptMessage(plaintext, encryptedAESKey, privateKey)
      const decrypted = await decryptMessage(ciphertext, iv, encryptedAESKey, privateKey)

      expect(decrypted).toBe(plaintext)
    })

    it('should produce different ciphertext for the same plaintext', async () => {
      const { publicKey, privateKey } = await generateKeyPair()

      const sharedKeys = await generateSharedKeys([
        { userId: 'user-1', publicKeyBase64: publicKey },
      ])
      const encryptedAESKey = sharedKeys[0].encryptedKey

      const result1 = await encryptMessage('Hello', encryptedAESKey, privateKey)
      const result2 = await encryptMessage('Hello', encryptedAESKey, privateKey)

      expect(result1.ciphertext).not.toBe(result2.ciphertext)
      expect(result1.iv).not.toBe(result2.iv)
    })

    it('should fail to decrypt with wrong private key', async () => {
      const { publicKey, privateKey } = await generateKeyPair()
      const { privateKey: wrongPrivateKey } = await generateKeyPair()

      const sharedKeys = await generateSharedKeys([
        { userId: 'user-1', publicKeyBase64: publicKey },
      ])
      const encryptedAESKey = sharedKeys[0].encryptedKey

      const { ciphertext, iv } = await encryptMessage('Hello', encryptedAESKey, privateKey)

      await expect(
        decryptMessage(ciphertext, iv, encryptedAESKey, wrongPrivateKey),
      ).rejects.toThrow()
    })

    it('should handle empty string messages', async () => {
      const { publicKey, privateKey } = await generateKeyPair()

      const sharedKeys = await generateSharedKeys([
        { userId: 'user-1', publicKeyBase64: publicKey },
      ])
      const encryptedAESKey = sharedKeys[0].encryptedKey

      const { ciphertext, iv } = await encryptMessage('', encryptedAESKey, privateKey)
      const decrypted = await decryptMessage(ciphertext, iv, encryptedAESKey, privateKey)

      expect(decrypted).toBe('')
    })

    it('should handle long messages', async () => {
      const { publicKey, privateKey } = await generateKeyPair()
      const longMessage = 'A'.repeat(10000)

      const sharedKeys = await generateSharedKeys([
        { userId: 'user-1', publicKeyBase64: publicKey },
      ])
      const encryptedAESKey = sharedKeys[0].encryptedKey

      const { ciphertext, iv } = await encryptMessage(longMessage, encryptedAESKey, privateKey)
      const decrypted = await decryptMessage(ciphertext, iv, encryptedAESKey, privateKey)

      expect(decrypted).toBe(longMessage)
    })
  })

  describe('generateRecoveryCodes', () => {
    it('should generate 3 recovery codes by default', () => {
      const codes = generateRecoveryCodes()
      expect(codes.length).toBe(3)
    })

    it('should generate the requested number of codes', () => {
      const codes = generateRecoveryCodes(6)
      expect(codes.length).toBe(6)
    })

    it('should generate codes in xxxx-xxxx format', () => {
      const codes = generateRecoveryCodes()
      codes.forEach((code) => {
        expect(code).toMatch(/^[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}$/)
      })
    })

    it('should generate unique codes', () => {
      const codes = generateRecoveryCodes(10)
      const unique = new Set(codes)
      expect(unique.size).toBe(10)
    })
  })

  describe('full encryption roundtrip', () => {
    it('sender can encrypt and receiver can decrypt the same message', async () => {
      const sender = await generateKeyPair()
      const receiver = await generateKeyPair()

      // chat created — shared AES key encrypted for both users
      const sharedKeys = await generateSharedKeys([
        { userId: 'sender-id', publicKeyBase64: sender.publicKey },
        { userId: 'receiver-id', publicKeyBase64: receiver.publicKey },
      ])

      // sender encrypts the message using their copy of the AES key
      const senderEncryptedKey = sharedKeys.find((k) => k.userId === 'sender-id')!.encryptedKey
      const { ciphertext, iv } = await encryptMessage(
        'Hello Victor!',
        senderEncryptedKey,
        sender.privateKey,
      )

      // receiver decrypts using their own copy of the AES key
      const receiverEncryptedKey = sharedKeys.find((k) => k.userId === 'receiver-id')!.encryptedKey
      const decrypted = await decryptMessage(
        ciphertext,
        iv,
        receiverEncryptedKey,
        receiver.privateKey,
      )

      expect(decrypted).toBe('Hello Victor!')
    })

    it('receiver cannot decrypt if using the wrong encrypted key', async () => {
      const sender = await generateKeyPair()
      const receiver = await generateKeyPair()
      const intruder = await generateKeyPair()

      // shared keys only generated for sender and receiver — not intruder
      const sharedKeys = await generateSharedKeys([
        { userId: 'sender-id', publicKeyBase64: sender.publicKey },
        { userId: 'receiver-id', publicKeyBase64: receiver.publicKey },
      ])

      const senderEncryptedKey = sharedKeys.find((k) => k.userId === 'sender-id')!.encryptedKey
      const { ciphertext, iv } = await encryptMessage(
        'Secret',
        senderEncryptedKey,
        sender.privateKey,
      )

      // intruder tries to decrypt with their own private key but the AES key was never encrypted for them
      await expect(
        decryptMessage(ciphertext, iv, senderEncryptedKey, intruder.privateKey),
      ).rejects.toThrow()
    })
  })
})
