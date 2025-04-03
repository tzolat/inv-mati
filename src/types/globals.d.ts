export {}

// Create a type for the roles
export type Roles = 'admin' | 'member' | 'org:admin'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    },
    publicMetadata: {
      role?: Roles
    }
  }
}