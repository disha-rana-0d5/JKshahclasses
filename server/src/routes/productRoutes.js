const express = require('express');
const router = express.Router();
const productController = require('../controllers/productManagementController');
// const { protect, authorize } = require('../middleware/auth'); // If middleware exists

// Note: In some systems 'protect' and 'authorize' might be needed. 
// For now, I'll follow the pattern visible in other routes.

router.route('/categories')
    .get(productController.getProductCategories)
    .post(productController.addProductCategory);

router.route('/categories/:id')
    .put(productController.updateProductCategory)
    .delete(productController.deleteProductCategory);

router.route('/subcategories')
    .get(productController.getProductSubCategories)
    .post(productController.addProductSubCategory);

router.route('/subcategories/:id')
    .put(productController.updateProductSubCategory)
    .delete(productController.deleteProductSubCategory);

router.route('/attributes')
    .get(productController.getProductAttributes)
    .post(productController.addProductAttribute);

router.route('/attributes/:id')
    .put(productController.updateProductAttribute)
    .delete(productController.deleteProductAttribute);

router.route('/attribute-values')
    .get(productController.getProductAttributeValues)
    .post(productController.addProductAttributeValue);

router.route('/attribute-values/:id')
    .put(productController.updateProductAttributeValue)
    .delete(productController.deleteProductAttributeValue);

router.route('/faculties')
    .get(productController.getProductFaculties)
    .post(productController.addProductFaculty);

router.route('/faculties/:id')
    .put(productController.updateProductFaculty)
    .delete(productController.deleteProductFaculty);

router.route('/product-filters')
    .get(productController.getProductFilterOptions);

router.route('/')
    .get(productController.getProducts)
    .post(productController.addProduct);

router.route('/:id')
    .get(productController.getProductById)
    .put(productController.updateProduct)
    .delete(productController.deleteProduct);

module.exports = router;
