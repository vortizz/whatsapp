function toBase64(buffer: ArrayBuffer | Uint8Array<ArrayBufferLike>) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

function fromBase64(base64: string) {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
}

function encode(str: string) {
  return new TextEncoder().encode(str)
}

function decode(buffer: ArrayBuffer) {
  return new TextDecoder().decode(buffer)
}

export function useCrypto() {
  // Generates an RSA key pair and returns the public and private keys as base64 strings.
  async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt'],
    )

    const publicKey = await exportKey('spki', keyPair.publicKey)
    const privateKey = await exportKey('pkcs8', keyPair.privateKey)

    return { publicKey, privateKey }
  }

  // Generates a shared AES-GCM key and encrypts it for each member using their public keys.
  async function generateSharedKeys(
    memberPublicKeys: { userId: string; publicKeyBase64: string }[],
  ) {
    const sharedKey = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    )

    // const rawAESKey = await exportKey('raw', sharedKeys)
    const rawAESKey = await window.crypto.subtle.exportKey('raw', sharedKey)

    return Promise.all(
      memberPublicKeys.map(async (publicKeyData) => {
        return {
          userId: publicKeyData.userId,
          encryptedKey: await encryptWithPublicKey(rawAESKey, publicKeyData.publicKeyBase64),
        }
      }),
    )
  }

  // Encrypts data using the recipient's public key with RSA-OAEP.
  async function encryptWithPublicKey(data: string | ArrayBuffer, publicKeyBase64: string) {
    const publicKey = await window.crypto.subtle.importKey(
      'spki',
      fromBase64(publicKeyBase64),
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt'],
    )

    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      data instanceof ArrayBuffer ? data : encode(data),
    )
    return toBase64(encrypted)
  }

  // Encrypts the private key using AES-GCM with a key derived from the passphrase.
  async function encryptPrivateKey(privateKey: string, passphrase: string) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12))

    const aesKey = await deriveAESKey(passphrase, iv)

    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      encode(privateKey),
    )

    return {
      encryptedPrivateKey: toBase64(encrypted),
      iv: toBase64(iv),
    }
  }

  // Decrypts the private key using AES-GCM with a key derived from the passphrase and IV.
  async function decryptPrivateKey(encryptedPrivateKey: string, passphrase: string, iv: string) {
    const ivBuffer = fromBase64(iv)
    const aesKey = await deriveAESKey(passphrase, ivBuffer)

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuffer },
      aesKey,
      fromBase64(encryptedPrivateKey),
    )

    return decode(decrypted)
  }

  // Derives an AES-GCM key from the passphrase and IV using PBKDF2.
  async function deriveAESKey(passphrase: string, iv: Uint8Array<ArrayBuffer>) {
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      encode(passphrase),
      'PBKDF2',
      false,
      ['deriveKey'],
    )

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: iv, // reuse IV as salt
        iterations: 310000, // OWASP recommended
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    )
  }

  // Decrypts data using the recipient's private key with RSA-OAEP.
  async function decryptWithPrivateKey(encryptedData: string, privateKeyBase64: string) {
    const privateKey = await window.crypto.subtle.importKey(
      'pkcs8',
      fromBase64(privateKeyBase64),
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['decrypt'],
    )

    return await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      fromBase64(encryptedData),
    )
  }

  // Encrypts a plaintext message using AES-GCM with a shared key encrypted for the recipient.
  async function encryptMessage(
    plaintext: string,
    encryptedAESKey: string,
    privateKeyBase64: string,
  ) {
    const rawAESKey = await decryptWithPrivateKey(encryptedAESKey, privateKeyBase64)

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      rawAESKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt'],
    )

    const iv = window.crypto.getRandomValues(new Uint8Array(12))

    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encode(plaintext),
    )

    return {
      ciphertext: toBase64(ciphertext),
      iv: toBase64(iv),
    }
  }

  // Decrypts a ciphertext message using AES-GCM with a shared key encrypted for the recipient.
  async function decryptMessage(
    ciphertext: string,
    iv: string,
    encryptedAESKey: string,
    privateKeyBase64: string,
  ) {
    const rawAESKey = await decryptWithPrivateKey(encryptedAESKey, privateKeyBase64)

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      rawAESKey,
      { name: 'AES-GCM' },
      false,
      ['decrypt'],
    )

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(iv) },
      cryptoKey,
      fromBase64(ciphertext),
    )

    return decode(decrypted)
  }

  // Exports a CryptoKey to a base64 string in the specified format.
  async function exportKey(format: 'spki' | 'pkcs8' | 'raw', key: CryptoKey) {
    const exported = await window.crypto.subtle.exportKey(format, key)
    return toBase64(exported)
  }

  function generateRecoveryCodes(count: number = 3) {
    return Array.from({ length: count }, () => {
      const bytes = window.crypto.getRandomValues(new Uint8Array(8))
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      return hex.match(/.{4}/g)?.join('-')
    })
  }

  return {
    generateKeyPair,
    encryptPrivateKey,
    decryptPrivateKey,
    generateRecoveryCodes,
    encryptMessage,
    decryptMessage,
    generateSharedKeys,
  }
}
