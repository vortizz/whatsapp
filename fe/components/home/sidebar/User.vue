<template>
  <div class="flex flex-row px-3.5 pt-3.5 gap-3.5 hover:bg-gray-100 group cursor-pointer">
    <div>
        <div class="w-12 h-12 border border-black rounded-full" />
    </div>
    <div class="flex-1 flex flex-col justify-center pb-3.5 border-b border-gray-200">
        <div>
            <div class="text-base max-h-6 text-black grow text-ellipsis overflow-hidden">
                {{ name }}
            </div>
            <div class="text-sm grow max-h-5 text-ellipsis overflow-hidden">
                {{ about }}
            </div>
        </div>
    </div> 
  </div>
</template>

<script>
export default {
    props: ['name', 'about'],
}
</script>

<style>

</style>