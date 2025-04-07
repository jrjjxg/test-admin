<template>
    <div class="resource-manager">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>媒体资源管理</span>
                    <div class="header-actions">
                        <el-radio-group v-model="queryParams.mediaType" @change="handleMediaTypeChange">
                            <el-radio-button :label="1">视频</el-radio-button>
                            <el-radio-button :label="2">音频</el-radio-button>
                        </el-radio-group>
                        <el-button type="primary" @click="openUploadDialog">上传资源</el-button>
                    </div>
                </div>
            </template>

            <!-- 搜索区域 -->
            <div class="search-area">
                <el-form :inline="true" :model="queryParams" class="search-form">

                    <el-form-item label="标题">
                        <el-input v-model="queryParams.title" placeholder="请输入标题关键字" clearable style="width: 220px" />
                    </el-form-item>

                    <el-form-item label="分类">
                        <el-select v-model="queryParams.categoryId" placeholder="请选择分类" clearable style="width: 180px">
                            <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="状态">
                        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px">
                            <el-option label="已发布" :value="1" />
                            <el-option label="未发布" :value="0" />
                        </el-select>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="handleSearch">搜索</el-button>
                        <el-button @click="resetSearch">重置</el-button>
                    </el-form-item>

                </el-form>
            </div>

            <!-- 资源列表 -->
            <el-table v-loading="loading" :data="resourceList" stripe style="width: 100%">
                <el-table-column prop="id" label="ID" min-width="220" show-overflow-tooltip />
                <el-table-column label="封面" width="100">
                    <template #default="scope">
                        <el-image v-if="scope.row.coverUrl" :src="scope.row.coverUrl" style="width: 50px; height: 50px"
                            fit="cover" :preview-src-list="[scope.row.coverUrl]" />
                        <el-icon v-else>
                            <PictureFilled />
                        </el-icon>
                    </template>
                </el-table-column>
                <el-table-column prop="title" label="标题" min-width="150" show-overflow-tooltip />
                <el-table-column prop="categoryName" label="分类" width="120" />
                <el-table-column prop="mediaTypeName" label="类型" width="80" />
                <el-table-column prop="durationText" label="时长" width="80" />
                <el-table-column prop="views" label="播放次数" width="100" sortable />
                <el-table-column label="状态" width="100">
                    <template #default="scope">
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
                            {{ scope.row.status === 1 ? '已发布' : '未发布' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="220">
                    <template #default="scope">
                        <div class="operation-buttons">
                            <el-button type="primary" size="small" @click="handlePreview(scope.row)">预览</el-button>
                            <el-button type="success" size="small" @click="handleEdit(scope.row)">编辑</el-button>

                            <el-dropdown>
                                <el-button size="small">
                                    更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                                </el-button>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item v-if="scope.row.status === 0"
                                            @click="handleStatusChange(scope.row, 1)">
                                            <el-icon>
                                                <Check />
                                            </el-icon> 发布
                                        </el-dropdown-item>
                                        <el-dropdown-item v-else @click="handleStatusChange(scope.row, 0)">
                                            <el-icon>
                                                <Close />
                                            </el-icon> 下架
                                        </el-dropdown-item>
                                        <el-dropdown-item @click="handleDelete(scope.row)" style="color: #F56C6C;">
                                            <el-icon>
                                                <Delete />
                                            </el-icon> 删除
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
                <el-pagination v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize"
                    :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </el-card>

        <!-- 上传媒体对话框 -->
        <el-dialog v-model="uploadDialogVisible" :title="`上传${mediaTypeText}`" width="650px" destroy-on-close>
            <MediaUploaderForm :media-type="queryParams.mediaType" @upload-success="handleUploadSuccess" />
        </el-dialog>

        <!-- 编辑资源对话框 -->
        <el-dialog v-model="editDialogVisible" title="编辑媒体资源" width="600px">
            <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
                <el-form-item label="资源ID" prop="id">
                    <el-input v-model="editForm.id" disabled />
                </el-form-item>

                <el-form-item label="标题" prop="title">
                    <el-input v-model="editForm.title" />
                </el-form-item>

                <el-form-item label="分类" prop="categoryId">
                    <el-select v-model="editForm.categoryId" placeholder="请选择分类" filterable>
                        <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="描述">
                    <el-input v-model="editForm.description" type="textarea" rows="3" />
                </el-form-item>

                <el-form-item label="封面">
                    <el-upload class="cover-uploader" action="#" :http-request="handleEditCoverUpload"
                        :show-file-list="false" accept="image/*">
                        <img v-if="editForm.coverUrl" :src="editForm.coverUrl" class="cover-image" />
                        <el-icon v-else class="cover-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitEditForm" :loading="submitting">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 媒体预览对话框 -->
        <el-dialog v-model="previewDialogVisible" :title="previewForm.title" width="800px">
            <div class="media-preview">
                <template v-if="previewForm.mediaType === 1">
                    <video v-if="previewForm.resourceUrl" :src="previewForm.resourceUrl" controls
                        class="video-player" />
                </template>
                <template v-else-if="previewForm.mediaType === 2">
                    <audio v-if="previewForm.resourceUrl" :src="previewForm.resourceUrl" controls
                        class="audio-player" />
                </template>
            </div>

            <div class="media-description" v-if="previewForm.description">
                <h4>描述:</h4>
                <p>{{ previewForm.description }}</p>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, PictureFilled, ArrowDown, Check, Close, Delete } from '@element-plus/icons-vue'
import { mediaApi } from '@/api/media'
import MediaUploaderForm from '@/components/MediaUploaderForm.vue'

// 数据初始化
const loading = ref(false)
const submitting = ref(false)
const resourceList = ref([])
const categories = ref([])
const total = ref(0)
const uploadDialogVisible = ref(false)
const editDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const editFormRef = ref(null)

// 查询参数
const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    title: '',
    categoryId: '',
    mediaType: 1, // 默认视频
    status: ''
})

// 编辑表单
const editForm = reactive({
    id: '',
    title: '',
    categoryId: '',
    description: '',
    coverUrl: '',
    mediaType: 1
})

// 预览表单
const previewForm = reactive({
    id: '',
    title: '',
    resourceUrl: '',
    mediaType: 1,
    description: ''
})

// 表单验证规则
const rules = {
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

// 计算属性
const mediaTypeText = computed(() => {
    return queryParams.mediaType === 1 ? '视频' : '音频'
})

// 生命周期钩子
onMounted(() => {
    loadCategories()
    loadResourceList()
})

// 加载分类列表
const loadCategories = async () => {
    try {
        const res = await mediaApi.getCategories(queryParams.mediaType)
        if (res.code === 200 && res.data) {
            categories.value = res.data.records || []
        } else {
            ElMessage.error(res.message || '获取分类列表失败')
        }
    } catch (error) {
        console.error('获取分类列表失败:', error)
        ElMessage.error('获取分类列表失败')
    }
}

// 加载资源列表
const loadResourceList = async () => {
    loading.value = true
    try {
        const res = await mediaApi.getMediaResources({
            pageNum: queryParams.pageNum,
            pageSize: queryParams.pageSize,
            title: queryParams.title || undefined,
            categoryId: queryParams.categoryId || undefined,
            mediaType: queryParams.mediaType,
            status: queryParams.status || undefined
        })

        if (res.code === 200) {
            resourceList.value = res.data.records || []
            total.value = res.data.total || 0
        } else {
            ElMessage.error(res.message || '获取媒体资源列表失败')
        }
    } catch (error) {
        console.error('获取媒体资源列表失败:', error)
        ElMessage.error('获取媒体资源列表失败')
    } finally {
        loading.value = false
    }
}

// 处理媒体类型切换
const handleMediaTypeChange = () => {
    queryParams.pageNum = 1
    loadCategories()
    loadResourceList()
}

// 处理每页条数变化
const handleSizeChange = (size) => {
    queryParams.pageSize = size
    loadResourceList()
}

// 处理页码变化
const handleCurrentChange = (page) => {
    queryParams.pageNum = page
    loadResourceList()
}

// 搜索
const handleSearch = () => {
    queryParams.pageNum = 1
    loadResourceList()
}

// 重置搜索
const resetSearch = () => {
    queryParams.title = ''
    queryParams.categoryId = ''
    queryParams.status = ''
    queryParams.pageNum = 1
    loadResourceList()
}

// 打开上传对话框
const openUploadDialog = () => {
    uploadDialogVisible.value = true
}

// 处理上传成功
const handleUploadSuccess = () => {
    uploadDialogVisible.value = false
    loadResourceList()
}

// 预览
const handlePreview = (row) => {
    previewForm.id = row.id
    previewForm.title = row.title
    previewForm.resourceUrl = row.resourceUrl
    previewForm.mediaType = row.mediaType
    previewForm.description = row.description
    previewDialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
    Object.assign(editForm, row)
    editDialogVisible.value = true
}

// 处理编辑表单中的封面上传
const handleEditCoverUpload = async (options) => {
    try {
        const res = await mediaApi.uploadImage(options.file)
        if (res.code === 200) {
            editForm.coverUrl = res.data
        } else {
            ElMessage.error(res.message || '封面上传失败')
        }
    } catch (error) {
        console.error('封面上传失败:', error)
        ElMessage.error('封面上传失败')
    }
}

// 提交编辑表单
const submitEditForm = async () => {
    if (!editFormRef.value) return

    await editFormRef.value.validate(async (valid) => {
        if (!valid) return

        submitting.value = true
        try {
            const res = await mediaApi.updateMediaResource(editForm.id, editForm)
            if (res.code === 200) {
                ElMessage.success('更新成功')
                editDialogVisible.value = false
                loadResourceList()
            } else {
                ElMessage.error(res.message || '更新失败')
            }
        } catch (error) {
            console.error('更新失败:', error)
            ElMessage.error('更新失败')
        } finally {
            submitting.value = false
        }
    })
}

// 更改状态
const handleStatusChange = async (row, status) => {
    try {
        const res = await mediaApi.updateMediaStatus(row.id, status)
        if (res.code === 200) {
            ElMessage.success(status === 1 ? '发布成功' : '下架成功')
            loadResourceList()
        } else {
            ElMessage.error(res.message || '操作失败')
        }
    } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
    }
}

// 删除
const handleDelete = (row) => {
    ElMessageBox.confirm(`确定要删除 "${row.title}" 吗？此操作不可逆`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    })
        .then(async () => {
            try {
                const res = await mediaApi.deleteMediaResource(row.id)
                if (res.code === 200) {
                    ElMessage.success('删除成功')
                    loadResourceList()
                } else {
                    ElMessage.error(res.message || '删除失败')
                }
            } catch (error) {
                console.error('删除失败:', error)
                ElMessage.error('删除失败')
            }
        })
        .catch(() => { })
}

// 当媒体类型变化时重新加载分类
watch(() => queryParams.mediaType, () => {
    loadCategories()
})
</script>

<style scoped>
.resource-manager {
    padding: 10px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 15px;
}

.search-area {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
}

.search-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
}

.search-form :deep(.el-form-item) {
    margin-bottom: 10px;
    margin-right: 15px;
}

.search-form :deep(.el-form-item__content) {
    display: flex;
    align-items: center;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.cover-uploader {
    width: 100px;
    height: 100px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s;
}

.cover-uploader:hover {
    border-color: #409EFF;
}

.cover-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
}

.cover-image {
    width: 100px;
    height: 100px;
    display: block;
    object-fit: contain;
}

.upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
}

.media-preview {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.video-player {
    width: 100%;
    max-height: 400px;
}

.audio-player {
    width: 100%;
}

.media-description {
    margin-top: 15px;
    padding: 15px;
    background-color: #f8f8f8;
    border-radius: 4px;
}

.operation-buttons {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
}

.operation-buttons .el-button {
    margin-left: 0;
    margin-right: 0;
    margin-bottom: 5px;
}
</style>