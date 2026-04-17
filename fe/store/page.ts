import { defineStore } from 'pinia'

export enum Pages {
  CHATS = 'chats',
  SETTINGS = 'settings',
  PROFILE = 'profile',
}

export type Page = Pages

export const usePageStore = defineStore('page', {
  state: () => ({
    currentPage: Pages.CHATS as Page,
  }),
  actions: {
    setPage(page: Page) {
      this.currentPage = page
    },
    resetPage() {
      this.currentPage = Pages.CHATS
    },
  },
})
