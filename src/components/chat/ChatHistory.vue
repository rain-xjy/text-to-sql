<template>
  <div class="chat-history">
    <div class="history-header">
      <el-button type="primary" @click="startNewChat">
        <el-icon><Plus /></el-icon>
        开始新对话
      </el-button>
    </div>
    <div class="history-list">
      <div
        v-for="(chat, index) in chatHistory"
        :key="index"
        class="history-item"
        @click="loadCommonQuery(chat)"
      >
        <el-icon><ChatDotRound /></el-icon>
        <span class="query-title">{{ chat.descrption }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Plus, ChatDotRound } from '@element-plus/icons-vue'
import { useChatStore } from '@/store/chat'
import { storeToRefs } from 'pinia'

const chatStore = useChatStore()
const { commonQueries } = storeToRefs(chatStore)

// 历史记录数据
const chatHistory = commonQueries

// 开始新对话
const startNewChat = () => {
  chatStore.startNewChat()
}

// 加载常用问题
const loadCommonQuery = (query) => {
  chatStore.loadCommonQuery(query)
}
</script>

<style scoped lang="scss">
.chat-history {
  width: 220px;
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
}

.history-header {
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
}

.history-header .el-button {
  width: 100%;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 4px;
  transition: all 0.3s;
}

.history-item:hover {
  background-color: #f5f7fa;
}

.history-item.active {
  background-color: #ecf5ff;
  color: #409eff;
}

.history-item .el-icon {
  margin-right: 8px;
}
</style>