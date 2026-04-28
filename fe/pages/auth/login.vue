<template>
  <div
    class="rounded-2xl p-10 max-w-[27rem] w-11/12 flex flex-col justify-center bg-white shadow-lg relative dark:bg-zinc-900"
  >
    <!-- Back button (step 2 only) -->
    <button
      v-if="step === STEPS.PASSPHRASE"
      type="button"
      class="absolute -left-3 -top-3 p-2 rounded-full border-2 border-teal-600 bg-teal-600 text-white font-semibold hover:bg-teal-700 duration-300 flex items-center"
      @click="step = STEPS.CREDENTIALS"
    >
      <Icon name="ep:back" class="text-2xl" />
    </button>

    <!-- Logo -->
    <div class="flex flex-row gap-1 justify-center items-center">
      <Icon name="ic:baseline-whatsapp" class="text-teal-600 text-[3rem]" />
      <h1 class="text-2xl uppercase dark:text-zinc-300">
        Whats#<span class="text-teal-600">App</span>
      </h1>
    </div>

    <!-- Heading -->
    <Transition name="fade" mode="out-in">
      <div :key="step" class="mt-5 text-center">
        <h2 class="text-xl font-semibold dark:text-zinc-200">{{ heading.title }}</h2>
        <p v-if="heading.subtitle" class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {{ heading.subtitle }}
        </p>
      </div>
    </Transition>

    <!-- Steps -->
    <Transition name="fade" mode="out-in">
      <AuthLoginStepCredentials v-if="step === STEPS.CREDENTIALS" key="credentials" @next="logIn" />
      <AuthLoginStepPassphrase v-else key="passphrase" @confirm="onConfirm" />
    </Transition>
  </div>
</template>

<script setup>
  import { useUserStore } from '../../store/user'

  definePageMeta({
    layout: 'auth',
    middleware: 'auth',
  })

  const userStore = useUserStore()
  const { _id: userId } = storeToRefs(userStore)
  const { connectWs } = useWs()
  const { decryptPrivateKey } = useCrypto()
  const { saveKey, deleteDB } = useIndexedDB()

  const STEPS = {
    CREDENTIALS: 1,
    PASSPHRASE: 2,
  }

  const step = ref(STEPS.CREDENTIALS)
  const isLoading = ref(false)
  const loggedInUser = ref(null)

  const heading = computed(() =>
    step.value === STEPS.CREDENTIALS
      ? { title: 'Welcome back', subtitle: null }
      : {
          title: 'One more step',
          subtitle: 'Enter your passphrase or one of your recovery codes to decrypt your messages.',
        },
  )

  watch(
    step,
    () => {
      if (step.value === STEPS.CREDENTIALS) {
        // Clear logged in user data when going back to credentials step
        if (userId.value) deleteDB(userId.value)
        userStore.logout()
      }
    },
    { immediate: true },
  )

  async function onConfirm({ passphrase: input }) {
    try {
      isLoading.value = true

      const privateKey = await decryptWithAny(input)

      if (!privateKey) {
        useNuxtApp().$toast.error('Incorrect passphrase or recovery code.')
        return
      }

      userStore.setUser({
        _id: loggedInUser.value._id,
        name: loggedInUser.value.name,
        email: loggedInUser.value.email,
        about: loggedInUser.value.about,
        blockedUsers: loggedInUser.value.blockedUsers || [],
        publicKey: loggedInUser.value.publicKey,
      })

      connectWs()

      await saveKey(loggedInUser.value._id, 'privateKey', privateKey)

      await useRouter().push('/')
    } catch {
      useNuxtApp().$toast.error('An error occurred while decrypting your data.')
    } finally {
      isLoading.value = false
    }
  }

  async function decryptWithAny(input) {
    // try with passphrase first
    let privateKey = await decryptWith(
      loggedInUser.value.encryptedPrivateKey,
      loggedInUser.value.iv,
      input,
    )

    if (privateKey) {
      return privateKey
    }

    // if it fails, try with recovery codes
    for (const code of loggedInUser.value.recoveryCodes) {
      privateKey = await decryptWith(code.encryptedPrivateKey, code.iv, input)
      if (privateKey) {
        return privateKey
      }
    }

    return false
  }

  async function decryptWith(encryptedPrivateKey, iv, input) {
    try {
      const privateKey = await decryptPrivateKey(encryptedPrivateKey, input, iv)
      return privateKey
    } catch {
      return false
    }
  }

  async function logIn({ email, password }) {
    try {
      isLoading.value = true

      const data = await useMyAuthFetch('auth/login', {
        method: 'POST',
        body: { email, password },
      })

      if (!data._id) {
        throw new Error('Error')
      }

      loggedInUser.value = data

      step.value = STEPS.PASSPHRASE
    } catch (error) {
      const data = error?.data || {}
      const message = Array.isArray(data.message) ? data.message[0] : data.message

      useNuxtApp().$toast.error(message)
    } finally {
      isLoading.value = false
    }
  }
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.25s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
