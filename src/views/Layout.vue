<!-- src/views/Layout.vue -->
<template>
    <el-container class="layout-container">
      <el-aside width="200px">
        <el-menu
          :default-active="route.path"
          class="el-menu-vertical"
          :router="true"
        >
          <el-menu-item index="/admin/test-questions">
            <el-icon><Document /></el-icon>
            <span>测试题目管理</span>
          </el-menu-item>
          <!-- 其他菜单项 -->
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header>
          <div class="header-content">
            <h2>心理测试管理系统</h2>
            <el-dropdown>
              <span class="el-dropdown-link">
                管理员
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </template>
  
  <script setup>
  import { useRoute, useRouter } from 'vue-router'
  import { Document, ArrowDown } from '@element-plus/icons-vue'
  
  const route = useRoute()
  const router = useRouter()
  
  const handleLogout = () => {
    // 实现登出逻辑，清除token
    localStorage.removeItem('token');
    router.push('/login')
  }
  </script>
  
  <style scoped>
  .layout-container {
    height: 100vh;
  }
  
  .el-aside {
    background-color: #304156;
    color: #fff;
  }
  
  .el-menu-vertical {
    border-right: none;
  }
  
  .el-header {
    background-color: #fff;
    border-bottom: 1px solid #dcdfe6;
    padding: 0 20px;
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
  }
  
  .el-main {
    background-color: #f0f2f5;
    padding: 20px;
  }
  </style>