/**
 * Pagination utility
 * Handles pagination logic separately from routes and controllers
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Parse and validate pagination parameters from query string
 */
const parsePagination = (query) => {
    let page = parseInt(query.page) || DEFAULT_PAGE;
    let limit = parseInt(query.limit) || DEFAULT_LIMIT;

    if (page < 1) page = DEFAULT_PAGE;
    if (limit < 1) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    const offset = (page - 1) * limit;

    return { page, limit, offset };
};

/**
 * Build pagination metadata from results
 */
const buildPaginationMeta = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
    };
};

/**
 * Build a paginated response object
 */
const paginatedResponse = (data, total, page, limit) => {
    return {
        data,
        pagination: buildPaginationMeta(total, page, limit),
    };
};

/**
 * Build Sequelize query options for pagination
 */
const sequelizePagination = (query) => {
    const { page, limit, offset } = parsePagination(query);
    return { page, limit, offset, sequelizeOptions: { limit, offset } };
};

module.exports = {
    parsePagination,
    buildPaginationMeta,
    paginatedResponse,
    sequelizePagination,
};