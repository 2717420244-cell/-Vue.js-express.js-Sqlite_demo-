<template>
  <div class="publish-page">
    <div class="back-link" @click="$router.push('/trade/items')">← 返回商城</div>

    <div class="card publish-card">
      <h2 class="page-title">{{ isEdit ? '✏️ 编辑商品' : '➕ 发布账号' }}</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-item">
          <label>游戏分类 <span class="required">*</span></label>
          <input v-model="form.category" type="text" placeholder="如：王者荣耀、原神、和平精英" class="form-input" />
        </div>
        <div class="form-item">
          <label>商品标题 <span class="required">*</span></label>
          <input v-model="form.title" type="text" placeholder="如：王者荣耀 V10 全皮肤账号" class="form-input" />
        </div>
        <div class="form-item">
          <label>价格（元）<span class="required">*</span></label>
          <div class="price-row">
            <input v-model.number="form.price" type="number" placeholder="请输入价格" class="form-input" min="1" />
            <button type="button" class="btn btn--ai" @click="handleAI" :disabled="aiLoading">
              {{ aiLoading ? '⠋ AI分析中...' : '🤖 AI估价' }}
            </button>
          </div>
          <!-- AI 估价结果 -->
          <div v-if="aiResult" class="ai-result">
            <div class="ai-price" v-if="aiResult.price">💰 建议价格：<strong>¥{{ aiResult.price }}</strong></div>
            <pre class="ai-text">{{ aiResult.analysis }}</pre>
            <button type="button" class="btn btn--sm" @click="applyPrice" v-if="aiResult.price">应用此价格</button>
          </div>
        </div>
        <div class="form-item">
          <label>商品描述</label>
          <textarea v-model="form.description" rows="5" placeholder="描述你的账号信息：等级、英雄/角色、皮肤/装备等..." class="form-input form-textarea"></textarea>
        </div>
        <div class="form-item">
          <label>图片链接（多个用逗号分隔）</label>
          <input v-model="form.images" type="text" placeholder="http://xxx.jpg, http://yyy.png" class="form-input" />
        </div>

        <span v-if="errMsg" class="field-error" style="display:block;margin-bottom:12px;">{{ errMsg }}</span>

        <div class="form-actions">
          <button type="button" class="btn btn--cancel" @click="$router.push('/trade/items')">取消</button>
          <button type="submit" class="btn" :disabled="submitting">
            {{ submitting ? '提交中...' : (isEdit ? '保存修改' : '发布商品') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createItem, updateItem, getItemById, aiValuate } from '@/api/trade'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const editId = ref(null)
const submitting = ref(false)
const errMsg = ref('')

// AI 估价
const aiLoading = ref(false)
const aiResult = ref(null)

async function handleAI() {
  if (!form.category && !form.title && !form.description) {
    return alert('请先填写游戏分类、标题或描述')
  }
  aiLoading.value = true
  aiResult.value = null
  try {
    const res = await aiValuate({
      category: form.category,
      title: form.title,
      description: form.description
    })
    aiResult.value = res.data
  } catch (e) {
    alert(e.message || 'AI 不可用，请手动输入价格')
  } finally {
    aiLoading.value = false
  }
}

function applyPrice() {
  if (aiResult.value?.price) {
    form.price = aiResult.value.price
    aiResult.value = null
  }
}

const form = reactive({
  title: '', category: '', price: '', description: '', images: ''
})

async function loadEditItem() {
  const id = route.query.id
  if (!id) return
  try {
    const res = await getItemById(id)
    const d = res.data
    isEdit.value = true
    editId.value = d.item_id
    form.title = d.title
    form.category = d.category
    form.price = d.price
    form.description = d.description || ''
    form.images = d.images || ''
  } catch (e) {
    errMsg.value = e.message
  }
}

async function handleSubmit() {
  errMsg.value = ''
  if (!form.title || !form.category || !form.price) {
    errMsg.value = '请填写分类、标题和价格'
    return
  }
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateItem(editId.value, { ...form, price: Number(form.price) })
      alert('修改成功！')
    } else {
      await createItem({ ...form, price: Number(form.price) })
      alert('发布成功！等待审核。')
    }
    router.push('/trade/items')
  } catch (e) {
    errMsg.value = e.message
  } finally {
    submitting.value = false
  }
}

onMounted(() => loadEditItem())
</script>

<style scoped>
.publish-page { max-width: 700px; }
.back-link { color: var(--color-primary); cursor: pointer; font-size: 14px; margin-bottom: 16px; display: inline-block; }
.back-link:hover { text-decoration: underline; }
.publish-card { padding: 28px; }
.page-title { font-size: 20px; margin-bottom: 24px; }
.form-item { margin-bottom: 18px; }
.form-item label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
.required { color: var(--color-danger); }
.form-input { width: 100%; padding: 9px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; outline: none; }
.form-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(64,158,255,0.1); }
.form-textarea { resize: vertical; font-family: inherit; }
.field-error { font-size: 12px; color: var(--color-danger); }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px; }
.btn--cancel { background: #f0f2f5; color: var(--text-regular); border-color: var(--border-color); }
.btn--cancel:hover { background: #e5e7eb; }

.price-row { display: flex; gap: 10px; }
.price-row .form-input { flex: 1; }
.btn--ai { background: linear-gradient(135deg, #6366f1, #8b5cf6); white-space: nowrap; font-size: 13px; }
.btn--ai:hover { background: linear-gradient(135deg, #818cf8, #a78bfa); }
.btn--ai:disabled { opacity: 0.6; cursor: default; }
.ai-result { margin-top: 12px; padding: 14px; background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; }
.ai-price { font-size: 15px; margin-bottom: 8px; }
.ai-price strong { color: #7c3aed; font-size: 18px; }
.ai-text { margin: 0; padding: 0; font-size: 13px; color: var(--text-regular); white-space: pre-wrap; line-height: 1.7; background: none; font-family: inherit; }
</style>
