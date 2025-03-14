import request from '@/utils/request'

// 测试相关的 API 接口
export const testApi = {
  // 获取所有测试类型
  getTestTypes() {
    return request({
      url: '/api/tests',
      method: 'GET'
    })
  },

  // 获取测试详情
  getTestDetail(testTypeId) {
    return request({
      url: `/api/tests/${testTypeId}`,
      method: 'GET'
    })
  },

  // 添加或更新测试类型
  saveTestType(data) {
    if (data.id) {
      // 更新
      return request({
        url: `/api/tests/types/${data.id}`,
        method: 'put',
        data
      })
    } else {
      // 添加
      return request({
        url: '/api/tests/types',
        method: 'post',
        data
      })
    }
  },

  // 删除测试类型
  deleteTestType(testTypeId) {
    return request({
      url: `/api/tests/types/${testTypeId}`,
      method: 'delete'
    })
  },

  // 更新测试类型图片
  updateTestTypeImage(testTypeId, imageUrl) {
    return request({
      url: `/api/tests/${testTypeId}/image`,
      method: 'put',
      data: { imageUrl }
    })
  },

  // 获取测试题目
  getTestQuestions(testTypeId) {
    return request({
      url: `/api/tests/${testTypeId}/questions`,
      method: 'get'
    })
  },

  // 保存测试题目
  saveQuestion(data) {
    return request({
      url: '/api/tests/questions',
      method: 'post',
      data
    })
  },

  // 删除测试题目
  deleteQuestion(questionId) {
    return request({
      url: `/api/tests/questions/${questionId}`,
      method: 'delete'
    })
  },

  // 获取测试详情
  getTestDetail(testTypeId) {
    return request({
      url: `/api/tests/${testTypeId}`,
      method: 'GET'
    })
  },

  // 提交测试答案
  submitTestAnswers(testTypeId, answers) {
    return request({
      url: `/api/tests/${testTypeId}/submit`,
      method: 'POST',
      data: answers
    })
  },
  // 获取用户测试历史
  getUserTestHistory(testTypeId = '') {
    return request({
      url: `/api/tests/history${testTypeId ? `?testTypeId=${testTypeId}` : ''}`,
      method: 'GET'
    })
  },
  
  // 获取测试结果详情
  getTestResultDetail(resultId) {
    return request({
      url: `/api/tests/results/${resultId}`,
      method: 'GET'
    })
  },

  // 上传测试类型图片
  uploadTestTypeImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return request({
      url: '/api/upload/image',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}