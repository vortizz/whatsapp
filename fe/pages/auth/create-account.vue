<template>
  <div
    class="rounded-2xl p-10 max-w-[27rem] w-11/12 flex flex-col justify-center bg-white shadow-lg relative dark:bg-zinc-900"
  >
    <!-- Back button -->
    <button
      type="button"
      class="absolute -left-3 -top-3 p-2 rounded-full border-2 border-teal-600 bg-teal-600 text-white font-semibold hover:bg-teal-700 duration-300 flex items-center"
      @click="prevStep"
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

    <!-- Step indicator -->
    <div class="flex items-center justify-center gap-2 mt-5">
      <template v-for="n in Object.values(STEPS)" :key="n">
        <div
          class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors duration-300"
          :class="
            step === n
              ? 'bg-teal-600 text-white'
              : step > n
                ? 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300'
                : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'
          "
        >
          <svg
            v-if="step > n"
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span v-else>{{ n }}</span>
        </div>
        <div
          v-if="n < Object.values(STEPS).length"
          class="flex-1 h-0.5 max-w-[3rem] transition-colors duration-300"
          :class="step > n ? 'bg-teal-600' : 'bg-zinc-200 dark:bg-zinc-700'"
        />
      </template>
    </div>

    <!-- Steps -->
    <AuthStepRegister v-show="step === STEPS.REGISTER" @next="nextStep" />
    <AuthStepPassphrase v-show="step === STEPS.PASSPHRASE" @next="nextStep" />
    <AuthStepRecoveryCodes
      v-show="step === STEPS.RECOVERY_CODES"
      :is-loading="isLoading"
      @finish="finish"
    />
  </div>
</template>

<script setup>
  definePageMeta({
    layout: 'auth',
    middleware: 'auth',
  })

  const router = useRouter()
  const { generateKeyPair, encryptPrivateKey } = useCrypto()

  const STEPS = {
    REGISTER: 1,
    PASSPHRASE: 2,
    RECOVERY_CODES: 3,
  }

  const step = ref(STEPS.REGISTER)
  const user = ref(null)
  const passphrase = ref('')
  const isLoading = ref(false)

  function prevStep() {
    if (step.value > STEPS.REGISTER) {
      step.value--
    } else {
      router.push('/auth/login')
    }
  }

  function nextStep({ passphrase: pass, ...data }) {
    if (step.value === STEPS.REGISTER) {
      user.value = { ...user.value, ...data }
    }
    if (pass) {
      passphrase.value = pass
    }
    step.value++
  }

  async function finish({ codes }) {
    try {
      isLoading.value = true

      // Generate key pair
      const { publicKey, privateKey } = await generateKeyPair()

      // Encrypt private key with passphrase
      const passphrasePrivateKey = await encryptPrivateKey(privateKey, passphrase.value)

      // Encrypt private key with recovery codes
      const encryptedWithCodes = await Promise.all(
        codes.map((code) => encryptPrivateKey(privateKey, code)),
      )

      // Send registration data to server
      const body = {
        ...user.value,
        publicKey,
        encryptedPrivateKey: passphrasePrivateKey.encryptedPrivateKey,
        iv: passphrasePrivateKey.iv,
        recoveryCodes: encryptedWithCodes,
      }
      await useMyFetch('user', { method: 'POST', body })

      // Show success message and redirect to login
      useNuxtApp().$toast.success('Account created successfully!')
      router.push('/auth/login')
    } catch (error) {
      const data = error?.data || {}
      const message = Array.isArray(data.message) ? data.message[0] : data.message
      useNuxtApp().$toast.error(message)
    } finally {
      isLoading.value = false
    }
  }
</script>

<style></style>
