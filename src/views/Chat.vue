<template>
  <div class="chat-container">
    <!-- 左侧历史记录 -->
    <chat-history />

    <!-- 右侧对话区域 -->
    <div class="chat-main">
      <message-list />
      <input-area />
    </div>
  </div>
  
  <!-- 对话框组件 -->
  <dialog-forms />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import ChatHistory from '@/components/chat/ChatHistory.vue'
import MessageList from '@/components/chat/MessageList.vue'
import InputArea from '@/components/chat/InputArea.vue'
import DialogForms from '@/components/chat/DialogForms.vue'

// 组件卸载时清理
onUnmounted(() => {
  // 清理可能的资源
})
</script>

<style scoped lang="scss">
.chat-container {
  display: flex;
  height: 100%;
  background-color: #f5f7fa;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}
</style>