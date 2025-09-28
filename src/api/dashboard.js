import request from '@/utils/request'

/**
 * 根据起始时间、最后时间、单位获取新增用户数、用户活跃度
 * @param {Object} params
 * @param {string} params.startTime 起始时间
 * @param {string} params.endTime 最后时间
 * @param {string} params.statDimension // daily-每天   weekly-每周   monthly-每月
 * @returns {Promise<Object>}
 * 返回数据格式：
 * "data": [
    {
      "statDateDesc": "2025-07-14至2025-07-20",
      "newUserCount": 7,
      "activityRate": 0.57
    },
    {
      "statDateDesc": "2025-07-21至2025-07-27",
      "newUserCount": 0,
      "activityRate": 0
    },
    {
      "statDateDesc": "2025-07-28至2025-08-03",
      "newUserCount": 1,
      "activityRate": 1
    },
    {
      "statDateDesc": "2025-08-04至2025-08-08",
      "newUserCount": 3,
      "activityRate": 0.67
    }
  ]
 */
export const getUserInfo = (params) => {
  return request({
    url: '/user/userGrowth',
    method: 'get',
    params
  })
}

/**
 * 获取用户信息指标
 * @returns {Promise<Object>}
 * 返回数据格式：
 * "data": {
    "todayActiveUserCount": 2, // 今日活跃人数
    "todayNewUserCount": 1, // 今日新增人数
    "userCount": 50, // 总人数
    "weekNewUserCount": 2 // 本周新增人数
  }
 */
export const getUserInfoIndex = () => {
  return request({
    url: '/user/userStatistics',
    method: 'get'
  })
}
