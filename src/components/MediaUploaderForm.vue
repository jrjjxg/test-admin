<template>
    <div class="media-uploader-form">
        <el-form :model="mediaForm" :rules="rules" ref="mediaFormRef" label-width="100px">
            <!-- 标题 -->
            <el-form-item label="标题" prop="title">
                <el-input v-model="mediaForm.title" placeholder="请输入标题"></el-input>
            </el-form-item>

            <!-- 分类 -->
            <el-form-item label="分类" prop="categoryId">
                <el-select v-model="mediaForm.categoryId" placeholder="请选择分类" filterable>
                    <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>

            <!-- 描述 -->
            <el-form-item label="描述">
                <el-input v-model="mediaForm.description" type="textarea" rows="3" placeholder="请输入描述"></el-input>
            </el-form-item>

            <!-- 媒体文件上传 -->
            <el-form-item label="媒体文件" prop="file">
                <el-upload class="media-file-uploader" action="#" :auto-upload="false" :limit="1"
                    :on-change="handleFileChange" :file-list="fileList" :accept="acceptFileTypes">
                    <el-button type="primary">选择{{ mediaTypeText }}文件</el-button>
                    <template #tip>
                        <div class="el-upload__tip">
                            {{ mediaTypeText === '视频' ? '支持mp4, mov等常见视频格式' : '支持mp3, wav等常见音频格式' }}
                        </div>
                    </template>
                </el-upload>
            </el-form-item>

            <!-- 封面图片上传 -->
            <el-form-item label="封面图片">
                <el-upload class="cover-uploader" action="#" :auto-upload="false" :show-file-list="false"
                    :on-change="handleCoverChange" accept="image/*">
                    <img v-if="coverUrl" :src="coverUrl" class="cover-image" />
                    <div v-else class="cover-placeholder">
                        <el-icon>
                            <Plus />
                        </el-icon>
                        <div>点击上传封面</div>
                    </div>
                </el-upload>
            </el-form-item>

            <!-- 提交按钮 -->
            <el-form-item>
                <el-button type="primary" @click="submitForm" :loading="submitting">上传</el-button>
                <el-button @click="resetForm">重置</el-button>
            </el-form-item>
        </el-form>

        <!-- 上传进度显示 -->
        <div v-if="uploading" class="upload-progress">
            <el-progress :percentage="uploadProgress" :stroke-width="8" />
            <div class="progress-text">上传中 {{ uploadProgress }}%</div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { mediaApi } from '@/api/media'

const props = defineProps({
    mediaType: {
        type: Number,
        default: 1, // 默认为视频类型：1=视频，2=音频
        validator: (value) => [1, 2].includes(value)
    }
})

const emit = defineEmits(['upload-success', 'cancel'])

// 状态管理
const categories = ref([])
const fileList = ref([])
const mediaFormRef = ref(null)
const coverUrl = ref('')
const coverFile = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const submitting = ref(false)

// 表单数据
const mediaForm = reactive({
    title: '',
    categoryId: '',
    description: '',
    file: null
})

// 表单验证规则
const rules = {
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
    file: [{ required: true, message: '请选择媒体文件', trigger: 'change' }]
}

// 计算属性
const mediaTypeText = computed(() => {
    return props.mediaType === 1 ? '视频' : '音频'
})

const acceptFileTypes = computed(() => {
    return props.mediaType === 1 ? 'video/*' : 'audio/*'
})

// 生命周期钩子
onMounted(async () => {
    await loadCategories()
})

// 方法
const loadCategories = async () => {
    try {
        const res = await mediaApi.getCategories(props.mediaType)
        if (res.code === 200 && res.data) {
            categories.value = res.data.records || res.data || []
        } else {
            ElMessage.warning('获取分类数据失败')
        }
    } catch (error) {
        console.error('加载分类失败:', error)
        ElMessage.error('加载分类失败')
    }
}

// 处理媒体文件选择
const handleFileChange = (file) => {
    if (file) {
        // 验证文件类型
        let isValidType = false
        if (props.mediaType === 1) {
            isValidType = file.raw.type.startsWith('video/')
        } else {
            isValidType = file.raw.type.startsWith('audio/')
        }

        if (!isValidType) {
            ElMessage.error(`只能上传${mediaTypeText.value}文件!`)
            fileList.value = []
            return
        }

        mediaForm.file = file.raw
    } else {
        mediaForm.file = null
    }
}

// 处理封面图片选择
const handleCoverChange = (file) => {
    if (file) {
        // 验证文件类型
        const isImage = file.raw.type.startsWith('image/')
        if (!isImage) {
            ElMessage.error('封面只能上传图片文件!')
            return
        }

        // 预览图片
        coverUrl.value = URL.createObjectURL(file.raw)
        coverFile.value = file.raw
    }
}

// 提交表单
const submitForm = async () => {
    if (!mediaFormRef.value) return

    await mediaFormRef.value.validate(async (valid) => {
        if (!valid) {
            return false
        }

        submitting.value = true
        uploading.value = true

        try {
            // 创建FormData对象
            const formData = new FormData()
            formData.append('file', mediaForm.file)
            formData.append('title', mediaForm.title)
            formData.append('categoryId', mediaForm.categoryId)
            formData.append('mediaType', props.mediaType)

            if (mediaForm.description) {
                formData.append('description', mediaForm.description)
            }

            if (coverFile.value) {
                formData.append('coverFile', coverFile.value)
            }

            // 模拟上传进度
            const progressInterval = simulateProgress()

            // 发送上传请求
            const res = await mediaApi.uploadMediaResource(formData)

            // 清除进度模拟
            clearInterval(progressInterval)
            uploadProgress.value = 100

            if (res.code === 200) {
                ElMessage.success('上传成功')
                emit('upload-success', res.data)
                resetForm()
            } else {
                ElMessage.error(res.message || '上传失败')
            }
        } catch (error) {
            console.error('上传失败:', error)
            ElMessage.error('上传失败，请重试')
        } finally {
            setTimeout(() => {
                uploading.value = false
                submitting.value = false
                uploadProgress.value = 0
            }, 500)
        }
    })
}

// 模拟上传进度
const simulateProgress = () => {
    uploadProgress.value = 0
    return setInterval(() => {
        if (uploadProgress.value < 90) {
            uploadProgress.value += 10
        }
    }, 300)
}

// 重置表单
const resetForm = () => {
    if (mediaFormRef.value) {
        mediaFormRef.value.resetFields()
    }
    fileList.value = []
    coverUrl.value = ''
    coverFile.value = null
}
</script>

<style scoped>
.media-uploader-form {
    width: 100%;
}

.cover-uploader {
    width: 178px;
    height: 178px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.cover-uploader:hover {
    border-color: #409EFF;
}

.cover-image {
    width: 178px;
    height: 178px;
    display: block;
    object-fit: cover;
}

.cover-placeholder {
    width: 178px;
    height: 178px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #8c939d;
}

.cover-placeholder :deep(.el-icon) {
    font-size: 28px;
    margin-bottom: 8px;
}

.media-file-uploader {
    width: 100%;
}

.upload-progress {
    margin-top: 20px;
    padding: 15px;
    border-radius: 4px;
    background-color: #f5f7fa;
}

.progress-text {
    margin-top: 8px;
    text-align: center;
    color: #606266;
}
</style>