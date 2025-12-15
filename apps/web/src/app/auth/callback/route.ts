import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { logUsage } from '@/lib/usage/server';
import { parseAuthError } from '@/lib/auth/errors';

export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the `@supabase/ssr` package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type'); // 'recovery' for password reset
  const error = requestUrl.searchParams.get('error');
  const error_code = requestUrl.searchParams.get('error_code');
  const error_description = requestUrl.searchParams.get('error_description');
  
  // Handle OAuth errors from provider
  if (error || error_description) {
    const errorObj = {
      code: error_code,
      error: error,
      message: error_description || error,
    };
    
    const parsedError = parseAuthError(errorObj);
    
    // Log error for monitoring
    console.error('OAuth callback error:', {
      error,
      error_code,
      error_description,
      type: parsedError.type,
    });
    
    // Redirect with user-friendly error message
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(parsedError.message)}&error_type=${parsedError.type}`
    );
  }
  
  if (code) {
    try {
      const supabase = createClient();

      // Exchange code for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        const parsedError = parseAuthError(exchangeError);
        console.error('Session exchange error:', exchangeError);
        
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent(parsedError.message)}&error_type=${parsedError.type}`
        );
      }

      if (!data?.session || !data?.user) {
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`
        );
      }

      const user = data.user;
      const session = data.session;

      // Check if user record exists in users table
      const { data: existingUser, error: userFetchError } = await supabase
        .from('users')
        .select('id, onboarding_completed, profile_completed')
        .eq('id', user.id)
        .single();

      // Create user record if it doesn't exist (new OAuth user)
      if (!existingUser && userFetchError?.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
            onboarding_completed: false,
            profile_completed: false,
            account_type: 'user',
          });

        if (insertError) {
          console.error('Error creating user record:', insertError);
          // Continue anyway - user can complete profile later
        }

        // Log new user signup
        logUsage({
          userId: user.id,
          eventType: 'user_signup',
          metadata: {
            method: 'oauth',
            provider: user.app_metadata?.provider || 'unknown',
          },
        }).catch((err) => {
          console.error('Error logging signup usage:', err);
        });

        // Redirect new users to onboarding
        return NextResponse.redirect(`${requestUrl.origin}/onboarding`);
      }

      // Log OAuth sign-in for existing users
      logUsage({
        userId: user.id,
        eventType: 'user_active',
        metadata: {
          method: 'oauth',
          provider: user.app_metadata?.provider || 'unknown',
        },
      }).catch((err) => {
        console.error('Error logging login usage:', err);
      });

      // Redirect based on type
      if (type === 'recovery') {
        return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password`);
      }

      // Check if user needs to complete onboarding
      if (existingUser && !existingUser.onboarding_completed) {
        return NextResponse.redirect(`${requestUrl.origin}/onboarding`);
      }

      // Default redirect to dashboard for returning users
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
    } catch (err) {
      console.error('Unexpected error in OAuth callback:', err);
      const parsedError = parseAuthError(err);
      
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(parsedError.message)}`
      );
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('No authentication code provided')}`);
}
