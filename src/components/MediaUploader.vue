<template>
    <div class="media-uploader">
        <el-upload class="upload-container" drag action="#" :http-request="handleCustomUpload"
            :on-progress="handleProgress" :before-upload="beforeUpload" :show-file-list="false"
            :accept="acceptFileTypes">
            <div v-if="!uploading">
                <el-icon class="upload-icon">
                    <Upload />
                </el-icon>
                <div class="upload-text">点击或拖拽{{ mediaTypeText }}文件到此处上传</div>
                <div class="upload-tip">
                    <template v-if="mediaType === 1">支持mp4, mov等常见视频格式</template>
                    <template v-else-if="mediaType === 2">支持mp3, wav等常见音频格式</template>
                </div>
            </div>
            <div v-else class="uploading-container">
                <el-progress :percentage="uploadProgress" :stroke-width="6" />
                <div class="progress-text">{{ uploadProgressText }}</div>
            </div>
        </el-upload>

        <!-- 媒体信息表单 -->
        <div class="form-container" v-if="showForm">
            <el-form :model="mediaForm" label-width="100px" :rules="rules" ref="mediaFormRef">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="mediaForm.title" placeholder="请输入标题"></el-input>
                </el-form-item>

                <el-form-item label="分类" prop="categoryId">
                    <el-select v-model="mediaForm.categoryId" placeholder="请选择分类" filterable>
                        <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="描述">
                    <el-input v-model="mediaForm.description" type="textarea" rows="3" placeholder="请输入描述"></el-input>
                </el-form-item>

                <el-form-item label="封面图片">
                    <el-upload class="cover-uploader" action="#" :http-request="handleCoverUpload"
                        :show-file-list="false" accept="image/*">
                        <img v-if="mediaForm.coverUrl" :src="mediaForm.coverUrl" class="cover-image" />
                        <div v-else class="cover-placeholder">
                            <el-icon>
                                <Plus />
                            </el-icon>
                            <div>点击上传封面</div>
                        </div>
                    </el-upload>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="submitForm" :loading="submitting">保存</el-button>
                    <el-button @click="resetForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Plus } from '@element-plus/icons-vue'
import { mediaApi } from '@/api/media'

const props = defineProps({
    mediaType: {
        type: Number,
        default: 1, // 默认为视频类型，1=视频，2=音频
        validator: (value) => [1, 2].includes(value)
    }
})

const emit = defineEmits(['upload-success', 'cancel'])

// 数据初始化
const uploading = ref(false)
const uploadProgress = ref(0)
const showForm = ref(false)
const submitting = ref(false)
const categories = ref([])
const mediaFormRef = ref(null)

const mediaForm = reactive({
    id: '',
    title: '',
    categoryId: '',
    description: '',
    coverUrl: '',
    resourceUrl: '',
    mediaType: props.mediaType
})

const rules = {
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

// 计算属性
const mediaTypeText = computed(() => {
    return props.mediaType === 1 ? '视频' : '音频'
})

const uploadProgressText = computed(() => {
    return `上传中 ${uploadProgress.value}%`
})

const acceptFileTypes = computed(() => {
    return props.mediaType === 1 ? 'video/*' : 'audio/*'
})

// 生命周期钩子
onMounted(async () => {
    try {
        const res = await mediaApi.getCategories(props.mediaType)
        if (res.code === 200 && res.data) {
            categories.value = res.data
        }
    } catch (error) {
        console.error('加载分类失败:', error)
    }
})

// 方法
const beforeUpload = (file) => {
    // 检查文件类型
    let isValidType = false

    if (props.mediaType === 1) {
        isValidType = file.type.startsWith('video/')
        if (!isValidType) {
            ElMessage.error('只能上传视频文件!')
            return false
        }
    } else {
        isValidType = file.type.startsWith('audio/')
        if (!isValidType) {
            ElMessage.error('只能上传音频文件!')
            return false
        }
    }

    // 检查文件大小，视频限制为500MB，音频限制为50MB
    const sizeLimit = props.mediaType === 1 ? 500 : 50
    const isValidSize = file.size / 1024 / 1024 < sizeLimit

    if (!isValidSize) {
        ElMessage.error(`文件大小不能超过${sizeLimit}MB!`)
        return false
    }

    // 验证文件后
    showForm.value = true  // 显示表单让用户填写信息
    return false  // 阻止自动上传，等待用户填写完表单
}

const handleProgress = (event) => {
    uploadProgress.value = Math.round(event.percent)
}

const handleCustomUpload = async (options) => {
    uploading.value = true
    uploadProgress.value = 0

    try {
        const formData = new FormData()
        formData.append('file', options.file)
        formData.append('title', mediaForm.title)
        formData.append('categoryId', mediaForm.categoryId)
        formData.append('mediaType', props.mediaType)

        if (mediaForm.description) {
            formData.append('description', mediaForm.description)
        }

        if (mediaForm.coverUrl) {
            formData.append('coverFile', mediaForm.coverUrl)
        }

        // 模拟进度
        const timer = setInterval(() => {
            if (uploadProgress.value < 90) {
                uploadProgress.value += 5
            }
        }, 500)

        const res = await mediaApi.uploadMediaResource(formData)

        clearInterval(timer)
        uploadProgress.value = 100

        if (res.code === 200) {
            ElMessage.success('上传成功')

            // 填充表单数据
            mediaForm.id = res.data
            mediaForm.title = options.file.name.split('.')[0]
            mediaForm.mediaType = props.mediaType

            // 显示表单
            showForm.value = true
        } else {
            ElMessage.error(res.message || '上传失败')
        }
    } catch (error) {
        console.error('上传失败:', error)
        ElMessage.error('上传失败')
    } finally {
        setTimeout(() => {
            uploading.value = false
        }, 1000)
    }
}

const handleCoverUpload = async (options) => {
    try {
        const res = await mediaApi.uploadImage(options.file)

        if (res.code === 200) {
            mediaForm.coverUrl = res.data
            ElMessage.success('封面上传成功')
        } else {
            ElMessage.error(res.message || '封面上传失败')
        }
    } catch (error) {
        console.error('上传封面失败:', error)
        ElMessage.error('上传封面失败')
    }
}

const submitForm = async () => {
    if (!mediaFormRef.value) return

    await mediaFormRef.value.validate(async (valid) => {
        if (!valid) return

        submitting.value = true
        try {
            const data = {
                id: mediaForm.id,
                title: mediaForm.title,
                categoryId: mediaForm.categoryId,
                description: mediaForm.description,
                coverUrl: mediaForm.coverUrl,
                mediaType: props.mediaType
            }

            const res = await mediaApi.updateMediaResource(data.id, data)

            if (res.code === 200) {
                ElMessage.success('保存成功')
                emit('upload-success')
            } else {
                ElMessage.error(res.message || '保存失败')
            }
        } catch (error) {
            console.error('保存媒体信息失败:', error)
            ElMessage.error('保存媒体信息失败')
        } finally {
            submitting.value = false
        }
    })
}

const resetForm = () => {
    if (mediaFormRef.value) {
        mediaFormRef.value.resetFields()
    }
    mediaForm.coverUrl = ''
}
</script>

<style scoped>
.media-uploader {
    width: 100%;
}

.upload-container {
    width: 100%;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    padding: 60px 0;
    text-align: center;
}

.upload-container:hover {
    border-color: #409EFF;
}

.upload-icon {
    font-size: 48px;
    color: #8c939d;
}

.upload-text {
    font-size: 16px;
    color: #606266;
    margin: 10px 0;
}

.upload-tip {
    font-size: 12px;
    color: #909399;
}

.uploading-container {
    padding: 0 20px;
    width: 100%;
}

.progress-text {
    margin-top: 10px;
    color: #606266;
}

.form-container {
    margin-top: 20px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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
</style>