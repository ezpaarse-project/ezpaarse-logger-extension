<template>
  <n-config-provider :theme="darkMode ? darkTheme : lightTheme">
    <n-global-style />

    <n-card
      size="small"
      :title="t('capture.title')"
      :bordered="false"
      :segmented="{ content: true, action: true }"
    >
      <template #header-extra>
        <n-skeleton
          v-if="waitingForState"
          round
          :width="80"
        />

        <n-switch
          v-else
          :value="activated"
          :on-update:value="setActivated"
        >
          <template #checked>
            {{ t('capture.active') }}
          </template>
          <template #unchecked>
            {{ t('capture.inactive') }}
          </template>
        </n-switch>
      </template>

      <n-descriptions label-placement="top" :columns="2">
        <n-descriptions-item :label="t('app.state')">
          <n-skeleton
            v-if="waitingForState"
            size="small"
            :width="100"
          />

          <n-tag v-else :type="tabId ? 'success' : 'error'">
            <span v-if="tabId">{{ t('app.connected') }}</span>
            <span v-else>{{ t('app.disconnected') }}</span>

            <template #icon>
              <n-icon :component="tabId ? LinkFilled : LinkOffFilled" />
            </template>
          </n-tag>
        </n-descriptions-item>

        <n-descriptions-item>
          <template #label>
            <n-flex align="center" size="small">
              {{ t('memorizedRequests.label') }}

              <n-tooltip :style="{ maxWidth: '300px' }">
                <template #trigger>
                  <n-icon :component="HelpFilled" />
                </template>
                {{ t('memorizedRequests.helpText') }}
              </n-tooltip>
            </n-flex>
          </template>

          <n-skeleton
            v-if="waitingForState"
            size="small"
            :width="70"
          />
          <n-tag v-else>
            {{ bufferSize }} / {{ maxBufferSize }}
          </n-tag>
        </n-descriptions-item>
      </n-descriptions>

      <n-divider />

      <n-skeleton
        v-if="waitingForState"
        :repeat="2"
        text
      />
      <SlideTransition v-else>
        <n-p v-if="activated">
          {{ t('capture.enabledDesc') }}
        </n-p>
        <n-p v-else>
          {{ t('capture.disabledDesc') }}
        </n-p>
      </SlideTransition>

      <template #action>
        <n-flex justify="space-between">
          <n-button
            circle
            @click="toggleDarkMode()"
          >
            <template #icon>
              <n-icon :component="darkMode ? LightModeFilled : DarkModeFilled" />
            </template>
          </n-button>

          <n-button
            type="info"
            @click="openApp()"
          >
            <template #icon>
              <n-icon :component="OpenInNewFilled" />
            </template>

            {{ t('app.open') }}
          </n-button>
        </n-flex>
      </template>
    </n-card>
  </n-config-provider>
</template>

<script lang="ts" setup>
  import type {
    Message,
    StateMessage,
    GetStateMessage,
    SetActivatedMessage,
  } from '@/types';

  import { onMounted, shallowRef } from 'vue';
  import { storage } from '#imports';
  import { browser } from 'wxt/browser';
  import { createI18n } from '@wxt-dev/i18n';

  import SlideTransition from '@/components/SlideTransition.vue';

  import {
    HelpFilled,
    LinkFilled,
    LinkOffFilled,
    OpenInNewFilled,
    DarkModeFilled,
    LightModeFilled,
  } from '@vicons/material';

  import {
    darkTheme,
    lightTheme,
    NButton,
    NCard,
    NConfigProvider,
    NDescriptions,
    NDescriptionsItem,
    NDivider,
    NFlex,
    NGlobalStyle,
    NIcon,
    NP,
    NSkeleton,
    NSwitch,
    NTag,
    NTooltip,
  } from 'naive-ui';

  const { t } = createI18n();

  const activated = shallowRef(false);
  const tabId = shallowRef<number | undefined>();
  const bufferSize = shallowRef(0);
  const maxBufferSize = shallowRef(0);
  const waitingForState = shallowRef(true);
  const darkMode = shallowRef(true);

  /**
   * Send a message to the background script in order to activate or deactivate the extension
   * @param activated - Whether the extension should be activated or not
   */
  function setActivated(activated: boolean) {
    browser.runtime.sendMessage({
      action: 'set-activated',
      data: activated,
    } as SetActivatedMessage);
  }

  /**
   * Switch to the connected tab (if any), otherwise open the web app in a new tab
   */
  function openApp() {
    if (tabId.value) {
      browser.tabs.update(tabId.value, { active: true });
    } else {
      browser.tabs.create({ url: 'https://analyses.ezpaarse.org/ezlogger/' });
    }
  }

  /**
   * Toggle dark mode and store it in the local storage
   */
  async function toggleDarkMode() {
    darkMode.value = !darkMode.value;
    await storage.setItem<boolean>('local:dark-mode', darkMode.value);
  }

  /**
   * Check if a message contains the state of the extension
   * @param message - The message
   */
  function isStateMessage(message: Message): message is StateMessage {
    return (message as StateMessage).action === 'state';
  }

  /**
   * Handle messages from the background script
   * @param message - The message
   */
  function onMessage(message: Message) {
    if (!isStateMessage(message)) { return; }

    activated.value = message.data.activated;
    tabId.value = message.data.tabId;
    bufferSize.value = message.data.bufferSize || 0;
    maxBufferSize.value = message.data.maxBufferSize || 0;

    waitingForState.value = false;
  }

  browser.runtime.onMessage.addListener(onMessage);

  onMounted(async () => {
    browser.runtime.sendMessage({ action: 'get-state' } as GetStateMessage);
    darkMode.value = await storage.getItem<boolean>('local:dark-mode', { fallback: true });
  });
</script>

<style scoped>
  .n-divider:not(.n-divider--vertical) {
    margin-top: 20px;
    margin-bottom: 15px;
  }
</style>