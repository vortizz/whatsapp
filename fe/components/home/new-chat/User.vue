<template>
  <div class="flex flex-row mx-2.5 px-3.5 pt-3.5 gap-3.5 hover:bg-stone-400/15 rounded-xl group cursor-pointer">
    <div>
        <img src="~/assets/img/default_profile.png" width="48" height="48" />
    </div>
    <div class="flex-1 flex flex-col justify-center pb-3.5 ">
        <div>
            <div class="text-base max-h-6 text-neutral-950 grow text-ellipsis overflow-hidden dark:text-white">
                {{ name }}
            </div>
            <div class="text-sm text-black/60 dark:text-white/60 grow max-h-5 text-ellipsis overflow-hidden">
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