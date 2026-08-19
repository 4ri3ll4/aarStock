// lib/devAuth.ts
// TEMPORARY - Only for development!

export const DEV_USER = {
  id: 'dev-user-id',
  username: 'devadmin',
  role: 'admin',
  isSuperAdmin: true,
  companyId: null,
  companyName: 'aarStock',
  companySubdomain: 'aarstock',
}

// This replaces checkUserAuth during development
export async function checkUserAuth(): Promise<typeof DEV_USER> {
  return DEV_USER
}