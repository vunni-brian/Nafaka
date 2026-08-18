import { withSupabase } from 'npm:@supabase/server'

export default {
  fetch: withSupabase({ auth: 'user' }, async (_req, ctx) => {
    const userId = ctx.userClaims?.id
    if (!userId) {
      return Response.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { error: stateError } = await ctx.supabaseAdmin
      .from('finance_states')
      .delete()
      .eq('user_id', userId)
    if (stateError) {
      return Response.json({ error: 'delete_failed' }, { status: 500 })
    }

    const { error: authError } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId)
    if (authError && authError.status !== 404) {
      return Response.json({ error: 'auth_delete_failed' }, { status: 500 })
    }

    return Response.json({ deleted: true })
  }),
}