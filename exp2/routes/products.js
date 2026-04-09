const express = require('express');
const router = express.Router();

let products = [
  { id: 1, name: 'iPhone 15', price: 7999, category: '手机' },
  { id: 2, name: 'MacBook Pro', price: 12999, category: '电脑' },
  { id: 3, name: 'AirPods Pro', price: 1999, category: '配件' }
];

router.get('/', (req, res) => {
  const { category, minPrice, maxPrice } = req.query;
  let result = products;
  
  if (category) {
    result = result.filter(p => p.category === category);
  }
  if (minPrice) {
    result = result.filter(p => p.price >= parseInt(minPrice));
  }
  if (maxPrice) {
    result = result.filter(p => p.price <= parseInt(maxPrice));
  }
  
  res.json({ success: true, data: result, count: result.length });
});

router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ success: false, message: '产品不存在' });
  }
  res.json({ success: true, data: product });
});

router.post('/', (req, res) => {
  const { name, price, category } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ 
      success: false, 
      message: '产品名称、价格和分类不能为空' 
    });
  }
  
  const newProduct = {
    id: products.length + 1,
    name,
    price: parseFloat(price),
    category
  };
  products.push(newProduct);
  
  res.status(201).json({ success: true, data: newProduct, message: '产品创建成功' });
});

router.put('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ success: false, message: '产品不存在' });
  }
  
  const { name, price, category } = req.body;
  if (name) product.name = name;
  if (price) product.price = parseFloat(price);
  if (category) product.category = category;
  
  res.json({ success: true, data: product, message: '产品更新成功' });
});

router.delete('/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: '产品不存在' });
  }
  
  const deletedProduct = products.splice(productIndex, 1)[0];
  res.json({ success: true, data: deletedProduct, message: '产品删除成功' });
});

module.exports = router;