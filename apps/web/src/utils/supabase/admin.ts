export const isAdmin = (_userId?: string) => false;

export async function createOrRetrieveCustomer(userId: string, email: string): Promise<{ id: string; error?: any }> {
  // Implementation for creating or retrieving customer
  return { id: 'cus_test', error: null };
}

export default isAdmin;
