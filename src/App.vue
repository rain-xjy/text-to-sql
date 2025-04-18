<template>
  <el-container>
    <el-aside width="200px">
      <div class="logo">IoT Platform</div>
      <el-menu
        router
        :default-active="$route.path"
        class="el-menu-vertical"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF">
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/devices">
          <el-icon><Monitor /></el-icon>
          <span>设备管理</span>
        </el-menu-item>
        <el-menu-item index="/data">
          <el-icon><Document /></el-icon>
          <span>数据分析</span>
        </el-menu-item>
        <el-menu-item index="/chat">
          <el-icon><Comment /></el-icon>
          <span>AI对话</span>
        </el-menu-item>
        <el-menu-item index="/dataset">
          <el-icon><Document /></el-icon>
          <span>数据集管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>物联网监控平台</el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { DataLine, Monitor, Document, Comment } from '@element-plus/icons-vue'
</script>

<style>
.el-container {
  height: 100vh;
}
.el-header {
  background-color: #409EFF;
  color: white;
  line-height: 60px;
  font-size: 20px;
}
.el-aside {
  background-color: #304156;
  transition: width 0.3s;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  background-color: #2b3649;
}
.el-menu {
  border-right: none;
}
.el-menu-item {
  height: 56px;
  line-height: 56px;
  margin: 4px 0;
}
.el-menu-item:hover {
  background-color: #263445 !important;
}
.el-menu-item.is-active {
  background-color: #1890ff !important;
  color: #fff !important;
}
.el-menu-item .el-icon {
  margin-right: 10px;
  font-size: 18px;
}
</style>