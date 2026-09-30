<script setup lang="ts">
import { VSnackbarQueue } from 'vuetify/components';
import { toastQueue } from '../../composables/useToast';
</script>

<template>
  <!--
    VSnackbarQueue owns the stacking, the timers and the overflow behaviour,
    so two hints fired in the same tick never land on top of each other.
    Tone styling is applied through the per-message `contentClass` and lives
    in style.css, because the overlay is teleported out of this component.
  -->
  <VSnackbarQueue
    v-model="toastQueue"
    class="app-toast"
    location="bottom"
    variant="flat"
    :timeout="1900"
    :gap="8"
    :total-visible="3"
    display-strategy="overflow"
  />
</template>
