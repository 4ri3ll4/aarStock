import { DEV_USER } from './devAuth'

export async function checkUserAuth() {
  // TEMPORARY: Return dev user
  return DEV_USER
}