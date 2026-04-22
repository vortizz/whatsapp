<template>
  <div class="h-full flex flex-row text-gray-600">
    <template v-if="currentPage === Pages.PROFILE">
      <HomeProfile />
      <main
        class="flex-2 bg-stone-100 dark:bg-neutral-900 flex flex-col items-center gap-6 justify-center"
      >
        <div class="text-7xl dark:text-white/20 text-black/20">
          <Icon name="mdi:user-circle" />
        </div>
        <div class="dark:text-white text-neutral-950 text-3xl">Profile</div>
      </main>
    </template>
    <template v-else-if="currentPage === Pages.CHATS">
      <HomeNewChat v-if="isDisplayingNewChat" @close="isDisplayingNewChat = false" />
      <HomeNewGroup v-else-if="isDisplayingNewGroup" @close="isDisplayingNewGroup = false" />
      <HomeSidebar
        v-else
        @opennewchat="isDisplayingNewChat = true"
        @opennewgroup="isDisplayingNewGroup = true"
        @show-contact-info="isDisplayingContactInfo = true"
      />

      <!--****************-->
      <main v-show="!chatId" class="flex-2 bg-white dark:bg-neutral-900 flex flex-col" />
      <HomeMain
        v-show="chatId"
        ref="homeMainRef"
        @show-contact-info="isDisplayingContactInfo = true"
        @show-search-messages="showSearchMessages"
        @view-member="viewGroupMember"
        @show-message-info="showMessageInfo"
      />
      <!--****************-->
      <HomeGroupInfo
        v-if="isDisplayingContactInfo && isChatGroup && !viewingGroupMember"
        @close="isDisplayingContactInfo = false"
        @view-member="viewGroupMember"
        @search="showSearchMessages"
      />
      <HomeContactInfo
        v-else-if="isDisplayingContactInfo || viewingGroupMember"
        :member="viewingGroupMember"
        @close="handleContactInfoClose"
        @go-to-message="goToMessage"
        @go-to-chat="goToChat"
      />
      <HomeMainMessageInfo
        v-if="messageInfoMsg"
        :message="messageInfoMsg"
        @close="messageInfoMsg = null"
      />
      <HomeSearchMessages
        v-if="isDisplayingSearchMessages"
        @close="isDisplayingSearchMessages = false"
        @go-to-message="goToMessage"
      />
      <HomeClearChatModal />
      <HomeBlockUserModal />
      <HomeUnblockUserModal />
      <HomeDeleteChatModal />
      <HomeDeleteMessageModal />
      <HomeAddMemberModal />
      <HomeMakeGroupAdminModal />
      <HomeRemoveMemberModal />
      <HomeExitGroupModal />
      <HomeGroupInfoSearchMembersModal />
    </template>
  </div>
</template>

<script setup>
  import { storeToRefs } from 'pinia'
  import { useChatStore } from '../store/chat'
  import { useUserStore } from '../store/user'
  import { Pages, usePageStore } from '~/store/page'

  definePageMeta({
    layout: 'home',
    middleware: 'auth',
  })

  const isDisplayingContactInfo = ref(false)
  const isDisplayingNewChat = ref(false)
  const isDisplayingNewGroup = ref(false)
  const isDisplayingSearchMessages = ref(false)
  const homeMainRef = ref(null)
  const viewingGroupMember = ref(null)
  const messageInfoMsg = ref(null)

  function viewGroupMember(member) {
    viewingGroupMember.value = member
  }

  function showMessageInfo(msg) {
    messageInfoMsg.value = msg
  }

  function handleContactInfoClose() {
    if (viewingGroupMember.value) {
      viewingGroupMember.value = null
    } else {
      isDisplayingContactInfo.value = false
    }
  }

  function goToMessage(id, overrideChatId) {
    isDisplayingSearchMessages.value = false
    if (overrideChatId && overrideChatId !== chatId.value) {
      homeMainRef.value?.scheduleScrollToMessage(id)
      chatStore.setChat({
        _id: overrideChatId,
        users: [
          {
            _id: userId.value,
            name: userName.value,
            about: userAbout.value,
            email: userEmail.value,
            blockedUsers: userBlockedUsers.value,
            publicKey: userPublicKey.value,
          },
          viewingGroupMember.value,
        ],
      })
      isDisplayingContactInfo.value = false
      viewingGroupMember.value = null
    } else {
      homeMainRef.value?.scrollToMessage(id)
    }
  }

  async function goToChat(id) {
    if (id) {
      chatStore.setChat({
        _id: id,
        users: [
          {
            _id: userId.value,
            name: userName.value,
            about: userAbout.value,
            email: userEmail.value,
            blockedUsers: userBlockedUsers.value,
            publicKey: userPublicKey.value,
          },
          viewingGroupMember.value,
        ],
      })
      isDisplayingContactInfo.value = false
      viewingGroupMember.value = null
    } else if (viewingGroupMember.value) {
      try {
        const member = viewingGroupMember.value
        const chat = await useMyAuthFetch('chat', { method: 'POST', body: { user_id: member._id } })
        chatStore.setChat({
          _id: chat._id,
          users: [
            {
              _id: userId.value,
              name: userName.value,
              about: userAbout.value,
              email: userEmail.value,
              blockedUsers: userBlockedUsers.value,
              publicKey: userPublicKey.value,
            },
            member,
          ],
          encryptedKeys: chat.encryptedKeys,
        })
        isDisplayingContactInfo.value = false
        viewingGroupMember.value = null
      } catch (error) {
        const data = error?.data || {}
        const message = Array.isArray(data.message) ? data.message[0] : data.message
        useNuxtApp().$toast.error(message)
      }
    }
  }

  function showSearchMessages() {
    isDisplayingSearchMessages.value = true
    isDisplayingContactInfo.value = false
    viewingGroupMember.value = null
  }

  const chatStore = useChatStore()
  const pageStore = usePageStore()
  const userStore = useUserStore()

  const { _id: chatId, isGroup: isChatGroup } = storeToRefs(chatStore)
  const {
    _id: userId,
    name: userName,
    about: userAbout,
    email: userEmail,
    blockedUsers: userBlockedUsers,
    publicKey: userPublicKey,
  } = storeToRefs(userStore)
  const { conn, connectWs, disconnectWs } = useWs()
  const { currentPage } = storeToRefs(pageStore)

  const { clearChat } = chatStore

  const { pendingViewMember, pendingMessageMember } = useSearchMembersModal()

  watch(pendingViewMember, (val) => {
    if (!val) return
    isDisplayingContactInfo.value = true
    viewingGroupMember.value = val
  })

  watch(pendingMessageMember, async (val) => {
    if (!val) return
    const chats = await useMyAuthFetch('chat')
    const direct = chats.find((c) => !c.isGroup && c.users.some((u) => (u._id ?? u) === val._id))
    if (direct) {
      const otherUser = direct.users.find((u) => (u._id ?? u) !== userId.value)
      chatStore.setChat({
        _id: direct._id,
        users: [
          {
            _id: userId.value,
            name: userName.value,
            about: userAbout.value,
            email: userEmail.value,
            blockedUsers: userBlockedUsers.value,
            publicKey: userPublicKey.value,
          },
          otherUser,
        ],
        encryptedKeys: direct.encryptedKeys,
      })
    } else {
      const chat = await useMyAuthFetch('chat', { method: 'POST', body: { user_id: val._id } })
      chatStore.setChat({
        _id: chat._id,
        users: [
          {
            _id: userId.value,
            name: userName.value,
            about: userAbout.value,
            email: userEmail.value,
            blockedUsers: userBlockedUsers.value,
            publicKey: userPublicKey.value,
          },
          val,
        ],
        encryptedKeys: chat.encryptedKeys,
      })
    }
    isDisplayingContactInfo.value = false
    viewingGroupMember.value = null
  })

  onMounted(() => {
    clearChat()

    if (conn.value?.readyState !== WebSocket.OPEN) {
      const token = useCookie('token').value
      connectWs({ token })
    }
  })

  onBeforeUnmount(() => {
    disconnectWs()
  })

  watch(chatId, () => {
    isDisplayingContactInfo.value = false
    isDisplayingSearchMessages.value = false
    viewingGroupMember.value = null
    messageInfoMsg.value = null
  })
</script>

<style></style>
