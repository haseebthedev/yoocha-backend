// Helper function to transform the pagination response
export const apiOk = (response: any) => {
  return {
    result: {
      messages: response.docs,
      pagination: {
        page: response.page,
        perPage: response.limit,
        totalDocs: response.totalDocs,
        totalPages: response.totalPages,
        hasPrevPage: response.hasPrevPage,
        hasNextPage: response.hasNextPage,
      },
    },
  };
};
