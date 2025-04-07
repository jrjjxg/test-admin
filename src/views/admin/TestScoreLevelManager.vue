<template>
    <div class="test-score-level-manager">
        <el-card>
            <div slot="header">
                <span>测试分数解读等级管理</span>
                <el-select v-model="selectedTestType" placeholder="请选择测试类型" @change="loadLevels"
                    style="margin-left: 20px; width: 240px;">
                    <el-option v-for="item in testTypes" :key="item.id" :label="item.name" :value="item.id">
                    </el-option>
                </el-select>
                <el-button type="primary" size="small" @click="handleAdd" style="float: right;">添加分数等级</el-button>
            </div>

            <div class="level-info" v-if="levels.length > 0">共有 {{ levels.length }} 个等级</div>
            <div class="level-info" v-else>暂无数据</div>

            <el-table :data="levels" style="width: 100%" border v-loading="tableLoading" ref="table">
                <el-table-column prop="levelName" label="级别名称" width="100"></el-table-column>
                <el-table-column label="分数范围" width="100">
                    <template #default="{ row }">
                        {{ row.minScore || 0 }} - {{ row.maxScore || 0 }}
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" show-overflow-tooltip></el-table-column>
                <el-table-column prop="suggestions" label="建议" show-overflow-tooltip></el-table-column>
                <el-table-column prop="orderNum" label="排序" width="80"></el-table-column>
                <el-table-column label="操作" width="200">
                    <template #default="{ row }">
                        <el-button type="text" @click="handleEdit(row)">编辑</el-button>
                        <el-button type="text" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 新增/编辑对话框 -->
        <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" :close-on-click-modal="false"
            @open="handleDialogOpen">
            <el-form :model="form" :rules="rules" ref="form" label-width="100px" v-if="dialogVisible">
                <el-form-item label="测试类型" v-if="!form.id">
                    <el-select v-model="form.testTypeId" placeholder="请选择测试类型">
                        <el-option v-for="item in testTypes" :key="item.id" :label="item.name" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="级别名称" prop="levelName">
                    <el-input v-model="form.levelName" placeholder="如：正常、轻度、中度等"></el-input>
                </el-form-item>
                <el-form-item label="分数范围">
                    <el-col :span="11">
                        <el-form-item prop="minScore">
                            <el-input-number v-model="form.minScore" :min="0" :max="100" label="最小分数">
                            </el-input-number>
                        </el-form-item>
                    </el-col>
                    <el-col class="line" :span="2" style="text-align: center;">-</el-col>
                    <el-col :span="11">
                        <el-form-item prop="maxScore">
                            <el-input-number v-model="form.maxScore" :min="0" :max="100" label="最大分数">
                            </el-input-number>
                        </el-form-item>
                    </el-col>
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input type="textarea" v-model="form.description" :rows="4"
                        placeholder="支持变量：{testName}、{score}、{level}">
                    </el-input>
                </el-form-item>
                <el-form-item label="建议" prop="suggestions">
                    <el-input type="textarea" v-model="form.suggestions" :rows="6"
                        placeholder="支持变量：{testName}、{level}">
                    </el-input>
                </el-form-item>
                <el-form-item label="排序号" prop="orderNum">
                    <el-input-number v-model="form.orderNum" :min="1" :max="100"></el-input-number>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="handleDialogClose">取 消</el-button>
                <el-button type="primary" @click="submitForm">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { testApi } from '@/api/test';

export default {
    name: 'TestScoreLevelManager',
    data() {
        return {
            testTypes: [],
            selectedTestType: '',
            levels: [],
            tableLoading: false,
            dialogVisible: false,
            dialogTitle: '添加分数等级',
            form: {
                id: '',
                testTypeId: '',
                levelName: '',
                minScore: 0,
                maxScore: 0,
                description: '',
                suggestions: '',
                orderNum: 1
            },
            rules: {
                levelName: [{ required: true, message: '请输入级别名称', trigger: 'blur' }],
                minScore: [{ required: true, message: '请输入最小分数', trigger: 'blur' }],
                maxScore: [{ required: true, message: '请输入最大分数', trigger: 'blur' }],
                description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
                suggestions: [{ required: true, message: '请输入建议', trigger: 'blur' }],
                orderNum: [{ required: true, message: '请输入排序号', trigger: 'blur' }]
            }
        };
    },
    created() {
        this.loadTestTypes();
    },
    methods: {
        loadTestTypes() {
            testApi.getTestTypes().then(response => {
                this.testTypes = response.data;
                if (this.testTypes.length > 0) {
                    this.selectedTestType = this.testTypes[0].id;
                    this.loadLevels();
                }
            }).catch(error => {
                this.$message.error('加载测试类型失败');
            });
        },
        loadLevels() {
            if (!this.selectedTestType) return;

            this.tableLoading = true;
            testApi.getScoreLevels(this.selectedTestType).then(response => {
                if (response && response.code === 200 && Array.isArray(response.data)) {
                    this.levels = response.data.map(item => ({
                        id: item.id || '',
                        testTypeId: item.testTypeId || '',
                        levelName: item.levelName || '',
                        minScore: item.minScore || 0,
                        maxScore: item.maxScore || 0,
                        description: item.description || '',
                        suggestions: item.suggestions || '',
                        orderNum: item.orderNum || 0
                    }));
                } else if (Array.isArray(response)) {
                    this.levels = response.map(item => ({
                        id: item.id || '',
                        testTypeId: item.testTypeId || '',
                        levelName: item.levelName || '',
                        minScore: item.minScore || 0,
                        maxScore: item.maxScore || 0,
                        description: item.description || '',
                        suggestions: item.suggestions || '',
                        orderNum: item.orderNum || 0
                    }));
                } else {
                    this.levels = [];
                }

                this.$nextTick(() => {
                    if (this.$refs.table) {
                        this.$refs.table.doLayout();
                    }
                });
            }).catch(error => {
                this.$message.error('获取分数等级失败');
                this.levels = [];
            }).finally(() => {
                this.tableLoading = false;
            });
        },
        handleAdd() {
            this.dialogTitle = '添加分数等级';
            this.form = {
                id: '',
                testTypeId: this.selectedTestType,
                levelName: '',
                minScore: 0,
                maxScore: 0,
                description: '',
                suggestions: '',
                orderNum: 1
            };
            this.dialogVisible = true;
            this.$nextTick(() => {
                if (this.$refs.form) {
                    this.$refs.form.resetFields();
                }
            });
        },
        handleEdit(row) {
            if (!row) return;

            this.dialogTitle = '编辑分数等级';
            this.form = {
                id: row.id,
                testTypeId: row.testTypeId,
                levelName: row.levelName,
                minScore: Number(row.minScore) || 0,
                maxScore: Number(row.maxScore) || 0,
                description: row.description,
                suggestions: row.suggestions,
                orderNum: Number(row.orderNum) || 1
            };

            this.dialogVisible = true;

            this.$nextTick(() => {
                if (this.$refs.form) {
                    this.$refs.form.clearValidate();
                }
            });
        },
        handleDelete(row) {
            this.$confirm('确认删除该分数等级?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                testApi.deleteScoreLevel(row.id).then(() => {
                    this.$message.success('删除成功');
                    this.loadLevels();
                });
            }).catch(() => { });
        },
        handleDialogClose() {
            this.$confirm('确认关闭？未保存的数据将会丢失', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.dialogVisible = false;
                this.resetForm();
            }).catch(() => { });
        },
        handleDialogOpen() {
            if (this.$refs.form) {
                this.$refs.form.clearValidate();
            }
        },
        resetForm() {
            this.form = {
                id: '',
                testTypeId: this.selectedTestType,
                levelName: '',
                minScore: 0,
                maxScore: 0,
                description: '',
                suggestions: '',
                orderNum: 1
            };
            if (this.$refs.form) {
                this.$refs.form.resetFields();
            }
        },
        submitForm() {
            this.$refs.form.validate(valid => {
                if (!valid) return;

                const method = this.form.id ? testApi.updateScoreLevel : testApi.createScoreLevel;
                const message = this.form.id ? '更新成功' : '添加成功';

                method(this.form).then(() => {
                    this.$message.success(message);
                    this.dialogVisible = false;
                    this.loadLevels();
                    this.resetForm();
                }).catch(error => {
                    this.$message.error('操作失败：' + (error.message || '未知错误'));
                });
            });
        }
    }
};
</script>

<style scoped>
.test-score-level-manager {
    padding: 20px;
}

.card-header {
    display: flex;
    align-items: center;
}

.title {
    font-weight: bold;
    font-size: 16px;
}

.level-info {
    margin-bottom: 15px;
    font-size: 14px;
    color: #606266;
}

.ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 400px;
}

.delete-btn {
    color: #F56C6C;
    margin-left: 10px;
}

.delete-btn:hover {
    color: #f78989;
}
</style>