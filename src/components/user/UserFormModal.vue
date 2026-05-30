<template>
  <!--
    用户表单弹窗组件
    ================
    设计要点：
    1. v-if 条件渲染控制弹窗显示/隐藏
    2. v-model 双向绑定表单字段
    3. 支持"新增"和"编辑"两种模式，通过 props 区分
    4. 通过 emit 向父组件提交表单数据
    5. Teleport 将弹窗渲染到 body，避免样式污染
    6. 表单验证（简单校验）
  -->
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <!-- 头部 -->
        <div class="modal-header">
          <h3>{{ isEdit ? '✏️ 编辑用户' : '➕ 新增用户' }}</h3>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>

        <!-- 表单体 -->
        <form class="modal-body" @submit.prevent="handleSubmit">
          <!-- v-for 渲染表单项，减少重复代码 -->
          <div v-for="field in fields" :key="field.key" class="form-item">
            <label :for="field.key">{{ field.label }}</label>

            <!-- 普通输入框 -->
            <input
              v-if="field.type === 'text' || field.type === 'email'"
              :id="field.key"
              v-model="form[field.key]"
              :type="field.type"
              :placeholder="field.placeholder"
              class="form-input"
              :class="{ 'form-input--error': errors[field.key] }"
            />

            <!-- 下拉选择 -->
            <select
              v-else-if="field.type === 'select'"
              :id="field.key"
              v-model="form[field.key]"
              class="form-input"
            >
              <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>

            <!-- 错误提示 — 条件渲染 -->
            <span v-if="errors[field.key]" class="field-error">
              {{ errors[field.key] }}
            </span>
          </div>

          <!-- 底部按钮 -->
          <div class="modal-footer">
            <button type="button" class="btn btn--cancel" @click="$emit('close')">
              取消
            </button>
            <button type="submit" class="btn" :disabled="submitting">
              {{ submitting ? '提交中...' : (isEdit ? '保存修改' : '确认新增') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
/**
 * 组件通信设计：
 *   Props (父→子):  visible, editUser
 *   Emit  (子→父):  close, submit
 *
 * 双向绑定：
 *   表单字段通过 v-model 实现数据和视图的双向同步
 */
import { ref, reactive, watch } from 'vue'

// ============================================
// Props
// ============================================
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  editUser: {
    type: Object,
    default: null
  }
})

// ============================================
// Emits
// ============================================
const emit = defineEmits(['close', 'submit'])

// 是否为编辑模式
const isEdit = ref(false)

// 表单数据（响应式对象）
const form = reactive({
  name: '',
  username: '',
  email: '',
  phone: '',
  website: '',
  status: 'active'
})

// 表单验证错误
const errors = reactive({})
const submitting = ref(false)

// 表单字段配置（驱动 v-for 渲染）
const fields = [
  { key: 'name',     label: '姓名',   type: 'text',  placeholder: '请输入姓名' },
  { key: 'username', label: '用户名', type: 'text',  placeholder: '请输入用户名' },
  { key: 'email',    label: '邮箱',   type: 'email', placeholder: '请输入邮箱' },
  { key: 'phone',    label: '电话',   type: 'text',  placeholder: '请输入电话' },
  { key: 'website',  label: '网站',   type: 'text',  placeholder: '请输入网站' },
  {
    key: 'status', label: '状态', type: 'select',
    options: [
      { label: '正常',   value: 'active' },
      { label: '禁用',   value: 'inactive' },
      { label: '待审核', value: 'pending' }
    ]
  }
]

/**
 * 监听 editUser 变化：
 *   如果传入了用户对象 → 编辑模式（填充表单）
 *   否则 → 新增模式（重置表单）
 */
watch(() => props.editUser, (user) => {
  if (user) {
    isEdit.value = true
    form.name = user.name || ''
    form.username = user.username || ''
    form.email = user.email || ''
    form.phone = user.phone || ''
    form.website = user.website || ''
    form.status = 'active'
  }
}, { immediate: true })

// 监听 visible，关闭时重置表单
watch(() => props.visible, (val) => {
  if (!val) {
    resetForm()
  }
})

// 简单表单验证
function validate() {
  // 清空错误
  Object.keys(errors).forEach(k => delete errors[k])
  let valid = true

  if (!form.name.trim()) {
    errors.name = '姓名不能为空'
    valid = false
  }
  if (!form.username.trim()) {
    errors.username = '用户名不能为空'
    valid = false
  }
  if (!form.email.trim()) {
    errors.email = '邮箱不能为空'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '邮箱格式不正确'
    valid = false
  }

  return valid
}

// 提交表单
async function handleSubmit() {
  if (!validate()) return

  submitting.value = true
  try {
    // 通过 emit 将表单数据传递给父组件处理
    emit('submit', { ...form })
  } finally {
    submitting.value = false
  }
}

// 重置表单
function resetForm() {
  isEdit.value = false
  form.name = ''
  form.username = ''
  form.email = ''
  form.phone = ''
  form.website = ''
  form.status = 'active'
  Object.keys(errors).forEach(k => delete errors[k])
}
</script>

<style scoped>
/* 遮罩层 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 弹窗内容 */
.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px 8px;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f0f2f5;
}

.modal-body {
  padding: 24px;
}

.form-item {
  margin-bottom: 18px;
}

.form-item label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text-regular);
}

.form-input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.form-input--error {
  border-color: var(--color-danger);
}

.field-error {
  display: block;
  font-size: 12px;
  color: var(--color-danger);
  margin-top: 4px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
}

.btn--cancel {
  background: #f0f2f5;
  color: var(--text-regular);
  border-color: var(--border-color);
}

.btn--cancel:hover {
  background: #e5e7eb;
}
</style>
