// Template fallback exports - replace with actual implementation when needed
export const getPage = () => null;
export const getPages = () => [];
export const pageTree = [];
export const blog = {
  getPage: () => null,
  getPages: () => []
};
export const getBlogPage = () => null;
export const getBlogPages = () => [];

// Default exports for compatibility
export default {
  getPage,
  getPages,
  pageTree,
  blog,
  getBlogPage,
  getBlogPages
};
