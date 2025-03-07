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

  // 获取测试问题
  getTestQuestions(testTypeId) {
    return request({
      url: `/api/tests/${testTypeId}/questions`,
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
  // 保存题目（添加或更新）
  saveQuestion(questionData) {
    return request({
      url: '/api/tests/questions',
      method: 'POST',
      data: questionData
    })
  },

  // 删除题目
  deleteQuestion(questionId) {
    return request({
      url: `/api/tests/questions/${questionId}`,
      method: 'DELETE'
    })
  }
}