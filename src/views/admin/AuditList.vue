<template>
    <div class="bottle-audit-container">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>漂流瓶审核</span>
                    <el-button type="primary" @click="handleRefresh">刷新</el-button>
                </div>
            </template>

            <el-table v-loading="loading" :data="bottleList" style="width: 100%">
                <el-table-column prop="id" label="ID" width="220" />
                <el-table-column label="用户信息" width="150">
                    <template #default="scope">
                        <div class="author-info">
                            <el-avatar :size="40" :src="scope.row.author.avatar || '/placeholder-avatar.png'" />
                            <span class="author-name">{{ scope.row.author.nickname }}</span>
                            <el-tag v-if="scope.row.isAnonymous === 1" size="small" type="info">匿名</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="content" label="内容" show-overflow-tooltip />
                <el-table-column label="图片" width="120">
                    <template #default="scope">
                        <div v-if="scope.row.images && scope.row.images.length > 0" class="image-preview">
                            <el-image :src="scope.row.images[0]" fit="cover" :preview-src-list="scope.row.images"
                                :initial-index="0" style="width: 50px; height: 50px;" />
                            <span v-if="scope.row.images.length > 1" class="image-count">+{{ scope.row.images.length - 1
                                }}</span>
                        </div>
                        <span v-else>无图片</span>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="180">
                    <template #default="scope">
                        {{ formatTime(scope.row.createTime) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                        <el-button type="success" size="small" @click="handleApprove(scope.row.id)">通过</el-button>
                        <el-button type="danger" size="small" @click="showRejectDialog(scope.row.id)">拒绝</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="total"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </el-card>

        <!-- 拒绝原因对话框 -->
        <el-dialog v-model="rejectDialogVisible" title="拒绝原因" width="30%">
            <el-input v-model="rejectReason" type="textarea" placeholder="请输入拒绝原因" :rows="4" />
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="rejectDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleReject" :disabled="!rejectReason.trim()">
                        确认
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPendingAuditBottles, auditBottle } from '@/api/driftbottle'

// 数据
const loading = ref(false)
const bottleList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const currentBottleId = ref('')

// 获取待审核漂流瓶列表
const fetchData = async () => {
    loading.value = true
    try {
        const res = await getPendingAuditBottles(currentPage.value, pageSize.value)
        if (res.code === 200) {
            bottleList.value = res.data.records || []
            total.value = res.data.total || 0
        } else {
            ElMessage.error(res.message || '获取数据失败')
        }
    } catch (error) {
        console.error('获取待审核漂流瓶失败:', error)
        ElMessage.error('获取数据失败')
    } finally {
        loading.value = false
    }
}

// 格式化时间
const formatTime = (time) => {
    if (!time) return ''
    return new Date(time).toLocaleString()
}

// 显示拒绝对话框
const showRejectDialog = (bottleId) => {
    currentBottleId.value = bottleId
    rejectReason.value = ''
    rejectDialogVisible.value = true
}

// 通过审核
const handleApprove = async (bottleId) => {
    try {
        const res = await auditBottle({
            bottleId,
            status: 1, // 1表示通过
            reason: ''
        })
        if (res.code === 200) {
            ElMessage.success('审核通过成功')
            fetchData()
        } else {
            ElMessage.error(res.message || '操作失败')
        }
    } catch (error) {
        console.error('审核操作失败:', error)
        ElMessage.error('操作失败')
    }
}

// 拒绝审核
const handleReject = async () => {
    if (!rejectReason.value.trim()) {
        ElMessage.warning('请输入拒绝原因')
        return
    }

    try {
        const res = await auditBottle({
            bottleId: currentBottleId.value,
            status: 3, // 3表示拒绝
            reason: rejectReason.value
        })
        if (res.code === 200) {
            ElMessage.success('审核拒绝成功')
            rejectDialogVisible.value = false
            fetchData()
        } else {
            ElMessage.error(res.message || '操作失败')
        }
    } catch (error) {
        console.error('审核操作失败:', error)
        ElMessage.error('操作失败')
    }
}

// 分页相关方法
const handleSizeChange = (val) => {
    pageSize.value = val
    fetchData()
}

const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchData()
}

// 刷新数据
const handleRefresh = () => {
    fetchData()
}

// 初始化
onMounted(() => {
    fetchData()
})
</script>

<style scoped>
.bottle-audit-container {
    padding: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.author-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
}

.author-name {
    font-size: 14px;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.image-preview {
    position: relative;
    display: inline-block;
}

.image-count {
    position: absolute;
    bottom: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    font-size: 12px;
    padding: 2px 4px;
    border-radius: 4px;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>