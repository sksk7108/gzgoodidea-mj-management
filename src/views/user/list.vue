<script setup>
import {ref, reactive, onMounted } from 'vue'
import { getUserList, createUser, updateUser, deleteUser, changeUserStatus, resetUserPassword, assignPowerPoint } from '@/api/user'
import { getAdminPowerPoint } from '@/api/auth.js'
import { UserStatus, UserStatusLabel, UserStatusType, defaultUserForm } from '@/types/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const userRoles = ['门店主', '生产商', '商业自媒体']
const { [UserStatus.DISABLED]: UserStatusDisabled, ...UserStatusOptions } = UserStatusLabel

// 查询参数
const queryParams = reactive({
  username: '',
  mobile: '',
  email: '',
  userStatus: '',
  page: 1,
  pageSize: 10
})

// 表格数据
const tableData = ref([])
const total = ref(0)
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const dialogType = ref('add') // add, edit, view
const dialogLoading = ref(false)
const formRef = ref(null)

// 表单数据
const form = reactive({
  ...defaultUserForm
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' }
  ]
}

// 算力点分配相关
const powerPointDialogVisible = ref(false)
const adminPowerPoint = ref(0)
const powerPointForm = reactive({
  userId: null,
  username: '',
  currentPowerPoint: 0,
  assignAmount: 50
})
const powerPointFormRef = ref(null)
const powerPointRules = {
  assignAmount: [
    { required: true, message: '请输入增加数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '增加数量必须大于0', trigger: 'blur' }
  ]
}
const powerPointLoading = ref(false)

// 获取用户列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getUserList(queryParams)
    tableData.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error('获取用户列表失败', error)
  } finally {
    loading.value = false
  }
}

// 重置查询
const resetQuery = () => {
  Object.assign(queryParams, {
    username: '',
    mobile: '',
    email: '',
    userStatus: '',
    page: 1,
    pageSize: 10
  })
  getList()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  queryParams.page = val
  getList()
}

// 处理每页数量变化
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  queryParams.page = 1
  getList()
}

// 打开新增用户对话框
const handleAdd = () => {
  dialogType.value = 'add'
  dialogTitle.value = '新增用户'
  resetForm()
  dialogVisible.value = true
}

// 打开编辑用户对话框
const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogTitle.value = '编辑用户'
  resetForm()
  // 直接使用当前行数据
  Object.assign(form, JSON.parse(JSON.stringify(row)))
  dialogVisible.value = true
}

// 打开查看用户对话框
const handleDetail = (row) => {
  dialogType.value = 'view'
  dialogTitle.value = '查看用户'
  resetForm()
  // 直接使用当前行数据
  Object.assign(form, JSON.parse(JSON.stringify(row)))
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    dialogLoading.value = true
    try {
      if (dialogType.value === 'add') {
        await createUser(form)
        ElMessage.success('添加成功')
      } else if (dialogType.value === 'edit') {
        await updateUser(form)
        ElMessage.success('更新成功')
      }
      dialogVisible.value = false
      getList()
    } catch (error) {
      console.error('保存用户失败', error)
    } finally {
      dialogLoading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(form, defaultUserForm)
}

// 关闭对话框
const handleDialogClose = () => {
  dialogVisible.value = false
  resetForm()
}

// 删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用户 ${row.username} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除用户失败', error)
    }
  }).catch(() => {})
}

// 重置用户密码
const handleResetPassword = (row) => {
  ElMessageBox.confirm(`确定要重置用户 ${row.username} 的密码吗？密码将被重置为: 88888888`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await resetUserPassword(row.id)
      ElMessage.success('密码重置成功，新密码为: 88888888')
    } catch (error) {
      console.error('重置密码失败', error)
    }
  }).catch(() => {})
}

// 修改用户状态
const handleStatusChange = async (row) => {
  try {
    await changeUserStatus(row.id, row.userStatus)
    ElMessage.success('状态修改成功')
  } catch (error) {
    console.error('修改用户状态失败', error)
    // 恢复状态
    row.userStatus = row.userStatus === UserStatus.NORMAL ? UserStatus.DISABLED : UserStatus.NORMAL
  }
}

// 打开分配算力点对话框
const handleAssignPowerPoint = async (row) => {
  try {
    powerPointDialogVisible.value = true
    powerPointLoading.value = true

    // 设置表单数据
    powerPointForm.userId = row.id
    powerPointForm.username = row.username
    powerPointForm.currentPowerPoint = row.powerPoint || 0
    powerPointForm.assignAmount = 50

    // 获取管理员算力点余额
    const res = await getAdminPowerPoint()
    adminPowerPoint.value = res.data.remain_amount || '未查询到算力点信息'
    
    
  } catch (error) {
    console.error('获取算力点信息失败', error)
    ElMessage.error('获取算力点信息失败')
  } finally {
    powerPointLoading.value = false
  }
}

// 提交算力点分配
const submitPowerPointAssign = async () => {
  if (!powerPointFormRef.value) return
  
  await powerPointFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    // 验证分配数量不能超过管理员余额
    if (powerPointForm.assignAmount > adminPowerPoint.value) {
      ElMessage.warning('增加数量不能超过您的算力点余额')
      return
    }
    
    powerPointLoading.value = true
    try {
      await assignPowerPoint(powerPointForm.userId, powerPointForm.assignAmount)
      ElMessage.success('算力点增加成功')
      powerPointDialogVisible.value = false
      getList() // 刷新列表
    } catch (error) {
      console.error('增加算力点失败', error)
      ElMessage.error('增加算力点失败')
    } finally {
      powerPointLoading.value = false
    }
  })
}

// 关闭算力点分配对话框
const handlePowerPointDialogClose = () => {
  powerPointDialogVisible.value = false
  powerPointForm.userId = null
  powerPointForm.username = ''
  powerPointForm.currentPowerPoint = 0
  powerPointForm.assignAmount = 0
}

// 格式化用户状态
const formatStatus = (row) => {
  return UserStatusLabel[row.userStatus] || '未知'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable />
        </el-form-item>

        <el-form-item label="状态" prop="userStatus" style="width: 150px;">
          <el-select v-model="queryParams.userStatus" placeholder="请选择状态" clearable>
            <el-option
              v-for="(value, key) in UserStatusLabel"
              :key="key"
              :label="value"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 表格区域 -->
    <el-card class="table-card">
      <div class="table-header">
        <div class="title">用户列表</div>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增用户
        </el-button>
      </div>
      
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" align="center" width="60" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="powerPoint" label="算力点" width="100" />
        <el-table-column prop="role" label="角色" width="100" />
        <el-table-column prop="ppv" label="人设定位" width="200" show-overflow-tooltip />
        <el-table-column prop="pfv" label="产品特色" width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="70">
          <template #default="scope">
            <el-switch
              v-model="scope.row.userStatus"
              :active-value="UserStatus.NORMAL"
              :inactive-value="UserStatus.DISABLED"
              @change="() => handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.lastLoginTime) }}
          </template>
        </el-table-column>
        <!-- <el-table-column prop="last_login_ip" label="最后登录IP" width="140" /> -->
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <el-button type="warning" link @click="handleResetPassword(scope.row)">
              <el-icon><Key /></el-icon>重置密码
            </el-button>
            <el-button type="primary" link @click="handleEdit(scope.row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="success" link @click="handleAssignPowerPoint(scope.row)">
              <el-icon><Coin /></el-icon>增加算力
            </el-button>

          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        class="pagination"
        :current-page="queryParams.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryParams.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
    
    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="60%"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="dialogType !== 'view' ? rules : {}"
        label-width="100px"
        v-loading="dialogLoading"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" :disabled="dialogType === 'view'" />
            </el-form-item>
          </el-col>
         
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="form.nickname" placeholder="请输入昵称" :disabled="dialogType === 'view'" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="dialogType !== 'view'">
            <el-form-item label="角色" prop="role">
              <el-select v-model="form.role" placeholder="请选择角色" :disabled="dialogType === 'view'">
                <el-option
                  v-for="(value, key) in userRoles"
                  :key="key"
                  :label="value"
                  :value="value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="userStatus">
              <el-select v-model="form.userStatus" placeholder="请选择状态" :disabled="dialogType === 'view'">
                <el-option
                  v-for="(value, key) in UserStatusOptions"
                  :key="key"
                  :label="value"
                  :value="Number(key)"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="dialogType === 'view'" :span="12">
            <el-form-item label="算力点" prop="powerPoint">
              <el-input-number v-model="form.powerPoint" :min="0" :disabled="dialogType === 'view'" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="人设定位" prop="ppv">
              <el-input v-model="form.ppv" type="textarea" :rows="3" placeholder="请输入人设定位" :disabled="dialogType === 'view'" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="产品特色" prop="pfv">
              <el-input v-model="form.pfv" type="textarea" :rows="3" placeholder="请输入产品特色" :disabled="dialogType === 'view'" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" v-if="dialogType !== 'view'">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 算力点分配对话框 -->
    <el-dialog
      v-model="powerPointDialogVisible"
      title="增加算力"
      width="500px"
      :close-on-click-modal="false"
      @close="handlePowerPointDialogClose"
    >
      <el-form
        ref="powerPointFormRef"
        :model="powerPointForm"
        :rules="powerPointRules"
        label-width="120px"
      >
        <el-alert
          type="info"
          :closable="false"
          show-icon
        >
          <template #title>
            您当前可分配的总算力: <strong v-if="!powerPointLoading">{{ adminPowerPoint }}</strong>
            <strong v-else>查询中...</strong>
          </template>
        </el-alert>
        
        <el-form-item label="用户名" prop="username" class="mt-20">
          <el-input v-model="powerPointForm.username" disabled />
        </el-form-item>
        
        <el-form-item label="用户算力" prop="currentPowerPoint">
          <el-input v-model="powerPointForm.currentPowerPoint" disabled />
        </el-form-item>
        
        <el-form-item label="增加算力" prop="assignAmount">
          <el-input-number
            v-model="powerPointForm.assignAmount"
            :min="1"
            :step="50"
            step-strictly
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="powerPointDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPowerPointAssign" :disabled="powerPointForm.assignAmount <= 0 || powerPointForm.assignAmount > adminPowerPoint">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.app-container {
  .search-card {
    margin-bottom: 20px;
  }
  
  .table-card {

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      .title {
        font-size: 18px;
        font-weight: 600;
      }
    }
    
    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}

.mt-20 {
  margin-top: 20px;
}

:deep(.el-tooltip){
  max-width: 300px !important;
}
</style> 