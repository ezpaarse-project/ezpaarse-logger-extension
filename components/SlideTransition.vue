<script lang="ts" setup>
  import { Transition } from 'vue';

  import type { BaseTransitionProps } from 'vue';

  const {
    mode = 'out-in',
  } = defineProps<{
    mode?: BaseTransitionProps['mode'];
  }>();
</script>

<template>
  <Transition v-bind="$attrs" name="slide-x" :mode="mode">
    <slot />
  </Transition>
</template>

<style scoped>
  .slide-x-enter-active,
  .slide-x-leave-active {
    transition: all 0.15s ease-out;
  }

  .slide-x-enter-from {
    opacity: 0;
    transform: translateX(-30px);
  }

  .slide-x-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
</style>
