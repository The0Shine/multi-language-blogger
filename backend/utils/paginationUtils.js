const paginationUtils = {
  getPaginationParams: (query) => {
    const page = Math.max(1, Number.parseInt(query.page) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(query.limit) || 10)
    );
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  },

  getPaginationMeta: (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
    };
  },

  buildPaginatedResponse: (data, total, page, limit) => {
    return {
      items: data,
      pagination: paginationUtils.getPaginationMeta(total, page, limit),
    };
  },
};

module.exports = paginationUtils;
