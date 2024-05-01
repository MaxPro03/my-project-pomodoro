<template>
  <div class="pointer-events-none mx-auto mt-12 h-40 w-40 select-none rounded-full bg-orange-500 md:h-52 md:w-52">
    <span class="flex h-full items-center justify-center text-lg text-white">
      {{ Math.floor(selected.time / 60) }}:{{
        selected.time % 60 < 10 ? '0' + (selected.time % 60) : selected.time % 60
      }}
    </span>
  </div>
  <div class="pointer-events-none mt-12 mr-6 flex select-none justify-center">
    <span v-for="(orange, index) in timerStore.oranges" :key="index">
      <span v-if="index % 4 === 0">&nbsp;</span>
      <!-- <span class="grayscale">
        🍊
      </span> -->
      {{ orange }}
    </span>
  </div>
  <Listbox
    as="div"
    v-model="selected"
    class="mx-auto mt-12 w-full md:w-52"
    v-if="!timerStore.timerStart && !timerStore.timerReset">
    <ListboxLabel class="pointer-events-none block select-none text-center text-sm font-medium text-gray-700"
      >Choose time</ListboxLabel
    >
    <div class="relative mt-1">
      <ListboxButton
        class="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:text-sm">
        <span class="flex items-center">
          <span class="h-6 w-6 flex-shrink-0 rounded-full">{{ selected.icon }}</span>
          <span class="ml-3 block truncate">{{ selected.title }}</span>
          <span class="ml-3 block truncate text-xs text-gray-500">{{ selected.description }}</span>
        </span>
        <span class="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <ListboxOptions
          class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          <ListboxOption
            as="template"
            v-for="person in timerStore.times"
            :key="person.id"
            :value="person"
            v-slot="{ active, selected }">
            <li
              :class="[
                active ? 'bg-orange-600 text-white' : 'text-gray-900',
                'relative cursor-default select-none py-2 pl-3 pr-9',
              ]">
              <div class="flex items-center">
                <span class="h-6 w-6 flex-shrink-0 rounded-full">{{ person.icon }}</span>
                <span :class="[selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate']">{{
                  person.title
                }}</span>
                <span
                  :class="[selected ? 'font-semibold' : 'font-light', 'ml-3 block truncate text-xs text-gray-500']"
                  >{{ person.description }}</span
                >
              </div>

              <span
                v-if="selected"
                :class="[
                  active ? 'text-white' : 'text-orange-600',
                  'absolute inset-y-0 right-0 flex items-center pr-4',
                ]">
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
  <StartButton :timerData="selected" />
</template>
<script setup>
import StartButton from './StartButton.vue'
import { useTimerStore } from '../stores/timerStore'
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'

const timerStore = useTimerStore()

const selected = ref(timerStore.times[0])

const renderer = ref(null)
const box = ref(null)

watchEffect(() => {
  if (timerStore.oranges.length > 0) {
    if (timerStore.oranges.length % 4 == 0) {
      selected.value = timerStore.times[2]
    } else if (timerStore.times[0].time === 0) {
      selected.value = timerStore.times[1]
    } else {
      selected.value = timerStore.times[0]
    }
  }
})

function onReady(e) {
  console.log('Model is ready')
}

onMounted(() => {
  renderer?.value?.onBeforeRender(() => {
    box.value.mesh.rotation.x += 0.01
  })
})
</script>
