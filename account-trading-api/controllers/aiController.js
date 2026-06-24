/**
 * AI 估价控制器
 * 调用 DeepSeek API 根据账号描述估算合理价格
 */
const axios = require('axios');
const { success, error } = require('../utils/response');

// DeepSeek API 配置（免费，注册即用）
const DEEPSEEK_BASE = 'https://api.deepseek.com';
const API_KEY = process.env.DEEPSEEK_API_KEY || process.env.AI_KEY || '';

exports.valuate = async (req, res, next) => {
  try {
    const { category, title, description } = req.body;

    if (!category && !title && !description) {
      return error(res, '请提供游戏分类、标题或描述信息');
    }

    if (!API_KEY) {
      // 无 API Key 时返回模拟估价（基于简单规则）
      return error(res, '请设置环境变量 DEEPSEEK_API_KEY。免费获取：https://platform.deepseek.com');
    }

    const prompt = `你是一个游戏账号估价专家。请根据以下信息估算这个游戏账号的人民币价格。

游戏分类：${category || '未知'}
账号标题：${title || '无'}
账号描述：${description || '无'}

请分析并返回：
1. 估价范围（如 200-350 元）
2. 估价理由（3点要点，每点不超过15字）

请直接输出，格式如下：
价格范围：xxx-xxx 元
理由：
· xxx
· xxx
· xxx`;

    const aiRes = await axios.post(`${DEEPSEEK_BASE}/v1/chat/completions`, {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个游戏账号交易平台的估价助手。回复简洁专业。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const reply = aiRes.data.choices[0].message.content;
    success(res, { analysis: reply, price: extractPrice(reply) });

  } catch (err) {
    if (err.response) {
      console.error('[AI] DeepSeek API 错误:', err.response.status, err.response.data);
      return error(res, `AI 服务错误: ${err.response.status} — ${JSON.stringify(err.response.data)}`);
    }
    if (err.code === 'ECONNABORTED') {
      return error(res, 'AI 服务响应超时，请重试');
    }
    console.error('[AI] 请求失败:', err.message);
    error(res, '估价服务暂不可用：' + err.message);
  }
};

// 从 AI 回复中提取价格数字
function extractPrice(text) {
  // 匹配 "价格范围：200-350 元" 或 "估价：500元"
  const rangeMatch = text.match(/(\d+)\s*[-–—~至]\s*(\d+)\s*元/);
  if (rangeMatch) {
    const low = parseInt(rangeMatch[1]);
    const high = parseInt(rangeMatch[2]);
    return Math.round((low + high) / 2); // 取中间值
  }
  const singleMatch = text.match(/(\d+)\s*元/);
  if (singleMatch) return parseInt(singleMatch[1]);
  return null;
}
