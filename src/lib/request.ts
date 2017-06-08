import * as superagent from 'superagent';
import * as authenticate from 'www-authenticate';

import { Credentials } from './credentials';

type RequestMethod = 'GET' | 'POST';

type RequestOptions = {
	/**
	 * The URL to request.
	 */
	url: string;
	/**
	 * The HTTP method that will be used for the request.
	 */
	method?: RequestMethod;
	/**
	 * Data that will be send with the request, if necessary.
	 */
	data?: any;
	/**
	 * Custom headers.
	 */
	headers?: { [key: string]: string };
	/**
	 * Credentials to be used for HTTP Digest authentication.
	 */
	credentials?: Credentials;
};

type RequestResponse = {
	status: number;
	data: any;
};

export class RequestError {
	constructor(
		readonly message: string,
		readonly status?: number,
		readonly code?: string,
	) {}
}

/**
 * @hidden
 */
const REQUEST_TIMEOUT = 2000;

/**
 * @hidden
 */
const digest = (
	authHeader: string,
	credentials: Credentials,
	method: RequestMethod,
	path: string,
) => {
	const auth = authenticate(credentials.user, credentials.pass)(authHeader);
	return {
		authorization: auth.authorize(method, path),
	};
};

/**
 * Request a remote resource.
 * Handles digest authentication for Philips TV models that require it.
 */
export const request = ({ url, method = 'GET', data, headers, credentials }: RequestOptions) => {
	return new Promise<RequestResponse>((resolve, reject) => {
		let agent = superagent(method, url).timeout(REQUEST_TIMEOUT);
		if (data) {
			agent = agent.send(data);
		}
		if (headers) {
			agent = agent.set(headers);
		}

		agent.end((err, res) => {
			if (!err) {
				resolve({ status: res.status, data: res.body } as RequestResponse);
				return;
			}

			if (err && err.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
				throw new RequestError(
					'Allow insecure requests with "allowInsecureRequests()" to disable https certificate validation.',
					undefined,
					'insecure',
				);
			}

			if (res && res.header['www-authenticate'] && credentials) {
				const headers = digest(res.header['www-authenticate'], credentials, method, (res as any).req.path);

				resolve(request({ url, method, data, headers, credentials: undefined }));
			}

			reject(new RequestError(err.toString(), res && res.status, err.timeout && 'TIMEOUT'));
		});
	});
};

/**
 * Allow https requests to be made without valid certificates.
 */
export const allowInsecureRequests = () => {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
};
