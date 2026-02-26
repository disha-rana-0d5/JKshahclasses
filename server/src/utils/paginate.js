const paginate = async (model, query, options = {}) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Start with baseQuery if provided, or empty object
    let queryObj = options.baseQuery ? { ...options.baseQuery } : {};

    // Search logic (regex search on multiple fields if specified in options)
    if (query.search && options.searchFields) {
        queryObj.$or = options.searchFields.map(field => ({
            [field]: { $regex: query.search, $options: 'i' }
        }));
    }

    // Exact match filters
    if (query.filter) {
        try {
            const filters = typeof query.filter === 'string' ? JSON.parse(query.filter) : query.filter;
            Object.keys(filters).forEach(key => {
                if (filters[key] !== 'All' && filters[key] !== '') {
                    // Check if filter key already exists (e.g. from baseQuery)
                    // If so, we might need to handle it carefully, but for now simple overwrite 
                    // or $and might be needed for complex cases. 
                    // For this app, usually filters are distinct from baseQuery status.
                    queryObj[key] = filters[key];
                }
            });
        } catch (error) {
            console.error('Error parsing pagination filter:', error);
        }
    }

    const total = await model.countDocuments(queryObj);

    let executeQuery = model.find(queryObj);

    // Select fields
    if (options.select) {
        executeQuery = executeQuery.select(options.select);
    }

    // Populate
    if (options.populate) {
        executeQuery = executeQuery.populate(options.populate);
    }

    // Sort
    if (options.sort || query.sort) {
        const sortBy = query.sort || options.sort || '-createdAt';
        executeQuery = executeQuery.sort(sortBy);
    } else {
        executeQuery = executeQuery.sort('-createdAt');
    }

    // Pagination
    const results = await executeQuery.skip(startIndex).limit(limit);

    // Pagination metadata
    const pagination = {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
    };

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    return {
        success: true,
        count: results.length,
        pagination,
        data: results
    };
};

module.exports = paginate;
