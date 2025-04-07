<!-- src/views/Layout.vue -->
<!-- 主布局组件，包含侧边栏导航和顶部导航栏的容器组件，所有管理页面都在这个布局内显示。 -->
<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="sidebar">
      <el-menu :default-active="route.path" class="el-menu-vertical" :router="true" background-color="#304156"
        text-color="#bfcbd9" active-text-color="#409EFF">

        <el-sub-menu index="/admin/test">
          <template #title>
            <el-icon>
              <Files />
            </el-icon>
            <span>测试管理</span>
          </template>
          <el-menu-item index="/admin/test-types">
            <el-icon>
              <Document />
            </el-icon>
            <span>测试类型管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/test/category">
            <el-icon>
              <Folder />
            </el-icon>
            <span>分类管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/test-questions">
            <el-icon>
              <List />
            </el-icon>
            <span>测试题目管理</span>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/admin/audit-list">
          <el-icon>
            <Message />
          </el-icon>
          <span>漂流瓶审核</span>
        </el-menu-item>

        <!-- 添加媒体管理下拉菜单 -->
        <el-sub-menu index="/admin/media">
          <template #title>
            <el-icon>
              <Film />
            </el-icon>
            <span>媒体管理</span>
          </template>
          <el-menu-item index="/admin/media/resource">
            <el-icon>
              <VideoCamera />
            </el-icon>
            <span>资源管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/media/category">
            <el-icon>
              <Folder />
            </el-icon>
            <span>分类管理</span>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/admin/test-score-level">
          <el-icon>
            <DataAnalysis />
          </el-icon>
          <span>测试分数解读管理</span>
        </el-menu-item>

      </el-menu>
    </el-aside>

    <el-container class="main-container">
      <el-header class="header">
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

      <el-main class="main-content">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import {
  Document,
  List,
  ArrowDown,
  VideoPlay,
  Message,
  Film,
  VideoCamera,
  Folder,
  DataAnalysis,
  Files,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
  ElMessage.success('退出成功')
}
</script>

<style>
/* 全局样式，确保根元素占满整个视口 */
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  /* 防止页面滚动 */
}
</style>

<style scoped>
/* 确保布局容器占满整个视口，并防止滚动 */
.layout-container {
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  background-color: #304156;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.el-menu-vertical {
  height: 100%;
  border-right: none;
}

/* 主容器样式 */
.main-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  flex: 1;
}

/* 头部样式 */
.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
  height: 60px;
  line-height: 60px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 9;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

/* 主内容区域样式 */
.main-content {
  padding: 20px;
  height: calc(100% - 60px);
  overflow-y: auto;
  background-color: #f0f2f5;
  box-sizing: border-box;
}

/* 下拉菜单样式 */
.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #606266;
}

/* 确保菜单项有足够的点击区域 */
:deep(.el-menu-item) {
  height: 56px;
  line-height: 56px;
}
</style>