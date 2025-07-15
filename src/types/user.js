/**
 * 用户状态枚举
 * @enum {number}
 */
export const UserStatus = {
  DISABLED: 0,
  NORMAL: 1,
  LOCKED: 2
}

/**
 * 用户状态标签
 * @type {Object}
 */
export const UserStatusLabel = {
  [UserStatus.DISABLED]: '禁用',
  [UserStatus.NORMAL]: '正常',
  [UserStatus.LOCKED]: '锁定'
}

/**
 * 用户状态类型
 * @type {Object}
 */
export const UserStatusType = {
  [UserStatus.DISABLED]: 'danger',
  [UserStatus.NORMAL]: 'success',
  [UserStatus.LOCKED]: 'warning'
}

/**
 * 用户表单默认值
 * @type {Object}
 */
export const defaultUserForm = {
  id: null,
  mobile: '',
  email: '',
  username: '',
  password: '',
  user_status: UserStatus.NORMAL,
  nickname: '',
  avatar: '',
  role: '',
  ppv: '',
  pfv: '',
  special_array: '',
  power_point: 0
} 