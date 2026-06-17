import { NextRequest, NextResponse } from 'next/server'
import { ConfidentialClientApplication } from '@azure/msal-node'

export const dynamic = 'force-dynamic'

const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID!,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
  },
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=no_code`)
  }

  const cca = new ConfidentialClientApplication(msalConfig)
  const result = await cca.acquireTokenByCode({
    code,
    scopes: ['https://ml.azure.com/user_impersonation', 'offline_access'],
    redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/microsoft/callback`,
  })

  const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`)
  response.cookies.set('azure_token', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60,
  })
  return response
}
