import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'm-abbaslab-jwt-secret-2026-change-in-production'
)

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createAdminToken(username: string, role: string = 'admin'): Promise<string> {
  return new SignJWT({ user: username, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .setIssuer('m-abbaslab')
    .setAudience('admin')
    .sign(JWT_SECRET)
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'm-abbaslab',
      audience: 'admin',
    })
    return payload
  } catch {
    return null
  }
}

export async function authenticateAdmin(username: string, password: string) {
  const { data: user, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('username', username)
    .eq('is_active', true)
    .single()

  if (error || !user) return { error: 'Invalid credentials' }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    // Log failed attempt
    await supabase.from('security_events').insert({
      event_type: 'failed_login',
      username,
      details: { reason: 'invalid_password' },
      severity: 'warning',
    })
    return { error: 'Invalid credentials' }
  }

  // Update last login
  await supabase.from('admin_users').update({
    last_login: new Date().toISOString(),
    login_count: (user.login_count || 0) + 1,
  }).eq('id', user.id)

  // Log successful login
  await supabase.from('security_events').insert({
    event_type: 'successful_login',
    user_id: user.id,
    username,
    severity: 'info',
  })

  const token = await createAdminToken(username, user.role)
  return { token, user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name } }
}

export async function getAdminFromToken(token: string) {
  const payload = await verifyAdminToken(token)
  if (!payload || !payload.user) return null

  const { data } = await supabase
    .from('admin_users')
    .select('id, username, email, full_name, role, is_active')
    .eq('username', payload.user as string)
    .eq('is_active', true)
    .single()

  return data
}
