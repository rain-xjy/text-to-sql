<template>
  <div class="chat-messages" ref="messageContainer">
    <message-item 
      v-for="(message, index) in currentMessages" 
      :key="index"
      :message="message"
      :index="index"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useChatStore } from '@/store/chat'
import { storeToRefs } from 'pinia'
import MessageItem from './MessageItem.vue'

const chatStore = useChatStore()
const { currentMessages } = storeToRefs(chatStore)

// 消息容器引用
const messageContainer = ref(null)

// 滚动到底部
const scrollToBottom = () => {
  setTimeout(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTo({
        top: messageContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, 100)
}

// 监听消息变化，滚动到底部
watch(currentMessages, () => {
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped lang="scss">
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
}
</style>