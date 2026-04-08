<template>
  <div class="flex justify-center my-1">
    <span class="bg-white dark:bg-neutral-700 text-black/60 dark:text-neutral-300 text-xs px-3 py-1.5 rounded-lg text-center shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]">
      {{ label }}
    </span>
  </div>
</template>

<script setup>
import { useUserStore } from '../../../store/user'
import { storeToRefs } from 'pinia'

const props = defineProps({
  doneBy: { type: Object, required: true },
  isNameChanged: Boolean,
  isDescriptionChanged: Boolean,
  isUserAdded: Boolean,
  isUserRemoved: Boolean,
  userAdded: Object,
  userRemoved: Object,
  newName: String,
})

const { _id: userId } = storeToRefs(useUserStore())

const doneByName = computed(() =>
  props.doneBy._id === userId.value ? 'You' : props.doneBy.name
)

const label = computed(() => {
  if (props.isNameChanged) {
    return `${doneByName.value} changed the group name to "${props.newName}"`
  }
  if (props.isDescriptionChanged) {
    return `${doneByName.value} changed the group description`
  }
  if (props.isUserAdded) {
    const addedName = props.userAdded?._id === userId.value ? 'you' : props.userAdded?.name
    return `${doneByName.value} added ${addedName}`
  }
  if (props.isUserRemoved) {
    if (props.doneBy._id === props.userRemoved?._id) {
      return `${doneByName.value} left`
    }
    return `${doneByName.value} removed ${props.userRemoved?.name}`
  }
  return ''
})
</script>
