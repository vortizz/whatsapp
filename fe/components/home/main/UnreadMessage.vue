<template>
    <div class="flex justify-center items-center bg-[#ffffff40] py-1 border-b-[0.8px] border-b-[#0b141a14] border-t-[0.8px] border-t-[#ffffff26]">
        <div class="rounded-2xl px-6 py-3 bg-white text-gray-600 text-xs font-semibold">
            {{ count }} UNREAD MESSAGES
        </div>
    </div>
</template>
  
<script>
export default {
    props: ['count'],
}
</script>

<style>

</style>