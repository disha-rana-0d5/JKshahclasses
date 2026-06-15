const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');
const ProductSubCategory = require('../models/ProductSubCategory');
const ProductAttribute = require('../models/ProductAttribute');
const ProductAttributeValue = require('../models/ProductAttributeValue');
const ProductFaculty = require('../models/ProductFaculty');
const paginate = require('../utils/paginate');

// --- PRODUCT CATEGORY ---
exports.getProductCategories = async (req, res) => {
    try {
        const categories = await ProductCategory.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addProductCategory = async (req, res) => {
    try {
        const category = await ProductCategory.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateProductCategory = async (req, res) => {
    try {
        const category = await ProductCategory.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

        Object.keys(req.body).forEach(key => {
            category[key] = req.body[key];
        });
        await category.save();

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteProductCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        // Check if any subcategories are linked to this category
        const subCategoryCount = await ProductSubCategory.countDocuments({ category: categoryId });
        if (subCategoryCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category: It has ${subCategoryCount} linked sub-categories. Please delete them first.`
            });
        }

        // Check if any products are linked to this category
        const productCount = await Product.countDocuments({ category: categoryId });
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category: It is used by ${productCount} products.`
            });
        }

        await ProductCategory.findByIdAndDelete(categoryId);
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// --- PRODUCT SUB-CATEGORY ---
exports.getProductSubCategories = async (req, res) => {
    try {
        const subcategories = await ProductSubCategory.find({ category: req.query.category }).sort({ name: 1 });
        res.status(200).json({ success: true, data: subcategories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addProductSubCategory = async (req, res) => {
    try {
        const subcategory = await ProductSubCategory.create(req.body);
        res.status(201).json({ success: true, data: subcategory });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteProductSubCategory = async (req, res) => {
    try {
        const subCategoryId = req.params.id;

        // Check if any attributes are linked to this subcategory
        const attributeCount = await ProductAttribute.countDocuments({ subcategory: subCategoryId });
        if (attributeCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete sub-category: It has ${attributeCount} linked attributes.`
            });
        }

        // Check if any products are linked to this subcategory
        const productCount = await Product.countDocuments({ subcategory: subCategoryId });
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete sub-category: It is used by ${productCount} products.`
            });
        }

        await ProductSubCategory.findByIdAndDelete(subCategoryId);
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateProductSubCategory = async (req, res) => {
    try {
        const subcategory = await ProductSubCategory.findById(req.params.id);
        if (!subcategory) return res.status(404).json({ success: false, message: 'Sub-category not found' });

        Object.keys(req.body).forEach(key => {
            subcategory[key] = req.body[key];
        });
        await subcategory.save();

        res.status(200).json({ success: true, data: subcategory });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// --- PRODUCT ATTRIBUTE ---
exports.getProductAttributes = async (req, res) => {
    try {
        const query = {
            $or: [
                { isGlobal: true }
            ]
        };

        if (req.query.product) {
            query.$or.push({ product: req.query.product });
        }

        const attributes = await ProductAttribute.find(query).sort({ sequence: 1, name: 1 });
        res.status(200).json({ success: true, data: attributes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addProductAttribute = async (req, res) => {
    try {
        const { name, subcategory, product, sequence, isGlobal } = req.body;
        const attribute = await ProductAttribute.create({ name, subcategory, product, sequence, isGlobal });
        res.status(201).json({ success: true, data: attribute });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteProductAttribute = async (req, res) => {
    try {
        const attributeId = req.params.id;

        // Check if any products are using this attribute in their configuration
        const productCount = await Product.countDocuments({
            'attributesConfig.attribute': attributeId
        });

        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete attribute: It is used in ${productCount} products.`
            });
        }

        // Delete all values associated with this attribute first
        await ProductAttributeValue.deleteMany({ attribute: attributeId });

        await ProductAttribute.findByIdAndDelete(attributeId);
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateProductAttribute = async (req, res) => {
    try {
        const attribute = await ProductAttribute.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: attribute });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// --- PRODUCT ATTRIBUTE VALUE ---
exports.getProductAttributeValues = async (req, res) => {
    try {
        const values = await ProductAttributeValue.find({ attribute: req.query.attribute }).sort({ value: 1 });
        res.status(200).json({ success: true, data: values });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addProductAttributeValue = async (req, res) => {
    try {
        const { value, attribute, amount, quantity } = req.body;
        const attrValue = await ProductAttributeValue.create({
            value,
            attribute,
            amount: amount || 0,
            quantity: quantity || 0
        });
        res.status(201).json({ success: true, data: attrValue });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteProductAttributeValue = async (req, res) => {
    try {
        await ProductAttributeValue.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateProductAttributeValue = async (req, res) => {
    try {
        const value = await ProductAttributeValue.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: value });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// --- PRODUCT FACULTY ---
exports.getProductFaculties = async (req, res) => {
    try {
        const faculties = await ProductFaculty.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: faculties });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addProductFaculty = async (req, res) => {
    try {
        const faculty = await ProductFaculty.create(req.body);
        res.status(201).json({ success: true, data: faculty });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateProductFaculty = async (req, res) => {
    try {
        const faculty = await ProductFaculty.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });
        res.status(200).json({ success: true, data: faculty });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteProductFaculty = async (req, res) => {
    try {
        const facultyId = req.params.id;

        // Check if any products are linked to this faculty
        const productCount = await Product.countDocuments({ faculty: facultyId });
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete faculty: They are assigned to ${productCount} products.`
            });
        }

        await ProductFaculty.findByIdAndDelete(facultyId);
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// --- PRODUCT FILTER OPTIONS (Used for Books and Test Series sidebars) ---
exports.getProductFilterOptions = async (req, res) => {
    try {
        const type = req.query.type || 'book';
        let productQuery = {};

        if (type === 'book') {
            productQuery = { $or: [{ type: 'book' }, { type: { $exists: false } }, { type: null }] };
        } else {
            productQuery = { type };
        }

        // Get distinct category IDs for this type of products
        const categoryIds = await Product.distinct('category', productQuery);
        const categories = await ProductCategory.find({ _id: { $in: categoryIds.filter(id => id != null) } }).sort({ name: 1 });

        // Get distinct subcategory IDs
        const subcategoryIds = await Product.distinct('subcategory', productQuery);
        const subcategories = await ProductSubCategory.find({ _id: { $in: subcategoryIds.filter(id => id != null) } }).sort({ name: 1 });

        // Get distinct faculty IDs (mapped to Publisher/Faculty)
        const facultyIds = await Product.distinct('faculty', productQuery);
        const faculties = await ProductFaculty.find({ _id: { $in: facultyIds.filter(id => id != null) } }).sort({ name: 1 });

        // Get distinct years
        const years = await Product.distinct('year', productQuery);
        const filteredYears = years.filter(y => y != null).sort((a, b) => b - a);

        res.status(200).json({
            success: true,
            data: {
                categories,
                subcategories,
                publishers: faculties,
                years: filteredYears
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- PRODUCT (BOOKS & TEST SERIES) ---
exports.getProducts = async (req, res) => {
    try {
        const andConditions = [];

        // Type filter
        if (req.query.type) {
            if (req.query.type === 'book') {
                andConditions.push({ $or: [{ type: 'book' }, { type: { $exists: false } }, { type: null }] });
            } else {
                andConditions.push({ type: req.query.type });
            }
        }

        // Category filter (multi-value)
        if (req.query.category) {
            const categories = Array.isArray(req.query.category) ? req.query.category : req.query.category.split(',').filter(Boolean);
            if (categories.length > 0) andConditions.push({ category: { $in: categories } });
        }

        // Subcategory filter (multi-value)
        if (req.query.subcategory) {
            const subcategories = Array.isArray(req.query.subcategory) ? req.query.subcategory : req.query.subcategory.split(',').filter(Boolean);
            if (subcategories.length > 0) andConditions.push({ subcategory: { $in: subcategories } });
        }

        // Publisher filter (via faculty field, multi-value)
        if (req.query.publisher) {
            const publishers = Array.isArray(req.query.publisher) ? req.query.publisher : req.query.publisher.split(',').filter(Boolean);
            if (publishers.length > 0) andConditions.push({ faculty: { $in: publishers } });
        }

        // Year filter (multi-value)
        if (req.query.year) {
            const years = Array.isArray(req.query.year)
                ? req.query.year.map(y => parseInt(y, 10))
                : req.query.year.split(',').map(y => parseInt(y, 10)).filter(y => !isNaN(y));
            if (years.length > 0) andConditions.push({ year: { $in: years } });
        }

        const baseQuery = andConditions.length > 0 ? { $and: andConditions } : {};

        const paginatedResults = await paginate(Product, req.query, {
            baseQuery,
            populate: [
                'category',
                'subcategory',
                'faculty',
                { path: 'attributesConfig.attribute' },
                { path: 'attributesConfig.values' }
            ],
            searchFields: ['title']
        });

        res.status(200).json({ success: true, ...paginatedResults });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        let product;

        // Check if ID is a valid MongoDB ObjectId
        const populateOptions = [
            'category',
            'subcategory',
            'faculty',
            { path: 'attributesConfig.attribute' },
            { path: 'attributesConfig.values' }
        ];

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findById(id).populate(populateOptions);
        } else {
            // Otherwise, treat it as a slug
            product = await Product.findOne({ slug: id }).populate(populateOptions);
        }

        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        // If title is updated, we need to handle slug regeneration. 
        // findByIdAndUpdate doesn't trigger 'save' middleware, so we do it manually or use a slightly different approach
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        // Update fields
        Object.keys(req.body).forEach(key => {
            product[key] = req.body[key];
        });

        // Save will trigger the 'pre-save' hook for slug generation
        await product.save();

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
