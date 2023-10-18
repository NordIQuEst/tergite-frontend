export async function GET(request: Request, { params }: { params: { provider: string } }) {
	const provider = params.provider;
	const redirectUrl = encodeURI(`https://${process.env.HOST}/`);
	const authorizeUrl = `${process.env.API_BASE_URL}/auth/app/${provider}/authorize?redirect_to=${redirectUrl}`;

	try {
		const response = await fetch(authorizeUrl);
		if (response.ok) {
			const body: API.Response.Authorize = await response.json();
			return Response.redirect(body.authorization_url);
		}
		return response;
	} catch (error) {
        console.error(error);
        return Response.json({detail: "unexpected error"})
    }
}
