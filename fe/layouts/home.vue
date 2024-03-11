<template>
    <div class="size-full ">
        <div class="size-full flex items-center justify-center -z-10 bg-gray-300">
            <div class="z-10 size-full xl:p-5">
                <slot />
            </div>
        </div>
        <div class="w-full h-32 bg-teal-600 z-0 fixed top-0" />
    </div>
</template>