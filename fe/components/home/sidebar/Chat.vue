<template>
  <div class="flex flex-row px-3.5 pt-3.5 gap-3.5 hover:bg-gray-100 group cursor-pointer" :class="active ? 'bg-gray-100' : ''">
    <div>
        <div class="w-12 h-12 border border-black rounded-full" />
    </div>
    <div class="flex-1 flex flex-col justify-center pb-3.5 border-b border-gray-200">
        <div>
            <div class="flex items-center">
                <div class="text-base max-h-6 text-black grow text-ellipsis overflow-hidden">
                    {{ name }}
                </div>
                <div class="text-xs flex-none ">
                    01/03/2024
                </div>
            </div>
            <div class="flex place-items-center">
                <div class="text-sm grow max-h-5 text-ellipsis overflow-hidden">
                    Let me know Let me know Let me know Let me know Let me know
                </div>
                <div class="flex-none">
                    <div class="flex flex-row items-center gap-0.5">
                        <div class="h-5 w-5 rounded-full bg-green-500 text-white text-xs font-semibold flex items-center justify-center">
                            <div class="mt-[-2px]">15</div>
                        </div>
                        <button class="text-2xl leading-5 h-5 text-gray-400 transition ease-in-out duration-300 hidden group-hover:block">
                            <Icon name="icon-park-outline:down" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div> 
  </div>
</template>

<script>
export default {
    props: ['name', 'active']
}
</script>

<style>

</style>