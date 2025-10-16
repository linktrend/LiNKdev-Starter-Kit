// Temporary fallback to prevent build errors
// TODO: Implement proper fumadocs integration

export const blog = {
  getPage: (slug: any) => null,
  getPages: () => []
};

export const getPage = (slug: any) => null;
export const getPages = () => [];

const source = { blog, docs: { getPage, getPages } };
export default source;