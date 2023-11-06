import { API } from '@/types';
import { NextResponse } from 'next/server';
import axios from 'axios';

// ensure this is not reduced to compile-time variables
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { provider: string } }) {
	const provider = params.provider;
	const host = request.headers.get('host');
	const redirectUrl = process.env.OAUTH_REDIRECT_URI || `http://${host}`;
	const nextUrl = encodeURI(redirectUrl);
	const baseUrl = process.env.API_BASE_URL;
	const authorizeUrl = `${baseUrl}/auth/app/${provider}/authorize?next=${nextUrl}`;

	try {
		const response = await axios.get(authorizeUrl);
		if (response.status === 200) {
			return NextResponse.redirect(response.data.authorization_url);
		}
		return response;
	} catch (error) {
		console.error({ error, url: authorizeUrl });
		return NextResponse.json({ detail: 'unexpected error' });
	}
}
