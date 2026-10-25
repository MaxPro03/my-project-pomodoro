<template>
  <PomodoroScreen>
    <template #header>
      <AccountButton />
    </template>
  </PomodoroScreen>
</template>

<script setup>
import { AccountButton } from '@/modules/Auth'
import { PomodoroScreen } from '@/modules/Pomodoro'
</script>
