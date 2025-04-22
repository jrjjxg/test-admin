<template>
  <div class="dashboard-container">
    <h1 class="dashboard-title">心理健康系统数据看板</h1>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="8" v-for="(item, index) in statCards" :key="index">
        <el-card shadow="hover" class="stat-card" :class="item.color">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ item.value || 0 }}</div>
              <div class="stat-label">{{ item.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-container">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>数据趋势 (最近7天)</span>
              <el-select v-model="trendDays" @change="fetchTrendData" size="small">
                <el-option v-for="day in [7, 14, 30]" :key="day" :label="`最近${day}天`" :value="day" />
              </el-select>
            </div>
          </template>
          <div id="trendChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行图表 -->
    <el-row :gutter="20" class="chart-container">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div>测试类型分布</div>
          </template>
          <div id="testTypeChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div>媒体资源分布</div>
          </template>
          <div id="mediaResourceChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { getDashboardStats, getDashboardTrends } from '@/api/dashboard'
import * as echarts from 'echarts'
import {
  User, Collection, Picture, Document, VideoPlay, Bell
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

// 定义响应式数据
const statCards = reactive([
  { label: '注册用户', value: 0, icon: User, color: 'blue' },
  { label: '测试分类', value: 0, icon: Collection, color: 'green' },
  { label: '测试类型', value: 0, icon: Document, color: 'yellow' },
  { label: '测试题目', value: 0, icon: Document, color: 'orange' },
  { label: '媒体分类', value: 0, icon: Picture, color: 'purple' },
  { label: '媒体资源', value: 0, icon: VideoPlay, color: 'red' },
  { label: '待审核', value: 0, icon: Bell, color: 'cyan' },
])

// 图表实例
let trendChart = null
let testTypeChart = null
let mediaResourceChart = null

// 趋势数据天数
const trendDays = ref(7)

// 获取统计数据
const fetchStatData = async () => {
  try {
    const { data } = await getDashboardStats()
    if (data.code === 200 && data.data) {
      updateStatCards(data.data)
    } else {
      ElMessage.error('获取统计数据失败')
    }
  } catch (error) {
    console.error('获取统计数据出错:', error)
    ElMessage.error('获取统计数据出错')
  }
}

// 更新统计卡片数据
const updateStatCards = (data) => {
  statCards[0].value = data.userCount || 0
  statCards[1].value = data.testCategoryCount || 0
  statCards[2].value = data.testTypeCount || 0
  statCards[3].value = data.testQuestionCount || 0
  statCards[4].value = data.mediaCategoryCount || 0
  statCards[5].value = data.mediaResourceCount || 0
  statCards[6].value = data.pendingAuditCount || 0
}

// 获取趋势数据
const fetchTrendData = async () => {
  try {
    const { data } = await getDashboardTrends(trendDays.value)
    if (data.code === 200 && data.data) {
      renderTrendChart(data.data)
    } else {
      ElMessage.error('获取趋势数据失败')
    }
  } catch (error) {
    console.error('获取趋势数据出错:', error)
    ElMessage.error('获取趋势数据出错')
  }
}

// 渲染趋势图表
const renderTrendChart = (data) => {
  if (!trendChart) {
    trendChart = echarts.init(document.getElementById('trendChart'))
  }

  const userTrend = data.newUserTrend || { dates: [], counts: [] }
  const mediaTrend = data.newMediaTrend || { dates: [], counts: [] }
  const testTrend = data.newTestTrend || { dates: [], counts: [] }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['新增用户', '新增媒体', '测试记录']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: userTrend.dates,
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '新增用户',
        type: 'line',
        stack: 'Total',
        emphasis: {
          focus: 'series'
        },
        data: userTrend.counts,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '新增媒体',
        type: 'line',
        stack: 'Total',
        emphasis: {
          focus: 'series'
        },
        data: mediaTrend.counts,
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '测试记录',
        type: 'line',
        stack: 'Total',
        emphasis: {
          focus: 'series'
        },
        data: testTrend.counts,
        itemStyle: {
          color: '#E6A23C'
        }
      }
    ]
  }

  trendChart.setOption(option)
}

// 渲染测试类型图表（示例数据）
const renderTestTypeChart = () => {
  nextTick(() => {
    const chartDom = document.getElementById('testTypeChart');
    if (!chartDom) return;

    // 检查是否已有实例，有则销毁
    if (testTypeChart) {
      testTypeChart.dispose();
    }

    // 创建新实例
    testTypeChart = echarts.init(chartDom);

    // 图表配置
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        data: ['情绪测试', '压力测试', '人格测试', '能力测试', '其他']
      },
      series: [
        {
          name: '测试类型',
          type: 'pie',
          radius: ['40%', '70%'],
          // 其他配置...
          data: [
            { value: 335, name: '情绪测试' },
            { value: 310, name: '压力测试' },
            { value: 234, name: '人格测试' },
            { value: 135, name: '能力测试' },
            { value: 148, name: '其他' }
          ]
        }
      ]
    };

    testTypeChart.setOption(option);
  });
};

// 渲染媒体资源图表（示例数据）
const renderMediaResourceChart = () => {
  if (!mediaResourceChart) {
    mediaResourceChart = echarts.init(document.getElementById('mediaResourceChart'))
  }

  // 模拟数据
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: ['视频', '音频', '冥想', '课程', '其他']
    },
    series: [
      {
        name: '媒体类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1048, name: '视频' },
          { value: 735, name: '音频' },
          { value: 580, name: '冥想' },
          { value: 484, name: '课程' },
          { value: 300, name: '其他' }
        ]
      }
    ]
  }

  mediaResourceChart.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  if (trendChart) trendChart.resize()
  if (testTypeChart) testTypeChart.resize()
  if (mediaResourceChart) mediaResourceChart.resize()
}

// 只保留这一个钩子处理所有图表
onMounted(async () => {
  // 获取数据
  await fetchStatData();
  await fetchTrendData();

  // 延迟确保DOM已渲染
  setTimeout(() => {
    renderTrendChart({});
    renderTestTypeChart();
    renderMediaResourceChart();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
  }, 100);
});

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (trendChart) trendChart.dispose();
  if (testTypeChart) testTypeChart.dispose();
  if (mediaResourceChart) mediaResourceChart.dispose();
});

const route = useRoute()

onMounted(() => {
  // 等待DOM完全渲染
  setTimeout(() => {
    renderTestTypeChart();
  }, 0);
});

// 监听路由变化
watch(() => route.path, () => {
  nextTick(() => {
    renderTestTypeChart();
  });
});

onMounted(() => {
  nextTick(() => {
    renderTestTypeChart();
    window.addEventListener('resize', renderTestTypeChart);
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', renderTestTypeChart);
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-title {
  margin-bottom: 30px;
  font-size: 28px;
  color: #303133;
  text-align: center;
  font-weight: 600;
}

.stat-cards {
  margin-bottom: 30px;
}

.stat-card {
  height: 120px;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 15px;
  margin-left: 10px;
  border-radius: 8px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.chart-container {
  margin-bottom: 20px;
}

.chart {
  height: 350px;
  width: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 颜色定义 */
.blue .stat-icon {
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
}

.green .stat-icon {
  color: #67C23A;
  background-color: rgba(103, 194, 58, 0.1);
}

.yellow .stat-icon {
  color: #E6A23C;
  background-color: rgba(230, 162, 60, 0.1);
}

.orange .stat-icon {
  color: #FF9900;
  background-color: rgba(255, 153, 0, 0.1);
}

.red .stat-icon {
  color: #F56C6C;
  background-color: rgba(245, 108, 108, 0.1);
}

.purple .stat-icon {
  color: #9966CC;
  background-color: rgba(153, 102, 204, 0.1);
}

.cyan .stat-icon {
  color: #17BCDA;
  background-color: rgba(23, 188, 218, 0.1);
}

/* 为图表容器添加固定尺寸 */
#testTypeChart {
  width: 100%;
  height: 400px;
  /* 设置一个固定高度 */
  min-height: 300px;
}
</style>