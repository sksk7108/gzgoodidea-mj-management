import request from '@/utils/request'

/**
 * 获取用户列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getUserList(params) {
  return request({
    url: '/user/list',
    method: 'get',
    params
  })
}

/**
 * 获取用户详情
 * @param {number|string} id 用户ID
 * @returns {Promise}
 */
export function getUserDetail(id) {
  return request({
    url: `/user/${id}`,
    method: 'get'
  })
}

/**
 * 创建用户
 * @param {Object} data 用户数据
 * @returns {Promise}
 */
export function createUser(data) {
  return request({
    url: '/user/create',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 * @param {Object} data 用户数据
 * @returns {Promise}
 */
export function updateUser(data) {
  return request({
    url: '/user/update',
    method: 'put',
    data
  })
}

/**
 * 删除用户
 * @param {number|string} id 用户ID
 * @returns {Promise}
 */
export function deleteUser(id) {
  return request({
    url: `/user/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 修改用户状态
 * @param {number|string} id 用户ID
 * @param {number} status 状态值
 * @returns {Promise}
 */
export function changeUserStatus(id, status) {
  return request({
    url: `/user/updateStatus`,
    method: 'post',
    data: { id, userStatus: status }
  })
}

/**
 * 重置用户密码
 * @param {number|string} id 用户ID
 * @returns {Promise}
 */
export function resetUserPassword(id) {
  return request({
    url: `/user/resetPassword/${id}`,
    method: 'put'
  })
}

/**
 * 分配算力点给用户
 * @param {number|string} userId 用户ID
 * @param {number} powerPoint 分配的算力点数量
 * @returns {Promise}
 */
export function assignPowerPoint(userId, powerPoint) {
  return request({
    url: '/user/assignPowerPoint',
    method: 'post',
    data: { id: userId, powerPoint }
  })
}
