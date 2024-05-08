/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE
 */

/**
 * The version of the {@link https://techdocs.akamai.com/property-mgr/reference/rule-format-schemas | Rule Format} used
 * for this build of the API.
 */
export const RULE_FORMAT: string = 'v2024-02-12';

export class CriteriaBuilder {
	delegate: any;

	constructor(delegate: any) {
		this.delegate = delegate;
	}

	private wrapDelegateResponse(_response: any): CriteriaBuilder {
		return this;
	}

	/**
	 * Matches the current cache state. Note that any `NO_STORE` or `BYPASS_CACHE` HTTP headers set on the origin's
	 * content overrides properties' [`caching`](#) instructions, in which case this criteria does not apply.
	 *
	 * @param {object} params - The parameters needed to configure onCacheability
	 * @param {'IS' | 'IS_NOT'} [params.matchOperator] - Specifies the match's logic. Default: "IS".
	 * @param {'NO_STORE' | 'BYPASS_CACHE' | 'CACHEABLE'} [params.value] - Content's cache is enabled (`CACHEABLE`) or
	 *   not (`NO_STORE`), or else is ignored (`BYPASS_CACHE`). Default: "CACHEABLE".
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/response-cacheability | Akamai Techdocs}
	 */
	onCacheability(params: {
		/** Specifies the match's logic. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT';

		/**
		 * Content's cache is enabled (`CACHEABLE`) or not (`NO_STORE`), or else is ignored (`BYPASS_CACHE`). Default:
		 * "CACHEABLE".
		 */
		value?: 'NO_STORE' | 'BYPASS_CACHE' | 'CACHEABLE';
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		if (typeof params.value === 'undefined') {
			params.value = 'CACHEABLE';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'cacheability', {}, params));
	}

	/**
	 * Identifies traffic deployed over Akamai's regional ChinaCDN infrastructure.
	 *
	 * @param {object} params - The parameters needed to configure onChinaCdnRegion
	 * @param {'IS' | 'IS_NOT'} [params.matchOperator] - Specify whether the request `IS` or `IS_NOT` deployed over
	 *   ChinaCDN. Default: "IS".
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/chinacdn-region | Akamai Techdocs}
	 */
	onChinaCdnRegion(params: {
		/** Specify whether the request `IS` or `IS_NOT` deployed over ChinaCDN. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT';
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'chinaCdnRegion', {}, params));
	}

	/**
	 * Matches whether you have configured a client certificate to authenticate requests to edge servers.
	 *
	 * @param {object} params - The parameters needed to configure onClientCertificate
	 * @param {boolean} [params.isCertificatePresent] - Executes rule behaviors only if a client certificate
	 *   authenticates requests. Default: true.
	 * @param {'VALID' | 'INVALID' | 'IGNORE'} [params.isCertificateValid] - Matches whether the certificate is `VALID`
	 *   or `INVALID`. You can also `IGNORE` the certificate's validity. Default: "IGNORE".
	 * @param {boolean} [params.enforceMtls] - Specifies custom handling of requests if any of the checks in the
	 *   [`enforceMtlsSettings`](#) behavior fail. Enable this and use with behaviors such as [`logCustom`](#) so that
	 *   they execute if the check fails. You need to add the [`enforceMtlsSettings`](#) behavior to a parent rule, with
	 *   its own unique match condition and `enableDenyRequest` option disabled. Default: false.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/client-cert | Akamai Techdocs}
	 */
	onClientCertificate(params: {
		/** Executes rule behaviors only if a client certificate authenticates requests. Default: true. */
		isCertificatePresent?: boolean;

		/**
		 * Matches whether the certificate is `VALID` or `INVALID`. You can also `IGNORE` the certificate's validity.
		 * Default: "IGNORE".
		 */
		isCertificateValid?: 'VALID' | 'INVALID' | 'IGNORE';

		/**
		 * Specifies custom handling of requests if any of the checks in the [`enforceMtlsSettings`](#) behavior fail.
		 * Enable this and use with behaviors such as [`logCustom`](#) so that they execute if the check fails. You need
		 * to add the [`enforceMtlsSettings`](#) behavior to a parent rule, with its own unique match condition and
		 * `enableDenyRequest` option disabled. Default: false.
		 */
		enforceMtls?: boolean;
	}): CriteriaBuilder {
		if (typeof params.isCertificatePresent === 'undefined') {
			params.isCertificatePresent = true;
		}

		if (typeof params.isCertificateValid === 'undefined' && (params.isCertificatePresent as unknown) === true) {
			params.isCertificateValid = 'IGNORE';
		}

		if (
			typeof params.enforceMtls === 'undefined' &&
			((params.isCertificateValid as unknown) === 'VALID' || (params.isCertificateValid as unknown) === 'INVALID')
		) {
			params.enforceMtls = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'clientCertificate', {}, params));
	}

	/**
	 * Matches the IP number of the requesting client. To use this condition to match end-user IP addresses, apply it
	 * together with the [`requestType`](#) matching on the `CLIENT_REQ` value.
	 *
	 * @param {object} params - The parameters needed to configure onClientIp
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF'} [params.matchOperator] - Matches the contents of `values` if set to
	 *   `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match. Default: "IS_ONE_OF".
	 * @param {string[]} params.values - IP or CIDR block, for example: `71.92.0.0/14`.
	 * @param {boolean} [params.useHeaders] - When connecting via a proxy server as determined by the `X-Forwarded-For`
	 *   header, enabling this option matches the connecting client's IP address rather than the original end client
	 *   specified in the header. Default: false.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/client-ip | Akamai Techdocs}
	 */
	onClientIp(params: {
		/**
		 * Matches the contents of `values` if set to `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match.
		 * Default: "IS_ONE_OF".
		 */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF';

		/** IP or CIDR block, for example: `71.92.0.0/14`. */
		values: string[];

		/**
		 * When connecting via a proxy server as determined by the `X-Forwarded-For` header, enabling this option
		 * matches the connecting client's IP address rather than the original end client specified in the header.
		 * Default: false.
		 */
		useHeaders?: boolean;
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (typeof params.useHeaders === 'undefined') {
			params.useHeaders = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'clientIp', {}, params));
	}

	/**
	 * Matches the version of the IP protocol used by the requesting client.
	 *
	 * @param {object} params - The parameters needed to configure onClientIpVersion
	 * @param {'IPV4' | 'IPV6'} [params.value] - The IP version of the client request, either `IPV4` or `IPV6`. Default:
	 *   "IPV4".
	 * @param {boolean} [params.useXForwardedFor] - When connecting via a proxy server as determined by the
	 *   `X-Forwarded-For` header, enabling this option matches the connecting client's IP address rather than the
	 *   original end client specified in the header. Default: false.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/client-ip-version | Akamai Techdocs}
	 */
	onClientIpVersion(params: {
		/** The IP version of the client request, either `IPV4` or `IPV6`. Default: "IPV4". */
		value?: 'IPV4' | 'IPV6';

		/**
		 * When connecting via a proxy server as determined by the `X-Forwarded-For` header, enabling this option
		 * matches the connecting client's IP address rather than the original end client specified in the header.
		 * Default: false.
		 */
		useXForwardedFor?: boolean;
	}): CriteriaBuilder {
		if (typeof params.value === 'undefined') {
			params.value = 'IPV4';
		}

		if (typeof params.useXForwardedFor === 'undefined') {
			params.useXForwardedFor = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'clientIpVersion', {}, params));
	}

	/**
	 * Specifies the type of Akamai network handling the request.
	 *
	 * @param {object} params - The parameters needed to configure onContentDeliveryNetwork
	 * @param {'IS' | 'IS_NOT'} [params.matchOperator] - Matches the specified `network` if set to `IS`, otherwise
	 *   `IS_NOT` reverses the match. Default: "IS".
	 * @param {'STAGING' | 'PRODUCTION'} [params.network] - Match the network. Default: "STAGING".
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/cdn-network | Akamai Techdocs}
	 */
	onContentDeliveryNetwork(params: {
		/** Matches the specified `network` if set to `IS`, otherwise `IS_NOT` reverses the match. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT';

		/** Match the network. Default: "STAGING". */
		network?: 'STAGING' | 'PRODUCTION';
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		if (typeof params.network === 'undefined') {
			params.network = 'STAGING';
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('CRITERIA', 'contentDeliveryNetwork', {}, params),
		);
	}

	/**
	 * Matches the HTTP response header's `Content-Type`. > **Warning**. The Content Type match was updated in April
	 * 2023 and the change affects configurations that implement it together with the [`gzipResponse`](#) behavior. With
	 * the new change, if the origin server sends out the content in an uncompressed format, the Akamai edge servers
	 * cache it and deliver it to the requesting client in the compressed .gzip format. Clients using the Content-Length
	 * response header to determine the file size will now see the compressed size of the object returned from Akamai,
	 * rather than the uncompressed size of the object returned from the origin. If you updated your property
	 * configuration after April 3rd 2023, your `contentType` match is affected by this change.
	 *
	 * @param {object} params - The parameters needed to configure onContentType
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF'} [params.matchOperator] - Matches any `Content-Type` among specified
	 *   `values` when set to `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match. Default: "IS_ONE_OF".
	 * @param {string[]} [params.values] - `Content-Type` response header value, for example `text/html`. Default:
	 *   ["text/html*"].
	 * @param {boolean} [params.matchWildcard] - Allows wildcards in the `value` field, where `?` matches a single
	 *   character and `*` matches zero or more characters. Specifying `text/*` matches both `text/html` and `text/css`.
	 *   Default: true.
	 * @param {boolean} [params.matchCaseSensitive] - Sets a case-sensitive match for all `values`. Default: false.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/content-type | Akamai Techdocs}
	 */
	onContentType(params: {
		/**
		 * Matches any `Content-Type` among specified `values` when set to `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF`
		 * reverses the match. Default: "IS_ONE_OF".
		 */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF';

		/** `Content-Type` response header value, for example `text/html`. Default: ["text/html*"]. */
		values?: string[];

		/**
		 * Allows wildcards in the `value` field, where `?` matches a single character and `*` matches zero or more
		 * characters. Specifying `text/*` matches both `text/html` and `text/css`. Default: true.
		 */
		matchWildcard?: boolean;

		/** Sets a case-sensitive match for all `values`. Default: false. */
		matchCaseSensitive?: boolean;
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (typeof params.values === 'undefined') {
			params.values = ['text/html*'];
		}

		if (typeof params.matchWildcard === 'undefined') {
			params.matchWildcard = true;
		}

		if (typeof params.matchCaseSensitive === 'undefined') {
			params.matchCaseSensitive = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'contentType', {}, params));
	}

	/**
	 * Matches the requested filename's extension, if present.
	 *
	 * @param {object} params - The parameters needed to configure onFileExtension
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF'} [params.matchOperator] - Matches the contents of `values` if set to
	 *   `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match. Default: "IS_ONE_OF".
	 * @param {string[]} params.values - An array of file extension strings, with no leading dot characters, for example
	 *   `png`, `jpg`, `jpeg`, and `gif`.
	 * @param {boolean} [params.matchCaseSensitive] - Sets a case-sensitive match. Default: false.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/file-ext | Akamai Techdocs}
	 */
	onFileExtension(params: {
		/**
		 * Matches the contents of `values` if set to `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match.
		 * Default: "IS_ONE_OF".
		 */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF';

		/**
		 * An array of file extension strings, with no leading dot characters, for example `png`, `jpg`, `jpeg`, and
		 * `gif`.
		 */
		values: string[];

		/** Sets a case-sensitive match. Default: false. */
		matchCaseSensitive?: boolean;
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (typeof params.matchCaseSensitive === 'undefined') {
			params.matchCaseSensitive = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'fileExtension', {}, params));
	}

	/**
	 * Matches the requested filename, or test whether it is present.
	 *
	 * @param {object} params - The parameters needed to configure onFilename
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF' | 'IS_EMPTY' | 'IS_NOT_EMPTY'} [params.matchOperator] - If set to
	 *   `IS_ONE_OF` or `IS_NOT_ONE_OF`, matches whether the filename matches one of the `values`. If set to `IS_EMPTY`
	 *   or `IS_NOT_EMPTY`, matches whether the specified filename is part of the path. Default: "IS_ONE_OF".
	 * @param {string[]} [params.values] - Matches the filename component of the request URL. Allows wildcards, where
	 *   `?` matches a single character and `*` matches zero or more characters. For example, specify `filename.*` to
	 *   accept any extension.
	 * @param {boolean} [params.matchCaseSensitive] - Sets a case-sensitive match for the `values` field. Default: true.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/filename-match | Akamai Techdocs}
	 */
	onFilename(params: {
		/**
		 * If set to `IS_ONE_OF` or `IS_NOT_ONE_OF`, matches whether the filename matches one of the `values`. If set to
		 * `IS_EMPTY` or `IS_NOT_EMPTY`, matches whether the specified filename is part of the path. Default:
		 * "IS_ONE_OF".
		 */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF' | 'IS_EMPTY' | 'IS_NOT_EMPTY';

		/**
		 * Matches the filename component of the request URL. Allows wildcards, where `?` matches a single character and
		 * `*` matches zero or more characters. For example, specify `filename.*` to accept any extension.
		 */
		values?: string[];

		/** Sets a case-sensitive match for the `values` field. Default: true. */
		matchCaseSensitive?: boolean;
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (
			typeof params.matchCaseSensitive === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.matchCaseSensitive = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'filename', {}, params));
	}

	/**
	 * Matches the requested hostname.
	 *
	 * @param {object} params - The parameters needed to configure onHostname
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF'} [params.matchOperator] - Matches the contents of `values` when set to
	 *   `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match. Default: "IS_ONE_OF".
	 * @param {string[]} params.values - A list of hostnames. Allows wildcards, where `?` matches a single character and
	 *   `*` matches zero or more characters. Specifying `*.example.com` matches both `m.example.com` and
	 *   `www.example.com`.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/hn | Akamai Techdocs}
	 */
	onHostname(params: {
		/**
		 * Matches the contents of `values` when set to `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match.
		 * Default: "IS_ONE_OF".
		 */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF';

		/**
		 * A list of hostnames. Allows wildcards, where `?` matches a single character and `*` matches zero or more
		 * characters. Specifying `*.example.com` matches both `m.example.com` and `www.example.com`.
		 */
		values: string[];
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'hostname', {}, params));
	}

	/**
	 * This specifies match criteria using Akamai XML metadata. It can only be configured on your behalf by Akamai
	 * Professional Services.
	 *
	 * @param {object} params - The parameters needed to configure onMatchAdvanced
	 * @param {string} [params.description] - A human-readable description of what the XML block does.
	 * @param {string} params.openXml - An XML string that opens the relevant block.
	 * @param {string} params.closeXml - An XML string that closes the relevant block.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/adv-match | Akamai Techdocs}
	 */
	onMatchAdvanced(params: {
		/** A human-readable description of what the XML block does. */
		description?: string;

		/** An XML string that opens the relevant block. */
		openXml: string;

		/** An XML string that closes the relevant block. */
		closeXml: string;
	}): CriteriaBuilder {
		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'matchAdvanced', {}, params));
	}

	/**
	 * Match the assigned content provider code.
	 *
	 * @param {object} params - The parameters needed to configure onMatchCpCode
	 * @param {any} params.value - Specifies the CP code as an object. You only need to provide the initial `id` to
	 *   match the CP code, stripping any [`cpc_` prefix](ref:id-prefixes) to pass the integer to the rule tree.
	 *   Additional CP code details may reflect back in subsequent read-only data.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/content-provider-code-match | Akamai Techdocs}
	 */
	onMatchCpCode(params: {
		/**
		 * Specifies the CP code as an object. You only need to provide the initial `id` to match the CP code, stripping
		 * any [`cpc_` prefix](ref:id-prefixes) to pass the integer to the rule tree. Additional CP code details may
		 * reflect back in subsequent read-only data.
		 */
		value: any;
	}): CriteriaBuilder {
		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'matchCpCode', {}, params));
	}

	/**
	 * Match a set or range of HTTP response codes.
	 *
	 * @param {object} params - The parameters needed to configure onMatchResponseCode
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF' | 'IS_BETWEEN' | 'IS_NOT_BETWEEN'} [params.matchOperator] - Matches numeric
	 *   range or a specified set of `values`. Default: "IS_ONE_OF".
	 * @param {string[]} [params.values] - A set of response codes to match, for example `["404","500"]`.
	 * @param {number} [params.lowerBound] - Specifies the start of a range of responses. For example, `400` to match
	 *   anything from `400` to `500`.
	 * @param {number} [params.upperBound] - Specifies the end of a range of responses. For example, `500` to match
	 *   anything from `400` to `500`.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/response-status-cookie | Akamai Techdocs}
	 */
	onMatchResponseCode(params: {
		/** Matches numeric range or a specified set of `values`. Default: "IS_ONE_OF". */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF' | 'IS_BETWEEN' | 'IS_NOT_BETWEEN';

		/** A set of response codes to match, for example `["404","500"]`. */
		values?: string[];

		/** Specifies the start of a range of responses. For example, `400` to match anything from `400` to `500`. */
		lowerBound?: number;

		/** Specifies the end of a range of responses. For example, `500` to match anything from `400` to `500`. */
		upperBound?: number;
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'matchResponseCode', {}, params));
	}

	/**
	 * Matches the URL's non-hostname path component.
	 *
	 * @param {object} params - The parameters needed to configure onPath
	 * @param {'MATCHES_ONE_OF' | 'DOES_NOT_MATCH_ONE_OF'} [params.matchOperator] - Matches the contents of the `values`
	 *   array. Default: "MATCHES_ONE_OF".
	 * @param {string[]} params.values - Matches the URL path, excluding leading hostname and trailing query parameters.
	 *   The path is relative to the server root, for example `/blog`. This field allows wildcards, where `?` matches a
	 *   single character and `*` matches zero or more characters. For example, `/blog/2014/` matches paths with two
	 *   fixed segments and other varying segments between them.
	 * @param {boolean} [params.matchCaseSensitive] - Sets a case-sensitive match. Default: false.
	 * @param {boolean} [params.normalize] - Transforms URLs before comparing them with the provided value. URLs are
	 *   decoded, and any directory syntax such as `../..` or `//` is stripped as a security measure. This protects URL
	 *   paths from being accessed by unauthorized users. Default: false.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/path-match | Akamai Techdocs}
	 */
	onPath(params: {
		/** Matches the contents of the `values` array. Default: "MATCHES_ONE_OF". */
		matchOperator?: 'MATCHES_ONE_OF' | 'DOES_NOT_MATCH_ONE_OF';

		/**
		 * Matches the URL path, excluding leading hostname and trailing query parameters. The path is relative to the
		 * server root, for example `/blog`. This field allows wildcards, where `?` matches a single character and `*`
		 * matches zero or more characters. For example, `/blog/2014/` matches paths with two fixed segments and other
		 * varying segments between them.
		 */
		values: string[];

		/** Sets a case-sensitive match. Default: false. */
		matchCaseSensitive?: boolean;

		/**
		 * Transforms URLs before comparing them with the provided value. URLs are decoded, and any directory syntax
		 * such as `../..` or `//` is stripped as a security measure. This protects URL paths from being accessed by
		 * unauthorized users. Default: false.
		 */
		normalize?: boolean;
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'MATCHES_ONE_OF';
		}

		if (typeof params.matchCaseSensitive === 'undefined') {
			params.matchCaseSensitive = false;
		}

		if (typeof params.normalize === 'undefined') {
			params.normalize = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'path', {}, params));
	}

	/**
	 * Matches query string field names or values.
	 *
	 * @param {object} params - The parameters needed to configure onQueryStringParameter
	 * @param {string} params.parameterName - The name of the query field, for example, `q` in `?q=string`.
	 * @param {'IS_ONE_OF'
	 * 	| 'IS_NOT_ONE_OF'
	 * 	| 'EXISTS'
	 * 	| 'DOES_NOT_EXIST'
	 * 	| 'IS_LESS_THAN'
	 * 	| 'IS_MORE_THAN'
	 * 	| 'IS_BETWEEN'} [params.matchOperator]
	 *   - Narrows the match criteria. Default: "IS_ONE_OF".
	 *
	 * @param {string[]} [params.values] - The value of the query field, for example, `string` in `?q=string`.
	 * @param {number} [params.lowerBound] - Specifies the match's minimum value.
	 * @param {number} [params.upperBound] - When the `value` is numeric, this field specifies the match's maximum
	 *   value.
	 * @param {boolean} [params.matchWildcardName] - Allows wildcards in the `parameterName` field, where `?` matches a
	 *   single character and `*` matches zero or more characters. Default: false.
	 * @param {boolean} [params.matchCaseSensitiveName] - Sets a case-sensitive match for the `parameterName` field.
	 *   Default: true.
	 * @param {boolean} [params.matchWildcardValue] - Allows wildcards in the `value` field, where `?` matches a single
	 *   character and `*` matches zero or more characters. Default: false.
	 * @param {boolean} [params.matchCaseSensitiveValue] - Sets a case-sensitive match for the `value` field. Default:
	 *   true.
	 * @param {boolean} [params.escapeValue] - Matches when the `value` is URL-escaped. Default: false.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/query-string-param | Akamai Techdocs}
	 */
	onQueryStringParameter(params: {
		/** The name of the query field, for example, `q` in `?q=string`. */
		parameterName: string;

		/** Narrows the match criteria. Default: "IS_ONE_OF". */
		matchOperator?:
			| 'IS_ONE_OF'
			| 'IS_NOT_ONE_OF'
			| 'EXISTS'
			| 'DOES_NOT_EXIST'
			| 'IS_LESS_THAN'
			| 'IS_MORE_THAN'
			| 'IS_BETWEEN';

		/** The value of the query field, for example, `string` in `?q=string`. */
		values?: string[];

		/** Specifies the match's minimum value. */
		lowerBound?: number;

		/** When the `value` is numeric, this field specifies the match's maximum value. */
		upperBound?: number;

		/**
		 * Allows wildcards in the `parameterName` field, where `?` matches a single character and `*` matches zero or
		 * more characters. Default: false.
		 */
		matchWildcardName?: boolean;

		/** Sets a case-sensitive match for the `parameterName` field. Default: true. */
		matchCaseSensitiveName?: boolean;

		/**
		 * Allows wildcards in the `value` field, where `?` matches a single character and `*` matches zero or more
		 * characters. Default: false.
		 */
		matchWildcardValue?: boolean;

		/** Sets a case-sensitive match for the `value` field. Default: true. */
		matchCaseSensitiveValue?: boolean;

		/** Matches when the `value` is URL-escaped. Default: false. */
		escapeValue?: boolean;
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (typeof params.matchWildcardName === 'undefined') {
			params.matchWildcardName = false;
		}

		if (typeof params.matchCaseSensitiveName === 'undefined') {
			params.matchCaseSensitiveName = true;
		}

		if (
			typeof params.matchWildcardValue === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.matchWildcardValue = false;
		}

		if (
			typeof params.matchCaseSensitiveValue === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.matchCaseSensitiveValue = true;
		}

		if (
			typeof params.escapeValue === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.escapeValue = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'queryStringParameter', {}, params));
	}

	/**
	 * Matches a specified percentage of requests. Use this match to apply behaviors to a percentage of your incoming
	 * requests that differ from the remainder, useful for A/b testing, or to offload traffic onto different servers.
	 *
	 * @param {object} params - The parameters needed to configure onRandom
	 * @param {number} [params.bucket] - Specify a percentage of random requests to which to apply a behavior. Any
	 *   remainders do not match. Default: 100.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/sample-percentage | Akamai Techdocs}
	 */
	onRandom(params: {
		/**
		 * Specify a percentage of random requests to which to apply a behavior. Any remainders do not match. Default:
		 * 100.
		 */
		bucket?: number;
	}): CriteriaBuilder {
		if (typeof params.bucket === 'undefined') {
			params.bucket = 100;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'random', {}, params));
	}

	/**
	 * Match the cookie name or value passed with the request.
	 *
	 * @param {object} params - The parameters needed to configure onRequestCookie
	 * @param {string} params.cookieName - The name of the cookie, for example, `visitor` in `visitor:anon`.
	 * @param {'IS' | 'IS_NOT' | 'EXISTS' | 'DOES_NOT_EXIST' | 'IS_BETWEEN'} [params.matchOperator] - Narrows the match
	 *   criteria. Default: "IS".
	 * @param {string} [params.value] - The cookie's value, for example, `anon` in `visitor:anon`.
	 * @param {number} [params.lowerBound] - When the `value` is numeric, this field specifies the match's minimum
	 *   value.
	 * @param {number} [params.upperBound] - When the `value` is numeric, this field specifies the match's maximum
	 *   value.
	 * @param {boolean} [params.matchWildcardName] - Allows wildcards in the `cookieName` field, where `?` matches a
	 *   single character and `*` matches zero or more characters. Default: false.
	 * @param {boolean} [params.matchCaseSensitiveName] - Sets a case-sensitive match for the `cookieName` field.
	 *   Default: true.
	 * @param {boolean} [params.matchWildcardValue] - Allows wildcards in the `value` field, where `?` matches a single
	 *   character and `*` matches zero or more characters. Default: false.
	 * @param {boolean} [params.matchCaseSensitiveValue] - Sets a case-sensitive match for the `value` field. Default:
	 *   true.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/req-cookie | Akamai Techdocs}
	 */
	onRequestCookie(params: {
		/** The name of the cookie, for example, `visitor` in `visitor:anon`. */
		cookieName: string;

		/** Narrows the match criteria. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT' | 'EXISTS' | 'DOES_NOT_EXIST' | 'IS_BETWEEN';

		/** The cookie's value, for example, `anon` in `visitor:anon`. */
		value?: string;

		/** When the `value` is numeric, this field specifies the match's minimum value. */
		lowerBound?: number;

		/** When the `value` is numeric, this field specifies the match's maximum value. */
		upperBound?: number;

		/**
		 * Allows wildcards in the `cookieName` field, where `?` matches a single character and `*` matches zero or more
		 * characters. Default: false.
		 */
		matchWildcardName?: boolean;

		/** Sets a case-sensitive match for the `cookieName` field. Default: true. */
		matchCaseSensitiveName?: boolean;

		/**
		 * Allows wildcards in the `value` field, where `?` matches a single character and `*` matches zero or more
		 * characters. Default: false.
		 */
		matchWildcardValue?: boolean;

		/** Sets a case-sensitive match for the `value` field. Default: true. */
		matchCaseSensitiveValue?: boolean;
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		if (typeof params.matchWildcardName === 'undefined') {
			params.matchWildcardName = false;
		}

		if (typeof params.matchCaseSensitiveName === 'undefined') {
			params.matchCaseSensitiveName = true;
		}

		if (
			typeof params.matchWildcardValue === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS', 'IS_NOT'].includes(params.matchOperator)
		) {
			params.matchWildcardValue = false;
		}

		if (
			typeof params.matchCaseSensitiveValue === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS', 'IS_NOT'].includes(params.matchOperator)
		) {
			params.matchCaseSensitiveValue = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'requestCookie', {}, params));
	}

	/**
	 * Match HTTP header names or values.
	 *
	 * @param {object} params - The parameters needed to configure onRequestHeader
	 * @param {string} params.headerName - The name of the request header, for example `Accept-Language`.
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF' | 'EXISTS' | 'DOES_NOT_EXIST'} [params.matchOperator] - Narrows the match
	 *   criteria. Default: "IS_ONE_OF".
	 * @param {string[]} [params.values] - The request header's value, for example `en-US` when the header `headerName`
	 *   is `Accept-Language`.
	 * @param {boolean} [params.matchWildcardName] - Allows wildcards in the `headerName` field, where `?` matches a
	 *   single character and `*` matches zero or more characters. Default: false.
	 * @param {boolean} [params.matchWildcardValue] - Allows wildcards in the `value` field, where `?` matches a single
	 *   character and `*` matches zero or more characters. Default: false.
	 * @param {boolean} [params.matchCaseSensitiveValue] - Sets a case-sensitive match for the `value` field. Default:
	 *   true.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/req-header | Akamai Techdocs}
	 */
	onRequestHeader(params: {
		/** The name of the request header, for example `Accept-Language`. */
		headerName: string;

		/** Narrows the match criteria. Default: "IS_ONE_OF". */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF' | 'EXISTS' | 'DOES_NOT_EXIST';

		/** The request header's value, for example `en-US` when the header `headerName` is `Accept-Language`. */
		values?: string[];

		/**
		 * Allows wildcards in the `headerName` field, where `?` matches a single character and `*` matches zero or more
		 * characters. Default: false.
		 */
		matchWildcardName?: boolean;

		/**
		 * Allows wildcards in the `value` field, where `?` matches a single character and `*` matches zero or more
		 * characters. Default: false.
		 */
		matchWildcardValue?: boolean;

		/** Sets a case-sensitive match for the `value` field. Default: true. */
		matchCaseSensitiveValue?: boolean;
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (typeof params.matchWildcardName === 'undefined') {
			params.matchWildcardName = false;
		}

		if (
			typeof params.matchWildcardValue === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.matchWildcardValue = false;
		}

		if (
			typeof params.matchCaseSensitiveValue === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.matchCaseSensitiveValue = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'requestHeader', {}, params));
	}

	/**
	 * Specify the request's HTTP verb. Also supports WebDAV methods and common Akamai operations.
	 *
	 * @param {object} params - The parameters needed to configure onRequestMethod
	 * @param {'IS' | 'IS_NOT'} [params.matchOperator] - Matches the `value` when set to `IS`, otherwise `IS_NOT`
	 *   reverses the match. Default: "IS".
	 * @param {'GET'
	 * 	| 'POST'
	 * 	| 'HEAD'
	 * 	| 'PUT'
	 * 	| 'PATCH'
	 * 	| 'HTTP_DELETE'
	 * 	| 'AKAMAI_TRANSLATE'
	 * 	| 'AKAMAI_PURGE'
	 * 	| 'OPTIONS'
	 * 	| 'DAV_ACL'
	 * 	| 'DAV_CHECKOUT'
	 * 	| 'DAV_COPY'
	 * 	| 'DAV_DMCREATE'
	 * 	| 'DAV_DMINDEX'
	 * 	| 'DAV_DMMKPATH'
	 * 	| 'DAV_DMMKPATHS'
	 * 	| 'DAV_DMOVERLAY'
	 * 	| 'DAV_DMPATCHPATHS'
	 * 	| 'DAV_LOCK'
	 * 	| 'DAV_MKCALENDAR'
	 * 	| 'DAV_MKCOL'
	 * 	| 'DAV_MOVE'
	 * 	| 'DAV_PROPFIND'
	 * 	| 'DAV_PROPPATCH'
	 * 	| 'DAV_REPORT'
	 * 	| 'DAV_SETPROCESS'
	 * 	| 'DAV_SETREDIRECT'
	 * 	| 'DAV_TRUTHGET'
	 * 	| 'DAV_UNLOCK'} [params.value]
	 *   - Any of these HTTP methods, WebDAV methods, or Akamai operations. Default: "GET".
	 *
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/req-method | Akamai Techdocs}
	 */
	onRequestMethod(params: {
		/** Matches the `value` when set to `IS`, otherwise `IS_NOT` reverses the match. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT';

		/** Any of these HTTP methods, WebDAV methods, or Akamai operations. Default: "GET". */
		value?:
			| 'GET'
			| 'POST'
			| 'HEAD'
			| 'PUT'
			| 'PATCH'
			| 'HTTP_DELETE'
			| 'AKAMAI_TRANSLATE'
			| 'AKAMAI_PURGE'
			| 'OPTIONS'
			| 'DAV_ACL'
			| 'DAV_CHECKOUT'
			| 'DAV_COPY'
			| 'DAV_DMCREATE'
			| 'DAV_DMINDEX'
			| 'DAV_DMMKPATH'
			| 'DAV_DMMKPATHS'
			| 'DAV_DMOVERLAY'
			| 'DAV_DMPATCHPATHS'
			| 'DAV_LOCK'
			| 'DAV_MKCALENDAR'
			| 'DAV_MKCOL'
			| 'DAV_MOVE'
			| 'DAV_PROPFIND'
			| 'DAV_PROPPATCH'
			| 'DAV_REPORT'
			| 'DAV_SETPROCESS'
			| 'DAV_SETREDIRECT'
			| 'DAV_TRUTHGET'
			| 'DAV_UNLOCK';
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		if (typeof params.value === 'undefined') {
			params.value = 'GET';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'requestMethod', {}, params));
	}

	/**
	 * Matches whether the request uses the HTTP or HTTPS protocol.
	 *
	 * @param {object} params - The parameters needed to configure onRequestProtocol
	 * @param {'HTTP' | 'HTTPS'} [params.value] - Specifies the protocol. Default: "HTTP".
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/req-protocol | Akamai Techdocs}
	 */
	onRequestProtocol(params: {
		/** Specifies the protocol. Default: "HTTP". */
		value?: 'HTTP' | 'HTTPS';
	}): CriteriaBuilder {
		if (typeof params.value === 'undefined') {
			params.value = 'HTTP';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'requestProtocol', {}, params));
	}

	/**
	 * Match HTTP header names or values.
	 *
	 * @param {object} params - The parameters needed to configure onResponseHeader
	 * @param {string} params.headerName - The name of the response header, for example `Content-Type`.
	 * @param {'IS_ONE_OF'
	 * 	| 'IS_NOT_ONE_OF'
	 * 	| 'EXISTS'
	 * 	| 'DOES_NOT_EXIST'
	 * 	| 'IS_LESS_THAN'
	 * 	| 'IS_MORE_THAN'
	 * 	| 'IS_BETWEEN'} [params.matchOperator]
	 *   - Narrows the match according to various criteria. Default: "IS_ONE_OF".
	 *
	 * @param {string[]} [params.values] - The response header's value, for example `application/x-www-form-urlencoded`
	 *   when the header `headerName` is `Content-Type`.
	 * @param {number} [params.lowerBound] - When the `value` is numeric, this field specifies the match's minimum
	 *   value.
	 * @param {number} [params.upperBound] - When the `value` is numeric, this field specifies the match's maximum
	 *   value.
	 * @param {boolean} [params.matchWildcardName] - Allows wildcards in the `headerName` field, where `?` matches a
	 *   single character and `*` matches zero or more characters. Default: false.
	 * @param {boolean} [params.matchWildcardValue] - Allows wildcards in the `value` field, where `?` matches a single
	 *   character and `*` matches zero or more characters. Default: false.
	 * @param {boolean} [params.matchCaseSensitiveValue] - When enabled, the match is case-sensitive for the `value`
	 *   field. Default: true.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/response-header | Akamai Techdocs}
	 */
	onResponseHeader(params: {
		/** The name of the response header, for example `Content-Type`. */
		headerName: string;

		/** Narrows the match according to various criteria. Default: "IS_ONE_OF". */
		matchOperator?:
			| 'IS_ONE_OF'
			| 'IS_NOT_ONE_OF'
			| 'EXISTS'
			| 'DOES_NOT_EXIST'
			| 'IS_LESS_THAN'
			| 'IS_MORE_THAN'
			| 'IS_BETWEEN';

		/**
		 * The response header's value, for example `application/x-www-form-urlencoded` when the header `headerName` is
		 * `Content-Type`.
		 */
		values?: string[];

		/** When the `value` is numeric, this field specifies the match's minimum value. */
		lowerBound?: number;

		/** When the `value` is numeric, this field specifies the match's maximum value. */
		upperBound?: number;

		/**
		 * Allows wildcards in the `headerName` field, where `?` matches a single character and `*` matches zero or more
		 * characters. Default: false.
		 */
		matchWildcardName?: boolean;

		/**
		 * Allows wildcards in the `value` field, where `?` matches a single character and `*` matches zero or more
		 * characters. Default: false.
		 */
		matchWildcardValue?: boolean;

		/** When enabled, the match is case-sensitive for the `value` field. Default: true. */
		matchCaseSensitiveValue?: boolean;
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (typeof params.matchWildcardName === 'undefined') {
			params.matchWildcardName = false;
		}

		if (
			typeof params.matchWildcardValue === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.matchWildcardValue = false;
		}

		if (
			typeof params.matchCaseSensitiveValue === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.matchCaseSensitiveValue = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'responseHeader', {}, params));
	}

	/**
	 * The location of the Akamai server handling the request.
	 *
	 * @param {object} params - The parameters needed to configure onServerLocation
	 * @param {'COUNTRY' | 'CONTINENT' | 'REGION'} [params.locationType] - Indicates the geographic scope. Default:
	 *   "COUNTRY".
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF'} [params.matchOperator] - Matches the specified set of values when set to
	 *   `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match. Default: "IS_ONE_OF".
	 * @param {(
	 * 	| 'AD'
	 * 	| 'AE'
	 * 	| 'AF'
	 * 	| 'AG'
	 * 	| 'AI'
	 * 	| 'AL'
	 * 	| 'AM'
	 * 	| 'AO'
	 * 	| 'AQ'
	 * 	| 'AR'
	 * 	| 'AS'
	 * 	| 'AT'
	 * 	| 'AU'
	 * 	| 'AW'
	 * 	| 'AZ'
	 * 	| 'BA'
	 * 	| 'BB'
	 * 	| 'BD'
	 * 	| 'BE'
	 * 	| 'BF'
	 * 	| 'BG'
	 * 	| 'BH'
	 * 	| 'BI'
	 * 	| 'BJ'
	 * 	| 'BL'
	 * 	| 'BM'
	 * 	| 'BN'
	 * 	| 'BO'
	 * 	| 'BQ'
	 * 	| 'BR'
	 * 	| 'BS'
	 * 	| 'BT'
	 * 	| 'BV'
	 * 	| 'BW'
	 * 	| 'BY'
	 * 	| 'BZ'
	 * 	| 'CA'
	 * 	| 'CC'
	 * 	| 'CD'
	 * 	| 'CF'
	 * 	| 'CG'
	 * 	| 'CH'
	 * 	| 'CI'
	 * 	| 'CK'
	 * 	| 'CL'
	 * 	| 'CM'
	 * 	| 'CN'
	 * 	| 'CO'
	 * 	| 'CR'
	 * 	| 'CU'
	 * 	| 'CV'
	 * 	| 'CW'
	 * 	| 'CX'
	 * 	| 'CY'
	 * 	| 'CZ'
	 * 	| 'DE'
	 * 	| 'DJ'
	 * 	| 'DK'
	 * 	| 'DM'
	 * 	| 'DO'
	 * 	| 'DZ'
	 * 	| 'EC'
	 * 	| 'EE'
	 * 	| 'EG'
	 * 	| 'EH'
	 * 	| 'ER'
	 * 	| 'ES'
	 * 	| 'ET'
	 * 	| 'EU'
	 * 	| 'FI'
	 * 	| 'FJ'
	 * 	| 'FK'
	 * 	| 'FM'
	 * 	| 'FO'
	 * 	| 'FR'
	 * 	| 'GA'
	 * 	| 'GB'
	 * 	| 'GD'
	 * 	| 'GE'
	 * 	| 'GF'
	 * 	| 'GH'
	 * 	| 'GI'
	 * 	| 'GG'
	 * 	| 'GL'
	 * 	| 'GM'
	 * 	| 'GN'
	 * 	| 'GP'
	 * 	| 'GQ'
	 * 	| 'GR'
	 * 	| 'GS'
	 * 	| 'GT'
	 * 	| 'GU'
	 * 	| 'GW'
	 * 	| 'GY'
	 * 	| 'HK'
	 * 	| 'HM'
	 * 	| 'HN'
	 * 	| 'HR'
	 * 	| 'HT'
	 * 	| 'HU'
	 * 	| 'ID'
	 * 	| 'IE'
	 * 	| 'IL'
	 * 	| 'IM'
	 * 	| 'IN'
	 * 	| 'IO'
	 * 	| 'IQ'
	 * 	| 'IR'
	 * 	| 'IS'
	 * 	| 'IT'
	 * 	| 'JE'
	 * 	| 'JM'
	 * 	| 'JO'
	 * 	| 'JP'
	 * 	| 'KE'
	 * 	| 'KG'
	 * 	| 'KH'
	 * 	| 'KI'
	 * 	| 'KM'
	 * 	| 'KN'
	 * 	| 'KP'
	 * 	| 'KR'
	 * 	| 'KW'
	 * 	| 'KY'
	 * 	| 'KZ'
	 * 	| 'LA'
	 * 	| 'LB'
	 * 	| 'LC'
	 * 	| 'LI'
	 * 	| 'LK'
	 * 	| 'LR'
	 * 	| 'LS'
	 * 	| 'LT'
	 * 	| 'LU'
	 * 	| 'LV'
	 * 	| 'LY'
	 * 	| 'MA'
	 * 	| 'MC'
	 * 	| 'MD'
	 * 	| 'ME'
	 * 	| 'MF'
	 * 	| 'MG'
	 * 	| 'MH'
	 * 	| 'MK'
	 * 	| 'ML'
	 * 	| 'MM'
	 * 	| 'MN'
	 * 	| 'MO'
	 * 	| 'MP'
	 * 	| 'MQ'
	 * 	| 'MR'
	 * 	| 'MS'
	 * 	| 'MT'
	 * 	| 'MU'
	 * 	| 'MV'
	 * 	| 'MW'
	 * 	| 'MX'
	 * 	| 'MY'
	 * 	| 'MZ'
	 * 	| 'NA'
	 * 	| 'NC'
	 * 	| 'NE'
	 * 	| 'NF'
	 * 	| 'NG'
	 * 	| 'NI'
	 * 	| 'NL'
	 * 	| 'NO'
	 * 	| 'NP'
	 * 	| 'NR'
	 * 	| 'NU'
	 * 	| 'NZ'
	 * 	| 'OM'
	 * 	| 'PA'
	 * 	| 'PE'
	 * 	| 'PF'
	 * 	| 'PG'
	 * 	| 'PH'
	 * 	| 'PK'
	 * 	| 'PL'
	 * 	| 'PM'
	 * 	| 'PN'
	 * 	| 'PR'
	 * 	| 'PS'
	 * 	| 'PT'
	 * 	| 'PW'
	 * 	| 'PY'
	 * 	| 'QA'
	 * 	| 'RE'
	 * 	| 'RO'
	 * 	| 'RS'
	 * 	| 'RU'
	 * 	| 'RW'
	 * 	| 'SA'
	 * 	| 'SB'
	 * 	| 'SC'
	 * 	| 'SD'
	 * 	| 'SE'
	 * 	| 'SG'
	 * 	| 'SH'
	 * 	| 'SI'
	 * 	| 'SJ'
	 * 	| 'SK'
	 * 	| 'SL'
	 * 	| 'SM'
	 * 	| 'SN'
	 * 	| 'SO'
	 * 	| 'SR'
	 * 	| 'SS'
	 * 	| 'ST'
	 * 	| 'SV'
	 * 	| 'SX'
	 * 	| 'SY'
	 * 	| 'SZ'
	 * 	| 'TC'
	 * 	| 'TD'
	 * 	| 'TF'
	 * 	| 'TG'
	 * 	| 'TH'
	 * 	| 'TJ'
	 * 	| 'TK'
	 * 	| 'TM'
	 * 	| 'TN'
	 * 	| 'TO'
	 * 	| 'TL'
	 * 	| 'TR'
	 * 	| 'TT'
	 * 	| 'TV'
	 * 	| 'TW'
	 * 	| 'TZ'
	 * 	| 'UA'
	 * 	| 'UG'
	 * 	| 'UM'
	 * 	| 'US'
	 * 	| 'UY'
	 * 	| 'UZ'
	 * 	| 'VA'
	 * 	| 'VC'
	 * 	| 'VE'
	 * 	| 'VG'
	 * 	| 'VI'
	 * 	| 'VN'
	 * 	| 'VU'
	 * 	| 'WF'
	 * 	| 'WS'
	 * 	| 'YE'
	 * 	| 'YT'
	 * 	| 'ZA'
	 * 	| 'ZM'
	 * 	| 'ZW'
	 * )[]} [params.countries]
	 *   - ISO 3166-1 country codes, such as `US` or `CN`.
	 *
	 * @param {('AF' | 'AS' | 'EU' | 'NA' | 'OC' | 'OT' | 'SA')[]} [params.continents] - Continent codes.
	 * @param {(
	 * 	| 'US-AL'
	 * 	| 'US-AK'
	 * 	| 'US-AZ'
	 * 	| 'US-AR'
	 * 	| 'US-CA'
	 * 	| 'US-CO'
	 * 	| 'US-CT'
	 * 	| 'US-DE'
	 * 	| 'US-DC'
	 * 	| 'US-FL'
	 * 	| 'US-GA'
	 * 	| 'US-HI'
	 * 	| 'US-ID'
	 * 	| 'US-IL'
	 * 	| 'US-IN'
	 * 	| 'US-IA'
	 * 	| 'US-KS'
	 * 	| 'US-KY'
	 * 	| 'US-LA'
	 * 	| 'US-ME'
	 * 	| 'US-MD'
	 * 	| 'US-MA'
	 * 	| 'US-MI'
	 * 	| 'US-MN'
	 * 	| 'US-MS'
	 * 	| 'US-MO'
	 * 	| 'US-MT'
	 * 	| 'US-NE'
	 * 	| 'US-NV'
	 * 	| 'US-NH'
	 * 	| 'US-NJ'
	 * 	| 'US-NM'
	 * 	| 'US-NY'
	 * 	| 'US-NC'
	 * 	| 'US-ND'
	 * 	| 'US-OH'
	 * 	| 'US-OK'
	 * 	| 'US-OR'
	 * 	| 'US-PA'
	 * 	| 'US-RI'
	 * 	| 'US-SC'
	 * 	| 'US-SD'
	 * 	| 'US-TN'
	 * 	| 'US-TX'
	 * 	| 'US-UT'
	 * 	| 'US-VT'
	 * 	| 'US-VA'
	 * 	| 'US-WA'
	 * 	| 'US-WV'
	 * 	| 'US-WI'
	 * 	| 'US-WY'
	 * 	| 'CA-AB'
	 * 	| 'CA-BC'
	 * 	| 'CA-MB'
	 * 	| 'CA-NB'
	 * 	| 'CA-NF'
	 * 	| 'CA-NS'
	 * 	| 'CA-NT'
	 * 	| 'CA-NU'
	 * 	| 'CA-ON'
	 * 	| 'CA-PE'
	 * 	| 'CA-QC'
	 * 	| 'CA-SK'
	 * 	| 'CA-YT'
	 * 	| 'AU-ACT'
	 * 	| 'AU-NSW'
	 * 	| 'AU-NT'
	 * 	| 'AU-QLD'
	 * 	| 'AU-SA'
	 * 	| 'AU-TAS'
	 * 	| 'AU-VIC'
	 * 	| 'AU-WA'
	 * 	| 'GB-EN'
	 * 	| 'GB-NI'
	 * 	| 'GB-SC'
	 * 	| 'GB-WA'
	 * 	| 'JP-00'
	 * 	| 'JP-01'
	 * 	| 'JP-02'
	 * 	| 'JP-03'
	 * 	| 'JP-04'
	 * 	| 'JP-05'
	 * 	| 'JP-06'
	 * 	| 'JP-07'
	 * 	| 'JP-08'
	 * 	| 'JP-09'
	 * 	| 'JP-10'
	 * 	| 'JP-11'
	 * 	| 'JP-12'
	 * 	| 'JP-13'
	 * 	| 'JP-14'
	 * 	| 'JP-15'
	 * 	| 'JP-16'
	 * 	| 'JP-17'
	 * 	| 'JP-18'
	 * 	| 'JP-19'
	 * 	| 'JP-20'
	 * 	| 'JP-21'
	 * 	| 'JP-22'
	 * 	| 'JP-23'
	 * 	| 'JP-24'
	 * 	| 'JP-25'
	 * 	| 'JP-26'
	 * 	| 'JP-27'
	 * 	| 'JP-28'
	 * 	| 'JP-29'
	 * 	| 'JP-30'
	 * 	| 'JP-31'
	 * 	| 'JP-32'
	 * 	| 'JP-33'
	 * 	| 'JP-34'
	 * 	| 'JP-35'
	 * 	| 'JP-36'
	 * 	| 'JP-37'
	 * 	| 'JP-38'
	 * 	| 'JP-39'
	 * 	| 'JP-40'
	 * 	| 'JP-41'
	 * 	| 'JP-42'
	 * 	| 'JP-43'
	 * 	| 'JP-44'
	 * 	| 'JP-45'
	 * 	| 'JP-46'
	 * 	| 'JP-47'
	 * 	| 'BR-AC'
	 * 	| 'BR-AL'
	 * 	| 'BR-AM'
	 * 	| 'BR-AP'
	 * 	| 'BR-BA'
	 * 	| 'BR-CE'
	 * 	| 'BR-DF'
	 * 	| 'BR-ES'
	 * 	| 'BR-GO'
	 * 	| 'BR-IS'
	 * 	| 'BR-MA'
	 * 	| 'BR-MG'
	 * 	| 'BR-MS'
	 * 	| 'BR-MT'
	 * 	| 'BR-PA'
	 * 	| 'BR-PB'
	 * 	| 'BR-PE'
	 * 	| 'BR-PI'
	 * 	| 'BR-PR'
	 * 	| 'BR-RJ'
	 * 	| 'BR-RN'
	 * 	| 'BR-RO'
	 * 	| 'BR-RR'
	 * 	| 'BR-RS'
	 * 	| 'BR-SC'
	 * 	| 'BR-SE'
	 * 	| 'BR-SP'
	 * 	| 'BR-TO'
	 * 	| 'DE-BB'
	 * 	| 'DE-BE'
	 * 	| 'DE-BW'
	 * 	| 'DE-BY'
	 * 	| 'DE-HB'
	 * 	| 'DE-HE'
	 * 	| 'DE-HH'
	 * 	| 'DE-MV'
	 * 	| 'DE-NI'
	 * 	| 'DE-NW'
	 * 	| 'DE-RP'
	 * 	| 'DE-SH'
	 * 	| 'DE-SL'
	 * 	| 'DE-SN'
	 * 	| 'DE-ST'
	 * 	| 'DE-TH'
	 * 	| 'FR-ARA'
	 * 	| 'FR-BFC'
	 * 	| 'FR-BRE'
	 * 	| 'FR-CVL'
	 * 	| 'FR-COR'
	 * 	| 'FR-GES'
	 * 	| 'FR-HDF'
	 * 	| 'FR-IDF'
	 * 	| 'FR-NOR'
	 * 	| 'FR-NAQ'
	 * 	| 'FR-OCC'
	 * 	| 'FR-PDL'
	 * 	| 'FR-PAC'
	 * 	| 'CH-AG'
	 * 	| 'CH-AI'
	 * 	| 'CH-AR'
	 * 	| 'CH-BE'
	 * 	| 'CH-BL'
	 * 	| 'CH-BS'
	 * 	| 'CH-FR'
	 * 	| 'CH-GE'
	 * 	| 'CH-GL'
	 * 	| 'CH-GR'
	 * 	| 'CH-JU'
	 * 	| 'CH-LU'
	 * 	| 'CH-NE'
	 * 	| 'CH-NW'
	 * 	| 'CH-OW'
	 * 	| 'CH-SG'
	 * 	| 'CH-SH'
	 * 	| 'CH-SO'
	 * 	| 'CH-SZ'
	 * 	| 'CH-TG'
	 * 	| 'CH-TI'
	 * 	| 'CH-UR'
	 * 	| 'CH-VD'
	 * 	| 'CH-VS'
	 * 	| 'CH-ZG'
	 * 	| 'CH-ZH'
	 * 	| 'CN-AH'
	 * 	| 'CN-BJ'
	 * 	| 'CN-CQ'
	 * 	| 'CN-FJ'
	 * 	| 'CN-GS'
	 * 	| 'CN-GD'
	 * 	| 'CN-GX'
	 * 	| 'CN-GZ'
	 * 	| 'CN-HI'
	 * 	| 'CN-HE'
	 * 	| 'CN-HL'
	 * 	| 'CN-HA'
	 * 	| 'CN-HB'
	 * 	| 'CN-HN'
	 * 	| 'CN-JS'
	 * 	| 'CN-JX'
	 * 	| 'CN-JL'
	 * 	| 'CN-LN'
	 * 	| 'CN-NM'
	 * 	| 'CN-NX'
	 * 	| 'CN-QH'
	 * 	| 'CN-SN'
	 * 	| 'CN-SD'
	 * 	| 'CN-SH'
	 * 	| 'CN-SX'
	 * 	| 'CN-SC'
	 * 	| 'CN-TJ'
	 * 	| 'CN-XJ'
	 * 	| 'CN-XZ'
	 * 	| 'CN-YN'
	 * 	| 'CN-ZJ'
	 * 	| 'IN-AN'
	 * 	| 'IN-AP'
	 * 	| 'IN-AR'
	 * 	| 'IN-AS'
	 * 	| 'IN-BR'
	 * 	| 'IN-CH'
	 * 	| 'IN-CT'
	 * 	| 'IN-DD'
	 * 	| 'IN-DL'
	 * 	| 'IN-DN'
	 * 	| 'IN-GA'
	 * 	| 'IN-GJ'
	 * 	| 'IN-HP'
	 * 	| 'IN-HR'
	 * 	| 'IN-JH'
	 * 	| 'IN-JK'
	 * 	| 'IN-KA'
	 * 	| 'IN-KL'
	 * 	| 'IN-LD'
	 * 	| 'IN-MH'
	 * 	| 'IN-ML'
	 * 	| 'IN-MN'
	 * 	| 'IN-MP'
	 * 	| 'IN-MZ'
	 * 	| 'IN-NL'
	 * 	| 'IN-OR'
	 * 	| 'IN-PB'
	 * 	| 'IN-PY'
	 * 	| 'IN-RJ'
	 * 	| 'IN-SK'
	 * 	| 'IN-TG'
	 * 	| 'IN-TN'
	 * 	| 'IN-TR'
	 * 	| 'IN-UL'
	 * 	| 'IN-UP'
	 * 	| 'IN-WB'
	 * 	| 'SE-K'
	 * 	| 'SE-X'
	 * 	| 'SE-I'
	 * 	| 'SE-N'
	 * 	| 'SE-Z'
	 * 	| 'SE-F'
	 * 	| 'SE-H'
	 * 	| 'SE-W'
	 * 	| 'SE-G'
	 * 	| 'SE-BD'
	 * 	| 'SE-T'
	 * 	| 'SE-E'
	 * 	| 'SE-D'
	 * 	| 'SE-C'
	 * 	| 'SE-S'
	 * 	| 'SE-AC'
	 * 	| 'SE-Y'
	 * 	| 'SE-U'
	 * 	| 'SE-AB'
	 * 	| 'SE-M'
	 * 	| 'SE-O'
	 * 	| 'MX-AGU'
	 * 	| 'MX-BCN'
	 * 	| 'MX-BCS'
	 * 	| 'MX-CAM'
	 * 	| 'MX-CHP'
	 * 	| 'MX-CHH'
	 * 	| 'MX-COA'
	 * 	| 'MX-COL'
	 * 	| 'MX-DIF'
	 * 	| 'MX-DUR'
	 * 	| 'MX-GUA'
	 * 	| 'MX-GRO'
	 * 	| 'MX-HID'
	 * 	| 'MX-JAL'
	 * 	| 'MX-MEX'
	 * 	| 'MX-MIC'
	 * 	| 'MX-MOR'
	 * 	| 'MX-NAY'
	 * 	| 'MX-NLE'
	 * 	| 'MX-OAX'
	 * 	| 'MX-PUE'
	 * 	| 'MX-QUE'
	 * 	| 'MX-ROO'
	 * 	| 'MX-SLP'
	 * 	| 'MX-SIN'
	 * 	| 'MX-SON'
	 * 	| 'MX-TAB'
	 * 	| 'MX-TAM'
	 * 	| 'MX-TLA'
	 * 	| 'MX-VER'
	 * 	| 'MX-YUC'
	 * 	| 'MX-ZAC'
	 * 	| 'UA-CK'
	 * 	| 'UA-CH'
	 * 	| 'UA-CV'
	 * 	| 'UA-CRIMEA'
	 * 	| 'UA-DP'
	 * 	| 'UA-DT'
	 * 	| 'UA-IF'
	 * 	| 'UA-KK'
	 * 	| 'UA-KS'
	 * 	| 'UA-KM'
	 * 	| 'UA-KV'
	 * 	| 'UA-KH'
	 * 	| 'UA-LH'
	 * 	| 'UA-LV'
	 * 	| 'UA-MY'
	 * 	| 'UA-OD'
	 * 	| 'UA-PL'
	 * 	| 'UA-RV'
	 * 	| 'UA-SM'
	 * 	| 'UA-TP'
	 * 	| 'UA-ZK'
	 * 	| 'UA-VI'
	 * 	| 'UA-VO'
	 * 	| 'UA-ZP'
	 * 	| 'UA-ZT'
	 * )[]} [params.regions]
	 *   - ISO 3166 country and region codes, for example `US:MA` for Massachusetts or `JP:13` for Tokyo.
	 *
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/matches | Akamai Techdocs}
	 */
	onServerLocation(params: {
		/** Indicates the geographic scope. Default: "COUNTRY". */
		locationType?: 'COUNTRY' | 'CONTINENT' | 'REGION';

		/**
		 * Matches the specified set of values when set to `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match.
		 * Default: "IS_ONE_OF".
		 */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF';

		/** ISO 3166-1 country codes, such as `US` or `CN`. */
		countries?: Array<
			| 'AD'
			| 'AE'
			| 'AF'
			| 'AG'
			| 'AI'
			| 'AL'
			| 'AM'
			| 'AO'
			| 'AQ'
			| 'AR'
			| 'AS'
			| 'AT'
			| 'AU'
			| 'AW'
			| 'AZ'
			| 'BA'
			| 'BB'
			| 'BD'
			| 'BE'
			| 'BF'
			| 'BG'
			| 'BH'
			| 'BI'
			| 'BJ'
			| 'BL'
			| 'BM'
			| 'BN'
			| 'BO'
			| 'BQ'
			| 'BR'
			| 'BS'
			| 'BT'
			| 'BV'
			| 'BW'
			| 'BY'
			| 'BZ'
			| 'CA'
			| 'CC'
			| 'CD'
			| 'CF'
			| 'CG'
			| 'CH'
			| 'CI'
			| 'CK'
			| 'CL'
			| 'CM'
			| 'CN'
			| 'CO'
			| 'CR'
			| 'CU'
			| 'CV'
			| 'CW'
			| 'CX'
			| 'CY'
			| 'CZ'
			| 'DE'
			| 'DJ'
			| 'DK'
			| 'DM'
			| 'DO'
			| 'DZ'
			| 'EC'
			| 'EE'
			| 'EG'
			| 'EH'
			| 'ER'
			| 'ES'
			| 'ET'
			| 'EU'
			| 'FI'
			| 'FJ'
			| 'FK'
			| 'FM'
			| 'FO'
			| 'FR'
			| 'GA'
			| 'GB'
			| 'GD'
			| 'GE'
			| 'GF'
			| 'GH'
			| 'GI'
			| 'GG'
			| 'GL'
			| 'GM'
			| 'GN'
			| 'GP'
			| 'GQ'
			| 'GR'
			| 'GS'
			| 'GT'
			| 'GU'
			| 'GW'
			| 'GY'
			| 'HK'
			| 'HM'
			| 'HN'
			| 'HR'
			| 'HT'
			| 'HU'
			| 'ID'
			| 'IE'
			| 'IL'
			| 'IM'
			| 'IN'
			| 'IO'
			| 'IQ'
			| 'IR'
			| 'IS'
			| 'IT'
			| 'JE'
			| 'JM'
			| 'JO'
			| 'JP'
			| 'KE'
			| 'KG'
			| 'KH'
			| 'KI'
			| 'KM'
			| 'KN'
			| 'KP'
			| 'KR'
			| 'KW'
			| 'KY'
			| 'KZ'
			| 'LA'
			| 'LB'
			| 'LC'
			| 'LI'
			| 'LK'
			| 'LR'
			| 'LS'
			| 'LT'
			| 'LU'
			| 'LV'
			| 'LY'
			| 'MA'
			| 'MC'
			| 'MD'
			| 'ME'
			| 'MF'
			| 'MG'
			| 'MH'
			| 'MK'
			| 'ML'
			| 'MM'
			| 'MN'
			| 'MO'
			| 'MP'
			| 'MQ'
			| 'MR'
			| 'MS'
			| 'MT'
			| 'MU'
			| 'MV'
			| 'MW'
			| 'MX'
			| 'MY'
			| 'MZ'
			| 'NA'
			| 'NC'
			| 'NE'
			| 'NF'
			| 'NG'
			| 'NI'
			| 'NL'
			| 'NO'
			| 'NP'
			| 'NR'
			| 'NU'
			| 'NZ'
			| 'OM'
			| 'PA'
			| 'PE'
			| 'PF'
			| 'PG'
			| 'PH'
			| 'PK'
			| 'PL'
			| 'PM'
			| 'PN'
			| 'PR'
			| 'PS'
			| 'PT'
			| 'PW'
			| 'PY'
			| 'QA'
			| 'RE'
			| 'RO'
			| 'RS'
			| 'RU'
			| 'RW'
			| 'SA'
			| 'SB'
			| 'SC'
			| 'SD'
			| 'SE'
			| 'SG'
			| 'SH'
			| 'SI'
			| 'SJ'
			| 'SK'
			| 'SL'
			| 'SM'
			| 'SN'
			| 'SO'
			| 'SR'
			| 'SS'
			| 'ST'
			| 'SV'
			| 'SX'
			| 'SY'
			| 'SZ'
			| 'TC'
			| 'TD'
			| 'TF'
			| 'TG'
			| 'TH'
			| 'TJ'
			| 'TK'
			| 'TM'
			| 'TN'
			| 'TO'
			| 'TL'
			| 'TR'
			| 'TT'
			| 'TV'
			| 'TW'
			| 'TZ'
			| 'UA'
			| 'UG'
			| 'UM'
			| 'US'
			| 'UY'
			| 'UZ'
			| 'VA'
			| 'VC'
			| 'VE'
			| 'VG'
			| 'VI'
			| 'VN'
			| 'VU'
			| 'WF'
			| 'WS'
			| 'YE'
			| 'YT'
			| 'ZA'
			| 'ZM'
			| 'ZW'
		>;

		/** Continent codes. */
		continents?: Array<'AF' | 'AS' | 'EU' | 'NA' | 'OC' | 'OT' | 'SA'>;

		/** ISO 3166 country and region codes, for example `US:MA` for Massachusetts or `JP:13` for Tokyo. */
		regions?: Array<
			| 'US-AL'
			| 'US-AK'
			| 'US-AZ'
			| 'US-AR'
			| 'US-CA'
			| 'US-CO'
			| 'US-CT'
			| 'US-DE'
			| 'US-DC'
			| 'US-FL'
			| 'US-GA'
			| 'US-HI'
			| 'US-ID'
			| 'US-IL'
			| 'US-IN'
			| 'US-IA'
			| 'US-KS'
			| 'US-KY'
			| 'US-LA'
			| 'US-ME'
			| 'US-MD'
			| 'US-MA'
			| 'US-MI'
			| 'US-MN'
			| 'US-MS'
			| 'US-MO'
			| 'US-MT'
			| 'US-NE'
			| 'US-NV'
			| 'US-NH'
			| 'US-NJ'
			| 'US-NM'
			| 'US-NY'
			| 'US-NC'
			| 'US-ND'
			| 'US-OH'
			| 'US-OK'
			| 'US-OR'
			| 'US-PA'
			| 'US-RI'
			| 'US-SC'
			| 'US-SD'
			| 'US-TN'
			| 'US-TX'
			| 'US-UT'
			| 'US-VT'
			| 'US-VA'
			| 'US-WA'
			| 'US-WV'
			| 'US-WI'
			| 'US-WY'
			| 'CA-AB'
			| 'CA-BC'
			| 'CA-MB'
			| 'CA-NB'
			| 'CA-NF'
			| 'CA-NS'
			| 'CA-NT'
			| 'CA-NU'
			| 'CA-ON'
			| 'CA-PE'
			| 'CA-QC'
			| 'CA-SK'
			| 'CA-YT'
			| 'AU-ACT'
			| 'AU-NSW'
			| 'AU-NT'
			| 'AU-QLD'
			| 'AU-SA'
			| 'AU-TAS'
			| 'AU-VIC'
			| 'AU-WA'
			| 'GB-EN'
			| 'GB-NI'
			| 'GB-SC'
			| 'GB-WA'
			| 'JP-00'
			| 'JP-01'
			| 'JP-02'
			| 'JP-03'
			| 'JP-04'
			| 'JP-05'
			| 'JP-06'
			| 'JP-07'
			| 'JP-08'
			| 'JP-09'
			| 'JP-10'
			| 'JP-11'
			| 'JP-12'
			| 'JP-13'
			| 'JP-14'
			| 'JP-15'
			| 'JP-16'
			| 'JP-17'
			| 'JP-18'
			| 'JP-19'
			| 'JP-20'
			| 'JP-21'
			| 'JP-22'
			| 'JP-23'
			| 'JP-24'
			| 'JP-25'
			| 'JP-26'
			| 'JP-27'
			| 'JP-28'
			| 'JP-29'
			| 'JP-30'
			| 'JP-31'
			| 'JP-32'
			| 'JP-33'
			| 'JP-34'
			| 'JP-35'
			| 'JP-36'
			| 'JP-37'
			| 'JP-38'
			| 'JP-39'
			| 'JP-40'
			| 'JP-41'
			| 'JP-42'
			| 'JP-43'
			| 'JP-44'
			| 'JP-45'
			| 'JP-46'
			| 'JP-47'
			| 'BR-AC'
			| 'BR-AL'
			| 'BR-AM'
			| 'BR-AP'
			| 'BR-BA'
			| 'BR-CE'
			| 'BR-DF'
			| 'BR-ES'
			| 'BR-GO'
			| 'BR-IS'
			| 'BR-MA'
			| 'BR-MG'
			| 'BR-MS'
			| 'BR-MT'
			| 'BR-PA'
			| 'BR-PB'
			| 'BR-PE'
			| 'BR-PI'
			| 'BR-PR'
			| 'BR-RJ'
			| 'BR-RN'
			| 'BR-RO'
			| 'BR-RR'
			| 'BR-RS'
			| 'BR-SC'
			| 'BR-SE'
			| 'BR-SP'
			| 'BR-TO'
			| 'DE-BB'
			| 'DE-BE'
			| 'DE-BW'
			| 'DE-BY'
			| 'DE-HB'
			| 'DE-HE'
			| 'DE-HH'
			| 'DE-MV'
			| 'DE-NI'
			| 'DE-NW'
			| 'DE-RP'
			| 'DE-SH'
			| 'DE-SL'
			| 'DE-SN'
			| 'DE-ST'
			| 'DE-TH'
			| 'FR-ARA'
			| 'FR-BFC'
			| 'FR-BRE'
			| 'FR-CVL'
			| 'FR-COR'
			| 'FR-GES'
			| 'FR-HDF'
			| 'FR-IDF'
			| 'FR-NOR'
			| 'FR-NAQ'
			| 'FR-OCC'
			| 'FR-PDL'
			| 'FR-PAC'
			| 'CH-AG'
			| 'CH-AI'
			| 'CH-AR'
			| 'CH-BE'
			| 'CH-BL'
			| 'CH-BS'
			| 'CH-FR'
			| 'CH-GE'
			| 'CH-GL'
			| 'CH-GR'
			| 'CH-JU'
			| 'CH-LU'
			| 'CH-NE'
			| 'CH-NW'
			| 'CH-OW'
			| 'CH-SG'
			| 'CH-SH'
			| 'CH-SO'
			| 'CH-SZ'
			| 'CH-TG'
			| 'CH-TI'
			| 'CH-UR'
			| 'CH-VD'
			| 'CH-VS'
			| 'CH-ZG'
			| 'CH-ZH'
			| 'CN-AH'
			| 'CN-BJ'
			| 'CN-CQ'
			| 'CN-FJ'
			| 'CN-GS'
			| 'CN-GD'
			| 'CN-GX'
			| 'CN-GZ'
			| 'CN-HI'
			| 'CN-HE'
			| 'CN-HL'
			| 'CN-HA'
			| 'CN-HB'
			| 'CN-HN'
			| 'CN-JS'
			| 'CN-JX'
			| 'CN-JL'
			| 'CN-LN'
			| 'CN-NM'
			| 'CN-NX'
			| 'CN-QH'
			| 'CN-SN'
			| 'CN-SD'
			| 'CN-SH'
			| 'CN-SX'
			| 'CN-SC'
			| 'CN-TJ'
			| 'CN-XJ'
			| 'CN-XZ'
			| 'CN-YN'
			| 'CN-ZJ'
			| 'IN-AN'
			| 'IN-AP'
			| 'IN-AR'
			| 'IN-AS'
			| 'IN-BR'
			| 'IN-CH'
			| 'IN-CT'
			| 'IN-DD'
			| 'IN-DL'
			| 'IN-DN'
			| 'IN-GA'
			| 'IN-GJ'
			| 'IN-HP'
			| 'IN-HR'
			| 'IN-JH'
			| 'IN-JK'
			| 'IN-KA'
			| 'IN-KL'
			| 'IN-LD'
			| 'IN-MH'
			| 'IN-ML'
			| 'IN-MN'
			| 'IN-MP'
			| 'IN-MZ'
			| 'IN-NL'
			| 'IN-OR'
			| 'IN-PB'
			| 'IN-PY'
			| 'IN-RJ'
			| 'IN-SK'
			| 'IN-TG'
			| 'IN-TN'
			| 'IN-TR'
			| 'IN-UL'
			| 'IN-UP'
			| 'IN-WB'
			| 'SE-K'
			| 'SE-X'
			| 'SE-I'
			| 'SE-N'
			| 'SE-Z'
			| 'SE-F'
			| 'SE-H'
			| 'SE-W'
			| 'SE-G'
			| 'SE-BD'
			| 'SE-T'
			| 'SE-E'
			| 'SE-D'
			| 'SE-C'
			| 'SE-S'
			| 'SE-AC'
			| 'SE-Y'
			| 'SE-U'
			| 'SE-AB'
			| 'SE-M'
			| 'SE-O'
			| 'MX-AGU'
			| 'MX-BCN'
			| 'MX-BCS'
			| 'MX-CAM'
			| 'MX-CHP'
			| 'MX-CHH'
			| 'MX-COA'
			| 'MX-COL'
			| 'MX-DIF'
			| 'MX-DUR'
			| 'MX-GUA'
			| 'MX-GRO'
			| 'MX-HID'
			| 'MX-JAL'
			| 'MX-MEX'
			| 'MX-MIC'
			| 'MX-MOR'
			| 'MX-NAY'
			| 'MX-NLE'
			| 'MX-OAX'
			| 'MX-PUE'
			| 'MX-QUE'
			| 'MX-ROO'
			| 'MX-SLP'
			| 'MX-SIN'
			| 'MX-SON'
			| 'MX-TAB'
			| 'MX-TAM'
			| 'MX-TLA'
			| 'MX-VER'
			| 'MX-YUC'
			| 'MX-ZAC'
			| 'UA-CK'
			| 'UA-CH'
			| 'UA-CV'
			| 'UA-CRIMEA'
			| 'UA-DP'
			| 'UA-DT'
			| 'UA-IF'
			| 'UA-KK'
			| 'UA-KS'
			| 'UA-KM'
			| 'UA-KV'
			| 'UA-KH'
			| 'UA-LH'
			| 'UA-LV'
			| 'UA-MY'
			| 'UA-OD'
			| 'UA-PL'
			| 'UA-RV'
			| 'UA-SM'
			| 'UA-TP'
			| 'UA-ZK'
			| 'UA-VI'
			| 'UA-VO'
			| 'UA-ZP'
			| 'UA-ZT'
		>;
	}): CriteriaBuilder {
		if (typeof params.locationType === 'undefined') {
			params.locationType = 'COUNTRY';
		}

		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'serverLocation', {}, params));
	}

	/**
	 * Specifies ranges of times during which the request occurred.
	 *
	 * @param {object} params - The parameters needed to configure onTime
	 * @param {'BEGINNING' | 'BETWEEN' | 'LASTING' | 'REPEATING'} [params.matchOperator] - Specifies how to define the
	 *   range of time. Default: "BEGINNING".
	 * @param {string} [params.repeatInterval] - Sets the time between each repeating time period's starting points.
	 *   Default: "1d".
	 * @param {string} [params.repeatDuration] - Sets the duration of each repeating time period. Default: "1d".
	 * @param {string} [params.lastingDuration] - Specifies the end of a time period as a duration relative to the
	 *   `lastingDate`. Default: "1d".
	 * @param {string} [params.lastingDate] - Sets the start of a fixed time period.
	 * @param {string} [params.repeatBeginDate] - Sets the start of the initial time period.
	 * @param {boolean} [params.applyDaylightSavingsTime] - Adjusts the start time plus repeat interval to account for
	 *   daylight saving time. Applies when the current time and the start time use different systems, daylight and
	 *   standard, and the two values are in conflict. Default: true.
	 * @param {string} [params.beginDate] - Sets the start of a time period.
	 * @param {string} [params.endDate] - Sets the end of a fixed time period.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/time-interval | Akamai Techdocs}
	 */
	onTime(params: {
		/** Specifies how to define the range of time. Default: "BEGINNING". */
		matchOperator?: 'BEGINNING' | 'BETWEEN' | 'LASTING' | 'REPEATING';

		/** Sets the time between each repeating time period's starting points. Default: "1d". */
		repeatInterval?: string;

		/** Sets the duration of each repeating time period. Default: "1d". */
		repeatDuration?: string;

		/** Specifies the end of a time period as a duration relative to the `lastingDate`. Default: "1d". */
		lastingDuration?: string;

		/** Sets the start of a fixed time period. */
		lastingDate?: string;

		/** Sets the start of the initial time period. */
		repeatBeginDate?: string;

		/**
		 * Adjusts the start time plus repeat interval to account for daylight saving time. Applies when the current
		 * time and the start time use different systems, daylight and standard, and the two values are in conflict.
		 * Default: true.
		 */
		applyDaylightSavingsTime?: boolean;

		/** Sets the start of a time period. */
		beginDate?: string;

		/** Sets the end of a fixed time period. */
		endDate?: string;
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'BEGINNING';
		}

		if (typeof params.repeatInterval === 'undefined' && (params.matchOperator as unknown) === 'REPEATING') {
			params.repeatInterval = '1d';
		}

		if (typeof params.repeatDuration === 'undefined' && (params.matchOperator as unknown) === 'REPEATING') {
			params.repeatDuration = '1d';
		}

		if (typeof params.lastingDuration === 'undefined' && (params.matchOperator as unknown) === 'LASTING') {
			params.lastingDuration = '1d';
		}

		if (
			typeof params.applyDaylightSavingsTime === 'undefined' &&
			(params.matchOperator as unknown) === 'REPEATING'
		) {
			params.applyDaylightSavingsTime = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'time', {}, params));
	}

	/**
	 * Matches the user agent string that helps identify the client browser and device.
	 *
	 * @param {object} params - The parameters needed to configure onUserAgent
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF'} [params.matchOperator] - Matches the specified set of `values` when set to
	 *   `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match. Default: "IS_ONE_OF".
	 * @param {string[]} params.values - The `User-Agent` header's value. For example, `Mozilla/4.0 (compatible; MSIE
	 *   6.0; Windows NT 5.1)`.
	 * @param {boolean} [params.matchWildcard] - Allows wildcards in the `value` field, where `?` matches a single
	 *   character and `*` matches zero or more characters. For example, `*Android*`, `*iPhone5*`, `*Firefox*`, or
	 *   `*Chrome*` allow substring matches. Default: true.
	 * @param {boolean} [params.matchCaseSensitive] - Sets a case-sensitive match for the `value` field. Default: false.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/user-agent | Akamai Techdocs}
	 */
	onUserAgent(params: {
		/**
		 * Matches the specified set of `values` when set to `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match.
		 * Default: "IS_ONE_OF".
		 */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF';

		/** The `User-Agent` header's value. For example, `Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)`. */
		values: string[];

		/**
		 * Allows wildcards in the `value` field, where `?` matches a single character and `*` matches zero or more
		 * characters. For example, `*Android*`, `*iPhone5*`, `*Firefox*`, or `*Chrome*` allow substring matches.
		 * Default: true.
		 */
		matchWildcard?: boolean;

		/** Sets a case-sensitive match for the `value` field. Default: false. */
		matchCaseSensitive?: boolean;
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (typeof params.matchWildcard === 'undefined') {
			params.matchWildcard = true;
		}

		if (typeof params.matchCaseSensitive === 'undefined') {
			params.matchCaseSensitive = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'userAgent', {}, params));
	}

	/**
	 * Match on Auth Token 2.0 verification results.
	 *
	 * @param {object} params - The parameters needed to configure onTokenAuthorization
	 * @param {'IS_SUCCESS' | 'IS_CUSTOM_FAILURE' | 'IS_ANY_FAILURE'} [params.matchOperator] - Error match scope.
	 *   Default: "IS_ANY_FAILURE".
	 * @param {(
	 * 	| 'INVALID_HMAC_KEY'
	 * 	| 'INVALID_DELIMITER'
	 * 	| 'INVALID_ACL_DELIMITER'
	 * 	| 'INVALID_IP'
	 * 	| 'INVALID_URL'
	 * 	| 'MISSING_EXPIRATION_TIME'
	 * 	| 'NEED_URL_XOR_ACL'
	 * 	| 'UNSUPPORTED_VERSION'
	 * 	| 'MISSING_TOKEN'
	 * 	| 'MISSING_URL'
	 * 	| 'INVALID_TOKEN'
	 * 	| 'INVALID_HMAC'
	 * 	| 'TOKEN_NOT_VALID_YET'
	 * 	| 'EXPIRED_TOKEN'
	 * 	| 'UNAUTHORIZED_IP'
	 * 	| 'UNAUTHORIZED_URL'
	 * 	| 'INVALID_EXPIRATION_TIME'
	 * )[]} [params.statusList]
	 *   - Match specific failure cases. Default:
	 *       ["INVALID_HMAC_KEY","INVALID_DELIMITER","INVALID_ACL_DELIMITER","INVALID_IP","INVALID_URL","MISSING_EXPIRATION_TIME","NEED_URL_XOR_ACL","UNSUPPORTED_VERSION","MISSING_TOKEN","MISSING_URL","INVALID_TOKEN","INVALID_HMAC","TOKEN_NOT_VALID_YET","EXPIRED_TOKEN","UNAUTHORIZED_IP","UNAUTHORIZED_URL","INVALID_EXPIRATION_TIME"].
	 *
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/token-ver-result | Akamai Techdocs}
	 */
	onTokenAuthorization(params: {
		/** Error match scope. Default: "IS_ANY_FAILURE". */
		matchOperator?: 'IS_SUCCESS' | 'IS_CUSTOM_FAILURE' | 'IS_ANY_FAILURE';

		/**
		 * Match specific failure cases. Default:
		 * ["INVALID_HMAC_KEY","INVALID_DELIMITER","INVALID_ACL_DELIMITER","INVALID_IP","INVALID_URL","MISSING_EXPIRATION_TIME","NEED_URL_XOR_ACL","UNSUPPORTED_VERSION","MISSING_TOKEN","MISSING_URL","INVALID_TOKEN","INVALID_HMAC","TOKEN_NOT_VALID_YET","EXPIRED_TOKEN","UNAUTHORIZED_IP","UNAUTHORIZED_URL","INVALID_EXPIRATION_TIME"].
		 */
		statusList?: Array<
			| 'INVALID_HMAC_KEY'
			| 'INVALID_DELIMITER'
			| 'INVALID_ACL_DELIMITER'
			| 'INVALID_IP'
			| 'INVALID_URL'
			| 'MISSING_EXPIRATION_TIME'
			| 'NEED_URL_XOR_ACL'
			| 'UNSUPPORTED_VERSION'
			| 'MISSING_TOKEN'
			| 'MISSING_URL'
			| 'INVALID_TOKEN'
			| 'INVALID_HMAC'
			| 'TOKEN_NOT_VALID_YET'
			| 'EXPIRED_TOKEN'
			| 'UNAUTHORIZED_IP'
			| 'UNAUTHORIZED_URL'
			| 'INVALID_EXPIRATION_TIME'
		>;
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ANY_FAILURE';
		}

		if (typeof params.statusList === 'undefined' && (params.matchOperator as unknown) === 'IS_CUSTOM_FAILURE') {
			params.statusList = [
				'INVALID_HMAC_KEY',
				'INVALID_DELIMITER',
				'INVALID_ACL_DELIMITER',
				'INVALID_IP',
				'INVALID_URL',
				'MISSING_EXPIRATION_TIME',
				'NEED_URL_XOR_ACL',
				'UNSUPPORTED_VERSION',
				'MISSING_TOKEN',
				'MISSING_URL',
				'INVALID_TOKEN',
				'INVALID_HMAC',
				'TOKEN_NOT_VALID_YET',
				'EXPIRED_TOKEN',
				'UNAUTHORIZED_IP',
				'UNAUTHORIZED_URL',
				'INVALID_EXPIRATION_TIME',
			];
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'tokenAuthorization', {}, params));
	}

	/**
	 * Allows Cloudlets Origins, referenced by label, to define their own criteria to assign custom origin definitions.
	 * The criteria may match, for example, for a specified percentage of requests defined by the cloudlet to use an
	 * alternative version of a website. You need to pair this criteria with a sibling [`origin`](#) definition. It
	 * should not appear with any other criteria, and an [`allowCloudletsOrigins`](#) behavior needs to appear within a
	 * parent rule.
	 *
	 * @param {object} params - The parameters needed to configure onCloudletsOrigin
	 * @param {string} params.originId - The Cloudlets Origins identifier, limited to alphanumeric and underscore
	 *   characters.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/conditional-origin-id | Akamai Techdocs}
	 */
	onCloudletsOrigin(params: {
		/** The Cloudlets Origins identifier, limited to alphanumeric and underscore characters. */
		originId: string;
	}): CriteriaBuilder {
		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'cloudletsOrigin', {}, params));
	}

	/**
	 * The client browser's approximate geographic location, determined by looking up the IP address in a database.
	 *
	 * @param {object} params - The parameters needed to configure onUserLocation
	 * @param {'COUNTRY' | 'CONTINENT' | 'REGION'} [params.field] - Indicates the geographic scope. Default: "COUNTRY".
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF'} [params.matchOperator] - Matches the specified set of values when set to
	 *   `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match. Default: "IS_ONE_OF".
	 * @param {(
	 * 	| 'AD'
	 * 	| 'AE'
	 * 	| 'AF'
	 * 	| 'AG'
	 * 	| 'AI'
	 * 	| 'AL'
	 * 	| 'AM'
	 * 	| 'AO'
	 * 	| 'AQ'
	 * 	| 'AR'
	 * 	| 'AS'
	 * 	| 'AT'
	 * 	| 'AU'
	 * 	| 'AW'
	 * 	| 'AZ'
	 * 	| 'BA'
	 * 	| 'BB'
	 * 	| 'BD'
	 * 	| 'BE'
	 * 	| 'BF'
	 * 	| 'BG'
	 * 	| 'BH'
	 * 	| 'BI'
	 * 	| 'BJ'
	 * 	| 'BL'
	 * 	| 'BM'
	 * 	| 'BN'
	 * 	| 'BO'
	 * 	| 'BQ'
	 * 	| 'BR'
	 * 	| 'BS'
	 * 	| 'BT'
	 * 	| 'BV'
	 * 	| 'BW'
	 * 	| 'BY'
	 * 	| 'BZ'
	 * 	| 'CA'
	 * 	| 'CC'
	 * 	| 'CD'
	 * 	| 'CF'
	 * 	| 'CG'
	 * 	| 'CH'
	 * 	| 'CI'
	 * 	| 'CK'
	 * 	| 'CL'
	 * 	| 'CM'
	 * 	| 'CN'
	 * 	| 'CO'
	 * 	| 'CR'
	 * 	| 'CU'
	 * 	| 'CV'
	 * 	| 'CW'
	 * 	| 'CX'
	 * 	| 'CY'
	 * 	| 'CZ'
	 * 	| 'DE'
	 * 	| 'DJ'
	 * 	| 'DK'
	 * 	| 'DM'
	 * 	| 'DO'
	 * 	| 'DZ'
	 * 	| 'EC'
	 * 	| 'EE'
	 * 	| 'EG'
	 * 	| 'EH'
	 * 	| 'ER'
	 * 	| 'ES'
	 * 	| 'ET'
	 * 	| 'EU'
	 * 	| 'FI'
	 * 	| 'FJ'
	 * 	| 'FK'
	 * 	| 'FM'
	 * 	| 'FO'
	 * 	| 'FR'
	 * 	| 'GA'
	 * 	| 'GB'
	 * 	| 'GD'
	 * 	| 'GE'
	 * 	| 'GF'
	 * 	| 'GH'
	 * 	| 'GI'
	 * 	| 'GG'
	 * 	| 'GL'
	 * 	| 'GM'
	 * 	| 'GN'
	 * 	| 'GP'
	 * 	| 'GQ'
	 * 	| 'GR'
	 * 	| 'GS'
	 * 	| 'GT'
	 * 	| 'GU'
	 * 	| 'GW'
	 * 	| 'GY'
	 * 	| 'HK'
	 * 	| 'HM'
	 * 	| 'HN'
	 * 	| 'HR'
	 * 	| 'HT'
	 * 	| 'HU'
	 * 	| 'ID'
	 * 	| 'IE'
	 * 	| 'IL'
	 * 	| 'IM'
	 * 	| 'IN'
	 * 	| 'IO'
	 * 	| 'IQ'
	 * 	| 'IR'
	 * 	| 'IS'
	 * 	| 'IT'
	 * 	| 'JE'
	 * 	| 'JM'
	 * 	| 'JO'
	 * 	| 'JP'
	 * 	| 'KE'
	 * 	| 'KG'
	 * 	| 'KH'
	 * 	| 'KI'
	 * 	| 'KM'
	 * 	| 'KN'
	 * 	| 'KP'
	 * 	| 'KR'
	 * 	| 'KW'
	 * 	| 'KY'
	 * 	| 'KZ'
	 * 	| 'LA'
	 * 	| 'LB'
	 * 	| 'LC'
	 * 	| 'LI'
	 * 	| 'LK'
	 * 	| 'LR'
	 * 	| 'LS'
	 * 	| 'LT'
	 * 	| 'LU'
	 * 	| 'LV'
	 * 	| 'LY'
	 * 	| 'MA'
	 * 	| 'MC'
	 * 	| 'MD'
	 * 	| 'ME'
	 * 	| 'MF'
	 * 	| 'MG'
	 * 	| 'MH'
	 * 	| 'MK'
	 * 	| 'ML'
	 * 	| 'MM'
	 * 	| 'MN'
	 * 	| 'MO'
	 * 	| 'MP'
	 * 	| 'MQ'
	 * 	| 'MR'
	 * 	| 'MS'
	 * 	| 'MT'
	 * 	| 'MU'
	 * 	| 'MV'
	 * 	| 'MW'
	 * 	| 'MX'
	 * 	| 'MY'
	 * 	| 'MZ'
	 * 	| 'NA'
	 * 	| 'NC'
	 * 	| 'NE'
	 * 	| 'NF'
	 * 	| 'NG'
	 * 	| 'NI'
	 * 	| 'NL'
	 * 	| 'NO'
	 * 	| 'NP'
	 * 	| 'NR'
	 * 	| 'NU'
	 * 	| 'NZ'
	 * 	| 'OM'
	 * 	| 'PA'
	 * 	| 'PE'
	 * 	| 'PF'
	 * 	| 'PG'
	 * 	| 'PH'
	 * 	| 'PK'
	 * 	| 'PL'
	 * 	| 'PM'
	 * 	| 'PN'
	 * 	| 'PR'
	 * 	| 'PS'
	 * 	| 'PT'
	 * 	| 'PW'
	 * 	| 'PY'
	 * 	| 'QA'
	 * 	| 'RE'
	 * 	| 'RO'
	 * 	| 'RS'
	 * 	| 'RU'
	 * 	| 'RW'
	 * 	| 'SA'
	 * 	| 'SB'
	 * 	| 'SC'
	 * 	| 'SD'
	 * 	| 'SE'
	 * 	| 'SG'
	 * 	| 'SH'
	 * 	| 'SI'
	 * 	| 'SJ'
	 * 	| 'SK'
	 * 	| 'SL'
	 * 	| 'SM'
	 * 	| 'SN'
	 * 	| 'SO'
	 * 	| 'SR'
	 * 	| 'SS'
	 * 	| 'ST'
	 * 	| 'SV'
	 * 	| 'SX'
	 * 	| 'SY'
	 * 	| 'SZ'
	 * 	| 'TC'
	 * 	| 'TD'
	 * 	| 'TF'
	 * 	| 'TG'
	 * 	| 'TH'
	 * 	| 'TJ'
	 * 	| 'TK'
	 * 	| 'TM'
	 * 	| 'TN'
	 * 	| 'TO'
	 * 	| 'TL'
	 * 	| 'TR'
	 * 	| 'TT'
	 * 	| 'TV'
	 * 	| 'TW'
	 * 	| 'TZ'
	 * 	| 'UA'
	 * 	| 'UG'
	 * 	| 'UM'
	 * 	| 'US'
	 * 	| 'UY'
	 * 	| 'UZ'
	 * 	| 'VA'
	 * 	| 'VC'
	 * 	| 'VE'
	 * 	| 'VG'
	 * 	| 'VI'
	 * 	| 'VN'
	 * 	| 'VU'
	 * 	| 'WF'
	 * 	| 'WS'
	 * 	| 'YE'
	 * 	| 'YT'
	 * 	| 'ZA'
	 * 	| 'ZM'
	 * 	| 'ZW'
	 * )[]} [params.countryValues]
	 *   - ISO 3166-1 country codes, such as `US` or `CN`.
	 *
	 * @param {('AF' | 'AS' | 'EU' | 'NA' | 'OC' | 'OT' | 'SA')[]} [params.continentValues] - Continent codes.
	 * @param {(
	 * 	| 'US-AL'
	 * 	| 'US-AK'
	 * 	| 'US-AZ'
	 * 	| 'US-AR'
	 * 	| 'US-CA'
	 * 	| 'US-CO'
	 * 	| 'US-CT'
	 * 	| 'US-DE'
	 * 	| 'US-DC'
	 * 	| 'US-FL'
	 * 	| 'US-GA'
	 * 	| 'US-HI'
	 * 	| 'US-ID'
	 * 	| 'US-IL'
	 * 	| 'US-IN'
	 * 	| 'US-IA'
	 * 	| 'US-KS'
	 * 	| 'US-KY'
	 * 	| 'US-LA'
	 * 	| 'US-ME'
	 * 	| 'US-MD'
	 * 	| 'US-MA'
	 * 	| 'US-MI'
	 * 	| 'US-MN'
	 * 	| 'US-MS'
	 * 	| 'US-MO'
	 * 	| 'US-MT'
	 * 	| 'US-NE'
	 * 	| 'US-NV'
	 * 	| 'US-NH'
	 * 	| 'US-NJ'
	 * 	| 'US-NM'
	 * 	| 'US-NY'
	 * 	| 'US-NC'
	 * 	| 'US-ND'
	 * 	| 'US-OH'
	 * 	| 'US-OK'
	 * 	| 'US-OR'
	 * 	| 'US-PA'
	 * 	| 'US-RI'
	 * 	| 'US-SC'
	 * 	| 'US-SD'
	 * 	| 'US-TN'
	 * 	| 'US-TX'
	 * 	| 'US-UT'
	 * 	| 'US-VT'
	 * 	| 'US-VA'
	 * 	| 'US-WA'
	 * 	| 'US-WV'
	 * 	| 'US-WI'
	 * 	| 'US-WY'
	 * 	| 'CA-AB'
	 * 	| 'CA-BC'
	 * 	| 'CA-MB'
	 * 	| 'CA-NB'
	 * 	| 'CA-NF'
	 * 	| 'CA-NS'
	 * 	| 'CA-NT'
	 * 	| 'CA-NU'
	 * 	| 'CA-ON'
	 * 	| 'CA-PE'
	 * 	| 'CA-QC'
	 * 	| 'CA-SK'
	 * 	| 'CA-YT'
	 * 	| 'AU-ACT'
	 * 	| 'AU-NSW'
	 * 	| 'AU-NT'
	 * 	| 'AU-QLD'
	 * 	| 'AU-SA'
	 * 	| 'AU-TAS'
	 * 	| 'AU-VIC'
	 * 	| 'AU-WA'
	 * 	| 'GB-EN'
	 * 	| 'GB-NI'
	 * 	| 'GB-SC'
	 * 	| 'GB-WA'
	 * 	| 'JP-00'
	 * 	| 'JP-01'
	 * 	| 'JP-02'
	 * 	| 'JP-03'
	 * 	| 'JP-04'
	 * 	| 'JP-05'
	 * 	| 'JP-06'
	 * 	| 'JP-07'
	 * 	| 'JP-08'
	 * 	| 'JP-09'
	 * 	| 'JP-10'
	 * 	| 'JP-11'
	 * 	| 'JP-12'
	 * 	| 'JP-13'
	 * 	| 'JP-14'
	 * 	| 'JP-15'
	 * 	| 'JP-16'
	 * 	| 'JP-17'
	 * 	| 'JP-18'
	 * 	| 'JP-19'
	 * 	| 'JP-20'
	 * 	| 'JP-21'
	 * 	| 'JP-22'
	 * 	| 'JP-23'
	 * 	| 'JP-24'
	 * 	| 'JP-25'
	 * 	| 'JP-26'
	 * 	| 'JP-27'
	 * 	| 'JP-28'
	 * 	| 'JP-29'
	 * 	| 'JP-30'
	 * 	| 'JP-31'
	 * 	| 'JP-32'
	 * 	| 'JP-33'
	 * 	| 'JP-34'
	 * 	| 'JP-35'
	 * 	| 'JP-36'
	 * 	| 'JP-37'
	 * 	| 'JP-38'
	 * 	| 'JP-39'
	 * 	| 'JP-40'
	 * 	| 'JP-41'
	 * 	| 'JP-42'
	 * 	| 'JP-43'
	 * 	| 'JP-44'
	 * 	| 'JP-45'
	 * 	| 'JP-46'
	 * 	| 'JP-47'
	 * 	| 'BR-AC'
	 * 	| 'BR-AL'
	 * 	| 'BR-AM'
	 * 	| 'BR-AP'
	 * 	| 'BR-BA'
	 * 	| 'BR-CE'
	 * 	| 'BR-DF'
	 * 	| 'BR-ES'
	 * 	| 'BR-GO'
	 * 	| 'BR-IS'
	 * 	| 'BR-MA'
	 * 	| 'BR-MG'
	 * 	| 'BR-MS'
	 * 	| 'BR-MT'
	 * 	| 'BR-PA'
	 * 	| 'BR-PB'
	 * 	| 'BR-PE'
	 * 	| 'BR-PI'
	 * 	| 'BR-PR'
	 * 	| 'BR-RJ'
	 * 	| 'BR-RN'
	 * 	| 'BR-RO'
	 * 	| 'BR-RR'
	 * 	| 'BR-RS'
	 * 	| 'BR-SC'
	 * 	| 'BR-SE'
	 * 	| 'BR-SP'
	 * 	| 'BR-TO'
	 * 	| 'DE-BB'
	 * 	| 'DE-BE'
	 * 	| 'DE-BW'
	 * 	| 'DE-BY'
	 * 	| 'DE-HB'
	 * 	| 'DE-HE'
	 * 	| 'DE-HH'
	 * 	| 'DE-MV'
	 * 	| 'DE-NI'
	 * 	| 'DE-NW'
	 * 	| 'DE-RP'
	 * 	| 'DE-SH'
	 * 	| 'DE-SL'
	 * 	| 'DE-SN'
	 * 	| 'DE-ST'
	 * 	| 'DE-TH'
	 * 	| 'FR-ARA'
	 * 	| 'FR-BFC'
	 * 	| 'FR-BRE'
	 * 	| 'FR-CVL'
	 * 	| 'FR-COR'
	 * 	| 'FR-GES'
	 * 	| 'FR-HDF'
	 * 	| 'FR-IDF'
	 * 	| 'FR-NOR'
	 * 	| 'FR-NAQ'
	 * 	| 'FR-OCC'
	 * 	| 'FR-PDL'
	 * 	| 'FR-PAC'
	 * 	| 'CH-AG'
	 * 	| 'CH-AI'
	 * 	| 'CH-AR'
	 * 	| 'CH-BE'
	 * 	| 'CH-BL'
	 * 	| 'CH-BS'
	 * 	| 'CH-FR'
	 * 	| 'CH-GE'
	 * 	| 'CH-GL'
	 * 	| 'CH-GR'
	 * 	| 'CH-JU'
	 * 	| 'CH-LU'
	 * 	| 'CH-NE'
	 * 	| 'CH-NW'
	 * 	| 'CH-OW'
	 * 	| 'CH-SG'
	 * 	| 'CH-SH'
	 * 	| 'CH-SO'
	 * 	| 'CH-SZ'
	 * 	| 'CH-TG'
	 * 	| 'CH-TI'
	 * 	| 'CH-UR'
	 * 	| 'CH-VD'
	 * 	| 'CH-VS'
	 * 	| 'CH-ZG'
	 * 	| 'CH-ZH'
	 * 	| 'CN-AH'
	 * 	| 'CN-BJ'
	 * 	| 'CN-CQ'
	 * 	| 'CN-FJ'
	 * 	| 'CN-GS'
	 * 	| 'CN-GD'
	 * 	| 'CN-GX'
	 * 	| 'CN-GZ'
	 * 	| 'CN-HI'
	 * 	| 'CN-HE'
	 * 	| 'CN-HL'
	 * 	| 'CN-HA'
	 * 	| 'CN-HB'
	 * 	| 'CN-HN'
	 * 	| 'CN-JS'
	 * 	| 'CN-JX'
	 * 	| 'CN-JL'
	 * 	| 'CN-LN'
	 * 	| 'CN-NM'
	 * 	| 'CN-NX'
	 * 	| 'CN-QH'
	 * 	| 'CN-SN'
	 * 	| 'CN-SD'
	 * 	| 'CN-SH'
	 * 	| 'CN-SX'
	 * 	| 'CN-SC'
	 * 	| 'CN-TJ'
	 * 	| 'CN-XJ'
	 * 	| 'CN-XZ'
	 * 	| 'CN-YN'
	 * 	| 'CN-ZJ'
	 * 	| 'IN-AN'
	 * 	| 'IN-AP'
	 * 	| 'IN-AR'
	 * 	| 'IN-AS'
	 * 	| 'IN-BR'
	 * 	| 'IN-CH'
	 * 	| 'IN-CT'
	 * 	| 'IN-DD'
	 * 	| 'IN-DL'
	 * 	| 'IN-DN'
	 * 	| 'IN-GA'
	 * 	| 'IN-GJ'
	 * 	| 'IN-HP'
	 * 	| 'IN-HR'
	 * 	| 'IN-JH'
	 * 	| 'IN-JK'
	 * 	| 'IN-KA'
	 * 	| 'IN-KL'
	 * 	| 'IN-LD'
	 * 	| 'IN-MH'
	 * 	| 'IN-ML'
	 * 	| 'IN-MN'
	 * 	| 'IN-MP'
	 * 	| 'IN-MZ'
	 * 	| 'IN-NL'
	 * 	| 'IN-OR'
	 * 	| 'IN-PB'
	 * 	| 'IN-PY'
	 * 	| 'IN-RJ'
	 * 	| 'IN-SK'
	 * 	| 'IN-TG'
	 * 	| 'IN-TN'
	 * 	| 'IN-TR'
	 * 	| 'IN-UL'
	 * 	| 'IN-UP'
	 * 	| 'IN-WB'
	 * 	| 'SE-K'
	 * 	| 'SE-X'
	 * 	| 'SE-I'
	 * 	| 'SE-N'
	 * 	| 'SE-Z'
	 * 	| 'SE-F'
	 * 	| 'SE-H'
	 * 	| 'SE-W'
	 * 	| 'SE-G'
	 * 	| 'SE-BD'
	 * 	| 'SE-T'
	 * 	| 'SE-E'
	 * 	| 'SE-D'
	 * 	| 'SE-C'
	 * 	| 'SE-S'
	 * 	| 'SE-AC'
	 * 	| 'SE-Y'
	 * 	| 'SE-U'
	 * 	| 'SE-AB'
	 * 	| 'SE-M'
	 * 	| 'SE-O'
	 * 	| 'MX-AGU'
	 * 	| 'MX-BCN'
	 * 	| 'MX-BCS'
	 * 	| 'MX-CAM'
	 * 	| 'MX-CHP'
	 * 	| 'MX-CHH'
	 * 	| 'MX-COA'
	 * 	| 'MX-COL'
	 * 	| 'MX-DIF'
	 * 	| 'MX-DUR'
	 * 	| 'MX-GUA'
	 * 	| 'MX-GRO'
	 * 	| 'MX-HID'
	 * 	| 'MX-JAL'
	 * 	| 'MX-MEX'
	 * 	| 'MX-MIC'
	 * 	| 'MX-MOR'
	 * 	| 'MX-NAY'
	 * 	| 'MX-NLE'
	 * 	| 'MX-OAX'
	 * 	| 'MX-PUE'
	 * 	| 'MX-QUE'
	 * 	| 'MX-ROO'
	 * 	| 'MX-SLP'
	 * 	| 'MX-SIN'
	 * 	| 'MX-SON'
	 * 	| 'MX-TAB'
	 * 	| 'MX-TAM'
	 * 	| 'MX-TLA'
	 * 	| 'MX-VER'
	 * 	| 'MX-YUC'
	 * 	| 'MX-ZAC'
	 * 	| 'UA-CK'
	 * 	| 'UA-CH'
	 * 	| 'UA-CV'
	 * 	| 'UA-CRIMEA'
	 * 	| 'UA-DP'
	 * 	| 'UA-DT'
	 * 	| 'UA-IF'
	 * 	| 'UA-KK'
	 * 	| 'UA-KS'
	 * 	| 'UA-KM'
	 * 	| 'UA-KV'
	 * 	| 'UA-KH'
	 * 	| 'UA-LH'
	 * 	| 'UA-LV'
	 * 	| 'UA-MY'
	 * 	| 'UA-OD'
	 * 	| 'UA-PL'
	 * 	| 'UA-RV'
	 * 	| 'UA-SM'
	 * 	| 'UA-TP'
	 * 	| 'UA-ZK'
	 * 	| 'UA-VI'
	 * 	| 'UA-VO'
	 * 	| 'UA-ZP'
	 * 	| 'UA-ZT'
	 * 	| 'ES-AN'
	 * 	| 'ES-AR'
	 * 	| 'ES-AS'
	 * 	| 'ES-CB'
	 * 	| 'ES-CE'
	 * 	| 'ES-CL'
	 * 	| 'ES-CM'
	 * 	| 'ES-CN'
	 * 	| 'ES-CT'
	 * 	| 'ES-EX'
	 * 	| 'ES-GA'
	 * 	| 'ES-IB'
	 * 	| 'ES-MC'
	 * 	| 'ES-MD'
	 * 	| 'ES-ML'
	 * 	| 'ES-NC'
	 * 	| 'ES-PV'
	 * 	| 'ES-RI'
	 * 	| 'ES-VC'
	 * 	| 'BE-BRU'
	 * 	| 'BE-VLG'
	 * 	| 'BE-WAL'
	 * 	| 'TH-10'
	 * 	| 'TH-11'
	 * 	| 'TH-12'
	 * 	| 'TH-13'
	 * 	| 'TH-14'
	 * 	| 'TH-15'
	 * 	| 'TH-16'
	 * 	| 'TH-17'
	 * 	| 'TH-18'
	 * 	| 'TH-19'
	 * 	| 'TH-20'
	 * 	| 'TH-21'
	 * 	| 'TH-22'
	 * 	| 'TH-23'
	 * 	| 'TH-24'
	 * 	| 'TH-25'
	 * 	| 'TH-26'
	 * 	| 'TH-27'
	 * 	| 'TH-30'
	 * 	| 'TH-31'
	 * 	| 'TH-32'
	 * 	| 'TH-33'
	 * 	| 'TH-34'
	 * 	| 'TH-35'
	 * 	| 'TH-36'
	 * 	| 'TH-37'
	 * 	| 'TH-38'
	 * 	| 'TH-39'
	 * 	| 'TH-40'
	 * 	| 'TH-41'
	 * 	| 'TH-42'
	 * 	| 'TH-43'
	 * 	| 'TH-44'
	 * 	| 'TH-45'
	 * 	| 'TH-46'
	 * 	| 'TH-47'
	 * 	| 'TH-48'
	 * 	| 'TH-49'
	 * 	| 'TH-50'
	 * 	| 'TH-51'
	 * 	| 'TH-52'
	 * 	| 'TH-53'
	 * 	| 'TH-54'
	 * 	| 'TH-55'
	 * 	| 'TH-56'
	 * 	| 'TH-57'
	 * 	| 'TH-58'
	 * 	| 'TH-60'
	 * 	| 'TH-61'
	 * 	| 'TH-62'
	 * 	| 'TH-63'
	 * 	| 'TH-64'
	 * 	| 'TH-65'
	 * 	| 'TH-66'
	 * 	| 'TH-67'
	 * 	| 'TH-70'
	 * 	| 'TH-71'
	 * 	| 'TH-72'
	 * 	| 'TH-73'
	 * 	| 'TH-74'
	 * 	| 'TH-75'
	 * 	| 'TH-76'
	 * 	| 'TH-77'
	 * 	| 'TH-80'
	 * 	| 'TH-81'
	 * 	| 'TH-82'
	 * 	| 'TH-83'
	 * 	| 'TH-84'
	 * 	| 'TH-85'
	 * 	| 'TH-86'
	 * 	| 'TH-90'
	 * 	| 'TH-91'
	 * 	| 'TH-92'
	 * 	| 'TH-93'
	 * 	| 'TH-94'
	 * 	| 'TH-95'
	 * 	| 'TH-96'
	 * 	| 'ID-AC'
	 * 	| 'ID-BA'
	 * 	| 'ID-BB'
	 * 	| 'ID-BE'
	 * 	| 'ID-BT'
	 * 	| 'ID-GO'
	 * 	| 'ID-JA'
	 * 	| 'ID-JB'
	 * 	| 'ID-JI'
	 * 	| 'ID-JK'
	 * 	| 'ID-JT'
	 * 	| 'ID-KB'
	 * 	| 'ID-KI'
	 * 	| 'ID-KR'
	 * 	| 'ID-KS'
	 * 	| 'ID-KT'
	 * 	| 'ID-KU'
	 * 	| 'ID-LA'
	 * 	| 'ID-MA'
	 * 	| 'ID-MU'
	 * 	| 'ID-NB'
	 * 	| 'ID-NT'
	 * 	| 'ID-PA'
	 * 	| 'ID-PB'
	 * 	| 'ID-RI'
	 * 	| 'ID-SA'
	 * 	| 'ID-SB'
	 * 	| 'ID-SG'
	 * 	| 'ID-SN'
	 * 	| 'ID-SR'
	 * 	| 'ID-SS'
	 * 	| 'ID-ST'
	 * 	| 'ID-SU'
	 * 	| 'ID-YO'
	 * 	| 'MY-01'
	 * 	| 'MY-02'
	 * 	| 'MY-03'
	 * 	| 'MY-04'
	 * 	| 'MY-05'
	 * 	| 'MY-06'
	 * 	| 'MY-07'
	 * 	| 'MY-08'
	 * 	| 'MY-09'
	 * 	| 'MY-10'
	 * 	| 'MY-11'
	 * 	| 'MY-12'
	 * 	| 'MY-13'
	 * 	| 'MY-14'
	 * 	| 'MY-15'
	 * 	| 'MY-16'
	 * 	| 'VN-01'
	 * 	| 'VN-02'
	 * 	| 'VN-03'
	 * 	| 'VN-04'
	 * 	| 'VN-05'
	 * 	| 'VN-06'
	 * 	| 'VN-07'
	 * 	| 'VN-09'
	 * 	| 'VN-13'
	 * 	| 'VN-14'
	 * 	| 'VN-18'
	 * 	| 'VN-20'
	 * 	| 'VN-21'
	 * 	| 'VN-22'
	 * 	| 'VN-23'
	 * 	| 'VN-24'
	 * 	| 'VN-25'
	 * 	| 'VN-26'
	 * 	| 'VN-27'
	 * 	| 'VN-28'
	 * 	| 'VN-29'
	 * 	| 'VN-30'
	 * 	| 'VN-31'
	 * 	| 'VN-32'
	 * 	| 'VN-33'
	 * 	| 'VN-34'
	 * 	| 'VN-35'
	 * 	| 'VN-36'
	 * 	| 'VN-37'
	 * 	| 'VN-39'
	 * 	| 'VN-40'
	 * 	| 'VN-41'
	 * 	| 'VN-43'
	 * 	| 'VN-44'
	 * 	| 'VN-45'
	 * 	| 'VN-46'
	 * 	| 'VN-47'
	 * 	| 'VN-49'
	 * 	| 'VN-50'
	 * 	| 'VN-51'
	 * 	| 'VN-52'
	 * 	| 'VN-53'
	 * 	| 'VN-54'
	 * 	| 'VN-55'
	 * 	| 'VN-56'
	 * 	| 'VN-57'
	 * 	| 'VN-58'
	 * 	| 'VN-59'
	 * 	| 'VN-61'
	 * 	| 'VN-63'
	 * 	| 'VN-66'
	 * 	| 'VN-67'
	 * 	| 'VN-68'
	 * 	| 'VN-69'
	 * 	| 'VN-70'
	 * 	| 'VN-71'
	 * 	| 'VN-72'
	 * 	| 'VN-73'
	 * 	| 'VN-CT'
	 * 	| 'VN-DN'
	 * 	| 'VN-HN'
	 * 	| 'VN-HP'
	 * 	| 'VN-SG'
	 * 	| 'PH-00'
	 * 	| 'PH-ABR'
	 * 	| 'PH-AGN'
	 * 	| 'PH-AGS'
	 * 	| 'PH-AKL'
	 * 	| 'PH-ALB'
	 * 	| 'PH-ANT'
	 * 	| 'PH-APA'
	 * 	| 'PH-AUR'
	 * 	| 'PH-BAN'
	 * 	| 'PH-BAS'
	 * 	| 'PH-BEN'
	 * 	| 'PH-BIL'
	 * 	| 'PH-BOH'
	 * 	| 'PH-BTG'
	 * 	| 'PH-BTN'
	 * 	| 'PH-BUK'
	 * 	| 'PH-BUL'
	 * 	| 'PH-CAG'
	 * 	| 'PH-CAM'
	 * 	| 'PH-CAN'
	 * 	| 'PH-CAP'
	 * 	| 'PH-CAS'
	 * 	| 'PH-CAT'
	 * 	| 'PH-CAV'
	 * 	| 'PH-CEB'
	 * 	| 'PH-COM'
	 * 	| 'PH-DAO'
	 * 	| 'PH-DAS'
	 * 	| 'PH-DAV'
	 * 	| 'PH-DIN'
	 * 	| 'PH-DVO'
	 * 	| 'PH-EAS'
	 * 	| 'PH-GUI'
	 * 	| 'PH-IFU'
	 * 	| 'PH-ILI'
	 * 	| 'PH-ILN'
	 * 	| 'PH-ILS'
	 * 	| 'PH-ISA'
	 * 	| 'PH-KAL'
	 * 	| 'PH-LAG'
	 * 	| 'PH-LAN'
	 * 	| 'PH-LAS'
	 * 	| 'PH-LEY'
	 * 	| 'PH-LUN'
	 * 	| 'PH-MAD'
	 * 	| 'PH-MAG'
	 * 	| 'PH-MAS'
	 * 	| 'PH-MDC'
	 * 	| 'PH-MDR'
	 * 	| 'PH-MOU'
	 * 	| 'PH-MSC'
	 * 	| 'PH-MSR'
	 * 	| 'PH-NCO'
	 * 	| 'PH-NEC'
	 * 	| 'PH-NER'
	 * 	| 'PH-NSA'
	 * 	| 'PH-NUE'
	 * 	| 'PH-NUV'
	 * 	| 'PH-PAM'
	 * 	| 'PH-PAN'
	 * 	| 'PH-PLW'
	 * 	| 'PH-QUE'
	 * 	| 'PH-QUI'
	 * 	| 'PH-RIZ'
	 * 	| 'PH-ROM'
	 * 	| 'PH-SAR'
	 * 	| 'PH-SCO'
	 * 	| 'PH-SIG'
	 * 	| 'PH-SLE'
	 * 	| 'PH-SLU'
	 * 	| 'PH-SOR'
	 * 	| 'PH-SUK'
	 * 	| 'PH-SUN'
	 * 	| 'PH-SUR'
	 * 	| 'PH-TAR'
	 * 	| 'PH-TAW'
	 * 	| 'PH-WSA'
	 * 	| 'PH-ZAN'
	 * 	| 'PH-ZAS'
	 * 	| 'PH-ZMB'
	 * 	| 'PH-ZSI'
	 * )[]} [params.regionValues]
	 *   - ISO 3166 country and region codes, for example `US:MA` for Massachusetts or `JP:13` for Tokyo.
	 *
	 * @param {'BOTH' | 'CONNECTING' | 'HEADERS'} [params.checkIps] - Specifies which IP addresses determine the user's
	 *   location. Default: "BOTH".
	 * @param {boolean} [params.useOnlyFirstXForwardedForIp] - When connecting via a proxy server as determined by the
	 *   `X-Forwarded-For` header, enabling this option matches the end client specified in the header. Disabling it
	 *   matches the connecting client's IP address. Default: false.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/user-loc-data | Akamai Techdocs}
	 */
	onUserLocation(params: {
		/** Indicates the geographic scope. Default: "COUNTRY". */
		field?: 'COUNTRY' | 'CONTINENT' | 'REGION';

		/**
		 * Matches the specified set of values when set to `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match.
		 * Default: "IS_ONE_OF".
		 */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF';

		/** ISO 3166-1 country codes, such as `US` or `CN`. */
		countryValues?: Array<
			| 'AD'
			| 'AE'
			| 'AF'
			| 'AG'
			| 'AI'
			| 'AL'
			| 'AM'
			| 'AO'
			| 'AQ'
			| 'AR'
			| 'AS'
			| 'AT'
			| 'AU'
			| 'AW'
			| 'AZ'
			| 'BA'
			| 'BB'
			| 'BD'
			| 'BE'
			| 'BF'
			| 'BG'
			| 'BH'
			| 'BI'
			| 'BJ'
			| 'BL'
			| 'BM'
			| 'BN'
			| 'BO'
			| 'BQ'
			| 'BR'
			| 'BS'
			| 'BT'
			| 'BV'
			| 'BW'
			| 'BY'
			| 'BZ'
			| 'CA'
			| 'CC'
			| 'CD'
			| 'CF'
			| 'CG'
			| 'CH'
			| 'CI'
			| 'CK'
			| 'CL'
			| 'CM'
			| 'CN'
			| 'CO'
			| 'CR'
			| 'CU'
			| 'CV'
			| 'CW'
			| 'CX'
			| 'CY'
			| 'CZ'
			| 'DE'
			| 'DJ'
			| 'DK'
			| 'DM'
			| 'DO'
			| 'DZ'
			| 'EC'
			| 'EE'
			| 'EG'
			| 'EH'
			| 'ER'
			| 'ES'
			| 'ET'
			| 'EU'
			| 'FI'
			| 'FJ'
			| 'FK'
			| 'FM'
			| 'FO'
			| 'FR'
			| 'GA'
			| 'GB'
			| 'GD'
			| 'GE'
			| 'GF'
			| 'GH'
			| 'GI'
			| 'GG'
			| 'GL'
			| 'GM'
			| 'GN'
			| 'GP'
			| 'GQ'
			| 'GR'
			| 'GS'
			| 'GT'
			| 'GU'
			| 'GW'
			| 'GY'
			| 'HK'
			| 'HM'
			| 'HN'
			| 'HR'
			| 'HT'
			| 'HU'
			| 'ID'
			| 'IE'
			| 'IL'
			| 'IM'
			| 'IN'
			| 'IO'
			| 'IQ'
			| 'IR'
			| 'IS'
			| 'IT'
			| 'JE'
			| 'JM'
			| 'JO'
			| 'JP'
			| 'KE'
			| 'KG'
			| 'KH'
			| 'KI'
			| 'KM'
			| 'KN'
			| 'KP'
			| 'KR'
			| 'KW'
			| 'KY'
			| 'KZ'
			| 'LA'
			| 'LB'
			| 'LC'
			| 'LI'
			| 'LK'
			| 'LR'
			| 'LS'
			| 'LT'
			| 'LU'
			| 'LV'
			| 'LY'
			| 'MA'
			| 'MC'
			| 'MD'
			| 'ME'
			| 'MF'
			| 'MG'
			| 'MH'
			| 'MK'
			| 'ML'
			| 'MM'
			| 'MN'
			| 'MO'
			| 'MP'
			| 'MQ'
			| 'MR'
			| 'MS'
			| 'MT'
			| 'MU'
			| 'MV'
			| 'MW'
			| 'MX'
			| 'MY'
			| 'MZ'
			| 'NA'
			| 'NC'
			| 'NE'
			| 'NF'
			| 'NG'
			| 'NI'
			| 'NL'
			| 'NO'
			| 'NP'
			| 'NR'
			| 'NU'
			| 'NZ'
			| 'OM'
			| 'PA'
			| 'PE'
			| 'PF'
			| 'PG'
			| 'PH'
			| 'PK'
			| 'PL'
			| 'PM'
			| 'PN'
			| 'PR'
			| 'PS'
			| 'PT'
			| 'PW'
			| 'PY'
			| 'QA'
			| 'RE'
			| 'RO'
			| 'RS'
			| 'RU'
			| 'RW'
			| 'SA'
			| 'SB'
			| 'SC'
			| 'SD'
			| 'SE'
			| 'SG'
			| 'SH'
			| 'SI'
			| 'SJ'
			| 'SK'
			| 'SL'
			| 'SM'
			| 'SN'
			| 'SO'
			| 'SR'
			| 'SS'
			| 'ST'
			| 'SV'
			| 'SX'
			| 'SY'
			| 'SZ'
			| 'TC'
			| 'TD'
			| 'TF'
			| 'TG'
			| 'TH'
			| 'TJ'
			| 'TK'
			| 'TM'
			| 'TN'
			| 'TO'
			| 'TL'
			| 'TR'
			| 'TT'
			| 'TV'
			| 'TW'
			| 'TZ'
			| 'UA'
			| 'UG'
			| 'UM'
			| 'US'
			| 'UY'
			| 'UZ'
			| 'VA'
			| 'VC'
			| 'VE'
			| 'VG'
			| 'VI'
			| 'VN'
			| 'VU'
			| 'WF'
			| 'WS'
			| 'YE'
			| 'YT'
			| 'ZA'
			| 'ZM'
			| 'ZW'
		>;

		/** Continent codes. */
		continentValues?: Array<'AF' | 'AS' | 'EU' | 'NA' | 'OC' | 'OT' | 'SA'>;

		/** ISO 3166 country and region codes, for example `US:MA` for Massachusetts or `JP:13` for Tokyo. */
		regionValues?: Array<
			| 'US-AL'
			| 'US-AK'
			| 'US-AZ'
			| 'US-AR'
			| 'US-CA'
			| 'US-CO'
			| 'US-CT'
			| 'US-DE'
			| 'US-DC'
			| 'US-FL'
			| 'US-GA'
			| 'US-HI'
			| 'US-ID'
			| 'US-IL'
			| 'US-IN'
			| 'US-IA'
			| 'US-KS'
			| 'US-KY'
			| 'US-LA'
			| 'US-ME'
			| 'US-MD'
			| 'US-MA'
			| 'US-MI'
			| 'US-MN'
			| 'US-MS'
			| 'US-MO'
			| 'US-MT'
			| 'US-NE'
			| 'US-NV'
			| 'US-NH'
			| 'US-NJ'
			| 'US-NM'
			| 'US-NY'
			| 'US-NC'
			| 'US-ND'
			| 'US-OH'
			| 'US-OK'
			| 'US-OR'
			| 'US-PA'
			| 'US-RI'
			| 'US-SC'
			| 'US-SD'
			| 'US-TN'
			| 'US-TX'
			| 'US-UT'
			| 'US-VT'
			| 'US-VA'
			| 'US-WA'
			| 'US-WV'
			| 'US-WI'
			| 'US-WY'
			| 'CA-AB'
			| 'CA-BC'
			| 'CA-MB'
			| 'CA-NB'
			| 'CA-NF'
			| 'CA-NS'
			| 'CA-NT'
			| 'CA-NU'
			| 'CA-ON'
			| 'CA-PE'
			| 'CA-QC'
			| 'CA-SK'
			| 'CA-YT'
			| 'AU-ACT'
			| 'AU-NSW'
			| 'AU-NT'
			| 'AU-QLD'
			| 'AU-SA'
			| 'AU-TAS'
			| 'AU-VIC'
			| 'AU-WA'
			| 'GB-EN'
			| 'GB-NI'
			| 'GB-SC'
			| 'GB-WA'
			| 'JP-00'
			| 'JP-01'
			| 'JP-02'
			| 'JP-03'
			| 'JP-04'
			| 'JP-05'
			| 'JP-06'
			| 'JP-07'
			| 'JP-08'
			| 'JP-09'
			| 'JP-10'
			| 'JP-11'
			| 'JP-12'
			| 'JP-13'
			| 'JP-14'
			| 'JP-15'
			| 'JP-16'
			| 'JP-17'
			| 'JP-18'
			| 'JP-19'
			| 'JP-20'
			| 'JP-21'
			| 'JP-22'
			| 'JP-23'
			| 'JP-24'
			| 'JP-25'
			| 'JP-26'
			| 'JP-27'
			| 'JP-28'
			| 'JP-29'
			| 'JP-30'
			| 'JP-31'
			| 'JP-32'
			| 'JP-33'
			| 'JP-34'
			| 'JP-35'
			| 'JP-36'
			| 'JP-37'
			| 'JP-38'
			| 'JP-39'
			| 'JP-40'
			| 'JP-41'
			| 'JP-42'
			| 'JP-43'
			| 'JP-44'
			| 'JP-45'
			| 'JP-46'
			| 'JP-47'
			| 'BR-AC'
			| 'BR-AL'
			| 'BR-AM'
			| 'BR-AP'
			| 'BR-BA'
			| 'BR-CE'
			| 'BR-DF'
			| 'BR-ES'
			| 'BR-GO'
			| 'BR-IS'
			| 'BR-MA'
			| 'BR-MG'
			| 'BR-MS'
			| 'BR-MT'
			| 'BR-PA'
			| 'BR-PB'
			| 'BR-PE'
			| 'BR-PI'
			| 'BR-PR'
			| 'BR-RJ'
			| 'BR-RN'
			| 'BR-RO'
			| 'BR-RR'
			| 'BR-RS'
			| 'BR-SC'
			| 'BR-SE'
			| 'BR-SP'
			| 'BR-TO'
			| 'DE-BB'
			| 'DE-BE'
			| 'DE-BW'
			| 'DE-BY'
			| 'DE-HB'
			| 'DE-HE'
			| 'DE-HH'
			| 'DE-MV'
			| 'DE-NI'
			| 'DE-NW'
			| 'DE-RP'
			| 'DE-SH'
			| 'DE-SL'
			| 'DE-SN'
			| 'DE-ST'
			| 'DE-TH'
			| 'FR-ARA'
			| 'FR-BFC'
			| 'FR-BRE'
			| 'FR-CVL'
			| 'FR-COR'
			| 'FR-GES'
			| 'FR-HDF'
			| 'FR-IDF'
			| 'FR-NOR'
			| 'FR-NAQ'
			| 'FR-OCC'
			| 'FR-PDL'
			| 'FR-PAC'
			| 'CH-AG'
			| 'CH-AI'
			| 'CH-AR'
			| 'CH-BE'
			| 'CH-BL'
			| 'CH-BS'
			| 'CH-FR'
			| 'CH-GE'
			| 'CH-GL'
			| 'CH-GR'
			| 'CH-JU'
			| 'CH-LU'
			| 'CH-NE'
			| 'CH-NW'
			| 'CH-OW'
			| 'CH-SG'
			| 'CH-SH'
			| 'CH-SO'
			| 'CH-SZ'
			| 'CH-TG'
			| 'CH-TI'
			| 'CH-UR'
			| 'CH-VD'
			| 'CH-VS'
			| 'CH-ZG'
			| 'CH-ZH'
			| 'CN-AH'
			| 'CN-BJ'
			| 'CN-CQ'
			| 'CN-FJ'
			| 'CN-GS'
			| 'CN-GD'
			| 'CN-GX'
			| 'CN-GZ'
			| 'CN-HI'
			| 'CN-HE'
			| 'CN-HL'
			| 'CN-HA'
			| 'CN-HB'
			| 'CN-HN'
			| 'CN-JS'
			| 'CN-JX'
			| 'CN-JL'
			| 'CN-LN'
			| 'CN-NM'
			| 'CN-NX'
			| 'CN-QH'
			| 'CN-SN'
			| 'CN-SD'
			| 'CN-SH'
			| 'CN-SX'
			| 'CN-SC'
			| 'CN-TJ'
			| 'CN-XJ'
			| 'CN-XZ'
			| 'CN-YN'
			| 'CN-ZJ'
			| 'IN-AN'
			| 'IN-AP'
			| 'IN-AR'
			| 'IN-AS'
			| 'IN-BR'
			| 'IN-CH'
			| 'IN-CT'
			| 'IN-DD'
			| 'IN-DL'
			| 'IN-DN'
			| 'IN-GA'
			| 'IN-GJ'
			| 'IN-HP'
			| 'IN-HR'
			| 'IN-JH'
			| 'IN-JK'
			| 'IN-KA'
			| 'IN-KL'
			| 'IN-LD'
			| 'IN-MH'
			| 'IN-ML'
			| 'IN-MN'
			| 'IN-MP'
			| 'IN-MZ'
			| 'IN-NL'
			| 'IN-OR'
			| 'IN-PB'
			| 'IN-PY'
			| 'IN-RJ'
			| 'IN-SK'
			| 'IN-TG'
			| 'IN-TN'
			| 'IN-TR'
			| 'IN-UL'
			| 'IN-UP'
			| 'IN-WB'
			| 'SE-K'
			| 'SE-X'
			| 'SE-I'
			| 'SE-N'
			| 'SE-Z'
			| 'SE-F'
			| 'SE-H'
			| 'SE-W'
			| 'SE-G'
			| 'SE-BD'
			| 'SE-T'
			| 'SE-E'
			| 'SE-D'
			| 'SE-C'
			| 'SE-S'
			| 'SE-AC'
			| 'SE-Y'
			| 'SE-U'
			| 'SE-AB'
			| 'SE-M'
			| 'SE-O'
			| 'MX-AGU'
			| 'MX-BCN'
			| 'MX-BCS'
			| 'MX-CAM'
			| 'MX-CHP'
			| 'MX-CHH'
			| 'MX-COA'
			| 'MX-COL'
			| 'MX-DIF'
			| 'MX-DUR'
			| 'MX-GUA'
			| 'MX-GRO'
			| 'MX-HID'
			| 'MX-JAL'
			| 'MX-MEX'
			| 'MX-MIC'
			| 'MX-MOR'
			| 'MX-NAY'
			| 'MX-NLE'
			| 'MX-OAX'
			| 'MX-PUE'
			| 'MX-QUE'
			| 'MX-ROO'
			| 'MX-SLP'
			| 'MX-SIN'
			| 'MX-SON'
			| 'MX-TAB'
			| 'MX-TAM'
			| 'MX-TLA'
			| 'MX-VER'
			| 'MX-YUC'
			| 'MX-ZAC'
			| 'UA-CK'
			| 'UA-CH'
			| 'UA-CV'
			| 'UA-CRIMEA'
			| 'UA-DP'
			| 'UA-DT'
			| 'UA-IF'
			| 'UA-KK'
			| 'UA-KS'
			| 'UA-KM'
			| 'UA-KV'
			| 'UA-KH'
			| 'UA-LH'
			| 'UA-LV'
			| 'UA-MY'
			| 'UA-OD'
			| 'UA-PL'
			| 'UA-RV'
			| 'UA-SM'
			| 'UA-TP'
			| 'UA-ZK'
			| 'UA-VI'
			| 'UA-VO'
			| 'UA-ZP'
			| 'UA-ZT'
			| 'ES-AN'
			| 'ES-AR'
			| 'ES-AS'
			| 'ES-CB'
			| 'ES-CE'
			| 'ES-CL'
			| 'ES-CM'
			| 'ES-CN'
			| 'ES-CT'
			| 'ES-EX'
			| 'ES-GA'
			| 'ES-IB'
			| 'ES-MC'
			| 'ES-MD'
			| 'ES-ML'
			| 'ES-NC'
			| 'ES-PV'
			| 'ES-RI'
			| 'ES-VC'
			| 'BE-BRU'
			| 'BE-VLG'
			| 'BE-WAL'
			| 'TH-10'
			| 'TH-11'
			| 'TH-12'
			| 'TH-13'
			| 'TH-14'
			| 'TH-15'
			| 'TH-16'
			| 'TH-17'
			| 'TH-18'
			| 'TH-19'
			| 'TH-20'
			| 'TH-21'
			| 'TH-22'
			| 'TH-23'
			| 'TH-24'
			| 'TH-25'
			| 'TH-26'
			| 'TH-27'
			| 'TH-30'
			| 'TH-31'
			| 'TH-32'
			| 'TH-33'
			| 'TH-34'
			| 'TH-35'
			| 'TH-36'
			| 'TH-37'
			| 'TH-38'
			| 'TH-39'
			| 'TH-40'
			| 'TH-41'
			| 'TH-42'
			| 'TH-43'
			| 'TH-44'
			| 'TH-45'
			| 'TH-46'
			| 'TH-47'
			| 'TH-48'
			| 'TH-49'
			| 'TH-50'
			| 'TH-51'
			| 'TH-52'
			| 'TH-53'
			| 'TH-54'
			| 'TH-55'
			| 'TH-56'
			| 'TH-57'
			| 'TH-58'
			| 'TH-60'
			| 'TH-61'
			| 'TH-62'
			| 'TH-63'
			| 'TH-64'
			| 'TH-65'
			| 'TH-66'
			| 'TH-67'
			| 'TH-70'
			| 'TH-71'
			| 'TH-72'
			| 'TH-73'
			| 'TH-74'
			| 'TH-75'
			| 'TH-76'
			| 'TH-77'
			| 'TH-80'
			| 'TH-81'
			| 'TH-82'
			| 'TH-83'
			| 'TH-84'
			| 'TH-85'
			| 'TH-86'
			| 'TH-90'
			| 'TH-91'
			| 'TH-92'
			| 'TH-93'
			| 'TH-94'
			| 'TH-95'
			| 'TH-96'
			| 'ID-AC'
			| 'ID-BA'
			| 'ID-BB'
			| 'ID-BE'
			| 'ID-BT'
			| 'ID-GO'
			| 'ID-JA'
			| 'ID-JB'
			| 'ID-JI'
			| 'ID-JK'
			| 'ID-JT'
			| 'ID-KB'
			| 'ID-KI'
			| 'ID-KR'
			| 'ID-KS'
			| 'ID-KT'
			| 'ID-KU'
			| 'ID-LA'
			| 'ID-MA'
			| 'ID-MU'
			| 'ID-NB'
			| 'ID-NT'
			| 'ID-PA'
			| 'ID-PB'
			| 'ID-RI'
			| 'ID-SA'
			| 'ID-SB'
			| 'ID-SG'
			| 'ID-SN'
			| 'ID-SR'
			| 'ID-SS'
			| 'ID-ST'
			| 'ID-SU'
			| 'ID-YO'
			| 'MY-01'
			| 'MY-02'
			| 'MY-03'
			| 'MY-04'
			| 'MY-05'
			| 'MY-06'
			| 'MY-07'
			| 'MY-08'
			| 'MY-09'
			| 'MY-10'
			| 'MY-11'
			| 'MY-12'
			| 'MY-13'
			| 'MY-14'
			| 'MY-15'
			| 'MY-16'
			| 'VN-01'
			| 'VN-02'
			| 'VN-03'
			| 'VN-04'
			| 'VN-05'
			| 'VN-06'
			| 'VN-07'
			| 'VN-09'
			| 'VN-13'
			| 'VN-14'
			| 'VN-18'
			| 'VN-20'
			| 'VN-21'
			| 'VN-22'
			| 'VN-23'
			| 'VN-24'
			| 'VN-25'
			| 'VN-26'
			| 'VN-27'
			| 'VN-28'
			| 'VN-29'
			| 'VN-30'
			| 'VN-31'
			| 'VN-32'
			| 'VN-33'
			| 'VN-34'
			| 'VN-35'
			| 'VN-36'
			| 'VN-37'
			| 'VN-39'
			| 'VN-40'
			| 'VN-41'
			| 'VN-43'
			| 'VN-44'
			| 'VN-45'
			| 'VN-46'
			| 'VN-47'
			| 'VN-49'
			| 'VN-50'
			| 'VN-51'
			| 'VN-52'
			| 'VN-53'
			| 'VN-54'
			| 'VN-55'
			| 'VN-56'
			| 'VN-57'
			| 'VN-58'
			| 'VN-59'
			| 'VN-61'
			| 'VN-63'
			| 'VN-66'
			| 'VN-67'
			| 'VN-68'
			| 'VN-69'
			| 'VN-70'
			| 'VN-71'
			| 'VN-72'
			| 'VN-73'
			| 'VN-CT'
			| 'VN-DN'
			| 'VN-HN'
			| 'VN-HP'
			| 'VN-SG'
			| 'PH-00'
			| 'PH-ABR'
			| 'PH-AGN'
			| 'PH-AGS'
			| 'PH-AKL'
			| 'PH-ALB'
			| 'PH-ANT'
			| 'PH-APA'
			| 'PH-AUR'
			| 'PH-BAN'
			| 'PH-BAS'
			| 'PH-BEN'
			| 'PH-BIL'
			| 'PH-BOH'
			| 'PH-BTG'
			| 'PH-BTN'
			| 'PH-BUK'
			| 'PH-BUL'
			| 'PH-CAG'
			| 'PH-CAM'
			| 'PH-CAN'
			| 'PH-CAP'
			| 'PH-CAS'
			| 'PH-CAT'
			| 'PH-CAV'
			| 'PH-CEB'
			| 'PH-COM'
			| 'PH-DAO'
			| 'PH-DAS'
			| 'PH-DAV'
			| 'PH-DIN'
			| 'PH-DVO'
			| 'PH-EAS'
			| 'PH-GUI'
			| 'PH-IFU'
			| 'PH-ILI'
			| 'PH-ILN'
			| 'PH-ILS'
			| 'PH-ISA'
			| 'PH-KAL'
			| 'PH-LAG'
			| 'PH-LAN'
			| 'PH-LAS'
			| 'PH-LEY'
			| 'PH-LUN'
			| 'PH-MAD'
			| 'PH-MAG'
			| 'PH-MAS'
			| 'PH-MDC'
			| 'PH-MDR'
			| 'PH-MOU'
			| 'PH-MSC'
			| 'PH-MSR'
			| 'PH-NCO'
			| 'PH-NEC'
			| 'PH-NER'
			| 'PH-NSA'
			| 'PH-NUE'
			| 'PH-NUV'
			| 'PH-PAM'
			| 'PH-PAN'
			| 'PH-PLW'
			| 'PH-QUE'
			| 'PH-QUI'
			| 'PH-RIZ'
			| 'PH-ROM'
			| 'PH-SAR'
			| 'PH-SCO'
			| 'PH-SIG'
			| 'PH-SLE'
			| 'PH-SLU'
			| 'PH-SOR'
			| 'PH-SUK'
			| 'PH-SUN'
			| 'PH-SUR'
			| 'PH-TAR'
			| 'PH-TAW'
			| 'PH-WSA'
			| 'PH-ZAN'
			| 'PH-ZAS'
			| 'PH-ZMB'
			| 'PH-ZSI'
		>;

		/** Specifies which IP addresses determine the user's location. Default: "BOTH". */
		checkIps?: 'BOTH' | 'CONNECTING' | 'HEADERS';

		/**
		 * When connecting via a proxy server as determined by the `X-Forwarded-For` header, enabling this option
		 * matches the end client specified in the header. Disabling it matches the connecting client's IP address.
		 * Default: false.
		 */
		useOnlyFirstXForwardedForIp?: boolean;
	}): CriteriaBuilder {
		if (typeof params.field === 'undefined') {
			params.field = 'COUNTRY';
		}

		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (typeof params.checkIps === 'undefined') {
			params.checkIps = 'BOTH';
		}

		if (
			typeof params.useOnlyFirstXForwardedForIp === 'undefined' &&
			params.checkIps !== undefined &&
			['BOTH', 'HEADERS'].includes(params.checkIps)
		) {
			params.useOnlyFirstXForwardedForIp = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'userLocation', {}, params));
	}

	/**
	 * Matches details of the network over which the request was made, determined by looking up the IP address in a
	 * database.
	 *
	 * @param {object} params - The parameters needed to configure onUserNetwork
	 * @param {'NETWORK' | 'NETWORK_TYPE' | 'BANDWIDTH'} [params.field] - The type of information to match. Default:
	 *   "NETWORK".
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF'} [params.matchOperator] - Matches the specified set of values when set to
	 *   `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match. Default: "IS_ONE_OF".
	 * @param {('CABLE' | 'DIALUP' | 'DSL' | 'FIOS' | 'ISDN' | 'MOBILE' | 'UVERSE')[]} [params.networkTypeValues] -
	 *   Specifies the basic type of network.
	 * @param {(
	 * 	| 'AIRTEL'
	 * 	| 'ALPHA_INTERNET'
	 * 	| 'ALTITUDE_TELECOM'
	 * 	| 'AOL'
	 * 	| 'ARNET'
	 * 	| 'ASAHI'
	 * 	| 'ATT'
	 * 	| 'AWS'
	 * 	| 'BELL_CANADA'
	 * 	| 'BELLALIANT'
	 * 	| 'BIGLOBE'
	 * 	| 'BITMAILER'
	 * 	| 'BOUYGUES'
	 * 	| 'BRIGHT_HOUSE'
	 * 	| 'BSKYB'
	 * 	| 'BT'
	 * 	| 'CABLEONE'
	 * 	| 'CABLEVISION'
	 * 	| 'CERNET'
	 * 	| 'CHARTER'
	 * 	| 'CHINA_MOBILE'
	 * 	| 'CHINANET'
	 * 	| 'CHINA_UNICOM'
	 * 	| 'CLEARWIRE'
	 * 	| 'COGECO'
	 * 	| 'COLOCROSSING'
	 * 	| 'COLT'
	 * 	| 'COMCAST'
	 * 	| 'COMPLETEL'
	 * 	| 'COMPUSERVE'
	 * 	| 'COVAD'
	 * 	| 'DION'
	 * 	| 'DIRECTV'
	 * 	| 'DREAMNET'
	 * 	| 'DTAG'
	 * 	| 'DTI'
	 * 	| 'EARTHLINK'
	 * 	| 'EASYNET'
	 * 	| 'EITC'
	 * 	| 'ETISALAT'
	 * 	| 'EUROCIBER'
	 * 	| 'FASTWEB'
	 * 	| 'FIBERTEL'
	 * 	| 'FRANCE_TELECOM'
	 * 	| 'FREE'
	 * 	| 'FREECOM'
	 * 	| 'FRONTIER'
	 * 	| 'GOOGLECLOUD'
	 * 	| 'H3G'
	 * 	| 'HINET'
	 * 	| 'IBM'
	 * 	| 'IDECNET'
	 * 	| 'IIJ4U'
	 * 	| 'INFOSPHERE'
	 * 	| 'JANET'
	 * 	| 'JAZZTELL'
	 * 	| 'JUSTNET'
	 * 	| 'LIVEDOOR'
	 * 	| 'MCI'
	 * 	| 'MEDIACOM'
	 * 	| 'MEDIA_ONE'
	 * 	| 'MICROSOFT'
	 * 	| 'MIL'
	 * 	| '@NIFTY'
	 * 	| 'NERIM'
	 * 	| 'NEWNET'
	 * 	| 'NUMERICABLE'
	 * 	| 'OCN'
	 * 	| 'ODN'
	 * 	| 'ONO'
	 * 	| 'PANASONIC_HI_HO'
	 * 	| 'PLALA'
	 * 	| 'PLUSNET'
	 * 	| 'PRODIGY'
	 * 	| 'QWEST'
	 * 	| 'RCN'
	 * 	| 'REDIRIS'
	 * 	| 'RENATER'
	 * 	| 'RETEVISION'
	 * 	| 'ROAD_RUNNER'
	 * 	| 'ROGERS'
	 * 	| 'SASKTEL'
	 * 	| 'SEEDNET'
	 * 	| 'SEIKYO_INTERNET'
	 * 	| 'SFR'
	 * 	| 'SHAW'
	 * 	| 'SO_NET'
	 * 	| 'SOFTLAYER'
	 * 	| 'SPRINT'
	 * 	| 'SUDDENLINK'
	 * 	| 'TALKTALK'
	 * 	| 'TEKSAAVY'
	 * 	| 'TELEFONICA'
	 * 	| 'TELSTRA'
	 * 	| 'TERRA_MEXICO'
	 * 	| 'TI'
	 * 	| 'TIKITIKI'
	 * 	| 'TIME_WARNER'
	 * 	| 'TISCALI'
	 * 	| 'T_MOBILE'
	 * 	| 'TURK_TELEKOM'
	 * 	| 'UNI2'
	 * 	| 'UNINET'
	 * 	| 'UPC'
	 * 	| 'USEMB'
	 * 	| 'UUNET'
	 * 	| 'VERIZON'
	 * 	| 'VIRGIN_MEDIA'
	 * 	| 'VODAFONE'
	 * 	| 'WAKWAK'
	 * 	| 'WIND'
	 * 	| 'WINDSTREAM'
	 * 	| 'ZERO'
	 * 	| 'RESERVED'
	 * )[]} [params.networkValues]
	 *   - Any set of specific networks.
	 *
	 * @param {('1' | '57' | '257' | '1000' | '2000' | '5000')[]} [params.bandwidthValues] - Bandwidth range in bits per
	 *   second, either `1`, `57`, `257`, `1000`, `2000`, or `5000`.
	 * @param {'BOTH' | 'CONNECTING' | 'HEADERS'} [params.checkIps] - Specifies which IP addresses determine the user's
	 *   network. Default: "BOTH".
	 * @param {boolean} [params.useOnlyFirstXForwardedForIp] - When connecting via a proxy server as determined by the
	 *   `X-Forwarded-For` header, enabling this option matches the end client specified in the header. Disabling it
	 *   matches the connecting client's IP address. Default: false.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/user-network-data | Akamai Techdocs}
	 */
	onUserNetwork(params: {
		/** The type of information to match. Default: "NETWORK". */
		field?: 'NETWORK' | 'NETWORK_TYPE' | 'BANDWIDTH';

		/**
		 * Matches the specified set of values when set to `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match.
		 * Default: "IS_ONE_OF".
		 */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF';

		/** Specifies the basic type of network. */
		networkTypeValues?: Array<'CABLE' | 'DIALUP' | 'DSL' | 'FIOS' | 'ISDN' | 'MOBILE' | 'UVERSE'>;

		/** Any set of specific networks. */
		networkValues?: Array<
			| 'AIRTEL'
			| 'ALPHA_INTERNET'
			| 'ALTITUDE_TELECOM'
			| 'AOL'
			| 'ARNET'
			| 'ASAHI'
			| 'ATT'
			| 'AWS'
			| 'BELL_CANADA'
			| 'BELLALIANT'
			| 'BIGLOBE'
			| 'BITMAILER'
			| 'BOUYGUES'
			| 'BRIGHT_HOUSE'
			| 'BSKYB'
			| 'BT'
			| 'CABLEONE'
			| 'CABLEVISION'
			| 'CERNET'
			| 'CHARTER'
			| 'CHINA_MOBILE'
			| 'CHINANET'
			| 'CHINA_UNICOM'
			| 'CLEARWIRE'
			| 'COGECO'
			| 'COLOCROSSING'
			| 'COLT'
			| 'COMCAST'
			| 'COMPLETEL'
			| 'COMPUSERVE'
			| 'COVAD'
			| 'DION'
			| 'DIRECTV'
			| 'DREAMNET'
			| 'DTAG'
			| 'DTI'
			| 'EARTHLINK'
			| 'EASYNET'
			| 'EITC'
			| 'ETISALAT'
			| 'EUROCIBER'
			| 'FASTWEB'
			| 'FIBERTEL'
			| 'FRANCE_TELECOM'
			| 'FREE'
			| 'FREECOM'
			| 'FRONTIER'
			| 'GOOGLECLOUD'
			| 'H3G'
			| 'HINET'
			| 'IBM'
			| 'IDECNET'
			| 'IIJ4U'
			| 'INFOSPHERE'
			| 'JANET'
			| 'JAZZTELL'
			| 'JUSTNET'
			| 'LIVEDOOR'
			| 'MCI'
			| 'MEDIACOM'
			| 'MEDIA_ONE'
			| 'MICROSOFT'
			| 'MIL'
			| '@NIFTY'
			| 'NERIM'
			| 'NEWNET'
			| 'NUMERICABLE'
			| 'OCN'
			| 'ODN'
			| 'ONO'
			| 'PANASONIC_HI_HO'
			| 'PLALA'
			| 'PLUSNET'
			| 'PRODIGY'
			| 'QWEST'
			| 'RCN'
			| 'REDIRIS'
			| 'RENATER'
			| 'RETEVISION'
			| 'ROAD_RUNNER'
			| 'ROGERS'
			| 'SASKTEL'
			| 'SEEDNET'
			| 'SEIKYO_INTERNET'
			| 'SFR'
			| 'SHAW'
			| 'SO_NET'
			| 'SOFTLAYER'
			| 'SPRINT'
			| 'SUDDENLINK'
			| 'TALKTALK'
			| 'TEKSAAVY'
			| 'TELEFONICA'
			| 'TELSTRA'
			| 'TERRA_MEXICO'
			| 'TI'
			| 'TIKITIKI'
			| 'TIME_WARNER'
			| 'TISCALI'
			| 'T_MOBILE'
			| 'TURK_TELEKOM'
			| 'UNI2'
			| 'UNINET'
			| 'UPC'
			| 'USEMB'
			| 'UUNET'
			| 'VERIZON'
			| 'VIRGIN_MEDIA'
			| 'VODAFONE'
			| 'WAKWAK'
			| 'WIND'
			| 'WINDSTREAM'
			| 'ZERO'
			| 'RESERVED'
		>;

		/** Bandwidth range in bits per second, either `1`, `57`, `257`, `1000`, `2000`, or `5000`. */
		bandwidthValues?: Array<'1' | '57' | '257' | '1000' | '2000' | '5000'>;

		/** Specifies which IP addresses determine the user's network. Default: "BOTH". */
		checkIps?: 'BOTH' | 'CONNECTING' | 'HEADERS';

		/**
		 * When connecting via a proxy server as determined by the `X-Forwarded-For` header, enabling this option
		 * matches the end client specified in the header. Disabling it matches the connecting client's IP address.
		 * Default: false.
		 */
		useOnlyFirstXForwardedForIp?: boolean;
	}): CriteriaBuilder {
		if (typeof params.field === 'undefined') {
			params.field = 'NETWORK';
		}

		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (typeof params.checkIps === 'undefined') {
			params.checkIps = 'BOTH';
		}

		if (
			typeof params.useOnlyFirstXForwardedForIp === 'undefined' &&
			params.checkIps !== undefined &&
			['BOTH', 'HEADERS'].includes(params.checkIps)
		) {
			params.useOnlyFirstXForwardedForIp = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'userNetwork', {}, params));
	}

	/**
	 * Matches how the current rule corresponds to low-level syntax elements in translated XML metadata, indicating
	 * progressive stages as each edge server handles the request and response. To use this match, you need to be
	 * thoroughly familiar with how Akamai edge servers process requests. Contact your Akamai Technical representative
	 * if you need help, and test thoroughly on staging before activating on production.
	 *
	 * @param {object} params - The parameters needed to configure onMetadataStage
	 * @param {'IS' | 'IS_NOT'} [params.matchOperator] - Compares the current rule with the specified metadata stage.
	 *   Default: "IS".
	 * @param {'cache-hit'
	 * 	| 'client-done'
	 * 	| 'client-request'
	 * 	| 'client-request-body'
	 * 	| 'client-response'
	 * 	| 'content-policy'
	 * 	| 'forward-request'
	 * 	| 'forward-response'
	 * 	| 'forward-start'
	 * 	| 'ipa-response'} [params.value]
	 *   - Specifies the metadata stage. Default: "client-request".
	 *
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/metadata-stage | Akamai Techdocs}
	 */
	onMetadataStage(params: {
		/** Compares the current rule with the specified metadata stage. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT';

		/** Specifies the metadata stage. Default: "client-request". */
		value?:
			| 'cache-hit'
			| 'client-done'
			| 'client-request'
			| 'client-request-body'
			| 'client-response'
			| 'content-policy'
			| 'forward-request'
			| 'forward-response'
			| 'forward-start'
			| 'ipa-response';
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		if (typeof params.value === 'undefined') {
			params.value = 'client-request';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'metadataStage', {}, params));
	}

	/**
	 * Matches a regular expression against a string, especially to apply behaviors flexibly based on the contents of
	 * dynamic [variables](ref:variables).
	 *
	 * @param {object} params - The parameters needed to configure onRegularExpression
	 * @param {string} [params.matchString] - The string to match, typically the contents of a dynamic variable.
	 *   Default: "". PM variables may appear between '{{' and '}}'.
	 * @param {string} [params.regex] - The regular expression (PCRE) to match against the string. Default: "".
	 * @param {boolean} [params.caseSensitive] - Sets a case-sensitive regular expression match. Default: true.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/regex | Akamai Techdocs}
	 */
	onRegularExpression(params: {
		/**
		 * The string to match, typically the contents of a dynamic variable. Default: "". PM variables may appear
		 * between '{{' and '}}'.
		 */
		matchString?: string;

		/** The regular expression (PCRE) to match against the string. Default: "". */
		regex?: string;

		/** Sets a case-sensitive regular expression match. Default: true. */
		caseSensitive?: boolean;
	}): CriteriaBuilder {
		if (typeof params.matchString === 'undefined') {
			params.matchString = '';
		}

		if (typeof params.regex === 'undefined') {
			params.regex = '';
		}

		if (typeof params.caseSensitive === 'undefined') {
			params.caseSensitive = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('CRITERIA', 'regularExpression', {allowsVars: ['matchString']}, params),
		);
	}

	/**
	 * Matches the basic type of request. To use this match, you need to be thoroughly familiar with how Akamai edge
	 * servers process requests. Contact your Akamai Technical representative if you need help, and test thoroughly on
	 * staging before activating on production.
	 *
	 * @param {object} params - The parameters needed to configure onRequestType
	 * @param {'IS' | 'IS_NOT'} [params.matchOperator] - Specifies whether the request `IS` or `IS_NOT` the type of
	 *   specified `value`. Default: "IS".
	 * @param {'CLIENT_REQ' | 'ESI_FRAGMENT' | 'EW_SUBREQUEST'} [params.value] - Specifies the type of request, either a
	 *   standard `CLIENT_REQ`, an `ESI_FRAGMENT`, or an `EW_SUBREQUEST`. Default: "CLIENT_REQ".
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/req-type | Akamai Techdocs}
	 */
	onRequestType(params: {
		/** Specifies whether the request `IS` or `IS_NOT` the type of specified `value`. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT';

		/**
		 * Specifies the type of request, either a standard `CLIENT_REQ`, an `ESI_FRAGMENT`, or an `EW_SUBREQUEST`.
		 * Default: "CLIENT_REQ".
		 */
		value?: 'CLIENT_REQ' | 'ESI_FRAGMENT' | 'EW_SUBREQUEST';
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		if (typeof params.value === 'undefined') {
			params.value = 'CLIENT_REQ';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'requestType', {}, params));
	}

	/**
	 * Checks the EdgeWorkers execution status and detects whether a customer's JavaScript failed on edge servers.
	 *
	 * @param {object} params - The parameters needed to configure onEdgeWorkersFailure
	 * @param {'FAILURE' | 'SUCCESS'} [params.execStatus] - Specify execution status. Default: "FAILURE".
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/edge-workers-failure | Akamai Techdocs}
	 */
	onEdgeWorkersFailure(params: {
		/** Specify execution status. Default: "FAILURE". */
		execStatus?: 'FAILURE' | 'SUCCESS';
	}): CriteriaBuilder {
		if (typeof params.execStatus === 'undefined') {
			params.execStatus = 'FAILURE';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'edgeWorkersFailure', {}, params));
	}

	/**
	 * Match various aspects of the device or browser making the request. Based on the value of the `characteristic`
	 * option, the expected value is either a boolean, a number, or a string, possibly representing a version number.
	 * Each type of value requires a different field.
	 *
	 * @param {object} params - The parameters needed to configure onDeviceCharacteristic
	 * @param {'BRAND_NAME'
	 * 	| 'MODEL_NAME'
	 * 	| 'MARKETING_NAME'
	 * 	| 'IS_WIRELESS_DEVICE'
	 * 	| 'IS_TABLET'
	 * 	| 'DEVICE_OS'
	 * 	| 'DEVICE_OS_VERSION'
	 * 	| 'MOBILE_BROWSER'
	 * 	| 'MOBILE_BROWSER_VERSION'
	 * 	| 'RESOLUTION_WIDTH'
	 * 	| 'RESOLUTION_HEIGHT'
	 * 	| 'PHYSICAL_SCREEN_HEIGHT'
	 * 	| 'PHYSICAL_SCREEN_WIDTH'
	 * 	| 'COOKIE_SUPPORT'
	 * 	| 'AJAX_SUPPORT_JAVASCRIPT'
	 * 	| 'FULL_FLASH_SUPPORT'
	 * 	| 'ACCEPT_THIRD_PARTY_COOKIE'
	 * 	| 'XHTML_SUPPORT_LEVEL'
	 * 	| 'IS_MOBILE'} [params.characteristic]
	 *   - Aspect of the device or browser to match. Default: "IS_WIRELESS_DEVICE".
	 *
	 * @param {'MATCHES_ONE_OF' | 'DOES_NOT_MATCH_ONE_OF'} [params.stringMatchOperator] - When the `characteristic`
	 *   expects a string value, set this to `MATCHES_ONE_OF` to match against the `stringValue` set, otherwise set to
	 *   `DOES_NOT_MATCH_ONE_OF` to exclude that set of values. Default: "MATCHES_ONE_OF".
	 * @param {'IS'
	 * 	| 'IS_NOT'
	 * 	| 'IS_LESS_THAN'
	 * 	| 'IS_LESS_THAN_OR_EQUAL'
	 * 	| 'IS_MORE_THAN'
	 * 	| 'IS_MORE_THAN_OR_EQUAL'} [params.numericMatchOperator]
	 *   - When the `characteristic` expects a numeric value, compares the specified `numericValue` against the matched
	 *       client. Default: "IS".
	 *
	 * @param {'IS'
	 * 	| 'IS_NOT'
	 * 	| 'IS_LESS_THAN'
	 * 	| 'IS_LESS_THAN_OR_EQUAL'
	 * 	| 'IS_MORE_THAN'
	 * 	| 'IS_MORE_THAN_OR_EQUAL'} [params.versionMatchOperator]
	 *   - When the `characteristic` expects a version string value, compares the specified `versionValue` against the
	 *       matched client, using the following operators: `IS`, `IS_MORE_THAN_OR_EQUAL`, `IS_MORE_THAN`,
	 *       `IS_LESS_THAN_OR_EQUAL`, `IS_LESS_THAN`, `IS_NOT`. Default: "IS".
	 *
	 * @param {boolean} [params.booleanValue] - When the `characteristic` expects a boolean value, this specifies the
	 *   value. Default: true.
	 * @param {string[]} [params.stringValue] - When the `characteristic` expects a string, this specifies the set of
	 *   values.
	 * @param {number} [params.numericValue] - When the `characteristic` expects a numeric value, this specifies the
	 *   number.
	 * @param {string} [params.versionValue] - When the `characteristic` expects a version number, this specifies it as
	 *   a string.
	 * @param {boolean} [params.matchCaseSensitive] - Sets a case-sensitive match for the `stringValue` field. Default:
	 *   false.
	 * @param {boolean} [params.matchWildcard] - Allows wildcards in the `stringValue` field, where `?` matches a single
	 *   character and `*` matches zero or more characters. Default: true.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/device-charac | Akamai Techdocs}
	 */
	onDeviceCharacteristic(params: {
		/** Aspect of the device or browser to match. Default: "IS_WIRELESS_DEVICE". */
		characteristic?:
			| 'BRAND_NAME'
			| 'MODEL_NAME'
			| 'MARKETING_NAME'
			| 'IS_WIRELESS_DEVICE'
			| 'IS_TABLET'
			| 'DEVICE_OS'
			| 'DEVICE_OS_VERSION'
			| 'MOBILE_BROWSER'
			| 'MOBILE_BROWSER_VERSION'
			| 'RESOLUTION_WIDTH'
			| 'RESOLUTION_HEIGHT'
			| 'PHYSICAL_SCREEN_HEIGHT'
			| 'PHYSICAL_SCREEN_WIDTH'
			| 'COOKIE_SUPPORT'
			| 'AJAX_SUPPORT_JAVASCRIPT'
			| 'FULL_FLASH_SUPPORT'
			| 'ACCEPT_THIRD_PARTY_COOKIE'
			| 'XHTML_SUPPORT_LEVEL'
			| 'IS_MOBILE';

		/**
		 * When the `characteristic` expects a string value, set this to `MATCHES_ONE_OF` to match against the
		 * `stringValue` set, otherwise set to `DOES_NOT_MATCH_ONE_OF` to exclude that set of values. Default:
		 * "MATCHES_ONE_OF".
		 */
		stringMatchOperator?: 'MATCHES_ONE_OF' | 'DOES_NOT_MATCH_ONE_OF';

		/**
		 * When the `characteristic` expects a numeric value, compares the specified `numericValue` against the matched
		 * client. Default: "IS".
		 */
		numericMatchOperator?:
			| 'IS'
			| 'IS_NOT'
			| 'IS_LESS_THAN'
			| 'IS_LESS_THAN_OR_EQUAL'
			| 'IS_MORE_THAN'
			| 'IS_MORE_THAN_OR_EQUAL';

		/**
		 * When the `characteristic` expects a version string value, compares the specified `versionValue` against the
		 * matched client, using the following operators: `IS`, `IS_MORE_THAN_OR_EQUAL`, `IS_MORE_THAN`,
		 * `IS_LESS_THAN_OR_EQUAL`, `IS_LESS_THAN`, `IS_NOT`. Default: "IS".
		 */
		versionMatchOperator?:
			| 'IS'
			| 'IS_NOT'
			| 'IS_LESS_THAN'
			| 'IS_LESS_THAN_OR_EQUAL'
			| 'IS_MORE_THAN'
			| 'IS_MORE_THAN_OR_EQUAL';

		/** When the `characteristic` expects a boolean value, this specifies the value. Default: true. */
		booleanValue?: boolean;

		/** When the `characteristic` expects a string, this specifies the set of values. */
		stringValue?: string[];

		/** When the `characteristic` expects a numeric value, this specifies the number. */
		numericValue?: number;

		/** When the `characteristic` expects a version number, this specifies it as a string. */
		versionValue?: string;

		/** Sets a case-sensitive match for the `stringValue` field. Default: false. */
		matchCaseSensitive?: boolean;

		/**
		 * Allows wildcards in the `stringValue` field, where `?` matches a single character and `*` matches zero or
		 * more characters. Default: true.
		 */
		matchWildcard?: boolean;
	}): CriteriaBuilder {
		if (typeof params.characteristic === 'undefined') {
			params.characteristic = 'IS_WIRELESS_DEVICE';
		}

		if (
			typeof params.stringMatchOperator === 'undefined' &&
			params.characteristic !== undefined &&
			[
				'BRAND_NAME',
				'MODEL_NAME',
				'MARKETING_NAME',
				'DEVICE_OS',
				'MOBILE_BROWSER',
				'PREFERRED_MARKUP',
				'HTML_PREFERRED_DTD',
				'XHTML_PREFERRED_CHARSET',
				'VIEWPORT_WIDTH',
				'XHTMLMP_PREFERRED_MIME_TYPE',
				'AJAX_PREFERRED_GEOLOC_API',
				'XHTML_FILE_UPLOAD',
				'XHTML_SUPPORTS_IFRAME',
				'FLASH_LITE_VERSION',
			].includes(params.characteristic)
		) {
			params.stringMatchOperator = 'MATCHES_ONE_OF';
		}

		if (
			typeof params.numericMatchOperator === 'undefined' &&
			params.characteristic !== undefined &&
			[
				'RESOLUTION_WIDTH',
				'RESOLUTION_HEIGHT',
				'PHYSICAL_SCREEN_HEIGHT',
				'PHYSICAL_SCREEN_WIDTH',
				'XHTML_SUPPORT_LEVEL',
				'MAX_IMAGE_WIDTH',
				'MAX_IMAGE_HEIGHT',
				'VIEWPORT_INITIAL_SCALE',
			].includes(params.characteristic)
		) {
			params.numericMatchOperator = 'IS';
		}

		if (
			typeof params.versionMatchOperator === 'undefined' &&
			params.characteristic !== undefined &&
			['DEVICE_OS_VERSION', 'MOBILE_BROWSER_VERSION'].includes(params.characteristic)
		) {
			params.versionMatchOperator = 'IS';
		}

		if (
			typeof params.booleanValue === 'undefined' &&
			params.characteristic !== undefined &&
			[
				'IS_WIRELESS_DEVICE',
				'IS_TABLET',
				'COOKIE_SUPPORT',
				'AJAX_SUPPORT_JAVASCRIPT',
				'FULL_FLASH_SUPPRT',
				'DUAL_ORIENTATION',
				'ACCEPT_THIRD_PARTY_COOKIE',
				'GIF_ANIMATED',
				'JPG',
				'PNG',
				'XHTML_SUPPORTS_TABLE_FOR_LAYOUT',
				'XHTML_TABLE_SUPPORT',
				'PDF_SUPPORT',
				'IS_MOBILE',
			].includes(params.characteristic)
		) {
			params.booleanValue = true;
		}

		if (
			typeof params.matchCaseSensitive === 'undefined' &&
			params.stringMatchOperator !== undefined &&
			['MATCHES_ONE_OF', 'DOES_NOT_MATCH_ONE_OF'].includes(params.stringMatchOperator)
		) {
			params.matchCaseSensitive = false;
		}

		if (
			typeof params.matchWildcard === 'undefined' &&
			params.stringMatchOperator !== undefined &&
			['MATCHES_ONE_OF', 'DOES_NOT_MATCH_ONE_OF'].includes(params.stringMatchOperator)
		) {
			params.matchWildcard = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'deviceCharacteristic', {}, params));
	}

	/**
	 * This matches a specified percentage of requests when used with the accompanying behavior. Contact Akamai
	 * Professional Services for help configuring it.
	 *
	 * @param {object} params - The parameters needed to configure onBucket
	 * @param {number} [params.percentage] - Specifies the percentage of requests to match. Default: 100.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/percentage-clients | Akamai Techdocs}
	 */
	onBucket(params: {
		/** Specifies the percentage of requests to match. Default: 100. */
		percentage?: number;
	}): CriteriaBuilder {
		if (typeof params.percentage === 'undefined') {
			params.percentage = 100;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'bucket', {}, params));
	}

	/**
	 * Matches whether the [`imageManager`](#) behavior already applies to the current set of requests.
	 *
	 * @param {object} params - The parameters needed to configure onAdvancedImMatch
	 * @param {'IS' | 'IS_NOT'} [params.matchOperator] - Specifies the match's logic. Default: "IS".
	 * @param {'ANY_IM' | 'PRISTINE'} [params.matchOn] - Specifies the match's scope. Default: "ANY_IM".
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/img-video-manager | Akamai Techdocs}
	 */
	onAdvancedImMatch(params: {
		/** Specifies the match's logic. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT';

		/** Specifies the match's scope. Default: "ANY_IM". */
		matchOn?: 'ANY_IM' | 'PRISTINE';
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		if (typeof params.matchOn === 'undefined') {
			params.matchOn = 'ANY_IM';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'advancedImMatch', {}, params));
	}

	/**
	 * Matches when the origin responds with a timeout error.
	 *
	 * @param {object} params - The parameters needed to configure onOriginTimeout
	 * @param {'ORIGIN_TIMED_OUT'} [params.matchOperator] - Specifies a single required `ORIGIN_TIMED_OUT` value.
	 *   Default: "ORIGIN_TIMED_OUT".
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/origin-timeout | Akamai Techdocs}
	 */
	onOriginTimeout(params: {
		/** Specifies a single required `ORIGIN_TIMED_OUT` value. Default: "ORIGIN_TIMED_OUT". */
		matchOperator?: 'ORIGIN_TIMED_OUT';
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'ORIGIN_TIMED_OUT';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'originTimeout', {}, params));
	}

	/**
	 * Matches a built-in variable, or a custom variable pre-declared within the rule tree by the [`setVariable`](#)
	 * behavior. See [Support for variables](ref:variables) for more information on this feature.
	 *
	 * @param {object} params - The parameters needed to configure onMatchVariable
	 * @param {string} params.variableName - The name of the variable to match.
	 * @param {'IS'
	 * 	| 'IS_NOT'
	 * 	| 'IS_ONE_OF'
	 * 	| 'IS_NOT_ONE_OF'
	 * 	| 'IS_EMPTY'
	 * 	| 'IS_NOT_EMPTY'
	 * 	| 'IS_BETWEEN'
	 * 	| 'IS_NOT_BETWEEN'
	 * 	| 'IS_GREATER_THAN'
	 * 	| 'IS_GREATER_THAN_OR_EQUAL_TO'
	 * 	| 'IS_LESS_THAN'
	 * 	| 'IS_LESS_THAN_OR_EQUAL_TO'} [params.matchOperator]
	 *   - The type of match, based on which you use different options to specify the match criteria. Default: "IS_ONE_OF".
	 *
	 * @param {string[]} [params.variableValues] - Specifies an array of matching strings.
	 * @param {string} [params.variableExpression] - Specifies a single matching string. PM variables may appear between
	 *   '{{' and '}}'.
	 * @param {string} [params.lowerBound] - Specifies the range's numeric minimum value.
	 * @param {string} [params.upperBound] - Specifies the range's numeric maximum value.
	 * @param {boolean} [params.matchWildcard] - When matching string expressions, enabling this allows wildcards, where
	 *   `?` matches a single character and `*` matches zero or more characters. Default: false.
	 * @param {boolean} [params.matchCaseSensitive] - When matching string expressions, enabling this performs a
	 *   case-sensitive match. Default: true.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/var | Akamai Techdocs}
	 */
	onMatchVariable(params: {
		/** The name of the variable to match. */
		variableName: string;

		/**
		 * The type of match, based on which you use different options to specify the match criteria. Default:
		 * "IS_ONE_OF".
		 */
		matchOperator?:
			| 'IS'
			| 'IS_NOT'
			| 'IS_ONE_OF'
			| 'IS_NOT_ONE_OF'
			| 'IS_EMPTY'
			| 'IS_NOT_EMPTY'
			| 'IS_BETWEEN'
			| 'IS_NOT_BETWEEN'
			| 'IS_GREATER_THAN'
			| 'IS_GREATER_THAN_OR_EQUAL_TO'
			| 'IS_LESS_THAN'
			| 'IS_LESS_THAN_OR_EQUAL_TO';

		/** Specifies an array of matching strings. */
		variableValues?: string[];

		/** Specifies a single matching string. PM variables may appear between '{{' and '}}'. */
		variableExpression?: string;

		/** Specifies the range's numeric minimum value. */
		lowerBound?: string;

		/** Specifies the range's numeric maximum value. */
		upperBound?: string;

		/**
		 * When matching string expressions, enabling this allows wildcards, where `?` matches a single character and
		 * `*` matches zero or more characters. Default: false.
		 */
		matchWildcard?: boolean;

		/** When matching string expressions, enabling this performs a case-sensitive match. Default: true. */
		matchCaseSensitive?: boolean;
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (
			typeof params.matchWildcard === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS', 'IS_NOT', 'IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.matchWildcard = false;
		}

		if (
			typeof params.matchCaseSensitive === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS', 'IS_NOT', 'IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.matchCaseSensitive = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'CRITERIA',
				'matchVariable',
				{allowsVars: ['variableExpression'], variable: ['variableName']},
				params,
			),
		);
	}

	/**
	 * Matches any runtime errors that occur on edge servers based on the configuration of a [`setVariable`](#)
	 * behavior. See [Support for variables](ref:variables) section for more information on this feature.
	 *
	 * @param {object} params - The parameters needed to configure onVariableError
	 * @param {boolean} [params.result] - Matches errors for the specified set of `variableNames`, otherwise matches
	 *   errors from variables outside that set. Default: true.
	 * @param {string[]} params.variableNames - The name of the variable whose error triggers the match, or a space- or
	 *   comma-delimited list of more than one variable name. Note that if you define a variable named `VAR`, the name
	 *   in this field needs to appear with its added prefix as `PMUSER_VAR`. When such a variable is inserted into
	 *   other fields, it appears with an additional namespace as `{{user.PMUSER_VAR}}`. See the [`setVariable`](#)
	 *   behavior for details on variable names.
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/var-err | Akamai Techdocs}
	 */
	onVariableError(params: {
		/**
		 * Matches errors for the specified set of `variableNames`, otherwise matches errors from variables outside that
		 * set. Default: true.
		 */
		result?: boolean;

		/**
		 * The name of the variable whose error triggers the match, or a space- or comma-delimited list of more than one
		 * variable name. Note that if you define a variable named `VAR`, the name in this field needs to appear with
		 * its added prefix as `PMUSER_VAR`. When such a variable is inserted into other fields, it appears with an
		 * additional namespace as `{{user.PMUSER_VAR}}`. See the [`setVariable`](#) behavior for details on variable
		 * names.
		 */
		variableNames: string[];
	}): CriteriaBuilder {
		if (typeof params.result === 'undefined') {
			params.result = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('CRITERIA', 'variableError', {variableList: ['variableNames']}, params),
		);
	}

	/**
	 * Helps to customize the requests identified by the [`virtualWaitingRoom`](#) behavior. Use this match criteria to
	 * define the [`originServer`](#) behavior for the waiting room.
	 *
	 * @param {object} params - The parameters needed to configure onVirtualWaitingRoomRequest
	 * @param {'IS' | 'IS_NOT'} [params.matchOperator] - Specifies the match's logic. Default: "IS".
	 * @param {'WR_ANY' | 'WR_MAIN_PAGE' | 'WR_ASSETS'} [params.matchOn] - Specifies the type of request identified by
	 *   the [`virtualWaitingRoom`](#) behavior. Default: "WR_ANY".
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/virtual-waiting-room-request | Akamai Techdocs}
	 */
	onVirtualWaitingRoomRequest(params: {
		/** Specifies the match's logic. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT';

		/** Specifies the type of request identified by the [`virtualWaitingRoom`](#) behavior. Default: "WR_ANY". */
		matchOn?: 'WR_ANY' | 'WR_MAIN_PAGE' | 'WR_ASSETS';
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		if (typeof params.matchOn === 'undefined') {
			params.matchOn = 'WR_ANY';
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('CRITERIA', 'virtualWaitingRoomRequest', {}, params),
		);
	}

	/**
	 * Helps to customize the requests identified by the [`visitorPrioritizationFifo`](#) behavior. The basic use case
	 * for this match criteria is to define the [`originServer`](#) behavior for the waiting room.
	 *
	 * @param {object} params - The parameters needed to configure onVisitorPrioritizationRequest
	 * @param {'IS' | 'IS_NOT'} [params.matchOperator] - Specifies the match's logic. Default: "IS".
	 * @param {'WR_ANY' | 'WR_MAIN_PAGE' | 'WR_ASSETS'} [params.matchOn] - Specifies the type of request identified by
	 *   the [`visitorPrioritizationFifo`](#) behavior. Default: "WR_ANY".
	 * @returns {CriteriaBuilder} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/matches | Akamai Techdocs}
	 */
	onVisitorPrioritizationRequest(params: {
		/** Specifies the match's logic. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT';

		/** Specifies the type of request identified by the [`visitorPrioritizationFifo`](#) behavior. Default: "WR_ANY". */
		matchOn?: 'WR_ANY' | 'WR_MAIN_PAGE' | 'WR_ASSETS';
	}): CriteriaBuilder {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		if (typeof params.matchOn === 'undefined') {
			params.matchOn = 'WR_ANY';
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('CRITERIA', 'visitorPrioritizationRequest', {}, params),
		);
	}
}

export class Property {
	delegate: any;

	constructor(delegate: any) {
		this.delegate = delegate;
	}

	private wrapDelegateResponse(response: any): Property {
		return new Property(response);
	}

	/**
	 * Create a rule template where any of the criteria added to the builder must match
	 *
	 * @param {(cb: CriteriaBuilder) => void} cb
	 * @returns {Property} The property
	 */
	any(cb: (cfg: CriteriaBuilder) => void): Property {
		return new Property(this.delegate.doAny(cb));
	}

	/**
	 * Create a rule template where all the criteria added to the builder must match
	 *
	 * @param {(cb: CriteriaBuilder) => void} cb
	 * @returns {Property} The property
	 */
	all(cb: (cfg: CriteriaBuilder) => void): Property {
		return new Property(this.delegate.doAll(cb));
	}

	/**
	 * Create a grouping for keeping similar behaviours together. This is equivalent to a blank rule template.
	 *
	 * @param {string} groupName The name for the grouping
	 * @param {string} [comment] A comment to describe what the grouping is for
	 * @returns {Property} The property
	 */
	group(groupName: string, comment?: string): Property {
		return new Property(this.delegate.group(groupName, comment));
	}

	/** Set the name of the current rule. */
	name(ruleName: string): Property {
		return new Property(this.delegate.name(ruleName));
	}

	/** Set the is_secure value in the default rule. */
	is_secure(secureRule: boolean): Property {
		return new Property(this.delegate.is_secure(secureRule));
	}

	/** Set the comment for the current rule. */
	comment(comment: string): Property {
		return new Property(this.delegate.comment(comment));
	}

	/**
	 * Matches the current cache state. Note that any `NO_STORE` or `BYPASS_CACHE` HTTP headers set on the origin's
	 * content overrides properties' [`caching`](#) instructions, in which case this criteria does not apply.
	 *
	 * @param {object} params - The parameters needed to configure onCacheability
	 * @param {'IS' | 'IS_NOT'} [params.matchOperator] - Specifies the match's logic. Default: "IS".
	 * @param {'NO_STORE' | 'BYPASS_CACHE' | 'CACHEABLE'} [params.value] - Content's cache is enabled (`CACHEABLE`) or
	 *   not (`NO_STORE`), or else is ignored (`BYPASS_CACHE`). Default: "CACHEABLE".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/response-cacheability | Akamai Techdocs}
	 */
	onCacheability(params: {
		/** Specifies the match's logic. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT';

		/**
		 * Content's cache is enabled (`CACHEABLE`) or not (`NO_STORE`), or else is ignored (`BYPASS_CACHE`). Default:
		 * "CACHEABLE".
		 */
		value?: 'NO_STORE' | 'BYPASS_CACHE' | 'CACHEABLE';
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		if (typeof params.value === 'undefined') {
			params.value = 'CACHEABLE';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'cacheability', {}, params));
	}

	/**
	 * Identifies traffic deployed over Akamai's regional ChinaCDN infrastructure.
	 *
	 * @param {object} params - The parameters needed to configure onChinaCdnRegion
	 * @param {'IS' | 'IS_NOT'} [params.matchOperator] - Specify whether the request `IS` or `IS_NOT` deployed over
	 *   ChinaCDN. Default: "IS".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/chinacdn-region | Akamai Techdocs}
	 */
	onChinaCdnRegion(params: {
		/** Specify whether the request `IS` or `IS_NOT` deployed over ChinaCDN. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT';
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'chinaCdnRegion', {}, params));
	}

	/**
	 * Matches whether you have configured a client certificate to authenticate requests to edge servers.
	 *
	 * @param {object} params - The parameters needed to configure onClientCertificate
	 * @param {boolean} [params.isCertificatePresent] - Executes rule behaviors only if a client certificate
	 *   authenticates requests. Default: true.
	 * @param {'VALID' | 'INVALID' | 'IGNORE'} [params.isCertificateValid] - Matches whether the certificate is `VALID`
	 *   or `INVALID`. You can also `IGNORE` the certificate's validity. Default: "IGNORE".
	 * @param {boolean} [params.enforceMtls] - Specifies custom handling of requests if any of the checks in the
	 *   [`enforceMtlsSettings`](#) behavior fail. Enable this and use with behaviors such as [`logCustom`](#) so that
	 *   they execute if the check fails. You need to add the [`enforceMtlsSettings`](#) behavior to a parent rule, with
	 *   its own unique match condition and `enableDenyRequest` option disabled. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/client-cert | Akamai Techdocs}
	 */
	onClientCertificate(params: {
		/** Executes rule behaviors only if a client certificate authenticates requests. Default: true. */
		isCertificatePresent?: boolean;

		/**
		 * Matches whether the certificate is `VALID` or `INVALID`. You can also `IGNORE` the certificate's validity.
		 * Default: "IGNORE".
		 */
		isCertificateValid?: 'VALID' | 'INVALID' | 'IGNORE';

		/**
		 * Specifies custom handling of requests if any of the checks in the [`enforceMtlsSettings`](#) behavior fail.
		 * Enable this and use with behaviors such as [`logCustom`](#) so that they execute if the check fails. You need
		 * to add the [`enforceMtlsSettings`](#) behavior to a parent rule, with its own unique match condition and
		 * `enableDenyRequest` option disabled. Default: false.
		 */
		enforceMtls?: boolean;
	}): Property {
		if (typeof params.isCertificatePresent === 'undefined') {
			params.isCertificatePresent = true;
		}

		if (typeof params.isCertificateValid === 'undefined' && (params.isCertificatePresent as unknown) === true) {
			params.isCertificateValid = 'IGNORE';
		}

		if (
			typeof params.enforceMtls === 'undefined' &&
			((params.isCertificateValid as unknown) === 'VALID' || (params.isCertificateValid as unknown) === 'INVALID')
		) {
			params.enforceMtls = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'clientCertificate', {}, params));
	}

	/**
	 * Matches the IP number of the requesting client. To use this condition to match end-user IP addresses, apply it
	 * together with the [`requestType`](#) matching on the `CLIENT_REQ` value.
	 *
	 * @param {object} params - The parameters needed to configure onClientIp
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF'} [params.matchOperator] - Matches the contents of `values` if set to
	 *   `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match. Default: "IS_ONE_OF".
	 * @param {string[]} params.values - IP or CIDR block, for example: `71.92.0.0/14`.
	 * @param {boolean} [params.useHeaders] - When connecting via a proxy server as determined by the `X-Forwarded-For`
	 *   header, enabling this option matches the connecting client's IP address rather than the original end client
	 *   specified in the header. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/client-ip | Akamai Techdocs}
	 */
	onClientIp(params: {
		/**
		 * Matches the contents of `values` if set to `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match.
		 * Default: "IS_ONE_OF".
		 */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF';

		/** IP or CIDR block, for example: `71.92.0.0/14`. */
		values: string[];

		/**
		 * When connecting via a proxy server as determined by the `X-Forwarded-For` header, enabling this option
		 * matches the connecting client's IP address rather than the original end client specified in the header.
		 * Default: false.
		 */
		useHeaders?: boolean;
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (typeof params.useHeaders === 'undefined') {
			params.useHeaders = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'clientIp', {}, params));
	}

	/**
	 * Matches the version of the IP protocol used by the requesting client.
	 *
	 * @param {object} params - The parameters needed to configure onClientIpVersion
	 * @param {'IPV4' | 'IPV6'} [params.value] - The IP version of the client request, either `IPV4` or `IPV6`. Default:
	 *   "IPV4".
	 * @param {boolean} [params.useXForwardedFor] - When connecting via a proxy server as determined by the
	 *   `X-Forwarded-For` header, enabling this option matches the connecting client's IP address rather than the
	 *   original end client specified in the header. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/client-ip-version | Akamai Techdocs}
	 */
	onClientIpVersion(params: {
		/** The IP version of the client request, either `IPV4` or `IPV6`. Default: "IPV4". */
		value?: 'IPV4' | 'IPV6';

		/**
		 * When connecting via a proxy server as determined by the `X-Forwarded-For` header, enabling this option
		 * matches the connecting client's IP address rather than the original end client specified in the header.
		 * Default: false.
		 */
		useXForwardedFor?: boolean;
	}): Property {
		if (typeof params.value === 'undefined') {
			params.value = 'IPV4';
		}

		if (typeof params.useXForwardedFor === 'undefined') {
			params.useXForwardedFor = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'clientIpVersion', {}, params));
	}

	/**
	 * Specifies the type of Akamai network handling the request.
	 *
	 * @param {object} params - The parameters needed to configure onContentDeliveryNetwork
	 * @param {'IS' | 'IS_NOT'} [params.matchOperator] - Matches the specified `network` if set to `IS`, otherwise
	 *   `IS_NOT` reverses the match. Default: "IS".
	 * @param {'STAGING' | 'PRODUCTION'} [params.network] - Match the network. Default: "STAGING".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/cdn-network | Akamai Techdocs}
	 */
	onContentDeliveryNetwork(params: {
		/** Matches the specified `network` if set to `IS`, otherwise `IS_NOT` reverses the match. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT';

		/** Match the network. Default: "STAGING". */
		network?: 'STAGING' | 'PRODUCTION';
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		if (typeof params.network === 'undefined') {
			params.network = 'STAGING';
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('CRITERIA', 'contentDeliveryNetwork', {}, params),
		);
	}

	/**
	 * Matches the HTTP response header's `Content-Type`. > **Warning**. The Content Type match was updated in April
	 * 2023 and the change affects configurations that implement it together with the [`gzipResponse`](#) behavior. With
	 * the new change, if the origin server sends out the content in an uncompressed format, the Akamai edge servers
	 * cache it and deliver it to the requesting client in the compressed .gzip format. Clients using the Content-Length
	 * response header to determine the file size will now see the compressed size of the object returned from Akamai,
	 * rather than the uncompressed size of the object returned from the origin. If you updated your property
	 * configuration after April 3rd 2023, your `contentType` match is affected by this change.
	 *
	 * @param {object} params - The parameters needed to configure onContentType
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF'} [params.matchOperator] - Matches any `Content-Type` among specified
	 *   `values` when set to `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match. Default: "IS_ONE_OF".
	 * @param {string[]} [params.values] - `Content-Type` response header value, for example `text/html`. Default:
	 *   ["text/html*"].
	 * @param {boolean} [params.matchWildcard] - Allows wildcards in the `value` field, where `?` matches a single
	 *   character and `*` matches zero or more characters. Specifying `text/*` matches both `text/html` and `text/css`.
	 *   Default: true.
	 * @param {boolean} [params.matchCaseSensitive] - Sets a case-sensitive match for all `values`. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/content-type | Akamai Techdocs}
	 */
	onContentType(params: {
		/**
		 * Matches any `Content-Type` among specified `values` when set to `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF`
		 * reverses the match. Default: "IS_ONE_OF".
		 */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF';

		/** `Content-Type` response header value, for example `text/html`. Default: ["text/html*"]. */
		values?: string[];

		/**
		 * Allows wildcards in the `value` field, where `?` matches a single character and `*` matches zero or more
		 * characters. Specifying `text/*` matches both `text/html` and `text/css`. Default: true.
		 */
		matchWildcard?: boolean;

		/** Sets a case-sensitive match for all `values`. Default: false. */
		matchCaseSensitive?: boolean;
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (typeof params.values === 'undefined') {
			params.values = ['text/html*'];
		}

		if (typeof params.matchWildcard === 'undefined') {
			params.matchWildcard = true;
		}

		if (typeof params.matchCaseSensitive === 'undefined') {
			params.matchCaseSensitive = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'contentType', {}, params));
	}

	/**
	 * Matches the requested filename's extension, if present.
	 *
	 * @param {object} params - The parameters needed to configure onFileExtension
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF'} [params.matchOperator] - Matches the contents of `values` if set to
	 *   `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match. Default: "IS_ONE_OF".
	 * @param {string[]} params.values - An array of file extension strings, with no leading dot characters, for example
	 *   `png`, `jpg`, `jpeg`, and `gif`.
	 * @param {boolean} [params.matchCaseSensitive] - Sets a case-sensitive match. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/file-ext | Akamai Techdocs}
	 */
	onFileExtension(params: {
		/**
		 * Matches the contents of `values` if set to `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match.
		 * Default: "IS_ONE_OF".
		 */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF';

		/**
		 * An array of file extension strings, with no leading dot characters, for example `png`, `jpg`, `jpeg`, and
		 * `gif`.
		 */
		values: string[];

		/** Sets a case-sensitive match. Default: false. */
		matchCaseSensitive?: boolean;
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (typeof params.matchCaseSensitive === 'undefined') {
			params.matchCaseSensitive = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'fileExtension', {}, params));
	}

	/**
	 * Matches the requested filename, or test whether it is present.
	 *
	 * @param {object} params - The parameters needed to configure onFilename
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF' | 'IS_EMPTY' | 'IS_NOT_EMPTY'} [params.matchOperator] - If set to
	 *   `IS_ONE_OF` or `IS_NOT_ONE_OF`, matches whether the filename matches one of the `values`. If set to `IS_EMPTY`
	 *   or `IS_NOT_EMPTY`, matches whether the specified filename is part of the path. Default: "IS_ONE_OF".
	 * @param {string[]} [params.values] - Matches the filename component of the request URL. Allows wildcards, where
	 *   `?` matches a single character and `*` matches zero or more characters. For example, specify `filename.*` to
	 *   accept any extension.
	 * @param {boolean} [params.matchCaseSensitive] - Sets a case-sensitive match for the `values` field. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/filename-match | Akamai Techdocs}
	 */
	onFilename(params: {
		/**
		 * If set to `IS_ONE_OF` or `IS_NOT_ONE_OF`, matches whether the filename matches one of the `values`. If set to
		 * `IS_EMPTY` or `IS_NOT_EMPTY`, matches whether the specified filename is part of the path. Default:
		 * "IS_ONE_OF".
		 */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF' | 'IS_EMPTY' | 'IS_NOT_EMPTY';

		/**
		 * Matches the filename component of the request URL. Allows wildcards, where `?` matches a single character and
		 * `*` matches zero or more characters. For example, specify `filename.*` to accept any extension.
		 */
		values?: string[];

		/** Sets a case-sensitive match for the `values` field. Default: true. */
		matchCaseSensitive?: boolean;
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (
			typeof params.matchCaseSensitive === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.matchCaseSensitive = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'filename', {}, params));
	}

	/**
	 * Matches the requested hostname.
	 *
	 * @param {object} params - The parameters needed to configure onHostname
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF'} [params.matchOperator] - Matches the contents of `values` when set to
	 *   `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match. Default: "IS_ONE_OF".
	 * @param {string[]} params.values - A list of hostnames. Allows wildcards, where `?` matches a single character and
	 *   `*` matches zero or more characters. Specifying `*.example.com` matches both `m.example.com` and
	 *   `www.example.com`.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/hn | Akamai Techdocs}
	 */
	onHostname(params: {
		/**
		 * Matches the contents of `values` when set to `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match.
		 * Default: "IS_ONE_OF".
		 */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF';

		/**
		 * A list of hostnames. Allows wildcards, where `?` matches a single character and `*` matches zero or more
		 * characters. Specifying `*.example.com` matches both `m.example.com` and `www.example.com`.
		 */
		values: string[];
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'hostname', {}, params));
	}

	/**
	 * This specifies match criteria using Akamai XML metadata. It can only be configured on your behalf by Akamai
	 * Professional Services.
	 *
	 * @param {object} params - The parameters needed to configure onMatchAdvanced
	 * @param {string} [params.description] - A human-readable description of what the XML block does.
	 * @param {string} params.openXml - An XML string that opens the relevant block.
	 * @param {string} params.closeXml - An XML string that closes the relevant block.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/adv-match | Akamai Techdocs}
	 */
	onMatchAdvanced(params: {
		/** A human-readable description of what the XML block does. */
		description?: string;

		/** An XML string that opens the relevant block. */
		openXml: string;

		/** An XML string that closes the relevant block. */
		closeXml: string;
	}): Property {
		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'matchAdvanced', {}, params));
	}

	/**
	 * Match the assigned content provider code.
	 *
	 * @param {object} params - The parameters needed to configure onMatchCpCode
	 * @param {any} params.value - Specifies the CP code as an object. You only need to provide the initial `id` to
	 *   match the CP code, stripping any [`cpc_` prefix](ref:id-prefixes) to pass the integer to the rule tree.
	 *   Additional CP code details may reflect back in subsequent read-only data.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/content-provider-code-match | Akamai Techdocs}
	 */
	onMatchCpCode(params: {
		/**
		 * Specifies the CP code as an object. You only need to provide the initial `id` to match the CP code, stripping
		 * any [`cpc_` prefix](ref:id-prefixes) to pass the integer to the rule tree. Additional CP code details may
		 * reflect back in subsequent read-only data.
		 */
		value: any;
	}): Property {
		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'matchCpCode', {}, params));
	}

	/**
	 * Match a set or range of HTTP response codes.
	 *
	 * @param {object} params - The parameters needed to configure onMatchResponseCode
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF' | 'IS_BETWEEN' | 'IS_NOT_BETWEEN'} [params.matchOperator] - Matches numeric
	 *   range or a specified set of `values`. Default: "IS_ONE_OF".
	 * @param {string[]} [params.values] - A set of response codes to match, for example `["404","500"]`.
	 * @param {number} [params.lowerBound] - Specifies the start of a range of responses. For example, `400` to match
	 *   anything from `400` to `500`.
	 * @param {number} [params.upperBound] - Specifies the end of a range of responses. For example, `500` to match
	 *   anything from `400` to `500`.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/response-status-cookie | Akamai Techdocs}
	 */
	onMatchResponseCode(params: {
		/** Matches numeric range or a specified set of `values`. Default: "IS_ONE_OF". */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF' | 'IS_BETWEEN' | 'IS_NOT_BETWEEN';

		/** A set of response codes to match, for example `["404","500"]`. */
		values?: string[];

		/** Specifies the start of a range of responses. For example, `400` to match anything from `400` to `500`. */
		lowerBound?: number;

		/** Specifies the end of a range of responses. For example, `500` to match anything from `400` to `500`. */
		upperBound?: number;
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'matchResponseCode', {}, params));
	}

	/**
	 * Matches the URL's non-hostname path component.
	 *
	 * @param {object} params - The parameters needed to configure onPath
	 * @param {'MATCHES_ONE_OF' | 'DOES_NOT_MATCH_ONE_OF'} [params.matchOperator] - Matches the contents of the `values`
	 *   array. Default: "MATCHES_ONE_OF".
	 * @param {string[]} params.values - Matches the URL path, excluding leading hostname and trailing query parameters.
	 *   The path is relative to the server root, for example `/blog`. This field allows wildcards, where `?` matches a
	 *   single character and `*` matches zero or more characters. For example, `/blog/2014/` matches paths with two
	 *   fixed segments and other varying segments between them.
	 * @param {boolean} [params.matchCaseSensitive] - Sets a case-sensitive match. Default: false.
	 * @param {boolean} [params.normalize] - Transforms URLs before comparing them with the provided value. URLs are
	 *   decoded, and any directory syntax such as `../..` or `//` is stripped as a security measure. This protects URL
	 *   paths from being accessed by unauthorized users. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/path-match | Akamai Techdocs}
	 */
	onPath(params: {
		/** Matches the contents of the `values` array. Default: "MATCHES_ONE_OF". */
		matchOperator?: 'MATCHES_ONE_OF' | 'DOES_NOT_MATCH_ONE_OF';

		/**
		 * Matches the URL path, excluding leading hostname and trailing query parameters. The path is relative to the
		 * server root, for example `/blog`. This field allows wildcards, where `?` matches a single character and `*`
		 * matches zero or more characters. For example, `/blog/2014/` matches paths with two fixed segments and other
		 * varying segments between them.
		 */
		values: string[];

		/** Sets a case-sensitive match. Default: false. */
		matchCaseSensitive?: boolean;

		/**
		 * Transforms URLs before comparing them with the provided value. URLs are decoded, and any directory syntax
		 * such as `../..` or `//` is stripped as a security measure. This protects URL paths from being accessed by
		 * unauthorized users. Default: false.
		 */
		normalize?: boolean;
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'MATCHES_ONE_OF';
		}

		if (typeof params.matchCaseSensitive === 'undefined') {
			params.matchCaseSensitive = false;
		}

		if (typeof params.normalize === 'undefined') {
			params.normalize = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'path', {}, params));
	}

	/**
	 * Matches query string field names or values.
	 *
	 * @param {object} params - The parameters needed to configure onQueryStringParameter
	 * @param {string} params.parameterName - The name of the query field, for example, `q` in `?q=string`.
	 * @param {'IS_ONE_OF'
	 * 	| 'IS_NOT_ONE_OF'
	 * 	| 'EXISTS'
	 * 	| 'DOES_NOT_EXIST'
	 * 	| 'IS_LESS_THAN'
	 * 	| 'IS_MORE_THAN'
	 * 	| 'IS_BETWEEN'} [params.matchOperator]
	 *   - Narrows the match criteria. Default: "IS_ONE_OF".
	 *
	 * @param {string[]} [params.values] - The value of the query field, for example, `string` in `?q=string`.
	 * @param {number} [params.lowerBound] - Specifies the match's minimum value.
	 * @param {number} [params.upperBound] - When the `value` is numeric, this field specifies the match's maximum
	 *   value.
	 * @param {boolean} [params.matchWildcardName] - Allows wildcards in the `parameterName` field, where `?` matches a
	 *   single character and `*` matches zero or more characters. Default: false.
	 * @param {boolean} [params.matchCaseSensitiveName] - Sets a case-sensitive match for the `parameterName` field.
	 *   Default: true.
	 * @param {boolean} [params.matchWildcardValue] - Allows wildcards in the `value` field, where `?` matches a single
	 *   character and `*` matches zero or more characters. Default: false.
	 * @param {boolean} [params.matchCaseSensitiveValue] - Sets a case-sensitive match for the `value` field. Default:
	 *   true.
	 * @param {boolean} [params.escapeValue] - Matches when the `value` is URL-escaped. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/query-string-param | Akamai Techdocs}
	 */
	onQueryStringParameter(params: {
		/** The name of the query field, for example, `q` in `?q=string`. */
		parameterName: string;

		/** Narrows the match criteria. Default: "IS_ONE_OF". */
		matchOperator?:
			| 'IS_ONE_OF'
			| 'IS_NOT_ONE_OF'
			| 'EXISTS'
			| 'DOES_NOT_EXIST'
			| 'IS_LESS_THAN'
			| 'IS_MORE_THAN'
			| 'IS_BETWEEN';

		/** The value of the query field, for example, `string` in `?q=string`. */
		values?: string[];

		/** Specifies the match's minimum value. */
		lowerBound?: number;

		/** When the `value` is numeric, this field specifies the match's maximum value. */
		upperBound?: number;

		/**
		 * Allows wildcards in the `parameterName` field, where `?` matches a single character and `*` matches zero or
		 * more characters. Default: false.
		 */
		matchWildcardName?: boolean;

		/** Sets a case-sensitive match for the `parameterName` field. Default: true. */
		matchCaseSensitiveName?: boolean;

		/**
		 * Allows wildcards in the `value` field, where `?` matches a single character and `*` matches zero or more
		 * characters. Default: false.
		 */
		matchWildcardValue?: boolean;

		/** Sets a case-sensitive match for the `value` field. Default: true. */
		matchCaseSensitiveValue?: boolean;

		/** Matches when the `value` is URL-escaped. Default: false. */
		escapeValue?: boolean;
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (typeof params.matchWildcardName === 'undefined') {
			params.matchWildcardName = false;
		}

		if (typeof params.matchCaseSensitiveName === 'undefined') {
			params.matchCaseSensitiveName = true;
		}

		if (
			typeof params.matchWildcardValue === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.matchWildcardValue = false;
		}

		if (
			typeof params.matchCaseSensitiveValue === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.matchCaseSensitiveValue = true;
		}

		if (
			typeof params.escapeValue === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.escapeValue = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'queryStringParameter', {}, params));
	}

	/**
	 * Matches a specified percentage of requests. Use this match to apply behaviors to a percentage of your incoming
	 * requests that differ from the remainder, useful for A/b testing, or to offload traffic onto different servers.
	 *
	 * @param {object} params - The parameters needed to configure onRandom
	 * @param {number} [params.bucket] - Specify a percentage of random requests to which to apply a behavior. Any
	 *   remainders do not match. Default: 100.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/sample-percentage | Akamai Techdocs}
	 */
	onRandom(params: {
		/**
		 * Specify a percentage of random requests to which to apply a behavior. Any remainders do not match. Default:
		 * 100.
		 */
		bucket?: number;
	}): Property {
		if (typeof params.bucket === 'undefined') {
			params.bucket = 100;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'random', {}, params));
	}

	/**
	 * Match the cookie name or value passed with the request.
	 *
	 * @param {object} params - The parameters needed to configure onRequestCookie
	 * @param {string} params.cookieName - The name of the cookie, for example, `visitor` in `visitor:anon`.
	 * @param {'IS' | 'IS_NOT' | 'EXISTS' | 'DOES_NOT_EXIST' | 'IS_BETWEEN'} [params.matchOperator] - Narrows the match
	 *   criteria. Default: "IS".
	 * @param {string} [params.value] - The cookie's value, for example, `anon` in `visitor:anon`.
	 * @param {number} [params.lowerBound] - When the `value` is numeric, this field specifies the match's minimum
	 *   value.
	 * @param {number} [params.upperBound] - When the `value` is numeric, this field specifies the match's maximum
	 *   value.
	 * @param {boolean} [params.matchWildcardName] - Allows wildcards in the `cookieName` field, where `?` matches a
	 *   single character and `*` matches zero or more characters. Default: false.
	 * @param {boolean} [params.matchCaseSensitiveName] - Sets a case-sensitive match for the `cookieName` field.
	 *   Default: true.
	 * @param {boolean} [params.matchWildcardValue] - Allows wildcards in the `value` field, where `?` matches a single
	 *   character and `*` matches zero or more characters. Default: false.
	 * @param {boolean} [params.matchCaseSensitiveValue] - Sets a case-sensitive match for the `value` field. Default:
	 *   true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/req-cookie | Akamai Techdocs}
	 */
	onRequestCookie(params: {
		/** The name of the cookie, for example, `visitor` in `visitor:anon`. */
		cookieName: string;

		/** Narrows the match criteria. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT' | 'EXISTS' | 'DOES_NOT_EXIST' | 'IS_BETWEEN';

		/** The cookie's value, for example, `anon` in `visitor:anon`. */
		value?: string;

		/** When the `value` is numeric, this field specifies the match's minimum value. */
		lowerBound?: number;

		/** When the `value` is numeric, this field specifies the match's maximum value. */
		upperBound?: number;

		/**
		 * Allows wildcards in the `cookieName` field, where `?` matches a single character and `*` matches zero or more
		 * characters. Default: false.
		 */
		matchWildcardName?: boolean;

		/** Sets a case-sensitive match for the `cookieName` field. Default: true. */
		matchCaseSensitiveName?: boolean;

		/**
		 * Allows wildcards in the `value` field, where `?` matches a single character and `*` matches zero or more
		 * characters. Default: false.
		 */
		matchWildcardValue?: boolean;

		/** Sets a case-sensitive match for the `value` field. Default: true. */
		matchCaseSensitiveValue?: boolean;
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		if (typeof params.matchWildcardName === 'undefined') {
			params.matchWildcardName = false;
		}

		if (typeof params.matchCaseSensitiveName === 'undefined') {
			params.matchCaseSensitiveName = true;
		}

		if (
			typeof params.matchWildcardValue === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS', 'IS_NOT'].includes(params.matchOperator)
		) {
			params.matchWildcardValue = false;
		}

		if (
			typeof params.matchCaseSensitiveValue === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS', 'IS_NOT'].includes(params.matchOperator)
		) {
			params.matchCaseSensitiveValue = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'requestCookie', {}, params));
	}

	/**
	 * Match HTTP header names or values.
	 *
	 * @param {object} params - The parameters needed to configure onRequestHeader
	 * @param {string} params.headerName - The name of the request header, for example `Accept-Language`.
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF' | 'EXISTS' | 'DOES_NOT_EXIST'} [params.matchOperator] - Narrows the match
	 *   criteria. Default: "IS_ONE_OF".
	 * @param {string[]} [params.values] - The request header's value, for example `en-US` when the header `headerName`
	 *   is `Accept-Language`.
	 * @param {boolean} [params.matchWildcardName] - Allows wildcards in the `headerName` field, where `?` matches a
	 *   single character and `*` matches zero or more characters. Default: false.
	 * @param {boolean} [params.matchWildcardValue] - Allows wildcards in the `value` field, where `?` matches a single
	 *   character and `*` matches zero or more characters. Default: false.
	 * @param {boolean} [params.matchCaseSensitiveValue] - Sets a case-sensitive match for the `value` field. Default:
	 *   true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/req-header | Akamai Techdocs}
	 */
	onRequestHeader(params: {
		/** The name of the request header, for example `Accept-Language`. */
		headerName: string;

		/** Narrows the match criteria. Default: "IS_ONE_OF". */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF' | 'EXISTS' | 'DOES_NOT_EXIST';

		/** The request header's value, for example `en-US` when the header `headerName` is `Accept-Language`. */
		values?: string[];

		/**
		 * Allows wildcards in the `headerName` field, where `?` matches a single character and `*` matches zero or more
		 * characters. Default: false.
		 */
		matchWildcardName?: boolean;

		/**
		 * Allows wildcards in the `value` field, where `?` matches a single character and `*` matches zero or more
		 * characters. Default: false.
		 */
		matchWildcardValue?: boolean;

		/** Sets a case-sensitive match for the `value` field. Default: true. */
		matchCaseSensitiveValue?: boolean;
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (typeof params.matchWildcardName === 'undefined') {
			params.matchWildcardName = false;
		}

		if (
			typeof params.matchWildcardValue === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.matchWildcardValue = false;
		}

		if (
			typeof params.matchCaseSensitiveValue === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.matchCaseSensitiveValue = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'requestHeader', {}, params));
	}

	/**
	 * Specify the request's HTTP verb. Also supports WebDAV methods and common Akamai operations.
	 *
	 * @param {object} params - The parameters needed to configure onRequestMethod
	 * @param {'IS' | 'IS_NOT'} [params.matchOperator] - Matches the `value` when set to `IS`, otherwise `IS_NOT`
	 *   reverses the match. Default: "IS".
	 * @param {'GET'
	 * 	| 'POST'
	 * 	| 'HEAD'
	 * 	| 'PUT'
	 * 	| 'PATCH'
	 * 	| 'HTTP_DELETE'
	 * 	| 'AKAMAI_TRANSLATE'
	 * 	| 'AKAMAI_PURGE'
	 * 	| 'OPTIONS'
	 * 	| 'DAV_ACL'
	 * 	| 'DAV_CHECKOUT'
	 * 	| 'DAV_COPY'
	 * 	| 'DAV_DMCREATE'
	 * 	| 'DAV_DMINDEX'
	 * 	| 'DAV_DMMKPATH'
	 * 	| 'DAV_DMMKPATHS'
	 * 	| 'DAV_DMOVERLAY'
	 * 	| 'DAV_DMPATCHPATHS'
	 * 	| 'DAV_LOCK'
	 * 	| 'DAV_MKCALENDAR'
	 * 	| 'DAV_MKCOL'
	 * 	| 'DAV_MOVE'
	 * 	| 'DAV_PROPFIND'
	 * 	| 'DAV_PROPPATCH'
	 * 	| 'DAV_REPORT'
	 * 	| 'DAV_SETPROCESS'
	 * 	| 'DAV_SETREDIRECT'
	 * 	| 'DAV_TRUTHGET'
	 * 	| 'DAV_UNLOCK'} [params.value]
	 *   - Any of these HTTP methods, WebDAV methods, or Akamai operations. Default: "GET".
	 *
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/req-method | Akamai Techdocs}
	 */
	onRequestMethod(params: {
		/** Matches the `value` when set to `IS`, otherwise `IS_NOT` reverses the match. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT';

		/** Any of these HTTP methods, WebDAV methods, or Akamai operations. Default: "GET". */
		value?:
			| 'GET'
			| 'POST'
			| 'HEAD'
			| 'PUT'
			| 'PATCH'
			| 'HTTP_DELETE'
			| 'AKAMAI_TRANSLATE'
			| 'AKAMAI_PURGE'
			| 'OPTIONS'
			| 'DAV_ACL'
			| 'DAV_CHECKOUT'
			| 'DAV_COPY'
			| 'DAV_DMCREATE'
			| 'DAV_DMINDEX'
			| 'DAV_DMMKPATH'
			| 'DAV_DMMKPATHS'
			| 'DAV_DMOVERLAY'
			| 'DAV_DMPATCHPATHS'
			| 'DAV_LOCK'
			| 'DAV_MKCALENDAR'
			| 'DAV_MKCOL'
			| 'DAV_MOVE'
			| 'DAV_PROPFIND'
			| 'DAV_PROPPATCH'
			| 'DAV_REPORT'
			| 'DAV_SETPROCESS'
			| 'DAV_SETREDIRECT'
			| 'DAV_TRUTHGET'
			| 'DAV_UNLOCK';
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		if (typeof params.value === 'undefined') {
			params.value = 'GET';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'requestMethod', {}, params));
	}

	/**
	 * Matches whether the request uses the HTTP or HTTPS protocol.
	 *
	 * @param {object} params - The parameters needed to configure onRequestProtocol
	 * @param {'HTTP' | 'HTTPS'} [params.value] - Specifies the protocol. Default: "HTTP".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/req-protocol | Akamai Techdocs}
	 */
	onRequestProtocol(params: {
		/** Specifies the protocol. Default: "HTTP". */
		value?: 'HTTP' | 'HTTPS';
	}): Property {
		if (typeof params.value === 'undefined') {
			params.value = 'HTTP';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'requestProtocol', {}, params));
	}

	/**
	 * Match HTTP header names or values.
	 *
	 * @param {object} params - The parameters needed to configure onResponseHeader
	 * @param {string} params.headerName - The name of the response header, for example `Content-Type`.
	 * @param {'IS_ONE_OF'
	 * 	| 'IS_NOT_ONE_OF'
	 * 	| 'EXISTS'
	 * 	| 'DOES_NOT_EXIST'
	 * 	| 'IS_LESS_THAN'
	 * 	| 'IS_MORE_THAN'
	 * 	| 'IS_BETWEEN'} [params.matchOperator]
	 *   - Narrows the match according to various criteria. Default: "IS_ONE_OF".
	 *
	 * @param {string[]} [params.values] - The response header's value, for example `application/x-www-form-urlencoded`
	 *   when the header `headerName` is `Content-Type`.
	 * @param {number} [params.lowerBound] - When the `value` is numeric, this field specifies the match's minimum
	 *   value.
	 * @param {number} [params.upperBound] - When the `value` is numeric, this field specifies the match's maximum
	 *   value.
	 * @param {boolean} [params.matchWildcardName] - Allows wildcards in the `headerName` field, where `?` matches a
	 *   single character and `*` matches zero or more characters. Default: false.
	 * @param {boolean} [params.matchWildcardValue] - Allows wildcards in the `value` field, where `?` matches a single
	 *   character and `*` matches zero or more characters. Default: false.
	 * @param {boolean} [params.matchCaseSensitiveValue] - When enabled, the match is case-sensitive for the `value`
	 *   field. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/response-header | Akamai Techdocs}
	 */
	onResponseHeader(params: {
		/** The name of the response header, for example `Content-Type`. */
		headerName: string;

		/** Narrows the match according to various criteria. Default: "IS_ONE_OF". */
		matchOperator?:
			| 'IS_ONE_OF'
			| 'IS_NOT_ONE_OF'
			| 'EXISTS'
			| 'DOES_NOT_EXIST'
			| 'IS_LESS_THAN'
			| 'IS_MORE_THAN'
			| 'IS_BETWEEN';

		/**
		 * The response header's value, for example `application/x-www-form-urlencoded` when the header `headerName` is
		 * `Content-Type`.
		 */
		values?: string[];

		/** When the `value` is numeric, this field specifies the match's minimum value. */
		lowerBound?: number;

		/** When the `value` is numeric, this field specifies the match's maximum value. */
		upperBound?: number;

		/**
		 * Allows wildcards in the `headerName` field, where `?` matches a single character and `*` matches zero or more
		 * characters. Default: false.
		 */
		matchWildcardName?: boolean;

		/**
		 * Allows wildcards in the `value` field, where `?` matches a single character and `*` matches zero or more
		 * characters. Default: false.
		 */
		matchWildcardValue?: boolean;

		/** When enabled, the match is case-sensitive for the `value` field. Default: true. */
		matchCaseSensitiveValue?: boolean;
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (typeof params.matchWildcardName === 'undefined') {
			params.matchWildcardName = false;
		}

		if (
			typeof params.matchWildcardValue === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.matchWildcardValue = false;
		}

		if (
			typeof params.matchCaseSensitiveValue === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.matchCaseSensitiveValue = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'responseHeader', {}, params));
	}

	/**
	 * The location of the Akamai server handling the request.
	 *
	 * @param {object} params - The parameters needed to configure onServerLocation
	 * @param {'COUNTRY' | 'CONTINENT' | 'REGION'} [params.locationType] - Indicates the geographic scope. Default:
	 *   "COUNTRY".
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF'} [params.matchOperator] - Matches the specified set of values when set to
	 *   `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match. Default: "IS_ONE_OF".
	 * @param {(
	 * 	| 'AD'
	 * 	| 'AE'
	 * 	| 'AF'
	 * 	| 'AG'
	 * 	| 'AI'
	 * 	| 'AL'
	 * 	| 'AM'
	 * 	| 'AO'
	 * 	| 'AQ'
	 * 	| 'AR'
	 * 	| 'AS'
	 * 	| 'AT'
	 * 	| 'AU'
	 * 	| 'AW'
	 * 	| 'AZ'
	 * 	| 'BA'
	 * 	| 'BB'
	 * 	| 'BD'
	 * 	| 'BE'
	 * 	| 'BF'
	 * 	| 'BG'
	 * 	| 'BH'
	 * 	| 'BI'
	 * 	| 'BJ'
	 * 	| 'BL'
	 * 	| 'BM'
	 * 	| 'BN'
	 * 	| 'BO'
	 * 	| 'BQ'
	 * 	| 'BR'
	 * 	| 'BS'
	 * 	| 'BT'
	 * 	| 'BV'
	 * 	| 'BW'
	 * 	| 'BY'
	 * 	| 'BZ'
	 * 	| 'CA'
	 * 	| 'CC'
	 * 	| 'CD'
	 * 	| 'CF'
	 * 	| 'CG'
	 * 	| 'CH'
	 * 	| 'CI'
	 * 	| 'CK'
	 * 	| 'CL'
	 * 	| 'CM'
	 * 	| 'CN'
	 * 	| 'CO'
	 * 	| 'CR'
	 * 	| 'CU'
	 * 	| 'CV'
	 * 	| 'CW'
	 * 	| 'CX'
	 * 	| 'CY'
	 * 	| 'CZ'
	 * 	| 'DE'
	 * 	| 'DJ'
	 * 	| 'DK'
	 * 	| 'DM'
	 * 	| 'DO'
	 * 	| 'DZ'
	 * 	| 'EC'
	 * 	| 'EE'
	 * 	| 'EG'
	 * 	| 'EH'
	 * 	| 'ER'
	 * 	| 'ES'
	 * 	| 'ET'
	 * 	| 'EU'
	 * 	| 'FI'
	 * 	| 'FJ'
	 * 	| 'FK'
	 * 	| 'FM'
	 * 	| 'FO'
	 * 	| 'FR'
	 * 	| 'GA'
	 * 	| 'GB'
	 * 	| 'GD'
	 * 	| 'GE'
	 * 	| 'GF'
	 * 	| 'GH'
	 * 	| 'GI'
	 * 	| 'GG'
	 * 	| 'GL'
	 * 	| 'GM'
	 * 	| 'GN'
	 * 	| 'GP'
	 * 	| 'GQ'
	 * 	| 'GR'
	 * 	| 'GS'
	 * 	| 'GT'
	 * 	| 'GU'
	 * 	| 'GW'
	 * 	| 'GY'
	 * 	| 'HK'
	 * 	| 'HM'
	 * 	| 'HN'
	 * 	| 'HR'
	 * 	| 'HT'
	 * 	| 'HU'
	 * 	| 'ID'
	 * 	| 'IE'
	 * 	| 'IL'
	 * 	| 'IM'
	 * 	| 'IN'
	 * 	| 'IO'
	 * 	| 'IQ'
	 * 	| 'IR'
	 * 	| 'IS'
	 * 	| 'IT'
	 * 	| 'JE'
	 * 	| 'JM'
	 * 	| 'JO'
	 * 	| 'JP'
	 * 	| 'KE'
	 * 	| 'KG'
	 * 	| 'KH'
	 * 	| 'KI'
	 * 	| 'KM'
	 * 	| 'KN'
	 * 	| 'KP'
	 * 	| 'KR'
	 * 	| 'KW'
	 * 	| 'KY'
	 * 	| 'KZ'
	 * 	| 'LA'
	 * 	| 'LB'
	 * 	| 'LC'
	 * 	| 'LI'
	 * 	| 'LK'
	 * 	| 'LR'
	 * 	| 'LS'
	 * 	| 'LT'
	 * 	| 'LU'
	 * 	| 'LV'
	 * 	| 'LY'
	 * 	| 'MA'
	 * 	| 'MC'
	 * 	| 'MD'
	 * 	| 'ME'
	 * 	| 'MF'
	 * 	| 'MG'
	 * 	| 'MH'
	 * 	| 'MK'
	 * 	| 'ML'
	 * 	| 'MM'
	 * 	| 'MN'
	 * 	| 'MO'
	 * 	| 'MP'
	 * 	| 'MQ'
	 * 	| 'MR'
	 * 	| 'MS'
	 * 	| 'MT'
	 * 	| 'MU'
	 * 	| 'MV'
	 * 	| 'MW'
	 * 	| 'MX'
	 * 	| 'MY'
	 * 	| 'MZ'
	 * 	| 'NA'
	 * 	| 'NC'
	 * 	| 'NE'
	 * 	| 'NF'
	 * 	| 'NG'
	 * 	| 'NI'
	 * 	| 'NL'
	 * 	| 'NO'
	 * 	| 'NP'
	 * 	| 'NR'
	 * 	| 'NU'
	 * 	| 'NZ'
	 * 	| 'OM'
	 * 	| 'PA'
	 * 	| 'PE'
	 * 	| 'PF'
	 * 	| 'PG'
	 * 	| 'PH'
	 * 	| 'PK'
	 * 	| 'PL'
	 * 	| 'PM'
	 * 	| 'PN'
	 * 	| 'PR'
	 * 	| 'PS'
	 * 	| 'PT'
	 * 	| 'PW'
	 * 	| 'PY'
	 * 	| 'QA'
	 * 	| 'RE'
	 * 	| 'RO'
	 * 	| 'RS'
	 * 	| 'RU'
	 * 	| 'RW'
	 * 	| 'SA'
	 * 	| 'SB'
	 * 	| 'SC'
	 * 	| 'SD'
	 * 	| 'SE'
	 * 	| 'SG'
	 * 	| 'SH'
	 * 	| 'SI'
	 * 	| 'SJ'
	 * 	| 'SK'
	 * 	| 'SL'
	 * 	| 'SM'
	 * 	| 'SN'
	 * 	| 'SO'
	 * 	| 'SR'
	 * 	| 'SS'
	 * 	| 'ST'
	 * 	| 'SV'
	 * 	| 'SX'
	 * 	| 'SY'
	 * 	| 'SZ'
	 * 	| 'TC'
	 * 	| 'TD'
	 * 	| 'TF'
	 * 	| 'TG'
	 * 	| 'TH'
	 * 	| 'TJ'
	 * 	| 'TK'
	 * 	| 'TM'
	 * 	| 'TN'
	 * 	| 'TO'
	 * 	| 'TL'
	 * 	| 'TR'
	 * 	| 'TT'
	 * 	| 'TV'
	 * 	| 'TW'
	 * 	| 'TZ'
	 * 	| 'UA'
	 * 	| 'UG'
	 * 	| 'UM'
	 * 	| 'US'
	 * 	| 'UY'
	 * 	| 'UZ'
	 * 	| 'VA'
	 * 	| 'VC'
	 * 	| 'VE'
	 * 	| 'VG'
	 * 	| 'VI'
	 * 	| 'VN'
	 * 	| 'VU'
	 * 	| 'WF'
	 * 	| 'WS'
	 * 	| 'YE'
	 * 	| 'YT'
	 * 	| 'ZA'
	 * 	| 'ZM'
	 * 	| 'ZW'
	 * )[]} [params.countries]
	 *   - ISO 3166-1 country codes, such as `US` or `CN`.
	 *
	 * @param {('AF' | 'AS' | 'EU' | 'NA' | 'OC' | 'OT' | 'SA')[]} [params.continents] - Continent codes.
	 * @param {(
	 * 	| 'US-AL'
	 * 	| 'US-AK'
	 * 	| 'US-AZ'
	 * 	| 'US-AR'
	 * 	| 'US-CA'
	 * 	| 'US-CO'
	 * 	| 'US-CT'
	 * 	| 'US-DE'
	 * 	| 'US-DC'
	 * 	| 'US-FL'
	 * 	| 'US-GA'
	 * 	| 'US-HI'
	 * 	| 'US-ID'
	 * 	| 'US-IL'
	 * 	| 'US-IN'
	 * 	| 'US-IA'
	 * 	| 'US-KS'
	 * 	| 'US-KY'
	 * 	| 'US-LA'
	 * 	| 'US-ME'
	 * 	| 'US-MD'
	 * 	| 'US-MA'
	 * 	| 'US-MI'
	 * 	| 'US-MN'
	 * 	| 'US-MS'
	 * 	| 'US-MO'
	 * 	| 'US-MT'
	 * 	| 'US-NE'
	 * 	| 'US-NV'
	 * 	| 'US-NH'
	 * 	| 'US-NJ'
	 * 	| 'US-NM'
	 * 	| 'US-NY'
	 * 	| 'US-NC'
	 * 	| 'US-ND'
	 * 	| 'US-OH'
	 * 	| 'US-OK'
	 * 	| 'US-OR'
	 * 	| 'US-PA'
	 * 	| 'US-RI'
	 * 	| 'US-SC'
	 * 	| 'US-SD'
	 * 	| 'US-TN'
	 * 	| 'US-TX'
	 * 	| 'US-UT'
	 * 	| 'US-VT'
	 * 	| 'US-VA'
	 * 	| 'US-WA'
	 * 	| 'US-WV'
	 * 	| 'US-WI'
	 * 	| 'US-WY'
	 * 	| 'CA-AB'
	 * 	| 'CA-BC'
	 * 	| 'CA-MB'
	 * 	| 'CA-NB'
	 * 	| 'CA-NF'
	 * 	| 'CA-NS'
	 * 	| 'CA-NT'
	 * 	| 'CA-NU'
	 * 	| 'CA-ON'
	 * 	| 'CA-PE'
	 * 	| 'CA-QC'
	 * 	| 'CA-SK'
	 * 	| 'CA-YT'
	 * 	| 'AU-ACT'
	 * 	| 'AU-NSW'
	 * 	| 'AU-NT'
	 * 	| 'AU-QLD'
	 * 	| 'AU-SA'
	 * 	| 'AU-TAS'
	 * 	| 'AU-VIC'
	 * 	| 'AU-WA'
	 * 	| 'GB-EN'
	 * 	| 'GB-NI'
	 * 	| 'GB-SC'
	 * 	| 'GB-WA'
	 * 	| 'JP-00'
	 * 	| 'JP-01'
	 * 	| 'JP-02'
	 * 	| 'JP-03'
	 * 	| 'JP-04'
	 * 	| 'JP-05'
	 * 	| 'JP-06'
	 * 	| 'JP-07'
	 * 	| 'JP-08'
	 * 	| 'JP-09'
	 * 	| 'JP-10'
	 * 	| 'JP-11'
	 * 	| 'JP-12'
	 * 	| 'JP-13'
	 * 	| 'JP-14'
	 * 	| 'JP-15'
	 * 	| 'JP-16'
	 * 	| 'JP-17'
	 * 	| 'JP-18'
	 * 	| 'JP-19'
	 * 	| 'JP-20'
	 * 	| 'JP-21'
	 * 	| 'JP-22'
	 * 	| 'JP-23'
	 * 	| 'JP-24'
	 * 	| 'JP-25'
	 * 	| 'JP-26'
	 * 	| 'JP-27'
	 * 	| 'JP-28'
	 * 	| 'JP-29'
	 * 	| 'JP-30'
	 * 	| 'JP-31'
	 * 	| 'JP-32'
	 * 	| 'JP-33'
	 * 	| 'JP-34'
	 * 	| 'JP-35'
	 * 	| 'JP-36'
	 * 	| 'JP-37'
	 * 	| 'JP-38'
	 * 	| 'JP-39'
	 * 	| 'JP-40'
	 * 	| 'JP-41'
	 * 	| 'JP-42'
	 * 	| 'JP-43'
	 * 	| 'JP-44'
	 * 	| 'JP-45'
	 * 	| 'JP-46'
	 * 	| 'JP-47'
	 * 	| 'BR-AC'
	 * 	| 'BR-AL'
	 * 	| 'BR-AM'
	 * 	| 'BR-AP'
	 * 	| 'BR-BA'
	 * 	| 'BR-CE'
	 * 	| 'BR-DF'
	 * 	| 'BR-ES'
	 * 	| 'BR-GO'
	 * 	| 'BR-IS'
	 * 	| 'BR-MA'
	 * 	| 'BR-MG'
	 * 	| 'BR-MS'
	 * 	| 'BR-MT'
	 * 	| 'BR-PA'
	 * 	| 'BR-PB'
	 * 	| 'BR-PE'
	 * 	| 'BR-PI'
	 * 	| 'BR-PR'
	 * 	| 'BR-RJ'
	 * 	| 'BR-RN'
	 * 	| 'BR-RO'
	 * 	| 'BR-RR'
	 * 	| 'BR-RS'
	 * 	| 'BR-SC'
	 * 	| 'BR-SE'
	 * 	| 'BR-SP'
	 * 	| 'BR-TO'
	 * 	| 'DE-BB'
	 * 	| 'DE-BE'
	 * 	| 'DE-BW'
	 * 	| 'DE-BY'
	 * 	| 'DE-HB'
	 * 	| 'DE-HE'
	 * 	| 'DE-HH'
	 * 	| 'DE-MV'
	 * 	| 'DE-NI'
	 * 	| 'DE-NW'
	 * 	| 'DE-RP'
	 * 	| 'DE-SH'
	 * 	| 'DE-SL'
	 * 	| 'DE-SN'
	 * 	| 'DE-ST'
	 * 	| 'DE-TH'
	 * 	| 'FR-ARA'
	 * 	| 'FR-BFC'
	 * 	| 'FR-BRE'
	 * 	| 'FR-CVL'
	 * 	| 'FR-COR'
	 * 	| 'FR-GES'
	 * 	| 'FR-HDF'
	 * 	| 'FR-IDF'
	 * 	| 'FR-NOR'
	 * 	| 'FR-NAQ'
	 * 	| 'FR-OCC'
	 * 	| 'FR-PDL'
	 * 	| 'FR-PAC'
	 * 	| 'CH-AG'
	 * 	| 'CH-AI'
	 * 	| 'CH-AR'
	 * 	| 'CH-BE'
	 * 	| 'CH-BL'
	 * 	| 'CH-BS'
	 * 	| 'CH-FR'
	 * 	| 'CH-GE'
	 * 	| 'CH-GL'
	 * 	| 'CH-GR'
	 * 	| 'CH-JU'
	 * 	| 'CH-LU'
	 * 	| 'CH-NE'
	 * 	| 'CH-NW'
	 * 	| 'CH-OW'
	 * 	| 'CH-SG'
	 * 	| 'CH-SH'
	 * 	| 'CH-SO'
	 * 	| 'CH-SZ'
	 * 	| 'CH-TG'
	 * 	| 'CH-TI'
	 * 	| 'CH-UR'
	 * 	| 'CH-VD'
	 * 	| 'CH-VS'
	 * 	| 'CH-ZG'
	 * 	| 'CH-ZH'
	 * 	| 'CN-AH'
	 * 	| 'CN-BJ'
	 * 	| 'CN-CQ'
	 * 	| 'CN-FJ'
	 * 	| 'CN-GS'
	 * 	| 'CN-GD'
	 * 	| 'CN-GX'
	 * 	| 'CN-GZ'
	 * 	| 'CN-HI'
	 * 	| 'CN-HE'
	 * 	| 'CN-HL'
	 * 	| 'CN-HA'
	 * 	| 'CN-HB'
	 * 	| 'CN-HN'
	 * 	| 'CN-JS'
	 * 	| 'CN-JX'
	 * 	| 'CN-JL'
	 * 	| 'CN-LN'
	 * 	| 'CN-NM'
	 * 	| 'CN-NX'
	 * 	| 'CN-QH'
	 * 	| 'CN-SN'
	 * 	| 'CN-SD'
	 * 	| 'CN-SH'
	 * 	| 'CN-SX'
	 * 	| 'CN-SC'
	 * 	| 'CN-TJ'
	 * 	| 'CN-XJ'
	 * 	| 'CN-XZ'
	 * 	| 'CN-YN'
	 * 	| 'CN-ZJ'
	 * 	| 'IN-AN'
	 * 	| 'IN-AP'
	 * 	| 'IN-AR'
	 * 	| 'IN-AS'
	 * 	| 'IN-BR'
	 * 	| 'IN-CH'
	 * 	| 'IN-CT'
	 * 	| 'IN-DD'
	 * 	| 'IN-DL'
	 * 	| 'IN-DN'
	 * 	| 'IN-GA'
	 * 	| 'IN-GJ'
	 * 	| 'IN-HP'
	 * 	| 'IN-HR'
	 * 	| 'IN-JH'
	 * 	| 'IN-JK'
	 * 	| 'IN-KA'
	 * 	| 'IN-KL'
	 * 	| 'IN-LD'
	 * 	| 'IN-MH'
	 * 	| 'IN-ML'
	 * 	| 'IN-MN'
	 * 	| 'IN-MP'
	 * 	| 'IN-MZ'
	 * 	| 'IN-NL'
	 * 	| 'IN-OR'
	 * 	| 'IN-PB'
	 * 	| 'IN-PY'
	 * 	| 'IN-RJ'
	 * 	| 'IN-SK'
	 * 	| 'IN-TG'
	 * 	| 'IN-TN'
	 * 	| 'IN-TR'
	 * 	| 'IN-UL'
	 * 	| 'IN-UP'
	 * 	| 'IN-WB'
	 * 	| 'SE-K'
	 * 	| 'SE-X'
	 * 	| 'SE-I'
	 * 	| 'SE-N'
	 * 	| 'SE-Z'
	 * 	| 'SE-F'
	 * 	| 'SE-H'
	 * 	| 'SE-W'
	 * 	| 'SE-G'
	 * 	| 'SE-BD'
	 * 	| 'SE-T'
	 * 	| 'SE-E'
	 * 	| 'SE-D'
	 * 	| 'SE-C'
	 * 	| 'SE-S'
	 * 	| 'SE-AC'
	 * 	| 'SE-Y'
	 * 	| 'SE-U'
	 * 	| 'SE-AB'
	 * 	| 'SE-M'
	 * 	| 'SE-O'
	 * 	| 'MX-AGU'
	 * 	| 'MX-BCN'
	 * 	| 'MX-BCS'
	 * 	| 'MX-CAM'
	 * 	| 'MX-CHP'
	 * 	| 'MX-CHH'
	 * 	| 'MX-COA'
	 * 	| 'MX-COL'
	 * 	| 'MX-DIF'
	 * 	| 'MX-DUR'
	 * 	| 'MX-GUA'
	 * 	| 'MX-GRO'
	 * 	| 'MX-HID'
	 * 	| 'MX-JAL'
	 * 	| 'MX-MEX'
	 * 	| 'MX-MIC'
	 * 	| 'MX-MOR'
	 * 	| 'MX-NAY'
	 * 	| 'MX-NLE'
	 * 	| 'MX-OAX'
	 * 	| 'MX-PUE'
	 * 	| 'MX-QUE'
	 * 	| 'MX-ROO'
	 * 	| 'MX-SLP'
	 * 	| 'MX-SIN'
	 * 	| 'MX-SON'
	 * 	| 'MX-TAB'
	 * 	| 'MX-TAM'
	 * 	| 'MX-TLA'
	 * 	| 'MX-VER'
	 * 	| 'MX-YUC'
	 * 	| 'MX-ZAC'
	 * 	| 'UA-CK'
	 * 	| 'UA-CH'
	 * 	| 'UA-CV'
	 * 	| 'UA-CRIMEA'
	 * 	| 'UA-DP'
	 * 	| 'UA-DT'
	 * 	| 'UA-IF'
	 * 	| 'UA-KK'
	 * 	| 'UA-KS'
	 * 	| 'UA-KM'
	 * 	| 'UA-KV'
	 * 	| 'UA-KH'
	 * 	| 'UA-LH'
	 * 	| 'UA-LV'
	 * 	| 'UA-MY'
	 * 	| 'UA-OD'
	 * 	| 'UA-PL'
	 * 	| 'UA-RV'
	 * 	| 'UA-SM'
	 * 	| 'UA-TP'
	 * 	| 'UA-ZK'
	 * 	| 'UA-VI'
	 * 	| 'UA-VO'
	 * 	| 'UA-ZP'
	 * 	| 'UA-ZT'
	 * )[]} [params.regions]
	 *   - ISO 3166 country and region codes, for example `US:MA` for Massachusetts or `JP:13` for Tokyo.
	 *
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/matches | Akamai Techdocs}
	 */
	onServerLocation(params: {
		/** Indicates the geographic scope. Default: "COUNTRY". */
		locationType?: 'COUNTRY' | 'CONTINENT' | 'REGION';

		/**
		 * Matches the specified set of values when set to `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match.
		 * Default: "IS_ONE_OF".
		 */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF';

		/** ISO 3166-1 country codes, such as `US` or `CN`. */
		countries?: Array<
			| 'AD'
			| 'AE'
			| 'AF'
			| 'AG'
			| 'AI'
			| 'AL'
			| 'AM'
			| 'AO'
			| 'AQ'
			| 'AR'
			| 'AS'
			| 'AT'
			| 'AU'
			| 'AW'
			| 'AZ'
			| 'BA'
			| 'BB'
			| 'BD'
			| 'BE'
			| 'BF'
			| 'BG'
			| 'BH'
			| 'BI'
			| 'BJ'
			| 'BL'
			| 'BM'
			| 'BN'
			| 'BO'
			| 'BQ'
			| 'BR'
			| 'BS'
			| 'BT'
			| 'BV'
			| 'BW'
			| 'BY'
			| 'BZ'
			| 'CA'
			| 'CC'
			| 'CD'
			| 'CF'
			| 'CG'
			| 'CH'
			| 'CI'
			| 'CK'
			| 'CL'
			| 'CM'
			| 'CN'
			| 'CO'
			| 'CR'
			| 'CU'
			| 'CV'
			| 'CW'
			| 'CX'
			| 'CY'
			| 'CZ'
			| 'DE'
			| 'DJ'
			| 'DK'
			| 'DM'
			| 'DO'
			| 'DZ'
			| 'EC'
			| 'EE'
			| 'EG'
			| 'EH'
			| 'ER'
			| 'ES'
			| 'ET'
			| 'EU'
			| 'FI'
			| 'FJ'
			| 'FK'
			| 'FM'
			| 'FO'
			| 'FR'
			| 'GA'
			| 'GB'
			| 'GD'
			| 'GE'
			| 'GF'
			| 'GH'
			| 'GI'
			| 'GG'
			| 'GL'
			| 'GM'
			| 'GN'
			| 'GP'
			| 'GQ'
			| 'GR'
			| 'GS'
			| 'GT'
			| 'GU'
			| 'GW'
			| 'GY'
			| 'HK'
			| 'HM'
			| 'HN'
			| 'HR'
			| 'HT'
			| 'HU'
			| 'ID'
			| 'IE'
			| 'IL'
			| 'IM'
			| 'IN'
			| 'IO'
			| 'IQ'
			| 'IR'
			| 'IS'
			| 'IT'
			| 'JE'
			| 'JM'
			| 'JO'
			| 'JP'
			| 'KE'
			| 'KG'
			| 'KH'
			| 'KI'
			| 'KM'
			| 'KN'
			| 'KP'
			| 'KR'
			| 'KW'
			| 'KY'
			| 'KZ'
			| 'LA'
			| 'LB'
			| 'LC'
			| 'LI'
			| 'LK'
			| 'LR'
			| 'LS'
			| 'LT'
			| 'LU'
			| 'LV'
			| 'LY'
			| 'MA'
			| 'MC'
			| 'MD'
			| 'ME'
			| 'MF'
			| 'MG'
			| 'MH'
			| 'MK'
			| 'ML'
			| 'MM'
			| 'MN'
			| 'MO'
			| 'MP'
			| 'MQ'
			| 'MR'
			| 'MS'
			| 'MT'
			| 'MU'
			| 'MV'
			| 'MW'
			| 'MX'
			| 'MY'
			| 'MZ'
			| 'NA'
			| 'NC'
			| 'NE'
			| 'NF'
			| 'NG'
			| 'NI'
			| 'NL'
			| 'NO'
			| 'NP'
			| 'NR'
			| 'NU'
			| 'NZ'
			| 'OM'
			| 'PA'
			| 'PE'
			| 'PF'
			| 'PG'
			| 'PH'
			| 'PK'
			| 'PL'
			| 'PM'
			| 'PN'
			| 'PR'
			| 'PS'
			| 'PT'
			| 'PW'
			| 'PY'
			| 'QA'
			| 'RE'
			| 'RO'
			| 'RS'
			| 'RU'
			| 'RW'
			| 'SA'
			| 'SB'
			| 'SC'
			| 'SD'
			| 'SE'
			| 'SG'
			| 'SH'
			| 'SI'
			| 'SJ'
			| 'SK'
			| 'SL'
			| 'SM'
			| 'SN'
			| 'SO'
			| 'SR'
			| 'SS'
			| 'ST'
			| 'SV'
			| 'SX'
			| 'SY'
			| 'SZ'
			| 'TC'
			| 'TD'
			| 'TF'
			| 'TG'
			| 'TH'
			| 'TJ'
			| 'TK'
			| 'TM'
			| 'TN'
			| 'TO'
			| 'TL'
			| 'TR'
			| 'TT'
			| 'TV'
			| 'TW'
			| 'TZ'
			| 'UA'
			| 'UG'
			| 'UM'
			| 'US'
			| 'UY'
			| 'UZ'
			| 'VA'
			| 'VC'
			| 'VE'
			| 'VG'
			| 'VI'
			| 'VN'
			| 'VU'
			| 'WF'
			| 'WS'
			| 'YE'
			| 'YT'
			| 'ZA'
			| 'ZM'
			| 'ZW'
		>;

		/** Continent codes. */
		continents?: Array<'AF' | 'AS' | 'EU' | 'NA' | 'OC' | 'OT' | 'SA'>;

		/** ISO 3166 country and region codes, for example `US:MA` for Massachusetts or `JP:13` for Tokyo. */
		regions?: Array<
			| 'US-AL'
			| 'US-AK'
			| 'US-AZ'
			| 'US-AR'
			| 'US-CA'
			| 'US-CO'
			| 'US-CT'
			| 'US-DE'
			| 'US-DC'
			| 'US-FL'
			| 'US-GA'
			| 'US-HI'
			| 'US-ID'
			| 'US-IL'
			| 'US-IN'
			| 'US-IA'
			| 'US-KS'
			| 'US-KY'
			| 'US-LA'
			| 'US-ME'
			| 'US-MD'
			| 'US-MA'
			| 'US-MI'
			| 'US-MN'
			| 'US-MS'
			| 'US-MO'
			| 'US-MT'
			| 'US-NE'
			| 'US-NV'
			| 'US-NH'
			| 'US-NJ'
			| 'US-NM'
			| 'US-NY'
			| 'US-NC'
			| 'US-ND'
			| 'US-OH'
			| 'US-OK'
			| 'US-OR'
			| 'US-PA'
			| 'US-RI'
			| 'US-SC'
			| 'US-SD'
			| 'US-TN'
			| 'US-TX'
			| 'US-UT'
			| 'US-VT'
			| 'US-VA'
			| 'US-WA'
			| 'US-WV'
			| 'US-WI'
			| 'US-WY'
			| 'CA-AB'
			| 'CA-BC'
			| 'CA-MB'
			| 'CA-NB'
			| 'CA-NF'
			| 'CA-NS'
			| 'CA-NT'
			| 'CA-NU'
			| 'CA-ON'
			| 'CA-PE'
			| 'CA-QC'
			| 'CA-SK'
			| 'CA-YT'
			| 'AU-ACT'
			| 'AU-NSW'
			| 'AU-NT'
			| 'AU-QLD'
			| 'AU-SA'
			| 'AU-TAS'
			| 'AU-VIC'
			| 'AU-WA'
			| 'GB-EN'
			| 'GB-NI'
			| 'GB-SC'
			| 'GB-WA'
			| 'JP-00'
			| 'JP-01'
			| 'JP-02'
			| 'JP-03'
			| 'JP-04'
			| 'JP-05'
			| 'JP-06'
			| 'JP-07'
			| 'JP-08'
			| 'JP-09'
			| 'JP-10'
			| 'JP-11'
			| 'JP-12'
			| 'JP-13'
			| 'JP-14'
			| 'JP-15'
			| 'JP-16'
			| 'JP-17'
			| 'JP-18'
			| 'JP-19'
			| 'JP-20'
			| 'JP-21'
			| 'JP-22'
			| 'JP-23'
			| 'JP-24'
			| 'JP-25'
			| 'JP-26'
			| 'JP-27'
			| 'JP-28'
			| 'JP-29'
			| 'JP-30'
			| 'JP-31'
			| 'JP-32'
			| 'JP-33'
			| 'JP-34'
			| 'JP-35'
			| 'JP-36'
			| 'JP-37'
			| 'JP-38'
			| 'JP-39'
			| 'JP-40'
			| 'JP-41'
			| 'JP-42'
			| 'JP-43'
			| 'JP-44'
			| 'JP-45'
			| 'JP-46'
			| 'JP-47'
			| 'BR-AC'
			| 'BR-AL'
			| 'BR-AM'
			| 'BR-AP'
			| 'BR-BA'
			| 'BR-CE'
			| 'BR-DF'
			| 'BR-ES'
			| 'BR-GO'
			| 'BR-IS'
			| 'BR-MA'
			| 'BR-MG'
			| 'BR-MS'
			| 'BR-MT'
			| 'BR-PA'
			| 'BR-PB'
			| 'BR-PE'
			| 'BR-PI'
			| 'BR-PR'
			| 'BR-RJ'
			| 'BR-RN'
			| 'BR-RO'
			| 'BR-RR'
			| 'BR-RS'
			| 'BR-SC'
			| 'BR-SE'
			| 'BR-SP'
			| 'BR-TO'
			| 'DE-BB'
			| 'DE-BE'
			| 'DE-BW'
			| 'DE-BY'
			| 'DE-HB'
			| 'DE-HE'
			| 'DE-HH'
			| 'DE-MV'
			| 'DE-NI'
			| 'DE-NW'
			| 'DE-RP'
			| 'DE-SH'
			| 'DE-SL'
			| 'DE-SN'
			| 'DE-ST'
			| 'DE-TH'
			| 'FR-ARA'
			| 'FR-BFC'
			| 'FR-BRE'
			| 'FR-CVL'
			| 'FR-COR'
			| 'FR-GES'
			| 'FR-HDF'
			| 'FR-IDF'
			| 'FR-NOR'
			| 'FR-NAQ'
			| 'FR-OCC'
			| 'FR-PDL'
			| 'FR-PAC'
			| 'CH-AG'
			| 'CH-AI'
			| 'CH-AR'
			| 'CH-BE'
			| 'CH-BL'
			| 'CH-BS'
			| 'CH-FR'
			| 'CH-GE'
			| 'CH-GL'
			| 'CH-GR'
			| 'CH-JU'
			| 'CH-LU'
			| 'CH-NE'
			| 'CH-NW'
			| 'CH-OW'
			| 'CH-SG'
			| 'CH-SH'
			| 'CH-SO'
			| 'CH-SZ'
			| 'CH-TG'
			| 'CH-TI'
			| 'CH-UR'
			| 'CH-VD'
			| 'CH-VS'
			| 'CH-ZG'
			| 'CH-ZH'
			| 'CN-AH'
			| 'CN-BJ'
			| 'CN-CQ'
			| 'CN-FJ'
			| 'CN-GS'
			| 'CN-GD'
			| 'CN-GX'
			| 'CN-GZ'
			| 'CN-HI'
			| 'CN-HE'
			| 'CN-HL'
			| 'CN-HA'
			| 'CN-HB'
			| 'CN-HN'
			| 'CN-JS'
			| 'CN-JX'
			| 'CN-JL'
			| 'CN-LN'
			| 'CN-NM'
			| 'CN-NX'
			| 'CN-QH'
			| 'CN-SN'
			| 'CN-SD'
			| 'CN-SH'
			| 'CN-SX'
			| 'CN-SC'
			| 'CN-TJ'
			| 'CN-XJ'
			| 'CN-XZ'
			| 'CN-YN'
			| 'CN-ZJ'
			| 'IN-AN'
			| 'IN-AP'
			| 'IN-AR'
			| 'IN-AS'
			| 'IN-BR'
			| 'IN-CH'
			| 'IN-CT'
			| 'IN-DD'
			| 'IN-DL'
			| 'IN-DN'
			| 'IN-GA'
			| 'IN-GJ'
			| 'IN-HP'
			| 'IN-HR'
			| 'IN-JH'
			| 'IN-JK'
			| 'IN-KA'
			| 'IN-KL'
			| 'IN-LD'
			| 'IN-MH'
			| 'IN-ML'
			| 'IN-MN'
			| 'IN-MP'
			| 'IN-MZ'
			| 'IN-NL'
			| 'IN-OR'
			| 'IN-PB'
			| 'IN-PY'
			| 'IN-RJ'
			| 'IN-SK'
			| 'IN-TG'
			| 'IN-TN'
			| 'IN-TR'
			| 'IN-UL'
			| 'IN-UP'
			| 'IN-WB'
			| 'SE-K'
			| 'SE-X'
			| 'SE-I'
			| 'SE-N'
			| 'SE-Z'
			| 'SE-F'
			| 'SE-H'
			| 'SE-W'
			| 'SE-G'
			| 'SE-BD'
			| 'SE-T'
			| 'SE-E'
			| 'SE-D'
			| 'SE-C'
			| 'SE-S'
			| 'SE-AC'
			| 'SE-Y'
			| 'SE-U'
			| 'SE-AB'
			| 'SE-M'
			| 'SE-O'
			| 'MX-AGU'
			| 'MX-BCN'
			| 'MX-BCS'
			| 'MX-CAM'
			| 'MX-CHP'
			| 'MX-CHH'
			| 'MX-COA'
			| 'MX-COL'
			| 'MX-DIF'
			| 'MX-DUR'
			| 'MX-GUA'
			| 'MX-GRO'
			| 'MX-HID'
			| 'MX-JAL'
			| 'MX-MEX'
			| 'MX-MIC'
			| 'MX-MOR'
			| 'MX-NAY'
			| 'MX-NLE'
			| 'MX-OAX'
			| 'MX-PUE'
			| 'MX-QUE'
			| 'MX-ROO'
			| 'MX-SLP'
			| 'MX-SIN'
			| 'MX-SON'
			| 'MX-TAB'
			| 'MX-TAM'
			| 'MX-TLA'
			| 'MX-VER'
			| 'MX-YUC'
			| 'MX-ZAC'
			| 'UA-CK'
			| 'UA-CH'
			| 'UA-CV'
			| 'UA-CRIMEA'
			| 'UA-DP'
			| 'UA-DT'
			| 'UA-IF'
			| 'UA-KK'
			| 'UA-KS'
			| 'UA-KM'
			| 'UA-KV'
			| 'UA-KH'
			| 'UA-LH'
			| 'UA-LV'
			| 'UA-MY'
			| 'UA-OD'
			| 'UA-PL'
			| 'UA-RV'
			| 'UA-SM'
			| 'UA-TP'
			| 'UA-ZK'
			| 'UA-VI'
			| 'UA-VO'
			| 'UA-ZP'
			| 'UA-ZT'
		>;
	}): Property {
		if (typeof params.locationType === 'undefined') {
			params.locationType = 'COUNTRY';
		}

		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'serverLocation', {}, params));
	}

	/**
	 * Specifies ranges of times during which the request occurred.
	 *
	 * @param {object} params - The parameters needed to configure onTime
	 * @param {'BEGINNING' | 'BETWEEN' | 'LASTING' | 'REPEATING'} [params.matchOperator] - Specifies how to define the
	 *   range of time. Default: "BEGINNING".
	 * @param {string} [params.repeatInterval] - Sets the time between each repeating time period's starting points.
	 *   Default: "1d".
	 * @param {string} [params.repeatDuration] - Sets the duration of each repeating time period. Default: "1d".
	 * @param {string} [params.lastingDuration] - Specifies the end of a time period as a duration relative to the
	 *   `lastingDate`. Default: "1d".
	 * @param {string} [params.lastingDate] - Sets the start of a fixed time period.
	 * @param {string} [params.repeatBeginDate] - Sets the start of the initial time period.
	 * @param {boolean} [params.applyDaylightSavingsTime] - Adjusts the start time plus repeat interval to account for
	 *   daylight saving time. Applies when the current time and the start time use different systems, daylight and
	 *   standard, and the two values are in conflict. Default: true.
	 * @param {string} [params.beginDate] - Sets the start of a time period.
	 * @param {string} [params.endDate] - Sets the end of a fixed time period.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/time-interval | Akamai Techdocs}
	 */
	onTime(params: {
		/** Specifies how to define the range of time. Default: "BEGINNING". */
		matchOperator?: 'BEGINNING' | 'BETWEEN' | 'LASTING' | 'REPEATING';

		/** Sets the time between each repeating time period's starting points. Default: "1d". */
		repeatInterval?: string;

		/** Sets the duration of each repeating time period. Default: "1d". */
		repeatDuration?: string;

		/** Specifies the end of a time period as a duration relative to the `lastingDate`. Default: "1d". */
		lastingDuration?: string;

		/** Sets the start of a fixed time period. */
		lastingDate?: string;

		/** Sets the start of the initial time period. */
		repeatBeginDate?: string;

		/**
		 * Adjusts the start time plus repeat interval to account for daylight saving time. Applies when the current
		 * time and the start time use different systems, daylight and standard, and the two values are in conflict.
		 * Default: true.
		 */
		applyDaylightSavingsTime?: boolean;

		/** Sets the start of a time period. */
		beginDate?: string;

		/** Sets the end of a fixed time period. */
		endDate?: string;
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'BEGINNING';
		}

		if (typeof params.repeatInterval === 'undefined' && (params.matchOperator as unknown) === 'REPEATING') {
			params.repeatInterval = '1d';
		}

		if (typeof params.repeatDuration === 'undefined' && (params.matchOperator as unknown) === 'REPEATING') {
			params.repeatDuration = '1d';
		}

		if (typeof params.lastingDuration === 'undefined' && (params.matchOperator as unknown) === 'LASTING') {
			params.lastingDuration = '1d';
		}

		if (
			typeof params.applyDaylightSavingsTime === 'undefined' &&
			(params.matchOperator as unknown) === 'REPEATING'
		) {
			params.applyDaylightSavingsTime = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'time', {}, params));
	}

	/**
	 * Matches the user agent string that helps identify the client browser and device.
	 *
	 * @param {object} params - The parameters needed to configure onUserAgent
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF'} [params.matchOperator] - Matches the specified set of `values` when set to
	 *   `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match. Default: "IS_ONE_OF".
	 * @param {string[]} params.values - The `User-Agent` header's value. For example, `Mozilla/4.0 (compatible; MSIE
	 *   6.0; Windows NT 5.1)`.
	 * @param {boolean} [params.matchWildcard] - Allows wildcards in the `value` field, where `?` matches a single
	 *   character and `*` matches zero or more characters. For example, `*Android*`, `*iPhone5*`, `*Firefox*`, or
	 *   `*Chrome*` allow substring matches. Default: true.
	 * @param {boolean} [params.matchCaseSensitive] - Sets a case-sensitive match for the `value` field. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/user-agent | Akamai Techdocs}
	 */
	onUserAgent(params: {
		/**
		 * Matches the specified set of `values` when set to `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match.
		 * Default: "IS_ONE_OF".
		 */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF';

		/** The `User-Agent` header's value. For example, `Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)`. */
		values: string[];

		/**
		 * Allows wildcards in the `value` field, where `?` matches a single character and `*` matches zero or more
		 * characters. For example, `*Android*`, `*iPhone5*`, `*Firefox*`, or `*Chrome*` allow substring matches.
		 * Default: true.
		 */
		matchWildcard?: boolean;

		/** Sets a case-sensitive match for the `value` field. Default: false. */
		matchCaseSensitive?: boolean;
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (typeof params.matchWildcard === 'undefined') {
			params.matchWildcard = true;
		}

		if (typeof params.matchCaseSensitive === 'undefined') {
			params.matchCaseSensitive = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'userAgent', {}, params));
	}

	/**
	 * Match on Auth Token 2.0 verification results.
	 *
	 * @param {object} params - The parameters needed to configure onTokenAuthorization
	 * @param {'IS_SUCCESS' | 'IS_CUSTOM_FAILURE' | 'IS_ANY_FAILURE'} [params.matchOperator] - Error match scope.
	 *   Default: "IS_ANY_FAILURE".
	 * @param {(
	 * 	| 'INVALID_HMAC_KEY'
	 * 	| 'INVALID_DELIMITER'
	 * 	| 'INVALID_ACL_DELIMITER'
	 * 	| 'INVALID_IP'
	 * 	| 'INVALID_URL'
	 * 	| 'MISSING_EXPIRATION_TIME'
	 * 	| 'NEED_URL_XOR_ACL'
	 * 	| 'UNSUPPORTED_VERSION'
	 * 	| 'MISSING_TOKEN'
	 * 	| 'MISSING_URL'
	 * 	| 'INVALID_TOKEN'
	 * 	| 'INVALID_HMAC'
	 * 	| 'TOKEN_NOT_VALID_YET'
	 * 	| 'EXPIRED_TOKEN'
	 * 	| 'UNAUTHORIZED_IP'
	 * 	| 'UNAUTHORIZED_URL'
	 * 	| 'INVALID_EXPIRATION_TIME'
	 * )[]} [params.statusList]
	 *   - Match specific failure cases. Default:
	 *       ["INVALID_HMAC_KEY","INVALID_DELIMITER","INVALID_ACL_DELIMITER","INVALID_IP","INVALID_URL","MISSING_EXPIRATION_TIME","NEED_URL_XOR_ACL","UNSUPPORTED_VERSION","MISSING_TOKEN","MISSING_URL","INVALID_TOKEN","INVALID_HMAC","TOKEN_NOT_VALID_YET","EXPIRED_TOKEN","UNAUTHORIZED_IP","UNAUTHORIZED_URL","INVALID_EXPIRATION_TIME"].
	 *
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/token-ver-result | Akamai Techdocs}
	 */
	onTokenAuthorization(params: {
		/** Error match scope. Default: "IS_ANY_FAILURE". */
		matchOperator?: 'IS_SUCCESS' | 'IS_CUSTOM_FAILURE' | 'IS_ANY_FAILURE';

		/**
		 * Match specific failure cases. Default:
		 * ["INVALID_HMAC_KEY","INVALID_DELIMITER","INVALID_ACL_DELIMITER","INVALID_IP","INVALID_URL","MISSING_EXPIRATION_TIME","NEED_URL_XOR_ACL","UNSUPPORTED_VERSION","MISSING_TOKEN","MISSING_URL","INVALID_TOKEN","INVALID_HMAC","TOKEN_NOT_VALID_YET","EXPIRED_TOKEN","UNAUTHORIZED_IP","UNAUTHORIZED_URL","INVALID_EXPIRATION_TIME"].
		 */
		statusList?: Array<
			| 'INVALID_HMAC_KEY'
			| 'INVALID_DELIMITER'
			| 'INVALID_ACL_DELIMITER'
			| 'INVALID_IP'
			| 'INVALID_URL'
			| 'MISSING_EXPIRATION_TIME'
			| 'NEED_URL_XOR_ACL'
			| 'UNSUPPORTED_VERSION'
			| 'MISSING_TOKEN'
			| 'MISSING_URL'
			| 'INVALID_TOKEN'
			| 'INVALID_HMAC'
			| 'TOKEN_NOT_VALID_YET'
			| 'EXPIRED_TOKEN'
			| 'UNAUTHORIZED_IP'
			| 'UNAUTHORIZED_URL'
			| 'INVALID_EXPIRATION_TIME'
		>;
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ANY_FAILURE';
		}

		if (typeof params.statusList === 'undefined' && (params.matchOperator as unknown) === 'IS_CUSTOM_FAILURE') {
			params.statusList = [
				'INVALID_HMAC_KEY',
				'INVALID_DELIMITER',
				'INVALID_ACL_DELIMITER',
				'INVALID_IP',
				'INVALID_URL',
				'MISSING_EXPIRATION_TIME',
				'NEED_URL_XOR_ACL',
				'UNSUPPORTED_VERSION',
				'MISSING_TOKEN',
				'MISSING_URL',
				'INVALID_TOKEN',
				'INVALID_HMAC',
				'TOKEN_NOT_VALID_YET',
				'EXPIRED_TOKEN',
				'UNAUTHORIZED_IP',
				'UNAUTHORIZED_URL',
				'INVALID_EXPIRATION_TIME',
			];
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'tokenAuthorization', {}, params));
	}

	/**
	 * Allows Cloudlets Origins, referenced by label, to define their own criteria to assign custom origin definitions.
	 * The criteria may match, for example, for a specified percentage of requests defined by the cloudlet to use an
	 * alternative version of a website. You need to pair this criteria with a sibling [`origin`](#) definition. It
	 * should not appear with any other criteria, and an [`allowCloudletsOrigins`](#) behavior needs to appear within a
	 * parent rule.
	 *
	 * @param {object} params - The parameters needed to configure onCloudletsOrigin
	 * @param {string} params.originId - The Cloudlets Origins identifier, limited to alphanumeric and underscore
	 *   characters.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/conditional-origin-id | Akamai Techdocs}
	 */
	onCloudletsOrigin(params: {
		/** The Cloudlets Origins identifier, limited to alphanumeric and underscore characters. */
		originId: string;
	}): Property {
		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'cloudletsOrigin', {}, params));
	}

	/**
	 * The client browser's approximate geographic location, determined by looking up the IP address in a database.
	 *
	 * @param {object} params - The parameters needed to configure onUserLocation
	 * @param {'COUNTRY' | 'CONTINENT' | 'REGION'} [params.field] - Indicates the geographic scope. Default: "COUNTRY".
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF'} [params.matchOperator] - Matches the specified set of values when set to
	 *   `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match. Default: "IS_ONE_OF".
	 * @param {(
	 * 	| 'AD'
	 * 	| 'AE'
	 * 	| 'AF'
	 * 	| 'AG'
	 * 	| 'AI'
	 * 	| 'AL'
	 * 	| 'AM'
	 * 	| 'AO'
	 * 	| 'AQ'
	 * 	| 'AR'
	 * 	| 'AS'
	 * 	| 'AT'
	 * 	| 'AU'
	 * 	| 'AW'
	 * 	| 'AZ'
	 * 	| 'BA'
	 * 	| 'BB'
	 * 	| 'BD'
	 * 	| 'BE'
	 * 	| 'BF'
	 * 	| 'BG'
	 * 	| 'BH'
	 * 	| 'BI'
	 * 	| 'BJ'
	 * 	| 'BL'
	 * 	| 'BM'
	 * 	| 'BN'
	 * 	| 'BO'
	 * 	| 'BQ'
	 * 	| 'BR'
	 * 	| 'BS'
	 * 	| 'BT'
	 * 	| 'BV'
	 * 	| 'BW'
	 * 	| 'BY'
	 * 	| 'BZ'
	 * 	| 'CA'
	 * 	| 'CC'
	 * 	| 'CD'
	 * 	| 'CF'
	 * 	| 'CG'
	 * 	| 'CH'
	 * 	| 'CI'
	 * 	| 'CK'
	 * 	| 'CL'
	 * 	| 'CM'
	 * 	| 'CN'
	 * 	| 'CO'
	 * 	| 'CR'
	 * 	| 'CU'
	 * 	| 'CV'
	 * 	| 'CW'
	 * 	| 'CX'
	 * 	| 'CY'
	 * 	| 'CZ'
	 * 	| 'DE'
	 * 	| 'DJ'
	 * 	| 'DK'
	 * 	| 'DM'
	 * 	| 'DO'
	 * 	| 'DZ'
	 * 	| 'EC'
	 * 	| 'EE'
	 * 	| 'EG'
	 * 	| 'EH'
	 * 	| 'ER'
	 * 	| 'ES'
	 * 	| 'ET'
	 * 	| 'EU'
	 * 	| 'FI'
	 * 	| 'FJ'
	 * 	| 'FK'
	 * 	| 'FM'
	 * 	| 'FO'
	 * 	| 'FR'
	 * 	| 'GA'
	 * 	| 'GB'
	 * 	| 'GD'
	 * 	| 'GE'
	 * 	| 'GF'
	 * 	| 'GH'
	 * 	| 'GI'
	 * 	| 'GG'
	 * 	| 'GL'
	 * 	| 'GM'
	 * 	| 'GN'
	 * 	| 'GP'
	 * 	| 'GQ'
	 * 	| 'GR'
	 * 	| 'GS'
	 * 	| 'GT'
	 * 	| 'GU'
	 * 	| 'GW'
	 * 	| 'GY'
	 * 	| 'HK'
	 * 	| 'HM'
	 * 	| 'HN'
	 * 	| 'HR'
	 * 	| 'HT'
	 * 	| 'HU'
	 * 	| 'ID'
	 * 	| 'IE'
	 * 	| 'IL'
	 * 	| 'IM'
	 * 	| 'IN'
	 * 	| 'IO'
	 * 	| 'IQ'
	 * 	| 'IR'
	 * 	| 'IS'
	 * 	| 'IT'
	 * 	| 'JE'
	 * 	| 'JM'
	 * 	| 'JO'
	 * 	| 'JP'
	 * 	| 'KE'
	 * 	| 'KG'
	 * 	| 'KH'
	 * 	| 'KI'
	 * 	| 'KM'
	 * 	| 'KN'
	 * 	| 'KP'
	 * 	| 'KR'
	 * 	| 'KW'
	 * 	| 'KY'
	 * 	| 'KZ'
	 * 	| 'LA'
	 * 	| 'LB'
	 * 	| 'LC'
	 * 	| 'LI'
	 * 	| 'LK'
	 * 	| 'LR'
	 * 	| 'LS'
	 * 	| 'LT'
	 * 	| 'LU'
	 * 	| 'LV'
	 * 	| 'LY'
	 * 	| 'MA'
	 * 	| 'MC'
	 * 	| 'MD'
	 * 	| 'ME'
	 * 	| 'MF'
	 * 	| 'MG'
	 * 	| 'MH'
	 * 	| 'MK'
	 * 	| 'ML'
	 * 	| 'MM'
	 * 	| 'MN'
	 * 	| 'MO'
	 * 	| 'MP'
	 * 	| 'MQ'
	 * 	| 'MR'
	 * 	| 'MS'
	 * 	| 'MT'
	 * 	| 'MU'
	 * 	| 'MV'
	 * 	| 'MW'
	 * 	| 'MX'
	 * 	| 'MY'
	 * 	| 'MZ'
	 * 	| 'NA'
	 * 	| 'NC'
	 * 	| 'NE'
	 * 	| 'NF'
	 * 	| 'NG'
	 * 	| 'NI'
	 * 	| 'NL'
	 * 	| 'NO'
	 * 	| 'NP'
	 * 	| 'NR'
	 * 	| 'NU'
	 * 	| 'NZ'
	 * 	| 'OM'
	 * 	| 'PA'
	 * 	| 'PE'
	 * 	| 'PF'
	 * 	| 'PG'
	 * 	| 'PH'
	 * 	| 'PK'
	 * 	| 'PL'
	 * 	| 'PM'
	 * 	| 'PN'
	 * 	| 'PR'
	 * 	| 'PS'
	 * 	| 'PT'
	 * 	| 'PW'
	 * 	| 'PY'
	 * 	| 'QA'
	 * 	| 'RE'
	 * 	| 'RO'
	 * 	| 'RS'
	 * 	| 'RU'
	 * 	| 'RW'
	 * 	| 'SA'
	 * 	| 'SB'
	 * 	| 'SC'
	 * 	| 'SD'
	 * 	| 'SE'
	 * 	| 'SG'
	 * 	| 'SH'
	 * 	| 'SI'
	 * 	| 'SJ'
	 * 	| 'SK'
	 * 	| 'SL'
	 * 	| 'SM'
	 * 	| 'SN'
	 * 	| 'SO'
	 * 	| 'SR'
	 * 	| 'SS'
	 * 	| 'ST'
	 * 	| 'SV'
	 * 	| 'SX'
	 * 	| 'SY'
	 * 	| 'SZ'
	 * 	| 'TC'
	 * 	| 'TD'
	 * 	| 'TF'
	 * 	| 'TG'
	 * 	| 'TH'
	 * 	| 'TJ'
	 * 	| 'TK'
	 * 	| 'TM'
	 * 	| 'TN'
	 * 	| 'TO'
	 * 	| 'TL'
	 * 	| 'TR'
	 * 	| 'TT'
	 * 	| 'TV'
	 * 	| 'TW'
	 * 	| 'TZ'
	 * 	| 'UA'
	 * 	| 'UG'
	 * 	| 'UM'
	 * 	| 'US'
	 * 	| 'UY'
	 * 	| 'UZ'
	 * 	| 'VA'
	 * 	| 'VC'
	 * 	| 'VE'
	 * 	| 'VG'
	 * 	| 'VI'
	 * 	| 'VN'
	 * 	| 'VU'
	 * 	| 'WF'
	 * 	| 'WS'
	 * 	| 'YE'
	 * 	| 'YT'
	 * 	| 'ZA'
	 * 	| 'ZM'
	 * 	| 'ZW'
	 * )[]} [params.countryValues]
	 *   - ISO 3166-1 country codes, such as `US` or `CN`.
	 *
	 * @param {('AF' | 'AS' | 'EU' | 'NA' | 'OC' | 'OT' | 'SA')[]} [params.continentValues] - Continent codes.
	 * @param {(
	 * 	| 'US-AL'
	 * 	| 'US-AK'
	 * 	| 'US-AZ'
	 * 	| 'US-AR'
	 * 	| 'US-CA'
	 * 	| 'US-CO'
	 * 	| 'US-CT'
	 * 	| 'US-DE'
	 * 	| 'US-DC'
	 * 	| 'US-FL'
	 * 	| 'US-GA'
	 * 	| 'US-HI'
	 * 	| 'US-ID'
	 * 	| 'US-IL'
	 * 	| 'US-IN'
	 * 	| 'US-IA'
	 * 	| 'US-KS'
	 * 	| 'US-KY'
	 * 	| 'US-LA'
	 * 	| 'US-ME'
	 * 	| 'US-MD'
	 * 	| 'US-MA'
	 * 	| 'US-MI'
	 * 	| 'US-MN'
	 * 	| 'US-MS'
	 * 	| 'US-MO'
	 * 	| 'US-MT'
	 * 	| 'US-NE'
	 * 	| 'US-NV'
	 * 	| 'US-NH'
	 * 	| 'US-NJ'
	 * 	| 'US-NM'
	 * 	| 'US-NY'
	 * 	| 'US-NC'
	 * 	| 'US-ND'
	 * 	| 'US-OH'
	 * 	| 'US-OK'
	 * 	| 'US-OR'
	 * 	| 'US-PA'
	 * 	| 'US-RI'
	 * 	| 'US-SC'
	 * 	| 'US-SD'
	 * 	| 'US-TN'
	 * 	| 'US-TX'
	 * 	| 'US-UT'
	 * 	| 'US-VT'
	 * 	| 'US-VA'
	 * 	| 'US-WA'
	 * 	| 'US-WV'
	 * 	| 'US-WI'
	 * 	| 'US-WY'
	 * 	| 'CA-AB'
	 * 	| 'CA-BC'
	 * 	| 'CA-MB'
	 * 	| 'CA-NB'
	 * 	| 'CA-NF'
	 * 	| 'CA-NS'
	 * 	| 'CA-NT'
	 * 	| 'CA-NU'
	 * 	| 'CA-ON'
	 * 	| 'CA-PE'
	 * 	| 'CA-QC'
	 * 	| 'CA-SK'
	 * 	| 'CA-YT'
	 * 	| 'AU-ACT'
	 * 	| 'AU-NSW'
	 * 	| 'AU-NT'
	 * 	| 'AU-QLD'
	 * 	| 'AU-SA'
	 * 	| 'AU-TAS'
	 * 	| 'AU-VIC'
	 * 	| 'AU-WA'
	 * 	| 'GB-EN'
	 * 	| 'GB-NI'
	 * 	| 'GB-SC'
	 * 	| 'GB-WA'
	 * 	| 'JP-00'
	 * 	| 'JP-01'
	 * 	| 'JP-02'
	 * 	| 'JP-03'
	 * 	| 'JP-04'
	 * 	| 'JP-05'
	 * 	| 'JP-06'
	 * 	| 'JP-07'
	 * 	| 'JP-08'
	 * 	| 'JP-09'
	 * 	| 'JP-10'
	 * 	| 'JP-11'
	 * 	| 'JP-12'
	 * 	| 'JP-13'
	 * 	| 'JP-14'
	 * 	| 'JP-15'
	 * 	| 'JP-16'
	 * 	| 'JP-17'
	 * 	| 'JP-18'
	 * 	| 'JP-19'
	 * 	| 'JP-20'
	 * 	| 'JP-21'
	 * 	| 'JP-22'
	 * 	| 'JP-23'
	 * 	| 'JP-24'
	 * 	| 'JP-25'
	 * 	| 'JP-26'
	 * 	| 'JP-27'
	 * 	| 'JP-28'
	 * 	| 'JP-29'
	 * 	| 'JP-30'
	 * 	| 'JP-31'
	 * 	| 'JP-32'
	 * 	| 'JP-33'
	 * 	| 'JP-34'
	 * 	| 'JP-35'
	 * 	| 'JP-36'
	 * 	| 'JP-37'
	 * 	| 'JP-38'
	 * 	| 'JP-39'
	 * 	| 'JP-40'
	 * 	| 'JP-41'
	 * 	| 'JP-42'
	 * 	| 'JP-43'
	 * 	| 'JP-44'
	 * 	| 'JP-45'
	 * 	| 'JP-46'
	 * 	| 'JP-47'
	 * 	| 'BR-AC'
	 * 	| 'BR-AL'
	 * 	| 'BR-AM'
	 * 	| 'BR-AP'
	 * 	| 'BR-BA'
	 * 	| 'BR-CE'
	 * 	| 'BR-DF'
	 * 	| 'BR-ES'
	 * 	| 'BR-GO'
	 * 	| 'BR-IS'
	 * 	| 'BR-MA'
	 * 	| 'BR-MG'
	 * 	| 'BR-MS'
	 * 	| 'BR-MT'
	 * 	| 'BR-PA'
	 * 	| 'BR-PB'
	 * 	| 'BR-PE'
	 * 	| 'BR-PI'
	 * 	| 'BR-PR'
	 * 	| 'BR-RJ'
	 * 	| 'BR-RN'
	 * 	| 'BR-RO'
	 * 	| 'BR-RR'
	 * 	| 'BR-RS'
	 * 	| 'BR-SC'
	 * 	| 'BR-SE'
	 * 	| 'BR-SP'
	 * 	| 'BR-TO'
	 * 	| 'DE-BB'
	 * 	| 'DE-BE'
	 * 	| 'DE-BW'
	 * 	| 'DE-BY'
	 * 	| 'DE-HB'
	 * 	| 'DE-HE'
	 * 	| 'DE-HH'
	 * 	| 'DE-MV'
	 * 	| 'DE-NI'
	 * 	| 'DE-NW'
	 * 	| 'DE-RP'
	 * 	| 'DE-SH'
	 * 	| 'DE-SL'
	 * 	| 'DE-SN'
	 * 	| 'DE-ST'
	 * 	| 'DE-TH'
	 * 	| 'FR-ARA'
	 * 	| 'FR-BFC'
	 * 	| 'FR-BRE'
	 * 	| 'FR-CVL'
	 * 	| 'FR-COR'
	 * 	| 'FR-GES'
	 * 	| 'FR-HDF'
	 * 	| 'FR-IDF'
	 * 	| 'FR-NOR'
	 * 	| 'FR-NAQ'
	 * 	| 'FR-OCC'
	 * 	| 'FR-PDL'
	 * 	| 'FR-PAC'
	 * 	| 'CH-AG'
	 * 	| 'CH-AI'
	 * 	| 'CH-AR'
	 * 	| 'CH-BE'
	 * 	| 'CH-BL'
	 * 	| 'CH-BS'
	 * 	| 'CH-FR'
	 * 	| 'CH-GE'
	 * 	| 'CH-GL'
	 * 	| 'CH-GR'
	 * 	| 'CH-JU'
	 * 	| 'CH-LU'
	 * 	| 'CH-NE'
	 * 	| 'CH-NW'
	 * 	| 'CH-OW'
	 * 	| 'CH-SG'
	 * 	| 'CH-SH'
	 * 	| 'CH-SO'
	 * 	| 'CH-SZ'
	 * 	| 'CH-TG'
	 * 	| 'CH-TI'
	 * 	| 'CH-UR'
	 * 	| 'CH-VD'
	 * 	| 'CH-VS'
	 * 	| 'CH-ZG'
	 * 	| 'CH-ZH'
	 * 	| 'CN-AH'
	 * 	| 'CN-BJ'
	 * 	| 'CN-CQ'
	 * 	| 'CN-FJ'
	 * 	| 'CN-GS'
	 * 	| 'CN-GD'
	 * 	| 'CN-GX'
	 * 	| 'CN-GZ'
	 * 	| 'CN-HI'
	 * 	| 'CN-HE'
	 * 	| 'CN-HL'
	 * 	| 'CN-HA'
	 * 	| 'CN-HB'
	 * 	| 'CN-HN'
	 * 	| 'CN-JS'
	 * 	| 'CN-JX'
	 * 	| 'CN-JL'
	 * 	| 'CN-LN'
	 * 	| 'CN-NM'
	 * 	| 'CN-NX'
	 * 	| 'CN-QH'
	 * 	| 'CN-SN'
	 * 	| 'CN-SD'
	 * 	| 'CN-SH'
	 * 	| 'CN-SX'
	 * 	| 'CN-SC'
	 * 	| 'CN-TJ'
	 * 	| 'CN-XJ'
	 * 	| 'CN-XZ'
	 * 	| 'CN-YN'
	 * 	| 'CN-ZJ'
	 * 	| 'IN-AN'
	 * 	| 'IN-AP'
	 * 	| 'IN-AR'
	 * 	| 'IN-AS'
	 * 	| 'IN-BR'
	 * 	| 'IN-CH'
	 * 	| 'IN-CT'
	 * 	| 'IN-DD'
	 * 	| 'IN-DL'
	 * 	| 'IN-DN'
	 * 	| 'IN-GA'
	 * 	| 'IN-GJ'
	 * 	| 'IN-HP'
	 * 	| 'IN-HR'
	 * 	| 'IN-JH'
	 * 	| 'IN-JK'
	 * 	| 'IN-KA'
	 * 	| 'IN-KL'
	 * 	| 'IN-LD'
	 * 	| 'IN-MH'
	 * 	| 'IN-ML'
	 * 	| 'IN-MN'
	 * 	| 'IN-MP'
	 * 	| 'IN-MZ'
	 * 	| 'IN-NL'
	 * 	| 'IN-OR'
	 * 	| 'IN-PB'
	 * 	| 'IN-PY'
	 * 	| 'IN-RJ'
	 * 	| 'IN-SK'
	 * 	| 'IN-TG'
	 * 	| 'IN-TN'
	 * 	| 'IN-TR'
	 * 	| 'IN-UL'
	 * 	| 'IN-UP'
	 * 	| 'IN-WB'
	 * 	| 'SE-K'
	 * 	| 'SE-X'
	 * 	| 'SE-I'
	 * 	| 'SE-N'
	 * 	| 'SE-Z'
	 * 	| 'SE-F'
	 * 	| 'SE-H'
	 * 	| 'SE-W'
	 * 	| 'SE-G'
	 * 	| 'SE-BD'
	 * 	| 'SE-T'
	 * 	| 'SE-E'
	 * 	| 'SE-D'
	 * 	| 'SE-C'
	 * 	| 'SE-S'
	 * 	| 'SE-AC'
	 * 	| 'SE-Y'
	 * 	| 'SE-U'
	 * 	| 'SE-AB'
	 * 	| 'SE-M'
	 * 	| 'SE-O'
	 * 	| 'MX-AGU'
	 * 	| 'MX-BCN'
	 * 	| 'MX-BCS'
	 * 	| 'MX-CAM'
	 * 	| 'MX-CHP'
	 * 	| 'MX-CHH'
	 * 	| 'MX-COA'
	 * 	| 'MX-COL'
	 * 	| 'MX-DIF'
	 * 	| 'MX-DUR'
	 * 	| 'MX-GUA'
	 * 	| 'MX-GRO'
	 * 	| 'MX-HID'
	 * 	| 'MX-JAL'
	 * 	| 'MX-MEX'
	 * 	| 'MX-MIC'
	 * 	| 'MX-MOR'
	 * 	| 'MX-NAY'
	 * 	| 'MX-NLE'
	 * 	| 'MX-OAX'
	 * 	| 'MX-PUE'
	 * 	| 'MX-QUE'
	 * 	| 'MX-ROO'
	 * 	| 'MX-SLP'
	 * 	| 'MX-SIN'
	 * 	| 'MX-SON'
	 * 	| 'MX-TAB'
	 * 	| 'MX-TAM'
	 * 	| 'MX-TLA'
	 * 	| 'MX-VER'
	 * 	| 'MX-YUC'
	 * 	| 'MX-ZAC'
	 * 	| 'UA-CK'
	 * 	| 'UA-CH'
	 * 	| 'UA-CV'
	 * 	| 'UA-CRIMEA'
	 * 	| 'UA-DP'
	 * 	| 'UA-DT'
	 * 	| 'UA-IF'
	 * 	| 'UA-KK'
	 * 	| 'UA-KS'
	 * 	| 'UA-KM'
	 * 	| 'UA-KV'
	 * 	| 'UA-KH'
	 * 	| 'UA-LH'
	 * 	| 'UA-LV'
	 * 	| 'UA-MY'
	 * 	| 'UA-OD'
	 * 	| 'UA-PL'
	 * 	| 'UA-RV'
	 * 	| 'UA-SM'
	 * 	| 'UA-TP'
	 * 	| 'UA-ZK'
	 * 	| 'UA-VI'
	 * 	| 'UA-VO'
	 * 	| 'UA-ZP'
	 * 	| 'UA-ZT'
	 * 	| 'ES-AN'
	 * 	| 'ES-AR'
	 * 	| 'ES-AS'
	 * 	| 'ES-CB'
	 * 	| 'ES-CE'
	 * 	| 'ES-CL'
	 * 	| 'ES-CM'
	 * 	| 'ES-CN'
	 * 	| 'ES-CT'
	 * 	| 'ES-EX'
	 * 	| 'ES-GA'
	 * 	| 'ES-IB'
	 * 	| 'ES-MC'
	 * 	| 'ES-MD'
	 * 	| 'ES-ML'
	 * 	| 'ES-NC'
	 * 	| 'ES-PV'
	 * 	| 'ES-RI'
	 * 	| 'ES-VC'
	 * 	| 'BE-BRU'
	 * 	| 'BE-VLG'
	 * 	| 'BE-WAL'
	 * 	| 'TH-10'
	 * 	| 'TH-11'
	 * 	| 'TH-12'
	 * 	| 'TH-13'
	 * 	| 'TH-14'
	 * 	| 'TH-15'
	 * 	| 'TH-16'
	 * 	| 'TH-17'
	 * 	| 'TH-18'
	 * 	| 'TH-19'
	 * 	| 'TH-20'
	 * 	| 'TH-21'
	 * 	| 'TH-22'
	 * 	| 'TH-23'
	 * 	| 'TH-24'
	 * 	| 'TH-25'
	 * 	| 'TH-26'
	 * 	| 'TH-27'
	 * 	| 'TH-30'
	 * 	| 'TH-31'
	 * 	| 'TH-32'
	 * 	| 'TH-33'
	 * 	| 'TH-34'
	 * 	| 'TH-35'
	 * 	| 'TH-36'
	 * 	| 'TH-37'
	 * 	| 'TH-38'
	 * 	| 'TH-39'
	 * 	| 'TH-40'
	 * 	| 'TH-41'
	 * 	| 'TH-42'
	 * 	| 'TH-43'
	 * 	| 'TH-44'
	 * 	| 'TH-45'
	 * 	| 'TH-46'
	 * 	| 'TH-47'
	 * 	| 'TH-48'
	 * 	| 'TH-49'
	 * 	| 'TH-50'
	 * 	| 'TH-51'
	 * 	| 'TH-52'
	 * 	| 'TH-53'
	 * 	| 'TH-54'
	 * 	| 'TH-55'
	 * 	| 'TH-56'
	 * 	| 'TH-57'
	 * 	| 'TH-58'
	 * 	| 'TH-60'
	 * 	| 'TH-61'
	 * 	| 'TH-62'
	 * 	| 'TH-63'
	 * 	| 'TH-64'
	 * 	| 'TH-65'
	 * 	| 'TH-66'
	 * 	| 'TH-67'
	 * 	| 'TH-70'
	 * 	| 'TH-71'
	 * 	| 'TH-72'
	 * 	| 'TH-73'
	 * 	| 'TH-74'
	 * 	| 'TH-75'
	 * 	| 'TH-76'
	 * 	| 'TH-77'
	 * 	| 'TH-80'
	 * 	| 'TH-81'
	 * 	| 'TH-82'
	 * 	| 'TH-83'
	 * 	| 'TH-84'
	 * 	| 'TH-85'
	 * 	| 'TH-86'
	 * 	| 'TH-90'
	 * 	| 'TH-91'
	 * 	| 'TH-92'
	 * 	| 'TH-93'
	 * 	| 'TH-94'
	 * 	| 'TH-95'
	 * 	| 'TH-96'
	 * 	| 'ID-AC'
	 * 	| 'ID-BA'
	 * 	| 'ID-BB'
	 * 	| 'ID-BE'
	 * 	| 'ID-BT'
	 * 	| 'ID-GO'
	 * 	| 'ID-JA'
	 * 	| 'ID-JB'
	 * 	| 'ID-JI'
	 * 	| 'ID-JK'
	 * 	| 'ID-JT'
	 * 	| 'ID-KB'
	 * 	| 'ID-KI'
	 * 	| 'ID-KR'
	 * 	| 'ID-KS'
	 * 	| 'ID-KT'
	 * 	| 'ID-KU'
	 * 	| 'ID-LA'
	 * 	| 'ID-MA'
	 * 	| 'ID-MU'
	 * 	| 'ID-NB'
	 * 	| 'ID-NT'
	 * 	| 'ID-PA'
	 * 	| 'ID-PB'
	 * 	| 'ID-RI'
	 * 	| 'ID-SA'
	 * 	| 'ID-SB'
	 * 	| 'ID-SG'
	 * 	| 'ID-SN'
	 * 	| 'ID-SR'
	 * 	| 'ID-SS'
	 * 	| 'ID-ST'
	 * 	| 'ID-SU'
	 * 	| 'ID-YO'
	 * 	| 'MY-01'
	 * 	| 'MY-02'
	 * 	| 'MY-03'
	 * 	| 'MY-04'
	 * 	| 'MY-05'
	 * 	| 'MY-06'
	 * 	| 'MY-07'
	 * 	| 'MY-08'
	 * 	| 'MY-09'
	 * 	| 'MY-10'
	 * 	| 'MY-11'
	 * 	| 'MY-12'
	 * 	| 'MY-13'
	 * 	| 'MY-14'
	 * 	| 'MY-15'
	 * 	| 'MY-16'
	 * 	| 'VN-01'
	 * 	| 'VN-02'
	 * 	| 'VN-03'
	 * 	| 'VN-04'
	 * 	| 'VN-05'
	 * 	| 'VN-06'
	 * 	| 'VN-07'
	 * 	| 'VN-09'
	 * 	| 'VN-13'
	 * 	| 'VN-14'
	 * 	| 'VN-18'
	 * 	| 'VN-20'
	 * 	| 'VN-21'
	 * 	| 'VN-22'
	 * 	| 'VN-23'
	 * 	| 'VN-24'
	 * 	| 'VN-25'
	 * 	| 'VN-26'
	 * 	| 'VN-27'
	 * 	| 'VN-28'
	 * 	| 'VN-29'
	 * 	| 'VN-30'
	 * 	| 'VN-31'
	 * 	| 'VN-32'
	 * 	| 'VN-33'
	 * 	| 'VN-34'
	 * 	| 'VN-35'
	 * 	| 'VN-36'
	 * 	| 'VN-37'
	 * 	| 'VN-39'
	 * 	| 'VN-40'
	 * 	| 'VN-41'
	 * 	| 'VN-43'
	 * 	| 'VN-44'
	 * 	| 'VN-45'
	 * 	| 'VN-46'
	 * 	| 'VN-47'
	 * 	| 'VN-49'
	 * 	| 'VN-50'
	 * 	| 'VN-51'
	 * 	| 'VN-52'
	 * 	| 'VN-53'
	 * 	| 'VN-54'
	 * 	| 'VN-55'
	 * 	| 'VN-56'
	 * 	| 'VN-57'
	 * 	| 'VN-58'
	 * 	| 'VN-59'
	 * 	| 'VN-61'
	 * 	| 'VN-63'
	 * 	| 'VN-66'
	 * 	| 'VN-67'
	 * 	| 'VN-68'
	 * 	| 'VN-69'
	 * 	| 'VN-70'
	 * 	| 'VN-71'
	 * 	| 'VN-72'
	 * 	| 'VN-73'
	 * 	| 'VN-CT'
	 * 	| 'VN-DN'
	 * 	| 'VN-HN'
	 * 	| 'VN-HP'
	 * 	| 'VN-SG'
	 * 	| 'PH-00'
	 * 	| 'PH-ABR'
	 * 	| 'PH-AGN'
	 * 	| 'PH-AGS'
	 * 	| 'PH-AKL'
	 * 	| 'PH-ALB'
	 * 	| 'PH-ANT'
	 * 	| 'PH-APA'
	 * 	| 'PH-AUR'
	 * 	| 'PH-BAN'
	 * 	| 'PH-BAS'
	 * 	| 'PH-BEN'
	 * 	| 'PH-BIL'
	 * 	| 'PH-BOH'
	 * 	| 'PH-BTG'
	 * 	| 'PH-BTN'
	 * 	| 'PH-BUK'
	 * 	| 'PH-BUL'
	 * 	| 'PH-CAG'
	 * 	| 'PH-CAM'
	 * 	| 'PH-CAN'
	 * 	| 'PH-CAP'
	 * 	| 'PH-CAS'
	 * 	| 'PH-CAT'
	 * 	| 'PH-CAV'
	 * 	| 'PH-CEB'
	 * 	| 'PH-COM'
	 * 	| 'PH-DAO'
	 * 	| 'PH-DAS'
	 * 	| 'PH-DAV'
	 * 	| 'PH-DIN'
	 * 	| 'PH-DVO'
	 * 	| 'PH-EAS'
	 * 	| 'PH-GUI'
	 * 	| 'PH-IFU'
	 * 	| 'PH-ILI'
	 * 	| 'PH-ILN'
	 * 	| 'PH-ILS'
	 * 	| 'PH-ISA'
	 * 	| 'PH-KAL'
	 * 	| 'PH-LAG'
	 * 	| 'PH-LAN'
	 * 	| 'PH-LAS'
	 * 	| 'PH-LEY'
	 * 	| 'PH-LUN'
	 * 	| 'PH-MAD'
	 * 	| 'PH-MAG'
	 * 	| 'PH-MAS'
	 * 	| 'PH-MDC'
	 * 	| 'PH-MDR'
	 * 	| 'PH-MOU'
	 * 	| 'PH-MSC'
	 * 	| 'PH-MSR'
	 * 	| 'PH-NCO'
	 * 	| 'PH-NEC'
	 * 	| 'PH-NER'
	 * 	| 'PH-NSA'
	 * 	| 'PH-NUE'
	 * 	| 'PH-NUV'
	 * 	| 'PH-PAM'
	 * 	| 'PH-PAN'
	 * 	| 'PH-PLW'
	 * 	| 'PH-QUE'
	 * 	| 'PH-QUI'
	 * 	| 'PH-RIZ'
	 * 	| 'PH-ROM'
	 * 	| 'PH-SAR'
	 * 	| 'PH-SCO'
	 * 	| 'PH-SIG'
	 * 	| 'PH-SLE'
	 * 	| 'PH-SLU'
	 * 	| 'PH-SOR'
	 * 	| 'PH-SUK'
	 * 	| 'PH-SUN'
	 * 	| 'PH-SUR'
	 * 	| 'PH-TAR'
	 * 	| 'PH-TAW'
	 * 	| 'PH-WSA'
	 * 	| 'PH-ZAN'
	 * 	| 'PH-ZAS'
	 * 	| 'PH-ZMB'
	 * 	| 'PH-ZSI'
	 * )[]} [params.regionValues]
	 *   - ISO 3166 country and region codes, for example `US:MA` for Massachusetts or `JP:13` for Tokyo.
	 *
	 * @param {'BOTH' | 'CONNECTING' | 'HEADERS'} [params.checkIps] - Specifies which IP addresses determine the user's
	 *   location. Default: "BOTH".
	 * @param {boolean} [params.useOnlyFirstXForwardedForIp] - When connecting via a proxy server as determined by the
	 *   `X-Forwarded-For` header, enabling this option matches the end client specified in the header. Disabling it
	 *   matches the connecting client's IP address. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/user-loc-data | Akamai Techdocs}
	 */
	onUserLocation(params: {
		/** Indicates the geographic scope. Default: "COUNTRY". */
		field?: 'COUNTRY' | 'CONTINENT' | 'REGION';

		/**
		 * Matches the specified set of values when set to `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match.
		 * Default: "IS_ONE_OF".
		 */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF';

		/** ISO 3166-1 country codes, such as `US` or `CN`. */
		countryValues?: Array<
			| 'AD'
			| 'AE'
			| 'AF'
			| 'AG'
			| 'AI'
			| 'AL'
			| 'AM'
			| 'AO'
			| 'AQ'
			| 'AR'
			| 'AS'
			| 'AT'
			| 'AU'
			| 'AW'
			| 'AZ'
			| 'BA'
			| 'BB'
			| 'BD'
			| 'BE'
			| 'BF'
			| 'BG'
			| 'BH'
			| 'BI'
			| 'BJ'
			| 'BL'
			| 'BM'
			| 'BN'
			| 'BO'
			| 'BQ'
			| 'BR'
			| 'BS'
			| 'BT'
			| 'BV'
			| 'BW'
			| 'BY'
			| 'BZ'
			| 'CA'
			| 'CC'
			| 'CD'
			| 'CF'
			| 'CG'
			| 'CH'
			| 'CI'
			| 'CK'
			| 'CL'
			| 'CM'
			| 'CN'
			| 'CO'
			| 'CR'
			| 'CU'
			| 'CV'
			| 'CW'
			| 'CX'
			| 'CY'
			| 'CZ'
			| 'DE'
			| 'DJ'
			| 'DK'
			| 'DM'
			| 'DO'
			| 'DZ'
			| 'EC'
			| 'EE'
			| 'EG'
			| 'EH'
			| 'ER'
			| 'ES'
			| 'ET'
			| 'EU'
			| 'FI'
			| 'FJ'
			| 'FK'
			| 'FM'
			| 'FO'
			| 'FR'
			| 'GA'
			| 'GB'
			| 'GD'
			| 'GE'
			| 'GF'
			| 'GH'
			| 'GI'
			| 'GG'
			| 'GL'
			| 'GM'
			| 'GN'
			| 'GP'
			| 'GQ'
			| 'GR'
			| 'GS'
			| 'GT'
			| 'GU'
			| 'GW'
			| 'GY'
			| 'HK'
			| 'HM'
			| 'HN'
			| 'HR'
			| 'HT'
			| 'HU'
			| 'ID'
			| 'IE'
			| 'IL'
			| 'IM'
			| 'IN'
			| 'IO'
			| 'IQ'
			| 'IR'
			| 'IS'
			| 'IT'
			| 'JE'
			| 'JM'
			| 'JO'
			| 'JP'
			| 'KE'
			| 'KG'
			| 'KH'
			| 'KI'
			| 'KM'
			| 'KN'
			| 'KP'
			| 'KR'
			| 'KW'
			| 'KY'
			| 'KZ'
			| 'LA'
			| 'LB'
			| 'LC'
			| 'LI'
			| 'LK'
			| 'LR'
			| 'LS'
			| 'LT'
			| 'LU'
			| 'LV'
			| 'LY'
			| 'MA'
			| 'MC'
			| 'MD'
			| 'ME'
			| 'MF'
			| 'MG'
			| 'MH'
			| 'MK'
			| 'ML'
			| 'MM'
			| 'MN'
			| 'MO'
			| 'MP'
			| 'MQ'
			| 'MR'
			| 'MS'
			| 'MT'
			| 'MU'
			| 'MV'
			| 'MW'
			| 'MX'
			| 'MY'
			| 'MZ'
			| 'NA'
			| 'NC'
			| 'NE'
			| 'NF'
			| 'NG'
			| 'NI'
			| 'NL'
			| 'NO'
			| 'NP'
			| 'NR'
			| 'NU'
			| 'NZ'
			| 'OM'
			| 'PA'
			| 'PE'
			| 'PF'
			| 'PG'
			| 'PH'
			| 'PK'
			| 'PL'
			| 'PM'
			| 'PN'
			| 'PR'
			| 'PS'
			| 'PT'
			| 'PW'
			| 'PY'
			| 'QA'
			| 'RE'
			| 'RO'
			| 'RS'
			| 'RU'
			| 'RW'
			| 'SA'
			| 'SB'
			| 'SC'
			| 'SD'
			| 'SE'
			| 'SG'
			| 'SH'
			| 'SI'
			| 'SJ'
			| 'SK'
			| 'SL'
			| 'SM'
			| 'SN'
			| 'SO'
			| 'SR'
			| 'SS'
			| 'ST'
			| 'SV'
			| 'SX'
			| 'SY'
			| 'SZ'
			| 'TC'
			| 'TD'
			| 'TF'
			| 'TG'
			| 'TH'
			| 'TJ'
			| 'TK'
			| 'TM'
			| 'TN'
			| 'TO'
			| 'TL'
			| 'TR'
			| 'TT'
			| 'TV'
			| 'TW'
			| 'TZ'
			| 'UA'
			| 'UG'
			| 'UM'
			| 'US'
			| 'UY'
			| 'UZ'
			| 'VA'
			| 'VC'
			| 'VE'
			| 'VG'
			| 'VI'
			| 'VN'
			| 'VU'
			| 'WF'
			| 'WS'
			| 'YE'
			| 'YT'
			| 'ZA'
			| 'ZM'
			| 'ZW'
		>;

		/** Continent codes. */
		continentValues?: Array<'AF' | 'AS' | 'EU' | 'NA' | 'OC' | 'OT' | 'SA'>;

		/** ISO 3166 country and region codes, for example `US:MA` for Massachusetts or `JP:13` for Tokyo. */
		regionValues?: Array<
			| 'US-AL'
			| 'US-AK'
			| 'US-AZ'
			| 'US-AR'
			| 'US-CA'
			| 'US-CO'
			| 'US-CT'
			| 'US-DE'
			| 'US-DC'
			| 'US-FL'
			| 'US-GA'
			| 'US-HI'
			| 'US-ID'
			| 'US-IL'
			| 'US-IN'
			| 'US-IA'
			| 'US-KS'
			| 'US-KY'
			| 'US-LA'
			| 'US-ME'
			| 'US-MD'
			| 'US-MA'
			| 'US-MI'
			| 'US-MN'
			| 'US-MS'
			| 'US-MO'
			| 'US-MT'
			| 'US-NE'
			| 'US-NV'
			| 'US-NH'
			| 'US-NJ'
			| 'US-NM'
			| 'US-NY'
			| 'US-NC'
			| 'US-ND'
			| 'US-OH'
			| 'US-OK'
			| 'US-OR'
			| 'US-PA'
			| 'US-RI'
			| 'US-SC'
			| 'US-SD'
			| 'US-TN'
			| 'US-TX'
			| 'US-UT'
			| 'US-VT'
			| 'US-VA'
			| 'US-WA'
			| 'US-WV'
			| 'US-WI'
			| 'US-WY'
			| 'CA-AB'
			| 'CA-BC'
			| 'CA-MB'
			| 'CA-NB'
			| 'CA-NF'
			| 'CA-NS'
			| 'CA-NT'
			| 'CA-NU'
			| 'CA-ON'
			| 'CA-PE'
			| 'CA-QC'
			| 'CA-SK'
			| 'CA-YT'
			| 'AU-ACT'
			| 'AU-NSW'
			| 'AU-NT'
			| 'AU-QLD'
			| 'AU-SA'
			| 'AU-TAS'
			| 'AU-VIC'
			| 'AU-WA'
			| 'GB-EN'
			| 'GB-NI'
			| 'GB-SC'
			| 'GB-WA'
			| 'JP-00'
			| 'JP-01'
			| 'JP-02'
			| 'JP-03'
			| 'JP-04'
			| 'JP-05'
			| 'JP-06'
			| 'JP-07'
			| 'JP-08'
			| 'JP-09'
			| 'JP-10'
			| 'JP-11'
			| 'JP-12'
			| 'JP-13'
			| 'JP-14'
			| 'JP-15'
			| 'JP-16'
			| 'JP-17'
			| 'JP-18'
			| 'JP-19'
			| 'JP-20'
			| 'JP-21'
			| 'JP-22'
			| 'JP-23'
			| 'JP-24'
			| 'JP-25'
			| 'JP-26'
			| 'JP-27'
			| 'JP-28'
			| 'JP-29'
			| 'JP-30'
			| 'JP-31'
			| 'JP-32'
			| 'JP-33'
			| 'JP-34'
			| 'JP-35'
			| 'JP-36'
			| 'JP-37'
			| 'JP-38'
			| 'JP-39'
			| 'JP-40'
			| 'JP-41'
			| 'JP-42'
			| 'JP-43'
			| 'JP-44'
			| 'JP-45'
			| 'JP-46'
			| 'JP-47'
			| 'BR-AC'
			| 'BR-AL'
			| 'BR-AM'
			| 'BR-AP'
			| 'BR-BA'
			| 'BR-CE'
			| 'BR-DF'
			| 'BR-ES'
			| 'BR-GO'
			| 'BR-IS'
			| 'BR-MA'
			| 'BR-MG'
			| 'BR-MS'
			| 'BR-MT'
			| 'BR-PA'
			| 'BR-PB'
			| 'BR-PE'
			| 'BR-PI'
			| 'BR-PR'
			| 'BR-RJ'
			| 'BR-RN'
			| 'BR-RO'
			| 'BR-RR'
			| 'BR-RS'
			| 'BR-SC'
			| 'BR-SE'
			| 'BR-SP'
			| 'BR-TO'
			| 'DE-BB'
			| 'DE-BE'
			| 'DE-BW'
			| 'DE-BY'
			| 'DE-HB'
			| 'DE-HE'
			| 'DE-HH'
			| 'DE-MV'
			| 'DE-NI'
			| 'DE-NW'
			| 'DE-RP'
			| 'DE-SH'
			| 'DE-SL'
			| 'DE-SN'
			| 'DE-ST'
			| 'DE-TH'
			| 'FR-ARA'
			| 'FR-BFC'
			| 'FR-BRE'
			| 'FR-CVL'
			| 'FR-COR'
			| 'FR-GES'
			| 'FR-HDF'
			| 'FR-IDF'
			| 'FR-NOR'
			| 'FR-NAQ'
			| 'FR-OCC'
			| 'FR-PDL'
			| 'FR-PAC'
			| 'CH-AG'
			| 'CH-AI'
			| 'CH-AR'
			| 'CH-BE'
			| 'CH-BL'
			| 'CH-BS'
			| 'CH-FR'
			| 'CH-GE'
			| 'CH-GL'
			| 'CH-GR'
			| 'CH-JU'
			| 'CH-LU'
			| 'CH-NE'
			| 'CH-NW'
			| 'CH-OW'
			| 'CH-SG'
			| 'CH-SH'
			| 'CH-SO'
			| 'CH-SZ'
			| 'CH-TG'
			| 'CH-TI'
			| 'CH-UR'
			| 'CH-VD'
			| 'CH-VS'
			| 'CH-ZG'
			| 'CH-ZH'
			| 'CN-AH'
			| 'CN-BJ'
			| 'CN-CQ'
			| 'CN-FJ'
			| 'CN-GS'
			| 'CN-GD'
			| 'CN-GX'
			| 'CN-GZ'
			| 'CN-HI'
			| 'CN-HE'
			| 'CN-HL'
			| 'CN-HA'
			| 'CN-HB'
			| 'CN-HN'
			| 'CN-JS'
			| 'CN-JX'
			| 'CN-JL'
			| 'CN-LN'
			| 'CN-NM'
			| 'CN-NX'
			| 'CN-QH'
			| 'CN-SN'
			| 'CN-SD'
			| 'CN-SH'
			| 'CN-SX'
			| 'CN-SC'
			| 'CN-TJ'
			| 'CN-XJ'
			| 'CN-XZ'
			| 'CN-YN'
			| 'CN-ZJ'
			| 'IN-AN'
			| 'IN-AP'
			| 'IN-AR'
			| 'IN-AS'
			| 'IN-BR'
			| 'IN-CH'
			| 'IN-CT'
			| 'IN-DD'
			| 'IN-DL'
			| 'IN-DN'
			| 'IN-GA'
			| 'IN-GJ'
			| 'IN-HP'
			| 'IN-HR'
			| 'IN-JH'
			| 'IN-JK'
			| 'IN-KA'
			| 'IN-KL'
			| 'IN-LD'
			| 'IN-MH'
			| 'IN-ML'
			| 'IN-MN'
			| 'IN-MP'
			| 'IN-MZ'
			| 'IN-NL'
			| 'IN-OR'
			| 'IN-PB'
			| 'IN-PY'
			| 'IN-RJ'
			| 'IN-SK'
			| 'IN-TG'
			| 'IN-TN'
			| 'IN-TR'
			| 'IN-UL'
			| 'IN-UP'
			| 'IN-WB'
			| 'SE-K'
			| 'SE-X'
			| 'SE-I'
			| 'SE-N'
			| 'SE-Z'
			| 'SE-F'
			| 'SE-H'
			| 'SE-W'
			| 'SE-G'
			| 'SE-BD'
			| 'SE-T'
			| 'SE-E'
			| 'SE-D'
			| 'SE-C'
			| 'SE-S'
			| 'SE-AC'
			| 'SE-Y'
			| 'SE-U'
			| 'SE-AB'
			| 'SE-M'
			| 'SE-O'
			| 'MX-AGU'
			| 'MX-BCN'
			| 'MX-BCS'
			| 'MX-CAM'
			| 'MX-CHP'
			| 'MX-CHH'
			| 'MX-COA'
			| 'MX-COL'
			| 'MX-DIF'
			| 'MX-DUR'
			| 'MX-GUA'
			| 'MX-GRO'
			| 'MX-HID'
			| 'MX-JAL'
			| 'MX-MEX'
			| 'MX-MIC'
			| 'MX-MOR'
			| 'MX-NAY'
			| 'MX-NLE'
			| 'MX-OAX'
			| 'MX-PUE'
			| 'MX-QUE'
			| 'MX-ROO'
			| 'MX-SLP'
			| 'MX-SIN'
			| 'MX-SON'
			| 'MX-TAB'
			| 'MX-TAM'
			| 'MX-TLA'
			| 'MX-VER'
			| 'MX-YUC'
			| 'MX-ZAC'
			| 'UA-CK'
			| 'UA-CH'
			| 'UA-CV'
			| 'UA-CRIMEA'
			| 'UA-DP'
			| 'UA-DT'
			| 'UA-IF'
			| 'UA-KK'
			| 'UA-KS'
			| 'UA-KM'
			| 'UA-KV'
			| 'UA-KH'
			| 'UA-LH'
			| 'UA-LV'
			| 'UA-MY'
			| 'UA-OD'
			| 'UA-PL'
			| 'UA-RV'
			| 'UA-SM'
			| 'UA-TP'
			| 'UA-ZK'
			| 'UA-VI'
			| 'UA-VO'
			| 'UA-ZP'
			| 'UA-ZT'
			| 'ES-AN'
			| 'ES-AR'
			| 'ES-AS'
			| 'ES-CB'
			| 'ES-CE'
			| 'ES-CL'
			| 'ES-CM'
			| 'ES-CN'
			| 'ES-CT'
			| 'ES-EX'
			| 'ES-GA'
			| 'ES-IB'
			| 'ES-MC'
			| 'ES-MD'
			| 'ES-ML'
			| 'ES-NC'
			| 'ES-PV'
			| 'ES-RI'
			| 'ES-VC'
			| 'BE-BRU'
			| 'BE-VLG'
			| 'BE-WAL'
			| 'TH-10'
			| 'TH-11'
			| 'TH-12'
			| 'TH-13'
			| 'TH-14'
			| 'TH-15'
			| 'TH-16'
			| 'TH-17'
			| 'TH-18'
			| 'TH-19'
			| 'TH-20'
			| 'TH-21'
			| 'TH-22'
			| 'TH-23'
			| 'TH-24'
			| 'TH-25'
			| 'TH-26'
			| 'TH-27'
			| 'TH-30'
			| 'TH-31'
			| 'TH-32'
			| 'TH-33'
			| 'TH-34'
			| 'TH-35'
			| 'TH-36'
			| 'TH-37'
			| 'TH-38'
			| 'TH-39'
			| 'TH-40'
			| 'TH-41'
			| 'TH-42'
			| 'TH-43'
			| 'TH-44'
			| 'TH-45'
			| 'TH-46'
			| 'TH-47'
			| 'TH-48'
			| 'TH-49'
			| 'TH-50'
			| 'TH-51'
			| 'TH-52'
			| 'TH-53'
			| 'TH-54'
			| 'TH-55'
			| 'TH-56'
			| 'TH-57'
			| 'TH-58'
			| 'TH-60'
			| 'TH-61'
			| 'TH-62'
			| 'TH-63'
			| 'TH-64'
			| 'TH-65'
			| 'TH-66'
			| 'TH-67'
			| 'TH-70'
			| 'TH-71'
			| 'TH-72'
			| 'TH-73'
			| 'TH-74'
			| 'TH-75'
			| 'TH-76'
			| 'TH-77'
			| 'TH-80'
			| 'TH-81'
			| 'TH-82'
			| 'TH-83'
			| 'TH-84'
			| 'TH-85'
			| 'TH-86'
			| 'TH-90'
			| 'TH-91'
			| 'TH-92'
			| 'TH-93'
			| 'TH-94'
			| 'TH-95'
			| 'TH-96'
			| 'ID-AC'
			| 'ID-BA'
			| 'ID-BB'
			| 'ID-BE'
			| 'ID-BT'
			| 'ID-GO'
			| 'ID-JA'
			| 'ID-JB'
			| 'ID-JI'
			| 'ID-JK'
			| 'ID-JT'
			| 'ID-KB'
			| 'ID-KI'
			| 'ID-KR'
			| 'ID-KS'
			| 'ID-KT'
			| 'ID-KU'
			| 'ID-LA'
			| 'ID-MA'
			| 'ID-MU'
			| 'ID-NB'
			| 'ID-NT'
			| 'ID-PA'
			| 'ID-PB'
			| 'ID-RI'
			| 'ID-SA'
			| 'ID-SB'
			| 'ID-SG'
			| 'ID-SN'
			| 'ID-SR'
			| 'ID-SS'
			| 'ID-ST'
			| 'ID-SU'
			| 'ID-YO'
			| 'MY-01'
			| 'MY-02'
			| 'MY-03'
			| 'MY-04'
			| 'MY-05'
			| 'MY-06'
			| 'MY-07'
			| 'MY-08'
			| 'MY-09'
			| 'MY-10'
			| 'MY-11'
			| 'MY-12'
			| 'MY-13'
			| 'MY-14'
			| 'MY-15'
			| 'MY-16'
			| 'VN-01'
			| 'VN-02'
			| 'VN-03'
			| 'VN-04'
			| 'VN-05'
			| 'VN-06'
			| 'VN-07'
			| 'VN-09'
			| 'VN-13'
			| 'VN-14'
			| 'VN-18'
			| 'VN-20'
			| 'VN-21'
			| 'VN-22'
			| 'VN-23'
			| 'VN-24'
			| 'VN-25'
			| 'VN-26'
			| 'VN-27'
			| 'VN-28'
			| 'VN-29'
			| 'VN-30'
			| 'VN-31'
			| 'VN-32'
			| 'VN-33'
			| 'VN-34'
			| 'VN-35'
			| 'VN-36'
			| 'VN-37'
			| 'VN-39'
			| 'VN-40'
			| 'VN-41'
			| 'VN-43'
			| 'VN-44'
			| 'VN-45'
			| 'VN-46'
			| 'VN-47'
			| 'VN-49'
			| 'VN-50'
			| 'VN-51'
			| 'VN-52'
			| 'VN-53'
			| 'VN-54'
			| 'VN-55'
			| 'VN-56'
			| 'VN-57'
			| 'VN-58'
			| 'VN-59'
			| 'VN-61'
			| 'VN-63'
			| 'VN-66'
			| 'VN-67'
			| 'VN-68'
			| 'VN-69'
			| 'VN-70'
			| 'VN-71'
			| 'VN-72'
			| 'VN-73'
			| 'VN-CT'
			| 'VN-DN'
			| 'VN-HN'
			| 'VN-HP'
			| 'VN-SG'
			| 'PH-00'
			| 'PH-ABR'
			| 'PH-AGN'
			| 'PH-AGS'
			| 'PH-AKL'
			| 'PH-ALB'
			| 'PH-ANT'
			| 'PH-APA'
			| 'PH-AUR'
			| 'PH-BAN'
			| 'PH-BAS'
			| 'PH-BEN'
			| 'PH-BIL'
			| 'PH-BOH'
			| 'PH-BTG'
			| 'PH-BTN'
			| 'PH-BUK'
			| 'PH-BUL'
			| 'PH-CAG'
			| 'PH-CAM'
			| 'PH-CAN'
			| 'PH-CAP'
			| 'PH-CAS'
			| 'PH-CAT'
			| 'PH-CAV'
			| 'PH-CEB'
			| 'PH-COM'
			| 'PH-DAO'
			| 'PH-DAS'
			| 'PH-DAV'
			| 'PH-DIN'
			| 'PH-DVO'
			| 'PH-EAS'
			| 'PH-GUI'
			| 'PH-IFU'
			| 'PH-ILI'
			| 'PH-ILN'
			| 'PH-ILS'
			| 'PH-ISA'
			| 'PH-KAL'
			| 'PH-LAG'
			| 'PH-LAN'
			| 'PH-LAS'
			| 'PH-LEY'
			| 'PH-LUN'
			| 'PH-MAD'
			| 'PH-MAG'
			| 'PH-MAS'
			| 'PH-MDC'
			| 'PH-MDR'
			| 'PH-MOU'
			| 'PH-MSC'
			| 'PH-MSR'
			| 'PH-NCO'
			| 'PH-NEC'
			| 'PH-NER'
			| 'PH-NSA'
			| 'PH-NUE'
			| 'PH-NUV'
			| 'PH-PAM'
			| 'PH-PAN'
			| 'PH-PLW'
			| 'PH-QUE'
			| 'PH-QUI'
			| 'PH-RIZ'
			| 'PH-ROM'
			| 'PH-SAR'
			| 'PH-SCO'
			| 'PH-SIG'
			| 'PH-SLE'
			| 'PH-SLU'
			| 'PH-SOR'
			| 'PH-SUK'
			| 'PH-SUN'
			| 'PH-SUR'
			| 'PH-TAR'
			| 'PH-TAW'
			| 'PH-WSA'
			| 'PH-ZAN'
			| 'PH-ZAS'
			| 'PH-ZMB'
			| 'PH-ZSI'
		>;

		/** Specifies which IP addresses determine the user's location. Default: "BOTH". */
		checkIps?: 'BOTH' | 'CONNECTING' | 'HEADERS';

		/**
		 * When connecting via a proxy server as determined by the `X-Forwarded-For` header, enabling this option
		 * matches the end client specified in the header. Disabling it matches the connecting client's IP address.
		 * Default: false.
		 */
		useOnlyFirstXForwardedForIp?: boolean;
	}): Property {
		if (typeof params.field === 'undefined') {
			params.field = 'COUNTRY';
		}

		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (typeof params.checkIps === 'undefined') {
			params.checkIps = 'BOTH';
		}

		if (
			typeof params.useOnlyFirstXForwardedForIp === 'undefined' &&
			params.checkIps !== undefined &&
			['BOTH', 'HEADERS'].includes(params.checkIps)
		) {
			params.useOnlyFirstXForwardedForIp = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'userLocation', {}, params));
	}

	/**
	 * Matches details of the network over which the request was made, determined by looking up the IP address in a
	 * database.
	 *
	 * @param {object} params - The parameters needed to configure onUserNetwork
	 * @param {'NETWORK' | 'NETWORK_TYPE' | 'BANDWIDTH'} [params.field] - The type of information to match. Default:
	 *   "NETWORK".
	 * @param {'IS_ONE_OF' | 'IS_NOT_ONE_OF'} [params.matchOperator] - Matches the specified set of values when set to
	 *   `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match. Default: "IS_ONE_OF".
	 * @param {('CABLE' | 'DIALUP' | 'DSL' | 'FIOS' | 'ISDN' | 'MOBILE' | 'UVERSE')[]} [params.networkTypeValues] -
	 *   Specifies the basic type of network.
	 * @param {(
	 * 	| 'AIRTEL'
	 * 	| 'ALPHA_INTERNET'
	 * 	| 'ALTITUDE_TELECOM'
	 * 	| 'AOL'
	 * 	| 'ARNET'
	 * 	| 'ASAHI'
	 * 	| 'ATT'
	 * 	| 'AWS'
	 * 	| 'BELL_CANADA'
	 * 	| 'BELLALIANT'
	 * 	| 'BIGLOBE'
	 * 	| 'BITMAILER'
	 * 	| 'BOUYGUES'
	 * 	| 'BRIGHT_HOUSE'
	 * 	| 'BSKYB'
	 * 	| 'BT'
	 * 	| 'CABLEONE'
	 * 	| 'CABLEVISION'
	 * 	| 'CERNET'
	 * 	| 'CHARTER'
	 * 	| 'CHINA_MOBILE'
	 * 	| 'CHINANET'
	 * 	| 'CHINA_UNICOM'
	 * 	| 'CLEARWIRE'
	 * 	| 'COGECO'
	 * 	| 'COLOCROSSING'
	 * 	| 'COLT'
	 * 	| 'COMCAST'
	 * 	| 'COMPLETEL'
	 * 	| 'COMPUSERVE'
	 * 	| 'COVAD'
	 * 	| 'DION'
	 * 	| 'DIRECTV'
	 * 	| 'DREAMNET'
	 * 	| 'DTAG'
	 * 	| 'DTI'
	 * 	| 'EARTHLINK'
	 * 	| 'EASYNET'
	 * 	| 'EITC'
	 * 	| 'ETISALAT'
	 * 	| 'EUROCIBER'
	 * 	| 'FASTWEB'
	 * 	| 'FIBERTEL'
	 * 	| 'FRANCE_TELECOM'
	 * 	| 'FREE'
	 * 	| 'FREECOM'
	 * 	| 'FRONTIER'
	 * 	| 'GOOGLECLOUD'
	 * 	| 'H3G'
	 * 	| 'HINET'
	 * 	| 'IBM'
	 * 	| 'IDECNET'
	 * 	| 'IIJ4U'
	 * 	| 'INFOSPHERE'
	 * 	| 'JANET'
	 * 	| 'JAZZTELL'
	 * 	| 'JUSTNET'
	 * 	| 'LIVEDOOR'
	 * 	| 'MCI'
	 * 	| 'MEDIACOM'
	 * 	| 'MEDIA_ONE'
	 * 	| 'MICROSOFT'
	 * 	| 'MIL'
	 * 	| '@NIFTY'
	 * 	| 'NERIM'
	 * 	| 'NEWNET'
	 * 	| 'NUMERICABLE'
	 * 	| 'OCN'
	 * 	| 'ODN'
	 * 	| 'ONO'
	 * 	| 'PANASONIC_HI_HO'
	 * 	| 'PLALA'
	 * 	| 'PLUSNET'
	 * 	| 'PRODIGY'
	 * 	| 'QWEST'
	 * 	| 'RCN'
	 * 	| 'REDIRIS'
	 * 	| 'RENATER'
	 * 	| 'RETEVISION'
	 * 	| 'ROAD_RUNNER'
	 * 	| 'ROGERS'
	 * 	| 'SASKTEL'
	 * 	| 'SEEDNET'
	 * 	| 'SEIKYO_INTERNET'
	 * 	| 'SFR'
	 * 	| 'SHAW'
	 * 	| 'SO_NET'
	 * 	| 'SOFTLAYER'
	 * 	| 'SPRINT'
	 * 	| 'SUDDENLINK'
	 * 	| 'TALKTALK'
	 * 	| 'TEKSAAVY'
	 * 	| 'TELEFONICA'
	 * 	| 'TELSTRA'
	 * 	| 'TERRA_MEXICO'
	 * 	| 'TI'
	 * 	| 'TIKITIKI'
	 * 	| 'TIME_WARNER'
	 * 	| 'TISCALI'
	 * 	| 'T_MOBILE'
	 * 	| 'TURK_TELEKOM'
	 * 	| 'UNI2'
	 * 	| 'UNINET'
	 * 	| 'UPC'
	 * 	| 'USEMB'
	 * 	| 'UUNET'
	 * 	| 'VERIZON'
	 * 	| 'VIRGIN_MEDIA'
	 * 	| 'VODAFONE'
	 * 	| 'WAKWAK'
	 * 	| 'WIND'
	 * 	| 'WINDSTREAM'
	 * 	| 'ZERO'
	 * 	| 'RESERVED'
	 * )[]} [params.networkValues]
	 *   - Any set of specific networks.
	 *
	 * @param {('1' | '57' | '257' | '1000' | '2000' | '5000')[]} [params.bandwidthValues] - Bandwidth range in bits per
	 *   second, either `1`, `57`, `257`, `1000`, `2000`, or `5000`.
	 * @param {'BOTH' | 'CONNECTING' | 'HEADERS'} [params.checkIps] - Specifies which IP addresses determine the user's
	 *   network. Default: "BOTH".
	 * @param {boolean} [params.useOnlyFirstXForwardedForIp] - When connecting via a proxy server as determined by the
	 *   `X-Forwarded-For` header, enabling this option matches the end client specified in the header. Disabling it
	 *   matches the connecting client's IP address. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/user-network-data | Akamai Techdocs}
	 */
	onUserNetwork(params: {
		/** The type of information to match. Default: "NETWORK". */
		field?: 'NETWORK' | 'NETWORK_TYPE' | 'BANDWIDTH';

		/**
		 * Matches the specified set of values when set to `IS_ONE_OF`, otherwise `IS_NOT_ONE_OF` reverses the match.
		 * Default: "IS_ONE_OF".
		 */
		matchOperator?: 'IS_ONE_OF' | 'IS_NOT_ONE_OF';

		/** Specifies the basic type of network. */
		networkTypeValues?: Array<'CABLE' | 'DIALUP' | 'DSL' | 'FIOS' | 'ISDN' | 'MOBILE' | 'UVERSE'>;

		/** Any set of specific networks. */
		networkValues?: Array<
			| 'AIRTEL'
			| 'ALPHA_INTERNET'
			| 'ALTITUDE_TELECOM'
			| 'AOL'
			| 'ARNET'
			| 'ASAHI'
			| 'ATT'
			| 'AWS'
			| 'BELL_CANADA'
			| 'BELLALIANT'
			| 'BIGLOBE'
			| 'BITMAILER'
			| 'BOUYGUES'
			| 'BRIGHT_HOUSE'
			| 'BSKYB'
			| 'BT'
			| 'CABLEONE'
			| 'CABLEVISION'
			| 'CERNET'
			| 'CHARTER'
			| 'CHINA_MOBILE'
			| 'CHINANET'
			| 'CHINA_UNICOM'
			| 'CLEARWIRE'
			| 'COGECO'
			| 'COLOCROSSING'
			| 'COLT'
			| 'COMCAST'
			| 'COMPLETEL'
			| 'COMPUSERVE'
			| 'COVAD'
			| 'DION'
			| 'DIRECTV'
			| 'DREAMNET'
			| 'DTAG'
			| 'DTI'
			| 'EARTHLINK'
			| 'EASYNET'
			| 'EITC'
			| 'ETISALAT'
			| 'EUROCIBER'
			| 'FASTWEB'
			| 'FIBERTEL'
			| 'FRANCE_TELECOM'
			| 'FREE'
			| 'FREECOM'
			| 'FRONTIER'
			| 'GOOGLECLOUD'
			| 'H3G'
			| 'HINET'
			| 'IBM'
			| 'IDECNET'
			| 'IIJ4U'
			| 'INFOSPHERE'
			| 'JANET'
			| 'JAZZTELL'
			| 'JUSTNET'
			| 'LIVEDOOR'
			| 'MCI'
			| 'MEDIACOM'
			| 'MEDIA_ONE'
			| 'MICROSOFT'
			| 'MIL'
			| '@NIFTY'
			| 'NERIM'
			| 'NEWNET'
			| 'NUMERICABLE'
			| 'OCN'
			| 'ODN'
			| 'ONO'
			| 'PANASONIC_HI_HO'
			| 'PLALA'
			| 'PLUSNET'
			| 'PRODIGY'
			| 'QWEST'
			| 'RCN'
			| 'REDIRIS'
			| 'RENATER'
			| 'RETEVISION'
			| 'ROAD_RUNNER'
			| 'ROGERS'
			| 'SASKTEL'
			| 'SEEDNET'
			| 'SEIKYO_INTERNET'
			| 'SFR'
			| 'SHAW'
			| 'SO_NET'
			| 'SOFTLAYER'
			| 'SPRINT'
			| 'SUDDENLINK'
			| 'TALKTALK'
			| 'TEKSAAVY'
			| 'TELEFONICA'
			| 'TELSTRA'
			| 'TERRA_MEXICO'
			| 'TI'
			| 'TIKITIKI'
			| 'TIME_WARNER'
			| 'TISCALI'
			| 'T_MOBILE'
			| 'TURK_TELEKOM'
			| 'UNI2'
			| 'UNINET'
			| 'UPC'
			| 'USEMB'
			| 'UUNET'
			| 'VERIZON'
			| 'VIRGIN_MEDIA'
			| 'VODAFONE'
			| 'WAKWAK'
			| 'WIND'
			| 'WINDSTREAM'
			| 'ZERO'
			| 'RESERVED'
		>;

		/** Bandwidth range in bits per second, either `1`, `57`, `257`, `1000`, `2000`, or `5000`. */
		bandwidthValues?: Array<'1' | '57' | '257' | '1000' | '2000' | '5000'>;

		/** Specifies which IP addresses determine the user's network. Default: "BOTH". */
		checkIps?: 'BOTH' | 'CONNECTING' | 'HEADERS';

		/**
		 * When connecting via a proxy server as determined by the `X-Forwarded-For` header, enabling this option
		 * matches the end client specified in the header. Disabling it matches the connecting client's IP address.
		 * Default: false.
		 */
		useOnlyFirstXForwardedForIp?: boolean;
	}): Property {
		if (typeof params.field === 'undefined') {
			params.field = 'NETWORK';
		}

		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (typeof params.checkIps === 'undefined') {
			params.checkIps = 'BOTH';
		}

		if (
			typeof params.useOnlyFirstXForwardedForIp === 'undefined' &&
			params.checkIps !== undefined &&
			['BOTH', 'HEADERS'].includes(params.checkIps)
		) {
			params.useOnlyFirstXForwardedForIp = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'userNetwork', {}, params));
	}

	/**
	 * Matches how the current rule corresponds to low-level syntax elements in translated XML metadata, indicating
	 * progressive stages as each edge server handles the request and response. To use this match, you need to be
	 * thoroughly familiar with how Akamai edge servers process requests. Contact your Akamai Technical representative
	 * if you need help, and test thoroughly on staging before activating on production.
	 *
	 * @param {object} params - The parameters needed to configure onMetadataStage
	 * @param {'IS' | 'IS_NOT'} [params.matchOperator] - Compares the current rule with the specified metadata stage.
	 *   Default: "IS".
	 * @param {'cache-hit'
	 * 	| 'client-done'
	 * 	| 'client-request'
	 * 	| 'client-request-body'
	 * 	| 'client-response'
	 * 	| 'content-policy'
	 * 	| 'forward-request'
	 * 	| 'forward-response'
	 * 	| 'forward-start'
	 * 	| 'ipa-response'} [params.value]
	 *   - Specifies the metadata stage. Default: "client-request".
	 *
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/metadata-stage | Akamai Techdocs}
	 */
	onMetadataStage(params: {
		/** Compares the current rule with the specified metadata stage. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT';

		/** Specifies the metadata stage. Default: "client-request". */
		value?:
			| 'cache-hit'
			| 'client-done'
			| 'client-request'
			| 'client-request-body'
			| 'client-response'
			| 'content-policy'
			| 'forward-request'
			| 'forward-response'
			| 'forward-start'
			| 'ipa-response';
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		if (typeof params.value === 'undefined') {
			params.value = 'client-request';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'metadataStage', {}, params));
	}

	/**
	 * Matches a regular expression against a string, especially to apply behaviors flexibly based on the contents of
	 * dynamic [variables](ref:variables).
	 *
	 * @param {object} params - The parameters needed to configure onRegularExpression
	 * @param {string} [params.matchString] - The string to match, typically the contents of a dynamic variable.
	 *   Default: "". PM variables may appear between '{{' and '}}'.
	 * @param {string} [params.regex] - The regular expression (PCRE) to match against the string. Default: "".
	 * @param {boolean} [params.caseSensitive] - Sets a case-sensitive regular expression match. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/regex | Akamai Techdocs}
	 */
	onRegularExpression(params: {
		/**
		 * The string to match, typically the contents of a dynamic variable. Default: "". PM variables may appear
		 * between '{{' and '}}'.
		 */
		matchString?: string;

		/** The regular expression (PCRE) to match against the string. Default: "". */
		regex?: string;

		/** Sets a case-sensitive regular expression match. Default: true. */
		caseSensitive?: boolean;
	}): Property {
		if (typeof params.matchString === 'undefined') {
			params.matchString = '';
		}

		if (typeof params.regex === 'undefined') {
			params.regex = '';
		}

		if (typeof params.caseSensitive === 'undefined') {
			params.caseSensitive = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('CRITERIA', 'regularExpression', {allowsVars: ['matchString']}, params),
		);
	}

	/**
	 * Matches the basic type of request. To use this match, you need to be thoroughly familiar with how Akamai edge
	 * servers process requests. Contact your Akamai Technical representative if you need help, and test thoroughly on
	 * staging before activating on production.
	 *
	 * @param {object} params - The parameters needed to configure onRequestType
	 * @param {'IS' | 'IS_NOT'} [params.matchOperator] - Specifies whether the request `IS` or `IS_NOT` the type of
	 *   specified `value`. Default: "IS".
	 * @param {'CLIENT_REQ' | 'ESI_FRAGMENT' | 'EW_SUBREQUEST'} [params.value] - Specifies the type of request, either a
	 *   standard `CLIENT_REQ`, an `ESI_FRAGMENT`, or an `EW_SUBREQUEST`. Default: "CLIENT_REQ".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/req-type | Akamai Techdocs}
	 */
	onRequestType(params: {
		/** Specifies whether the request `IS` or `IS_NOT` the type of specified `value`. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT';

		/**
		 * Specifies the type of request, either a standard `CLIENT_REQ`, an `ESI_FRAGMENT`, or an `EW_SUBREQUEST`.
		 * Default: "CLIENT_REQ".
		 */
		value?: 'CLIENT_REQ' | 'ESI_FRAGMENT' | 'EW_SUBREQUEST';
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		if (typeof params.value === 'undefined') {
			params.value = 'CLIENT_REQ';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'requestType', {}, params));
	}

	/**
	 * Checks the EdgeWorkers execution status and detects whether a customer's JavaScript failed on edge servers.
	 *
	 * @param {object} params - The parameters needed to configure onEdgeWorkersFailure
	 * @param {'FAILURE' | 'SUCCESS'} [params.execStatus] - Specify execution status. Default: "FAILURE".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/edge-workers-failure | Akamai Techdocs}
	 */
	onEdgeWorkersFailure(params: {
		/** Specify execution status. Default: "FAILURE". */
		execStatus?: 'FAILURE' | 'SUCCESS';
	}): Property {
		if (typeof params.execStatus === 'undefined') {
			params.execStatus = 'FAILURE';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'edgeWorkersFailure', {}, params));
	}

	/**
	 * Match various aspects of the device or browser making the request. Based on the value of the `characteristic`
	 * option, the expected value is either a boolean, a number, or a string, possibly representing a version number.
	 * Each type of value requires a different field.
	 *
	 * @param {object} params - The parameters needed to configure onDeviceCharacteristic
	 * @param {'BRAND_NAME'
	 * 	| 'MODEL_NAME'
	 * 	| 'MARKETING_NAME'
	 * 	| 'IS_WIRELESS_DEVICE'
	 * 	| 'IS_TABLET'
	 * 	| 'DEVICE_OS'
	 * 	| 'DEVICE_OS_VERSION'
	 * 	| 'MOBILE_BROWSER'
	 * 	| 'MOBILE_BROWSER_VERSION'
	 * 	| 'RESOLUTION_WIDTH'
	 * 	| 'RESOLUTION_HEIGHT'
	 * 	| 'PHYSICAL_SCREEN_HEIGHT'
	 * 	| 'PHYSICAL_SCREEN_WIDTH'
	 * 	| 'COOKIE_SUPPORT'
	 * 	| 'AJAX_SUPPORT_JAVASCRIPT'
	 * 	| 'FULL_FLASH_SUPPORT'
	 * 	| 'ACCEPT_THIRD_PARTY_COOKIE'
	 * 	| 'XHTML_SUPPORT_LEVEL'
	 * 	| 'IS_MOBILE'} [params.characteristic]
	 *   - Aspect of the device or browser to match. Default: "IS_WIRELESS_DEVICE".
	 *
	 * @param {'MATCHES_ONE_OF' | 'DOES_NOT_MATCH_ONE_OF'} [params.stringMatchOperator] - When the `characteristic`
	 *   expects a string value, set this to `MATCHES_ONE_OF` to match against the `stringValue` set, otherwise set to
	 *   `DOES_NOT_MATCH_ONE_OF` to exclude that set of values. Default: "MATCHES_ONE_OF".
	 * @param {'IS'
	 * 	| 'IS_NOT'
	 * 	| 'IS_LESS_THAN'
	 * 	| 'IS_LESS_THAN_OR_EQUAL'
	 * 	| 'IS_MORE_THAN'
	 * 	| 'IS_MORE_THAN_OR_EQUAL'} [params.numericMatchOperator]
	 *   - When the `characteristic` expects a numeric value, compares the specified `numericValue` against the matched
	 *       client. Default: "IS".
	 *
	 * @param {'IS'
	 * 	| 'IS_NOT'
	 * 	| 'IS_LESS_THAN'
	 * 	| 'IS_LESS_THAN_OR_EQUAL'
	 * 	| 'IS_MORE_THAN'
	 * 	| 'IS_MORE_THAN_OR_EQUAL'} [params.versionMatchOperator]
	 *   - When the `characteristic` expects a version string value, compares the specified `versionValue` against the
	 *       matched client, using the following operators: `IS`, `IS_MORE_THAN_OR_EQUAL`, `IS_MORE_THAN`,
	 *       `IS_LESS_THAN_OR_EQUAL`, `IS_LESS_THAN`, `IS_NOT`. Default: "IS".
	 *
	 * @param {boolean} [params.booleanValue] - When the `characteristic` expects a boolean value, this specifies the
	 *   value. Default: true.
	 * @param {string[]} [params.stringValue] - When the `characteristic` expects a string, this specifies the set of
	 *   values.
	 * @param {number} [params.numericValue] - When the `characteristic` expects a numeric value, this specifies the
	 *   number.
	 * @param {string} [params.versionValue] - When the `characteristic` expects a version number, this specifies it as
	 *   a string.
	 * @param {boolean} [params.matchCaseSensitive] - Sets a case-sensitive match for the `stringValue` field. Default:
	 *   false.
	 * @param {boolean} [params.matchWildcard] - Allows wildcards in the `stringValue` field, where `?` matches a single
	 *   character and `*` matches zero or more characters. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/device-charac | Akamai Techdocs}
	 */
	onDeviceCharacteristic(params: {
		/** Aspect of the device or browser to match. Default: "IS_WIRELESS_DEVICE". */
		characteristic?:
			| 'BRAND_NAME'
			| 'MODEL_NAME'
			| 'MARKETING_NAME'
			| 'IS_WIRELESS_DEVICE'
			| 'IS_TABLET'
			| 'DEVICE_OS'
			| 'DEVICE_OS_VERSION'
			| 'MOBILE_BROWSER'
			| 'MOBILE_BROWSER_VERSION'
			| 'RESOLUTION_WIDTH'
			| 'RESOLUTION_HEIGHT'
			| 'PHYSICAL_SCREEN_HEIGHT'
			| 'PHYSICAL_SCREEN_WIDTH'
			| 'COOKIE_SUPPORT'
			| 'AJAX_SUPPORT_JAVASCRIPT'
			| 'FULL_FLASH_SUPPORT'
			| 'ACCEPT_THIRD_PARTY_COOKIE'
			| 'XHTML_SUPPORT_LEVEL'
			| 'IS_MOBILE';

		/**
		 * When the `characteristic` expects a string value, set this to `MATCHES_ONE_OF` to match against the
		 * `stringValue` set, otherwise set to `DOES_NOT_MATCH_ONE_OF` to exclude that set of values. Default:
		 * "MATCHES_ONE_OF".
		 */
		stringMatchOperator?: 'MATCHES_ONE_OF' | 'DOES_NOT_MATCH_ONE_OF';

		/**
		 * When the `characteristic` expects a numeric value, compares the specified `numericValue` against the matched
		 * client. Default: "IS".
		 */
		numericMatchOperator?:
			| 'IS'
			| 'IS_NOT'
			| 'IS_LESS_THAN'
			| 'IS_LESS_THAN_OR_EQUAL'
			| 'IS_MORE_THAN'
			| 'IS_MORE_THAN_OR_EQUAL';

		/**
		 * When the `characteristic` expects a version string value, compares the specified `versionValue` against the
		 * matched client, using the following operators: `IS`, `IS_MORE_THAN_OR_EQUAL`, `IS_MORE_THAN`,
		 * `IS_LESS_THAN_OR_EQUAL`, `IS_LESS_THAN`, `IS_NOT`. Default: "IS".
		 */
		versionMatchOperator?:
			| 'IS'
			| 'IS_NOT'
			| 'IS_LESS_THAN'
			| 'IS_LESS_THAN_OR_EQUAL'
			| 'IS_MORE_THAN'
			| 'IS_MORE_THAN_OR_EQUAL';

		/** When the `characteristic` expects a boolean value, this specifies the value. Default: true. */
		booleanValue?: boolean;

		/** When the `characteristic` expects a string, this specifies the set of values. */
		stringValue?: string[];

		/** When the `characteristic` expects a numeric value, this specifies the number. */
		numericValue?: number;

		/** When the `characteristic` expects a version number, this specifies it as a string. */
		versionValue?: string;

		/** Sets a case-sensitive match for the `stringValue` field. Default: false. */
		matchCaseSensitive?: boolean;

		/**
		 * Allows wildcards in the `stringValue` field, where `?` matches a single character and `*` matches zero or
		 * more characters. Default: true.
		 */
		matchWildcard?: boolean;
	}): Property {
		if (typeof params.characteristic === 'undefined') {
			params.characteristic = 'IS_WIRELESS_DEVICE';
		}

		if (
			typeof params.stringMatchOperator === 'undefined' &&
			params.characteristic !== undefined &&
			[
				'BRAND_NAME',
				'MODEL_NAME',
				'MARKETING_NAME',
				'DEVICE_OS',
				'MOBILE_BROWSER',
				'PREFERRED_MARKUP',
				'HTML_PREFERRED_DTD',
				'XHTML_PREFERRED_CHARSET',
				'VIEWPORT_WIDTH',
				'XHTMLMP_PREFERRED_MIME_TYPE',
				'AJAX_PREFERRED_GEOLOC_API',
				'XHTML_FILE_UPLOAD',
				'XHTML_SUPPORTS_IFRAME',
				'FLASH_LITE_VERSION',
			].includes(params.characteristic)
		) {
			params.stringMatchOperator = 'MATCHES_ONE_OF';
		}

		if (
			typeof params.numericMatchOperator === 'undefined' &&
			params.characteristic !== undefined &&
			[
				'RESOLUTION_WIDTH',
				'RESOLUTION_HEIGHT',
				'PHYSICAL_SCREEN_HEIGHT',
				'PHYSICAL_SCREEN_WIDTH',
				'XHTML_SUPPORT_LEVEL',
				'MAX_IMAGE_WIDTH',
				'MAX_IMAGE_HEIGHT',
				'VIEWPORT_INITIAL_SCALE',
			].includes(params.characteristic)
		) {
			params.numericMatchOperator = 'IS';
		}

		if (
			typeof params.versionMatchOperator === 'undefined' &&
			params.characteristic !== undefined &&
			['DEVICE_OS_VERSION', 'MOBILE_BROWSER_VERSION'].includes(params.characteristic)
		) {
			params.versionMatchOperator = 'IS';
		}

		if (
			typeof params.booleanValue === 'undefined' &&
			params.characteristic !== undefined &&
			[
				'IS_WIRELESS_DEVICE',
				'IS_TABLET',
				'COOKIE_SUPPORT',
				'AJAX_SUPPORT_JAVASCRIPT',
				'FULL_FLASH_SUPPRT',
				'DUAL_ORIENTATION',
				'ACCEPT_THIRD_PARTY_COOKIE',
				'GIF_ANIMATED',
				'JPG',
				'PNG',
				'XHTML_SUPPORTS_TABLE_FOR_LAYOUT',
				'XHTML_TABLE_SUPPORT',
				'PDF_SUPPORT',
				'IS_MOBILE',
			].includes(params.characteristic)
		) {
			params.booleanValue = true;
		}

		if (
			typeof params.matchCaseSensitive === 'undefined' &&
			params.stringMatchOperator !== undefined &&
			['MATCHES_ONE_OF', 'DOES_NOT_MATCH_ONE_OF'].includes(params.stringMatchOperator)
		) {
			params.matchCaseSensitive = false;
		}

		if (
			typeof params.matchWildcard === 'undefined' &&
			params.stringMatchOperator !== undefined &&
			['MATCHES_ONE_OF', 'DOES_NOT_MATCH_ONE_OF'].includes(params.stringMatchOperator)
		) {
			params.matchWildcard = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'deviceCharacteristic', {}, params));
	}

	/**
	 * This matches a specified percentage of requests when used with the accompanying behavior. Contact Akamai
	 * Professional Services for help configuring it.
	 *
	 * @param {object} params - The parameters needed to configure onBucket
	 * @param {number} [params.percentage] - Specifies the percentage of requests to match. Default: 100.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/percentage-clients | Akamai Techdocs}
	 */
	onBucket(params: {
		/** Specifies the percentage of requests to match. Default: 100. */
		percentage?: number;
	}): Property {
		if (typeof params.percentage === 'undefined') {
			params.percentage = 100;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'bucket', {}, params));
	}

	/**
	 * Matches whether the [`imageManager`](#) behavior already applies to the current set of requests.
	 *
	 * @param {object} params - The parameters needed to configure onAdvancedImMatch
	 * @param {'IS' | 'IS_NOT'} [params.matchOperator] - Specifies the match's logic. Default: "IS".
	 * @param {'ANY_IM' | 'PRISTINE'} [params.matchOn] - Specifies the match's scope. Default: "ANY_IM".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/img-video-manager | Akamai Techdocs}
	 */
	onAdvancedImMatch(params: {
		/** Specifies the match's logic. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT';

		/** Specifies the match's scope. Default: "ANY_IM". */
		matchOn?: 'ANY_IM' | 'PRISTINE';
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		if (typeof params.matchOn === 'undefined') {
			params.matchOn = 'ANY_IM';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'advancedImMatch', {}, params));
	}

	/**
	 * Matches when the origin responds with a timeout error.
	 *
	 * @param {object} params - The parameters needed to configure onOriginTimeout
	 * @param {'ORIGIN_TIMED_OUT'} [params.matchOperator] - Specifies a single required `ORIGIN_TIMED_OUT` value.
	 *   Default: "ORIGIN_TIMED_OUT".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/origin-timeout | Akamai Techdocs}
	 */
	onOriginTimeout(params: {
		/** Specifies a single required `ORIGIN_TIMED_OUT` value. Default: "ORIGIN_TIMED_OUT". */
		matchOperator?: 'ORIGIN_TIMED_OUT';
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'ORIGIN_TIMED_OUT';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('CRITERIA', 'originTimeout', {}, params));
	}

	/**
	 * Matches a built-in variable, or a custom variable pre-declared within the rule tree by the [`setVariable`](#)
	 * behavior. See [Support for variables](ref:variables) for more information on this feature.
	 *
	 * @param {object} params - The parameters needed to configure onMatchVariable
	 * @param {string} params.variableName - The name of the variable to match.
	 * @param {'IS'
	 * 	| 'IS_NOT'
	 * 	| 'IS_ONE_OF'
	 * 	| 'IS_NOT_ONE_OF'
	 * 	| 'IS_EMPTY'
	 * 	| 'IS_NOT_EMPTY'
	 * 	| 'IS_BETWEEN'
	 * 	| 'IS_NOT_BETWEEN'
	 * 	| 'IS_GREATER_THAN'
	 * 	| 'IS_GREATER_THAN_OR_EQUAL_TO'
	 * 	| 'IS_LESS_THAN'
	 * 	| 'IS_LESS_THAN_OR_EQUAL_TO'} [params.matchOperator]
	 *   - The type of match, based on which you use different options to specify the match criteria. Default: "IS_ONE_OF".
	 *
	 * @param {string[]} [params.variableValues] - Specifies an array of matching strings.
	 * @param {string} [params.variableExpression] - Specifies a single matching string. PM variables may appear between
	 *   '{{' and '}}'.
	 * @param {string} [params.lowerBound] - Specifies the range's numeric minimum value.
	 * @param {string} [params.upperBound] - Specifies the range's numeric maximum value.
	 * @param {boolean} [params.matchWildcard] - When matching string expressions, enabling this allows wildcards, where
	 *   `?` matches a single character and `*` matches zero or more characters. Default: false.
	 * @param {boolean} [params.matchCaseSensitive] - When matching string expressions, enabling this performs a
	 *   case-sensitive match. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/var | Akamai Techdocs}
	 */
	onMatchVariable(params: {
		/** The name of the variable to match. */
		variableName: string;

		/**
		 * The type of match, based on which you use different options to specify the match criteria. Default:
		 * "IS_ONE_OF".
		 */
		matchOperator?:
			| 'IS'
			| 'IS_NOT'
			| 'IS_ONE_OF'
			| 'IS_NOT_ONE_OF'
			| 'IS_EMPTY'
			| 'IS_NOT_EMPTY'
			| 'IS_BETWEEN'
			| 'IS_NOT_BETWEEN'
			| 'IS_GREATER_THAN'
			| 'IS_GREATER_THAN_OR_EQUAL_TO'
			| 'IS_LESS_THAN'
			| 'IS_LESS_THAN_OR_EQUAL_TO';

		/** Specifies an array of matching strings. */
		variableValues?: string[];

		/** Specifies a single matching string. PM variables may appear between '{{' and '}}'. */
		variableExpression?: string;

		/** Specifies the range's numeric minimum value. */
		lowerBound?: string;

		/** Specifies the range's numeric maximum value. */
		upperBound?: string;

		/**
		 * When matching string expressions, enabling this allows wildcards, where `?` matches a single character and
		 * `*` matches zero or more characters. Default: false.
		 */
		matchWildcard?: boolean;

		/** When matching string expressions, enabling this performs a case-sensitive match. Default: true. */
		matchCaseSensitive?: boolean;
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS_ONE_OF';
		}

		if (
			typeof params.matchWildcard === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS', 'IS_NOT', 'IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.matchWildcard = false;
		}

		if (
			typeof params.matchCaseSensitive === 'undefined' &&
			params.matchOperator !== undefined &&
			['IS', 'IS_NOT', 'IS_ONE_OF', 'IS_NOT_ONE_OF'].includes(params.matchOperator)
		) {
			params.matchCaseSensitive = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'CRITERIA',
				'matchVariable',
				{allowsVars: ['variableExpression'], variable: ['variableName']},
				params,
			),
		);
	}

	/**
	 * Matches any runtime errors that occur on edge servers based on the configuration of a [`setVariable`](#)
	 * behavior. See [Support for variables](ref:variables) section for more information on this feature.
	 *
	 * @param {object} params - The parameters needed to configure onVariableError
	 * @param {boolean} [params.result] - Matches errors for the specified set of `variableNames`, otherwise matches
	 *   errors from variables outside that set. Default: true.
	 * @param {string[]} params.variableNames - The name of the variable whose error triggers the match, or a space- or
	 *   comma-delimited list of more than one variable name. Note that if you define a variable named `VAR`, the name
	 *   in this field needs to appear with its added prefix as `PMUSER_VAR`. When such a variable is inserted into
	 *   other fields, it appears with an additional namespace as `{{user.PMUSER_VAR}}`. See the [`setVariable`](#)
	 *   behavior for details on variable names.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/var-err | Akamai Techdocs}
	 */
	onVariableError(params: {
		/**
		 * Matches errors for the specified set of `variableNames`, otherwise matches errors from variables outside that
		 * set. Default: true.
		 */
		result?: boolean;

		/**
		 * The name of the variable whose error triggers the match, or a space- or comma-delimited list of more than one
		 * variable name. Note that if you define a variable named `VAR`, the name in this field needs to appear with
		 * its added prefix as `PMUSER_VAR`. When such a variable is inserted into other fields, it appears with an
		 * additional namespace as `{{user.PMUSER_VAR}}`. See the [`setVariable`](#) behavior for details on variable
		 * names.
		 */
		variableNames: string[];
	}): Property {
		if (typeof params.result === 'undefined') {
			params.result = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('CRITERIA', 'variableError', {variableList: ['variableNames']}, params),
		);
	}

	/**
	 * Helps to customize the requests identified by the [`virtualWaitingRoom`](#) behavior. Use this match criteria to
	 * define the [`originServer`](#) behavior for the waiting room.
	 *
	 * @param {object} params - The parameters needed to configure onVirtualWaitingRoomRequest
	 * @param {'IS' | 'IS_NOT'} [params.matchOperator] - Specifies the match's logic. Default: "IS".
	 * @param {'WR_ANY' | 'WR_MAIN_PAGE' | 'WR_ASSETS'} [params.matchOn] - Specifies the type of request identified by
	 *   the [`virtualWaitingRoom`](#) behavior. Default: "WR_ANY".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/virtual-waiting-room-request | Akamai Techdocs}
	 */
	onVirtualWaitingRoomRequest(params: {
		/** Specifies the match's logic. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT';

		/** Specifies the type of request identified by the [`virtualWaitingRoom`](#) behavior. Default: "WR_ANY". */
		matchOn?: 'WR_ANY' | 'WR_MAIN_PAGE' | 'WR_ASSETS';
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		if (typeof params.matchOn === 'undefined') {
			params.matchOn = 'WR_ANY';
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('CRITERIA', 'virtualWaitingRoomRequest', {}, params),
		);
	}

	/**
	 * Helps to customize the requests identified by the [`visitorPrioritizationFifo`](#) behavior. The basic use case
	 * for this match criteria is to define the [`originServer`](#) behavior for the waiting room.
	 *
	 * @param {object} params - The parameters needed to configure onVisitorPrioritizationRequest
	 * @param {'IS' | 'IS_NOT'} [params.matchOperator] - Specifies the match's logic. Default: "IS".
	 * @param {'WR_ANY' | 'WR_MAIN_PAGE' | 'WR_ASSETS'} [params.matchOn] - Specifies the type of request identified by
	 *   the [`visitorPrioritizationFifo`](#) behavior. Default: "WR_ANY".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/matches | Akamai Techdocs}
	 */
	onVisitorPrioritizationRequest(params: {
		/** Specifies the match's logic. Default: "IS". */
		matchOperator?: 'IS' | 'IS_NOT';

		/** Specifies the type of request identified by the [`visitorPrioritizationFifo`](#) behavior. Default: "WR_ANY". */
		matchOn?: 'WR_ANY' | 'WR_MAIN_PAGE' | 'WR_ASSETS';
	}): Property {
		if (typeof params.matchOperator === 'undefined') {
			params.matchOperator = 'IS';
		}

		if (typeof params.matchOn === 'undefined') {
			params.matchOn = 'WR_ANY';
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('CRITERIA', 'visitorPrioritizationRequest', {}, params),
		);
	}

	/**
	 * This specifies Akamai XML metadata. It can only be configured on your behalf by Akamai Professional Services.
	 *
	 * @param {object} params - The parameters needed to configure setAdvanced
	 * @param {string} [params.description] - Human-readable description of what the XML block does.
	 * @param {string} params.xml - Akamai XML metadata.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/adv-beh | Akamai Techdocs}
	 */
	setAdvanced(params: {
		/** Human-readable description of what the XML block does. */
		description?: string;

		/** Akamai XML metadata. */
		xml: string;
	}): Property {
		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'advanced', {}, params));
	}

	/**
	 * This allows you to run regular expression substitutions over web pages. To apply this behavior, you need to match
	 * on a [`contentType`](#). Contact Akamai Professional Services for help configuring the Akamaizer. See also the
	 * [`akamaizerTag`](#) behavior.
	 *
	 * @param {object} params - The parameters needed to configure setAkamaizer
	 * @param {boolean} [params.enabled] - Enables the Akamaizer behavior. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/akamaizer | Akamai Techdocs}
	 */
	setAkamaizer(params: {
		/** Enables the Akamaizer behavior. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'akamaizer', {}, params));
	}

	/**
	 * This specifies HTML tags and replacement rules for hostnames used in conjunction with the [`akamaizer`](#)
	 * behavior. Contact Akamai Professional Services for help configuring the Akamaizer.
	 *
	 * @param {object} params - The parameters needed to configure setAkamaizerTag
	 * @param {string} params.matchHostname - Specifies the hostname to match on as a Perl-compatible regular
	 *   expression.
	 * @param {string} params.replacementHostname - Specifies the replacement hostname for the tag to use.
	 * @param {'ATTRIBUTE' | 'URL_ATTRIBUTE' | 'BLOCK' | 'PAGE'} [params.scope] - Specifies the part of HTML content the
	 *   `tagsAttribute` refers to. Default: "URL_ATTRIBUTE".
	 * @param {'A'
	 * 	| 'A_HREF'
	 * 	| 'IMG'
	 * 	| 'IMG_SRC'
	 * 	| 'SCRIPT'
	 * 	| 'SCRIPT_SRC'
	 * 	| 'LINK'
	 * 	| 'LINK_HREF'
	 * 	| 'TD'
	 * 	| 'TD_BACKGROUND'
	 * 	| 'TABLE'
	 * 	| 'TABLE_BACKGROUND'
	 * 	| 'IFRAME'
	 * 	| 'IFRAME_SRC'
	 * 	| 'AREA'
	 * 	| 'AREA_HREF'
	 * 	| 'BASE'
	 * 	| 'BASE_HREF'
	 * 	| 'FORM'
	 * 	| 'FORM_ACTION'} [params.tagsAttribute]
	 *   - Specifies the tag or tag/attribute combination to operate on. Default: "IMG_SRC".
	 *
	 * @param {boolean} [params.replaceAll] - Replaces all matches when enabled, otherwise replaces only the first
	 *   match. Default: false.
	 * @param {boolean} [params.includeTagsAttribute] - Whether to include the `tagsAttribute` value. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/akamaize-tag | Akamai Techdocs}
	 */
	setAkamaizerTag(params: {
		/** Specifies the hostname to match on as a Perl-compatible regular expression. */
		matchHostname: string;

		/** Specifies the replacement hostname for the tag to use. */
		replacementHostname: string;

		/** Specifies the part of HTML content the `tagsAttribute` refers to. Default: "URL_ATTRIBUTE". */
		scope?: 'ATTRIBUTE' | 'URL_ATTRIBUTE' | 'BLOCK' | 'PAGE';

		/** Specifies the tag or tag/attribute combination to operate on. Default: "IMG_SRC". */
		tagsAttribute?:
			| 'A'
			| 'A_HREF'
			| 'IMG'
			| 'IMG_SRC'
			| 'SCRIPT'
			| 'SCRIPT_SRC'
			| 'LINK'
			| 'LINK_HREF'
			| 'TD'
			| 'TD_BACKGROUND'
			| 'TABLE'
			| 'TABLE_BACKGROUND'
			| 'IFRAME'
			| 'IFRAME_SRC'
			| 'AREA'
			| 'AREA_HREF'
			| 'BASE'
			| 'BASE_HREF'
			| 'FORM'
			| 'FORM_ACTION';

		/** Replaces all matches when enabled, otherwise replaces only the first match. Default: false. */
		replaceAll?: boolean;

		/** Whether to include the `tagsAttribute` value. Default: true. */
		includeTagsAttribute?: boolean;
	}): Property {
		if (typeof params.scope === 'undefined') {
			params.scope = 'URL_ATTRIBUTE';
		}

		if (typeof params.tagsAttribute === 'undefined' && (params.scope as unknown) !== 'PAGE') {
			params.tagsAttribute = 'IMG_SRC';
		}

		if (typeof params.replaceAll === 'undefined') {
			params.replaceAll = false;
		}

		if (typeof params.includeTagsAttribute === 'undefined') {
			params.includeTagsAttribute = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'akamaizerTag', {}, params));
	}

	/**
	 * Allow all HTTP request methods to be used for the edge's parent servers, useful to implement features such as
	 * [Site Shield](https://techdocs.akamai.com/site-shield),
	 * [SureRoute](https://techdocs.akamai.com/api-acceleration/docs/setup-sureroute-test-object), and Tiered
	 * Distribution. (See the [`siteShield`](#), [`sureRoute`](#), and [`tieredDistribution`](#) behaviors.)
	 *
	 * @param {object} params - The parameters needed to configure setAllHttpInCacheHierarchy
	 * @param {boolean} [params.enabled] - Enables all HTTP requests for parent servers in the cache hierarchy. Default:
	 *   true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/allow-methods-parent-servers | Akamai Techdocs}
	 */
	setAllHttpInCacheHierarchy(params: {
		/** Enables all HTTP requests for parent servers in the cache hierarchy. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'allHttpInCacheHierarchy', {}, params),
		);
	}

	/**
	 * Allow HTTP requests using the DELETE method. By default, GET, HEAD, and OPTIONS requests are allowed, and all
	 * other methods result in a 501 error. Such content does not cache, and any DELETE requests pass to the origin. See
	 * also the [`allowOptions`](#), [`allowPatch`](#), [`allowPost`](#), and [`allowPut`](#) behaviors.
	 *
	 * @param {object} params - The parameters needed to configure setAllowDelete
	 * @param {boolean} [params.enabled] - Allows DELETE requests. Content does _not_ cache. Default: true.
	 * @param {boolean} [params.allowBody] - Allows data in the body of the DELETE request. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/allow-delete | Akamai Techdocs}
	 */
	setAllowDelete(params: {
		/** Allows DELETE requests. Content does _not_ cache. Default: true. */
		enabled?: boolean;

		/** Allows data in the body of the DELETE request. Default: false. */
		allowBody?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.allowBody === 'undefined' && (params.enabled as unknown) === true) {
			params.allowBody = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'allowDelete', {}, params));
	}

	/**
	 * GET, HEAD, and OPTIONS requests are allowed by default. All other HTTP methods result in a 501 error. For full
	 * support of Cross-Origin Resource Sharing (CORS), you need to allow requests that use the OPTIONS method. If
	 * you're using the [`corsSupport`](#) behavior, do not disable OPTIONS requests. The response to an OPTIONS request
	 * is not cached, so the request always goes through the Akamai network to your origin, unless you use the
	 * [`constructResponse`](#) behavior to send responses directly from the Akamai network. See also the
	 * [`allowDelete`](#), [`allowPatch`](#), [`allowPost`](#), and [`allowPut`](#) behaviors.
	 *
	 * @param {object} params - The parameters needed to configure setAllowOptions
	 * @param {boolean} [params.enabled] - Set this to `true` to reflect the default policy where edge servers allow the
	 *   OPTIONS method, without caching the response. Set this to `false` to deny OPTIONS requests and respond with a
	 *   501 error. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/allow-options | Akamai Techdocs}
	 */
	setAllowOptions(params: {
		/**
		 * Set this to `true` to reflect the default policy where edge servers allow the OPTIONS method, without caching
		 * the response. Set this to `false` to deny OPTIONS requests and respond with a 501 error. Default: true.
		 */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'allowOptions', {}, params));
	}

	/**
	 * Allow HTTP requests using the PATCH method. By default, GET, HEAD, and OPTIONS requests are allowed, and all
	 * other methods result in a 501 error. Such content does not cache, and any PATCH requests pass to the origin. See
	 * also the [`allowDelete`](#), [`allowOptions`](#), [`allowPost`](#), and [`allowPut`](#) behaviors.
	 *
	 * @param {object} params - The parameters needed to configure setAllowPatch
	 * @param {boolean} [params.enabled] - Allows PATCH requests. Content does _not_ cache. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/allow-patch | Akamai Techdocs}
	 */
	setAllowPatch(params: {
		/** Allows PATCH requests. Content does _not_ cache. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'allowPatch', {}, params));
	}

	/**
	 * Allow HTTP requests using the POST method. By default, GET, HEAD, and OPTIONS requests are allowed, and POST
	 * requests are denied with 403 error. All other methods result in a 501 error. See also the [`allowDelete`](#),
	 * [`allowOptions`](#), [`allowPatch`](#), and [`allowPut`](#) behaviors.
	 *
	 * @param {object} params - The parameters needed to configure setAllowPost
	 * @param {boolean} [params.enabled] - Allows POST requests. Default: true.
	 * @param {boolean} [params.allowWithoutContentLength] - By default, POST requests also require a `Content-Length`
	 *   header, or they result in a 411 error. With this option enabled with no specified `Content-Length`, the edge
	 *   server relies on a `Transfer-Encoding` header to chunk the data. If neither header is present, it assumes the
	 *   request has no body, and it adds a header with a `0` value to the forward request. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/allow-post | Akamai Techdocs}
	 */
	setAllowPost(params: {
		/** Allows POST requests. Default: true. */
		enabled?: boolean;

		/**
		 * By default, POST requests also require a `Content-Length` header, or they result in a 411 error. With this
		 * option enabled with no specified `Content-Length`, the edge server relies on a `Transfer-Encoding` header to
		 * chunk the data. If neither header is present, it assumes the request has no body, and it adds a header with a
		 * `0` value to the forward request. Default: false.
		 */
		allowWithoutContentLength?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.allowWithoutContentLength === 'undefined' && (params.enabled as unknown) === true) {
			params.allowWithoutContentLength = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'allowPost', {}, params));
	}

	/**
	 * Allow HTTP requests using the PUT method. By default, GET, HEAD, and OPTIONS requests are allowed, and all other
	 * methods result in a 501 error. Such content does not cache, and any PUT requests pass to the origin. See also the
	 * [`allowDelete`](#), [`allowOptions`](#), [`allowPatch`](#), and [`allowPost`](#) behaviors.
	 *
	 * @param {object} params - The parameters needed to configure setAllowPut
	 * @param {boolean} [params.enabled] - Allows PUT requests. Content does _not_ cache. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/allow-put | Akamai Techdocs}
	 */
	setAllowPut(params: {
		/** Allows PUT requests. Content does _not_ cache. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'allowPut', {}, params));
	}

	/**
	 * Sets the maximum age value for the Alternative Services (`Alt-Svc`) header.
	 *
	 * @param {object} params - The parameters needed to configure setAltSvcHeader
	 * @param {number} [params.maxAge] - Specifies the `max-age` value in seconds for the `Alt-Svc` header. The default
	 *   `max-age` for an `Alt-Svc` header is 93600 seconds (26 hours). Default: 93600.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/alt-svc-header | Akamai Techdocs}
	 */
	setAltSvcHeader(params: {
		/**
		 * Specifies the `max-age` value in seconds for the `Alt-Svc` header. The default `max-age` for an `Alt-Svc`
		 * header is 93600 seconds (26 hours). Default: 93600.
		 */
		maxAge?: number;
	}): Property {
		if (typeof params.maxAge === 'undefined') {
			params.maxAge = 93600;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'altSvcHeader', {}, params));
	}

	/**
	 * Prefix URLs sent to the origin with a base path. For example, with an origin of `example.com`, setting the
	 * `value` to `/images` sets the origin's base path to `example.com/images`. Any request for a `my_pics/home.jpg`
	 * file resolves on the origin server to `example.com/images/my_pics/home.jpg`. **Note:** - Changing the origin's
	 * base path also changes the cache key, which makes any existing cached data inaccessible. This causes a spike in
	 * traffic to your origin until the cache repopulates with fresh content. - You can't override the base path with
	 * other behaviors. For example, if in the [`rewriteUrl`](#) behavior you specify `targetPath` to `/gifs/hello.gif`,
	 * this gets appended to the base path: `example.com/images/gifs/hello.gif`.
	 *
	 * @param {object} params - The parameters needed to configure setBaseDirectory
	 * @param {string} params.value - Specifies the base path of content on your origin server. The value needs to begin
	 *   and end with a slash (`/`) character, for example `/parent/child/`. PM variables may appear between '{{' and
	 *   '}}'.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/origin-base-path | Akamai Techdocs}
	 */
	setBaseDirectory(params: {
		/**
		 * Specifies the base path of content on your origin server. The value needs to begin and end with a slash (`/`)
		 * character, for example `/parent/child/`. PM variables may appear between '{{' and '}}'.
		 */
		value: string;
	}): Property {
		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'baseDirectory', {allowsVars: ['value']}, params),
		);
	}

	/**
	 * Provides per-HTTP transaction visibility into a request for content, regardless of how deep the request goes into
	 * the Akamai platform. The `Akamai-Request-BC` response header includes various data, such as network health and
	 * the location in the Akamai network used to serve content, which simplifies log review for troubleshooting.
	 *
	 * @param {object} params - The parameters needed to configure setBreadcrumbs
	 * @param {boolean} [params.enabled] - Enables the Breadcrumbs feature. Default: false.
	 * @param {boolean} [params.optMode] - Specifies whether to include Breadcrumbs data in the response header. To
	 *   bypass the current `optMode`, append the opposite `ak-bc` query string to each request from your player.
	 *   Default: false.
	 * @param {boolean} [params.loggingEnabled] - Whether to collect all Breadcrumbs data in logs, including the
	 *   response headers sent a requesting client. This can also be helpful if you're using [DataStream
	 *   2](https://techdocs.akamai.com/datastream2/v2/reference/api) to retrieve log data. This way, all Breadcrumbs
	 *   data is carried in the logs it uses. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/breadcrumbs-amd | Akamai Techdocs}
	 */
	setBreadcrumbs(params: {
		/** Enables the Breadcrumbs feature. Default: false. */
		enabled?: boolean;

		/**
		 * Specifies whether to include Breadcrumbs data in the response header. To bypass the current `optMode`, append
		 * the opposite `ak-bc` query string to each request from your player. Default: false.
		 */
		optMode?: boolean;

		/**
		 * Whether to collect all Breadcrumbs data in logs, including the response headers sent a requesting client.
		 * This can also be helpful if you're using [DataStream
		 * 2](https://techdocs.akamai.com/datastream2/v2/reference/api) to retrieve log data. This way, all Breadcrumbs
		 * data is carried in the logs it uses. Default: false.
		 */
		loggingEnabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = false;
		}

		if (typeof params.optMode === 'undefined' && (params.enabled as unknown) === true) {
			params.optMode = false;
		}

		if (typeof params.loggingEnabled === 'undefined' && (params.enabled as unknown) === true) {
			params.loggingEnabled = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'breadcrumbs', {}, params));
	}

	/**
	 * Caches the origin's error responses to decrease server load. Applies for 10 seconds by default to the following
	 * HTTP codes: `204`, `305`, `404`, `405`, `501`, `502`, `503`, `504`, and `505`. This behavior no longer caches
	 * `400` error responses from the origin server. If you need to cache such errors, you can set up a custom variable.
	 * See [Caching 400 responses](doc:cache-http-err-responses#caching-400-responses) for more information.
	 *
	 * @param {object} params - The parameters needed to configure setCacheError
	 * @param {boolean} [params.enabled] - Activates the error-caching behavior. Default: true.
	 * @param {string} [params.ttl] - Overrides the default caching duration of `10s`. Note that if set to `0`, it is
	 *   equivalent to `no-cache`, which forces revalidation and may cause a traffic spike. This can be
	 *   counterproductive when, for example, the origin is producing an error code of `500`. Default: "10s".
	 * @param {boolean} [params.preserveStale] - When enabled, the edge server preserves stale cached objects when the
	 *   origin returns `500`, `502`, `503`, and `504` error codes. This avoids re-fetching and re-caching content after
	 *   transient errors. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/cache-http-err-responses | Akamai Techdocs}
	 */
	setCacheError(params: {
		/** Activates the error-caching behavior. Default: true. */
		enabled?: boolean;

		/**
		 * Overrides the default caching duration of `10s`. Note that if set to `0`, it is equivalent to `no-cache`,
		 * which forces revalidation and may cause a traffic spike. This can be counterproductive when, for example, the
		 * origin is producing an error code of `500`. Default: "10s".
		 */
		ttl?: string;

		/**
		 * When enabled, the edge server preserves stale cached objects when the origin returns `500`, `502`, `503`, and
		 * `504` error codes. This avoids re-fetching and re-caching content after transient errors. Default: true.
		 */
		preserveStale?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.ttl === 'undefined' && (params.enabled as unknown) === true) {
			params.ttl = '10s';
		}

		if (typeof params.preserveStale === 'undefined' && (params.enabled as unknown) === true) {
			params.preserveStale = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'cacheError', {}, params));
	}

	/**
	 * By default, cache keys are generated under the assumption that path and filename components are case-sensitive,
	 * so that `File.html` and `file.html` use separate cache keys. Enabling this behavior forces URL components whose
	 * case varies to resolve to the same cache key. Enable this behavior if your origin server is already
	 * case-insensitive, such as those based on Microsoft IIS. With this behavior enabled, make sure any child rules do
	 * not match case-sensitive path components, or you may apply different settings to the same cached object. Note
	 * that if already enabled, disabling this behavior potentially results in new sets of cache keys. Until these new
	 * caches are built, your origin server may experience traffic spikes as requests pass through. It may also result
	 * in _cache pollution_, excess cache space taken up with redundant content. If you're using
	 * [NetStorage](https://techdocs.akamai.com/netstorage) in conjunction with this behavior, enable its **Force Case**
	 * option to match it, and make sure you name the original files consistently as either upper- or lowercase.
	 *
	 * @param {object} params - The parameters needed to configure setCacheKeyIgnoreCase
	 * @param {boolean} [params.enabled] - Ignores case when forming cache keys. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/ignore-case-cache-key | Akamai Techdocs}
	 */
	setCacheKeyIgnoreCase(params: {
		/** Ignores case when forming cache keys. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'cacheKeyIgnoreCase', {}, params));
	}

	/**
	 * By default, cache keys are formed as URLs with full query strings. This behavior allows you to consolidate cached
	 * objects based on specified sets of query parameters. Note also that whenever you apply behavior that generates
	 * new cache keys, your origin server may experience traffic spikes before the new cache starts to serve out.
	 *
	 * @param {object} params - The parameters needed to configure setCacheKeyQueryParams
	 * @param {'INCLUDE_ALL_PRESERVE_ORDER' | 'INCLUDE_ALL_ALPHABETIZE_ORDER' | 'IGNORE_ALL' | 'INCLUDE' | 'IGNORE'} [params.behavior]
	 *   - Configures how sets of query string parameters translate to cache keys. Be careful not to ignore any parameters
	 *       that result in substantially different content, as it is _not_ reflected in the cached object. Default:
	 *       "INCLUDE_ALL_PRESERVE_ORDER".
	 *
	 * @param {string[]} [params.parameters] - Specifies the set of parameter field names to include in or exclude from
	 *   the cache key. By default, these match the field names as string prefixes.
	 * @param {boolean} [params.exactMatch] - When enabled, `parameters` needs to match exactly. Keep disabled to match
	 *   string prefixes. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/cache-key-query-param | Akamai Techdocs}
	 */
	setCacheKeyQueryParams(params: {
		/**
		 * Configures how sets of query string parameters translate to cache keys. Be careful not to ignore any
		 * parameters that result in substantially different content, as it is _not_ reflected in the cached object.
		 * Default: "INCLUDE_ALL_PRESERVE_ORDER".
		 */
		behavior?: 'INCLUDE_ALL_PRESERVE_ORDER' | 'INCLUDE_ALL_ALPHABETIZE_ORDER' | 'IGNORE_ALL' | 'INCLUDE' | 'IGNORE';

		/**
		 * Specifies the set of parameter field names to include in or exclude from the cache key. By default, these
		 * match the field names as string prefixes.
		 */
		parameters?: string[];

		/** When enabled, `parameters` needs to match exactly. Keep disabled to match string prefixes. Default: false. */
		exactMatch?: boolean;
	}): Property {
		if (typeof params.behavior === 'undefined') {
			params.behavior = 'INCLUDE_ALL_PRESERVE_ORDER';
		}

		if (
			typeof params.exactMatch === 'undefined' &&
			params.behavior !== undefined &&
			['INCLUDE', 'IGNORE'].includes(params.behavior)
		) {
			params.exactMatch = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'cacheKeyQueryParams', {}, params));
	}

	/**
	 * By default, POST requests are passed to the origin. This behavior overrides the default, and allows you to cache
	 * POST responses.
	 *
	 * @param {object} params - The parameters needed to configure setCachePost
	 * @param {boolean} [params.enabled] - Enables caching of POST responses. Default: true.
	 * @param {'IGNORE' | 'MD5' | 'QUERY'} [params.useBody] - Define how and whether to use the POST message body as a
	 *   cache key. Default: "IGNORE".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/cache-post-responses | Akamai Techdocs}
	 */
	setCachePost(params: {
		/** Enables caching of POST responses. Default: true. */
		enabled?: boolean;

		/** Define how and whether to use the POST message body as a cache key. Default: "IGNORE". */
		useBody?: 'IGNORE' | 'MD5' | 'QUERY';
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.useBody === 'undefined' && (params.enabled as unknown) === true) {
			params.useBody = 'IGNORE';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'cachePost', {}, params));
	}

	/**
	 * Controls the caching of HTTP 302 and 307 temporary redirects. By default, Akamai edge servers don't cache them.
	 * Enabling this behavior instructs edge servers to allow these redirects to be cached the same as HTTP 200
	 * responses. Use the [`caching`](#) behavior to separately control TTL for these redirects, either with a specific
	 * TTL value or based on `Cache-Control` or `Expires` response headers.
	 *
	 * @param {object} params - The parameters needed to configure setCacheRedirect
	 * @param {'false' | 'true'} [params.enabled] - Enables the redirect caching behavior. Default: "true".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/cache-http-redirects | Akamai Techdocs}
	 */
	setCacheRedirect(params: {
		/** Enables the redirect caching behavior. Default: "true". */
		enabled?: 'false' | 'true';
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = 'true';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'cacheRedirect', {}, params));
	}

	/**
	 * This adds a cache tag to the requested object. With cache tags, you can flexibly fast purge tagged segments of
	 * your cached content. You can either define these tags with an `Edge-Cache-Tag` header at the origin server level,
	 * or use this behavior to directly add a cache tag to the object as the edge server caches it. The `cacheTag`
	 * behavior can only take a single value, including a variable. If you want to specify more tags for an object, add
	 * a few instances of this behavior to your configuration. See [Fast Purge](https://techdocs.akamai.com/purge-cache)
	 * for guidance on best practices to deploy cache tags. Use the [Fast Purge
	 * API](https://techdocs.akamai.com/purge-cache/reference) to purge by cache tag programmatically. Note that this
	 * behavior is not compatible with the [`dynamicThroughtputOptimization`](#) behavior. Don't include both behaviors
	 * in a rule for the same request.
	 *
	 * @param {object} params - The parameters needed to configure setCacheTag
	 * @param {string} params.tag - Specifies the cache tag you want to add to your cached content. A cache tag is only
	 *   added when the object is first added to cache. A single cache tag can't exceed 128 characters and can only
	 *   include alphanumeric characters, plus this class of characters: `[!#$%'+./^_`|~-]` PM variables may appear
	 *   between '{{' and '}}'.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/cache-tag | Akamai Techdocs}
	 */
	setCacheTag(params: {
		/**
		 * Specifies the cache tag you want to add to your cached content. A cache tag is only added when the object is
		 * first added to cache. A single cache tag can't exceed 128 characters and can only include alphanumeric
		 * characters, plus this class of characters: `[!#$%'+./^_`|~-]` PM variables may appear between '{{' and '}}'.
		 */
		tag: string;
	}): Property {
		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'cacheTag', {allowsVars: ['tag']}, params),
		);
	}

	/**
	 * Cache tags are comma-separated string values you define within an `Edge-Cache-Tag` header. You can use them to
	 * flexibly fast purge tagged segments of your cached content. You can either define these headers at the origin
	 * server level, or use the [`modifyOutgoingResponseHeader`](#) behavior to configure them at the edge. Apply this
	 * behavior to confirm you're deploying the intended set of cache tags to your content. See [Fast
	 * Purge](https://techdocs.akamai.com/purge-cache) for guidance on best practices to deploy cache tags. Use the
	 * [Fast Purge API](https://techdocs.akamai.com/purge-cache/reference) to purge by cache tag programmatically.
	 *
	 * @param {object} params - The parameters needed to configure setCacheTagVisible
	 * @param {'NEVER' | 'PRAGMA_HEADER' | 'ALWAYS'} [params.behavior] - Specifies when to include the `Edge-Cache-Tag`
	 *   in responses. Default: "NEVER".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/cache-tag-visibility | Akamai Techdocs}
	 */
	setCacheTagVisible(params: {
		/** Specifies when to include the `Edge-Cache-Tag` in responses. Default: "NEVER". */
		behavior?: 'NEVER' | 'PRAGMA_HEADER' | 'ALWAYS';
	}): Property {
		if (typeof params.behavior === 'undefined') {
			params.behavior = 'NEVER';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'cacheTagVisible', {}, params));
	}

	/**
	 * Control content caching on edge servers: whether or not to cache, whether to honor the origin's caching headers,
	 * and for how long to cache. Note that any `NO_STORE` or `BYPASS_CACHE` HTTP headers set on the origin's content
	 * override this behavior. For more details on how caching works in Property Manager, see the [Learn about
	 * caching](doc:know-caching) section in the guide.
	 *
	 * @param {object} params - The parameters needed to configure setCaching
	 * @param {'MAX_AGE' | 'NO_STORE' | 'BYPASS_CACHE' | 'CACHE_CONTROL_AND_EXPIRES' | 'CACHE_CONTROL' | 'EXPIRES'} [params.behavior]
	 *   - Specify the caching option. Default: "MAX_AGE".
	 *
	 * @param {boolean} [params.mustRevalidate] - Determines what to do once the cached content has expired, by which
	 *   time the Akamai platform should have re-fetched and validated content from the origin. If enabled, only allows
	 *   the re-fetched content to be served. If disabled, may serve stale content if the origin is unavailable.
	 *   Default: false.
	 * @param {string} [params.ttl] - The maximum time content may remain cached. Setting the value to `0` is the same
	 *   as setting a `no-cache` header, which forces content to revalidate.
	 * @param {string} [params.defaultTtl] - Set the `MAX_AGE` header for the cached content.
	 * @param {boolean} [params.enhancedRfcSupport] - This enables honoring particular `Cache-Control` header directives
	 *   from the origin. Supports all official [RFC 7234](https://tools.ietf.org/html/rfc7234) directives except for
	 *   `no-transform`. Default: false.
	 * @param {boolean} [params.honorNoStore] - Instructs edge servers not to cache the response when the origin
	 *   response includes the `no-store` directive. Default: true.
	 * @param {boolean} [params.honorPrivate] - Instructs edge servers not to cache the response when the origin
	 *   response includes the `private` directive. Default: false.
	 * @param {boolean} [params.honorNoCache] - With the `no-cache` directive present in the response, this instructs
	 *   edge servers to validate or refetch the response for each request. Effectively, set the time to live `ttl` to
	 *   zero seconds. Default: true.
	 * @param {boolean} [params.honorMaxAge] - This instructs edge servers to cache the object for a length of time set
	 *   by the `max-age` directive in the response. When present in the origin response, this directive takes
	 *   precedence over the `max-age` directive and the `defaultTtl` setting. Default: true.
	 * @param {boolean} [params.honorSMaxage] - Instructs edge servers to cache the object for a length of time set by
	 *   the `s-maxage` directive in the response. When present in the origin response, this directive takes precedence
	 *   over the `max-age` directive and the `defaultTtl` setting. Default: false.
	 * @param {boolean} [params.honorMustRevalidate] - This instructs edge servers to successfully revalidate with the
	 *   origin server before using stale objects in the cache to satisfy new requests. Default: false.
	 * @param {boolean} [params.honorProxyRevalidate] - With the `proxy-revalidate` directive present in the response,
	 *   this instructs edge servers to successfully revalidate with the origin server before using stale objects in the
	 *   cache to satisfy new requests. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/caching-2 | Akamai Techdocs}
	 */
	setCaching(params: {
		/** Specify the caching option. Default: "MAX_AGE". */
		behavior?: 'MAX_AGE' | 'NO_STORE' | 'BYPASS_CACHE' | 'CACHE_CONTROL_AND_EXPIRES' | 'CACHE_CONTROL' | 'EXPIRES';

		/**
		 * Determines what to do once the cached content has expired, by which time the Akamai platform should have
		 * re-fetched and validated content from the origin. If enabled, only allows the re-fetched content to be
		 * served. If disabled, may serve stale content if the origin is unavailable. Default: false.
		 */
		mustRevalidate?: boolean;

		/**
		 * The maximum time content may remain cached. Setting the value to `0` is the same as setting a `no-cache`
		 * header, which forces content to revalidate.
		 */
		ttl?: string;

		/** Set the `MAX_AGE` header for the cached content. */
		defaultTtl?: string;

		/**
		 * This enables honoring particular `Cache-Control` header directives from the origin. Supports all official
		 * [RFC 7234](https://tools.ietf.org/html/rfc7234) directives except for `no-transform`. Default: false.
		 */
		enhancedRfcSupport?: boolean;

		/**
		 * Instructs edge servers not to cache the response when the origin response includes the `no-store` directive.
		 * Default: true.
		 */
		honorNoStore?: boolean;

		/**
		 * Instructs edge servers not to cache the response when the origin response includes the `private` directive.
		 * Default: false.
		 */
		honorPrivate?: boolean;

		/**
		 * With the `no-cache` directive present in the response, this instructs edge servers to validate or refetch the
		 * response for each request. Effectively, set the time to live `ttl` to zero seconds. Default: true.
		 */
		honorNoCache?: boolean;

		/**
		 * This instructs edge servers to cache the object for a length of time set by the `max-age` directive in the
		 * response. When present in the origin response, this directive takes precedence over the `max-age` directive
		 * and the `defaultTtl` setting. Default: true.
		 */
		honorMaxAge?: boolean;

		/**
		 * Instructs edge servers to cache the object for a length of time set by the `s-maxage` directive in the
		 * response. When present in the origin response, this directive takes precedence over the `max-age` directive
		 * and the `defaultTtl` setting. Default: false.
		 */
		honorSMaxage?: boolean;

		/**
		 * This instructs edge servers to successfully revalidate with the origin server before using stale objects in
		 * the cache to satisfy new requests. Default: false.
		 */
		honorMustRevalidate?: boolean;

		/**
		 * With the `proxy-revalidate` directive present in the response, this instructs edge servers to successfully
		 * revalidate with the origin server before using stale objects in the cache to satisfy new requests. Default:
		 * false.
		 */
		honorProxyRevalidate?: boolean;
	}): Property {
		if (typeof params.behavior === 'undefined') {
			params.behavior = 'MAX_AGE';
		}

		if (
			typeof params.mustRevalidate === 'undefined' &&
			params.behavior !== undefined &&
			['CACHE_CONTROL_AND_EXPIRES', 'CACHE_CONTROL', 'EXPIRES', 'MAX_AGE'].includes(params.behavior)
		) {
			params.mustRevalidate = false;
		}

		if (
			typeof params.enhancedRfcSupport === 'undefined' &&
			params.behavior !== undefined &&
			['CACHE_CONTROL', 'CACHE_CONTROL_AND_EXPIRES'].includes(params.behavior)
		) {
			params.enhancedRfcSupport = false;
		}

		if (typeof params.honorNoStore === 'undefined' && (params.enhancedRfcSupport as unknown) === true) {
			params.honorNoStore = true;
		}

		if (
			typeof params.honorPrivate === 'undefined' &&
			params.behavior !== undefined &&
			['CACHE_CONTROL', 'CACHE_CONTROL_AND_EXPIRES'].includes(params.behavior)
		) {
			params.honorPrivate = false;
		}

		if (typeof params.honorNoCache === 'undefined' && (params.enhancedRfcSupport as unknown) === true) {
			params.honorNoCache = true;
		}

		if (typeof params.honorMaxAge === 'undefined' && (params.enhancedRfcSupport as unknown) === true) {
			params.honorMaxAge = true;
		}

		if (typeof params.honorSMaxage === 'undefined' && (params.enhancedRfcSupport as unknown) === true) {
			params.honorSMaxage = false;
		}

		if (
			typeof params.honorMustRevalidate === 'undefined' &&
			params.behavior !== undefined &&
			['CACHE_CONTROL', 'CACHE_CONTROL_AND_EXPIRES'].includes(params.behavior)
		) {
			params.honorMustRevalidate = false;
		}

		if (typeof params.honorProxyRevalidate === 'undefined' && (params.enhancedRfcSupport as unknown) === true) {
			params.honorProxyRevalidate = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'caching', {}, params));
	}

	/**
	 * Controls whether the edge server chases any redirects served from the origin. **Note:** Chase Redirects is not
	 * compatible with Amazon Web Services and Google Cloud Storage authentication methods in the
	 * [`originCharacteristics`](#) behavior. If you're using any of these authentication methods, Chase Redirects gets
	 * automatically disabled.
	 *
	 * @param {object} params - The parameters needed to configure setChaseRedirects
	 * @param {boolean} [params.enabled] - Allows edge servers to chase redirects. Default: true.
	 * @param {string} [params.limit] - Specifies, as a string, the maximum number of redirects to follow. Default: "4".
	 * @param {boolean} [params.serve404] - Once the redirect `limit` is reached, enabling this option serves an HTTP
	 *   `404` (Not Found) error instead of the last redirect. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/chase-redirects | Akamai Techdocs}
	 */
	setChaseRedirects(params: {
		/** Allows edge servers to chase redirects. Default: true. */
		enabled?: boolean;

		/** Specifies, as a string, the maximum number of redirects to follow. Default: "4". */
		limit?: string;

		/**
		 * Once the redirect `limit` is reached, enabling this option serves an HTTP `404` (Not Found) error instead of
		 * the last redirect. Default: true.
		 */
		serve404?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.limit === 'undefined' && (params.enabled as unknown) === true) {
			params.limit = '4';
		}

		if (typeof params.serve404 === 'undefined' && (params.enabled as unknown) === true) {
			params.serve404 = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'chaseRedirects', {}, params));
	}

	/**
	 * This behavior constructs an HTTP response, complete with HTTP status code and body, to serve from the edge
	 * independently of your origin. For example, you might want to send a customized response if the URL doesn't point
	 * to an object on the origin server, or if the end user is not authorized to view the requested content. You can
	 * use it with all request methods you allow for your property, including POST. For more details, see the
	 * [`allowOptions`](#), [`allowPatch`](#), [`allowPost`](#), [`allowPut`](#), and [`allowDelete`](#) behaviors.
	 * Don't use this behavior with Bot Manager when you [set up alternate
	 * hostnames](https://techdocs.akamai.com/bot-manager/docs/set-alternate-content#before-you-begin) to send bot
	 * traffic to an alternate page or site. Make sure the `constructResponse` behavior is disabled in that case.
	 *
	 * @param {object} params - The parameters needed to configure setConstructResponse
	 * @param {boolean} [params.enabled] - Serves the custom response. Default: true.
	 * @param {string} [params.body] - HTML response of up to 2000 characters to send to the end-user client. PM
	 *   variables may appear between '{{' and '}}'.
	 * @param {200 | 404 | 401 | 403 | 405 | 417 | 500 | 501 | 502 | 503 | 504} [params.responseCode] - The HTTP
	 *   response code to send to the end-user client. Default: 200.
	 * @param {boolean} [params.forceEviction] - For GET requests from clients, this forces edge servers to evict the
	 *   underlying object from cache. Defaults to `false`. Default: false.
	 * @param {boolean} [params.ignorePurge] - Whether to ignore the custom response when purging. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/construct-response | Akamai Techdocs}
	 */
	setConstructResponse(params: {
		/** Serves the custom response. Default: true. */
		enabled?: boolean;

		/**
		 * HTML response of up to 2000 characters to send to the end-user client. PM variables may appear between '{{'
		 * and '}}'.
		 */
		body?: string;

		/** The HTTP response code to send to the end-user client. Default: 200. */
		responseCode?: 200 | 404 | 401 | 403 | 405 | 417 | 500 | 501 | 502 | 503 | 504;

		/**
		 * For GET requests from clients, this forces edge servers to evict the underlying object from cache. Defaults
		 * to `false`. Default: false.
		 */
		forceEviction?: boolean;

		/** Whether to ignore the custom response when purging. Default: false. */
		ignorePurge?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.responseCode === 'undefined' && (params.enabled as unknown) === true) {
			params.responseCode = 200;
		}

		if (typeof params.forceEviction === 'undefined' && (params.enabled as unknown) === true) {
			params.forceEviction = false;
		}

		if (typeof params.ignorePurge === 'undefined' && (params.enabled as unknown) === true) {
			params.ignorePurge = false;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'constructResponse', {allowsVars: ['body']}, params),
		);
	}

	/**
	 * Cross-origin resource sharing (CORS) allows web pages in one domain to access restricted resources from your
	 * domain. Specify external origin hostnames, methods, and headers that you want to accept via HTTP response
	 * headers. Full support of CORS requires allowing requests that use the OPTIONS method. See [`allowOptions`](#).
	 *
	 * @param {object} params - The parameters needed to configure setCorsSupport
	 * @param {boolean} [params.enabled] - Enables CORS feature. Default: true.
	 * @param {'ANY' | 'SPECIFIED'} [params.allowOrigins] - In responses to preflight requests, sets which origin
	 *   hostnames to accept requests from. Default: "ANY".
	 * @param {string[]} [params.origins] - Defines the origin hostnames to accept requests from. The hostnames that you
	 *   enter need to start with `http` or `https`. For detailed hostname syntax requirements, refer to RFC-952 and
	 *   RFC-1123 specifications.
	 * @param {boolean} [params.allowCredentials] - Accepts requests made using credentials, like cookies or TLS client
	 *   certificates. Default: false.
	 * @param {'ANY' | 'SPECIFIED'} [params.allowHeaders] - In responses to preflight requests, defines which headers to
	 *   allow when making the actual request. Default: "ANY".
	 * @param {string[]} [params.headers] - Defines the supported request headers.
	 * @param {('GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH')[]} [params.methods] - Specifies any combination of the
	 *   following methods: `DELETE`, `GET`, `PATCH`, `POST`, and `PUT` that are allowed when accessing the resource
	 *   from an external domain. Default: ["GET","POST"].
	 * @param {string[]} [params.exposeHeaders] - In responses to preflight requests, lists names of headers that
	 *   clients can access. By default, clients can access the following simple response headers: `Cache-Control`,
	 *   `Content-Language`, `Content-Type`, `Expires`, `Last-Modified`, and `Pragma`. You can add other header names to
	 *   make them accessible to clients. PM variables may appear between '{{' and '}}'.
	 * @param {string} [params.preflightMaxAge] - Defines the number of seconds that the browser should cache the
	 *   response to a preflight request. Default: "600s".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/cors-protocol-support | Akamai Techdocs}
	 */
	setCorsSupport(params: {
		/** Enables CORS feature. Default: true. */
		enabled?: boolean;

		/** In responses to preflight requests, sets which origin hostnames to accept requests from. Default: "ANY". */
		allowOrigins?: 'ANY' | 'SPECIFIED';

		/**
		 * Defines the origin hostnames to accept requests from. The hostnames that you enter need to start with `http`
		 * or `https`. For detailed hostname syntax requirements, refer to RFC-952 and RFC-1123 specifications.
		 */
		origins?: string[];

		/** Accepts requests made using credentials, like cookies or TLS client certificates. Default: false. */
		allowCredentials?: boolean;

		/**
		 * In responses to preflight requests, defines which headers to allow when making the actual request. Default:
		 * "ANY".
		 */
		allowHeaders?: 'ANY' | 'SPECIFIED';

		/** Defines the supported request headers. */
		headers?: string[];

		/**
		 * Specifies any combination of the following methods: `DELETE`, `GET`, `PATCH`, `POST`, and `PUT` that are
		 * allowed when accessing the resource from an external domain. Default: ["GET","POST"].
		 */
		methods?: Array<'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH'>;

		/**
		 * In responses to preflight requests, lists names of headers that clients can access. By default, clients can
		 * access the following simple response headers: `Cache-Control`, `Content-Language`, `Content-Type`, `Expires`,
		 * `Last-Modified`, and `Pragma`. You can add other header names to make them accessible to clients. PM
		 * variables may appear between '{{' and '}}'.
		 */
		exposeHeaders?: string[];

		/**
		 * Defines the number of seconds that the browser should cache the response to a preflight request. Default:
		 * "600s".
		 */
		preflightMaxAge?: string;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.allowOrigins === 'undefined' && (params.enabled as unknown) === true) {
			params.allowOrigins = 'ANY';
		}

		if (typeof params.allowCredentials === 'undefined' && (params.enabled as unknown) === true) {
			params.allowCredentials = false;
		}

		if (typeof params.allowHeaders === 'undefined' && (params.enabled as unknown) === true) {
			params.allowHeaders = 'ANY';
		}

		if (typeof params.methods === 'undefined' && (params.enabled as unknown) === true) {
			params.methods = ['GET', 'POST'];
		}

		if (typeof params.preflightMaxAge === 'undefined' && (params.enabled as unknown) === true) {
			params.preflightMaxAge = '600s';
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'corsSupport', {allowsVars: ['exposeHeaders']}, params),
		);
	}

	/**
	 * Content Provider Codes (CP codes) allow you to distinguish various reporting and billing traffic segments, and
	 * you need them to access properties. You receive an initial CP code when purchasing Akamai, and you can run the
	 * [Create a new CP code](ref:post-cpcodes) operation to generate more. This behavior applies any valid CP code,
	 * either as required as a default at the top of the rule tree, or subsequently to override the default. For a CP
	 * code to be valid, it needs to be assigned the same contract and product as the property, and the group needs
	 * access to it. For available values, run the [List CP codes](ref:get-cpcodes) operation.
	 *
	 * @param {object} params - The parameters needed to configure setCpCode
	 * @param {any} params.value - Specifies the CP code as an object. You only need to provide the initial `id`,
	 *   stripping any [`cpc_` prefix](ref:id-prefixes) to pass the integer to the rule tree. Additional CP code details
	 *   may reflect back in subsequent read-only data.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/content-provider-code-beh | Akamai Techdocs}
	 */
	setCpCode(params: {
		/**
		 * Specifies the CP code as an object. You only need to provide the initial `id`, stripping any [`cpc_`
		 * prefix](ref:id-prefixes) to pass the integer to the rule tree. Additional CP code details may reflect back in
		 * subsequent read-only data.
		 */
		value: any;
	}): Property {
		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'cpCode', {}, params));
	}

	/**
	 * The [DataStream](https://techdocs.akamai.com/datastream2/docs) reporting service provides real-time logs on
	 * application activity, including aggregated metrics on complete request and response cycles and origin response
	 * times. Apply this behavior to report on this set of traffic. Use the [DataStream
	 * API](https://techdocs.akamai.com/datastream2/v2/reference/api) to aggregate the data. In the latest rule format,
	 * `logStreamName` is an array of string values, such as `["1234", "5678"]` instead of a single `1234` integer
	 * value. Make sure your property accepts the single integer for the previous rule format, otherwise use an array to
	 * prevent errors.
	 *
	 * @param {object} params - The parameters needed to configure setDatastream
	 * @param {'BEACON' | 'LOG' | 'BEACON_AND_LOG'} [params.streamType] - Specify the DataStream type. Default:
	 *   "BEACON".
	 * @param {boolean} [params.enabled] - Enables DataStream reporting. Default: true.
	 * @param {string} [params.datastreamIds] - A set of dash-separated DataStream ID values to limit the scope of
	 *   reported data. By default, all active streams report. Use the DataStream application to gather stream ID values
	 *   that apply to this property configuration. Specifying IDs for any streams that don't apply to this property has
	 *   no effect, and results in no data reported.
	 * @param {boolean} [params.logEnabled] - Enables log collection for the property by associating it with DataStream
	 *   configurations. Default: false.
	 * @param {string[]} [params.logStreamName] - Specifies the unique IDs of streams configured for the property. For
	 *   properties created with the previous version of the rule format, this option contains a string instead of an
	 *   array of strings. You can use the [List
	 *   streams](https://techdocs.akamai.com/datastream2/v2/reference/get-streams) operation to get stream IDs.
	 * @param {number} [params.samplingPercentage] - Specifies the percentage of log data you want to collect for this
	 *   property. Default: 100.
	 * @param {boolean} [params.collectMidgressTraffic] - If enabled, gathers midgress traffic data within the Akamai
	 *   platform, such as between two edge servers, for all streams configured. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/datastream-beh | Akamai Techdocs}
	 */
	setDatastream(params: {
		/** Specify the DataStream type. Default: "BEACON". */
		streamType?: 'BEACON' | 'LOG' | 'BEACON_AND_LOG';

		/** Enables DataStream reporting. Default: true. */
		enabled?: boolean;

		/**
		 * A set of dash-separated DataStream ID values to limit the scope of reported data. By default, all active
		 * streams report. Use the DataStream application to gather stream ID values that apply to this property
		 * configuration. Specifying IDs for any streams that don't apply to this property has no effect, and results in
		 * no data reported.
		 */
		datastreamIds?: string;

		/** Enables log collection for the property by associating it with DataStream configurations. Default: false. */
		logEnabled?: boolean;

		/**
		 * Specifies the unique IDs of streams configured for the property. For properties created with the previous
		 * version of the rule format, this option contains a string instead of an array of strings. You can use the
		 * [List streams](https://techdocs.akamai.com/datastream2/v2/reference/get-streams) operation to get stream
		 * IDs.
		 */
		logStreamName?: Array<string>;

		/** Specifies the percentage of log data you want to collect for this property. Default: 100. */
		samplingPercentage?: number;

		/**
		 * If enabled, gathers midgress traffic data within the Akamai platform, such as between two edge servers, for
		 * all streams configured. Default: false.
		 */
		collectMidgressTraffic?: boolean;
	}): Property {
		if (typeof params.streamType === 'undefined') {
			params.streamType = 'BEACON';
		}

		if (
			typeof params.enabled === 'undefined' &&
			!(params.streamType !== undefined && ['LOG'].includes(params.streamType))
		) {
			params.enabled = true;
		}

		if (
			typeof params.logEnabled === 'undefined' &&
			params.streamType !== undefined &&
			['LOG', 'BEACON_AND_LOG'].includes(params.streamType)
		) {
			params.logEnabled = false;
		}

		if (typeof params.samplingPercentage === 'undefined' && (params.logEnabled as unknown) === true) {
			params.samplingPercentage = 100;
		}

		if (typeof params.collectMidgressTraffic === 'undefined' && (params.logEnabled as unknown) === true) {
			params.collectMidgressTraffic = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'datastream', {}, params));
	}

	/**
	 * Allow an edge server to use an expired DNS record when forwarding a request to your origin. The _type A_ DNS
	 * record refreshes _after_ content is served to the end user, so there is no wait for the DNS resolution. Avoid
	 * this behavior if you want to be able to disable a server immediately after its DNS record expires.
	 *
	 * @param {object} params - The parameters needed to configure setDnsAsyncRefresh
	 * @param {boolean} [params.enabled] - Allows edge servers to refresh an expired DNS record after serving content.
	 *   Default: true.
	 * @param {string} [params.timeout] - Set the maximum allowed time an expired DNS record may be active. Default:
	 *   "2h".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/dns-asynchronous-refresh | Akamai Techdocs}
	 */
	setDnsAsyncRefresh(params: {
		/** Allows edge servers to refresh an expired DNS record after serving content. Default: true. */
		enabled?: boolean;

		/** Set the maximum allowed time an expired DNS record may be active. Default: "2h". */
		timeout?: string;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.timeout === 'undefined' && (params.enabled as unknown) === true) {
			params.timeout = '2h';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'dnsAsyncRefresh', {}, params));
	}

	/**
	 * Allows edge servers to refresh your origin's DNS record independently from end-user requests. The _type A_ DNS
	 * record refreshes before the origin's DNS record expires.
	 *
	 * @param {object} params - The parameters needed to configure setDnsPrefresh
	 * @param {boolean} [params.enabled] - Allows edge servers to refresh DNS records before they expire. Default: true.
	 * @param {string} [params.delay] - Specifies the amount of time following a DNS record's expiration to
	 *   asynchronously prefresh it. Default: "5m".
	 * @param {string} [params.timeout] - Specifies the amount of time to prefresh a DNS entry if there have been no
	 *   requests to the domain name. Default: "2h".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/dns-asynchronous-prefresh | Akamai Techdocs}
	 */
	setDnsPrefresh(params: {
		/** Allows edge servers to refresh DNS records before they expire. Default: true. */
		enabled?: boolean;

		/**
		 * Specifies the amount of time following a DNS record's expiration to asynchronously prefresh it. Default:
		 * "5m".
		 */
		delay?: string;

		/**
		 * Specifies the amount of time to prefresh a DNS entry if there have been no requests to the domain name.
		 * Default: "2h".
		 */
		timeout?: string;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.delay === 'undefined' && (params.enabled as unknown) === true) {
			params.delay = '5m';
		}

		if (typeof params.timeout === 'undefined' && (params.enabled as unknown) === true) {
			params.timeout = '2h';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'dnsPrefresh', {}, params));
	}

	/**
	 * Specify the caching instructions the edge server sends to the end user's client or client proxies. By default,
	 * the cache's duration is whichever is less: the remaining lifetime of the edge cache, or what the origin's header
	 * specifies. If the origin is set to `no-store` or `bypass-cache`, edge servers send _cache-busting_ headers
	 * downstream to prevent downstream caching.
	 *
	 * @param {object} params - The parameters needed to configure setDownstreamCache
	 * @param {'ALLOW' | 'MUST_REVALIDATE' | 'BUST' | 'TUNNEL_ORIGIN' | 'NONE'} [params.behavior] - Specify the caching
	 *   instructions the edge server sends to the end user's client. Default: "ALLOW".
	 * @param {'LESSER' | 'GREATER' | 'REMAINING_LIFETIME' | 'FROM_MAX_AGE' | 'FROM_VALUE' | 'PASS_ORIGIN'} [params.allowBehavior]
	 *   - Specify how the edge server calculates the downstream cache by setting the value of the `Expires` header.
	 *       Default: "LESSER".
	 *
	 * @param {string} [params.ttl] - Sets the duration of the cache. Setting the value to `0` equates to a `no-cache`
	 *   header that forces revalidation.
	 * @param {'CACHE_CONTROL_AND_EXPIRES' | 'CACHE_CONTROL' | 'EXPIRES' | 'PASS_ORIGIN'} [params.sendHeaders] -
	 *   Specifies the HTTP headers to include in the response to the client. Default: "CACHE_CONTROL_AND_EXPIRES".
	 * @param {boolean} [params.sendPrivate] - Adds a `Cache-Control: private` header to prevent objects from being
	 *   cached in a shared caching proxy. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/downstream-cacheability | Akamai Techdocs}
	 */
	setDownstreamCache(params: {
		/** Specify the caching instructions the edge server sends to the end user's client. Default: "ALLOW". */
		behavior?: 'ALLOW' | 'MUST_REVALIDATE' | 'BUST' | 'TUNNEL_ORIGIN' | 'NONE';

		/**
		 * Specify how the edge server calculates the downstream cache by setting the value of the `Expires` header.
		 * Default: "LESSER".
		 */
		allowBehavior?: 'LESSER' | 'GREATER' | 'REMAINING_LIFETIME' | 'FROM_MAX_AGE' | 'FROM_VALUE' | 'PASS_ORIGIN';

		/**
		 * Sets the duration of the cache. Setting the value to `0` equates to a `no-cache` header that forces
		 * revalidation.
		 */
		ttl?: string;

		/** Specifies the HTTP headers to include in the response to the client. Default: "CACHE_CONTROL_AND_EXPIRES". */
		sendHeaders?: 'CACHE_CONTROL_AND_EXPIRES' | 'CACHE_CONTROL' | 'EXPIRES' | 'PASS_ORIGIN';

		/**
		 * Adds a `Cache-Control: private` header to prevent objects from being cached in a shared caching proxy.
		 * Default: false.
		 */
		sendPrivate?: boolean;
	}): Property {
		if (typeof params.behavior === 'undefined') {
			params.behavior = 'ALLOW';
		}

		if (typeof params.allowBehavior === 'undefined' && (params.behavior as unknown) === 'ALLOW') {
			params.allowBehavior = 'LESSER';
		}

		if (typeof params.sendHeaders === 'undefined' && (params.behavior as unknown) === 'ALLOW') {
			params.sendHeaders = 'CACHE_CONTROL_AND_EXPIRES';
		}

		if (
			typeof params.sendPrivate === 'undefined' &&
			params.behavior !== undefined &&
			['ALLOW', 'MUST_REVALIDATE'].includes(params.behavior) &&
			(params.sendHeaders as unknown) !== 'EXPIRES'
		) {
			params.sendPrivate = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'downstreamCache', {}, params));
	}

	/**
	 * Configures traffic logs for the Cloud Monitor push API.
	 *
	 * @param {object} params - The parameters needed to configure setEdgeConnect
	 * @param {boolean} [params.enabled] - Enables Cloud Monitor's log-publishing behavior. Default: true.
	 * @param {'DEFAULT' | 'SIEM_JSON' | 'BMC_APM'} [params.apiConnector] - Describes the API connector type. Default:
	 *   "DEFAULT".
	 * @param {(
	 * 	| 'HTTP'
	 * 	| 'APM'
	 * 	| 'NETWORK_PERFORMANCE'
	 * 	| 'REQUEST_HEADER'
	 * 	| 'RESPONSE_HEADER'
	 * 	| 'GEO'
	 * 	| 'NETWORK_V1'
	 * 	| 'SEC_APP_V2'
	 * 	| 'SEC_RATE_WARN_V2'
	 * 	| 'SEC_RATE_DENY_V2'
	 * )[]} [params.apiDataElements]
	 *   - Specifies the data set to log. Default: ["HTTP"].
	 *
	 * @param {string} [params.destinationHostname] - Specifies the target hostname accepting push API requests.
	 * @param {string} [params.destinationPath] - Specifies the push API's endpoint.
	 * @param {boolean} [params.overrideAggregateSettings] - When enabled, overrides default log settings. Default:
	 *   false.
	 * @param {string} [params.aggregateTime] - Specifies how often logs are generated. Default: "15s".
	 * @param {string} [params.aggregateLines] - Specifies the maximum number of lines to include in each log. Default:
	 *   "2000".
	 * @param {string} [params.aggregateSize] - Specifies the log's maximum size. Default: "1000KB".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/cloud-monitor-instrumentation | Akamai Techdocs}
	 */
	setEdgeConnect(params: {
		/** Enables Cloud Monitor's log-publishing behavior. Default: true. */
		enabled?: boolean;

		/** Describes the API connector type. Default: "DEFAULT". */
		apiConnector?: 'DEFAULT' | 'SIEM_JSON' | 'BMC_APM';

		/** Specifies the data set to log. Default: ["HTTP"]. */
		apiDataElements?: Array<
			| 'HTTP'
			| 'APM'
			| 'NETWORK_PERFORMANCE'
			| 'REQUEST_HEADER'
			| 'RESPONSE_HEADER'
			| 'GEO'
			| 'NETWORK_V1'
			| 'SEC_APP_V2'
			| 'SEC_RATE_WARN_V2'
			| 'SEC_RATE_DENY_V2'
		>;

		/** Specifies the target hostname accepting push API requests. */
		destinationHostname?: string;

		/** Specifies the push API's endpoint. */
		destinationPath?: string;

		/** When enabled, overrides default log settings. Default: false. */
		overrideAggregateSettings?: boolean;

		/** Specifies how often logs are generated. Default: "15s". */
		aggregateTime?: string;

		/** Specifies the maximum number of lines to include in each log. Default: "2000". */
		aggregateLines?: string;

		/** Specifies the log's maximum size. Default: "1000KB". */
		aggregateSize?: string;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.apiConnector === 'undefined' && (params.enabled as unknown) === true) {
			params.apiConnector = 'DEFAULT';
		}

		if (typeof params.apiDataElements === 'undefined' && (params.enabled as unknown) === true) {
			params.apiDataElements = ['HTTP'];
		}

		if (typeof params.overrideAggregateSettings === 'undefined' && (params.enabled as unknown) === true) {
			params.overrideAggregateSettings = false;
		}

		if (typeof params.aggregateTime === 'undefined' && (params.overrideAggregateSettings as unknown) === true) {
			params.aggregateTime = '15s';
		}

		if (typeof params.aggregateLines === 'undefined' && (params.overrideAggregateSettings as unknown) === true) {
			params.aggregateLines = '2000';
		}

		if (typeof params.aggregateSize === 'undefined' && (params.overrideAggregateSettings as unknown) === true) {
			params.aggregateSize = '1000KB';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'edgeConnect', {}, params));
	}

	/**
	 * Allows the origin server to use a cookie to ensure requests from Akamai servers are genuine. This behavior
	 * requires that you specify the cookie's domain name, so it is best to deploy within a match of the hostname. It
	 * does not work properly when the origin server accepts more than one hostname (for example, using virtual servers)
	 * that do not share the same top-level domain.
	 *
	 * @param {object} params - The parameters needed to configure setEdgeOriginAuthorization
	 * @param {boolean} [params.enabled] - Enables the cookie-authorization behavior. Default: true.
	 * @param {string} [params.cookieName] - Specifies the name of the cookie to use for authorization. Default:
	 *   "AKA_ID".
	 * @param {string} [params.value] - Specifies the value of the authorization cookie. Default: "".
	 * @param {string} [params.domain] - Specify the cookie's domain, which needs to match the top-level domain of the
	 *   `Host` header the origin server receives. Default: "".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/edge-server-identification | Akamai Techdocs}
	 */
	setEdgeOriginAuthorization(params: {
		/** Enables the cookie-authorization behavior. Default: true. */
		enabled?: boolean;

		/** Specifies the name of the cookie to use for authorization. Default: "AKA_ID". */
		cookieName?: string;

		/** Specifies the value of the authorization cookie. Default: "". */
		value?: string;

		/**
		 * Specify the cookie's domain, which needs to match the top-level domain of the `Host` header the origin server
		 * receives. Default: "".
		 */
		domain?: string;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.cookieName === 'undefined' && (params.enabled as unknown) === true) {
			params.cookieName = 'AKA_ID';
		}

		if (typeof params.value === 'undefined' && (params.enabled as unknown) === true) {
			params.value = '';
		}

		if (typeof params.domain === 'undefined' && (params.enabled as unknown) === true) {
			params.domain = '';
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'edgeOriginAuthorization', {}, params),
		);
	}

	/**
	 * Ensures that functionality such as challenge authentication and reset protocol work with a failover product
	 * property you use to create an alternate hostname. Apply it to any properties that implement a failover under the
	 * Cloud Security Failover product.
	 *
	 * @param {object} params - The parameters needed to configure setFailoverBotManagerFeatureCompatibility
	 * @param {boolean} [params.compatibility] - This behavior does not include any options. Specifying the behavior
	 *   itself enables it. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/welcome-prop-manager | Akamai Techdocs}
	 */
	setFailoverBotManagerFeatureCompatibility(params: {
		/** This behavior does not include any options. Specifying the behavior itself enables it. Default: false. */
		compatibility?: boolean;
	}): Property {
		if (typeof params.compatibility === 'undefined') {
			params.compatibility = false;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'failoverBotManagerFeatureCompatibility', {}, params),
		);
	}

	/**
	 * Ensures [Federal Information Process Standards (FIPS) 140-2](https://csrc.nist.gov/pubs/fips/140-2/upd2/final)
	 * compliance for a connection to an origin server. For this behavior to work properly, verify that your origin's
	 * secure certificate supports Enhanced TLS and is FIPS-compliant. Note that you can't use `fips` if
	 * [`downgradeProtocol`](#) or [`allowHTTPSDowngrade`](#) behaviors are enabled in the same property.
	 *
	 * @param {object} params - The parameters needed to configure setFips
	 * @param {boolean} [params.enable] - When enabled, supports the use of FIPS-validated ciphers in the connection
	 *   between this delivery configuration and your origin server. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/fips-mode-origin | Akamai Techdocs}
	 */
	setFips(params: {
		/**
		 * When enabled, supports the use of FIPS-validated ciphers in the connection between this delivery
		 * configuration and your origin server. Default: false.
		 */
		enable?: boolean;
	}): Property {
		if (typeof params.enable === 'undefined') {
			params.enable = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'fips', {}, params));
	}

	/**
	 * Apply _gzip_ compression to speed transfer time. This behavior applies best to text-based content such as HTML,
	 * CSS, and JavaScript, especially once files exceed about 10KB. Do not apply it to already compressed image
	 * formats, or to small files that would add more time to uncompress. To apply this behavior, you should match on
	 * [`contentType`](#) or the content's [`cacheability`](#).
	 *
	 * @param {object} params - The parameters needed to configure setGzipResponse
	 * @param {'ORIGIN_RESPONSE' | 'ALWAYS' | 'NEVER'} [params.behavior] - Specify when to compress responses. Default:
	 *   "ORIGIN_RESPONSE".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/last-mile-accel-gzip-comp | Akamai Techdocs}
	 */
	setGzipResponse(params: {
		/** Specify when to compress responses. Default: "ORIGIN_RESPONSE". */
		behavior?: 'ORIGIN_RESPONSE' | 'ALWAYS' | 'NEVER';
	}): Property {
		if (typeof params.behavior === 'undefined') {
			params.behavior = 'ORIGIN_RESPONSE';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'gzipResponse', {}, params));
	}

	/**
	 * This enables the HTTP/3 protocol that uses QUIC. The behavior allows for improved performance and faster
	 * connection setup. You can only apply this behavior if the property is marked as secure. See [Secure property
	 * requirements](ref:the-default-rule) and the [Property Manager documentation](doc:http3-support) for guidance. If
	 * you want all requests processed by a property to support HTTP/3 for transfer, add the behavior to the default
	 * rule. If you add the behavior to a custom rule, use it with the [`bucket`](#) match so that it applies to a
	 * specific percentage of the HTTP/3 requests.
	 *
	 * @param {object} params - The parameters needed to configure setHttp3
	 * @param {boolean} [params.enable] - This enables HTTP/3 connections between requesting clients and Akamai edge
	 *   servers. You also need to enable QUIC and TLS 1.3 in your certificate deployment settings. See the [Property
	 *   Manager documentation](doc:http3-support) for more details. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/http3-support | Akamai Techdocs}
	 */
	setHttp3(params: {
		/**
		 * This enables HTTP/3 connections between requesting clients and Akamai edge servers. You also need to enable
		 * QUIC and TLS 1.3 in your certificate deployment settings. See the [Property Manager
		 * documentation](doc:http3-support) for more details. Default: true.
		 */
		enable?: boolean;
	}): Property {
		if (typeof params.enable === 'undefined') {
			params.enable = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'http3', {}, params));
	}

	/**
	 * Applies HTTP Strict Transport Security (HSTS), disallowing insecure HTTP traffic. Apply this to hostnames managed
	 * with Standard TLS or Enhanced TLS certificates.
	 *
	 * @param {object} params - The parameters needed to configure setHttpStrictTransportSecurity
	 * @param {boolean} [params.enable] - Applies HSTS to this set of requests. Default: true.
	 * @param {'ZERO_MINS' | 'TEN_MINS' | 'ONE_DAY' | 'ONE_MONTH' | 'THREE_MONTHS' | 'SIX_MONTHS' | 'ONE_YEAR'} [params.maxAge]
	 *   - Specifies the duration for which to apply HSTS for new browser connections. Default: "ONE_DAY".
	 *
	 * @param {boolean} [params.includeSubDomains] - When enabled, applies HSTS to all subdomains. Default: false.
	 * @param {boolean} [params.preload] - When enabled, adds this domain to the browser's preload list. You still need
	 *   to declare the domain at [hstspreload.org](https://hstspreload.org/). Default: false.
	 * @param {boolean} [params.redirect] - When enabled, redirects all HTTP requests to HTTPS. Default: false.
	 * @param {301 | 302} [params.redirectStatusCode] - Specifies a response code. Default: 301.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/http-strict-transport-security-hsts | Akamai Techdocs}
	 */
	setHttpStrictTransportSecurity(params: {
		/** Applies HSTS to this set of requests. Default: true. */
		enable?: boolean;

		/** Specifies the duration for which to apply HSTS for new browser connections. Default: "ONE_DAY". */
		maxAge?: 'ZERO_MINS' | 'TEN_MINS' | 'ONE_DAY' | 'ONE_MONTH' | 'THREE_MONTHS' | 'SIX_MONTHS' | 'ONE_YEAR';

		/** When enabled, applies HSTS to all subdomains. Default: false. */
		includeSubDomains?: boolean;

		/**
		 * When enabled, adds this domain to the browser's preload list. You still need to declare the domain at
		 * [hstspreload.org](https://hstspreload.org/). Default: false.
		 */
		preload?: boolean;

		/** When enabled, redirects all HTTP requests to HTTPS. Default: false. */
		redirect?: boolean;

		/** Specifies a response code. Default: 301. */
		redirectStatusCode?: 301 | 302;
	}): Property {
		if (typeof params.enable === 'undefined') {
			params.enable = true;
		}

		if (typeof params.maxAge === 'undefined' && (params.enable as unknown) === true) {
			params.maxAge = 'ONE_DAY';
		}

		if (
			typeof params.includeSubDomains === 'undefined' &&
			(params.enable as unknown) === true &&
			(params.maxAge as unknown) !== 'ZERO_MINS'
		) {
			params.includeSubDomains = false;
		}

		if (
			typeof params.preload === 'undefined' &&
			(params.enable as unknown) === true &&
			(params.maxAge as unknown) !== 'ZERO_MINS'
		) {
			params.preload = false;
		}

		if (
			typeof params.redirect === 'undefined' &&
			(params.enable as unknown) === true &&
			(params.maxAge as unknown) !== 'ZERO_MINS'
		) {
			params.redirect = false;
		}

		if (
			typeof params.redirectStatusCode === 'undefined' &&
			(params.enable as unknown) === true &&
			(params.maxAge as unknown) !== 'ZERO_MINS' &&
			(params.redirect as unknown) === true
		) {
			params.redirectStatusCode = 301;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'httpStrictTransportSecurity', {}, params),
		);
	}

	/**
	 * Includes let you reuse chunks of a property configuration that you can manage separately from the rest of the
	 * property rule tree.
	 *
	 * @param {object} params - The parameters needed to configure setInclude
	 * @param {string} params.id - Identifies the include you want to add to your rule tree. You can get the include ID
	 *   using [PAPI](ref:get-includes). This option only accepts digits, without the [`inc_` ID
	 *   prefix](ref:id-prefixes).
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/includes-overview | Akamai Techdocs}
	 */
	setInclude(params: {
		/**
		 * Identifies the include you want to add to your rule tree. You can get the include ID using
		 * [PAPI](ref:get-includes). This option only accepts digits, without the [`inc_` ID prefix](ref:id-prefixes).
		 */
		id: string;
	}): Property {
		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'include', {}, params));
	}

	/**
	 * The [Large File
	 * Optimization](https://techdocs.akamai.com/download-delivery/docs/content-charac-dd#large-file-optimization) (LFO)
	 * feature improves performance and reliability when delivering large files. You need this behavior for objects
	 * larger than 1.8GB, and you should apply it to anything over 100MB. You should apply it only to the specific
	 * content to be optimized, such as a download directory's `.gz` files, and enable the `useVersioning` option while
	 * enforcing your own filename versioning policy. Make sure you meet all the [requirements and best
	 * practices](doc:large-file-optimization-lfo) for the LFO delivery. Note that it is best to use
	 * [NetStorage](https://techdocs.akamai.com/netstorage) for objects larger than 1.8GB. See also the
	 * [`largeFileOptimizationAdvanced`](#) behavior, which provides additional options for to configure partial object
	 * caching and HTTP/2 prefetching.
	 *
	 * @param {object} params - The parameters needed to configure setLargeFileOptimization
	 * @param {boolean} [params.enabled] - Enables the file optimization behavior. Default: true.
	 * @param {'PARTIAL_OBJECT_CACHING' | 'NON_PARTIAL_OBJECT_CACHING'} [params.enablePartialObjectCaching] - Specifies
	 *   whether to cache partial objects. Default: "PARTIAL_OBJECT_CACHING".
	 * @param {string} [params.minimumSize] - Optimization only applies to files larger than this, expressed as a number
	 *   suffixed with a unit string such as `MB` or `GB`. Default: "100MB".
	 * @param {string} [params.maximumSize] - Optimization does not apply to files larger than this, expressed as a
	 *   number suffixed with a unit string such as `MB` or `GB`. The size of a file can't be greater than 323 GB. If
	 *   you need to optimize a larger file, contact Akamai Professional Services for help. Default: "16GB".
	 * @param {boolean} [params.useVersioning] - When `enablePartialObjectCaching` is set to `PARTIAL_OBJECT_CACHING`,
	 *   enabling this option signals your intention to vary filenames by version, strongly recommended to avoid serving
	 *   corrupt content when chunks come from different versions of the same file. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/large-file-optimization-lfo | Akamai Techdocs}
	 */
	setLargeFileOptimization(params: {
		/** Enables the file optimization behavior. Default: true. */
		enabled?: boolean;

		/** Specifies whether to cache partial objects. Default: "PARTIAL_OBJECT_CACHING". */
		enablePartialObjectCaching?: 'PARTIAL_OBJECT_CACHING' | 'NON_PARTIAL_OBJECT_CACHING';

		/**
		 * Optimization only applies to files larger than this, expressed as a number suffixed with a unit string such
		 * as `MB` or `GB`. Default: "100MB".
		 */
		minimumSize?: string;

		/**
		 * Optimization does not apply to files larger than this, expressed as a number suffixed with a unit string such
		 * as `MB` or `GB`. The size of a file can't be greater than 323 GB. If you need to optimize a larger file,
		 * contact Akamai Professional Services for help. Default: "16GB".
		 */
		maximumSize?: string;

		/**
		 * When `enablePartialObjectCaching` is set to `PARTIAL_OBJECT_CACHING`, enabling this option signals your
		 * intention to vary filenames by version, strongly recommended to avoid serving corrupt content when chunks
		 * come from different versions of the same file. Default: true.
		 */
		useVersioning?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.enablePartialObjectCaching === 'undefined' && (params.enabled as unknown) === true) {
			params.enablePartialObjectCaching = 'PARTIAL_OBJECT_CACHING';
		}

		if (
			typeof params.minimumSize === 'undefined' &&
			(params.enablePartialObjectCaching as unknown) === 'PARTIAL_OBJECT_CACHING'
		) {
			params.minimumSize = '100MB';
		}

		if (
			typeof params.maximumSize === 'undefined' &&
			(params.enablePartialObjectCaching as unknown) === 'PARTIAL_OBJECT_CACHING'
		) {
			params.maximumSize = '16GB';
		}

		if (
			typeof params.useVersioning === 'undefined' &&
			(params.enablePartialObjectCaching as unknown) === 'PARTIAL_OBJECT_CACHING'
		) {
			params.useVersioning = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'largeFileOptimization', {}, params),
		);
	}

	/**
	 * Logs custom details from the origin response in the [Log Delivery
	 * Service](https://techdocs.akamai.com/log-delivery) report.
	 *
	 * @param {object} params - The parameters needed to configure setLogCustom
	 * @param {boolean} [params.logCustomLogField] - Whether to append additional custom data to each log line. Default:
	 *   false.
	 * @param {string} [params.customLogField] - Specifies an additional data field to append to each log line, maximum
	 *   1000 bytes, typically based on a dynamically generated built-in system variable. For example, `round-trip:
	 *   {{builtin.AK_CLIENT_TURNAROUND_TIME}}ms` logs the total time to complete the response. See [Support for
	 *   variables](ref:variables) for more information. Since this option can specify both a request and response, it
	 *   overrides any `customLogField` settings in the [`report`](#) behavior. Default: "". PM variables may appear
	 *   between '{{' and '}}'.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/log-custom-details | Akamai Techdocs}
	 */
	setLogCustom(params: {
		/** Whether to append additional custom data to each log line. Default: false. */
		logCustomLogField?: boolean;

		/**
		 * Specifies an additional data field to append to each log line, maximum 1000 bytes, typically based on a
		 * dynamically generated built-in system variable. For example, `round-trip:
		 * {{builtin.AK_CLIENT_TURNAROUND_TIME}}ms` logs the total time to complete the response. See [Support for
		 * variables](ref:variables) for more information. Since this option can specify both a request and response, it
		 * overrides any `customLogField` settings in the [`report`](#) behavior. Default: "". PM variables may appear
		 * between '{{' and '}}'.
		 */
		customLogField?: string;
	}): Property {
		if (typeof params.logCustomLogField === 'undefined') {
			params.logCustomLogField = false;
		}

		if (typeof params.customLogField === 'undefined' && (params.logCustomLogField as unknown) === true) {
			params.customLogField = '';
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'logCustom', {allowsVars: ['customLogField']}, params),
		);
	}

	/**
	 * This behavior is deprecated, but you should not disable or remove it if present. The Mobile Application
	 * Performance software development kit allows you to optimize native iOS and Android apps, effectively extending
	 * Akamai's intelligent edge platform's advantages to mobile devices operation in poor network conditions. This
	 * behavior enables the SDK's features for this set of requests.
	 *
	 * @param {object} params - The parameters needed to configure setMobileSdkPerformance
	 * @param {boolean} [params.enabled] - Enables the Mobile App Performance SDK. Default: true.
	 * @param {boolean} [params.secondaryMultipathToOrigin] - When enabled, sends secondary multi-path requests to the
	 *   origin server. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/mobile-app-perf-sdk | Akamai Techdocs}
	 */
	setMobileSdkPerformance(params: {
		/** Enables the Mobile App Performance SDK. Default: true. */
		enabled?: boolean;

		/** When enabled, sends secondary multi-path requests to the origin server. Default: false. */
		secondaryMultipathToOrigin?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.secondaryMultipathToOrigin === 'undefined' && (params.enabled as unknown) === true) {
			params.secondaryMultipathToOrigin = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'mobileSdkPerformance', {}, params));
	}

	/**
	 * Modify, add, remove, or pass along specific request headers coming upstream from the client. Depending on the
	 * type of `action` you want to perform, specify the corresponding _standard_ header name, or a `customHeaderName`
	 * if the standard name is set to `OTHER`. The `headerValue` serves as a match condition when the action is `DELETE`
	 * or `MODIFY`, and the `newHeaderValue` applies when the action is `ADD` or `MODIFY`. See also
	 * [`modifyIncomingResponseHeader`](#), [`modifyOutgoingRequestHeader`](#), and
	 * [`modifyOutgoingResponseHeader`](#).
	 *
	 * @param {object} params - The parameters needed to configure setModifyIncomingRequestHeader
	 * @param {'ADD' | 'DELETE' | 'MODIFY' | 'PASS'} [params.action] - Either `ADD`, `DELETE`, `MODIFY`, or `PASS`
	 *   incoming HTTP request headers. Default: "ADD".
	 * @param {'ACCEPT_ENCODING' | 'ACCEPT_LANGUAGE' | 'OTHER'} [params.standardAddHeaderName] - If the value of
	 *   `action` is `ADD`, this specifies the name of the field to add. Default: "ACCEPT_ENCODING".
	 * @param {'IF_MODIFIED_SINCE' | 'VIA' | 'OTHER'} [params.standardDeleteHeaderName] - If the value of `action` is
	 *   `DELETE`, this specifies the name of the field to remove. Default: "IF_MODIFIED_SINCE".
	 * @param {'ACCEPT_ENCODING' | 'ACCEPT_LANGUAGE' | 'OTHER'} [params.standardModifyHeaderName] - If the value of
	 *   `action` is `MODIFY`, this specifies the name of the field to modify. Default: "ACCEPT_ENCODING".
	 * @param {'ACCEPT_ENCODING' | 'ACCEPT_LANGUAGE' | 'OTHER'} [params.standardPassHeaderName] - If the value of
	 *   `action` is `PASS`, this specifies the name of the field to pass through. Default: "ACCEPT_ENCODING".
	 * @param {string} [params.customHeaderName] - Specifies a custom field name that applies when the relevant
	 *   _standard_ header name is set to `OTHER`. PM variables may appear between '{{' and '}}'.
	 * @param {string} [params.headerValue] - Specifies the new header value. PM variables may appear between '{{' and
	 *   '}}'.
	 * @param {string} [params.newHeaderValue] - Supplies an HTTP header replacement value. PM variables may appear
	 *   between '{{' and '}}'.
	 * @param {boolean} [params.avoidDuplicateHeaders] - When enabled with the `action` set to `MODIFY`, prevents
	 *   creation of more than one instance of a header. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/modify-incoming-req-header | Akamai Techdocs}
	 */
	setModifyIncomingRequestHeader(params: {
		/** Either `ADD`, `DELETE`, `MODIFY`, or `PASS` incoming HTTP request headers. Default: "ADD". */
		action?: 'ADD' | 'DELETE' | 'MODIFY' | 'PASS';

		/** If the value of `action` is `ADD`, this specifies the name of the field to add. Default: "ACCEPT_ENCODING". */
		standardAddHeaderName?: 'ACCEPT_ENCODING' | 'ACCEPT_LANGUAGE' | 'OTHER';

		/**
		 * If the value of `action` is `DELETE`, this specifies the name of the field to remove. Default:
		 * "IF_MODIFIED_SINCE".
		 */
		standardDeleteHeaderName?: 'IF_MODIFIED_SINCE' | 'VIA' | 'OTHER';

		/**
		 * If the value of `action` is `MODIFY`, this specifies the name of the field to modify. Default:
		 * "ACCEPT_ENCODING".
		 */
		standardModifyHeaderName?: 'ACCEPT_ENCODING' | 'ACCEPT_LANGUAGE' | 'OTHER';

		/**
		 * If the value of `action` is `PASS`, this specifies the name of the field to pass through. Default:
		 * "ACCEPT_ENCODING".
		 */
		standardPassHeaderName?: 'ACCEPT_ENCODING' | 'ACCEPT_LANGUAGE' | 'OTHER';

		/**
		 * Specifies a custom field name that applies when the relevant _standard_ header name is set to `OTHER`. PM
		 * variables may appear between '{{' and '}}'.
		 */
		customHeaderName?: string;

		/** Specifies the new header value. PM variables may appear between '{{' and '}}'. */
		headerValue?: string;

		/** Supplies an HTTP header replacement value. PM variables may appear between '{{' and '}}'. */
		newHeaderValue?: string;

		/**
		 * When enabled with the `action` set to `MODIFY`, prevents creation of more than one instance of a header.
		 * Default: false.
		 */
		avoidDuplicateHeaders?: boolean;
	}): Property {
		if (typeof params.action === 'undefined') {
			params.action = 'ADD';
		}

		if (typeof params.standardAddHeaderName === 'undefined' && (params.action as unknown) === 'ADD') {
			params.standardAddHeaderName = 'ACCEPT_ENCODING';
		}

		if (typeof params.standardDeleteHeaderName === 'undefined' && (params.action as unknown) === 'DELETE') {
			params.standardDeleteHeaderName = 'IF_MODIFIED_SINCE';
		}

		if (typeof params.standardModifyHeaderName === 'undefined' && (params.action as unknown) === 'MODIFY') {
			params.standardModifyHeaderName = 'ACCEPT_ENCODING';
		}

		if (typeof params.standardPassHeaderName === 'undefined' && (params.action as unknown) === 'PASS') {
			params.standardPassHeaderName = 'ACCEPT_ENCODING';
		}

		if (typeof params.avoidDuplicateHeaders === 'undefined' && (params.action as unknown) === 'MODIFY') {
			params.avoidDuplicateHeaders = false;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'BEHAVIOR',
				'modifyIncomingRequestHeader',
				{allowsVars: ['customHeaderName', 'headerValue', 'newHeaderValue']},
				params,
			),
		);
	}

	/**
	 * Modify, add, remove, or pass along specific response headers coming downstream from the origin. Depending on the
	 * type of `action` you want to perform, specify the corresponding _standard_ header name, or a `customHeaderName`
	 * if the standard name is set to `OTHER`. The `headerValue` serves as a match condition when the action is `DELETE`
	 * or `MODIFY`, and the `newHeaderValue` applies when the action is `ADD` or `MODIFY`. See also
	 * [`modifyIncomingRequestHeader`](#), [`modifyOutgoingRequestHeader`](#), and [`modifyOutgoingResponseHeader`](#).
	 *
	 * @param {object} params - The parameters needed to configure setModifyIncomingResponseHeader
	 * @param {'ADD' | 'DELETE' | 'MODIFY' | 'PASS'} [params.action] - Either `ADD`, `DELETE`, `MODIFY`, or `PASS`
	 *   incoming HTTP response headers. Default: "ADD".
	 * @param {'CACHE_CONTROL' | 'CONTENT_TYPE' | 'EDGE_CONTROL' | 'EXPIRES' | 'LAST_MODIFIED' | 'OTHER'} [params.standardAddHeaderName]
	 *   - If the value of `action` is `ADD`, this specifies the name of the field to add. Default: "CACHE_CONTROL".
	 *
	 * @param {'CACHE_CONTROL' | 'CONTENT_TYPE' | 'VARY' | 'OTHER'} [params.standardDeleteHeaderName] - If the value of
	 *   `action` is `DELETE`, this specifies the name of the field to remove. Default: "CACHE_CONTROL".
	 * @param {'CACHE_CONTROL' | 'CONTENT_TYPE' | 'EDGE_CONTROL' | 'OTHER'} [params.standardModifyHeaderName] - If the
	 *   value of `action` is `MODIFY`, this specifies the name of the field to modify. Default: "CACHE_CONTROL".
	 * @param {'CACHE_CONTROL' | 'EXPIRES' | 'PRAGMA' | 'OTHER'} [params.standardPassHeaderName] - If the value of
	 *   `action` is `PASS`, this specifies the name of the field to pass through. Default: "CACHE_CONTROL".
	 * @param {string} [params.customHeaderName] - Specifies a custom field name that applies when the relevant
	 *   _standard_ header name is set to `OTHER`. PM variables may appear between '{{' and '}}'.
	 * @param {string} [params.headerValue] - Specifies the header's new value. PM variables may appear between '{{' and
	 *   '}}'.
	 * @param {string} [params.newHeaderValue] - Specifies an HTTP header replacement value. PM variables may appear
	 *   between '{{' and '}}'.
	 * @param {boolean} [params.avoidDuplicateHeaders] - When enabled with the `action` set to `MODIFY`, prevents
	 *   creation of more than one instance of a header. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/modify-incoming-response-header | Akamai Techdocs}
	 */
	setModifyIncomingResponseHeader(params: {
		/** Either `ADD`, `DELETE`, `MODIFY`, or `PASS` incoming HTTP response headers. Default: "ADD". */
		action?: 'ADD' | 'DELETE' | 'MODIFY' | 'PASS';

		/** If the value of `action` is `ADD`, this specifies the name of the field to add. Default: "CACHE_CONTROL". */
		standardAddHeaderName?:
			| 'CACHE_CONTROL'
			| 'CONTENT_TYPE'
			| 'EDGE_CONTROL'
			| 'EXPIRES'
			| 'LAST_MODIFIED'
			| 'OTHER';

		/**
		 * If the value of `action` is `DELETE`, this specifies the name of the field to remove. Default:
		 * "CACHE_CONTROL".
		 */
		standardDeleteHeaderName?: 'CACHE_CONTROL' | 'CONTENT_TYPE' | 'VARY' | 'OTHER';

		/**
		 * If the value of `action` is `MODIFY`, this specifies the name of the field to modify. Default:
		 * "CACHE_CONTROL".
		 */
		standardModifyHeaderName?: 'CACHE_CONTROL' | 'CONTENT_TYPE' | 'EDGE_CONTROL' | 'OTHER';

		/**
		 * If the value of `action` is `PASS`, this specifies the name of the field to pass through. Default:
		 * "CACHE_CONTROL".
		 */
		standardPassHeaderName?: 'CACHE_CONTROL' | 'EXPIRES' | 'PRAGMA' | 'OTHER';

		/**
		 * Specifies a custom field name that applies when the relevant _standard_ header name is set to `OTHER`. PM
		 * variables may appear between '{{' and '}}'.
		 */
		customHeaderName?: string;

		/** Specifies the header's new value. PM variables may appear between '{{' and '}}'. */
		headerValue?: string;

		/** Specifies an HTTP header replacement value. PM variables may appear between '{{' and '}}'. */
		newHeaderValue?: string;

		/**
		 * When enabled with the `action` set to `MODIFY`, prevents creation of more than one instance of a header.
		 * Default: false.
		 */
		avoidDuplicateHeaders?: boolean;
	}): Property {
		if (typeof params.action === 'undefined') {
			params.action = 'ADD';
		}

		if (typeof params.standardAddHeaderName === 'undefined' && (params.action as unknown) === 'ADD') {
			params.standardAddHeaderName = 'CACHE_CONTROL';
		}

		if (typeof params.standardDeleteHeaderName === 'undefined' && (params.action as unknown) === 'DELETE') {
			params.standardDeleteHeaderName = 'CACHE_CONTROL';
		}

		if (typeof params.standardModifyHeaderName === 'undefined' && (params.action as unknown) === 'MODIFY') {
			params.standardModifyHeaderName = 'CACHE_CONTROL';
		}

		if (typeof params.standardPassHeaderName === 'undefined' && (params.action as unknown) === 'PASS') {
			params.standardPassHeaderName = 'CACHE_CONTROL';
		}

		if (typeof params.avoidDuplicateHeaders === 'undefined' && (params.action as unknown) === 'MODIFY') {
			params.avoidDuplicateHeaders = false;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'BEHAVIOR',
				'modifyIncomingResponseHeader',
				{allowsVars: ['customHeaderName', 'headerValue', 'newHeaderValue']},
				params,
			),
		);
	}

	/**
	 * Modify, add, remove, or pass along specific request headers going upstream towards the origin. Depending on the
	 * type of `action` you want to perform, specify the corresponding _standard_ header name, or a `customHeaderName`
	 * if the standard name is set to `OTHER`. The `headerValue` serves as a match condition when the action is `DELETE`
	 * or `MODIFY`, and the `newHeaderValue` applies when the action is `ADD` or `MODIFY`. Whole-text replacements apply
	 * when the action is `MODIFY`, and substitutions apply when set to `REGEX`. See also
	 * [`modifyIncomingRequestHeader`](#), [`modifyIncomingResponseHeader`](#), and
	 * [`modifyOutgoingResponseHeader`](#).
	 *
	 * @param {object} params - The parameters needed to configure setModifyOutgoingRequestHeader
	 * @param {'ADD' | 'DELETE' | 'MODIFY' | 'REGEX'} [params.action] - Either `ADD` or `DELETE` outgoing HTTP request
	 *   headers, `MODIFY` their fixed values, or specify a `REGEX` pattern to transform them. Default: "ADD".
	 * @param {'USER_AGENT' | 'OTHER'} [params.standardAddHeaderName] - If the value of `action` is `ADD`, this
	 *   specifies the name of the field to add. Default: "USER_AGENT".
	 * @param {'PRAGMA' | 'USER_AGENT' | 'VIA' | 'OTHER'} [params.standardDeleteHeaderName] - If the value of `action`
	 *   is `DELETE`, this specifies the name of the field to remove. Default: "PRAGMA".
	 * @param {'USER_AGENT' | 'OTHER'} [params.standardModifyHeaderName] - If the value of `action` is `MODIFY` or
	 *   `REGEX`, this specifies the name of the field to modify. Default: "USER_AGENT".
	 * @param {string} [params.customHeaderName] - Specifies a custom field name that applies when the relevant
	 *   _standard_ header name is set to `OTHER`. PM variables may appear between '{{' and '}}'.
	 * @param {string} [params.headerValue] - Specifies the new header value. PM variables may appear between '{{' and
	 *   '}}'.
	 * @param {string} [params.newHeaderValue] - Specifies an HTTP header replacement value. PM variables may appear
	 *   between '{{' and '}}'.
	 * @param {string} [params.regexHeaderMatch] - Specifies a Perl-compatible regular expression to match within the
	 *   header value. PM variables may appear between '{{' and '}}'.
	 * @param {string} [params.regexHeaderReplace] - Specifies text that replaces the `regexHeaderMatch` pattern within
	 *   the header value. PM variables may appear between '{{' and '}}'.
	 * @param {boolean} [params.matchMultiple] - When enabled with the `action` set to `REGEX`, replaces all occurrences
	 *   of the matched regular expression, otherwise only the first match if disabled. Default: false.
	 * @param {boolean} [params.avoidDuplicateHeaders] - When enabled with the `action` set to `MODIFY`, prevents
	 *   creation of more than one instance of a header. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/modify-outgoing-req-header | Akamai Techdocs}
	 */
	setModifyOutgoingRequestHeader(params: {
		/**
		 * Either `ADD` or `DELETE` outgoing HTTP request headers, `MODIFY` their fixed values, or specify a `REGEX`
		 * pattern to transform them. Default: "ADD".
		 */
		action?: 'ADD' | 'DELETE' | 'MODIFY' | 'REGEX';

		/** If the value of `action` is `ADD`, this specifies the name of the field to add. Default: "USER_AGENT". */
		standardAddHeaderName?: 'USER_AGENT' | 'OTHER';

		/** If the value of `action` is `DELETE`, this specifies the name of the field to remove. Default: "PRAGMA". */
		standardDeleteHeaderName?: 'PRAGMA' | 'USER_AGENT' | 'VIA' | 'OTHER';

		/**
		 * If the value of `action` is `MODIFY` or `REGEX`, this specifies the name of the field to modify. Default:
		 * "USER_AGENT".
		 */
		standardModifyHeaderName?: 'USER_AGENT' | 'OTHER';

		/**
		 * Specifies a custom field name that applies when the relevant _standard_ header name is set to `OTHER`. PM
		 * variables may appear between '{{' and '}}'.
		 */
		customHeaderName?: string;

		/** Specifies the new header value. PM variables may appear between '{{' and '}}'. */
		headerValue?: string;

		/** Specifies an HTTP header replacement value. PM variables may appear between '{{' and '}}'. */
		newHeaderValue?: string;

		/**
		 * Specifies a Perl-compatible regular expression to match within the header value. PM variables may appear
		 * between '{{' and '}}'.
		 */
		regexHeaderMatch?: string;

		/**
		 * Specifies text that replaces the `regexHeaderMatch` pattern within the header value. PM variables may appear
		 * between '{{' and '}}'.
		 */
		regexHeaderReplace?: string;

		/**
		 * When enabled with the `action` set to `REGEX`, replaces all occurrences of the matched regular expression,
		 * otherwise only the first match if disabled. Default: false.
		 */
		matchMultiple?: boolean;

		/**
		 * When enabled with the `action` set to `MODIFY`, prevents creation of more than one instance of a header.
		 * Default: false.
		 */
		avoidDuplicateHeaders?: boolean;
	}): Property {
		if (typeof params.action === 'undefined') {
			params.action = 'ADD';
		}

		if (typeof params.standardAddHeaderName === 'undefined' && (params.action as unknown) === 'ADD') {
			params.standardAddHeaderName = 'USER_AGENT';
		}

		if (typeof params.standardDeleteHeaderName === 'undefined' && (params.action as unknown) === 'DELETE') {
			params.standardDeleteHeaderName = 'PRAGMA';
		}

		if (
			typeof params.standardModifyHeaderName === 'undefined' &&
			((params.action as unknown) === 'MODIFY' || (params.action as unknown) === 'REGEX')
		) {
			params.standardModifyHeaderName = 'USER_AGENT';
		}

		if (typeof params.matchMultiple === 'undefined' && (params.action as unknown) === 'REGEX') {
			params.matchMultiple = false;
		}

		if (typeof params.avoidDuplicateHeaders === 'undefined' && (params.action as unknown) === 'MODIFY') {
			params.avoidDuplicateHeaders = false;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'BEHAVIOR',
				'modifyOutgoingRequestHeader',
				{
					allowsVars: [
						'customHeaderName',
						'headerValue',
						'newHeaderValue',
						'regexHeaderMatch',
						'regexHeaderReplace',
					],
				},
				params,
			),
		);
	}

	/**
	 * Modify, add, remove, or pass along specific response headers going downstream towards the client. Depending on
	 * the type of `action` you want to perform, specify the corresponding _standard_ header name, or a
	 * `customHeaderName` if the standard name is set to `OTHER`. The `headerValue` serves as a match condition when the
	 * action is `DELETE` or `MODIFY`, and the `newHeaderValue` applies when the action is `ADD` or `MODIFY`. Whole-text
	 * replacements apply when the action is `MODIFY`, and substitutions apply when set to `REGEX`. See also
	 * [`modifyIncomingRequestHeader`](#), [`modifyIncomingResponseHeader`](#), and [`modifyOutgoingRequestHeader`](#)
	 *
	 * @param {object} params - The parameters needed to configure setModifyOutgoingResponseHeader
	 * @param {'ADD' | 'DELETE' | 'MODIFY' | 'REGEX'} [params.action] - Either `ADD` or `DELETE` outgoing HTTP response
	 *   headers, `MODIFY` their fixed values, or specify a `REGEX` pattern to transform them. Default: "ADD".
	 * @param {'CACHE_CONTROL'
	 * 	| 'CONTENT_DISPOSITION'
	 * 	| 'CONTENT_TYPE'
	 * 	| 'EDGE_CONTROL'
	 * 	| 'P3P'
	 * 	| 'PRAGMA'
	 * 	| 'ACCESS_CONTROL_ALLOW_ORIGIN'
	 * 	| 'ACCESS_CONTROL_ALLOW_METHODS'
	 * 	| 'ACCESS_CONTROL_ALLOW_HEADERS'
	 * 	| 'ACCESS_CONTROL_EXPOSE_HEADERS'
	 * 	| 'ACCESS_CONTROL_ALLOW_CREDENTIALS'
	 * 	| 'ACCESS_CONTROL_MAX_AGE'
	 * 	| 'OTHER'} [params.standardAddHeaderName]
	 *   - If the value of `action` is `ADD`, this specifies the name of the field to add. Default: "CACHE_CONTROL".
	 *
	 * @param {'CACHE_CONTROL'
	 * 	| 'CONTENT_DISPOSITION'
	 * 	| 'CONTENT_TYPE'
	 * 	| 'EXPIRES'
	 * 	| 'P3P'
	 * 	| 'PRAGMA'
	 * 	| 'ACCESS_CONTROL_ALLOW_ORIGIN'
	 * 	| 'ACCESS_CONTROL_ALLOW_METHODS'
	 * 	| 'ACCESS_CONTROL_ALLOW_HEADERS'
	 * 	| 'ACCESS_CONTROL_EXPOSE_HEADERS'
	 * 	| 'ACCESS_CONTROL_ALLOW_CREDENTIALS'
	 * 	| 'ACCESS_CONTROL_MAX_AGE'
	 * 	| 'OTHER'} [params.standardDeleteHeaderName]
	 *   - If the value of `action` is `DELETE`, this specifies the name of the field to remove. Default: "CACHE_CONTROL".
	 *
	 * @param {'CACHE_CONTROL'
	 * 	| 'CONTENT_DISPOSITION'
	 * 	| 'CONTENT_TYPE'
	 * 	| 'P3P'
	 * 	| 'PRAGMA'
	 * 	| 'ACCESS_CONTROL_ALLOW_ORIGIN'
	 * 	| 'ACCESS_CONTROL_ALLOW_METHODS'
	 * 	| 'ACCESS_CONTROL_ALLOW_HEADERS'
	 * 	| 'ACCESS_CONTROL_EXPOSE_HEADERS'
	 * 	| 'ACCESS_CONTROL_ALLOW_CREDENTIALS'
	 * 	| 'ACCESS_CONTROL_MAX_AGE'
	 * 	| 'OTHER'} [params.standardModifyHeaderName]
	 *   - If the value of `action` is `MODIFY` or `REGEX`, this specifies the name of the field to modify. Default:
	 *       "CACHE_CONTROL".
	 *
	 * @param {string} [params.customHeaderName] - Specifies a custom field name that applies when the relevant
	 *   _standard_ header name is set to `OTHER`. PM variables may appear between '{{' and '}}'.
	 * @param {string} [params.headerValue] - Specifies the existing value of the header to match. PM variables may
	 *   appear between '{{' and '}}'.
	 * @param {string} [params.newHeaderValue] - Specifies the new HTTP header replacement value. PM variables may
	 *   appear between '{{' and '}}'.
	 * @param {string} [params.regexHeaderMatch] - Specifies a Perl-compatible regular expression to match within the
	 *   header value.
	 * @param {string} [params.regexHeaderReplace] - Specifies text that replaces the `regexHeaderMatch` pattern within
	 *   the header value. PM variables may appear between '{{' and '}}'.
	 * @param {boolean} [params.matchMultiple] - When enabled with the `action` set to `REGEX`, replaces all occurrences
	 *   of the matched regular expression, otherwise only the first match if disabled. Default: false.
	 * @param {boolean} [params.avoidDuplicateHeaders] - When enabled with the `action` set to `MODIFY`, prevents
	 *   creation of more than one instance of a header. The last header clobbers others with the same name. This option
	 *   affects the entire set of outgoing headers, and is not confined to the subset of regular expression matches.
	 *   Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/modify-outgoing-response-header | Akamai Techdocs}
	 */
	setModifyOutgoingResponseHeader(params: {
		/**
		 * Either `ADD` or `DELETE` outgoing HTTP response headers, `MODIFY` their fixed values, or specify a `REGEX`
		 * pattern to transform them. Default: "ADD".
		 */
		action?: 'ADD' | 'DELETE' | 'MODIFY' | 'REGEX';

		/** If the value of `action` is `ADD`, this specifies the name of the field to add. Default: "CACHE_CONTROL". */
		standardAddHeaderName?:
			| 'CACHE_CONTROL'
			| 'CONTENT_DISPOSITION'
			| 'CONTENT_TYPE'
			| 'EDGE_CONTROL'
			| 'P3P'
			| 'PRAGMA'
			| 'ACCESS_CONTROL_ALLOW_ORIGIN'
			| 'ACCESS_CONTROL_ALLOW_METHODS'
			| 'ACCESS_CONTROL_ALLOW_HEADERS'
			| 'ACCESS_CONTROL_EXPOSE_HEADERS'
			| 'ACCESS_CONTROL_ALLOW_CREDENTIALS'
			| 'ACCESS_CONTROL_MAX_AGE'
			| 'OTHER';

		/**
		 * If the value of `action` is `DELETE`, this specifies the name of the field to remove. Default:
		 * "CACHE_CONTROL".
		 */
		standardDeleteHeaderName?:
			| 'CACHE_CONTROL'
			| 'CONTENT_DISPOSITION'
			| 'CONTENT_TYPE'
			| 'EXPIRES'
			| 'P3P'
			| 'PRAGMA'
			| 'ACCESS_CONTROL_ALLOW_ORIGIN'
			| 'ACCESS_CONTROL_ALLOW_METHODS'
			| 'ACCESS_CONTROL_ALLOW_HEADERS'
			| 'ACCESS_CONTROL_EXPOSE_HEADERS'
			| 'ACCESS_CONTROL_ALLOW_CREDENTIALS'
			| 'ACCESS_CONTROL_MAX_AGE'
			| 'OTHER';

		/**
		 * If the value of `action` is `MODIFY` or `REGEX`, this specifies the name of the field to modify. Default:
		 * "CACHE_CONTROL".
		 */
		standardModifyHeaderName?:
			| 'CACHE_CONTROL'
			| 'CONTENT_DISPOSITION'
			| 'CONTENT_TYPE'
			| 'P3P'
			| 'PRAGMA'
			| 'ACCESS_CONTROL_ALLOW_ORIGIN'
			| 'ACCESS_CONTROL_ALLOW_METHODS'
			| 'ACCESS_CONTROL_ALLOW_HEADERS'
			| 'ACCESS_CONTROL_EXPOSE_HEADERS'
			| 'ACCESS_CONTROL_ALLOW_CREDENTIALS'
			| 'ACCESS_CONTROL_MAX_AGE'
			| 'OTHER';

		/**
		 * Specifies a custom field name that applies when the relevant _standard_ header name is set to `OTHER`. PM
		 * variables may appear between '{{' and '}}'.
		 */
		customHeaderName?: string;

		/** Specifies the existing value of the header to match. PM variables may appear between '{{' and '}}'. */
		headerValue?: string;

		/** Specifies the new HTTP header replacement value. PM variables may appear between '{{' and '}}'. */
		newHeaderValue?: string;

		/** Specifies a Perl-compatible regular expression to match within the header value. */
		regexHeaderMatch?: string;

		/**
		 * Specifies text that replaces the `regexHeaderMatch` pattern within the header value. PM variables may appear
		 * between '{{' and '}}'.
		 */
		regexHeaderReplace?: string;

		/**
		 * When enabled with the `action` set to `REGEX`, replaces all occurrences of the matched regular expression,
		 * otherwise only the first match if disabled. Default: false.
		 */
		matchMultiple?: boolean;

		/**
		 * When enabled with the `action` set to `MODIFY`, prevents creation of more than one instance of a header. The
		 * last header clobbers others with the same name. This option affects the entire set of outgoing headers, and
		 * is not confined to the subset of regular expression matches. Default: false.
		 */
		avoidDuplicateHeaders?: boolean;
	}): Property {
		if (typeof params.action === 'undefined') {
			params.action = 'ADD';
		}

		if (typeof params.standardAddHeaderName === 'undefined' && (params.action as unknown) === 'ADD') {
			params.standardAddHeaderName = 'CACHE_CONTROL';
		}

		if (typeof params.standardDeleteHeaderName === 'undefined' && (params.action as unknown) === 'DELETE') {
			params.standardDeleteHeaderName = 'CACHE_CONTROL';
		}

		if (
			typeof params.standardModifyHeaderName === 'undefined' &&
			((params.action as unknown) === 'MODIFY' || (params.action as unknown) === 'REGEX')
		) {
			params.standardModifyHeaderName = 'CACHE_CONTROL';
		}

		if (typeof params.matchMultiple === 'undefined' && (params.action as unknown) === 'REGEX') {
			params.matchMultiple = false;
		}

		if (typeof params.avoidDuplicateHeaders === 'undefined' && (params.action as unknown) === 'MODIFY') {
			params.avoidDuplicateHeaders = false;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'BEHAVIOR',
				'modifyOutgoingResponseHeader',
				{allowsVars: ['customHeaderName', 'headerValue', 'newHeaderValue', 'regexHeaderReplace']},
				params,
			),
		);
	}

	/**
	 * Specify the hostname and settings used to contact the origin once service begins. You can use your own origin,
	 * [NetStorage](https://techdocs.akamai.com/netstorage), an Edge Load Balancing origin, or a SaaS dynamic origin.
	 *
	 * @param {object} params - The parameters needed to configure setOrigin
	 * @param {'CUSTOMER'
	 * 	| 'NET_STORAGE'
	 * 	| 'MEDIA_SERVICE_LIVE'
	 * 	| 'EDGE_LOAD_BALANCING_ORIGIN_GROUP'
	 * 	| 'SAAS_DYNAMIC_ORIGIN'} [params.originType]
	 *   - Choose where your content is retrieved from. Default: "CUSTOMER".
	 *
	 * @param {any} [params.netStorage] - Specifies the details of the NetStorage server.
	 * @param {string} [params.originId] - Identifies the Edge Load Balancing origin. This needs to correspond to an
	 *   [`edgeLoadBalancingOrigin`](#) behavior's `id` attribute within the same property.
	 * @param {string} [params.hostname] - Specifies the hostname or IPv4 address of your origin server, from which edge
	 *   servers can retrieve your content. PM variables may appear between '{{' and '}}'.
	 * @param {boolean} [params.secondHostnameEnabled] - Available only for certain products. This specifies whether you
	 *   want to use an additional origin server address. Default: false.
	 * @param {string} [params.secondHostname] - Specifies the origin server's hostname, IPv4 address, or IPv6 address.
	 *   Edge servers retrieve your content from this origin server. PM variables may appear between '{{' and '}}'.
	 * @param {string} [params.mslorigin] - This specifies the media's origin server.
	 * @param {'HOSTNAME' | 'PATH' | 'QUERY_STRING' | 'COOKIE'} [params.saasType] - Specifies the part of the request
	 *   that identifies this SaaS dynamic origin. Default: "HOSTNAME".
	 * @param {boolean} [params.saasCnameEnabled] - Enabling this allows you to use a _CNAME chain_ to determine the
	 *   hostname for this SaaS dynamic origin. Default: false.
	 * @param {number} [params.saasCnameLevel] - Specifies the desired number of hostnames to use in the _CNAME chain_,
	 *   starting backwards from the edge server. Default: 1.
	 * @param {string} [params.saasCookie] - Specifies the name of the cookie that identifies this SaaS dynamic origin.
	 * @param {string} [params.saasQueryString] - Specifies the name of the query parameter that identifies this SaaS
	 *   dynamic origin.
	 * @param {string} [params.saasRegex] - Specifies the Perl-compatible regular expression match that identifies this
	 *   SaaS dynamic origin.
	 * @param {string} [params.saasReplace] - Specifies replacement text for what `saasRegex` matches.
	 * @param {string} [params.saasSuffix] - Specifies the static part of the SaaS dynamic origin.
	 * @param {'REQUEST_HOST_HEADER' | 'ORIGIN_HOSTNAME' | 'CUSTOM'} [params.forwardHostHeader] - When the `originType`
	 *   is set to either `CUSTOMER` or `SAAS_DYNAMIC_ORIGIN`, this specifies which `Host` header to pass to the origin.
	 *   Default: "REQUEST_HOST_HEADER".
	 * @param {string} [params.customForwardHostHeader] - This specifies the name of the custom host header the edge
	 *   server should pass to the origin. PM variables may appear between '{{' and '}}'.
	 * @param {'REQUEST_HOST_HEADER' | 'ORIGIN_HOSTNAME'} [params.cacheKeyHostname] - Specifies the hostname to use when
	 *   forming a cache key. Default: "ORIGIN_HOSTNAME".
	 * @param {'IPV4' | 'DUALSTACK' | 'IPV6'} [params.ipVersion] - Specifies which IP version to use when getting
	 *   content from the origin. Default: "IPV4".
	 * @param {boolean} [params.useUniqueCacheKey] - With a shared `hostname` such as provided by Amazon AWS, sets a
	 *   unique cache key for your content. Default: false.
	 * @param {boolean} [params.compress] - Enables _gzip_ compression for non-NetStorage origins. Default: true.
	 * @param {boolean} [params.enableTrueClientIp] - When enabled on non-NetStorage origins, allows you to send a
	 *   custom header (the `trueClientIpHeader`) identifying the IP address of the immediate client connecting to the
	 *   edge server. This may provide more useful information than the standard `X-Forward-For` header, which proxies
	 *   may modify. Default: true.
	 * @param {string} [params.trueClientIpHeader] - This specifies the name of the field that identifies the end
	 *   client's IP address, for example `True-Client-IP`. Default: "True-Client-IP".
	 * @param {boolean} [params.trueClientIpClientSetting] - If a client sets the `True-Client-IP` header, the edge
	 *   server allows it and passes the value to the origin. Otherwise the edge server removes it and sets the value
	 *   itself. Default: false.
	 * @param {'PLATFORM_SETTINGS' | 'CUSTOM' | 'THIRD_PARTY'} [params.verificationMode] - For non-NetStorage origins,
	 *   maximize security by controlling which certificates edge servers should trust. Default: "PLATFORM_SETTINGS".
	 * @param {boolean} [params.originSni] - For non-NetStorage origins, enabling this adds a Server Name Indication
	 *   (SNI) header in the SSL request sent to the origin, with the origin hostname as the value. See the
	 *   [verification settings in the Origin Server behavior](doc:origin-server#verification-settings) or contact your
	 *   Akamai representative for more information. Default: true.
	 * @param {string[]} [params.customValidCnValues] - Specifies values to look for in the origin certificate's
	 *   `Subject Alternate Name` or `Common Name` fields. Specify `{{Origin Hostname}}` and `{{Forward Host Header}}`
	 *   within the text in the order you want them to be evaluated. (Note that these two template items are not the
	 *   same as in-line [variables](ref:variables), which use the same curly-brace syntax.) Default: ["{{Origin
	 *   Hostname}}","{{Forward Host Header}}"].
	 * @param {'COMBO'
	 * 	| 'STANDARD_CERTIFICATE_AUTHORITIES'
	 * 	| 'CUSTOM_CERTIFICATE_AUTHORITIES'
	 * 	| 'CUSTOM_CERTIFICATES'} [params.originCertsToHonor]
	 *   - Specifies which certificate to trust. Default: "STANDARD_CERTIFICATE_AUTHORITIES".
	 *
	 * @param {any} [params.standardCertificateAuthorities] - Specifies an array of Akamai-managed certificate names.
	 *   Currently, the only allowed value is `akamai-permissive`. Default: ["akamai-permissive"].
	 * @param {any} [params.customCertificateAuthorities] - Specifies an array of certification objects. See the
	 *   [verification settings in the Origin Server behavior](doc:origin-server#verification-settings) or contact your
	 *   Akamai representative for details on this object's requirements. Default: [].
	 * @param {any} [params.customCertificates] - Specifies an array of certification objects. See the [verification
	 *   settings in the Origin Server behavior](doc:origin-server#verification-settings) or contact your Akamai
	 *   representative for details on this object's requirements. Default: [].
	 * @param {number} [params.httpPort] - Specifies the port on your origin server to which edge servers should connect
	 *   for HTTP requests, customarily `80`. Default: 80.
	 * @param {number} [params.httpsPort] - Specifies the port on your origin server to which edge servers should
	 *   connect for secure HTTPS requests, customarily `443`. This option only applies if the property is marked as
	 *   secure. See [Secure property requirements](ref:the-default-rule) for guidance. Default: 443.
	 * @param {boolean} [params.tls13Support] - Enables transport layer security (TLS) version 1.3 for connections to
	 *   your origin server. Default: false.
	 * @param {'DYNAMIC' | 'TLSV1_1' | 'TLSV1_2' | 'TLSV1_3'} [params.minTlsVersion] - Specifies the minimum TLS version
	 *   to use for connections to your origin server. Default: "DYNAMIC".
	 * @param {'DYNAMIC' | 'TLSV1_1' | 'TLSV1_2' | 'TLSV1_3'} [params.maxTlsVersion] - Specifies the maximum TLS version
	 *   to use for connections to your origin server. As best practice, use `DYNAMIC` to automatically apply the latest
	 *   supported version. Default: "DYNAMIC".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/origin-server | Akamai Techdocs}
	 */
	setOrigin(params: {
		/** Choose where your content is retrieved from. Default: "CUSTOMER". */
		originType?:
			| 'CUSTOMER'
			| 'NET_STORAGE'
			| 'MEDIA_SERVICE_LIVE'
			| 'EDGE_LOAD_BALANCING_ORIGIN_GROUP'
			| 'SAAS_DYNAMIC_ORIGIN';

		/** Specifies the details of the NetStorage server. */
		netStorage?: any;

		/**
		 * Identifies the Edge Load Balancing origin. This needs to correspond to an [`edgeLoadBalancingOrigin`](#)
		 * behavior's `id` attribute within the same property.
		 */
		originId?: string;

		/**
		 * Specifies the hostname or IPv4 address of your origin server, from which edge servers can retrieve your
		 * content. PM variables may appear between '{{' and '}}'.
		 */
		hostname?: string;

		/**
		 * Available only for certain products. This specifies whether you want to use an additional origin server
		 * address. Default: false.
		 */
		secondHostnameEnabled?: boolean;

		/**
		 * Specifies the origin server's hostname, IPv4 address, or IPv6 address. Edge servers retrieve your content
		 * from this origin server. PM variables may appear between '{{' and '}}'.
		 */
		secondHostname?: string;

		/** This specifies the media's origin server. */
		mslorigin?: string;

		/** Specifies the part of the request that identifies this SaaS dynamic origin. Default: "HOSTNAME". */
		saasType?: 'HOSTNAME' | 'PATH' | 'QUERY_STRING' | 'COOKIE';

		/**
		 * Enabling this allows you to use a _CNAME chain_ to determine the hostname for this SaaS dynamic origin.
		 * Default: false.
		 */
		saasCnameEnabled?: boolean;

		/**
		 * Specifies the desired number of hostnames to use in the _CNAME chain_, starting backwards from the edge
		 * server. Default: 1.
		 */
		saasCnameLevel?: number;

		/** Specifies the name of the cookie that identifies this SaaS dynamic origin. */
		saasCookie?: string;

		/** Specifies the name of the query parameter that identifies this SaaS dynamic origin. */
		saasQueryString?: string;

		/** Specifies the Perl-compatible regular expression match that identifies this SaaS dynamic origin. */
		saasRegex?: string;

		/** Specifies replacement text for what `saasRegex` matches. */
		saasReplace?: string;

		/** Specifies the static part of the SaaS dynamic origin. */
		saasSuffix?: string;

		/**
		 * When the `originType` is set to either `CUSTOMER` or `SAAS_DYNAMIC_ORIGIN`, this specifies which `Host`
		 * header to pass to the origin. Default: "REQUEST_HOST_HEADER".
		 */
		forwardHostHeader?: 'REQUEST_HOST_HEADER' | 'ORIGIN_HOSTNAME' | 'CUSTOM';

		/**
		 * This specifies the name of the custom host header the edge server should pass to the origin. PM variables may
		 * appear between '{{' and '}}'.
		 */
		customForwardHostHeader?: string;

		/** Specifies the hostname to use when forming a cache key. Default: "ORIGIN_HOSTNAME". */
		cacheKeyHostname?: 'REQUEST_HOST_HEADER' | 'ORIGIN_HOSTNAME';

		/** Specifies which IP version to use when getting content from the origin. Default: "IPV4". */
		ipVersion?: 'IPV4' | 'DUALSTACK' | 'IPV6';

		/**
		 * With a shared `hostname` such as provided by Amazon AWS, sets a unique cache key for your content. Default:
		 * false.
		 */
		useUniqueCacheKey?: boolean;

		/** Enables _gzip_ compression for non-NetStorage origins. Default: true. */
		compress?: boolean;

		/**
		 * When enabled on non-NetStorage origins, allows you to send a custom header (the `trueClientIpHeader`)
		 * identifying the IP address of the immediate client connecting to the edge server. This may provide more
		 * useful information than the standard `X-Forward-For` header, which proxies may modify. Default: true.
		 */
		enableTrueClientIp?: boolean;

		/**
		 * This specifies the name of the field that identifies the end client's IP address, for example
		 * `True-Client-IP`. Default: "True-Client-IP".
		 */
		trueClientIpHeader?: string;

		/**
		 * If a client sets the `True-Client-IP` header, the edge server allows it and passes the value to the origin.
		 * Otherwise the edge server removes it and sets the value itself. Default: false.
		 */
		trueClientIpClientSetting?: boolean;

		/**
		 * For non-NetStorage origins, maximize security by controlling which certificates edge servers should trust.
		 * Default: "PLATFORM_SETTINGS".
		 */
		verificationMode?: 'PLATFORM_SETTINGS' | 'CUSTOM' | 'THIRD_PARTY';

		/**
		 * For non-NetStorage origins, enabling this adds a Server Name Indication (SNI) header in the SSL request sent
		 * to the origin, with the origin hostname as the value. See the [verification settings in the Origin Server
		 * behavior](doc:origin-server#verification-settings) or contact your Akamai representative for more
		 * information. Default: true.
		 */
		originSni?: boolean;

		/**
		 * Specifies values to look for in the origin certificate's `Subject Alternate Name` or `Common Name` fields.
		 * Specify `{{Origin Hostname}}` and `{{Forward Host Header}}` within the text in the order you want them to be
		 * evaluated. (Note that these two template items are not the same as in-line [variables](ref:variables), which
		 * use the same curly-brace syntax.) Default: ["{{Origin Hostname}}","{{Forward Host Header}}"].
		 */
		customValidCnValues?: string[];

		/** Specifies which certificate to trust. Default: "STANDARD_CERTIFICATE_AUTHORITIES". */
		originCertsToHonor?:
			| 'COMBO'
			| 'STANDARD_CERTIFICATE_AUTHORITIES'
			| 'CUSTOM_CERTIFICATE_AUTHORITIES'
			| 'CUSTOM_CERTIFICATES';

		/**
		 * Specifies an array of Akamai-managed certificate names. Currently, the only allowed value is
		 * `akamai-permissive`. Default: ["akamai-permissive"].
		 */
		standardCertificateAuthorities?: any;

		/**
		 * Specifies an array of certification objects. See the [verification settings in the Origin Server
		 * behavior](doc:origin-server#verification-settings) or contact your Akamai representative for details on this
		 * object's requirements. Default: [].
		 */
		customCertificateAuthorities?: any;

		/**
		 * Specifies an array of certification objects. See the [verification settings in the Origin Server
		 * behavior](doc:origin-server#verification-settings) or contact your Akamai representative for details on this
		 * object's requirements. Default: [].
		 */
		customCertificates?: any;

		/**
		 * Specifies the port on your origin server to which edge servers should connect for HTTP requests, customarily
		 * `80`. Default: 80.
		 */
		httpPort?: number;

		/**
		 * Specifies the port on your origin server to which edge servers should connect for secure HTTPS requests,
		 * customarily `443`. This option only applies if the property is marked as secure. See [Secure property
		 * requirements](ref:the-default-rule) for guidance. Default: 443.
		 */
		httpsPort?: number;

		/** Enables transport layer security (TLS) version 1.3 for connections to your origin server. Default: false. */
		tls13Support?: boolean;

		/** Specifies the minimum TLS version to use for connections to your origin server. Default: "DYNAMIC". */
		minTlsVersion?: 'DYNAMIC' | 'TLSV1_1' | 'TLSV1_2' | 'TLSV1_3';

		/**
		 * Specifies the maximum TLS version to use for connections to your origin server. As best practice, use
		 * `DYNAMIC` to automatically apply the latest supported version. Default: "DYNAMIC".
		 */
		maxTlsVersion?: 'DYNAMIC' | 'TLSV1_1' | 'TLSV1_2' | 'TLSV1_3';
	}): Property {
		if (typeof params.originType === 'undefined') {
			params.originType = 'CUSTOMER';
		}

		if (typeof params.secondHostnameEnabled === 'undefined') {
			params.secondHostnameEnabled = false;
		}

		if (typeof params.saasType === 'undefined' && (params.originType as unknown) === 'SAAS_DYNAMIC_ORIGIN') {
			params.saasType = 'HOSTNAME';
		}

		if (typeof params.saasCnameEnabled === 'undefined' && (params.saasType as unknown) === 'HOSTNAME') {
			params.saasCnameEnabled = false;
		}

		if (typeof params.saasCnameLevel === 'undefined' && (params.saasCnameEnabled as unknown) === true) {
			params.saasCnameLevel = 1;
		}

		if (
			typeof params.forwardHostHeader === 'undefined' &&
			params.originType !== undefined &&
			['CUSTOMER', 'SAAS_DYNAMIC_ORIGIN'].includes(params.originType)
		) {
			params.forwardHostHeader = 'REQUEST_HOST_HEADER';
		}

		if (
			typeof params.cacheKeyHostname === 'undefined' &&
			params.originType !== undefined &&
			['CUSTOMER', 'SAAS_DYNAMIC_ORIGIN'].includes(params.originType)
		) {
			params.cacheKeyHostname = 'ORIGIN_HOSTNAME';
		}

		if (
			typeof params.ipVersion === 'undefined' &&
			params.originType !== undefined &&
			['CUSTOMER', 'EDGE_LOAD_BALANCING_ORIGIN_GROUP'].includes(params.originType)
		) {
			params.ipVersion = 'IPV4';
		}

		if (
			typeof params.useUniqueCacheKey === 'undefined' &&
			params.hostname !== undefined &&
			[
				's3.amazonaws.com',
				's3-eu-west-1.amazonaws.com',
				's3-ap-southeast-1.amazonaws.com',
				's3-ap-northeast-1.amazonaws.com',
				's3-us-west-2.amazonaws.com',
				's3-us-west-1.amazonaws.com',
				's3-ap-southeast-2.amazonaws.com',
				's3.eu-central-1.amazonaws.com',
				's3-eu-central-1.amazonaws.com',
				's3.ap-south-1.amazonaws.com',
				's3.eu-west-2.amazonaws.com',
				's3.cn-north-1.amazonaws.com.cn',
				's3-website-us-east-1.amazonaws.com',
				's3.ap-northeast-2.amazonaws.com',
			].includes(params.hostname) &&
			(params.cacheKeyHostname as unknown) === 'ORIGIN_HOSTNAME'
		) {
			params.useUniqueCacheKey = false;
		}

		if (
			typeof params.compress === 'undefined' &&
			params.originType !== undefined &&
			['CUSTOMER', 'EDGE_LOAD_BALANCING_ORIGIN_GROUP', 'SAAS_DYNAMIC_ORIGIN'].includes(params.originType)
		) {
			params.compress = true;
		}

		if (
			typeof params.enableTrueClientIp === 'undefined' &&
			params.originType !== undefined &&
			['CUSTOMER', 'EDGE_LOAD_BALANCING_ORIGIN_GROUP', 'SAAS_DYNAMIC_ORIGIN'].includes(params.originType)
		) {
			params.enableTrueClientIp = true;
		}

		if (typeof params.trueClientIpHeader === 'undefined' && (params.enableTrueClientIp as unknown) === true) {
			params.trueClientIpHeader = 'True-Client-IP';
		}

		if (
			typeof params.trueClientIpClientSetting === 'undefined' &&
			(params.enableTrueClientIp as unknown) === true
		) {
			params.trueClientIpClientSetting = false;
		}

		if (
			typeof params.verificationMode === 'undefined' &&
			params.originType !== undefined &&
			['CUSTOMER', 'EDGE_LOAD_BALANCING_ORIGIN_GROUP', 'SAAS_DYNAMIC_ORIGIN'].includes(params.originType)
		) {
			params.verificationMode = 'PLATFORM_SETTINGS';
		}

		if (
			typeof params.originSni === 'undefined' &&
			params.originType !== undefined &&
			['CUSTOMER', 'EDGE_LOAD_BALANCING_ORIGIN_GROUP', 'SAAS_DYNAMIC_ORIGIN'].includes(params.originType) &&
			params.verificationMode !== undefined &&
			['PLATFORM_SETTINGS', 'CUSTOM', 'THIRD_PARTY'].includes(params.verificationMode)
		) {
			params.originSni = true;
		}

		if (typeof params.customValidCnValues === 'undefined' && (params.verificationMode as unknown) === 'CUSTOM') {
			params.customValidCnValues = ['{{Origin Hostname}}', '{{Forward Host Header}}'];
		}

		if (typeof params.originCertsToHonor === 'undefined' && (params.verificationMode as unknown) === 'CUSTOM') {
			params.originCertsToHonor = 'STANDARD_CERTIFICATE_AUTHORITIES';
		}

		if (
			typeof params.standardCertificateAuthorities === 'undefined' &&
			params.originCertsToHonor !== undefined &&
			['STANDARD_CERTIFICATE_AUTHORITIES', 'COMBO'].includes(params.originCertsToHonor)
		) {
			params.standardCertificateAuthorities = ['akamai-permissive'];
		}

		if (
			typeof params.customCertificateAuthorities === 'undefined' &&
			params.originCertsToHonor !== undefined &&
			['CUSTOM_CERTIFICATE_AUTHORITIES', 'COMBO'].includes(params.originCertsToHonor)
		) {
			params.customCertificateAuthorities = [];
		}

		if (
			typeof params.customCertificates === 'undefined' &&
			params.originCertsToHonor !== undefined &&
			['CUSTOM_CERTIFICATES', 'COMBO'].includes(params.originCertsToHonor)
		) {
			params.customCertificates = [];
		}

		if (
			typeof params.httpPort === 'undefined' &&
			params.originType !== undefined &&
			['CUSTOMER', 'SAAS_DYNAMIC_ORIGIN'].includes(params.originType)
		) {
			params.httpPort = 80;
		}

		if (
			typeof params.httpsPort === 'undefined' &&
			params.originType !== undefined &&
			['CUSTOMER', 'SAAS_DYNAMIC_ORIGIN'].includes(params.originType)
		) {
			params.httpsPort = 443;
		}

		if (
			typeof params.tls13Support === 'undefined' &&
			params.originType !== undefined &&
			['CUSTOMER', 'MEDIA_SERVICE_LIVE'].includes(params.originType)
		) {
			params.tls13Support = false;
		}

		if (
			typeof params.minTlsVersion === 'undefined' &&
			params.originType !== undefined &&
			['CUSTOMER', 'MEDIA_SERVICE_LIVE'].includes(params.originType)
		) {
			params.minTlsVersion = 'DYNAMIC';
		}

		if (
			typeof params.maxTlsVersion === 'undefined' &&
			params.originType !== undefined &&
			['CUSTOMER', 'MEDIA_SERVICE_LIVE'].includes(params.originType)
		) {
			params.maxTlsVersion = 'DYNAMIC';
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'BEHAVIOR',
				'origin',
				{allowsVars: ['hostname', 'secondHostname', 'customForwardHostHeader']},
				params,
			),
		);
	}

	/**
	 * Specifies characteristics of the origin. Akamai uses this information to optimize your metadata configuration,
	 * which may result in better origin offload and end-user performance. See also [`clientCharacteristics`](#) and
	 * various product-specific behaviors whose names are prefixed _contentCharacteristics_.
	 *
	 * @param {object} params - The parameters needed to configure setOriginCharacteristics
	 * @param {'AUTOMATIC'
	 * 	| 'SIGNATURE_HEADER_AUTHENTICATION'
	 * 	| 'MSL_AUTHENTICATION'
	 * 	| 'AWS'
	 * 	| 'GCS_HMAC_AUTHENTICATION'
	 * 	| 'AWS_STS'} [params.authenticationMethod]
	 *   - Specifies the authentication method. Default: "AUTOMATIC".
	 *
	 * @param {1 | 2 | 3 | 4 | 5} [params.encodingVersion] - Specifies the version of the encryption algorithm, an
	 *   integer from `1` to `5`. Default: 5.
	 * @param {boolean} [params.useCustomSignString] - Specifies whether to customize your signed string. Default:
	 *   false.
	 * @param {(
	 * 	| 'AK_METHOD'
	 * 	| 'AK_SCHEME'
	 * 	| 'AK_HOSTHEADER'
	 * 	| 'AK_DOMAIN'
	 * 	| 'AK_URL'
	 * 	| 'AK_PATH'
	 * 	| 'AK_QUERY'
	 * 	| 'AK_FILENAME'
	 * 	| 'AK_EXTENSION'
	 * 	| 'AK_CLIENT_REAL_IP'
	 * )[]} [params.customSignString]
	 *   - Specifies the data to be encrypted as a series of enumerated variable names. See [Built-in system
	 *       variables](ref:built-in-system-variables) for guidance on each.
	 *
	 * @param {string} [params.secretKey] - Specifies the shared secret key.
	 * @param {string} [params.nonce] - Specifies the nonce.
	 * @param {string} [params.mslkey] - Specifies the access key provided by the hosting service.
	 * @param {string} [params.mslname] - Specifies the origin name provided by the hosting service.
	 * @param {boolean} [params.accessKeyEncryptedStorage] - Enables secure use of access keys defined in Cloud Access
	 *   Manager. Access keys store encrypted authentication details required to sign requests to cloud origins. If you
	 *   disable this option, you'll need to store the authentication details unencrypted. Default: false.
	 * @param {string} [params.gcsAccessKeyVersionGuid] - Identifies the unique `gcsAccessKeyVersionGuid` access key
	 *   [created](https://techdocs.akamai.com/cloud-access-mgr/reference) in Cloud Access Manager to sign your requests
	 *   to Google Cloud Storage in interoperability mode.
	 * @param {string} [params.gcsHmacKeyAccessId] - Specifies the active access ID linked to your Google account.
	 * @param {string} [params.gcsHmacKeySecret] - Specifies the secret linked to the access ID that you want to use to
	 *   sign requests to Google Cloud Storage.
	 * @param {string} [params.awsAccessKeyVersionGuid] - Identifies the unique `awsAccessKeyVersionGuid` access key
	 *   [created](https://techdocs.akamai.com/cloud-access-mgr/reference) in Cloud Access Manager to sign your requests
	 *   to AWS S3.
	 * @param {string} [params.awsAccessKeyId] - Specifies active access key ID linked to your AWS account.
	 * @param {string} [params.awsSecretAccessKey] - Specifies the secret linked to the access key identifier that you
	 *   want to use to sign requests to AWS.
	 * @param {string} [params.awsRegion] - This specifies the AWS region code of the location where your bucket
	 *   resides.
	 * @param {string} [params.awsHost] - This specifies the AWS hostname, without `http://` or `https://` prefixes. If
	 *   you leave this option empty, it inherits the hostname from the [`origin`](#) behavior.
	 * @param {string} [params.awsService] - This specifies the subdomain of your AWS service. It precedes
	 *   `amazonaws.com` or the region code in the AWS hostname. For example, `s3.amazonaws.com`. Default: "s3".
	 * @param {boolean} [params.propertyIdTag] - Whether to include the property identifier for this delivery
	 *   configuration as an additional identifier tag in the Assume Role verification call to AWS. You'll need to
	 *   include the property identifier (`AK_ARLID`) in a condition in your [AWS IAM
	 *   policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) for validation. Default: false.
	 * @param {boolean} [params.hostnameTag] - Whether to include the hostname used to access this delivery
	 *   configuration as an additional identifier tag in the Assume Role verification call to AWS. You'll need to
	 *   include this hostname (`AK_HOST`) in a condition in your [AWS IAM
	 *   policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) for validation. Default: false.
	 * @param {string} [params.roleArn] - The Amazon Resource Name (ARN) of the [AWS IAM
	 *   role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) you want to use. This role needs to be
	 *   configured with the proper permissions for your target resources. The [AWS IAM
	 *   policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) needs to contain the trust
	 *   relationships defining other users that can assume this role.
	 * @param {string} [params.awsArRegion] - Specifies the AWS region code that represents the location of your AWS
	 *   bucket.
	 * @param {string} [params.endPointService] - Specifies the code of your AWS service. It precedes `.amazonaws.com`
	 *   or the region code in your AWS hostname. Default: "s3".
	 * @param {'EUROPE'
	 * 	| 'NORTH_AMERICA'
	 * 	| 'LATIN_AMERICA'
	 * 	| 'SOUTH_AMERICA'
	 * 	| 'NORDICS'
	 * 	| 'ASIA_PACIFIC'
	 * 	| 'OTHER_AMERICAS'
	 * 	| 'OTHER_APJ'
	 * 	| 'OTHER_EMEA'
	 * 	| 'AUSTRALIA'
	 * 	| 'GERMANY'
	 * 	| 'INDIA'
	 * 	| 'ITALY'
	 * 	| 'JAPAN'
	 * 	| 'MEXICO'
	 * 	| 'TAIWAN'
	 * 	| 'UNITED_KINGDOM'
	 * 	| 'US_EAST'
	 * 	| 'US_CENTRAL'
	 * 	| 'US_WEST'
	 * 	| 'GLOBAL_MULTI_GEO'
	 * 	| 'OTHER'
	 * 	| 'UNKNOWN'
	 * 	| 'ADC'} [params.country]
	 *   - Specifies the origin's geographic region. Default: "UNKNOWN".
	 *
	 * @param {string} [params.directConnectGeo] - Provides a region used by Akamai Direct Connection.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/origin-charac | Akamai Techdocs}
	 */
	setOriginCharacteristics(params: {
		/** Specifies the authentication method. Default: "AUTOMATIC". */
		authenticationMethod?:
			| 'AUTOMATIC'
			| 'SIGNATURE_HEADER_AUTHENTICATION'
			| 'MSL_AUTHENTICATION'
			| 'AWS'
			| 'GCS_HMAC_AUTHENTICATION'
			| 'AWS_STS';

		/** Specifies the version of the encryption algorithm, an integer from `1` to `5`. Default: 5. */
		encodingVersion?: 1 | 2 | 3 | 4 | 5;

		/** Specifies whether to customize your signed string. Default: false. */
		useCustomSignString?: boolean;

		/**
		 * Specifies the data to be encrypted as a series of enumerated variable names. See [Built-in system
		 * variables](ref:built-in-system-variables) for guidance on each.
		 */
		customSignString?: Array<
			| 'AK_METHOD'
			| 'AK_SCHEME'
			| 'AK_HOSTHEADER'
			| 'AK_DOMAIN'
			| 'AK_URL'
			| 'AK_PATH'
			| 'AK_QUERY'
			| 'AK_FILENAME'
			| 'AK_EXTENSION'
			| 'AK_CLIENT_REAL_IP'
		>;

		/** Specifies the shared secret key. */
		secretKey?: string;

		/** Specifies the nonce. */
		nonce?: string;

		/** Specifies the access key provided by the hosting service. */
		mslkey?: string;

		/** Specifies the origin name provided by the hosting service. */
		mslname?: string;

		/**
		 * Enables secure use of access keys defined in Cloud Access Manager. Access keys store encrypted authentication
		 * details required to sign requests to cloud origins. If you disable this option, you'll need to store the
		 * authentication details unencrypted. Default: false.
		 */
		accessKeyEncryptedStorage?: boolean;

		/**
		 * Identifies the unique `gcsAccessKeyVersionGuid` access key
		 * [created](https://techdocs.akamai.com/cloud-access-mgr/reference) in Cloud Access Manager to sign your
		 * requests to Google Cloud Storage in interoperability mode.
		 */
		gcsAccessKeyVersionGuid?: string;

		/** Specifies the active access ID linked to your Google account. */
		gcsHmacKeyAccessId?: string;

		/** Specifies the secret linked to the access ID that you want to use to sign requests to Google Cloud Storage. */
		gcsHmacKeySecret?: string;

		/**
		 * Identifies the unique `awsAccessKeyVersionGuid` access key
		 * [created](https://techdocs.akamai.com/cloud-access-mgr/reference) in Cloud Access Manager to sign your
		 * requests to AWS S3.
		 */
		awsAccessKeyVersionGuid?: string;

		/** Specifies active access key ID linked to your AWS account. */
		awsAccessKeyId?: string;

		/** Specifies the secret linked to the access key identifier that you want to use to sign requests to AWS. */
		awsSecretAccessKey?: string;

		/** This specifies the AWS region code of the location where your bucket resides. */
		awsRegion?: string;

		/**
		 * This specifies the AWS hostname, without `http://` or `https://` prefixes. If you leave this option empty, it
		 * inherits the hostname from the [`origin`](#) behavior.
		 */
		awsHost?: string;

		/**
		 * This specifies the subdomain of your AWS service. It precedes `amazonaws.com` or the region code in the AWS
		 * hostname. For example, `s3.amazonaws.com`. Default: "s3".
		 */
		awsService?: string;

		/**
		 * Whether to include the property identifier for this delivery configuration as an additional identifier tag in
		 * the Assume Role verification call to AWS. You'll need to include the property identifier (`AK_ARLID`) in a
		 * condition in your [AWS IAM policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) for
		 * validation. Default: false.
		 */
		propertyIdTag?: boolean;

		/**
		 * Whether to include the hostname used to access this delivery configuration as an additional identifier tag in
		 * the Assume Role verification call to AWS. You'll need to include this hostname (`AK_HOST`) in a condition in
		 * your [AWS IAM policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) for validation.
		 * Default: false.
		 */
		hostnameTag?: boolean;

		/**
		 * The Amazon Resource Name (ARN) of the [AWS IAM
		 * role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) you want to use. This role needs to be
		 * configured with the proper permissions for your target resources. The [AWS IAM
		 * policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) needs to contain the trust
		 * relationships defining other users that can assume this role.
		 */
		roleArn?: string;

		/** Specifies the AWS region code that represents the location of your AWS bucket. */
		awsArRegion?: string;

		/**
		 * Specifies the code of your AWS service. It precedes `.amazonaws.com` or the region code in your AWS hostname.
		 * Default: "s3".
		 */
		endPointService?: string;

		/** Specifies the origin's geographic region. Default: "UNKNOWN". */
		country?:
			| 'EUROPE'
			| 'NORTH_AMERICA'
			| 'LATIN_AMERICA'
			| 'SOUTH_AMERICA'
			| 'NORDICS'
			| 'ASIA_PACIFIC'
			| 'OTHER_AMERICAS'
			| 'OTHER_APJ'
			| 'OTHER_EMEA'
			| 'AUSTRALIA'
			| 'GERMANY'
			| 'INDIA'
			| 'ITALY'
			| 'JAPAN'
			| 'MEXICO'
			| 'TAIWAN'
			| 'UNITED_KINGDOM'
			| 'US_EAST'
			| 'US_CENTRAL'
			| 'US_WEST'
			| 'GLOBAL_MULTI_GEO'
			| 'OTHER'
			| 'UNKNOWN'
			| 'ADC';

		/** Provides a region used by Akamai Direct Connection. */
		directConnectGeo?: string;
	}): Property {
		if (typeof params.authenticationMethod === 'undefined') {
			params.authenticationMethod = 'AUTOMATIC';
		}

		if (
			typeof params.encodingVersion === 'undefined' &&
			(params.authenticationMethod as unknown) === 'SIGNATURE_HEADER_AUTHENTICATION'
		) {
			params.encodingVersion = 5;
		}

		if (
			typeof params.useCustomSignString === 'undefined' &&
			(params.authenticationMethod as unknown) === 'SIGNATURE_HEADER_AUTHENTICATION'
		) {
			params.useCustomSignString = false;
		}

		if (
			typeof params.accessKeyEncryptedStorage === 'undefined' &&
			params.authenticationMethod !== undefined &&
			['AWS', 'GCS_HMAC_AUTHENTICATION'].includes(params.authenticationMethod)
		) {
			params.accessKeyEncryptedStorage = false;
		}

		if (typeof params.awsService === 'undefined' && (params.authenticationMethod as unknown) === 'AWS') {
			params.awsService = 's3';
		}

		if (typeof params.propertyIdTag === 'undefined' && (params.authenticationMethod as unknown) === 'AWS_STS') {
			params.propertyIdTag = false;
		}

		if (typeof params.hostnameTag === 'undefined' && (params.authenticationMethod as unknown) === 'AWS_STS') {
			params.hostnameTag = false;
		}

		if (typeof params.endPointService === 'undefined' && (params.authenticationMethod as unknown) === 'AWS_STS') {
			params.endPointService = 's3';
		}

		if (typeof params.country === 'undefined') {
			params.country = 'UNKNOWN';
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'originCharacteristics', {}, params),
		);
	}

	/**
	 * Origin IP Access Control List limits the traffic to your origin. It only allows requests from specific edge
	 * servers that are configured as part of a supernet defined by CIDR blocks.
	 *
	 * @param {object} params - The parameters needed to configure setOriginIpAcl
	 * @param {boolean} [params.enable] - Enables the Origin IP Access Control List behavior. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/origin-ip-access-control | Akamai Techdocs}
	 */
	setOriginIpAcl(params: {
		/** Enables the Origin IP Access Control List behavior. Default: true. */
		enable?: boolean;
	}): Property {
		if (typeof params.enable === 'undefined') {
			params.enable = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'originIpAcl', {}, params));
	}

	/**
	 * This behavior activates _persistent connections_ between edge servers and clients, which allow for better
	 * performance and more efficient use of resources. Compare with the [`persistentConnection`](#) behavior, which
	 * configures persistent connections for the entire journey from origin to edge to client. Contact Akamai
	 * Professional Services for help configuring either. This behavior is only supported with the HTTP/1.1 networking
	 * protocol that's automatically enabled in all properties. If you include this behavior in the same rule with
	 * [`http2`](#) or [`http3`](#), edge servers honor requests using either of these protocols, but the settings
	 * specified in the `persistentClientConnection` behavior won't apply. Both `http2` and `http3` apply persistent
	 * connections automatically. > **Warning**. Disabling or removing this behavior may negatively affect performance.
	 *
	 * @param {object} params - The parameters needed to configure setPersistentClientConnection
	 * @param {boolean} [params.enabled] - Enables the persistent connections behavior. Default: true.
	 * @param {string} [params.timeout] - Specifies the timeout period after which edge server closes the persistent
	 *   connection with the client, 500 seconds by default. Default: "500s".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/persistent-connections-client-to-edge | Akamai Techdocs}
	 */
	setPersistentClientConnection(params: {
		/** Enables the persistent connections behavior. Default: true. */
		enabled?: boolean;

		/**
		 * Specifies the timeout period after which edge server closes the persistent connection with the client, 500
		 * seconds by default. Default: "500s".
		 */
		timeout?: string;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.timeout === 'undefined' && (params.enabled as unknown) === true) {
			params.timeout = '500s';
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'persistentClientConnection', {}, params),
		);
	}

	/**
	 * This behavior enables more efficient _persistent connections_ from origin to edge server to client. Compare with
	 * the [`persistentClientConnection`](#) behavior, which customizes persistent connections from edge to client.
	 * Contact Akamai Professional Services for help configuring either. > **Warning**. Disabling this behavior wastes
	 * valuable browser resources. Leaving connections open too long makes them vulnerable to attack. Avoid both of
	 * these scenarios.
	 *
	 * @param {object} params - The parameters needed to configure setPersistentConnection
	 * @param {boolean} [params.enabled] - Enables persistent connections. Default: true.
	 * @param {string} [params.timeout] - Specifies the timeout period after which edge server closes a persistent
	 *   connection. Default: "5m".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/persistent-connections-edge-to-origin | Akamai Techdocs}
	 */
	setPersistentConnection(params: {
		/** Enables persistent connections. Default: true. */
		enabled?: boolean;

		/** Specifies the timeout period after which edge server closes a persistent connection. Default: "5m". */
		timeout?: string;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.timeout === 'undefined' && (params.enabled as unknown) === true) {
			params.timeout = '5m';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'persistentConnection', {}, params));
	}

	/**
	 * Marks content covered by the current rule as sensitive _personally identifiable information_ that needs to be
	 * treated as secure and private. That includes anything involving personal information: name, social security
	 * number, date and place of birth, mother's maiden name, biometric data, or any other data linked to an individual.
	 * If you attempt to save a property with such a rule that also caches or logs sensitive content, the added behavior
	 * results in a validation error. > **Warning**. This feature only identifies some vulnerabilities. For example, it
	 * does not prevent you from including secure information in a query string or writing it to an origin folder. It
	 * also can't tell whether the SSL protocol is in effect.
	 *
	 * @param {object} params - The parameters needed to configure setPersonallyIdentifiableInformation
	 * @param {boolean} [params.enabled] - When enabled, marks content as personally identifiable information (PII).
	 *   Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/personally-identifiable-info-pii | Akamai Techdocs}
	 */
	setPersonallyIdentifiableInformation(params: {
		/** When enabled, marks content as personally identifiable information (PII). Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'personallyIdentifiableInformation', {}, params),
		);
	}

	/**
	 * Instructs edge servers to retrieve content linked from requested pages as they load, rather than waiting for
	 * separate requests for the linked content. This behavior applies depending on the rule's set of matching
	 * conditions. Use in conjunction with the [`prefetchable`](#) behavior, which specifies the set of objects to
	 * prefetch.
	 *
	 * @param {object} params - The parameters needed to configure setPrefetch
	 * @param {boolean} [params.enabled] - Applies prefetching behavior when enabled. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/prefetching | Akamai Techdocs}
	 */
	setPrefetch(params: {
		/** Applies prefetching behavior when enabled. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'prefetch', {}, params));
	}

	/**
	 * Allow matching objects to prefetch into the edge cache as the parent page that links to them loads, rather than
	 * waiting for a direct request. This behavior applies depending on the rule's set of matching conditions. Use
	 * [`prefetch`](#) to enable the overall behavior for parent pages that contain links to the object. To apply this
	 * behavior, you need to match on a [`filename`](#) or [`fileExtension`](#).
	 *
	 * @param {object} params - The parameters needed to configure setPrefetchable
	 * @param {boolean} [params.enabled] - Allows matching content to prefetch when referenced on a requested parent
	 *   page. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/prefetchable-objects | Akamai Techdocs}
	 */
	setPrefetchable(params: {
		/** Allows matching content to prefetch when referenced on a requested parent page. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'prefetchable', {}, params));
	}

	/**
	 * Refresh cached content before its time-to-live (TTL) expires, to keep end users from having to wait for the
	 * origin to provide fresh content. Prefreshing starts asynchronously based on a percentage of remaining TTL. The
	 * edge serves the prefreshed content only after the TTL expires. If the percentage is set too high, and there is
	 * not enough time to retrieve the object, the end user waits for it to refresh from the origin, as is true by
	 * default without this prefresh behavior enabled. The edge does not serve stale content.
	 *
	 * @param {object} params - The parameters needed to configure setPrefreshCache
	 * @param {boolean} [params.enabled] - Enables the cache prefreshing behavior. Default: true.
	 * @param {number} [params.prefreshval] - Specifies when the prefresh occurs as a percentage of the TTL. For
	 *   example, for an object whose cache has 10 minutes left to live, and an origin response that is routinely less
	 *   than 30 seconds, a percentage of `95` prefreshes the content without unnecessarily increasing load on the
	 *   origin. Default: 90.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/cache-prefresh-refresh | Akamai Techdocs}
	 */
	setPrefreshCache(params: {
		/** Enables the cache prefreshing behavior. Default: true. */
		enabled?: boolean;

		/**
		 * Specifies when the prefresh occurs as a percentage of the TTL. For example, for an object whose cache has 10
		 * minutes left to live, and an origin response that is routinely less than 30 seconds, a percentage of `95`
		 * prefreshes the content without unnecessarily increasing load on the origin. Default: 90.
		 */
		prefreshval?: number;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.prefreshval === 'undefined' && (params.enabled as unknown) === true) {
			params.prefreshval = 90;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'prefreshCache', {}, params));
	}

	/**
	 * This behavior specifies how long the edge server should wait for a response from the requesting forward server
	 * after a connection has already been established. Any failure to read aborts the request and sends a `504` Gateway
	 * Timeout error to the client. Contact Akamai Professional Services for help configuring this behavior.
	 *
	 * @param {object} params - The parameters needed to configure setReadTimeout
	 * @param {string} [params.value] - Specifies the read timeout necessary before failing with a `504` error. This
	 *   value should never be zero. Default: "120s".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/read-timeout | Akamai Techdocs}
	 */
	setReadTimeout(params: {
		/**
		 * Specifies the read timeout necessary before failing with a `504` error. This value should never be zero.
		 * Default: "120s".
		 */
		value?: string;
	}): Property {
		if (typeof params.value === 'undefined') {
			params.value = '120s';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'readTimeout', {}, params));
	}

	/**
	 * Respond to the client request with a redirect without contacting the origin. Specify the redirect as a path
	 * expression starting with a `/` character relative to the current root, or as a fully qualified URL. This behavior
	 * relies primarily on `destinationHostname` and `destinationPath` to manipulate the hostname and path
	 * independently. See also the [`redirectplus`](#) behavior, which allows you to use [variables](ref:variables) more
	 * flexibly to express the redirect's destination.
	 *
	 * @param {object} params - The parameters needed to configure setRedirect
	 * @param {'DEFAULT' | 'MOBILE'} [params.mobileDefaultChoice] - Either specify a default response for mobile
	 *   browsers, or customize your own. Default: "DEFAULT".
	 * @param {'SAME_AS_REQUEST' | 'HTTP' | 'HTTPS'} [params.destinationProtocol] - Choose the protocol for the redirect
	 *   URL. Default: "SAME_AS_REQUEST".
	 * @param {'SAME_AS_REQUEST' | 'SUBDOMAIN' | 'SIBLING' | 'OTHER'} [params.destinationHostname] - Specify how to
	 *   change the requested hostname, independently from the pathname. Default: "SAME_AS_REQUEST".
	 * @param {string} [params.destinationHostnameSubdomain] - Specifies a subdomain to prepend to the current hostname.
	 *   For example, a value of `m` changes `www.example.com` to `m.www.example.com`. PM variables may appear between
	 *   '{{' and '}}'.
	 * @param {string} [params.destinationHostnameSibling] - Specifies the subdomain with which to replace to the
	 *   current hostname's leftmost subdomain. For example, a value of `m` changes `www.example.com` to
	 *   `m.example.com`. PM variables may appear between '{{' and '}}'.
	 * @param {string} [params.destinationHostnameOther] - Specifies the full hostname with which to replace the current
	 *   hostname. PM variables may appear between '{{' and '}}'.
	 * @param {'SAME_AS_REQUEST' | 'PREFIX_REQUEST' | 'OTHER'} [params.destinationPath] - Specify how to change the
	 *   requested pathname, independently from the hostname. Default: "OTHER".
	 * @param {string} [params.destinationPathPrefix] - When `destinationPath` is set to `PREFIX_REQUEST`, this prepends
	 *   the current path. For example, a value of `/prefix/path` changes `/example/index.html` to
	 *   `/prefix/path/example/index.html`. PM variables may appear between '{{' and '}}'.
	 * @param {'NO_SUFFIX' | 'SUFFIX'} [params.destinationPathSuffixStatus] - When `destinationPath` is set to
	 *   `PREFIX_REQUEST`, this gives you the option of adding a suffix. Default: "NO_SUFFIX".
	 * @param {string} [params.destinationPathSuffix] - When `destinationPath` is set to `PREFIX_REQUEST` and
	 *   `destinationPathSuffixStatus` is set to `SUFFIX`, this specifies the suffix to append to the path. PM variables
	 *   may appear between '{{' and '}}'.
	 * @param {string} [params.destinationPathOther] - When `destinationPath` is set to `PREFIX_REQUEST`, this replaces
	 *   the current path. PM variables may appear between '{{' and '}}'.
	 * @param {'IGNORE' | 'APPEND'} [params.queryString] - When set to `APPEND`, passes incoming query string parameters
	 *   as part of the redirect URL. Otherwise set this to `IGNORE`. Default: "APPEND".
	 * @param {301 | 302 | 303 | 307} [params.responseCode] - Specify the redirect's response code. Default: 302.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/redirect-beh | Akamai Techdocs}
	 */
	setRedirect(params: {
		/** Either specify a default response for mobile browsers, or customize your own. Default: "DEFAULT". */
		mobileDefaultChoice?: 'DEFAULT' | 'MOBILE';

		/** Choose the protocol for the redirect URL. Default: "SAME_AS_REQUEST". */
		destinationProtocol?: 'SAME_AS_REQUEST' | 'HTTP' | 'HTTPS';

		/** Specify how to change the requested hostname, independently from the pathname. Default: "SAME_AS_REQUEST". */
		destinationHostname?: 'SAME_AS_REQUEST' | 'SUBDOMAIN' | 'SIBLING' | 'OTHER';

		/**
		 * Specifies a subdomain to prepend to the current hostname. For example, a value of `m` changes
		 * `www.example.com` to `m.www.example.com`. PM variables may appear between '{{' and '}}'.
		 */
		destinationHostnameSubdomain?: string;

		/**
		 * Specifies the subdomain with which to replace to the current hostname's leftmost subdomain. For example, a
		 * value of `m` changes `www.example.com` to `m.example.com`. PM variables may appear between '{{' and '}}'.
		 */
		destinationHostnameSibling?: string;

		/**
		 * Specifies the full hostname with which to replace the current hostname. PM variables may appear between '{{'
		 * and '}}'.
		 */
		destinationHostnameOther?: string;

		/** Specify how to change the requested pathname, independently from the hostname. Default: "OTHER". */
		destinationPath?: 'SAME_AS_REQUEST' | 'PREFIX_REQUEST' | 'OTHER';

		/**
		 * When `destinationPath` is set to `PREFIX_REQUEST`, this prepends the current path. For example, a value of
		 * `/prefix/path` changes `/example/index.html` to `/prefix/path/example/index.html`. PM variables may appear
		 * between '{{' and '}}'.
		 */
		destinationPathPrefix?: string;

		/**
		 * When `destinationPath` is set to `PREFIX_REQUEST`, this gives you the option of adding a suffix. Default:
		 * "NO_SUFFIX".
		 */
		destinationPathSuffixStatus?: 'NO_SUFFIX' | 'SUFFIX';

		/**
		 * When `destinationPath` is set to `PREFIX_REQUEST` and `destinationPathSuffixStatus` is set to `SUFFIX`, this
		 * specifies the suffix to append to the path. PM variables may appear between '{{' and '}}'.
		 */
		destinationPathSuffix?: string;

		/**
		 * When `destinationPath` is set to `PREFIX_REQUEST`, this replaces the current path. PM variables may appear
		 * between '{{' and '}}'.
		 */
		destinationPathOther?: string;

		/**
		 * When set to `APPEND`, passes incoming query string parameters as part of the redirect URL. Otherwise set this
		 * to `IGNORE`. Default: "APPEND".
		 */
		queryString?: 'IGNORE' | 'APPEND';

		/** Specify the redirect's response code. Default: 302. */
		responseCode?: 301 | 302 | 303 | 307;
	}): Property {
		if (typeof params.mobileDefaultChoice === 'undefined') {
			params.mobileDefaultChoice = 'DEFAULT';
		}

		if (typeof params.destinationProtocol === 'undefined') {
			params.destinationProtocol = 'SAME_AS_REQUEST';
		}

		if (typeof params.destinationHostname === 'undefined') {
			params.destinationHostname = 'SAME_AS_REQUEST';
		}

		if (typeof params.destinationPath === 'undefined') {
			params.destinationPath = 'OTHER';
		}

		if (
			typeof params.destinationPathSuffixStatus === 'undefined' &&
			(params.destinationPath as unknown) === 'PREFIX_REQUEST'
		) {
			params.destinationPathSuffixStatus = 'NO_SUFFIX';
		}

		if (typeof params.queryString === 'undefined') {
			params.queryString = 'APPEND';
		}

		if (typeof params.responseCode === 'undefined') {
			params.responseCode = 302;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'BEHAVIOR',
				'redirect',
				{
					allowsVars: [
						'destinationHostnameSubdomain',
						'destinationHostnameSibling',
						'destinationHostnameOther',
						'destinationPathPrefix',
						'destinationPathSuffix',
						'destinationPathOther',
					],
				},
				params,
			),
		);
	}

	/**
	 * Limits allowed requests to a set of domains you specify.
	 *
	 * @param {object} params - The parameters needed to configure setRefererChecking
	 * @param {boolean} [params.enabled] - Enables the referer-checking behavior. Default: true.
	 * @param {boolean} [params.strict] - When enabled, excludes requests whose `Referer` header include a relative
	 *   path, or that are missing a `Referer`. When disabled, only excludes requests whose `Referer` hostname is not
	 *   part of the `domains` set. Default: false.
	 * @param {string[]} [params.domains] - Specifies the set of allowed domains. With `allowChildren` disabled,
	 *   prefixing values with `*.` specifies domains for which subdomains are allowed.
	 * @param {boolean} [params.allowChildren] - Allows all subdomains for the `domains` set, just like adding a `*.`
	 *   prefix to each. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/referrer-checking | Akamai Techdocs}
	 */
	setRefererChecking(params: {
		/** Enables the referer-checking behavior. Default: true. */
		enabled?: boolean;

		/**
		 * When enabled, excludes requests whose `Referer` header include a relative path, or that are missing a
		 * `Referer`. When disabled, only excludes requests whose `Referer` hostname is not part of the `domains` set.
		 * Default: false.
		 */
		strict?: boolean;

		/**
		 * Specifies the set of allowed domains. With `allowChildren` disabled, prefixing values with `*.` specifies
		 * domains for which subdomains are allowed.
		 */
		domains?: string[];

		/** Allows all subdomains for the `domains` set, just like adding a `*.` prefix to each. Default: true. */
		allowChildren?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.strict === 'undefined' && (params.enabled as unknown) === true) {
			params.strict = false;
		}

		if (typeof params.allowChildren === 'undefined' && (params.enabled as unknown) === true) {
			params.allowChildren = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'refererChecking', {}, params));
	}

	/**
	 * Remove named query parameters before forwarding the request to the origin.
	 *
	 * @param {object} params - The parameters needed to configure setRemoveQueryParameter
	 * @param {string[]} params.parameters - Specifies parameters to remove from the request.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/rm-outgoing-req-param | Akamai Techdocs}
	 */
	setRemoveQueryParameter(params: {
		/** Specifies parameters to remove from the request. */
		parameters: string[];
	}): Property {
		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'removeQueryParameter', {}, params));
	}

	/**
	 * By default, responses that feature a `Vary` header value of anything other than `Accept-Encoding` and a
	 * corresponding `Content-Encoding: gzip` header aren't cached on edge servers. `Vary` headers indicate when a URL's
	 * content varies depending on some variable, such as which `User-Agent` requests it. This behavior simply removes
	 * the `Vary` header to make responses cacheable. > **Warning**. If your site relies on `Vary: User-Agent` to
	 * customize content, removing the header may lead the edge to serve content inappropriate for specific devices.
	 *
	 * @param {object} params - The parameters needed to configure setRemoveVary
	 * @param {boolean} [params.enabled] - When enabled, removes the `Vary` header to ensure objects can be cached.
	 *   Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/rm-vary-header | Akamai Techdocs}
	 */
	setRemoveVary(params: {
		/** When enabled, removes the `Vary` header to ensure objects can be cached. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'removeVary', {}, params));
	}

	/**
	 * Specify the HTTP request headers or cookie names to log in your Log Delivery Service reports.
	 *
	 * @param {object} params - The parameters needed to configure setReport
	 * @param {boolean} [params.logHost] - Log the `Host` header. Default: true.
	 * @param {boolean} [params.logReferer] - Log the `Referer` header. Default: false.
	 * @param {boolean} [params.logUserAgent] - Log the `User-Agent` header. Default: false.
	 * @param {boolean} [params.logAcceptLanguage] - Log the `Accept-Language` header. Default: false.
	 * @param {'OFF' | 'ALL' | 'SOME'} [params.logCookies] - Specifies the set of cookies to log. Default: "OFF".
	 * @param {string[]} [params.cookies] - This specifies the set of cookies names whose values you want to log.
	 * @param {boolean} [params.logCustomLogField] - Whether to append additional custom data to each log line. Default:
	 *   false.
	 * @param {string} [params.customLogField] - Specifies an additional data field to append to each log line, maximum
	 *   1000 bytes, typically based on a dynamically generated built-in system variable. For example, `round-trip:
	 *   {{builtin.AK_CLIENT_TURNAROUND_TIME}}ms` logs the total time to complete the response. See [Support for
	 *   variables](ref:variables) for more information. If you enable the [`logCustom`](#) behavior, it overrides the
	 *   `customLogField` option. Default: "". PM variables may appear between '{{' and '}}'.
	 * @param {boolean} [params.logEdgeIP] - Whether to log the IP address of the Akamai edge server that served the
	 *   response to the client. Default: false.
	 * @param {boolean} [params.logXForwardedFor] - Log any `X-Forwarded-For` request header. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/log-req-details | Akamai Techdocs}
	 */
	setReport(params: {
		/** Log the `Host` header. Default: true. */
		logHost?: boolean;

		/** Log the `Referer` header. Default: false. */
		logReferer?: boolean;

		/** Log the `User-Agent` header. Default: false. */
		logUserAgent?: boolean;

		/** Log the `Accept-Language` header. Default: false. */
		logAcceptLanguage?: boolean;

		/** Specifies the set of cookies to log. Default: "OFF". */
		logCookies?: 'OFF' | 'ALL' | 'SOME';

		/** This specifies the set of cookies names whose values you want to log. */
		cookies?: string[];

		/** Whether to append additional custom data to each log line. Default: false. */
		logCustomLogField?: boolean;

		/**
		 * Specifies an additional data field to append to each log line, maximum 1000 bytes, typically based on a
		 * dynamically generated built-in system variable. For example, `round-trip:
		 * {{builtin.AK_CLIENT_TURNAROUND_TIME}}ms` logs the total time to complete the response. See [Support for
		 * variables](ref:variables) for more information. If you enable the [`logCustom`](#) behavior, it overrides the
		 * `customLogField` option. Default: "". PM variables may appear between '{{' and '}}'.
		 */
		customLogField?: string;

		/**
		 * Whether to log the IP address of the Akamai edge server that served the response to the client. Default:
		 * false.
		 */
		logEdgeIP?: boolean;

		/** Log any `X-Forwarded-For` request header. Default: false. */
		logXForwardedFor?: boolean;
	}): Property {
		if (typeof params.logHost === 'undefined') {
			params.logHost = true;
		}

		if (typeof params.logReferer === 'undefined') {
			params.logReferer = false;
		}

		if (typeof params.logUserAgent === 'undefined') {
			params.logUserAgent = false;
		}

		if (typeof params.logAcceptLanguage === 'undefined') {
			params.logAcceptLanguage = false;
		}

		if (typeof params.logCookies === 'undefined') {
			params.logCookies = 'OFF';
		}

		if (typeof params.logCustomLogField === 'undefined') {
			params.logCustomLogField = false;
		}

		if (typeof params.customLogField === 'undefined' && (params.logCustomLogField as unknown) === true) {
			params.customLogField = '';
		}

		if (typeof params.logEdgeIP === 'undefined') {
			params.logEdgeIP = false;
		}

		if (typeof params.logXForwardedFor === 'undefined') {
			params.logXForwardedFor = false;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'report', {allowsVars: ['customLogField']}, params),
		);
	}

	/**
	 * Change the existing response code. For example, if your origin sends a `301` permanent redirect, this behavior
	 * can change it on the edge to a temporary `302` redirect.
	 *
	 * @param {object} params - The parameters needed to configure setResponseCode
	 * @param {200
	 * 	| 301
	 * 	| 302
	 * 	| 303
	 * 	| 404
	 * 	| 500
	 * 	| 100
	 * 	| 101
	 * 	| 102
	 * 	| 103
	 * 	| 122
	 * 	| 201
	 * 	| 202
	 * 	| 203
	 * 	| 204
	 * 	| 205
	 * 	| 206
	 * 	| 207
	 * 	| 226
	 * 	| 300
	 * 	| 304
	 * 	| 305
	 * 	| 306
	 * 	| 307
	 * 	| 308
	 * 	| 400
	 * 	| 401
	 * 	| 402
	 * 	| 403
	 * 	| 405
	 * 	| 406
	 * 	| 407
	 * 	| 408
	 * 	| 409
	 * 	| 410
	 * 	| 411
	 * 	| 412
	 * 	| 413
	 * 	| 414
	 * 	| 415
	 * 	| 416
	 * 	| 417
	 * 	| 422
	 * 	| 423
	 * 	| 424
	 * 	| 425
	 * 	| 426
	 * 	| 428
	 * 	| 429
	 * 	| 431
	 * 	| 444
	 * 	| 449
	 * 	| 450
	 * 	| 499
	 * 	| 501
	 * 	| 502
	 * 	| 503
	 * 	| 504
	 * 	| 505
	 * 	| 506
	 * 	| 507
	 * 	| 509
	 * 	| 510
	 * 	| 511
	 * 	| 598
	 * 	| 599} [params.statusCode]
	 *   - The HTTP status code to replace the existing one. Default: 200.
	 *
	 * @param {boolean} [params.override206] - Allows any specified `200` success code to override a `206`
	 *   partial-content code, in which case the response's content length matches the requested range length. Default:
	 *   false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/set-response-code | Akamai Techdocs}
	 */
	setResponseCode(params: {
		/** The HTTP status code to replace the existing one. Default: 200. */
		statusCode?:
			| 200
			| 301
			| 302
			| 303
			| 404
			| 500
			| 100
			| 101
			| 102
			| 103
			| 122
			| 201
			| 202
			| 203
			| 204
			| 205
			| 206
			| 207
			| 226
			| 300
			| 304
			| 305
			| 306
			| 307
			| 308
			| 400
			| 401
			| 402
			| 403
			| 405
			| 406
			| 407
			| 408
			| 409
			| 410
			| 411
			| 412
			| 413
			| 414
			| 415
			| 416
			| 417
			| 422
			| 423
			| 424
			| 425
			| 426
			| 428
			| 429
			| 431
			| 444
			| 449
			| 450
			| 499
			| 501
			| 502
			| 503
			| 504
			| 505
			| 506
			| 507
			| 509
			| 510
			| 511
			| 598
			| 599;

		/**
		 * Allows any specified `200` success code to override a `206` partial-content code, in which case the
		 * response's content length matches the requested range length. Default: false.
		 */
		override206?: boolean;
	}): Property {
		if (typeof params.statusCode === 'undefined') {
			params.statusCode = 200;
		}

		if (typeof params.override206 === 'undefined' && (params.statusCode as unknown) === 200) {
			params.override206 = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'responseCode', {}, params));
	}

	/**
	 * Set a cookie to send downstream to the client with either a fixed value or a unique stamp.
	 *
	 * @param {object} params - The parameters needed to configure setResponseCookie
	 * @param {string} params.cookieName - Specifies the name of the cookie, which serves as a key to determine if the
	 *   cookie is set. PM variables may appear between '{{' and '}}'.
	 * @param {boolean} [params.enabled] - Allows you to set a response cookie. Default: true.
	 * @param {'FIXED' | 'UNIQUE'} [params.type] - What type of value to assign. Default: "FIXED".
	 * @param {string} [params.value] - If the cookie `type` is `FIXED`, this specifies the cookie value. PM variables
	 *   may appear between '{{' and '}}'.
	 * @param {'AKAMAI' | 'APACHE'} [params.format] - When the `type` of cookie is set to `UNIQUE`, this sets the date
	 *   format. Default: "AKAMAI".
	 * @param {boolean} [params.defaultDomain] - When enabled, uses the default domain value, otherwise the set
	 *   specified in the `domain` field. Default: true.
	 * @param {boolean} [params.defaultPath] - When enabled, uses the default path value, otherwise the set specified in
	 *   the `path` field. Default: true.
	 * @param {string} [params.domain] - If the `defaultDomain` is disabled, this sets the domain for which the cookie
	 *   is valid. For example, `example.com` makes the cookie valid for that hostname and all subdomains. PM variables
	 *   may appear between '{{' and '}}'.
	 * @param {string} [params.path] - If the `defaultPath` is disabled, sets the path component for which the cookie is
	 *   valid. Default: "/". PM variables may appear between '{{' and '}}'.
	 * @param {'ON_BROWSER_CLOSE' | 'FIXED_DATE' | 'DURATION' | 'NEVER'} [params.expires] - Sets various ways to specify
	 *   when the cookie expires. Default: "ON_BROWSER_CLOSE".
	 * @param {string} [params.expirationDate] - If `expires` is set to `FIXED_DATE`, this sets when the cookie expires
	 *   as a UTC date and time.
	 * @param {string} [params.duration] - If `expires` is set to `DURATION`, this sets the cookie's lifetime.
	 * @param {'DEFAULT' | 'NONE' | 'LAX' | 'STRICT'} [params.sameSite] - This option controls the `SameSite` cookie
	 *   attribute that reduces the risk of cross-site request forgery attacks. Default: "DEFAULT".
	 * @param {boolean} [params.secure] - When enabled, sets the cookie's `Secure` flag to transmit it with `HTTPS`.
	 *   Default: false.
	 * @param {boolean} [params.httpOnly] - When enabled, includes the `HttpOnly` attribute in the `Set-Cookie` response
	 *   header to mitigate the risk of client-side scripts accessing the protected cookie, if the browser supports it.
	 *   Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/set-response-cookie | Akamai Techdocs}
	 */
	setResponseCookie(params: {
		/**
		 * Specifies the name of the cookie, which serves as a key to determine if the cookie is set. PM variables may
		 * appear between '{{' and '}}'.
		 */
		cookieName: string;

		/** Allows you to set a response cookie. Default: true. */
		enabled?: boolean;

		/** What type of value to assign. Default: "FIXED". */
		type?: 'FIXED' | 'UNIQUE';

		/**
		 * If the cookie `type` is `FIXED`, this specifies the cookie value. PM variables may appear between '{{' and
		 * '}}'.
		 */
		value?: string;

		/** When the `type` of cookie is set to `UNIQUE`, this sets the date format. Default: "AKAMAI". */
		format?: 'AKAMAI' | 'APACHE';

		/**
		 * When enabled, uses the default domain value, otherwise the set specified in the `domain` field. Default:
		 * true.
		 */
		defaultDomain?: boolean;

		/** When enabled, uses the default path value, otherwise the set specified in the `path` field. Default: true. */
		defaultPath?: boolean;

		/**
		 * If the `defaultDomain` is disabled, this sets the domain for which the cookie is valid. For example,
		 * `example.com` makes the cookie valid for that hostname and all subdomains. PM variables may appear between
		 * '{{' and '}}'.
		 */
		domain?: string;

		/**
		 * If the `defaultPath` is disabled, sets the path component for which the cookie is valid. Default: "/". PM
		 * variables may appear between '{{' and '}}'.
		 */
		path?: string;

		/** Sets various ways to specify when the cookie expires. Default: "ON_BROWSER_CLOSE". */
		expires?: 'ON_BROWSER_CLOSE' | 'FIXED_DATE' | 'DURATION' | 'NEVER';

		/** If `expires` is set to `FIXED_DATE`, this sets when the cookie expires as a UTC date and time. */
		expirationDate?: string;

		/** If `expires` is set to `DURATION`, this sets the cookie's lifetime. */
		duration?: string;

		/**
		 * This option controls the `SameSite` cookie attribute that reduces the risk of cross-site request forgery
		 * attacks. Default: "DEFAULT".
		 */
		sameSite?: 'DEFAULT' | 'NONE' | 'LAX' | 'STRICT';

		/** When enabled, sets the cookie's `Secure` flag to transmit it with `HTTPS`. Default: false. */
		secure?: boolean;

		/**
		 * When enabled, includes the `HttpOnly` attribute in the `Set-Cookie` response header to mitigate the risk of
		 * client-side scripts accessing the protected cookie, if the browser supports it. Default: false.
		 */
		httpOnly?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.type === 'undefined' && (params.enabled as unknown) === true) {
			params.type = 'FIXED';
		}

		if (typeof params.format === 'undefined' && (params.type as unknown) === 'UNIQUE') {
			params.format = 'AKAMAI';
		}

		if (typeof params.defaultDomain === 'undefined' && (params.enabled as unknown) === true) {
			params.defaultDomain = true;
		}

		if (typeof params.defaultPath === 'undefined' && (params.enabled as unknown) === true) {
			params.defaultPath = true;
		}

		if (typeof params.path === 'undefined' && (params.defaultPath as unknown) === false) {
			params.path = '/';
		}

		if (typeof params.expires === 'undefined' && (params.enabled as unknown) === true) {
			params.expires = 'ON_BROWSER_CLOSE';
		}

		if (typeof params.sameSite === 'undefined' && (params.enabled as unknown) === true) {
			params.sameSite = 'DEFAULT';
		}

		if (typeof params.secure === 'undefined' && (params.enabled as unknown) === true) {
			params.secure = false;
		}

		if (typeof params.httpOnly === 'undefined' && (params.enabled as unknown) === true) {
			params.httpOnly = false;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'BEHAVIOR',
				'responseCookie',
				{allowsVars: ['cookieName', 'value', 'domain', 'path']},
				params,
			),
		);
	}

	/**
	 * Modifies the path of incoming requests to forward to the origin. This helps you offload URL-rewriting tasks to
	 * the edge to increase the origin server's performance, allows you to redirect links to different targets without
	 * changing markup, and hides your original directory structure. Except for regular expression replacements, this
	 * behavior manipulates _path expressions_ that start and end with a `/` character. This behavior's rewrite
	 * operations can't override any the [`baseDirectory`](#) behavior specifies.
	 *
	 * @param {object} params - The parameters needed to configure setRewriteUrl
	 * @param {'REPLACE' | 'REMOVE' | 'REWRITE' | 'PREPEND' | 'REGEX_REPLACE'} [params.behavior] - The action to perform
	 *   on the path. Default: "REPLACE".
	 * @param {string} [params.match] - When `behavior` is `REMOVE` or `REPLACE`, specifies the part of the incoming
	 *   path you'd like to remove or modify.
	 * @param {string} [params.matchRegex] - When `behavior` is set to `REGEX_REPLACE`, specifies the Perl-compatible
	 *   regular expression to replace with `targetRegex`.
	 * @param {string} [params.targetRegex] - When `behavior` is set to `REGEX_REPLACE`, this replaces whatever the
	 *   `matchRegex` field matches, along with any captured sequences from `\$1` through `\$9`. PM variables may appear
	 *   between '{{' and '}}'.
	 * @param {string} [params.targetPath] - When `behavior` is set to `REPLACE`, this path replaces whatever the
	 *   `match` field matches in the incoming request's path. PM variables may appear between '{{' and '}}'.
	 * @param {string} [params.targetPathPrepend] - When `behavior` is set to `PREPEND`, specifies a path to prepend to
	 *   the incoming request's URL. PM variables may appear between '{{' and '}}'.
	 * @param {string} [params.targetUrl] - When `behavior` is set to `REWRITE`, specifies the full path to request from
	 *   the origin. PM variables may appear between '{{' and '}}'.
	 * @param {boolean} [params.matchMultiple] - When enabled, replaces all potential matches rather than only the
	 *   first. Default: false.
	 * @param {boolean} [params.keepQueryString] - When enabled, retains the original path's query parameters. Default:
	 *   true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/modify-outgoing-req-path | Akamai Techdocs}
	 */
	setRewriteUrl(params: {
		/** The action to perform on the path. Default: "REPLACE". */
		behavior?: 'REPLACE' | 'REMOVE' | 'REWRITE' | 'PREPEND' | 'REGEX_REPLACE';

		/**
		 * When `behavior` is `REMOVE` or `REPLACE`, specifies the part of the incoming path you'd like to remove or
		 * modify.
		 */
		match?: string;

		/**
		 * When `behavior` is set to `REGEX_REPLACE`, specifies the Perl-compatible regular expression to replace with
		 * `targetRegex`.
		 */
		matchRegex?: string;

		/**
		 * When `behavior` is set to `REGEX_REPLACE`, this replaces whatever the `matchRegex` field matches, along with
		 * any captured sequences from `\$1` through `\$9`. PM variables may appear between '{{' and '}}'.
		 */
		targetRegex?: string;

		/**
		 * When `behavior` is set to `REPLACE`, this path replaces whatever the `match` field matches in the incoming
		 * request's path. PM variables may appear between '{{' and '}}'.
		 */
		targetPath?: string;

		/**
		 * When `behavior` is set to `PREPEND`, specifies a path to prepend to the incoming request's URL. PM variables
		 * may appear between '{{' and '}}'.
		 */
		targetPathPrepend?: string;

		/**
		 * When `behavior` is set to `REWRITE`, specifies the full path to request from the origin. PM variables may
		 * appear between '{{' and '}}'.
		 */
		targetUrl?: string;

		/** When enabled, replaces all potential matches rather than only the first. Default: false. */
		matchMultiple?: boolean;

		/** When enabled, retains the original path's query parameters. Default: true. */
		keepQueryString?: boolean;
	}): Property {
		if (typeof params.behavior === 'undefined') {
			params.behavior = 'REPLACE';
		}

		if (
			typeof params.matchMultiple === 'undefined' &&
			params.behavior !== undefined &&
			['REMOVE', 'REPLACE', 'REGEX_REPLACE'].includes(params.behavior)
		) {
			params.matchMultiple = false;
		}

		if (typeof params.keepQueryString === 'undefined' && (params.behavior as unknown) !== 'REWRITE') {
			params.keepQueryString = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'BEHAVIOR',
				'rewriteUrl',
				{allowsVars: ['targetRegex', 'targetPath', 'targetPathPrepend', 'targetUrl']},
				params,
			),
		);
	}

	/**
	 * Specifies when cached content that satisfies a rule's criteria expires, optionally at repeating intervals. In
	 * addition to periodic cache flushes, you can use this behavior to minimize potential conflicts when related
	 * objects expire at different times. > **Warning**. scheduled invalidations can significantly increase origin
	 * servers' load when matching content expires simultaneously across all edge servers. As best practice, schedule
	 * expirations during periods of lowest traffic.
	 *
	 * @param {object} params - The parameters needed to configure setScheduleInvalidation
	 * @param {string} params.start - The UTC date and time when matching cached content is to expire.
	 * @param {boolean} [params.repeat] - When enabled, invalidation recurs periodically from the `start` time based on
	 *   the `repeatInterval` time. Default: false.
	 * @param {string} [params.repeatInterval] - Specifies how often to invalidate content from the `start` time,
	 *   expressed in seconds. For example, an expiration set to midnight and an interval of `86400` seconds invalidates
	 *   content once a day. Repeating intervals of less than 5 minutes are not allowed for
	 *   [NetStorage](https://techdocs.akamai.com/netstorage) origins. Default: "1d".
	 * @param {'INVALIDATE' | 'PURGE'} [params.refreshMethod] - Specifies how to invalidate the content. Default:
	 *   "INVALIDATE".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/scheduled-inval | Akamai Techdocs}
	 */
	setScheduleInvalidation(params: {
		/** The UTC date and time when matching cached content is to expire. */
		start: string;

		/**
		 * When enabled, invalidation recurs periodically from the `start` time based on the `repeatInterval` time.
		 * Default: false.
		 */
		repeat?: boolean;

		/**
		 * Specifies how often to invalidate content from the `start` time, expressed in seconds. For example, an
		 * expiration set to midnight and an interval of `86400` seconds invalidates content once a day. Repeating
		 * intervals of less than 5 minutes are not allowed for [NetStorage](https://techdocs.akamai.com/netstorage)
		 * origins. Default: "1d".
		 */
		repeatInterval?: string;

		/** Specifies how to invalidate the content. Default: "INVALIDATE". */
		refreshMethod?: 'INVALIDATE' | 'PURGE';
	}): Property {
		if (typeof params.repeat === 'undefined') {
			params.repeat = false;
		}

		if (typeof params.repeatInterval === 'undefined' && (params.repeat as unknown) === true) {
			params.repeatInterval = '1d';
		}

		if (typeof params.refreshMethod === 'undefined') {
			params.refreshMethod = 'INVALIDATE';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'scheduleInvalidation', {}, params));
	}

	/**
	 * This behavior simulates various error response codes. Contact Akamai Professional Services for help configuring
	 * it.
	 *
	 * @param {object} params - The parameters needed to configure setSimulateErrorCode
	 * @param {'ERR_DNS_TIMEOUT'
	 * 	| 'ERR_SUREROUTE_DNS_FAIL'
	 * 	| 'ERR_DNS_FAIL'
	 * 	| 'ERR_CONNECT_TIMEOUT'
	 * 	| 'ERR_NO_GOOD_FWD_IP'
	 * 	| 'ERR_DNS_IN_REGION'
	 * 	| 'ERR_CONNECT_FAIL'
	 * 	| 'ERR_READ_TIMEOUT'
	 * 	| 'ERR_READ_ERROR'
	 * 	| 'ERR_WRITE_ERROR'} [params.errorType]
	 *   - Specifies the type of error. Default: "ERR_DNS_TIMEOUT".
	 *
	 * @param {string} [params.timeout] - When the `errorType` is `ERR_CONNECT_TIMEOUT`, `ERR_DNS_TIMEOUT`,
	 *   `ERR_SUREROUTE_DNS_FAIL`, or `ERR_READ_TIMEOUT`, generates an error after the specified amount of time from the
	 *   initial request. Default: "5s".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/simulate-err-response-code | Akamai Techdocs}
	 */
	setSimulateErrorCode(params: {
		/** Specifies the type of error. Default: "ERR_DNS_TIMEOUT". */
		errorType?:
			| 'ERR_DNS_TIMEOUT'
			| 'ERR_SUREROUTE_DNS_FAIL'
			| 'ERR_DNS_FAIL'
			| 'ERR_CONNECT_TIMEOUT'
			| 'ERR_NO_GOOD_FWD_IP'
			| 'ERR_DNS_IN_REGION'
			| 'ERR_CONNECT_FAIL'
			| 'ERR_READ_TIMEOUT'
			| 'ERR_READ_ERROR'
			| 'ERR_WRITE_ERROR';

		/**
		 * When the `errorType` is `ERR_CONNECT_TIMEOUT`, `ERR_DNS_TIMEOUT`, `ERR_SUREROUTE_DNS_FAIL`, or
		 * `ERR_READ_TIMEOUT`, generates an error after the specified amount of time from the initial request. Default:
		 * "5s".
		 */
		timeout?: string;
	}): Property {
		if (typeof params.errorType === 'undefined') {
			params.errorType = 'ERR_DNS_TIMEOUT';
		}

		if (
			typeof params.timeout === 'undefined' &&
			params.errorType !== undefined &&
			['ERR_DNS_TIMEOUT', 'ERR_SUREROUTE_DNS_FAIL', 'ERR_READ_TIMEOUT', 'ERR_CONNECT_TIMEOUT'].includes(
				params.errorType,
			)
		) {
			params.timeout = '5s';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'simulateErrorCode', {}, params));
	}

	/**
	 * This behavior specifies how the edge servers should handle requests containing improperly formatted or invalid
	 * headers that don’t comply with [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html). Some clients may send
	 * invalid or incorrectly-formatted, non-RFC-compliant request headers. If such requests reach the origin server,
	 * this vulnerability can be exploited by a “bad actor”, for example to poison your cache and cause invalid content
	 * to be returned to your end users. Use Strict Header Parsing to tell the edge servers what requests to reject,
	 * independently of the ​Akamai​ platform's default behavior. Therefore, you may either get the protection earlier
	 * than the global customer base or defer changes to a later time, though not recommended. Note that the two modes
	 * are independent – each of them concerns different issues with the request headers. For both options, a warning is
	 * written to the edge server logs whether the option is enabled or disabled. As Akamai strives to be fully
	 * RFC-compliant, you should enable both options as best practice. Enabling both options ensures that Akamai edge
	 * servers reject requests with invalid headers and don’t forward them to your origin. In such cases, the end user
	 * receives a 400 Bad Request HTTP response code.
	 *
	 * @param {object} params - The parameters needed to configure setStrictHeaderParsing
	 * @param {boolean} [params.validMode] - Rejects requests made with non-RFC-compliant headers that contain invalid
	 *   characters in the header name or value or which contain invalidly-folded header lines. When disabled, the edge
	 *   servers allow such requests, passing the invalid headers to the origin server unchanged. Default: true.
	 * @param {boolean} [params.strictMode] - Rejects requests made with non-RFC-compliant, improperly formatted
	 *   headers, where the header line starts with a colon, misses a colon or doesn’t end with CR LF. When disabled,
	 *   the edge servers allow such requests, but correct the violation by removing or rewriting the header line before
	 *   passing the headers to the origin server. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/strict-header-parsing | Akamai Techdocs}
	 */
	setStrictHeaderParsing(params: {
		/**
		 * Rejects requests made with non-RFC-compliant headers that contain invalid characters in the header name or
		 * value or which contain invalidly-folded header lines. When disabled, the edge servers allow such requests,
		 * passing the invalid headers to the origin server unchanged. Default: true.
		 */
		validMode?: boolean;

		/**
		 * Rejects requests made with non-RFC-compliant, improperly formatted headers, where the header line starts with
		 * a colon, misses a colon or doesn’t end with CR LF. When disabled, the edge servers allow such requests, but
		 * correct the violation by removing or rewriting the header line before passing the headers to the origin
		 * server. Default: true.
		 */
		strictMode?: boolean;
	}): Property {
		if (typeof params.validMode === 'undefined') {
			params.validMode = true;
		}

		if (typeof params.strictMode === 'undefined') {
			params.strictMode = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'strictHeaderParsing', {}, params));
	}

	/**
	 * The [SureRoute](https://techdocs.akamai.com/api-acceleration/docs/setup-sureroute-test-object) feature
	 * continually tests different routes between origin and edge servers to identify the optimal path. By default, it
	 * conducts _races_ to identify alternative paths to use in case of a transmission failure. These races increase
	 * origin traffic slightly. This behavior allows you to configure SureRoute along with a test object to improve
	 * delivery of non-cacheable `no-store` or `bypass-cache` content. Since edge servers are already positioned as
	 * close as possible to requesting clients, the behavior does not apply to cacheable content.
	 *
	 * @param {object} params - The parameters needed to configure setSureRoute
	 * @param {boolean} [params.enabled] - Enables the SureRoute behavior, to optimize delivery of non-cached content.
	 *   Default: true.
	 * @param {'PERFORMANCE' | 'CUSTOM_MAP'} [params.type] - Specifies the set of edge servers used to test routes.
	 *   Default: "PERFORMANCE".
	 * @param {string} [params.customMap] - If `type` is `CUSTOM_MAP`, this specifies the map string provided to you by
	 *   Akamai Professional Services, or included as part of the [Site Shield](https://techdocs.akamai.com/site-shield)
	 *   product.
	 * @param {string} [params.testObjectUrl] - Specifies the path and filename for your origin's test object to use in
	 *   races to test routes. Akamai provides sample test objects for the [Dynamic Site
	 *   Accelerator](https://techdocs.akamai.com/start/docs/setup-dynamic-site-accelerator) and Web Application
	 *   Accelerator products. If you want to use your own test object, it needs to be on the same origin server as the
	 *   traffic being served through SureRoute. Make sure it returns a `200` HTTP response and does not require
	 *   authentication. The file should be an average-sized static HTML file (`Content-Type: text/html`) that is no
	 *   smaller than 8KB, with no back-end processing. If you have more than one origin server deployed behind a load
	 *   balancer, you can configure it to serve the test object directly on behalf of the origin, or route requests to
	 *   the same origin server to avoid deploying the test object on each origin server.
	 * @param {'INCOMING_HH' | 'OTHER'} [params.toHostStatus] - Specifies which hostname to use. Default: "INCOMING_HH".
	 * @param {string} [params.toHost] - If `toHostStatus` is `OTHER`, this specifies the custom `Host` header to use
	 *   when requesting the SureRoute test object.
	 * @param {string} [params.raceStatTtl] - Specifies the time-to-live to preserve SureRoute race results, typically
	 *   `30m`. If traffic exceeds a certain threshold after TTL expires, the overflow is routed directly to the origin,
	 *   not necessarily optimally. If traffic remains under the threshold, the route is determined by the winner of the
	 *   most recent race. Default: "30m".
	 * @param {boolean} [params.forceSslForward] - Forces SureRoute to use SSL when requesting the origin's test object,
	 *   appropriate if your origin does not respond to HTTP requests, or responds with a redirect to HTTPS. Default:
	 *   false.
	 * @param {boolean} [params.allowFCMParentOverride] - 2DO. Default: false.
	 * @param {boolean} [params.enableCustomKey] - When disabled, caches race results under the race destination's
	 *   hostname. If enabled, use `customStatKey` to specify a custom hostname. Default: false.
	 * @param {string} [params.customStatKey] - This specifies a hostname under which to cache race results. This may be
	 *   useful when a property corresponds to many origin hostnames. By default, SureRoute would launch races for each
	 *   origin, but consolidating under a single hostname runs only one race. Default: "".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/sureroute-beh | Akamai Techdocs}
	 */
	setSureRoute(params: {
		/** Enables the SureRoute behavior, to optimize delivery of non-cached content. Default: true. */
		enabled?: boolean;

		/** Specifies the set of edge servers used to test routes. Default: "PERFORMANCE". */
		type?: 'PERFORMANCE' | 'CUSTOM_MAP';

		/**
		 * If `type` is `CUSTOM_MAP`, this specifies the map string provided to you by Akamai Professional Services, or
		 * included as part of the [Site Shield](https://techdocs.akamai.com/site-shield) product.
		 */
		customMap?: string;

		/**
		 * Specifies the path and filename for your origin's test object to use in races to test routes. Akamai provides
		 * sample test objects for the [Dynamic Site
		 * Accelerator](https://techdocs.akamai.com/start/docs/setup-dynamic-site-accelerator) and Web Application
		 * Accelerator products. If you want to use your own test object, it needs to be on the same origin server as
		 * the traffic being served through SureRoute. Make sure it returns a `200` HTTP response and does not require
		 * authentication. The file should be an average-sized static HTML file (`Content-Type: text/html`) that is no
		 * smaller than 8KB, with no back-end processing. If you have more than one origin server deployed behind a load
		 * balancer, you can configure it to serve the test object directly on behalf of the origin, or route requests
		 * to the same origin server to avoid deploying the test object on each origin server.
		 */
		testObjectUrl?: string;

		/** Specifies which hostname to use. Default: "INCOMING_HH". */
		toHostStatus?: 'INCOMING_HH' | 'OTHER';

		/**
		 * If `toHostStatus` is `OTHER`, this specifies the custom `Host` header to use when requesting the SureRoute
		 * test object.
		 */
		toHost?: string;

		/**
		 * Specifies the time-to-live to preserve SureRoute race results, typically `30m`. If traffic exceeds a certain
		 * threshold after TTL expires, the overflow is routed directly to the origin, not necessarily optimally. If
		 * traffic remains under the threshold, the route is determined by the winner of the most recent race. Default:
		 * "30m".
		 */
		raceStatTtl?: string;

		/**
		 * Forces SureRoute to use SSL when requesting the origin's test object, appropriate if your origin does not
		 * respond to HTTP requests, or responds with a redirect to HTTPS. Default: false.
		 */
		forceSslForward?: boolean;

		/** 2DO. Default: false. */
		allowFCMParentOverride?: boolean;

		/**
		 * When disabled, caches race results under the race destination's hostname. If enabled, use `customStatKey` to
		 * specify a custom hostname. Default: false.
		 */
		enableCustomKey?: boolean;

		/**
		 * This specifies a hostname under which to cache race results. This may be useful when a property corresponds
		 * to many origin hostnames. By default, SureRoute would launch races for each origin, but consolidating under a
		 * single hostname runs only one race. Default: "".
		 */
		customStatKey?: string;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.type === 'undefined' && (params.enabled as unknown) === true) {
			params.type = 'PERFORMANCE';
		}

		if (typeof params.toHostStatus === 'undefined' && (params.enabled as unknown) === true) {
			params.toHostStatus = 'INCOMING_HH';
		}

		if (typeof params.raceStatTtl === 'undefined' && (params.enabled as unknown) === true) {
			params.raceStatTtl = '30m';
		}

		if (typeof params.forceSslForward === 'undefined' && (params.enabled as unknown) === true) {
			params.forceSslForward = false;
		}

		if (typeof params.allowFCMParentOverride === 'undefined') {
			params.allowFCMParentOverride = false;
		}

		if (typeof params.enableCustomKey === 'undefined' && (params.enabled as unknown) === true) {
			params.enableCustomKey = false;
		}

		if (typeof params.customStatKey === 'undefined' && (params.enableCustomKey as unknown) === true) {
			params.customStatKey = '';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'sureRoute', {}, params));
	}

	/**
	 * This behavior allows Akamai edge servers to retrieve cached content from other Akamai servers, rather than
	 * directly from the origin. These interim _parent_ servers in the _cache hierarchy_ (`CH`) are positioned close to
	 * the origin, and fall along the path from the origin to the edge server. Tiered Distribution typically reduces the
	 * origin server's load, and reduces the time it takes for edge servers to refresh content. See also the
	 * [`tieredDistributionAdvanced`](#) behavior.
	 *
	 * @param {object} params - The parameters needed to configure setTieredDistribution
	 * @param {boolean} [params.enabled] - When enabled, activates tiered distribution. Default: true.
	 * @param {'CH2' | 'CHAPAC' | 'CHEU2' | 'CHEUS2' | 'CHCUS2' | 'CHWUS2' | 'CHAUS' | 'CH'} [params.tieredDistributionMap]
	 *   - Optionally map the tiered parent server's location close to your origin. A narrower local map minimizes the
	 *       origin server's load, and increases the likelihood the requested object is cached. A wider global map
	 *       reduces end-user latency, but decreases the likelihood the requested object is in any given parent server's
	 *       cache. This option cannot apply if the property is marked as secure. See [Secure property
	 *       requirements](ref:the-default-rule) for guidance. Default: "CH2".
	 *
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/tiered-dist | Akamai Techdocs}
	 */
	setTieredDistribution(params: {
		/** When enabled, activates tiered distribution. Default: true. */
		enabled?: boolean;

		/**
		 * Optionally map the tiered parent server's location close to your origin. A narrower local map minimizes the
		 * origin server's load, and increases the likelihood the requested object is cached. A wider global map reduces
		 * end-user latency, but decreases the likelihood the requested object is in any given parent server's cache.
		 * This option cannot apply if the property is marked as secure. See [Secure property
		 * requirements](ref:the-default-rule) for guidance. Default: "CH2".
		 */
		tieredDistributionMap?: 'CH2' | 'CHAPAC' | 'CHEU2' | 'CHEUS2' | 'CHCUS2' | 'CHWUS2' | 'CHAUS' | 'CH';
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.tieredDistributionMap === 'undefined' && (params.enabled as unknown) === true) {
			params.tieredDistributionMap = 'CH2';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'tieredDistribution', {}, params));
	}

	/**
	 * Sets the HTTP connect timeout.
	 *
	 * @param {object} params - The parameters needed to configure setTimeout
	 * @param {string} [params.value] - Specifies the timeout, for example `10s`. Default: "5s".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/connect-timeout | Akamai Techdocs}
	 */
	setTimeout(params: {
		/** Specifies the timeout, for example `10s`. Default: "5s". */
		value?: string;
	}): Property {
		if (typeof params.value === 'undefined') {
			params.value = '5s';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'timeout', {}, params));
	}

	/**
	 * Instructs edge servers to compare the request's `ETag` header with that of the cached object. If they differ, the
	 * edge server sends a new copy of the object. This validation occurs in addition to the default validation of
	 * `Last-Modified` and `If-Modified-Since` headers. Note that Akamai only supports strong `ETag` values. Weak `ETag`
	 * values are ignored and a full response is always returned. For more details, see the [RFC
	 * Standard](https://www.rfc-editor.org/rfc/rfc9110.html#name-etag).
	 *
	 * @param {object} params - The parameters needed to configure setValidateEntityTag
	 * @param {boolean} [params.enabled] - Enables the ETag validation behavior. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/val-entity-tag | Akamai Techdocs}
	 */
	setValidateEntityTag(params: {
		/** Enables the ETag validation behavior. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'validateEntityTag', {}, params));
	}

	/**
	 * Web-based Distributed Authoring and Versioning (WebDAV) is a set of extensions to the HTTP protocol that allows
	 * users to collaboratively edit and manage files on remote web servers. This behavior enables WebDAV, and provides
	 * support for the following additional request methods: PROPFIND, PROPPATCH, MKCOL, COPY, MOVE, LOCK, and UNLOCK.
	 * To apply this behavior, you need to match on a [`requestMethod`](#).
	 *
	 * @param {object} params - The parameters needed to configure setWebdav
	 * @param {boolean} [params.enabled] - Enables the WebDAV behavior. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/webdav-beh | Akamai Techdocs}
	 */
	setWebdav(params: {
		/** Enables the WebDAV behavior. Default: false. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'webdav', {}, params));
	}

	/**
	 * Forward client requests to the origin server for authorization, along with optional `Set-Cookie` headers, useful
	 * when you need to maintain tight access control. The edge server forwards an `If-Modified-Since` header, to which
	 * the origin needs to respond with a `304` (Not-Modified) HTTP status when authorization succeeds. If so, the edge
	 * server responds to the client with the cached object, since it does not need to be re-acquired from the origin.
	 *
	 * @param {object} params - The parameters needed to configure setCentralAuthorization
	 * @param {boolean} [params.enabled] - Enables the centralized authorization behavior. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/centralized-authz | Akamai Techdocs}
	 */
	setCentralAuthorization(params: {
		/** Enables the centralized authorization behavior. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'centralAuthorization', {}, params));
	}

	/**
	 * Assuming a condition in the rule matches, this denies access to the requested content. For example, a
	 * [`userLocation`](#) match paired with this behavior would deny requests from a specified part of the world. By
	 * keying on the value of the `reason` option, `denyAccess` behaviors may override each other when called from
	 * nested rules. For example, a parent rule might deny access to a certain geographic area, citing `location` as the
	 * `reason`, but another nested rule can then allow access for a set of IPs within that area, so long as the
	 * `reason` matches.
	 *
	 * @param {object} params - The parameters needed to configure setDenyAccess
	 * @param {string} [params.reason] - Text message that keys why access is denied. Any subsequent `denyAccess`
	 *   behaviors within the rule tree may refer to the same `reason` key to override the current behavior. Default:
	 *   "default-deny-reason".
	 * @param {boolean} [params.enabled] - Denies access when enabled. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/control-access | Akamai Techdocs}
	 */
	setDenyAccess(params: {
		/**
		 * Text message that keys why access is denied. Any subsequent `denyAccess` behaviors within the rule tree may
		 * refer to the same `reason` key to override the current behavior. Default: "default-deny-reason".
		 */
		reason?: string;

		/** Denies access when enabled. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.reason === 'undefined') {
			params.reason = 'default-deny-reason';
		}

		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'denyAccess', {}, params));
	}

	/**
	 * Verifies Auth 2.0 tokens.
	 *
	 * @param {object} params - The parameters needed to configure setVerifyTokenAuthorization
	 * @param {boolean} [params.useAdvanced] - If enabled, allows you to specify advanced options such as `algorithm`,
	 *   `escapeHmacInputs`, `ignoreQueryString`, `transitionKey`, and `salt`. Default: false.
	 * @param {'COOKIE' | 'QUERY_STRING' | 'CLIENT_REQUEST_HEADER'} [params.location] - Specifies where to find the
	 *   token in the incoming request. Default: "COOKIE".
	 * @param {string} [params.locationId] - When `location` is `CLIENT_REQUEST_HEADER`, specifies the name of the
	 *   incoming request's header where to find the token. Default: "**token**".
	 * @param {'SHA256' | 'SHA1' | 'MD5'} [params.algorithm] - Specifies the algorithm that generates the token. It
	 *   needs to match the method chosen in the token generation code. Default: "SHA256".
	 * @param {boolean} [params.escapeHmacInputs] - URL-escapes HMAC inputs passed in as query parameters. Default:
	 *   true.
	 * @param {boolean} [params.ignoreQueryString] - Enabling this removes the query string from the URL used to form an
	 *   encryption key. Default: false.
	 * @param {string} params.key - The shared secret used to validate tokens, which needs to match the key used in the
	 *   token generation code.
	 * @param {string} [params.transitionKey] - Specifies a transition key as a hex value.
	 * @param {string} [params.salt] - Specifies a salt string for input when generating the token, which needs to match
	 *   the salt value used in the token generation code.
	 * @param {boolean} [params.failureResponse] - When enabled, sends an HTTP error when an authentication test fails.
	 *   Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/auth-token-2-0-ver | Akamai Techdocs}
	 */
	setVerifyTokenAuthorization(params: {
		/**
		 * If enabled, allows you to specify advanced options such as `algorithm`, `escapeHmacInputs`,
		 * `ignoreQueryString`, `transitionKey`, and `salt`. Default: false.
		 */
		useAdvanced?: boolean;

		/** Specifies where to find the token in the incoming request. Default: "COOKIE". */
		location?: 'COOKIE' | 'QUERY_STRING' | 'CLIENT_REQUEST_HEADER';

		/**
		 * When `location` is `CLIENT_REQUEST_HEADER`, specifies the name of the incoming request's header where to find
		 * the token. Default: "**token**".
		 */
		locationId?: string;

		/**
		 * Specifies the algorithm that generates the token. It needs to match the method chosen in the token generation
		 * code. Default: "SHA256".
		 */
		algorithm?: 'SHA256' | 'SHA1' | 'MD5';

		/** URL-escapes HMAC inputs passed in as query parameters. Default: true. */
		escapeHmacInputs?: boolean;

		/** Enabling this removes the query string from the URL used to form an encryption key. Default: false. */
		ignoreQueryString?: boolean;

		/** The shared secret used to validate tokens, which needs to match the key used in the token generation code. */
		key: string;

		/** Specifies a transition key as a hex value. */
		transitionKey?: string;

		/**
		 * Specifies a salt string for input when generating the token, which needs to match the salt value used in the
		 * token generation code.
		 */
		salt?: string;

		/** When enabled, sends an HTTP error when an authentication test fails. Default: true. */
		failureResponse?: boolean;
	}): Property {
		if (typeof params.useAdvanced === 'undefined') {
			params.useAdvanced = false;
		}

		if (typeof params.location === 'undefined') {
			params.location = 'COOKIE';
		}

		if (typeof params.locationId === 'undefined') {
			params.locationId = '__token__';
		}

		if (typeof params.algorithm === 'undefined' && (params.useAdvanced as unknown) === true) {
			params.algorithm = 'SHA256';
		}

		if (typeof params.escapeHmacInputs === 'undefined' && (params.useAdvanced as unknown) === true) {
			params.escapeHmacInputs = true;
		}

		if (typeof params.ignoreQueryString === 'undefined' && (params.useAdvanced as unknown) === true) {
			params.ignoreQueryString = false;
		}

		if (typeof params.failureResponse === 'undefined') {
			params.failureResponse = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'verifyTokenAuthorization', {}, params),
		);
	}

	/**
	 * The Adaptive Image Compression feature compresses JPEG images depending on the requesting network's performance,
	 * thus improving response time. The behavior specifies three performance tiers based on round-trip tests: 1 for
	 * excellent, 2 for good, and 3 for poor. It assigns separate performance criteria for mobile (cellular) and
	 * non-mobile networks, which the `compressMobile` and `compressStandard` options enable independently. There are
	 * six `method` options, one for each tier and type of network. If the `method` is `COMPRESS`, choose from among the
	 * six corresponding `slider` options to specify a percentage. As an alternative to compression, setting the
	 * `method` to `STRIP` removes unnecessary application-generated metadata from the image. Setting the `method` to
	 * `BYPASS` serves clients the original image. The behavior serves `ETags` headers as a data signature for each
	 * adapted variation. In case of error or if the file size increases, the behavior serves the original image file.
	 * Flushing the original image from the edge cache also flushes adapted variants. The behavior applies to the
	 * following image file extensions: `jpg`, `jpeg`, `jpe`, `jif`, `jfif`, and `jfi`.
	 *
	 * @param {object} params - The parameters needed to configure setAdaptiveImageCompression
	 * @param {boolean} [params.compressMobile] - Adapts images served over cellular mobile networks. Default: true.
	 * @param {'COMPRESS' | 'BYPASS' | 'STRIP'} [params.tier1MobileCompressionMethod] - Specifies tier-1 behavior.
	 *   Default: "BYPASS".
	 * @param {number} [params.tier1MobileCompressionValue] - Specifies the compression percentage. Default: 80.
	 * @param {'COMPRESS' | 'BYPASS' | 'STRIP'} [params.tier2MobileCompressionMethod] - Specifies tier-2
	 *   cellular-network behavior. Default: "COMPRESS".
	 * @param {number} [params.tier2MobileCompressionValue] - Specifies the compression percentage. Default: 60.
	 * @param {'COMPRESS' | 'BYPASS' | 'STRIP'} [params.tier3MobileCompressionMethod] - Specifies tier-3
	 *   cellular-network behavior. Default: "COMPRESS".
	 * @param {number} [params.tier3MobileCompressionValue] - Specifies the compression percentage. Default: 40.
	 * @param {boolean} [params.compressStandard] - Adapts images served over non-cellular networks. Default: true.
	 * @param {'COMPRESS' | 'BYPASS' | 'STRIP'} [params.tier1StandardCompressionMethod] - Specifies tier-1 non-cellular
	 *   network behavior. Default: "BYPASS".
	 * @param {number} [params.tier1StandardCompressionValue] - Specifies the compression percentage. Default: 80.
	 * @param {'COMPRESS' | 'BYPASS' | 'STRIP'} [params.tier2StandardCompressionMethod] - Specifies tier-2 non-cellular
	 *   network behavior. Default: "BYPASS".
	 * @param {number} [params.tier2StandardCompressionValue] - Specifies the compression percentage. Default: 60.
	 * @param {'COMPRESS' | 'BYPASS' | 'STRIP'} [params.tier3StandardCompressionMethod] - Specifies tier-3 non-cellular
	 *   network behavior. Default: "COMPRESS".
	 * @param {number} [params.tier3StandardCompressionValue] - Specifies the compression percentage. Default: 40.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/adaptive-img-comp-aic | Akamai Techdocs}
	 */
	setAdaptiveImageCompression(params: {
		/** Adapts images served over cellular mobile networks. Default: true. */
		compressMobile?: boolean;

		/** Specifies tier-1 behavior. Default: "BYPASS". */
		tier1MobileCompressionMethod?: 'COMPRESS' | 'BYPASS' | 'STRIP';

		/** Specifies the compression percentage. Default: 80. */
		tier1MobileCompressionValue?: number;

		/** Specifies tier-2 cellular-network behavior. Default: "COMPRESS". */
		tier2MobileCompressionMethod?: 'COMPRESS' | 'BYPASS' | 'STRIP';

		/** Specifies the compression percentage. Default: 60. */
		tier2MobileCompressionValue?: number;

		/** Specifies tier-3 cellular-network behavior. Default: "COMPRESS". */
		tier3MobileCompressionMethod?: 'COMPRESS' | 'BYPASS' | 'STRIP';

		/** Specifies the compression percentage. Default: 40. */
		tier3MobileCompressionValue?: number;

		/** Adapts images served over non-cellular networks. Default: true. */
		compressStandard?: boolean;

		/** Specifies tier-1 non-cellular network behavior. Default: "BYPASS". */
		tier1StandardCompressionMethod?: 'COMPRESS' | 'BYPASS' | 'STRIP';

		/** Specifies the compression percentage. Default: 80. */
		tier1StandardCompressionValue?: number;

		/** Specifies tier-2 non-cellular network behavior. Default: "BYPASS". */
		tier2StandardCompressionMethod?: 'COMPRESS' | 'BYPASS' | 'STRIP';

		/** Specifies the compression percentage. Default: 60. */
		tier2StandardCompressionValue?: number;

		/** Specifies tier-3 non-cellular network behavior. Default: "COMPRESS". */
		tier3StandardCompressionMethod?: 'COMPRESS' | 'BYPASS' | 'STRIP';

		/** Specifies the compression percentage. Default: 40. */
		tier3StandardCompressionValue?: number;
	}): Property {
		if (typeof params.compressMobile === 'undefined') {
			params.compressMobile = true;
		}

		if (typeof params.tier1MobileCompressionMethod === 'undefined' && (params.compressMobile as unknown) === true) {
			params.tier1MobileCompressionMethod = 'BYPASS';
		}

		if (
			typeof params.tier1MobileCompressionValue === 'undefined' &&
			(params.tier1MobileCompressionMethod as unknown) === 'COMPRESS'
		) {
			params.tier1MobileCompressionValue = 80;
		}

		if (typeof params.tier2MobileCompressionMethod === 'undefined' && (params.compressMobile as unknown) === true) {
			params.tier2MobileCompressionMethod = 'COMPRESS';
		}

		if (
			typeof params.tier2MobileCompressionValue === 'undefined' &&
			(params.tier2MobileCompressionMethod as unknown) === 'COMPRESS'
		) {
			params.tier2MobileCompressionValue = 60;
		}

		if (typeof params.tier3MobileCompressionMethod === 'undefined' && (params.compressMobile as unknown) === true) {
			params.tier3MobileCompressionMethod = 'COMPRESS';
		}

		if (
			typeof params.tier3MobileCompressionValue === 'undefined' &&
			(params.tier3MobileCompressionMethod as unknown) === 'COMPRESS'
		) {
			params.tier3MobileCompressionValue = 40;
		}

		if (typeof params.compressStandard === 'undefined') {
			params.compressStandard = true;
		}

		if (
			typeof params.tier1StandardCompressionMethod === 'undefined' &&
			(params.compressStandard as unknown) === true
		) {
			params.tier1StandardCompressionMethod = 'BYPASS';
		}

		if (
			typeof params.tier1StandardCompressionValue === 'undefined' &&
			(params.tier1StandardCompressionMethod as unknown) === 'COMPRESS'
		) {
			params.tier1StandardCompressionValue = 80;
		}

		if (
			typeof params.tier2StandardCompressionMethod === 'undefined' &&
			(params.compressStandard as unknown) === true
		) {
			params.tier2StandardCompressionMethod = 'BYPASS';
		}

		if (
			typeof params.tier2StandardCompressionValue === 'undefined' &&
			(params.tier2StandardCompressionMethod as unknown) === 'COMPRESS'
		) {
			params.tier2StandardCompressionValue = 60;
		}

		if (
			typeof params.tier3StandardCompressionMethod === 'undefined' &&
			(params.compressStandard as unknown) === true
		) {
			params.tier3StandardCompressionMethod = 'COMPRESS';
		}

		if (
			typeof params.tier3StandardCompressionValue === 'undefined' &&
			(params.tier3StandardCompressionMethod as unknown) === 'COMPRESS'
		) {
			params.tier3StandardCompressionValue = 40;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'adaptiveImageCompression', {}, params),
		);
	}

	/**
	 * Controls which query parameters, headers, and cookies are included in or excluded from the cache key identifier.
	 * Note that this behavior executes differently than usual within rule trees. Applying a set of `cacheId` behaviors
	 * within the same rule results in a system of forming cache keys that applies independently to the rule's content.
	 * If any `cacheId` behaviors are present in a rule, any others specified in parent rules or prior executing sibling
	 * rules no longer apply. Otherwise for any rule that lacks a `cacheId` behavior, the set of behaviors specified in
	 * an ancestor or prior sibling rule determines how to form cache keys for that content.
	 *
	 * @param {object} params - The parameters needed to configure setCacheId
	 * @param {'INCLUDE_QUERY_PARAMS'
	 * 	| 'INCLUDE_COOKIES'
	 * 	| 'INCLUDE_HEADERS'
	 * 	| 'EXCLUDE_QUERY_PARAMS'
	 * 	| 'INCLUDE_ALL_QUERY_PARAMS'
	 * 	| 'INCLUDE_VARIABLE'
	 * 	| 'INCLUDE_URL'} [params.rule]
	 *   - Specifies how to modify the cache ID. Default: "INCLUDE_QUERY_PARAMS".
	 *
	 * @param {boolean} [params.includeValue] - Includes the value of the specified elements in the cache ID. Otherwise
	 *   only their names are included. Default: true.
	 * @param {boolean} [params.optional] - Requires the behavior's specified elements to be present for content to
	 *   cache. When disabled, requests that lack the specified elements are still cached. Default: true.
	 * @param {string[]} [params.elements] - Specifies the names of the query parameters, cookies, or headers to include
	 *   or exclude from the cache ID.
	 * @param {string} [params.variableName] - Specifies the name of the variable you want to include in the cache key.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/cache-id-modification | Akamai Techdocs}
	 */
	setCacheId(params: {
		/** Specifies how to modify the cache ID. Default: "INCLUDE_QUERY_PARAMS". */
		rule?:
			| 'INCLUDE_QUERY_PARAMS'
			| 'INCLUDE_COOKIES'
			| 'INCLUDE_HEADERS'
			| 'EXCLUDE_QUERY_PARAMS'
			| 'INCLUDE_ALL_QUERY_PARAMS'
			| 'INCLUDE_VARIABLE'
			| 'INCLUDE_URL';

		/**
		 * Includes the value of the specified elements in the cache ID. Otherwise only their names are included.
		 * Default: true.
		 */
		includeValue?: boolean;

		/**
		 * Requires the behavior's specified elements to be present for content to cache. When disabled, requests that
		 * lack the specified elements are still cached. Default: true.
		 */
		optional?: boolean;

		/** Specifies the names of the query parameters, cookies, or headers to include or exclude from the cache ID. */
		elements?: string[];

		/** Specifies the name of the variable you want to include in the cache key. */
		variableName?: string;
	}): Property {
		if (typeof params.rule === 'undefined') {
			params.rule = 'INCLUDE_QUERY_PARAMS';
		}

		if (
			typeof params.includeValue === 'undefined' &&
			params.rule !== undefined &&
			['INCLUDE_COOKIES', 'INCLUDE_QUERY_PARAMS', 'INCLUDE_HEADERS'].includes(params.rule)
		) {
			params.includeValue = true;
		}

		if (
			typeof params.optional === 'undefined' &&
			params.rule !== undefined &&
			['INCLUDE_COOKIES', 'INCLUDE_QUERY_PARAMS', 'INCLUDE_HEADERS', 'EXCLUDE_QUERY_PARAMS'].includes(params.rule)
		) {
			params.optional = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'cacheId', {variable: ['variableName']}, params),
		);
	}

	/**
	 * Allows edge servers to process edge side include (ESI) code to generate dynamic content. To apply this behavior,
	 * you need to match on a [`contentType`](#), [`path`](#), or [`filename`](#). Since this behavior requires more
	 * parsing time, you should not apply it to pages that lack ESI code, or to any non-HTML content.
	 *
	 * @param {object} params - The parameters needed to configure setEdgeSideIncludes
	 * @param {boolean} [params.enabled] - Enables ESI processing. Default: true.
	 * @param {boolean} [params.enableViaHttp] - Enable ESI only for content featuring the `Edge-control: dca=esi` HTTP
	 *   response header. Default: false.
	 * @param {boolean} [params.passSetCookie] - Allows edge servers to pass your origin server's cookies to the ESI
	 *   processor. Default: false.
	 * @param {boolean} [params.passClientIp] - Allows edge servers to pass the client IP header to the ESI processor.
	 *   Default: false.
	 * @param {boolean} [params.i18nStatus] - Provides internationalization support for ESI. Default: false.
	 * @param {string[]} [params.i18nCharset] - Specifies the character sets to use when transcoding the ESI language,
	 *   `UTF-8` and `ISO-8859-1` for example.
	 * @param {boolean} [params.detectInjection] - Denies attempts to inject ESI code. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/esi-edge-side-includes | Akamai Techdocs}
	 */
	setEdgeSideIncludes(params: {
		/** Enables ESI processing. Default: true. */
		enabled?: boolean;

		/** Enable ESI only for content featuring the `Edge-control: dca=esi` HTTP response header. Default: false. */
		enableViaHttp?: boolean;

		/** Allows edge servers to pass your origin server's cookies to the ESI processor. Default: false. */
		passSetCookie?: boolean;

		/** Allows edge servers to pass the client IP header to the ESI processor. Default: false. */
		passClientIp?: boolean;

		/** Provides internationalization support for ESI. Default: false. */
		i18nStatus?: boolean;

		/** Specifies the character sets to use when transcoding the ESI language, `UTF-8` and `ISO-8859-1` for example. */
		i18nCharset?: string[];

		/** Denies attempts to inject ESI code. Default: false. */
		detectInjection?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.enableViaHttp === 'undefined') {
			params.enableViaHttp = false;
		}

		if (
			typeof params.passSetCookie === 'undefined' &&
			((params.enabled as unknown) === true || (params.enableViaHttp as unknown) === true)
		) {
			params.passSetCookie = false;
		}

		if (
			typeof params.passClientIp === 'undefined' &&
			((params.enabled as unknown) === true || (params.enableViaHttp as unknown) === true)
		) {
			params.passClientIp = false;
		}

		if (
			typeof params.i18nStatus === 'undefined' &&
			((params.enabled as unknown) === true || (params.enableViaHttp as unknown) === true)
		) {
			params.i18nStatus = false;
		}

		if (typeof params.detectInjection === 'undefined') {
			params.detectInjection = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'edgeSideIncludes', {}, params));
	}

	/**
	 * Enables the API Prioritization Cloudlet, which maintains continuity in user experience by serving an alternate
	 * static response when load is too high. You can configure rules using either the Cloudlets Policy Manager
	 * application or the [Cloudlets API](https://techdocs.akamai.com/cloudlets/reference). Use this feature serve
	 * static API content, such as fallback JSON data. To serve non-API HTML content, use the
	 * [`visitorPrioritization`](#) behavior.
	 *
	 * @param {object} params - The parameters needed to configure setApiPrioritization
	 * @param {boolean} [params.enabled] - Activates the API Prioritization feature. Default: true.
	 * @param {boolean} [params.isSharedPolicy] - Whether you want to apply the Cloudlet shared policy to an unlimited
	 *   number of properties within your account. Learn more about shared policies and how to create them in [Cloudlets
	 *   Policy Manager](https://techdocs.akamai.com/cloudlets). Default: false.
	 * @param {any} [params.cloudletPolicy] - Identifies the Cloudlet policy.
	 * @param {number} [params.cloudletSharedPolicy] - Identifies the Cloudlet shared policy to use with this behavior.
	 *   Use the [Cloudlets API](https://techdocs.akamai.com/cloudlets/reference) to list available shared policies.
	 * @param {string} [params.label] - A label to distinguish this API Prioritization policy from any others in the
	 *   same property.
	 * @param {boolean} [params.useThrottledCpCode] - Specifies whether to apply an alternative CP code for requests
	 *   served the alternate response. Default: false.
	 * @param {any} [params.throttledCpCode] - Specifies the CP code as an object. You only need to provide the initial
	 *   `id`, stripping any [`cpc_` prefix](ref:id-prefixes) to pass the integer to the rule tree. Additional CP code
	 *   details may reflect back in subsequent read-only data.
	 * @param {boolean} [params.useThrottledStatusCode] - Allows you to assign a specific HTTP response code to a
	 *   throttled request. Default: false.
	 * @param {number} [params.throttledStatusCode] - Specifies the HTTP response code for requests that receive the
	 *   alternate response. Default: 200.
	 * @param {any} [params.netStorage] - Specify the NetStorage domain that contains the alternate response.
	 * @param {string} [params.netStoragePath] - Specify the full NetStorage path for the alternate response, including
	 *   trailing file name.
	 * @param {number} [params.alternateResponseCacheTtl] - Specifies the alternate response's time to live in the
	 *   cache, `5` minutes by default. Default: 5.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/api-prioritization-cloudlet | Akamai Techdocs}
	 */
	setApiPrioritization(params: {
		/** Activates the API Prioritization feature. Default: true. */
		enabled?: boolean;

		/**
		 * Whether you want to apply the Cloudlet shared policy to an unlimited number of properties within your
		 * account. Learn more about shared policies and how to create them in [Cloudlets Policy
		 * Manager](https://techdocs.akamai.com/cloudlets). Default: false.
		 */
		isSharedPolicy?: boolean;

		/** Identifies the Cloudlet policy. */
		cloudletPolicy?: any;

		/**
		 * Identifies the Cloudlet shared policy to use with this behavior. Use the [Cloudlets
		 * API](https://techdocs.akamai.com/cloudlets/reference) to list available shared policies.
		 */
		cloudletSharedPolicy?: number;

		/** A label to distinguish this API Prioritization policy from any others in the same property. */
		label?: string;

		/** Specifies whether to apply an alternative CP code for requests served the alternate response. Default: false. */
		useThrottledCpCode?: boolean;

		/**
		 * Specifies the CP code as an object. You only need to provide the initial `id`, stripping any [`cpc_`
		 * prefix](ref:id-prefixes) to pass the integer to the rule tree. Additional CP code details may reflect back in
		 * subsequent read-only data.
		 */
		throttledCpCode?: any;

		/** Allows you to assign a specific HTTP response code to a throttled request. Default: false. */
		useThrottledStatusCode?: boolean;

		/** Specifies the HTTP response code for requests that receive the alternate response. Default: 200. */
		throttledStatusCode?: number;

		/** Specify the NetStorage domain that contains the alternate response. */
		netStorage?: any;

		/** Specify the full NetStorage path for the alternate response, including trailing file name. */
		netStoragePath?: string;

		/** Specifies the alternate response's time to live in the cache, `5` minutes by default. Default: 5. */
		alternateResponseCacheTtl?: number;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.isSharedPolicy === 'undefined' && (params.enabled as unknown) === true) {
			params.isSharedPolicy = false;
		}

		if (typeof params.useThrottledCpCode === 'undefined' && (params.enabled as unknown) === true) {
			params.useThrottledCpCode = false;
		}

		if (typeof params.useThrottledStatusCode === 'undefined' && (params.enabled as unknown) === true) {
			params.useThrottledStatusCode = false;
		}

		if (
			typeof params.throttledStatusCode === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.useThrottledStatusCode as unknown) === true
		) {
			params.throttledStatusCode = 200;
		}

		if (typeof params.alternateResponseCacheTtl === 'undefined' && (params.enabled as unknown) === true) {
			params.alternateResponseCacheTtl = 5;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'apiPrioritization', {}, params));
	}

	/**
	 * Allows Cloudlets Origins to determine the criteria, separately from the Property Manager, under which alternate
	 * [`origin`](#) definitions are assigned. This behavior needs to appear alone within its own rule. When enabled, it
	 * allows any [`cloudletsOrigin`](#) criteria within sub-rules to override the prevailing origin.
	 *
	 * @param {object} params - The parameters needed to configure setAllowCloudletsOrigins
	 * @param {boolean} [params.enabled] - Allows you to assign custom origin definitions referenced in sub-rules by
	 *   [`cloudletsOrigin`](#) labels. If disabled, all sub-rules are ignored. Default: true.
	 * @param {boolean} [params.honorBaseDirectory] - Prefixes any Cloudlet-generated origin path with a path defined by
	 *   an Origin Base Path behavior. If no path is defined, it has no effect. If another Cloudlet policy already
	 *   prepends the same Origin Base Path, the path is not duplicated. Default: false.
	 * @param {string} [params.purgeOriginQueryParameter] - When purging content from a Cloudlets Origin, this specifies
	 *   a query parameter name whose value is the specific named origin to purge. Note that this only applies to
	 *   content purge requests, for example when using the [Content Control Utility
	 *   API](https://techdocs.akamai.com/eccu/reference). Default: "originId".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/conditional-origins | Akamai Techdocs}
	 */
	setAllowCloudletsOrigins(params: {
		/**
		 * Allows you to assign custom origin definitions referenced in sub-rules by [`cloudletsOrigin`](#) labels. If
		 * disabled, all sub-rules are ignored. Default: true.
		 */
		enabled?: boolean;

		/**
		 * Prefixes any Cloudlet-generated origin path with a path defined by an Origin Base Path behavior. If no path
		 * is defined, it has no effect. If another Cloudlet policy already prepends the same Origin Base Path, the path
		 * is not duplicated. Default: false.
		 */
		honorBaseDirectory?: boolean;

		/**
		 * When purging content from a Cloudlets Origin, this specifies a query parameter name whose value is the
		 * specific named origin to purge. Note that this only applies to content purge requests, for example when using
		 * the [Content Control Utility API](https://techdocs.akamai.com/eccu/reference). Default: "originId".
		 */
		purgeOriginQueryParameter?: string;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.honorBaseDirectory === 'undefined' && (params.enabled as unknown) === true) {
			params.honorBaseDirectory = false;
		}

		if (typeof params.purgeOriginQueryParameter === 'undefined' && (params.enabled as unknown) === true) {
			params.purgeOriginQueryParameter = 'originId';
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'allowCloudletsOrigins', {}, params),
		);
	}

	/**
	 * Enables the Application Load Balancer Cloudlet, which automates load balancing based on configurable criteria. To
	 * configure this behavior, use either the Cloudlets Policy Manager or the [Cloudlets
	 * API](https://techdocs.akamai.com/cloudlets/reference) to set up a policy.
	 *
	 * @param {object} params - The parameters needed to configure setApplicationLoadBalancer
	 * @param {boolean} [params.enabled] - Activates the Application Load Balancer Cloudlet. Default: true.
	 * @param {any} [params.cloudletPolicy] - Identifies the Cloudlet policy.
	 * @param {string} [params.label] - A label to distinguish this Application Load Balancer policy from any others
	 *   within the same property.
	 * @param {'NONE' | 'NEVER' | 'ON_BROWSER_CLOSE' | 'FIXED_DATE' | 'DURATION' | 'ORIGIN_SESSION'} [params.stickinessCookieType]
	 *   - Determines how a cookie persistently associates the client with a load-balanced origin. Default:
	 *       "ON_BROWSER_CLOSE".
	 *
	 * @param {string} [params.stickinessExpirationDate] - Specifies when the cookie expires.
	 * @param {string} [params.stickinessDuration] - Sets how long it is before the cookie expires. Default: "300s".
	 * @param {boolean} [params.stickinessRefresh] - Extends the duration of the cookie with each new request. When
	 *   enabled, the `DURATION` thus specifies the latency between requests that would cause the cookie to expire.
	 *   Default: false.
	 * @param {string} [params.originCookieName] - Specifies the name for your session cookie.
	 * @param {boolean} [params.specifyStickinessCookieDomain] - Specifies whether to use a cookie domain with the
	 *   stickiness cookie, to tell the browser to which domain to send the cookie. Default: false.
	 * @param {string} [params.stickinessCookieDomain] - Specifies the domain to track the stickiness cookie.
	 * @param {boolean} [params.stickinessCookieAutomaticSalt] - Sets whether to assign a _salt_ value automatically to
	 *   the cookie to prevent manipulation by the user. You should not enable this if sharing the population cookie
	 *   across more than one property. Default: true.
	 * @param {string} [params.stickinessCookieSalt] - Specifies the stickiness cookie's salt value. Use this option to
	 *   share the cookie across many properties.
	 * @param {boolean} [params.stickinessCookieSetHttpOnlyFlag] - Ensures the cookie is transmitted only over HTTP.
	 *   Default: true.
	 * @param {any} [params.allDownNetStorage] - Specifies a NetStorage account for a static maintenance page as a
	 *   fallback when no origins are available.
	 * @param {string} [params.allDownNetStorageFile] - Specifies the fallback maintenance page's filename, expressed as
	 *   a full path from the root of the NetStorage server.
	 * @param {string} [params.allDownStatusCode] - Specifies the HTTP response code when all load-balancing origins are
	 *   unavailable.
	 * @param {string[]} [params.failoverStatusCodes] - Specifies a set of HTTP status codes that signal a failure on
	 *   the origin, in which case the cookie that binds the client to that origin is invalidated and the client is
	 *   rerouted to another available origin. Default: ["500","501","502","503","504","505","506","507","508","509"].
	 * @param {'AUTOMATIC' | 'MANUAL' | 'DISABLED'} [params.failoverMode] - Determines what to do if an origin fails.
	 *   Default: "AUTOMATIC".
	 * @param {object[]} [params.failoverOriginMap] - Specifies a fixed set of failover mapping rules.
	 * @param {number} [params.failoverAttemptsThreshold] - Sets the number of failed requests that would trigger the
	 *   failover process. Default: 5.
	 * @param {boolean} [params.allowCachePrefresh] - Allows the cache to prefresh. Only appropriate if all origins
	 *   serve the same content for the same URL. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/app-load-balancer-cloudlet | Akamai Techdocs}
	 */
	setApplicationLoadBalancer(params: {
		/** Activates the Application Load Balancer Cloudlet. Default: true. */
		enabled?: boolean;

		/** Identifies the Cloudlet policy. */
		cloudletPolicy?: any;

		/** A label to distinguish this Application Load Balancer policy from any others within the same property. */
		label?: string;

		/**
		 * Determines how a cookie persistently associates the client with a load-balanced origin. Default:
		 * "ON_BROWSER_CLOSE".
		 */
		stickinessCookieType?: 'NONE' | 'NEVER' | 'ON_BROWSER_CLOSE' | 'FIXED_DATE' | 'DURATION' | 'ORIGIN_SESSION';

		/** Specifies when the cookie expires. */
		stickinessExpirationDate?: string;

		/** Sets how long it is before the cookie expires. Default: "300s". */
		stickinessDuration?: string;

		/**
		 * Extends the duration of the cookie with each new request. When enabled, the `DURATION` thus specifies the
		 * latency between requests that would cause the cookie to expire. Default: false.
		 */
		stickinessRefresh?: boolean;

		/** Specifies the name for your session cookie. */
		originCookieName?: string;

		/**
		 * Specifies whether to use a cookie domain with the stickiness cookie, to tell the browser to which domain to
		 * send the cookie. Default: false.
		 */
		specifyStickinessCookieDomain?: boolean;

		/** Specifies the domain to track the stickiness cookie. */
		stickinessCookieDomain?: string;

		/**
		 * Sets whether to assign a _salt_ value automatically to the cookie to prevent manipulation by the user. You
		 * should not enable this if sharing the population cookie across more than one property. Default: true.
		 */
		stickinessCookieAutomaticSalt?: boolean;

		/** Specifies the stickiness cookie's salt value. Use this option to share the cookie across many properties. */
		stickinessCookieSalt?: string;

		/** Ensures the cookie is transmitted only over HTTP. Default: true. */
		stickinessCookieSetHttpOnlyFlag?: boolean;

		/** Specifies a NetStorage account for a static maintenance page as a fallback when no origins are available. */
		allDownNetStorage?: any;

		/**
		 * Specifies the fallback maintenance page's filename, expressed as a full path from the root of the NetStorage
		 * server.
		 */
		allDownNetStorageFile?: string;

		/** Specifies the HTTP response code when all load-balancing origins are unavailable. */
		allDownStatusCode?: string;

		/**
		 * Specifies a set of HTTP status codes that signal a failure on the origin, in which case the cookie that binds
		 * the client to that origin is invalidated and the client is rerouted to another available origin. Default:
		 * ["500","501","502","503","504","505","506","507","508","509"].
		 */
		failoverStatusCodes?: string[];

		/** Determines what to do if an origin fails. Default: "AUTOMATIC". */
		failoverMode?: 'AUTOMATIC' | 'MANUAL' | 'DISABLED';

		/** Specifies a fixed set of failover mapping rules. */
		failoverOriginMap?: Array<object>;

		/** Sets the number of failed requests that would trigger the failover process. Default: 5. */
		failoverAttemptsThreshold?: number;

		/**
		 * Allows the cache to prefresh. Only appropriate if all origins serve the same content for the same URL.
		 * Default: true.
		 */
		allowCachePrefresh?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.stickinessCookieType === 'undefined' && (params.enabled as unknown) === true) {
			params.stickinessCookieType = 'ON_BROWSER_CLOSE';
		}

		if (
			typeof params.stickinessDuration === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.stickinessCookieType as unknown) === 'DURATION'
		) {
			params.stickinessDuration = '300s';
		}

		if (
			typeof params.stickinessRefresh === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.stickinessCookieType as unknown) === 'DURATION'
		) {
			params.stickinessRefresh = false;
		}

		if (
			typeof params.specifyStickinessCookieDomain === 'undefined' &&
			(params.enabled as unknown) === true &&
			params.stickinessCookieType !== undefined &&
			['ON_BROWSER_CLOSE', 'FIXED_DATE', 'DURATION', 'NEVER', 'ORIGIN_SESSION'].includes(
				params.stickinessCookieType,
			)
		) {
			params.specifyStickinessCookieDomain = false;
		}

		if (
			typeof params.stickinessCookieAutomaticSalt === 'undefined' &&
			(params.enabled as unknown) === true &&
			params.stickinessCookieType !== undefined &&
			['ON_BROWSER_CLOSE', 'FIXED_DATE', 'DURATION', 'NEVER', 'ORIGIN_SESSION'].includes(
				params.stickinessCookieType,
			)
		) {
			params.stickinessCookieAutomaticSalt = true;
		}

		if (
			typeof params.stickinessCookieSetHttpOnlyFlag === 'undefined' &&
			(params.enabled as unknown) === true &&
			params.stickinessCookieType !== undefined &&
			['ON_BROWSER_CLOSE', 'FIXED_DATE', 'DURATION', 'NEVER', 'ORIGIN_SESSION'].includes(
				params.stickinessCookieType,
			)
		) {
			params.stickinessCookieSetHttpOnlyFlag = true;
		}

		if (typeof params.failoverStatusCodes === 'undefined' && (params.enabled as unknown) === true) {
			params.failoverStatusCodes = ['500', '501', '502', '503', '504', '505', '506', '507', '508', '509'];
		}

		if (typeof params.failoverMode === 'undefined' && (params.enabled as unknown) === true) {
			params.failoverMode = 'AUTOMATIC';
		}

		if (
			typeof params.failoverAttemptsThreshold === 'undefined' &&
			(params.enabled as unknown) === true &&
			params.failoverMode !== undefined &&
			['MANUAL', 'AUTOMATIC'].includes(params.failoverMode)
		) {
			params.failoverAttemptsThreshold = 5;
		}

		if (typeof params.allowCachePrefresh === 'undefined' && (params.enabled as unknown) === true) {
			params.allowCachePrefresh = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'applicationLoadBalancer', {}, params),
		);
	}

	/**
	 * Allows you to divide your users into different segments based on a persistent cookie. You can configure rules
	 * using either the Cloudlets Policy Manager application or the [Cloudlets
	 * API](https://techdocs.akamai.com/cloudlets/reference).
	 *
	 * @param {object} params - The parameters needed to configure setAudienceSegmentation
	 * @param {boolean} [params.enabled] - Enables the Audience Segmentation cloudlet feature. Default: true.
	 * @param {boolean} [params.isSharedPolicy] - Whether you want to use a shared policy for a Cloudlet. Learn more
	 *   about shared policies and how to create them in [Cloudlets Policy
	 *   Manager](https://techdocs.akamai.com/cloudlets). Default: false.
	 * @param {any} [params.cloudletPolicy] - Identifies the Cloudlet policy.
	 * @param {number} [params.cloudletSharedPolicy] - This identifies the Cloudlet shared policy to use with this
	 *   behavior. You can list available shared policies with the [Cloudlets
	 *   API](https://techdocs.akamai.com/cloudlets/reference).
	 * @param {string} [params.label] - Specifies a suffix to append to the cookie name. This helps distinguish this
	 *   audience segmentation policy from any others within the same property.
	 * @param {'IN_QUERY_PARAM' | 'IN_COOKIE_HEADER' | 'IN_CUSTOM_HEADER' | 'NONE'} [params.segmentTrackingMethod]
	 *
	 *   - Specifies the method to pass segment information to the origin. The Cloudlet passes the rule applied to a given
	 *       request location. Default: "NONE".
	 *
	 * @param {string} [params.segmentTrackingQueryParam] - This query parameter specifies the name of the segmentation
	 *   rule.
	 * @param {string} [params.segmentTrackingCookieName] - This cookie name specifies the name of the segmentation
	 *   rule.
	 * @param {string} [params.segmentTrackingCustomHeader] - This custom HTTP header specifies the name of the
	 *   segmentation rule.
	 * @param {'NEVER' | 'ON_BROWSER_CLOSE' | 'DURATION'} [params.populationCookieType] - Specifies when the
	 *   segmentation cookie expires. Default: "ON_BROWSER_CLOSE".
	 * @param {string} [params.populationDuration] - Specifies the lifetime of the segmentation cookie. Default: "5m".
	 * @param {boolean} [params.populationRefresh] - If disabled, sets the expiration time only if the cookie is not yet
	 *   present in the request. Default: true.
	 * @param {boolean} [params.specifyPopulationCookieDomain] - Whether to specify a cookie domain with the population
	 *   cookie. It tells the browser to which domain to send the cookie. Default: false.
	 * @param {string} [params.populationCookieDomain] - Specifies the domain to track the population cookie.
	 * @param {boolean} [params.populationCookieAutomaticSalt] - Whether to assign a _salt_ value automatically to the
	 *   cookie to prevent manipulation by the user. You should not enable if sharing the population cookie across more
	 *   than one property. Default: true.
	 * @param {string} [params.populationCookieSalt] - Specifies the cookie's salt value. Use this option to share the
	 *   cookie across many properties.
	 * @param {boolean} [params.populationCookieIncludeRuleName] - When enabled, includes in the session cookie the name
	 *   of the rule in which this behavior appears. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/audience-segmentation-cloudlet | Akamai Techdocs}
	 */
	setAudienceSegmentation(params: {
		/** Enables the Audience Segmentation cloudlet feature. Default: true. */
		enabled?: boolean;

		/**
		 * Whether you want to use a shared policy for a Cloudlet. Learn more about shared policies and how to create
		 * them in [Cloudlets Policy Manager](https://techdocs.akamai.com/cloudlets). Default: false.
		 */
		isSharedPolicy?: boolean;

		/** Identifies the Cloudlet policy. */
		cloudletPolicy?: any;

		/**
		 * This identifies the Cloudlet shared policy to use with this behavior. You can list available shared policies
		 * with the [Cloudlets API](https://techdocs.akamai.com/cloudlets/reference).
		 */
		cloudletSharedPolicy?: number;

		/**
		 * Specifies a suffix to append to the cookie name. This helps distinguish this audience segmentation policy
		 * from any others within the same property.
		 */
		label?: string;

		/**
		 * Specifies the method to pass segment information to the origin. The Cloudlet passes the rule applied to a
		 * given request location. Default: "NONE".
		 */
		segmentTrackingMethod?: 'IN_QUERY_PARAM' | 'IN_COOKIE_HEADER' | 'IN_CUSTOM_HEADER' | 'NONE';

		/** This query parameter specifies the name of the segmentation rule. */
		segmentTrackingQueryParam?: string;

		/** This cookie name specifies the name of the segmentation rule. */
		segmentTrackingCookieName?: string;

		/** This custom HTTP header specifies the name of the segmentation rule. */
		segmentTrackingCustomHeader?: string;

		/** Specifies when the segmentation cookie expires. Default: "ON_BROWSER_CLOSE". */
		populationCookieType?: 'NEVER' | 'ON_BROWSER_CLOSE' | 'DURATION';

		/** Specifies the lifetime of the segmentation cookie. Default: "5m". */
		populationDuration?: string;

		/** If disabled, sets the expiration time only if the cookie is not yet present in the request. Default: true. */
		populationRefresh?: boolean;

		/**
		 * Whether to specify a cookie domain with the population cookie. It tells the browser to which domain to send
		 * the cookie. Default: false.
		 */
		specifyPopulationCookieDomain?: boolean;

		/** Specifies the domain to track the population cookie. */
		populationCookieDomain?: string;

		/**
		 * Whether to assign a _salt_ value automatically to the cookie to prevent manipulation by the user. You should
		 * not enable if sharing the population cookie across more than one property. Default: true.
		 */
		populationCookieAutomaticSalt?: boolean;

		/** Specifies the cookie's salt value. Use this option to share the cookie across many properties. */
		populationCookieSalt?: string;

		/**
		 * When enabled, includes in the session cookie the name of the rule in which this behavior appears. Default:
		 * false.
		 */
		populationCookieIncludeRuleName?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.isSharedPolicy === 'undefined' && (params.enabled as unknown) === true) {
			params.isSharedPolicy = false;
		}

		if (typeof params.segmentTrackingMethod === 'undefined' && (params.enabled as unknown) === true) {
			params.segmentTrackingMethod = 'NONE';
		}

		if (typeof params.populationCookieType === 'undefined' && (params.enabled as unknown) === true) {
			params.populationCookieType = 'ON_BROWSER_CLOSE';
		}

		if (
			typeof params.populationDuration === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.populationCookieType as unknown) === 'DURATION'
		) {
			params.populationDuration = '5m';
		}

		if (
			typeof params.populationRefresh === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.populationCookieType as unknown) === 'DURATION'
		) {
			params.populationRefresh = true;
		}

		if (typeof params.specifyPopulationCookieDomain === 'undefined' && (params.enabled as unknown) === true) {
			params.specifyPopulationCookieDomain = false;
		}

		if (typeof params.populationCookieAutomaticSalt === 'undefined' && (params.enabled as unknown) === true) {
			params.populationCookieAutomaticSalt = true;
		}

		if (typeof params.populationCookieIncludeRuleName === 'undefined' && (params.enabled as unknown) === true) {
			params.populationCookieIncludeRuleName = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'audienceSegmentation', {}, params));
	}

	/**
	 * Accesses Brotli-compressed assets from your origin and caches them on edge servers. This doesn't compress
	 * resources within the content delivery network in real time. You need to set up Brotli compression separately on
	 * your origin. If a requesting client doesn't support Brotli, edge servers deliver non-Brotli resources.
	 *
	 * @param {object} params - The parameters needed to configure setBrotli
	 * @param {boolean} [params.enabled] - Fetches Brotli-compressed assets from your origin and caches them on edge
	 *   servers. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/brotli-support | Akamai Techdocs}
	 */
	setBrotli(params: {
		/** Fetches Brotli-compressed assets from your origin and caches them on edge servers. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'brotli', {}, params));
	}

	/**
	 * Manages whether your page and its embedded iframes can access various browser features that affect end-user
	 * privacy, security, and performance. Use this together with [`requestClientHints`](#).
	 *
	 * @param {object} params - The parameters needed to configure setPermissionsPolicy
	 * @param {string[]} [params.permissionsPolicyDirective] - Each directive represents a browser feature. Specify the
	 *   ones you want enabled in a client browser that accesses your content. You can add custom entries or provide
	 *   pre-set values from the list. For more details on each value, see the [guide
	 *   section](doc:permissions-policy#features-and-options) for this behavior. <div> <pre
	 *   style="column-width:8pc;padding:1pc;"> battery camera ch-ua ch-ua-arch ch-ua-bitness ch-dpr
	 *   ch-ua-full-version-list ch-ua-mobile ch-ua-model ch-ua-platform ch-ua-platform-version ch-viewport-width
	 *   ch-width device-memory display-capture downlink ect fullscreen geolocation microphone rtt </pre> </div>
	 *   Default: [].
	 * @param {string} params.allowList - The features you've set in `permissionsPolicyDirective` are enabled for
	 *   domains you specify here. They'll remain disabled for all other domains. Separate multiple domains with a
	 *   single space. To block the specified directives from all domains, set this to `none`. This generates an empty
	 *   value in the `Permissions-Policy` header.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/permissions-policy | Akamai Techdocs}
	 */
	setPermissionsPolicy(params: {
		/**
		 * Each directive represents a browser feature. Specify the ones you want enabled in a client browser that
		 * accesses your content. You can add custom entries or provide pre-set values from the list. For more details
		 * on each value, see the [guide section](doc:permissions-policy#features-and-options) for this behavior. <div><pre style="column-width:8pc;padding:1pc;"> battery camera ch-ua ch-ua-arch ch-ua-bitness ch-dpr
		 * ch-ua-full-version-list ch-ua-mobile ch-ua-model ch-ua-platform ch-ua-platform-version ch-viewport-width
		 * ch-width device-memory display-capture downlink ect fullscreen geolocation microphone rtt </pre> </div>
		 *
		 * Default: [].
		 */
		permissionsPolicyDirective?: string[];

		/**
		 * The features you've set in `permissionsPolicyDirective` are enabled for domains you specify here. They'll
		 * remain disabled for all other domains. Separate multiple domains with a single space. To block the specified
		 * directives from all domains, set this to `none`. This generates an empty value in the `Permissions-Policy`
		 * header.
		 */
		allowList: string;
	}): Property {
		if (typeof params.permissionsPolicyDirective === 'undefined') {
			params.permissionsPolicyDirective = [];
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'permissionsPolicy', {}, params));
	}

	/**
	 * Client hints are HTTP request header fields that determine which resources the browser should include in the
	 * response. This behavior configures and prioritizes the client hints you want to send to request specific client
	 * and device information. Use `requestClientHints` together with the [`permissionsPolicy`](#) behavior.
	 *
	 * @param {object} params - The parameters needed to configure setRequestClientHints
	 * @param {string[]} [params.acceptCh] - The client hint data objects you want to receive from the browser. You can
	 *   add custom entries or provide pre-set values from the list. For more details on each value, see the [guide
	 *   section](doc:request-client-hints#implementation) for this behavior. If you've configured your origin server to
	 *   pass along data objects, they merge with the ones you set in this array, before the list is sent to the
	 *   client.<div> <pre style="column-width:8pc;padding:1pc;"> Device-Memory Downlink ECT RTT Sec-CH-DPR Sec-CH-UA
	 * Sec-CH-UA-Arch Sec-CH-UA-Bitness Sec-CH-UA-Full-Version-List Sec-CH-UA-Mobile Sec-CH-UA-Model
	 * Sec-CH-UA-Platform Sec-CH-UA-Platform-Version Sec-CH-Viewport-Width Sec-CH-Width </pre></div> Default: [].
	 * @param {string[]} [params.acceptCriticalCh] - The critical client hint data objects you want to receive from the
	 *   browser. The original request from the browser needs to include these objects. Otherwise, a new response header
	 *   is sent back to the client, asking for all of these client hint data objects. You can add custom entries or
	 *   provide pre-set values from the list. For more details on each value, see the [guide
	 *   section](doc:request-client-hints#implementation) for this behavior. <div> <pre
	 *   style="column-width:8pc;padding:1pc;"> Device-Memory Downlink ECT RTT Sec-CH-DPR Sec-CH-UA Sec-CH-UA-Arch
	 *   Sec-CH-UA-Bitness Sec-CH-UA-Full-Version-List Sec-CH-UA-Mobile Sec-CH-UA-Model Sec-CH-UA-Platform
	 *   Sec-CH-UA-Platform-Version Sec-CH-Viewport-Width Sec-CH-Width </pre> </div> Default: [].
	 * @param {boolean} [params.reset] - This sends an empty instance of the `Accept-CH` response header to clear other
	 *   `Accept-CH` values currently stored in the client browser. This empty header doesn't get merged with other
	 *   objects sent from your origin server. To enable this option, make sure you leave `acceptCh` and
	 *   `acceptCriticalCh` empty. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/request-client-hints | Akamai Techdocs}
	 */
	setRequestClientHints(params: {
		/**
		 * The client hint data objects you want to receive from the browser. You can add custom entries or provide
		 * pre-set values from the list. For more details on each value, see the [guide
		 * section](doc:request-client-hints#implementation) for this behavior. If you've configured your origin server
		 * to pass along data objects, they merge with the ones you set in this array, before the list is sent to the
		 * client. <div> <pre style="column-width:8pc;padding:1pc;"> Device-Memory Downlink ECT RTT Sec-CH-DPR Sec-CH-UA
		 * Sec-CH-UA-Arch Sec-CH-UA-Bitness Sec-CH-UA-Full-Version-List Sec-CH-UA-Mobile Sec-CH-UA-Model
		 * Sec-CH-UA-Platform Sec-CH-UA-Platform-Version Sec-CH-Viewport-Width Sec-CH-Width </pre> </div> Default: [].
		 */
		acceptCh?: string[];

		/**
		 * The critical client hint data objects you want to receive from the browser. The original request from the
		 * browser needs to include these objects. Otherwise, a new response header is sent back to the client, asking
		 * for all of these client hint data objects. You can add custom entries or provide pre-set values from the
		 * list. For more details on each value, see the [guide section](doc:request-client-hints#implementation) for
		 * this behavior. <div> <pre style="column-width:8pc;padding:1pc;"> Device-Memory Downlink ECT RTT Sec-CH-DPR
		 * Sec-CH-UA Sec-CH-UA-Arch Sec-CH-UA-Bitness Sec-CH-UA-Full-Version-List Sec-CH-UA-Mobile Sec-CH-UA-Model
		 * Sec-CH-UA-Platform Sec-CH-UA-Platform-Version Sec-CH-Viewport-Width Sec-CH-Width </pre> </div> Default: [].
		 */
		acceptCriticalCh?: string[];

		/**
		 * This sends an empty instance of the `Accept-CH` response header to clear other `Accept-CH` values currently
		 * stored in the client browser. This empty header doesn't get merged with other objects sent from your origin
		 * server. To enable this option, make sure you leave `acceptCh` and `acceptCriticalCh` empty. Default: false.
		 */
		reset?: boolean;
	}): Property {
		if (typeof params.acceptCh === 'undefined') {
			params.acceptCh = [];
		}

		if (typeof params.acceptCriticalCh === 'undefined') {
			params.acceptCriticalCh = [];
		}

		if (typeof params.reset === 'undefined') {
			params.reset = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'requestClientHints', {}, params));
	}

	/**
	 * [Cloud Wrapper](https://techdocs.akamai.com/cloud-wrapper) maximizes origin offload for large libraries of video,
	 * game, and software downloads by optimizing data caches in regions nearest to your origin. You can't use this
	 * behavior in conjunction with [`sureRoute`](#) or [`tieredDistribution`](#).
	 *
	 * @param {object} params - The parameters needed to configure setCloudWrapper
	 * @param {boolean} [params.enabled] - Enables Cloud Wrapper behavior. Default: false.
	 * @param {string} [params.location] - The location you want to distribute your Cloud Wrapper cache space to. This
	 *   behavior allows all locations configured in your Cloud Wrapper configuration.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/cloud-wrapper | Akamai Techdocs}
	 */
	setCloudWrapper(params: {
		/** Enables Cloud Wrapper behavior. Default: false. */
		enabled?: boolean;

		/**
		 * The location you want to distribute your Cloud Wrapper cache space to. This behavior allows all locations
		 * configured in your Cloud Wrapper configuration.
		 */
		location?: string;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'cloudWrapper', {}, params));
	}

	/**
	 * Your account representative uses this behavior to implement a customized failover configuration on your behalf.
	 * Use Cloud Wrapper Advanced with an enabled [`cloudWrapper`](#) behavior in the same rule.
	 *
	 * @param {object} params - The parameters needed to configure setCloudWrapperAdvanced
	 * @param {boolean} [params.enabled] - Enables failover for Cloud Wrapper. Default: false.
	 * @param {string} [params.failoverMap] - Specifies the failover map to handle Cloud Wrapper failures. Contact your
	 *   account representative for more information.
	 * @param {string} [params.customFailoverMap] - Specifies the custom failover map to handle Cloud Wrapper failures.
	 *   Contact your account representative for more information. PM variables may appear between '{{' and '}}'.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/cloud-wrapper-adv | Akamai Techdocs}
	 */
	setCloudWrapperAdvanced(params: {
		/** Enables failover for Cloud Wrapper. Default: false. */
		enabled?: boolean;

		/**
		 * Specifies the failover map to handle Cloud Wrapper failures. Contact your account representative for more
		 * information.
		 */
		failoverMap?: string;

		/**
		 * Specifies the custom failover map to handle Cloud Wrapper failures. Contact your account representative for
		 * more information. PM variables may appear between '{{' and '}}'.
		 */
		customFailoverMap?: string;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = false;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'BEHAVIOR',
				'cloudWrapperAdvanced',
				{allowsVars: ['customFailoverMap']},
				params,
			),
		);
	}

	/**
	 * With Tiered Distribution, Akamai edge servers retrieve cached content from other Akamai servers, rather than
	 * directly from the origin. This behavior sets custom Tiered Distribution maps (TD0) and migrates TD1 maps
	 * configured with [advanced features](ref:advanced-and-locked-features) to Cloud Wrapper. You need to enable
	 * [`cloudWrapper`](#) within the same rule.
	 *
	 * @param {object} params - The parameters needed to configure setTieredDistributionCustomization
	 * @param {boolean} [params.customMapEnabled] - Enables custom maps. Default: false.
	 * @param {string} [params.customMapName] - Specifies the custom map name. PM variables may appear between '{{' and
	 *   '}}'.
	 * @param {string} [params.serialStart] - Specifies a numeric serial start value.
	 * @param {string} [params.serialEnd] - Specifies a numeric serial end value. Akamai uses serial numbers to group
	 *   machines and share objects in their cache with other machines in the same region.
	 * @param {'GCC' | 'JENKINS'} [params.hashAlgorithm] - Specifies the hash algorithm. Default: "GCC".
	 * @param {boolean} [params.mapMigrationEnabled] - Enables migration of the custom map to Cloud Wrapper. Default:
	 *   false.
	 * @param {boolean} [params.migrationWithinCwMapsEnabled] - Enables migration within Cloud Wrapper maps. Default:
	 *   false.
	 * @param {string} [params.location] - Location from which Cloud Wrapper migration is performed. User should choose
	 *   the existing Cloud Wrapper location. The new Cloud Wrapper location (to which migration has to happen) is
	 *   expected to be updated as part of the main "Cloud Wrapper" behavior.
	 * @param {string} [params.migrationStartDate] - Specifies when to start migrating the map.
	 * @param {string} [params.migrationEndDate] - Specifies when the map migration should end.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/tiered-distribution-customization | Akamai Techdocs}
	 */
	setTieredDistributionCustomization(params: {
		/** Enables custom maps. Default: false. */
		customMapEnabled?: boolean;

		/** Specifies the custom map name. PM variables may appear between '{{' and '}}'. */
		customMapName?: string;

		/** Specifies a numeric serial start value. */
		serialStart?: string;

		/**
		 * Specifies a numeric serial end value. Akamai uses serial numbers to group machines and share objects in their
		 * cache with other machines in the same region.
		 */
		serialEnd?: string;

		/** Specifies the hash algorithm. Default: "GCC". */
		hashAlgorithm?: 'GCC' | 'JENKINS';

		/** Enables migration of the custom map to Cloud Wrapper. Default: false. */
		mapMigrationEnabled?: boolean;

		/** Enables migration within Cloud Wrapper maps. Default: false. */
		migrationWithinCwMapsEnabled?: boolean;

		/**
		 * Location from which Cloud Wrapper migration is performed. User should choose the existing Cloud Wrapper
		 * location. The new Cloud Wrapper location (to which migration has to happen) is expected to be updated as part
		 * of the main "Cloud Wrapper" behavior.
		 */
		location?: string;

		/** Specifies when to start migrating the map. */
		migrationStartDate?: string;

		/** Specifies when the map migration should end. */
		migrationEndDate?: string;
	}): Property {
		if (typeof params.customMapEnabled === 'undefined') {
			params.customMapEnabled = false;
		}

		if (typeof params.hashAlgorithm === 'undefined' && (params.customMapEnabled as unknown) === true) {
			params.hashAlgorithm = 'GCC';
		}

		if (typeof params.mapMigrationEnabled === 'undefined') {
			params.mapMigrationEnabled = false;
		}

		if (
			typeof params.migrationWithinCwMapsEnabled === 'undefined' &&
			(params.mapMigrationEnabled as unknown) === true
		) {
			params.migrationWithinCwMapsEnabled = false;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'BEHAVIOR',
				'tieredDistributionCustomization',
				{allowsVars: ['customMapName']},
				params,
			),
		);
	}

	/**
	 * 2DO.
	 *
	 * @param {object} params - The parameters needed to configure setConditionalOrigin
	 * @param {string} params.originId - 2DO.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/welcome-prop-manager | Akamai Techdocs}
	 */
	setConditionalOrigin(params: {
		/** 2DO. */
		originId: string;
	}): Property {
		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'conditionalOrigin', {}, params));
	}

	/**
	 * [EdgeScape](https://control.akamai.com/apps/download-center/#/products/3;name=EdgeScape) allows you to customize
	 * content based on the end user's geographic location or connection speed. When enabled, the edge server sends a
	 * special `X-Akamai-Edgescape` header to the origin server encoding relevant details about the end-user client as
	 * key-value pairs.
	 *
	 * @param {object} params - The parameters needed to configure setEdgeScape
	 * @param {boolean} [params.enabled] - When enabled, sends the `X-Akamai-Edgescape` request header to the origin.
	 *   Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/content-tgting | Akamai Techdocs}
	 */
	setEdgeScape(params: {
		/** When enabled, sends the `X-Akamai-Edgescape` request header to the origin. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'edgeScape', {}, params));
	}

	/**
	 * The Phased Release Cloudlet provides gradual and granular traffic management to an alternate origin in near real
	 * time. Use the [Cloudlets API](https://techdocs.akamai.com/cloudlets/reference) or the Cloudlets Policy Manager
	 * application within [Control Center](https://control.akamai.com) to set up your Cloudlets policies.
	 *
	 * @param {object} params - The parameters needed to configure setPhasedRelease
	 * @param {boolean} [params.enabled] - Enables the Phased Release Cloudlet. Default: true.
	 * @param {boolean} [params.isSharedPolicy] - Whether you want to apply the Cloudlet shared policy to an unlimited
	 *   number of properties within your account. Learn more about shared policies and how to create them in [Cloudlets
	 *   Policy Manager](https://techdocs.akamai.com/cloudlets). Default: false.
	 * @param {any} [params.cloudletPolicy] - Specifies the Cloudlet policy as an object.
	 * @param {number} [params.cloudletSharedPolicy] - Identifies the Cloudlet shared policy to use with this behavior.
	 *   Use the [Cloudlets API](https://techdocs.akamai.com/cloudlets/reference) to list available shared policies.
	 * @param {string} [params.label] - A label to distinguish this Phased Release policy from any others within the
	 *   same property.
	 * @param {'NONE' | 'NEVER' | 'ON_BROWSER_CLOSE' | 'FIXED_DATE' | 'DURATION'} [params.populationCookieType] - Select
	 *   when to assign a cookie to the population of users the Cloudlet defines. If you select the Cloudlet's _random_
	 *   membership option, it overrides this option's value so that it is effectively `NONE`. Default: "NONE".
	 * @param {string} [params.populationExpirationDate] - Specifies the date and time when membership expires, and the
	 *   browser no longer sends the cookie. Subsequent requests re-evaluate based on current membership settings.
	 * @param {string} [params.populationDuration] - Sets the lifetime of the cookie from the initial request.
	 *   Subsequent requests re-evaluate based on current membership settings. Default: "300s".
	 * @param {boolean} [params.populationRefresh] - Enabling this option resets the original duration of the cookie if
	 *   the browser refreshes before the cookie expires. Default: false.
	 * @param {boolean} [params.failoverEnabled] - Allows failure responses at the origin defined by the Cloudlet to
	 *   fail over to the prevailing origin defined by the property. Default: false.
	 * @param {string[]} [params.failoverResponseCode] - Defines the set of failure codes that initiate the failover
	 *   response.
	 * @param {number} [params.failoverDuration] - Specifies the number of seconds to wait until the client tries to
	 *   access the failover origin after the initial failure is detected. Set the value to `0` to immediately request
	 *   the alternate origin upon failure. Default: 30.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/phased-release-cloudlet | Akamai Techdocs}
	 */
	setPhasedRelease(params: {
		/** Enables the Phased Release Cloudlet. Default: true. */
		enabled?: boolean;

		/**
		 * Whether you want to apply the Cloudlet shared policy to an unlimited number of properties within your
		 * account. Learn more about shared policies and how to create them in [Cloudlets Policy
		 * Manager](https://techdocs.akamai.com/cloudlets). Default: false.
		 */
		isSharedPolicy?: boolean;

		/** Specifies the Cloudlet policy as an object. */
		cloudletPolicy?: any;

		/**
		 * Identifies the Cloudlet shared policy to use with this behavior. Use the [Cloudlets
		 * API](https://techdocs.akamai.com/cloudlets/reference) to list available shared policies.
		 */
		cloudletSharedPolicy?: number;

		/** A label to distinguish this Phased Release policy from any others within the same property. */
		label?: string;

		/**
		 * Select when to assign a cookie to the population of users the Cloudlet defines. If you select the Cloudlet's
		 * _random_ membership option, it overrides this option's value so that it is effectively `NONE`. Default:
		 * "NONE".
		 */
		populationCookieType?: 'NONE' | 'NEVER' | 'ON_BROWSER_CLOSE' | 'FIXED_DATE' | 'DURATION';

		/**
		 * Specifies the date and time when membership expires, and the browser no longer sends the cookie. Subsequent
		 * requests re-evaluate based on current membership settings.
		 */
		populationExpirationDate?: string;

		/**
		 * Sets the lifetime of the cookie from the initial request. Subsequent requests re-evaluate based on current
		 * membership settings. Default: "300s".
		 */
		populationDuration?: string;

		/**
		 * Enabling this option resets the original duration of the cookie if the browser refreshes before the cookie
		 * expires. Default: false.
		 */
		populationRefresh?: boolean;

		/**
		 * Allows failure responses at the origin defined by the Cloudlet to fail over to the prevailing origin defined
		 * by the property. Default: false.
		 */
		failoverEnabled?: boolean;

		/** Defines the set of failure codes that initiate the failover response. */
		failoverResponseCode?: string[];

		/**
		 * Specifies the number of seconds to wait until the client tries to access the failover origin after the
		 * initial failure is detected. Set the value to `0` to immediately request the alternate origin upon failure.
		 * Default: 30.
		 */
		failoverDuration?: number;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.isSharedPolicy === 'undefined' && (params.enabled as unknown) === true) {
			params.isSharedPolicy = false;
		}

		if (typeof params.populationCookieType === 'undefined' && (params.enabled as unknown) === true) {
			params.populationCookieType = 'NONE';
		}

		if (
			typeof params.populationDuration === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.populationCookieType as unknown) === 'DURATION'
		) {
			params.populationDuration = '300s';
		}

		if (
			typeof params.populationRefresh === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.populationCookieType as unknown) === 'DURATION'
		) {
			params.populationRefresh = false;
		}

		if (typeof params.failoverEnabled === 'undefined' && (params.enabled as unknown) === true) {
			params.failoverEnabled = false;
		}

		if (
			typeof params.failoverDuration === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.failoverEnabled as unknown) === true
		) {
			params.failoverDuration = 30;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'phasedRelease', {}, params));
	}

	/**
	 * Allows you to insert a customized XML metadata behavior into any property's rule tree. Talk to your Akamai
	 * representative to implement the customized behavior. Once it's ready, run PAPI's [List custom
	 * behaviors](ref:get-custom-behaviors) operation, then apply the relevant `behaviorId` value from the response
	 * within the current `customBehavior`. See [Custom behaviors and overrides](ref:custom-behaviors-and-overrides) for
	 * guidance on custom metadata behaviors.
	 *
	 * @param {object} params - The parameters needed to configure setCustomBehavior
	 * @param {string} params.behaviorId - The unique identifier for the predefined custom behavior you want to insert
	 *   into the current rule.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/custom-behavior | Akamai Techdocs}
	 */
	setCustomBehavior(params: {
		/** The unique identifier for the predefined custom behavior you want to insert into the current rule. */
		behaviorId: string;
	}): Property {
		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'customBehavior', {}, params));
	}

	/**
	 * Generates a unique identifier for each request on the Akamai edge network, for use in logging and debugging. GRN
	 * identifiers follow the same format as Akamai's error reference strings, for example:
	 * `0.05313217.1567801841.1457a3`. You can use the Edge Diagnostics API's [Translate error
	 * string](https://techdocs.akamai.com/edge-diagnostics/reference/post-error-translator) operation to get low-level
	 * details about any request.
	 *
	 * @param {object} params - The parameters needed to configure setGlobalRequestNumber
	 * @param {'RESPONSE_HEADER' | 'REQUEST_HEADER' | 'BOTH_HEADERS' | 'ASSIGN_VARIABLE'} [params.outputOption] -
	 *   Specifies how to report the GRN value. Default: "RESPONSE_HEADER".
	 * @param {string} [params.headerName] - With `outputOption` set to specify any set of headers, this specifies the
	 *   name of the header to report the GRN value. Default: "Akamai-GRN".
	 * @param {string} [params.variableName] - This specifies the name of the variable to assign the GRN value to. You
	 *   need to pre-declare any [variable](ref:variables) you specify within the rule tree.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/global-req-number | Akamai Techdocs}
	 */
	setGlobalRequestNumber(params: {
		/** Specifies how to report the GRN value. Default: "RESPONSE_HEADER". */
		outputOption?: 'RESPONSE_HEADER' | 'REQUEST_HEADER' | 'BOTH_HEADERS' | 'ASSIGN_VARIABLE';

		/**
		 * With `outputOption` set to specify any set of headers, this specifies the name of the header to report the
		 * GRN value. Default: "Akamai-GRN".
		 */
		headerName?: string;

		/**
		 * This specifies the name of the variable to assign the GRN value to. You need to pre-declare any
		 * [variable](ref:variables) you specify within the rule tree.
		 */
		variableName?: string;
	}): Property {
		if (typeof params.outputOption === 'undefined') {
			params.outputOption = 'RESPONSE_HEADER';
		}

		if (
			typeof params.headerName === 'undefined' &&
			params.outputOption !== undefined &&
			['RESPONSE_HEADER', 'REQUEST_HEADER', 'BOTH_HEADERS'].includes(params.outputOption)
		) {
			params.headerName = 'Akamai-GRN';
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'globalRequestNumber', {variable: ['variableName']}, params),
		);
	}

	/**
	 * Generates a response header with information about cache status. Among other things, this can tell you whether
	 * the response came from the Akamai cache, or from the origin. Status values report with either of these forms of
	 * syntax, depending for example on whether you're deploying traffic using [`sureRoute`](#) or
	 * [`tieredDistribution`](#): {status} from child {status} from child, {status} from parent The `status` value can
	 * be any of the following: - `Hit` - the object was retrieved from Akamai's cache. - `Miss` - the object was not
	 * found in the Akamai cache. - `RefreshHit` - the object was found in Akamai's cache, but was stale, so an
	 * `If-Modified-Since` request was made to the customer origin, with 304 as the response code, indicating unmodified
	 * content. - `HitStale` - the object was found in Akamai's cache and was stale, but a more recent object was not
	 * available from the customer origin, so the cache served the stale object to the client. - `Constructed` - the
	 * [`constructResponse`](#) behavior directly specified the response to the client. - `Redirect` - the Akamai edge
	 * configuration specified a redirect, typically by executing the [`redirect`](#), [`redirectplus`](#), or
	 * [`edgeRedirector`](#) behaviors. - `Error` - an error occurred, typically when authorization is denied or the
	 * request is rejected by WAF.
	 *
	 * @param {object} params - The parameters needed to configure setReturnCacheStatus
	 * @param {string} [params.responseHeaderName] - Specifies the name of the HTTP header in which to report the cache
	 *   status value. Default: "Akamai-Cache-Status".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/return-cache-status | Akamai Techdocs}
	 */
	setReturnCacheStatus(params: {
		/**
		 * Specifies the name of the HTTP header in which to report the cache status value. Default:
		 * "Akamai-Cache-Status".
		 */
		responseHeaderName?: string;
	}): Property {
		if (typeof params.responseHeaderName === 'undefined') {
			params.responseHeaderName = 'Akamai-Cache-Status';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'returnCacheStatus', {}, params));
	}

	/**
	 * Edge IP Binding works with a limited set of static IP addresses to distribute your content, which can be limiting
	 * in large footprint environments. This behavior sets Hash Serial and Forward (HSAF) for Edge IP Binding to deal
	 * with larger footprints. It can only be configured on your behalf by Akamai Professional Services. For more
	 * information, see the [Edge IP Binding
	 * documentation](https://techdocs.akamai.com/edge-ip-binding/docs/how-add-hsaf-eipb).
	 *
	 * @param {object} params - The parameters needed to configure setHsafEipBinding
	 * @param {boolean} [params.enabled] - Enables HSAF for Edge IP Binding customers with a large footprint. Default:
	 *   false.
	 * @param {boolean} [params.customExtractedSerial] - Whether to pull the serial number from the variable value set
	 *   in the `advanced` behavior. Work with your Akamai Services team to add the [`advanced`](#) behavior earlier in
	 *   your property to extract and apply the `AKA_PM_EIP_HSAF_SERIAL` variable. Default: false.
	 * @param {number} [params.hashMinValue] - Specifies the minimum value for the HSAF hash range, from 2 through 2045.
	 *   This needs to be lower than `hashMaxValue`.
	 * @param {number} [params.hashMaxValue] - Specifies the maximum value for the hash range, from 3 through 2046. This
	 *   needs to be higher than `hashMinValue`.
	 * @param {'EDGE' | 'PARENT' | 'BOTH'} [params.tier] - Specifies where the behavior is applied. Default: "EDGE".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/hsaf-edge-ip-binding | Akamai Techdocs}
	 */
	setHsafEipBinding(params: {
		/** Enables HSAF for Edge IP Binding customers with a large footprint. Default: false. */
		enabled?: boolean;

		/**
		 * Whether to pull the serial number from the variable value set in the `advanced` behavior. Work with your
		 * Akamai Services team to add the [`advanced`](#) behavior earlier in your property to extract and apply the
		 * `AKA_PM_EIP_HSAF_SERIAL` variable. Default: false.
		 */
		customExtractedSerial?: boolean;

		/**
		 * Specifies the minimum value for the HSAF hash range, from 2 through 2045. This needs to be lower than
		 * `hashMaxValue`.
		 */
		hashMinValue?: number;

		/**
		 * Specifies the maximum value for the hash range, from 3 through 2046. This needs to be higher than
		 * `hashMinValue`.
		 */
		hashMaxValue?: number;

		/** Specifies where the behavior is applied. Default: "EDGE". */
		tier?: 'EDGE' | 'PARENT' | 'BOTH';
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = false;
		}

		if (typeof params.customExtractedSerial === 'undefined' && (params.enabled as unknown) === true) {
			params.customExtractedSerial = false;
		}

		if (typeof params.tier === 'undefined' && (params.enabled as unknown) === true) {
			params.tier = 'EDGE';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'hsafEipBinding', {}, params));
	}

	/**
	 * This behavior enables the [Edge Redirector Cloudlet](https://techdocs.akamai.com/cloudlets) application, which
	 * helps you manage large numbers of redirects. With Cloudlets available on your contract, choose **Your services**> **Edge logic Cloudlets** to control the Edge Redirector within [Control Center](https://control.akamai.com).
	 * > Otherwise use the [Cloudlets API](https://techdocs.akamai.com/cloudlets/reference) to configure it
	 * > programmatically.
	 *
	 * @param {object} params - The parameters needed to configure setEdgeRedirector
	 * @param {boolean} [params.enabled] - Enables the Edge Redirector Cloudlet. Default: true.
	 * @param {boolean} [params.isSharedPolicy] - Whether you want to apply the Cloudlet shared policy to an unlimited
	 *   number of properties within your account. Learn more about shared policies and how to create them in [Cloudlets
	 *   Policy Manager](https://techdocs.akamai.com/cloudlets). Default: false.
	 * @param {any} [params.cloudletPolicy] - Specifies the Cloudlet policy as an object.
	 * @param {number} [params.cloudletSharedPolicy] - Identifies the Cloudlet shared policy to use with this behavior.
	 *   Use the [Cloudlets API](https://techdocs.akamai.com/cloudlets/reference) to list available shared policies.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/edge-redirector-cloudlet | Akamai Techdocs}
	 */
	setEdgeRedirector(params: {
		/** Enables the Edge Redirector Cloudlet. Default: true. */
		enabled?: boolean;

		/**
		 * Whether you want to apply the Cloudlet shared policy to an unlimited number of properties within your
		 * account. Learn more about shared policies and how to create them in [Cloudlets Policy
		 * Manager](https://techdocs.akamai.com/cloudlets). Default: false.
		 */
		isSharedPolicy?: boolean;

		/** Specifies the Cloudlet policy as an object. */
		cloudletPolicy?: any;

		/**
		 * Identifies the Cloudlet shared policy to use with this behavior. Use the [Cloudlets
		 * API](https://techdocs.akamai.com/cloudlets/reference) to list available shared policies.
		 */
		cloudletSharedPolicy?: number;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.isSharedPolicy === 'undefined' && (params.enabled as unknown) === true) {
			params.isSharedPolicy = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'edgeRedirector', {}, params));
	}

	/**
	 * [EdgeWorkers](https://techdocs.akamai.com/edgeworkers) are JavaScript applications that allow you to manipulate
	 * your web traffic on edge servers outside of Property Manager behaviors, and deployed independently from your
	 * configuration's logic. This behavior applies an EdgeWorker to a set of edge requests.
	 *
	 * @param {object} params - The parameters needed to configure setEdgeWorker
	 * @param {boolean} [params.enabled] - When enabled, applies specified EdgeWorker functionality to this rule's web
	 *   traffic. Default: true.
	 * @param {string} [params.edgeWorkerId] - Identifies the EdgeWorker application to apply to this rule's web
	 *   traffic. You can use the [EdgeWorkers API](https://techdocs.akamai.com/edgeworkers/reference) to get this
	 *   value. Default: "".
	 * @param {boolean} [params.mPulse] - Enables mPulse reports that include data about EdgeWorkers errors generated
	 *   due to JavaScript errors. For more details, see [Integrate mPulse reports with
	 *   EdgeWorkers](https://techdocs.akamai.com/edgeworkers/docs/mpulse). Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/edgeworkers-beh | Akamai Techdocs}
	 */
	setEdgeWorker(params: {
		/** When enabled, applies specified EdgeWorker functionality to this rule's web traffic. Default: true. */
		enabled?: boolean;

		/**
		 * Identifies the EdgeWorker application to apply to this rule's web traffic. You can use the [EdgeWorkers
		 * API](https://techdocs.akamai.com/edgeworkers/reference) to get this value. Default: "".
		 */
		edgeWorkerId?: string;

		/**
		 * Enables mPulse reports that include data about EdgeWorkers errors generated due to JavaScript errors. For
		 * more details, see [Integrate mPulse reports with
		 * EdgeWorkers](https://techdocs.akamai.com/edgeworkers/docs/mpulse). Default: false.
		 */
		mPulse?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.edgeWorkerId === 'undefined' && (params.enabled as unknown) === true) {
			params.edgeWorkerId = '';
		}

		if (typeof params.mPulse === 'undefined' && (params.enabled as unknown) === true) {
			params.mPulse = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'edgeWorker', {}, params));
	}

	/**
	 * By default, source URLs serve as cache IDs on edge servers. Electronic Data Capture allows you to specify an
	 * additional set of device characteristics to generate separate cache keys. Use this in conjunction with the
	 * [`deviceCharacteristicHeader`](#) behavior.
	 *
	 * @param {object} params - The parameters needed to configure setDeviceCharacteristicCacheId
	 * @param {(
	 * 	| 'BRAND_NAME'
	 * 	| 'MODEL_NAME'
	 * 	| 'MARKETING_NAME'
	 * 	| 'IS_MOBILE'
	 * 	| 'IS_WIRELESS_DEVICE'
	 * 	| 'IS_TABLET'
	 * 	| 'DEVICE_OS'
	 * 	| 'DEVICE_OS_VERSION'
	 * 	| 'MOBILE_BROWSER'
	 * 	| 'MOBILE_BROWSER_VERSION'
	 * 	| 'RESOLUTION_WIDTH'
	 * 	| 'RESOLUTION_HEIGHT'
	 * 	| 'PHYSICAL_SCREEN_HEIGHT'
	 * 	| 'PHYSICAL_SCREEN_WIDTH'
	 * 	| 'COOKIE_SUPPORT'
	 * 	| 'AJAX_SUPPORT_JAVASCRIPT'
	 * 	| 'PREFERRED_MARKUP'
	 * 	| 'MAX_IMAGE_WIDTH'
	 * 	| 'MAX_IMAGE_HEIGHT'
	 * 	| 'VIEWPORT_INITIAL_SCALE'
	 * 	| 'FULL_FLASH_SUPPORT'
	 * 	| 'HTML_PREFERRED_DTD'
	 * 	| 'XHTML_PREFERRED_CHARSET'
	 * 	| 'VIEWPORT_WIDTH'
	 * 	| 'DUAL_ORIENTATION'
	 * 	| 'ACCEPT_THIRD_PARTY_COOKIE'
	 * 	| 'XHTMLMP_PREFERRED_MIME_TYPE'
	 * 	| 'GIF_ANIMATED'
	 * 	| 'JPG'
	 * 	| 'PNG'
	 * 	| 'XHTML_SUPPORTS_TABLE_FOR_LAYOUT'
	 * 	| 'AJAX_PREFERRED_GEOLOC_API'
	 * 	| 'XHTML_TABLE_SUPPORT'
	 * 	| 'XHTML_FILE_UPLOAD'
	 * 	| 'XHTML_SUPPORT_LEVEL'
	 * 	| 'XHTML_SUPPORTS_IFRAME'
	 * 	| 'FLASH_LITE_VERSION'
	 * 	| 'PDF_SUPPORT'
	 * )[]} params.elements
	 *   - Specifies a set of information about the device with which to generate a separate cache key.
	 *
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/device-characterization-dc | Akamai Techdocs}
	 */
	setDeviceCharacteristicCacheId(params: {
		/** Specifies a set of information about the device with which to generate a separate cache key. */
		elements: Array<
			| 'BRAND_NAME'
			| 'MODEL_NAME'
			| 'MARKETING_NAME'
			| 'IS_MOBILE'
			| 'IS_WIRELESS_DEVICE'
			| 'IS_TABLET'
			| 'DEVICE_OS'
			| 'DEVICE_OS_VERSION'
			| 'MOBILE_BROWSER'
			| 'MOBILE_BROWSER_VERSION'
			| 'RESOLUTION_WIDTH'
			| 'RESOLUTION_HEIGHT'
			| 'PHYSICAL_SCREEN_HEIGHT'
			| 'PHYSICAL_SCREEN_WIDTH'
			| 'COOKIE_SUPPORT'
			| 'AJAX_SUPPORT_JAVASCRIPT'
			| 'PREFERRED_MARKUP'
			| 'MAX_IMAGE_WIDTH'
			| 'MAX_IMAGE_HEIGHT'
			| 'VIEWPORT_INITIAL_SCALE'
			| 'FULL_FLASH_SUPPORT'
			| 'HTML_PREFERRED_DTD'
			| 'XHTML_PREFERRED_CHARSET'
			| 'VIEWPORT_WIDTH'
			| 'DUAL_ORIENTATION'
			| 'ACCEPT_THIRD_PARTY_COOKIE'
			| 'XHTMLMP_PREFERRED_MIME_TYPE'
			| 'GIF_ANIMATED'
			| 'JPG'
			| 'PNG'
			| 'XHTML_SUPPORTS_TABLE_FOR_LAYOUT'
			| 'AJAX_PREFERRED_GEOLOC_API'
			| 'XHTML_TABLE_SUPPORT'
			| 'XHTML_FILE_UPLOAD'
			| 'XHTML_SUPPORT_LEVEL'
			| 'XHTML_SUPPORTS_IFRAME'
			| 'FLASH_LITE_VERSION'
			| 'PDF_SUPPORT'
		>;
	}): Property {
		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'deviceCharacteristicCacheId', {}, params),
		);
	}

	/**
	 * Sends selected information about requesting devices to the origin server, in the form of an
	 * `X-Akamai-Device-Characteristics` HTTP header. Use in conjunction with the [`deviceCharacteristicCacheId`](#)
	 * behavior.
	 *
	 * @param {object} params - The parameters needed to configure setDeviceCharacteristicHeader
	 * @param {(
	 * 	| 'BRAND_NAME'
	 * 	| 'MODEL_NAME'
	 * 	| 'MARKETING_NAME'
	 * 	| 'IS_MOBILE'
	 * 	| 'IS_WIRELESS_DEVICE'
	 * 	| 'IS_TABLET'
	 * 	| 'DEVICE_OS'
	 * 	| 'DEVICE_OS_VERSION'
	 * 	| 'MOBILE_BROWSER'
	 * 	| 'MOBILE_BROWSER_VERSION'
	 * 	| 'RESOLUTION_WIDTH'
	 * 	| 'RESOLUTION_HEIGHT'
	 * 	| 'PHYSICAL_SCREEN_HEIGHT'
	 * 	| 'PHYSICAL_SCREEN_WIDTH'
	 * 	| 'COOKIE_SUPPORT'
	 * 	| 'AJAX_SUPPORT_JAVASCRIPT'
	 * 	| 'PREFERRED_MARKUP'
	 * 	| 'MAX_IMAGE_WIDTH'
	 * 	| 'MAX_IMAGE_HEIGHT'
	 * 	| 'VIEWPORT_INITIAL_SCALE'
	 * 	| 'FULL_FLASH_SUPPORT'
	 * 	| 'HTML_PREFERRED_DTD'
	 * 	| 'XHTML_PREFERRED_CHARSET'
	 * 	| 'VIEWPORT_WIDTH'
	 * 	| 'DUAL_ORIENTATION'
	 * 	| 'ACCEPT_THIRD_PARTY_COOKIE'
	 * 	| 'XHTMLMP_PREFERRED_MIME_TYPE'
	 * 	| 'GIF_ANIMATED'
	 * 	| 'JPG'
	 * 	| 'PNG'
	 * 	| 'XHTML_SUPPORTS_TABLE_FOR_LAYOUT'
	 * 	| 'AJAX_PREFERRED_GEOLOC_API'
	 * 	| 'XHTML_TABLE_SUPPORT'
	 * 	| 'XHTML_FILE_UPLOAD'
	 * 	| 'XHTML_SUPPORT_LEVEL'
	 * 	| 'XHTML_SUPPORTS_IFRAME'
	 * 	| 'FLASH_LITE_VERSION'
	 * 	| 'PDF_SUPPORT'
	 * )[]} params.elements
	 *   - Specifies the set of information about the requesting device to send to the origin server.
	 *
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/device-characterization-forward-in-header | Akamai Techdocs}
	 */
	setDeviceCharacteristicHeader(params: {
		/** Specifies the set of information about the requesting device to send to the origin server. */
		elements: Array<
			| 'BRAND_NAME'
			| 'MODEL_NAME'
			| 'MARKETING_NAME'
			| 'IS_MOBILE'
			| 'IS_WIRELESS_DEVICE'
			| 'IS_TABLET'
			| 'DEVICE_OS'
			| 'DEVICE_OS_VERSION'
			| 'MOBILE_BROWSER'
			| 'MOBILE_BROWSER_VERSION'
			| 'RESOLUTION_WIDTH'
			| 'RESOLUTION_HEIGHT'
			| 'PHYSICAL_SCREEN_HEIGHT'
			| 'PHYSICAL_SCREEN_WIDTH'
			| 'COOKIE_SUPPORT'
			| 'AJAX_SUPPORT_JAVASCRIPT'
			| 'PREFERRED_MARKUP'
			| 'MAX_IMAGE_WIDTH'
			| 'MAX_IMAGE_HEIGHT'
			| 'VIEWPORT_INITIAL_SCALE'
			| 'FULL_FLASH_SUPPORT'
			| 'HTML_PREFERRED_DTD'
			| 'XHTML_PREFERRED_CHARSET'
			| 'VIEWPORT_WIDTH'
			| 'DUAL_ORIENTATION'
			| 'ACCEPT_THIRD_PARTY_COOKIE'
			| 'XHTMLMP_PREFERRED_MIME_TYPE'
			| 'GIF_ANIMATED'
			| 'JPG'
			| 'PNG'
			| 'XHTML_SUPPORTS_TABLE_FOR_LAYOUT'
			| 'AJAX_PREFERRED_GEOLOC_API'
			| 'XHTML_TABLE_SUPPORT'
			| 'XHTML_FILE_UPLOAD'
			| 'XHTML_SUPPORT_LEVEL'
			| 'XHTML_SUPPORTS_IFRAME'
			| 'FLASH_LITE_VERSION'
			| 'PDF_SUPPORT'
		>;
	}): Property {
		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'deviceCharacteristicHeader', {}, params),
		);
	}

	/**
	 * This behavior implements customized Edge Load Balancing features. Contact Akamai Professional Services for help
	 * configuring it.
	 *
	 * @param {object} params - The parameters needed to configure setEdgeLoadBalancingAdvanced
	 * @param {string} [params.description] - A description of what the `xml` block does.
	 * @param {string} params.xml - A block of Akamai XML metadata.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/edge-load-balancing | Akamai Techdocs}
	 */
	setEdgeLoadBalancingAdvanced(params: {
		/** A description of what the `xml` block does. */
		description?: string;

		/** A block of Akamai XML metadata. */
		xml: string;
	}): Property {
		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'edgeLoadBalancingAdvanced', {}, params),
		);
	}

	/**
	 * The Edge Load Balancing module allows you to specify groups of data centers that implement load balancing,
	 * session persistence, and real-time dynamic failover. Enabling ELB routes requests contextually based on location,
	 * device, or network, along with optional rules you specify. This behavior specifies details about a data center,
	 * and needs to be paired in the same rule with an [`edgeLoadBalancingOrigin`](#) behavior, which specifies its
	 * origin. An _origin_ is an abstraction that helps group a logical set of a website or application. It potentially
	 * includes information about many data centers and cloud providers, as well as many end points or IP addresses for
	 * each data center. More than one data center can thus refer to the same origin.
	 *
	 * @param {object} params - The parameters needed to configure setEdgeLoadBalancingDataCenter
	 * @param {string} params.originId - Corresponds to the `id` specified by the [`edgeLoadBalancingOrigin`](#)
	 *   behavior associated with this data center.
	 * @param {string} params.description - Provides a description for the ELB data center, for your own reference.
	 * @param {string} params.hostname - Specifies the data center's hostname.
	 * @param {string} [params.cookieName] - If using session persistence, this specifies the value of the cookie named
	 *   in the corresponding [`edgeLoadBalancingOrigin`](#) behavior's `cookie_name` option.
	 * @param {boolean} [params.enableFailover] - Allows you to specify failover rules. Default: false.
	 * @param {string} [params.ip] - Specifies this data center's IP address.
	 * @param {object[]} [params.failoverRules] - Provides up to four failover rules to apply in the specified order.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/edge-load-balancing-data-center | Akamai Techdocs}
	 */
	setEdgeLoadBalancingDataCenter(params: {
		/**
		 * Corresponds to the `id` specified by the [`edgeLoadBalancingOrigin`](#) behavior associated with this data
		 * center.
		 */
		originId: string;

		/** Provides a description for the ELB data center, for your own reference. */
		description: string;

		/** Specifies the data center's hostname. */
		hostname: string;

		/**
		 * If using session persistence, this specifies the value of the cookie named in the corresponding
		 * [`edgeLoadBalancingOrigin`](#) behavior's `cookie_name` option.
		 */
		cookieName?: string;

		/** Allows you to specify failover rules. Default: false. */
		enableFailover?: boolean;

		/** Specifies this data center's IP address. */
		ip?: string;

		/** Provides up to four failover rules to apply in the specified order. */
		failoverRules?: Array<object>;
	}): Property {
		if (typeof params.enableFailover === 'undefined') {
			params.enableFailover = false;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'edgeLoadBalancingDataCenter', {}, params),
		);
	}

	/**
	 * The Edge Load Balancing module allows you to implement groups of data centers featuring load balancing, session
	 * persistence, and real-time dynamic failover. Enabling ELB routes requests contextually based on location, device,
	 * or network, along with optional rules you specify. This behavior specifies the data center's origin, and needs to
	 * be paired in the same rule with at least one [`edgeLoadBalancingDataCenter`](#) behavior, which provides details
	 * about a particular data center. An _origin_ is an abstraction that helps group a logical set of a website or
	 * application. It potentially includes information about many data centers and cloud providers, as well as many end
	 * points or IP addresses for each data center. To specify an ELB origin, you need to have configured an
	 * [`origin`](#) behavior whose `type` is set to `elb_origin_group`.
	 *
	 * @param {object} params - The parameters needed to configure setEdgeLoadBalancingOrigin
	 * @param {string} params.id - Specifies a unique descriptive string for this ELB origin. The value needs to match
	 *   the `origin_id` specified by the [`edgeLoadBalancingDataCenter`](#) behavior associated with this origin.
	 * @param {string} params.description - Provides a description for the ELB origin, for your own reference.
	 * @param {string} params.hostname - Specifies the hostname associated with the ELB rule.
	 * @param {boolean} [params.enableSessionPersistence] - Allows you to specify a cookie to pin the user's browser
	 *   session to one data center. When disabled, ELB's default load balancing may send users to various data centers
	 *   within the same session. Default: false.
	 * @param {string} [params.cookieName] - This specifies the name of the cookie that marks users' persistent
	 *   sessions. The accompanying [`edgeLoadBalancingDataCenter`](#) behavior's `description` option specifies the
	 *   cookie's value.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/edge-load-balancing-origin-definition | Akamai Techdocs}
	 */
	setEdgeLoadBalancingOrigin(params: {
		/**
		 * Specifies a unique descriptive string for this ELB origin. The value needs to match the `origin_id` specified
		 * by the [`edgeLoadBalancingDataCenter`](#) behavior associated with this origin.
		 */
		id: string;

		/** Provides a description for the ELB origin, for your own reference. */
		description: string;

		/** Specifies the hostname associated with the ELB rule. */
		hostname: string;

		/**
		 * Allows you to specify a cookie to pin the user's browser session to one data center. When disabled, ELB's
		 * default load balancing may send users to various data centers within the same session. Default: false.
		 */
		enableSessionPersistence?: boolean;

		/**
		 * This specifies the name of the cookie that marks users' persistent sessions. The accompanying
		 * [`edgeLoadBalancingDataCenter`](#) behavior's `description` option specifies the cookie's value.
		 */
		cookieName?: string;
	}): Property {
		if (typeof params.enableSessionPersistence === 'undefined') {
			params.enableSessionPersistence = false;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'edgeLoadBalancingOrigin', {}, params),
		);
	}

	/**
	 * Enhanced Proxy Detection (EPD) leverages the GeoGuard service provided by GeoComply to add proxy detection and
	 * location spoofing protection. It identifies requests for your content that have been redirected from an unwanted
	 * source through a proxy. You can then allow, deny, or redirect these requests. Include this behavior in the same
	 * rule as [`epdForwardHeaderEnrichment`](#). The `epdForwardHeaderEnrichment` behavior sends the Enhanced Proxy
	 * Detection (`Akamai-EPD`) header in the forward request to determine whether the connecting IP address is an
	 * anonymous proxy.
	 *
	 * @param {object} params - The parameters needed to configure setEnhancedProxyDetection
	 * @param {boolean} [params.enabled] - Applies GeoGuard proxy detection. Default: false.
	 * @param {boolean} [params.forwardHeaderEnrichment] - Whether the Enhanced Proxy Detection (Akamai-EPD) header is
	 *   included in the forward request to mark a connecting IP address as an anonymous proxy, with a two-letter
	 *   designation. See the [`epdForwardHeaderEnrichment`](#) behavior for details. Default: false.
	 * @param {'BEST_PRACTICE' | 'ADVANCED'} [params.enableConfigurationMode] - Specifies how to field the proxy
	 *   request. Default: "BEST_PRACTICE".
	 * @param {'ALLOW' | 'DENY' | 'REDIRECT'} [params.bestPracticeAction] - Specifies how to field the proxy request.
	 *   Default: "ALLOW".
	 * @param {string} [params.bestPracticeRedirecturl] - This specifies the URL to which to redirect requests. PM
	 *   variables may appear between '{{' and '}}'.
	 * @param {boolean} [params.detectAnonymousVpn] - This enables detection of requests from anonymous VPNs. Default:
	 *   true.
	 * @param {'ALLOW' | 'DENY' | 'REDIRECT'} [params.detectAnonymousVpnAction] - Specifies how to field anonymous VPN
	 *   requests. Default: "ALLOW".
	 * @param {string} [params.detectAnonymousVpnRedirecturl] - This specifies the URL to which to redirect anonymous
	 *   VPN requests. PM variables may appear between '{{' and '}}'.
	 * @param {boolean} [params.detectPublicProxy] - This enables detection of requests from public proxies. Default:
	 *   true.
	 * @param {'ALLOW' | 'DENY' | 'REDIRECT'} [params.detectPublicProxyAction] - Specifies how to field public proxy
	 *   requests. Default: "ALLOW".
	 * @param {string} [params.detectPublicProxyRedirecturl] - This specifies the URL to which to redirect public proxy
	 *   requests. PM variables may appear between '{{' and '}}'.
	 * @param {boolean} [params.detectTorExitNode] - This enables detection of requests from Tor exit nodes. Default:
	 *   true.
	 * @param {'ALLOW' | 'DENY' | 'REDIRECT'} [params.detectTorExitNodeAction] - This specifies whether to `DENY`,
	 *   `ALLOW`, or `REDIRECT` requests from Tor exit nodes. Default: "ALLOW".
	 * @param {string} [params.detectTorExitNodeRedirecturl] - This specifies the URL to which to redirect requests from
	 *   Tor exit nodes. PM variables may appear between '{{' and '}}'.
	 * @param {boolean} [params.detectSmartDNSProxy] - This enables detection of requests from smart DNS proxies.
	 *   Default: true.
	 * @param {'ALLOW' | 'DENY' | 'REDIRECT'} [params.detectSmartDNSProxyAction] - Specifies whether to `DENY`, `ALLOW`,
	 *   or `REDIRECT` smart DNS proxy requests. Default: "ALLOW".
	 * @param {string} [params.detectSmartDNSProxyRedirecturl] - This specifies the URL to which to redirect DNS proxy
	 *   requests. PM variables may appear between '{{' and '}}'.
	 * @param {boolean} [params.detectHostingProvider] - This detects requests from a hosting provider. Default: false.
	 * @param {'ALLOW' | 'DENY' | 'REDIRECT'} [params.detectHostingProviderAction] - This specifies whether to `DENY`,
	 *   `ALLOW`, or `REDIRECT` requests from hosting providers. Default: "ALLOW".
	 * @param {string} [params.detectHostingProviderRedirecturl] - This specifies the absolute URL to which to redirect
	 *   requests from hosting providers. PM variables may appear between '{{' and '}}'.
	 * @param {boolean} [params.detectVpnDataCenter] - This enables detection of requests from VPN data centers.
	 *   Default: false.
	 * @param {'ALLOW' | 'DENY' | 'REDIRECT'} [params.detectVpnDataCenterAction] - This specifies whether to `DENY`,
	 *   `ALLOW`, or `REDIRECT` requests from VPN data centers. Default: "ALLOW".
	 * @param {string} [params.detectVpnDataCenterRedirecturl] - This specifies the URL to which to redirect requests
	 *   from VPN data centers. PM variables may appear between '{{' and '}}'.
	 * @param {boolean} [params.detectResidentialProxy] - This enables detection of requests from a residential proxy.
	 *   See [Enhanced Proxy Detection with GeoGuard](doc:enhanced-proxy-detn-geoguard) and learn more about this
	 *   GeoGuard category before enabling it. Default: false.
	 * @param {'ALLOW' | 'DENY' | 'REDIRECT'} [params.detectResidentialProxyAction] - This specifies whether to `DENY`,
	 *   `ALLOW`, or `REDIRECT` requests from residential proxies. Default: "ALLOW".
	 * @param {string} [params.detectResidentialProxyRedirecturl] - This specifies the URL to which to redirect
	 *   requests. PM variables may appear between '{{' and '}}'.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/enhanced-proxy-detn-geoguard | Akamai Techdocs}
	 */
	setEnhancedProxyDetection(params: {
		/** Applies GeoGuard proxy detection. Default: false. */
		enabled?: boolean;

		/**
		 * Whether the Enhanced Proxy Detection (Akamai-EPD) header is included in the forward request to mark a
		 * connecting IP address as an anonymous proxy, with a two-letter designation. See the
		 * [`epdForwardHeaderEnrichment`](#) behavior for details. Default: false.
		 */
		forwardHeaderEnrichment?: boolean;

		/** Specifies how to field the proxy request. Default: "BEST_PRACTICE". */
		enableConfigurationMode?: 'BEST_PRACTICE' | 'ADVANCED';

		/** Specifies how to field the proxy request. Default: "ALLOW". */
		bestPracticeAction?: 'ALLOW' | 'DENY' | 'REDIRECT';

		/** This specifies the URL to which to redirect requests. PM variables may appear between '{{' and '}}'. */
		bestPracticeRedirecturl?: string;

		/** This enables detection of requests from anonymous VPNs. Default: true. */
		detectAnonymousVpn?: boolean;

		/** Specifies how to field anonymous VPN requests. Default: "ALLOW". */
		detectAnonymousVpnAction?: 'ALLOW' | 'DENY' | 'REDIRECT';

		/**
		 * This specifies the URL to which to redirect anonymous VPN requests. PM variables may appear between '{{' and
		 * '}}'.
		 */
		detectAnonymousVpnRedirecturl?: string;

		/** This enables detection of requests from public proxies. Default: true. */
		detectPublicProxy?: boolean;

		/** Specifies how to field public proxy requests. Default: "ALLOW". */
		detectPublicProxyAction?: 'ALLOW' | 'DENY' | 'REDIRECT';

		/**
		 * This specifies the URL to which to redirect public proxy requests. PM variables may appear between '{{' and
		 * '}}'.
		 */
		detectPublicProxyRedirecturl?: string;

		/** This enables detection of requests from Tor exit nodes. Default: true. */
		detectTorExitNode?: boolean;

		/** This specifies whether to `DENY`, `ALLOW`, or `REDIRECT` requests from Tor exit nodes. Default: "ALLOW". */
		detectTorExitNodeAction?: 'ALLOW' | 'DENY' | 'REDIRECT';

		/**
		 * This specifies the URL to which to redirect requests from Tor exit nodes. PM variables may appear between
		 * '{{' and '}}'.
		 */
		detectTorExitNodeRedirecturl?: string;

		/** This enables detection of requests from smart DNS proxies. Default: true. */
		detectSmartDNSProxy?: boolean;

		/** Specifies whether to `DENY`, `ALLOW`, or `REDIRECT` smart DNS proxy requests. Default: "ALLOW". */
		detectSmartDNSProxyAction?: 'ALLOW' | 'DENY' | 'REDIRECT';

		/**
		 * This specifies the URL to which to redirect DNS proxy requests. PM variables may appear between '{{' and
		 * '}}'.
		 */
		detectSmartDNSProxyRedirecturl?: string;

		/** This detects requests from a hosting provider. Default: false. */
		detectHostingProvider?: boolean;

		/** This specifies whether to `DENY`, `ALLOW`, or `REDIRECT` requests from hosting providers. Default: "ALLOW". */
		detectHostingProviderAction?: 'ALLOW' | 'DENY' | 'REDIRECT';

		/**
		 * This specifies the absolute URL to which to redirect requests from hosting providers. PM variables may appear
		 * between '{{' and '}}'.
		 */
		detectHostingProviderRedirecturl?: string;

		/** This enables detection of requests from VPN data centers. Default: false. */
		detectVpnDataCenter?: boolean;

		/** This specifies whether to `DENY`, `ALLOW`, or `REDIRECT` requests from VPN data centers. Default: "ALLOW". */
		detectVpnDataCenterAction?: 'ALLOW' | 'DENY' | 'REDIRECT';

		/**
		 * This specifies the URL to which to redirect requests from VPN data centers. PM variables may appear between
		 * '{{' and '}}'.
		 */
		detectVpnDataCenterRedirecturl?: string;

		/**
		 * This enables detection of requests from a residential proxy. See [Enhanced Proxy Detection with
		 * GeoGuard](doc:enhanced-proxy-detn-geoguard) and learn more about this GeoGuard category before enabling it.
		 * Default: false.
		 */
		detectResidentialProxy?: boolean;

		/** This specifies whether to `DENY`, `ALLOW`, or `REDIRECT` requests from residential proxies. Default: "ALLOW". */
		detectResidentialProxyAction?: 'ALLOW' | 'DENY' | 'REDIRECT';

		/** This specifies the URL to which to redirect requests. PM variables may appear between '{{' and '}}'. */
		detectResidentialProxyRedirecturl?: string;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = false;
		}

		if (typeof params.forwardHeaderEnrichment === 'undefined' && (params.enabled as unknown) === true) {
			params.forwardHeaderEnrichment = false;
		}

		if (typeof params.enableConfigurationMode === 'undefined' && (params.enabled as unknown) === true) {
			params.enableConfigurationMode = 'BEST_PRACTICE';
		}

		if (
			typeof params.bestPracticeAction === 'undefined' &&
			(params.enableConfigurationMode as unknown) === 'BEST_PRACTICE'
		) {
			params.bestPracticeAction = 'ALLOW';
		}

		if (
			typeof params.detectAnonymousVpn === 'undefined' &&
			(params.enableConfigurationMode as unknown) === 'ADVANCED'
		) {
			params.detectAnonymousVpn = true;
		}

		if (typeof params.detectAnonymousVpnAction === 'undefined' && (params.detectAnonymousVpn as unknown) === true) {
			params.detectAnonymousVpnAction = 'ALLOW';
		}

		if (
			typeof params.detectPublicProxy === 'undefined' &&
			(params.enableConfigurationMode as unknown) === 'ADVANCED'
		) {
			params.detectPublicProxy = true;
		}

		if (typeof params.detectPublicProxyAction === 'undefined' && (params.detectPublicProxy as unknown) === true) {
			params.detectPublicProxyAction = 'ALLOW';
		}

		if (
			typeof params.detectTorExitNode === 'undefined' &&
			(params.enableConfigurationMode as unknown) === 'ADVANCED'
		) {
			params.detectTorExitNode = true;
		}

		if (typeof params.detectTorExitNodeAction === 'undefined' && (params.detectTorExitNode as unknown) === true) {
			params.detectTorExitNodeAction = 'ALLOW';
		}

		if (
			typeof params.detectSmartDNSProxy === 'undefined' &&
			(params.enableConfigurationMode as unknown) === 'ADVANCED'
		) {
			params.detectSmartDNSProxy = true;
		}

		if (
			typeof params.detectSmartDNSProxyAction === 'undefined' &&
			(params.detectSmartDNSProxy as unknown) === true
		) {
			params.detectSmartDNSProxyAction = 'ALLOW';
		}

		if (
			typeof params.detectHostingProvider === 'undefined' &&
			(params.enableConfigurationMode as unknown) === 'ADVANCED'
		) {
			params.detectHostingProvider = false;
		}

		if (
			typeof params.detectHostingProviderAction === 'undefined' &&
			(params.detectHostingProvider as unknown) === true
		) {
			params.detectHostingProviderAction = 'ALLOW';
		}

		if (
			typeof params.detectVpnDataCenter === 'undefined' &&
			(params.enableConfigurationMode as unknown) === 'ADVANCED'
		) {
			params.detectVpnDataCenter = false;
		}

		if (
			typeof params.detectVpnDataCenterAction === 'undefined' &&
			(params.detectVpnDataCenter as unknown) === true
		) {
			params.detectVpnDataCenterAction = 'ALLOW';
		}

		if (
			typeof params.detectResidentialProxy === 'undefined' &&
			(params.enableConfigurationMode as unknown) === 'ADVANCED'
		) {
			params.detectResidentialProxy = false;
		}

		if (
			typeof params.detectResidentialProxyAction === 'undefined' &&
			(params.detectResidentialProxy as unknown) === true
		) {
			params.detectResidentialProxyAction = 'ALLOW';
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'BEHAVIOR',
				'enhancedProxyDetection',
				{
					allowsVars: [
						'bestPracticeRedirecturl',
						'detectAnonymousVpnRedirecturl',
						'detectPublicProxyRedirecturl',
						'detectTorExitNodeRedirecturl',
						'detectSmartDNSProxyRedirecturl',
						'detectHostingProviderRedirecturl',
						'detectVpnDataCenterRedirecturl',
						'detectResidentialProxyRedirecturl',
					],
				},
				params,
			),
		);
	}

	/**
	 * This behavior identifies unwanted requests from an anonymous proxy. This and the [`enhancedProxyDetection`](#)
	 * behavior work together and need to be included either in the same rule, or in the default one.
	 *
	 * @param {object} params - The parameters needed to configure setEpdForwardHeaderEnrichment
	 * @param {boolean} [params.enabled] - Sends the Enhanced Proxy Detection (`Akamai-EPD`) header in the forward
	 *   request to determine whether the connecting IP address is an anonymous proxy. The header can contain one or
	 *   more two-letter codes that indicate the IP address type detected by edge servers: - `av` for
	 *   `is_anonymous_vpn`
	 *
	 *   - `hp` for `is_hosting_provider` - `pp` for `is_public_proxy` - `dp` for `is_smart_dns_proxy` - `tn` for
	 *       `is_tor_exit_node` - `vc` for `is_vpn_datacentre` - `rp` for `is_residential_proxy` Default: false.
	 *
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/forward-header-enrichment | Akamai Techdocs}
	 */
	setEpdForwardHeaderEnrichment(params: {
		/**
		 * Sends the Enhanced Proxy Detection (`Akamai-EPD`) header in the forward request to determine whether the
		 * connecting IP address is an anonymous proxy. The header can contain one or more two-letter codes that
		 * indicate the IP address type detected by edge servers: - `av` for `is_anonymous_vpn` - `hp` for
		 * `is_hosting_provider` - `pp` for `is_public_proxy` - `dp` for `is_smart_dns_proxy` - `tn` for
		 * `is_tor_exit_node` - `vc` for `is_vpn_datacentre` - `rp` for `is_residential_proxy` Default: false.
		 */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = false;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'epdForwardHeaderEnrichment', {}, params),
		);
	}

	/**
	 * Enables the Enhanced Akamai Protocol, a suite of advanced routing and transport optimizations that increase your
	 * website's performance and reliability. It is only available to specific applications, and requires a special
	 * routing from edge to origin. > **Warning**. Disabling this behavior may significantly reduce a property's
	 * performance.
	 *
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/enhanced-akamai-protocol | Akamai Techdocs}
	 */
	setEnhancedAkamaiProtocol(): Property {
		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'enhancedAkamaiProtocol', {}, {}));
	}

	/**
	 * This behavior is deprecated, but you should not disable or remove it if present. Applies Akamai's _Fast Purge_
	 * feature to selected edge content, invalidating it within approximately five seconds. This behavior sends an
	 * `If-Modified-Since` request to the origin for subsequent requests, replacing it with origin content if its
	 * timestamp is more recent. Otherwise if the origin lacks a `Last-Modified` header, it sends a simple GET request.
	 * Note that this behavior does not simply delete content if more recent origin content is unavailable. See the
	 * [Fast Purge API](https://techdocs.akamai.com/purge-cache/reference) for an independent way to invalidate selected
	 * sets of content, and for more information on the feature.
	 *
	 * @param {object} params - The parameters needed to configure setFastInvalidate
	 * @param {boolean} [params.enabled] - When enabled, forces a validation test for all edge content to which the
	 *   behavior applies. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/fast-inval | Akamai Techdocs}
	 */
	setFastInvalidate(params: {
		/** When enabled, forces a validation test for all edge content to which the behavior applies. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'fastInvalidate', {}, params));
	}

	/**
	 * Enables the Cloud Marketing Cloudlet, which helps MediaMath customers collect usage data and place corresponding
	 * tags for use in online advertising. You can configure tags using either the Cloudlets Policy Manager application
	 * or the [Cloudlets API](https://techdocs.akamai.com/cloudlets/reference). See also the
	 * [`firstPartyMarketingPlus`](#) behavior, which integrates better with both MediaMath and its partners. Both
	 * behaviors support the same set of options.
	 *
	 * @param {object} params - The parameters needed to configure setFirstPartyMarketing
	 * @param {boolean} [params.enabled] - Enables the Cloud Marketing Cloudlet. Default: true.
	 * @param {'NEVER' | 'POLICY' | 'ALWAYS'} [params.javaScriptInsertionRule] - Select how to insert the MediaMath
	 *   JavaScript reference script. Default: "ALWAYS".
	 * @param {any} [params.cloudletPolicy] - Identifies the Cloudlet policy.
	 * @param {string} [params.mediaMathPrefix] - Specify the URL path prefix that distinguishes Cloud Marketing
	 *   requests from your other web traffic. Include the leading slash character, but no trailing slash. For example,
	 *   if the path prefix is `/mmath`, and the request is for `www.example.com/dir`, the new URL is
	 *   `www.example.com/mmath/dir`. Default: "/dcpp".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/cloud-marketing-cloudlet | Akamai Techdocs}
	 */
	setFirstPartyMarketing(params: {
		/** Enables the Cloud Marketing Cloudlet. Default: true. */
		enabled?: boolean;

		/** Select how to insert the MediaMath JavaScript reference script. Default: "ALWAYS". */
		javaScriptInsertionRule?: 'NEVER' | 'POLICY' | 'ALWAYS';

		/** Identifies the Cloudlet policy. */
		cloudletPolicy?: any;

		/**
		 * Specify the URL path prefix that distinguishes Cloud Marketing requests from your other web traffic. Include
		 * the leading slash character, but no trailing slash. For example, if the path prefix is `/mmath`, and the
		 * request is for `www.example.com/dir`, the new URL is `www.example.com/mmath/dir`. Default: "/dcpp".
		 */
		mediaMathPrefix?: string;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.javaScriptInsertionRule === 'undefined' && (params.enabled as unknown) === true) {
			params.javaScriptInsertionRule = 'ALWAYS';
		}

		if (typeof params.mediaMathPrefix === 'undefined' && (params.enabled as unknown) === true) {
			params.mediaMathPrefix = '/dcpp';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'firstPartyMarketing', {}, params));
	}

	/**
	 * Enables the Cloud Marketing Plus Cloudlet, which helps MediaMath customers collect usage data and place
	 * corresponding tags for use in online advertising. You can configure tags using either the Cloudlets Policy
	 * Manager application or the [Cloudlets API](https://techdocs.akamai.com/cloudlets/reference). See also the
	 * [`firstPartyMarketing`](#) behavior, which integrates with MediaMath but not its partners. Both behaviors support
	 * the same set of options.
	 *
	 * @param {object} params - The parameters needed to configure setFirstPartyMarketingPlus
	 * @param {boolean} [params.enabled] - Enables the Cloud Marketing Plus Cloudlet. Default: true.
	 * @param {'NEVER' | 'POLICY' | 'ALWAYS'} [params.javaScriptInsertionRule] - Select how to insert the MediaMath
	 *   JavaScript reference script. Default: "ALWAYS".
	 * @param {any} [params.cloudletPolicy] - Identifies the Cloudlet policy.
	 * @param {string} [params.mediaMathPrefix] - Specify the URL path prefix that distinguishes Cloud Marketing
	 *   requests from your other web traffic. Include the leading slash character, but no trailing slash. For example,
	 *   if the path prefix is `/mmath`, and the request is for `www.example.com/dir`, the new URL is
	 *   `www.example.com/mmath/dir`. Default: "/dcpp".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/cloud-marketing-plus-cloudlet | Akamai Techdocs}
	 */
	setFirstPartyMarketingPlus(params: {
		/** Enables the Cloud Marketing Plus Cloudlet. Default: true. */
		enabled?: boolean;

		/** Select how to insert the MediaMath JavaScript reference script. Default: "ALWAYS". */
		javaScriptInsertionRule?: 'NEVER' | 'POLICY' | 'ALWAYS';

		/** Identifies the Cloudlet policy. */
		cloudletPolicy?: any;

		/**
		 * Specify the URL path prefix that distinguishes Cloud Marketing requests from your other web traffic. Include
		 * the leading slash character, but no trailing slash. For example, if the path prefix is `/mmath`, and the
		 * request is for `www.example.com/dir`, the new URL is `www.example.com/mmath/dir`. Default: "/dcpp".
		 */
		mediaMathPrefix?: string;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.javaScriptInsertionRule === 'undefined' && (params.enabled as unknown) === true) {
			params.javaScriptInsertionRule = 'ALWAYS';
		}

		if (typeof params.mediaMathPrefix === 'undefined' && (params.enabled as unknown) === true) {
			params.mediaMathPrefix = '/dcpp';
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'firstPartyMarketingPlus', {}, params),
		);
	}

	/**
	 * The Forward Rewrite Cloudlet allows you to conditionally modify the forward path in edge content without
	 * affecting the URL that displays in the user's address bar. If Cloudlets are available on your contract, choose
	 * **Your services** > **Edge logic Cloudlets** to control how this feature works within [Control
	 * Center](https://control.akamai.com), or use the [Cloudlets API](https://techdocs.akamai.com/cloudlets/reference)
	 * to configure it programmatically.
	 *
	 * @param {object} params - The parameters needed to configure setForwardRewrite
	 * @param {boolean} [params.enabled] - Enables the Forward Rewrite Cloudlet behavior. Default: true.
	 * @param {boolean} [params.isSharedPolicy] - Whether you want to use a shared policy for a Cloudlet. Learn more
	 *   about shared policies and how to create them in [Cloudlets Policy
	 *   Manager](https://techdocs.akamai.com/cloudlets). Default: false.
	 * @param {any} [params.cloudletPolicy] - Identifies the Cloudlet policy.
	 * @param {number} [params.cloudletSharedPolicy] - This identifies the Cloudlet shared policy to use with this
	 *   behavior. You can list available shared policies with the [Cloudlets
	 *   API](https://techdocs.akamai.com/cloudlets/reference).
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/forward-rewrite-cloudlet | Akamai Techdocs}
	 */
	setForwardRewrite(params: {
		/** Enables the Forward Rewrite Cloudlet behavior. Default: true. */
		enabled?: boolean;

		/**
		 * Whether you want to use a shared policy for a Cloudlet. Learn more about shared policies and how to create
		 * them in [Cloudlets Policy Manager](https://techdocs.akamai.com/cloudlets). Default: false.
		 */
		isSharedPolicy?: boolean;

		/** Identifies the Cloudlet policy. */
		cloudletPolicy?: any;

		/**
		 * This identifies the Cloudlet shared policy to use with this behavior. You can list available shared policies
		 * with the [Cloudlets API](https://techdocs.akamai.com/cloudlets/reference).
		 */
		cloudletSharedPolicy?: number;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.isSharedPolicy === 'undefined' && (params.enabled as unknown) === true) {
			params.isSharedPolicy = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'forwardRewrite', {}, params));
	}

	/**
	 * This behavior configures how to cache GraphQL-based API traffic. Enable [`caching`](#) for your GraphQL API
	 * traffic, along with [`allowPost`](#) to cache POST responses. To configure REST API traffic, use the [`rapid`](#)
	 * behavior.
	 *
	 * @param {object} params - The parameters needed to configure setGraphqlCaching
	 * @param {boolean} [params.enabled] - Enables GraphQL caching. Default: true.
	 * @param {boolean} [params.cacheResponsesWithErrors] - When enabled, caches responses that include an `error` field
	 *   at the top of the response body object. Disable this if your GraphQL server yields temporary errors with
	 *   success codes in the 2xx range. Default: false.
	 * @param {'APPLY_CACHING_BEHAVIOR' | 'NO_STORE'} [params.postRequestProcessingErrorHandling] - Specify what happens
	 *   if GraphQL query processing fails on POST requests. Default: "NO_STORE".
	 * @param {string} [params.operationsUrlQueryParameterName] - Specifies the name of a query parameter that
	 *   identifies requests as GraphQL queries. Default: "query".
	 * @param {string} [params.operationsJsonBodyParameterName] - The name of the JSON body parameter that identifies
	 *   GraphQL POST requests. Default: "query".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/graphql-caching | Akamai Techdocs}
	 */
	setGraphqlCaching(params: {
		/** Enables GraphQL caching. Default: true. */
		enabled?: boolean;

		/**
		 * When enabled, caches responses that include an `error` field at the top of the response body object. Disable
		 * this if your GraphQL server yields temporary errors with success codes in the 2xx range. Default: false.
		 */
		cacheResponsesWithErrors?: boolean;

		/** Specify what happens if GraphQL query processing fails on POST requests. Default: "NO_STORE". */
		postRequestProcessingErrorHandling?: 'APPLY_CACHING_BEHAVIOR' | 'NO_STORE';

		/** Specifies the name of a query parameter that identifies requests as GraphQL queries. Default: "query". */
		operationsUrlQueryParameterName?: string;

		/** The name of the JSON body parameter that identifies GraphQL POST requests. Default: "query". */
		operationsJsonBodyParameterName?: string;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.cacheResponsesWithErrors === 'undefined' && (params.enabled as unknown) === true) {
			params.cacheResponsesWithErrors = false;
		}

		if (typeof params.postRequestProcessingErrorHandling === 'undefined' && (params.enabled as unknown) === true) {
			params.postRequestProcessingErrorHandling = 'NO_STORE';
		}

		if (typeof params.operationsUrlQueryParameterName === 'undefined' && (params.enabled as unknown) === true) {
			params.operationsUrlQueryParameterName = 'query';
		}

		if (typeof params.operationsJsonBodyParameterName === 'undefined' && (params.enabled as unknown) === true) {
			params.operationsJsonBodyParameterName = 'query';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'graphqlCaching', {}, params));
	}

	/**
	 * Controls whether to allow or deny Chunked Transfer Encoding (CTE) requests to pass to your origin. If your origin
	 * supports CTE, you should enable this behavior. This behavior also protects against a known issue when pairing
	 * [`http2`](#) and [`webdav`](#) behaviors within the same rule tree, in which case it's required.
	 *
	 * @param {object} params - The parameters needed to configure setAllowTransferEncoding
	 * @param {boolean} [params.enabled] - Allows Chunked Transfer Encoding requests. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/chunked-transfer-encoding | Akamai Techdocs}
	 */
	setAllowTransferEncoding(params: {
		/** Allows Chunked Transfer Encoding requests. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'allowTransferEncoding', {}, params),
		);
	}

	/**
	 * Enables the HTTP/2 protocol, which reduces latency and improves efficiency. You can only apply this behavior if
	 * the property is marked as secure. See [Secure property requirements](ref:the-default-rule) for guidance.
	 *
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/http2-support | Akamai Techdocs}
	 */
	setHttp2(): Property {
		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'http2', {}, {}));
	}

	/**
	 * Allows IBM Tealeaf Customer Experience on Cloud to record HTTPS requests and responses for Akamai-enabled
	 * properties. Recorded data becomes available in your IBM Tealeaf account.
	 *
	 * @param {object} params - The parameters needed to configure setTeaLeaf
	 * @param {boolean} [params.enabled] - When enabled, capture HTTPS requests and responses, and send the data to your
	 *   IBM Tealeaf account. Default: true.
	 * @param {boolean} [params.limitToDynamic] - Limit traffic to dynamic, uncached (`No-Store`) content. Default:
	 *   true.
	 * @param {number} [params.ibmCustomerId] - The integer identifier for the IBM Tealeaf Connector account.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/ibm-tealeaf-conn | Akamai Techdocs}
	 */
	setTeaLeaf(params: {
		/**
		 * When enabled, capture HTTPS requests and responses, and send the data to your IBM Tealeaf account. Default:
		 * true.
		 */
		enabled?: boolean;

		/** Limit traffic to dynamic, uncached (`No-Store`) content. Default: true. */
		limitToDynamic?: boolean;

		/** The integer identifier for the IBM Tealeaf Connector account. */
		ibmCustomerId?: number;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.limitToDynamic === 'undefined' && (params.enabled as unknown) === true) {
			params.limitToDynamic = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'teaLeaf', {}, params));
	}

	/**
	 * This specifies common query parameters that affect how [`imageManager`](#) transforms images, potentially
	 * overriding policy, width, format, or density request parameters. This also allows you to assign the value of one
	 * of the property's [rule tree variables](ref:variables) to one of Image and Video Manager's own policy variables.
	 *
	 * @param {object} params - The parameters needed to configure setImOverride
	 * @param {'POLICY' | 'POLICY_VARIABLE' | 'WIDTH' | 'FORMAT' | 'DPR' | 'EXCLUDE_QUERY'} [params.override] - Selects
	 *   the type of query parameter you want to set. Default: "POLICY".
	 * @param {'VALUE' | 'VARIABLE'} [params.typesel] - Specifies how to set a query parameter. Default: "VALUE".
	 * @param {string} [params.formatvar] - This selects the variable with the name of the browser you want to optimize
	 *   images for. The variable specifies the same type of data as the `format` option below.
	 * @param {'CHROME'
	 * 	| 'IE'
	 * 	| 'SAFARI'
	 * 	| 'GENERIC'
	 * 	| 'AVIF_WEBP_JPEG_PNG_GIF'
	 * 	| 'JP2_WEBP_JPEG_PNG_GIF'
	 * 	| 'WEBP_JPEG_PNG_GIF'
	 * 	| 'JPEG_PNG_GIF'} [params.format]
	 *   - Specifies the type of the browser, or the encodings passed in the `Accept` header, that you want to optimize
	 *       images for. Default: "CHROME".
	 *
	 * @param {string} [params.dprvar] - This selects the variable with the desired pixel density. The variable
	 *   specifies the same type of data as the `dpr` option below.
	 * @param {number} [params.dpr] - Directly specifies the pixel density. The numeric value is a scaling factor of 1,
	 *   representing normal density.
	 * @param {string} [params.widthvar] - Selects the variable with the desired width. If the Image and Video Manager
	 *   policy doesn't define that width, it serves the next largest width.
	 * @param {number} [params.width] - Sets the image's desired pixel width directly. If the Image Manager policy
	 *   doesn't define that width, it serves the next largest width.
	 * @param {string} [params.policyvar] - This selects the variable with the desired Image and Video Manager policy
	 *   name to apply to image requests. If there is no policy by that name, Image and Video Manager serves the image
	 *   unmodified.
	 * @param {string} [params.policy] - This selects the desired Image and Video Manager policy name directly. If there
	 *   is no policy by that name, Image and Video Manager serves the image unmodified.
	 * @param {string} [params.policyvarName] - This selects the name of one of the variables defined in an Image and
	 *   Video Manager policy that you want to replace with the property's rule tree variable.
	 * @param {string} [params.policyvarIMvar] - This selects one of the property's rule tree variables to assign to the
	 *   `policyvarName` variable within Image and Video Manager.
	 * @param {boolean} [params.excludeAllQueryParameters] - Whether to exclude all query parameters from the Image and
	 *   Video Manager cache key. Default: false.
	 * @param {string[]} [params.excludedQueryParameters] - Specifies individual query parameters to exclude from the
	 *   Image and Video Manager cache key.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/img-video-manager-set-param | Akamai Techdocs}
	 */
	setImOverride(params: {
		/** Selects the type of query parameter you want to set. Default: "POLICY". */
		override?: 'POLICY' | 'POLICY_VARIABLE' | 'WIDTH' | 'FORMAT' | 'DPR' | 'EXCLUDE_QUERY';

		/** Specifies how to set a query parameter. Default: "VALUE". */
		typesel?: 'VALUE' | 'VARIABLE';

		/**
		 * This selects the variable with the name of the browser you want to optimize images for. The variable
		 * specifies the same type of data as the `format` option below.
		 */
		formatvar?: string;

		/**
		 * Specifies the type of the browser, or the encodings passed in the `Accept` header, that you want to optimize
		 * images for. Default: "CHROME".
		 */
		format?:
			| 'CHROME'
			| 'IE'
			| 'SAFARI'
			| 'GENERIC'
			| 'AVIF_WEBP_JPEG_PNG_GIF'
			| 'JP2_WEBP_JPEG_PNG_GIF'
			| 'WEBP_JPEG_PNG_GIF'
			| 'JPEG_PNG_GIF';

		/**
		 * This selects the variable with the desired pixel density. The variable specifies the same type of data as the
		 * `dpr` option below.
		 */
		dprvar?: string;

		/**
		 * Directly specifies the pixel density. The numeric value is a scaling factor of 1, representing normal
		 * density.
		 */
		dpr?: number;

		/**
		 * Selects the variable with the desired width. If the Image and Video Manager policy doesn't define that width,
		 * it serves the next largest width.
		 */
		widthvar?: string;

		/**
		 * Sets the image's desired pixel width directly. If the Image Manager policy doesn't define that width, it
		 * serves the next largest width.
		 */
		width?: number;

		/**
		 * This selects the variable with the desired Image and Video Manager policy name to apply to image requests. If
		 * there is no policy by that name, Image and Video Manager serves the image unmodified.
		 */
		policyvar?: string;

		/**
		 * This selects the desired Image and Video Manager policy name directly. If there is no policy by that name,
		 * Image and Video Manager serves the image unmodified.
		 */
		policy?: string;

		/**
		 * This selects the name of one of the variables defined in an Image and Video Manager policy that you want to
		 * replace with the property's rule tree variable.
		 */
		policyvarName?: string;

		/**
		 * This selects one of the property's rule tree variables to assign to the `policyvarName` variable within Image
		 * and Video Manager.
		 */
		policyvarIMvar?: string;

		/** Whether to exclude all query parameters from the Image and Video Manager cache key. Default: false. */
		excludeAllQueryParameters?: boolean;

		/** Specifies individual query parameters to exclude from the Image and Video Manager cache key. */
		excludedQueryParameters?: string[];
	}): Property {
		if (typeof params.override === 'undefined') {
			params.override = 'POLICY';
		}

		if (
			typeof params.typesel === 'undefined' &&
			(params.override as unknown) !== 'POLICY_VARIABLE' &&
			(params.override as unknown) !== 'EXCLUDE_QUERY'
		) {
			params.typesel = 'VALUE';
		}

		if (
			typeof params.format === 'undefined' &&
			(params.override as unknown) === 'FORMAT' &&
			(params.typesel as unknown) === 'VALUE'
		) {
			params.format = 'CHROME';
		}

		if (
			typeof params.excludeAllQueryParameters === 'undefined' &&
			(params.override as unknown) === 'EXCLUDE_QUERY'
		) {
			params.excludeAllQueryParameters = false;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'BEHAVIOR',
				'imOverride',
				{variable: ['formatvar', 'dprvar', 'widthvar', 'policyvar', 'policyvarIMvar']},
				params,
			),
		);
	}

	/**
	 * Optimizes videos managed by Image and Video Manager for the requesting device. You can also use this behavior to
	 * generate API tokens to apply your own policies to matching videos using the [Image and Video Manager
	 * API](https://techdocs.akamai.com/ivm/reference). To apply this behavior, you need to match on a
	 * [`fileExtension`](#).
	 *
	 * @param {object} params - The parameters needed to configure setImageManagerVideo
	 * @param {boolean} [params.enabled] - Applies Image and Video Manager's video optimization to the current content.
	 *   Default: true.
	 * @param {boolean} [params.resize] - When enabled, scales down video for smaller mobile screens, based on the
	 *   device's `User-Agent` header. Default: false.
	 * @param {boolean} [params.applyBestFileType] - When enabled, automatically converts videos to the best file type
	 *   for the requesting device. This produces the smallest file size that retains image quality, based on the user
	 *   agent and the initial image file. Default: true.
	 * @param {'US' | 'ASIA' | 'AUSTRALIA' | 'EMEA' | 'JAPAN' | 'CHINA'} [params.superCacheRegion] - To optimize
	 *   caching, assign a region close to your site's heaviest traffic. Default: "US".
	 * @param {any} params.cpCodeOriginal - Specifies the CP code for which to track Image and Video Manager video
	 *   traffic. Use this along with `cpCodeTransformed` to track traffic to derivative video content. You only need to
	 *   provide the initial `id`, stripping any [`cpc_` prefix](ref:id-prefixes) to pass the integer to the rule tree.
	 *   Additional CP code details may reflect back in subsequent read-only data.
	 * @param {any} params.cpCodeTransformed - Specifies the CP code to identify derivative transformed video content.
	 *   You only need to provide the initial `id`, stripping any [`cpc_` prefix](ref:id-prefixes) to pass the integer
	 *   to the rule tree. Additional CP code details may reflect back in subsequent read-only data.
	 * @param {boolean} [params.useExistingPolicySet] - Whether to use a previously created policy set that may be
	 *   referenced in other properties, or create a new policy set to use with this property. A policy set can be
	 *   shared across multiple properties belonging to the same contract. The behavior populates any changes to the
	 *   policy set across all properties that reference that set. Default: false.
	 * @param {any} [params.policySet] - Identifies the existing policy set configured with [Image and Video Manager
	 *   API](https://techdocs.akamai.com/ivm/reference).
	 * @param {boolean} [params.advanced] - When disabled, applies a single standard policy based on your property name.
	 *   Allows you to reference a rule-specific `policyToken` for videos with different match criteria. Default:
	 *   false.
	 * @param {any} [params.policyToken] - Specifies a custom policy defined in the Image and Video Manager Policy
	 *   Manager or the [Image and Video Manager API](https://techdocs.akamai.com/ivm/reference). The policy name can
	 *   include up to 64 alphanumeric, dash, or underscore characters. Default: "freshVideo".
	 * @param {any} [params.policyTokenDefault] - Specifies the default policy identifier, which is registered with the
	 *   [Image and Video Manager API](https://techdocs.akamai.com/ivm/reference) once you activate this property.
	 *   Default: "freshVideo".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/img-video-manager-videos | Akamai Techdocs}
	 */
	setImageManagerVideo(params: {
		/** Applies Image and Video Manager's video optimization to the current content. Default: true. */
		enabled?: boolean;

		/**
		 * When enabled, scales down video for smaller mobile screens, based on the device's `User-Agent` header.
		 * Default: false.
		 */
		resize?: boolean;

		/**
		 * When enabled, automatically converts videos to the best file type for the requesting device. This produces
		 * the smallest file size that retains image quality, based on the user agent and the initial image file.
		 * Default: true.
		 */
		applyBestFileType?: boolean;

		/** To optimize caching, assign a region close to your site's heaviest traffic. Default: "US". */
		superCacheRegion?: 'US' | 'ASIA' | 'AUSTRALIA' | 'EMEA' | 'JAPAN' | 'CHINA';

		/**
		 * Specifies the CP code for which to track Image and Video Manager video traffic. Use this along with
		 * `cpCodeTransformed` to track traffic to derivative video content. You only need to provide the initial `id`,
		 * stripping any [`cpc_` prefix](ref:id-prefixes) to pass the integer to the rule tree. Additional CP code
		 * details may reflect back in subsequent read-only data.
		 */
		cpCodeOriginal: any;

		/**
		 * Specifies the CP code to identify derivative transformed video content. You only need to provide the initial
		 * `id`, stripping any [`cpc_` prefix](ref:id-prefixes) to pass the integer to the rule tree. Additional CP code
		 * details may reflect back in subsequent read-only data.
		 */
		cpCodeTransformed: any;

		/**
		 * Whether to use a previously created policy set that may be referenced in other properties, or create a new
		 * policy set to use with this property. A policy set can be shared across multiple properties belonging to the
		 * same contract. The behavior populates any changes to the policy set across all properties that reference that
		 * set. Default: false.
		 */
		useExistingPolicySet?: boolean;

		/**
		 * Identifies the existing policy set configured with [Image and Video Manager
		 * API](https://techdocs.akamai.com/ivm/reference).
		 */
		policySet?: any;

		/**
		 * When disabled, applies a single standard policy based on your property name. Allows you to reference a
		 * rule-specific `policyToken` for videos with different match criteria. Default: false.
		 */
		advanced?: boolean;

		/**
		 * Specifies a custom policy defined in the Image and Video Manager Policy Manager or the [Image and Video
		 * Manager API](https://techdocs.akamai.com/ivm/reference). The policy name can include up to 64 alphanumeric,
		 * dash, or underscore characters. Default: "freshVideo".
		 */
		policyToken?: any;

		/**
		 * Specifies the default policy identifier, which is registered with the [Image and Video Manager
		 * API](https://techdocs.akamai.com/ivm/reference) once you activate this property. Default: "freshVideo".
		 */
		policyTokenDefault?: any;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.resize === 'undefined' && (params.enabled as unknown) === true) {
			params.resize = false;
		}

		if (typeof params.applyBestFileType === 'undefined' && (params.enabled as unknown) === true) {
			params.applyBestFileType = true;
		}

		if (typeof params.useExistingPolicySet === 'undefined') {
			params.useExistingPolicySet = false;
		}

		if (typeof params.superCacheRegion === 'undefined' && (params.useExistingPolicySet as unknown) !== true) {
			params.superCacheRegion = 'US';
		}

		if (typeof params.advanced === 'undefined' && (params.useExistingPolicySet as unknown) === false) {
			params.advanced = false;
		}

		if (typeof params.policyToken === 'undefined' && (params.advanced as unknown) === true) {
			params.policyToken = 'freshVideo';
		}

		if (typeof params.policyTokenDefault === 'undefined' && (params.advanced as unknown) === false) {
			params.policyTokenDefault = 'freshVideo';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'imageManagerVideo', {}, params));
	}

	/**
	 * Optimizes images' size or file type for the requesting device. You can also use this behavior to generate API
	 * tokens to apply your own policies to matching images using the [Image and Video Manager
	 * API](https://techdocs.akamai.com/ivm/reference). To apply this behavior, you need to match on a
	 * [`fileExtension`](#). Once you apply Image and Video Manager to traffic, you can add the [`advancedImMatch`](#)
	 * to ensure the behavior applies to the requests from the Image and Video Manager backend.
	 *
	 * @param {object} params - The parameters needed to configure setImageManager
	 * @param {boolean} [params.enabled] - Enable image management capabilities and generate a corresponding API token.
	 *   Default: true.
	 * @param {boolean} [params.resize] - Specify whether to scale down images to the maximum screen resolution, as
	 *   determined by the rendering device's user agent. Note that enabling this may affect screen layout in unexpected
	 *   ways. Default: false.
	 * @param {boolean} [params.applyBestFileType] - Specify whether to convert images to the best file type for the
	 *   requesting device, based on its user agent and the initial image file. This produces the smallest file size
	 *   possible that retains image quality. Default: true.
	 * @param {'US' | 'ASIA' | 'AUSTRALIA' | 'EMEA' | 'JAPAN' | 'CHINA'} [params.superCacheRegion] - Specifies a
	 *   location for your site's heaviest traffic, for use in caching derivatives on edge servers. Default: "US".
	 * @param {any} params.cpCodeOriginal - Assigns a CP code to track traffic and billing for original images that the
	 *   Image and Video Manager has not modified. You only need to provide the initial `id`, stripping any [`cpc_`
	 *   prefix](ref:id-prefixes) to pass the integer to the rule tree. Additional CP code details may reflect back in
	 *   subsequent read-only data.
	 * @param {any} params.cpCodeTransformed - Assigns a separate CP code to track traffic and billing for derived
	 *   images. You only need to provide the initial `id`, stripping any [`cpc_` prefix](ref:id-prefixes) to pass the
	 *   integer to the rule tree. Additional CP code details may reflect back in subsequent read-only data.
	 * @param {boolean} [params.useExistingPolicySet] - Whether to use a previously created policy set that may be
	 *   referenced in other properties, or create a new policy set to use with this property. A policy set can be
	 *   shared across multiple properties belonging to the same contract. The behavior populates any changes to the
	 *   policy set across all properties that reference that set. Default: false.
	 * @param {any} [params.policySet] - Identifies the existing policy set configured with [Image and Video Manager
	 *   API](https://techdocs.akamai.com/ivm/reference).
	 * @param {boolean} [params.advanced] - Generates a custom [Image and Video Manager
	 *   API](https://techdocs.akamai.com/ivm/reference) token to apply a corresponding policy to this set of images.
	 *   The token consists of a descriptive label (the `policyToken`) concatenated with a property-specific identifier
	 *   that's generated when you save the property. The API registers the token when you activate the property.
	 *   Default: false.
	 * @param {any} [params.policyToken] - Assign a prefix label to help match the policy token to this set of images,
	 *   limited to 32 alphanumeric or underscore characters. If you don't specify a label, _default_ becomes the
	 *   prefix. Default: "fresh".
	 * @param {any} [params.policyTokenDefault] - Specify the default policy identifier, which is registered with the
	 *   [Image and Video Manager API](https://techdocs.akamai.com/ivm/reference) once you activate this property. The
	 *   `advanced` option needs to be inactive. Default: "default".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/img-video-manager-img | Akamai Techdocs}
	 */
	setImageManager(params: {
		/** Enable image management capabilities and generate a corresponding API token. Default: true. */
		enabled?: boolean;

		/**
		 * Specify whether to scale down images to the maximum screen resolution, as determined by the rendering
		 * device's user agent. Note that enabling this may affect screen layout in unexpected ways. Default: false.
		 */
		resize?: boolean;

		/**
		 * Specify whether to convert images to the best file type for the requesting device, based on its user agent
		 * and the initial image file. This produces the smallest file size possible that retains image quality.
		 * Default: true.
		 */
		applyBestFileType?: boolean;

		/**
		 * Specifies a location for your site's heaviest traffic, for use in caching derivatives on edge servers.
		 * Default: "US".
		 */
		superCacheRegion?: 'US' | 'ASIA' | 'AUSTRALIA' | 'EMEA' | 'JAPAN' | 'CHINA';

		/**
		 * Assigns a CP code to track traffic and billing for original images that the Image and Video Manager has not
		 * modified. You only need to provide the initial `id`, stripping any [`cpc_` prefix](ref:id-prefixes) to pass
		 * the integer to the rule tree. Additional CP code details may reflect back in subsequent read-only data.
		 */
		cpCodeOriginal: any;

		/**
		 * Assigns a separate CP code to track traffic and billing for derived images. You only need to provide the
		 * initial `id`, stripping any [`cpc_` prefix](ref:id-prefixes) to pass the integer to the rule tree. Additional
		 * CP code details may reflect back in subsequent read-only data.
		 */
		cpCodeTransformed: any;

		/**
		 * Whether to use a previously created policy set that may be referenced in other properties, or create a new
		 * policy set to use with this property. A policy set can be shared across multiple properties belonging to the
		 * same contract. The behavior populates any changes to the policy set across all properties that reference that
		 * set. Default: false.
		 */
		useExistingPolicySet?: boolean;

		/**
		 * Identifies the existing policy set configured with [Image and Video Manager
		 * API](https://techdocs.akamai.com/ivm/reference).
		 */
		policySet?: any;

		/**
		 * Generates a custom [Image and Video Manager API](https://techdocs.akamai.com/ivm/reference) token to apply a
		 * corresponding policy to this set of images. The token consists of a descriptive label (the `policyToken`)
		 * concatenated with a property-specific identifier that's generated when you save the property. The API
		 * registers the token when you activate the property. Default: false.
		 */
		advanced?: boolean;

		/**
		 * Assign a prefix label to help match the policy token to this set of images, limited to 32 alphanumeric or
		 * underscore characters. If you don't specify a label, _default_ becomes the prefix. Default: "fresh".
		 */
		policyToken?: any;

		/**
		 * Specify the default policy identifier, which is registered with the [Image and Video Manager
		 * API](https://techdocs.akamai.com/ivm/reference) once you activate this property. The `advanced` option needs
		 * to be inactive. Default: "default".
		 */
		policyTokenDefault?: any;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.resize === 'undefined' && (params.enabled as unknown) === true) {
			params.resize = false;
		}

		if (typeof params.applyBestFileType === 'undefined' && (params.enabled as unknown) === true) {
			params.applyBestFileType = true;
		}

		if (typeof params.useExistingPolicySet === 'undefined') {
			params.useExistingPolicySet = false;
		}

		if (typeof params.superCacheRegion === 'undefined' && (params.useExistingPolicySet as unknown) !== true) {
			params.superCacheRegion = 'US';
		}

		if (typeof params.advanced === 'undefined' && (params.useExistingPolicySet as unknown) === false) {
			params.advanced = false;
		}

		if (typeof params.policyToken === 'undefined' && (params.advanced as unknown) === true) {
			params.policyToken = 'fresh';
		}

		if (typeof params.policyTokenDefault === 'undefined' && (params.advanced as unknown) === false) {
			params.policyTokenDefault = 'default';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'imageManager', {}, params));
	}

	/**
	 * 2DO.
	 *
	 * @param {object} params - The parameters needed to configure setImageAndVideoManager
	 * @param {'IMAGE' | 'VIDEO'} [params.policySetType] - 2DO. Default: "IMAGE".
	 * @param {boolean} [params.enabled] - 2DO. Default: true.
	 * @param {boolean} [params.resize] - 2DO. Default: false.
	 * @param {boolean} [params.applyBestFileType] - 2DO. Default: true.
	 * @param {any} params.cpCodeOriginal - 2DO.
	 * @param {any} params.cpCodeTransformed - 2DO.
	 * @param {any} [params.imageSet] - 2DO.
	 * @param {any} [params.videoSet] - 2DO.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/img-video-manager-img | Akamai Techdocs}
	 */
	setImageAndVideoManager(params: {
		/** 2DO. Default: "IMAGE". */
		policySetType?: 'IMAGE' | 'VIDEO';

		/** 2DO. Default: true. */
		enabled?: boolean;

		/** 2DO. Default: false. */
		resize?: boolean;

		/** 2DO. Default: true. */
		applyBestFileType?: boolean;

		/** 2DO. */
		cpCodeOriginal: any;

		/** 2DO. */
		cpCodeTransformed: any;

		/** 2DO. */
		imageSet?: any;

		/** 2DO. */
		videoSet?: any;
	}): Property {
		if (typeof params.policySetType === 'undefined') {
			params.policySetType = 'IMAGE';
		}

		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.resize === 'undefined') {
			params.resize = false;
		}

		if (typeof params.applyBestFileType === 'undefined') {
			params.applyBestFileType = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'imageAndVideoManager', {}, params));
	}

	/**
	 * [mPulse](https://techdocs.akamai.com/mpulse) provides high-level performance analytics and predictive
	 * recommendations based on real end user data. See the [mPulse Quick Start](https://techdocs.akamai.com/mpulse) to
	 * set up mPulse on your website.
	 *
	 * @param {object} params - The parameters needed to configure setMPulse
	 * @param {boolean} [params.enabled] - Applies performance monitoring to this behavior's set of content. Default:
	 *   true.
	 * @param {boolean} [params.requirePci] - Suppresses gathering metrics for potentially sensitive end-user
	 *   interactions. Enabling this omits data from some older browsers. Default: false.
	 * @param {'V10' | 'V12' | 'LATEST' | 'BETA'} [params.loaderVersion] - Specifies the version of the Boomerang
	 *   JavaScript loader snippet. See [mPulse Loader Snippets](https://techdocs.akamai.com/mpulse/docs/boomerang) for
	 *   more information. Default: "V12".
	 * @param {string} [params.apiKey] - This generated value uniquely identifies sections of your website for you to
	 *   analyze independently. To access this value, see [Enable mPulse in Property
	 *   Manager](https://techdocs.akamai.com/mpulse).
	 * @param {string} [params.bufferSize] - Allows you to override the browser's default (150) maximum number of
	 *   reported performance timeline entries.
	 * @param {string} [params.configOverride] - A JSON string representing a configuration object passed to the
	 *   JavaScript library under which mPulse runs. It corresponds at run-time to the `window.BOOMR_config` object. For
	 *   example, this turns on monitoring of Single Page App frameworks: `"{\"history\": {\"enabled\": true, \"auto\":
	 *   true}}"`. See [Configuration Overrides](https://techdocs.akamai.com/mpulse/docs/boomerang) for more
	 *   information. Default: "".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/mpulse-beh | Akamai Techdocs}
	 */
	setMPulse(params: {
		/** Applies performance monitoring to this behavior's set of content. Default: true. */
		enabled?: boolean;

		/**
		 * Suppresses gathering metrics for potentially sensitive end-user interactions. Enabling this omits data from
		 * some older browsers. Default: false.
		 */
		requirePci?: boolean;

		/**
		 * Specifies the version of the Boomerang JavaScript loader snippet. See [mPulse Loader
		 * Snippets](https://techdocs.akamai.com/mpulse/docs/boomerang) for more information. Default: "V12".
		 */
		loaderVersion?: 'V10' | 'V12' | 'LATEST' | 'BETA';

		/**
		 * This generated value uniquely identifies sections of your website for you to analyze independently. To access
		 * this value, see [Enable mPulse in Property Manager](https://techdocs.akamai.com/mpulse).
		 */
		apiKey?: string;

		/** Allows you to override the browser's default (150) maximum number of reported performance timeline entries. */
		bufferSize?: string;

		/**
		 * A JSON string representing a configuration object passed to the JavaScript library under which mPulse runs.
		 * It corresponds at run-time to the `window.BOOMR_config` object. For example, this turns on monitoring of
		 * Single Page App frameworks: `"{\"history\": {\"enabled\": true, \"auto\": true}}"`. See [Configuration
		 * Overrides](https://techdocs.akamai.com/mpulse/docs/boomerang) for more information. Default: "".
		 */
		configOverride?: string;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.requirePci === 'undefined') {
			params.requirePci = false;
		}

		if (typeof params.loaderVersion === 'undefined') {
			params.loaderVersion = 'V12';
		}

		if (typeof params.configOverride === 'undefined') {
			params.configOverride = '';
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'mPulse', {}, params));
	}

	/**
	 * Multi-Domain Configuration, also known as _InstantConfig_, allows you to apply property settings to all incoming
	 * hostnames based on a DNS lookup, without explicitly listing them among the property's hostnames.
	 *
	 * @param {object} params - The parameters needed to configure setInstantConfig
	 * @param {boolean} [params.enabled] - Enables the InstantConfig behavior. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/instantconfig-beh | Akamai Techdocs}
	 */
	setInstantConfig(params: {
		/** Enables the InstantConfig behavior. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'instantConfig', {}, params));
	}

	/**
	 * Cloud Interconnects forwards traffic from edge servers to your cloud origin through Private Network Interconnects
	 * (PNIs), helping to reduce the egress costs at the origin. Supports origins hosted by Google Cloud Provider
	 * (GCP).
	 *
	 * @param {object} params - The parameters needed to configure setCloudInterconnects
	 * @param {boolean} [params.enabled] - Channels the traffic to maximize the egress discount at the origin. Default:
	 *   true.
	 * @param {('AS' | 'EU' | 'NA')[]} [params.cloudLocations] - Specifies the geographical locations of your cloud
	 *   origin. You should enable Cloud Interconnects only if your origin is in one of these locations, since GCP
	 *   doesn't provide a discount for egress traffic for any other regions. Default: ["NA"].
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/cloud-interconnects-google-cloud-gcp | Akamai Techdocs}
	 */
	setCloudInterconnects(params: {
		/** Channels the traffic to maximize the egress discount at the origin. Default: true. */
		enabled?: boolean;

		/**
		 * Specifies the geographical locations of your cloud origin. You should enable Cloud Interconnects only if your
		 * origin is in one of these locations, since GCP doesn't provide a discount for egress traffic for any other
		 * regions. Default: ["NA"].
		 */
		cloudLocations?: Array<'AS' | 'EU' | 'NA'>;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.cloudLocations === 'undefined' && (params.enabled as unknown) === true) {
			params.cloudLocations = ['NA'];
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'cloudInterconnects', {}, params));
	}

	/**
	 * With the [`http2`](#) behavior enabled, this requests a specified set of domains that relate to your property
	 * hostname, and keeps the connection open for faster loading of content from those domains.
	 *
	 * @param {object} params - The parameters needed to configure setPreconnect
	 * @param {string[]} params.preconnectlist - Specifies the set of hostnames to which to preconnect over HTTP2.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/manual-preconnect | Akamai Techdocs}
	 */
	setPreconnect(params: {
		/** Specifies the set of hostnames to which to preconnect over HTTP2. */
		preconnectlist: string[];
	}): Property {
		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'preconnect', {}, params));
	}

	/**
	 * For a share of responses, includes an `Alt-Svc` header for compatible clients to initiate subsequent sessions
	 * using the QUIC protocol.
	 *
	 * @param {object} params - The parameters needed to configure setQuicBeta
	 * @param {boolean} [params.enabled] - Enables QUIC support. Default: true.
	 * @param {number} [params.quicOfferPercentage] - The percentage of responses for which to allow QUIC sessions.
	 *   Default: 50.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/quic-support | Akamai Techdocs}
	 */
	setQuicBeta(params: {
		/** Enables QUIC support. Default: true. */
		enabled?: boolean;

		/** The percentage of responses for which to allow QUIC sessions. Default: 50. */
		quicOfferPercentage?: number;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.quicOfferPercentage === 'undefined' && (params.enabled as unknown) === true) {
			params.quicOfferPercentage = 50;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'quicBeta', {}, params));
	}

	/**
	 * This behavior is deprecated, but you should not disable or remove it if present. Use this along with
	 * [`adaptiveAcceleration`](#) to compress and cache resources such as JavaScript, CSS, and font files.
	 *
	 * @param {object} params - The parameters needed to configure setResourceOptimizer
	 * @param {boolean} [params.enabled] - Enables the Resource Optimizer feature. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/adaptive-accel | Akamai Techdocs}
	 */
	setResourceOptimizer(params: {
		/** Enables the Resource Optimizer feature. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'resourceOptimizer', {}, params));
	}

	/**
	 * This enhances the standard version of the [`resourceOptimizer`](#) behavior to support the compression of
	 * additional file formats and address some compatibility issues.
	 *
	 * @param {object} params - The parameters needed to configure setResourceOptimizerExtendedCompatibility
	 * @param {boolean} [params.enabled] - Enables the Resource Optimizer feature. Default: true.
	 * @param {boolean} [params.enableAllFeatures] - Enables [additional
	 *   support](https://techdocs.akamai.com/ion/docs/set-up-adaptive-acceleration#add-resource-optimizer-extended-compatibility-optional)
	 *   and error handling. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/resource-optimizer-extended-compat | Akamai Techdocs}
	 */
	setResourceOptimizerExtendedCompatibility(params: {
		/** Enables the Resource Optimizer feature. Default: true. */
		enabled?: boolean;

		/**
		 * Enables [additional
		 * support](https://techdocs.akamai.com/ion/docs/set-up-adaptive-acceleration#add-resource-optimizer-extended-compatibility-optional)
		 * and error handling. Default: true.
		 */
		enableAllFeatures?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.enableAllFeatures === 'undefined') {
			params.enableAllFeatures = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'resourceOptimizerExtendedCompatibility', {}, params),
		);
	}

	/**
	 * Adaptive Acceleration uses HTTP/2 server push functionality with Ion properties to pre-position content and
	 * improve the performance of HTML page loading based on real user monitoring (RUM) timing data. It also helps
	 * browsers to preconnect to content that’s likely needed for upcoming requests. To use this behavior, make sure you
	 * enable the [`http2`](#) behavior. Use the [Adaptive Acceleration
	 * API](https://techdocs.akamai.com/adaptive-acceleration/reference) to report on the set of assets this feature
	 * optimizes.
	 *
	 * @param {object} params - The parameters needed to configure setAdaptiveAcceleration
	 * @param {string} [params.source] - The source Adaptive Acceleration uses to gather the real user monitoring timing
	 *   data, either `mPulse` or `realUserMonitoring`. The recommended `mPulse` option supports all optimizations and
	 *   requires the [`mPulse`](#) behavior added by default to new Ion properties. The classic `realUserMonitoring`
	 *   method has been deprecated. If you set it as the data source, make sure you use it with the
	 *   [`realUserMonitoring`](#) behavior. Default: "mPulse".
	 * @param {boolean} [params.enablePush] - Recognizes resources like JavaScript, CSS, and images based on gathered
	 *   timing data and sends these resources to a browser as it's waiting for a response to the initial request for
	 *   your website or app. See [Automatic Server
	 *   Push](https://techdocs.akamai.com/ion/docs/set-up-adaptive-acceleration#about-automatic-server-push) for more
	 *   information. Default: true.
	 * @param {boolean} [params.enablePreconnect] - Allows browsers to anticipate what connections your site needs, and
	 *   establishes those connections ahead of time. See [Automatic
	 *   Preconnect](https://techdocs.akamai.com/ion/docs/set-up-adaptive-acceleration#about-automatic-preconnect) for
	 *   more information. Default: true.
	 * @param {boolean} [params.preloadEnable] - Allows browsers to preload necessary fonts before they fetch and
	 *   process other resources. See [Automatic Font
	 *   Preload](https://techdocs.akamai.com/ion/docs/set-up-adaptive-acceleration#about-automatic-font-preload) for
	 *   more information. Default: true.
	 * @param {'DISABLED' | 'CLOUDLETS' | 'MANUAL'} [params.abLogic] - Specifies whether to use Adaptive Acceleration in
	 *   an A/B testing environment. To include Adaptive Acceleration data in your A/B testing, specify the mode you
	 *   want to apply. Otherwise, `DISABLED` by default. See [Add A/B testing to
	 *   A2](https://techdocs.akamai.com/ion/reference/enable-ab-testing) for details. Default: "DISABLED".
	 * @param {string} [params.cookieName] - This specifies the name of the cookie file used for redirecting the
	 *   requests in the A/B testing environment.
	 * @param {boolean} [params.enableRo] - Enables the Resource Optimizer, which automates the compression and delivery
	 *   of your `.css`, `.js`, and `.svg` content using a combination of Brotli and Zopfli compressions. The
	 *   compression is performed offline, during a time to live that the feature automatically sets. See the
	 *   [`resourceOptimizer`](#) and [`resourceOptimizerExtendedCompatibility`](#) behaviors for more details. Default:
	 *   true.
	 * @param {boolean} [params.enableBrotliCompression] - Applies Brotli compression, converting your origin content to
	 *   cache on edge servers. Default: false.
	 * @param {boolean} [params.enableForNoncacheable] - Applies Brotli compression to non-cacheable content. Default:
	 *   false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/adaptive-accel | Akamai Techdocs}
	 */
	setAdaptiveAcceleration(params: {
		/**
		 * The source Adaptive Acceleration uses to gather the real user monitoring timing data, either `mPulse` or
		 * `realUserMonitoring`. The recommended `mPulse` option supports all optimizations and requires the
		 * [`mPulse`](#) behavior added by default to new Ion properties. The classic `realUserMonitoring` method has
		 * been deprecated. If you set it as the data source, make sure you use it with the [`realUserMonitoring`](#)
		 * behavior. Default: "mPulse".
		 */
		source?: string;

		/**
		 * Recognizes resources like JavaScript, CSS, and images based on gathered timing data and sends these resources
		 * to a browser as it's waiting for a response to the initial request for your website or app. See [Automatic
		 * Server Push](https://techdocs.akamai.com/ion/docs/set-up-adaptive-acceleration#about-automatic-server-push)
		 * for more information. Default: true.
		 */
		enablePush?: boolean;

		/**
		 * Allows browsers to anticipate what connections your site needs, and establishes those connections ahead of
		 * time. See [Automatic
		 * Preconnect](https://techdocs.akamai.com/ion/docs/set-up-adaptive-acceleration#about-automatic-preconnect) for
		 * more information. Default: true.
		 */
		enablePreconnect?: boolean;

		/**
		 * Allows browsers to preload necessary fonts before they fetch and process other resources. See [Automatic Font
		 * Preload](https://techdocs.akamai.com/ion/docs/set-up-adaptive-acceleration#about-automatic-font-preload) for
		 * more information. Default: true.
		 */
		preloadEnable?: boolean;

		/**
		 * Specifies whether to use Adaptive Acceleration in an A/B testing environment. To include Adaptive
		 * Acceleration data in your A/B testing, specify the mode you want to apply. Otherwise, `DISABLED` by default.
		 * See [Add A/B testing to A2](https://techdocs.akamai.com/ion/reference/enable-ab-testing) for details.
		 * Default: "DISABLED".
		 */
		abLogic?: 'DISABLED' | 'CLOUDLETS' | 'MANUAL';

		/** This specifies the name of the cookie file used for redirecting the requests in the A/B testing environment. */
		cookieName?: string;

		/**
		 * Enables the Resource Optimizer, which automates the compression and delivery of your `.css`, `.js`, and
		 * `.svg` content using a combination of Brotli and Zopfli compressions. The compression is performed offline,
		 * during a time to live that the feature automatically sets. See the [`resourceOptimizer`](#) and
		 * [`resourceOptimizerExtendedCompatibility`](#) behaviors for more details. Default: true.
		 */
		enableRo?: boolean;

		/** Applies Brotli compression, converting your origin content to cache on edge servers. Default: false. */
		enableBrotliCompression?: boolean;

		/** Applies Brotli compression to non-cacheable content. Default: false. */
		enableForNoncacheable?: boolean;
	}): Property {
		if (typeof params.source === 'undefined') {
			params.source = 'mPulse';
		}

		if (typeof params.enablePush === 'undefined') {
			params.enablePush = true;
		}

		if (typeof params.enablePreconnect === 'undefined') {
			params.enablePreconnect = true;
		}

		if (typeof params.preloadEnable === 'undefined') {
			params.preloadEnable = true;
		}

		if (typeof params.abLogic === 'undefined') {
			params.abLogic = 'DISABLED';
		}

		if (typeof params.enableRo === 'undefined') {
			params.enableRo = true;
		}

		if (typeof params.enableBrotliCompression === 'undefined') {
			params.enableBrotliCompression = false;
		}

		if (
			typeof params.enableForNoncacheable === 'undefined' &&
			(params.enableBrotliCompression as unknown) === true
		) {
			params.enableForNoncacheable = false;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'adaptiveAcceleration', {}, params));
	}

	/**
	 * The [Akamai API Gateway](https://techdocs.akamai.com/api-definitions/docs) allows you to configure API traffic
	 * delivered over the Akamai network. Apply this behavior to a set of API assets, then use Akamai's [API Endpoints
	 * API](https://techdocs.akamai.com/api-definitions/reference/api) to configure how the traffic responds. Use the
	 * [API Keys and Traffic Management API](https://techdocs.akamai.com/key-traffic-mgmt/reference) to control access
	 * to your APIs.
	 *
	 * @param {object} params - The parameters needed to configure setRapid
	 * @param {boolean} [params.enabled] - Enables API Gateway for the current set of content. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/akamai-api-gateway | Akamai Techdocs}
	 */
	setRapid(params: {
		/** Enables API Gateway for the current set of content. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'rapid', {}, params));
	}

	/**
	 * This behavior is deprecated, but you should not disable or remove it if present. Real User Monitoring (RUM)
	 * injects JavaScript into HTML pages served to end-user clients that monitors page-load performance and reports on
	 * various data, such as browser type and geographic location. The [`report`](#) behavior allows you to configure
	 * logs.
	 *
	 * @param {object} params - The parameters needed to configure setRealUserMonitoring
	 * @param {boolean} [params.enabled] - When enabled, activates real-use monitoring. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/real-user-monitoring-rum | Akamai Techdocs}
	 */
	setRealUserMonitoring(params: {
		/** When enabled, activates real-use monitoring. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'realUserMonitoring', {}, params));
	}

	/**
	 * This behavior is deprecated, but you should not disable or remove it if present. With [`realUserMonitoring`](#)
	 * enabled, this configures the sample of data to include in your RUM report. The [`realUserMonitoring`](#) behavior
	 * is deprecated as well.
	 *
	 * @param {object} params - The parameters needed to configure setRumCustom
	 * @param {number} [params.rumSampleRate] - Specifies the percentage of web traffic to include in your RUM report.
	 *   Default: 5.
	 * @param {string} [params.rumGroupName] - A deprecated option to specify an alternate name under which to batch
	 *   this set of web traffic in your report. Do not use it.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/rum-samplerate | Akamai Techdocs}
	 */
	setRumCustom(params: {
		/** Specifies the percentage of web traffic to include in your RUM report. Default: 5. */
		rumSampleRate?: number;

		/**
		 * A deprecated option to specify an alternate name under which to batch this set of web traffic in your report.
		 * Do not use it.
		 */
		rumGroupName?: string;
	}): Property {
		if (typeof params.rumSampleRate === 'undefined') {
			params.rumSampleRate = 5;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'rumCustom', {}, params));
	}

	/**
	 * The Request Control Cloudlet allows you to control access to your web content based on the incoming request's IP
	 * or geographic location. With Cloudlets available on your contract, choose **Your services** > **Edge logic
	 * Cloudlets** to control how the feature works within [Control Center](https://control.akamai.com), or use the
	 * [Cloudlets API](https://techdocs.akamai.com/cloudlets/reference) to configure it programmatically.
	 *
	 * @param {object} params - The parameters needed to configure setRequestControl
	 * @param {boolean} [params.enabled] - Enables the Request Control Cloudlet. Default: true.
	 * @param {boolean} [params.isSharedPolicy] - Whether you want to apply the Cloudlet shared policy to an unlimited
	 *   number of properties within your account. Learn more about shared policies and how to create them in [Cloudlets
	 *   Policy Manager](https://techdocs.akamai.com/cloudlets). Default: false.
	 * @param {any} [params.cloudletPolicy] - Identifies the Cloudlet policy.
	 * @param {number} [params.cloudletSharedPolicy] - Identifies the Cloudlet shared policy to use with this behavior.
	 *   Use the [Cloudlets API](https://techdocs.akamai.com/cloudlets/reference) to list available shared policies.
	 * @param {boolean} [params.enableBranded403] - If enabled, serves a branded 403 page for this Cloudlet instance.
	 *   Default: false.
	 * @param {200 | 302 | 403 | 503} [params.branded403StatusCode] - Specifies the response status code for the branded
	 *   deny action. Default: 403.
	 * @param {any} [params.netStorage] - Specifies the NetStorage domain that contains the branded 403 page.
	 * @param {string} [params.branded403File] - Specifies the full path of the branded 403 page, including the
	 *   filename, but excluding the NetStorage CP code path component.
	 * @param {string} [params.branded403Url] - Specifies the redirect URL for the branded deny action.
	 * @param {number} [params.brandedDenyCacheTtl] - Specifies the branded response page's time to live in the cache,
	 *   `5` minutes by default. Default: 5.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/req-control-cloudlet | Akamai Techdocs}
	 */
	setRequestControl(params: {
		/** Enables the Request Control Cloudlet. Default: true. */
		enabled?: boolean;

		/**
		 * Whether you want to apply the Cloudlet shared policy to an unlimited number of properties within your
		 * account. Learn more about shared policies and how to create them in [Cloudlets Policy
		 * Manager](https://techdocs.akamai.com/cloudlets). Default: false.
		 */
		isSharedPolicy?: boolean;

		/** Identifies the Cloudlet policy. */
		cloudletPolicy?: any;

		/**
		 * Identifies the Cloudlet shared policy to use with this behavior. Use the [Cloudlets
		 * API](https://techdocs.akamai.com/cloudlets/reference) to list available shared policies.
		 */
		cloudletSharedPolicy?: number;

		/** If enabled, serves a branded 403 page for this Cloudlet instance. Default: false. */
		enableBranded403?: boolean;

		/** Specifies the response status code for the branded deny action. Default: 403. */
		branded403StatusCode?: 200 | 302 | 403 | 503;

		/** Specifies the NetStorage domain that contains the branded 403 page. */
		netStorage?: any;

		/**
		 * Specifies the full path of the branded 403 page, including the filename, but excluding the NetStorage CP code
		 * path component.
		 */
		branded403File?: string;

		/** Specifies the redirect URL for the branded deny action. */
		branded403Url?: string;

		/** Specifies the branded response page's time to live in the cache, `5` minutes by default. Default: 5. */
		brandedDenyCacheTtl?: number;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.isSharedPolicy === 'undefined' && (params.enabled as unknown) === true) {
			params.isSharedPolicy = false;
		}

		if (typeof params.enableBranded403 === 'undefined' && (params.enabled as unknown) === true) {
			params.enableBranded403 = false;
		}

		if (
			typeof params.branded403StatusCode === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.enableBranded403 as unknown) === true
		) {
			params.branded403StatusCode = 403;
		}

		if (
			typeof params.brandedDenyCacheTtl === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.enableBranded403 as unknown) === true &&
			(params.branded403StatusCode as unknown) !== 302
		) {
			params.brandedDenyCacheTtl = 5;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'requestControl', {}, params));
	}

	/**
	 * Configures how the Software as a Service feature identifies _customers_, _applications_, and _users_. A different
	 * set of options is available for each type of targeted request, each enabled with the `action`-suffixed option. In
	 * each case, you can use `PATH`, `COOKIE`, `QUERY_STRING`, or `HOSTNAME` components as identifiers, or `disable`
	 * the SaaS behavior for certain targets. If you rely on a `HOSTNAME`, you also have the option of specifying a
	 * _CNAME chain_ rather than an individual hostname. The various options suffixed `regex` and `replace` subsequently
	 * remove the identifier from the request. This behavior requires a sibling [`origin`](#) behavior whose
	 * `originType` option is set to `SAAS_DYNAMIC_ORIGIN`.
	 *
	 * @param {object} params - The parameters needed to configure setSaasDefinitions
	 * @param {'DISABLED' | 'HOSTNAME' | 'PATH' | 'QUERY_STRING' | 'COOKIE'} [params.customerAction] - Specifies the
	 *   request component that identifies a SaaS customer. Default: "PATH".
	 * @param {boolean} [params.customerCnameEnabled] - Enabling this allows you to identify customers using a _CNAME
	 *   chain_ rather than a single hostname. Default: false.
	 * @param {number} [params.customerCnameLevel] - Specifies the number of CNAMEs to use in the chain. Default: 1.
	 * @param {string} [params.customerCookie] - This specifies the name of the cookie that identifies the customer.
	 * @param {string} [params.customerQueryString] - This names the query parameter that identifies the customer.
	 * @param {string} [params.customerRegex] - Specifies a Perl-compatible regular expression with which to substitute
	 *   the request's customer ID.
	 * @param {string} [params.customerReplace] - Specifies a string to replace the request's customer ID matched by
	 *   `customerRegex`.
	 * @param {'DISABLED' | 'HOSTNAME' | 'PATH' | 'QUERY_STRING' | 'COOKIE'} [params.applicationAction] - Specifies the
	 *   request component that identifies a SaaS application. Default: "PATH".
	 * @param {boolean} [params.applicationCnameEnabled] - Enabling this allows you to identify applications using a
	 *   _CNAME chain_ rather than a single hostname. Default: false.
	 * @param {number} [params.applicationCnameLevel] - Specifies the number of CNAMEs to use in the chain. Default: 1.
	 * @param {string} [params.applicationCookie] - This specifies the name of the cookie that identifies the
	 *   application.
	 * @param {string} [params.applicationQueryString] - This names the query parameter that identifies the application.
	 * @param {string} [params.applicationRegex] - Specifies a Perl-compatible regular expression with which to
	 *   substitute the request's application ID.
	 * @param {string} [params.applicationReplace] - Specifies a string to replace the request's application ID matched
	 *   by `applicationRegex`.
	 * @param {'DISABLED' | 'HOSTNAME' | 'PATH' | 'QUERY_STRING' | 'COOKIE'} [params.usersAction] - Specifies the
	 *   request component that identifies a SaaS user. Default: "COOKIE".
	 * @param {boolean} [params.usersCnameEnabled] - Enabling this allows you to identify users using a _CNAME chain_
	 *   rather than a single hostname. Default: false.
	 * @param {number} [params.usersCnameLevel] - Specifies the number of CNAMEs to use in the chain. Default: 1.
	 * @param {string} [params.usersCookie] - This specifies the name of the cookie that identifies the user.
	 * @param {string} [params.usersQueryString] - This names the query parameter that identifies the user.
	 * @param {string} [params.usersRegex] - Specifies a Perl-compatible regular expression with which to substitute the
	 *   request's user ID.
	 * @param {string} [params.usersReplace] - Specifies a string to replace the request's user ID matched by
	 *   `usersRegex`.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/welcome-prop-manager | Akamai Techdocs}
	 */
	setSaasDefinitions(params: {
		/** Specifies the request component that identifies a SaaS customer. Default: "PATH". */
		customerAction?: 'DISABLED' | 'HOSTNAME' | 'PATH' | 'QUERY_STRING' | 'COOKIE';

		/**
		 * Enabling this allows you to identify customers using a _CNAME chain_ rather than a single hostname. Default:
		 * false.
		 */
		customerCnameEnabled?: boolean;

		/** Specifies the number of CNAMEs to use in the chain. Default: 1. */
		customerCnameLevel?: number;

		/** This specifies the name of the cookie that identifies the customer. */
		customerCookie?: string;

		/** This names the query parameter that identifies the customer. */
		customerQueryString?: string;

		/** Specifies a Perl-compatible regular expression with which to substitute the request's customer ID. */
		customerRegex?: string;

		/** Specifies a string to replace the request's customer ID matched by `customerRegex`. */
		customerReplace?: string;

		/** Specifies the request component that identifies a SaaS application. Default: "PATH". */
		applicationAction?: 'DISABLED' | 'HOSTNAME' | 'PATH' | 'QUERY_STRING' | 'COOKIE';

		/**
		 * Enabling this allows you to identify applications using a _CNAME chain_ rather than a single hostname.
		 * Default: false.
		 */
		applicationCnameEnabled?: boolean;

		/** Specifies the number of CNAMEs to use in the chain. Default: 1. */
		applicationCnameLevel?: number;

		/** This specifies the name of the cookie that identifies the application. */
		applicationCookie?: string;

		/** This names the query parameter that identifies the application. */
		applicationQueryString?: string;

		/** Specifies a Perl-compatible regular expression with which to substitute the request's application ID. */
		applicationRegex?: string;

		/** Specifies a string to replace the request's application ID matched by `applicationRegex`. */
		applicationReplace?: string;

		/** Specifies the request component that identifies a SaaS user. Default: "COOKIE". */
		usersAction?: 'DISABLED' | 'HOSTNAME' | 'PATH' | 'QUERY_STRING' | 'COOKIE';

		/**
		 * Enabling this allows you to identify users using a _CNAME chain_ rather than a single hostname. Default:
		 * false.
		 */
		usersCnameEnabled?: boolean;

		/** Specifies the number of CNAMEs to use in the chain. Default: 1. */
		usersCnameLevel?: number;

		/** This specifies the name of the cookie that identifies the user. */
		usersCookie?: string;

		/** This names the query parameter that identifies the user. */
		usersQueryString?: string;

		/** Specifies a Perl-compatible regular expression with which to substitute the request's user ID. */
		usersRegex?: string;

		/** Specifies a string to replace the request's user ID matched by `usersRegex`. */
		usersReplace?: string;
	}): Property {
		if (typeof params.customerAction === 'undefined') {
			params.customerAction = 'PATH';
		}

		if (typeof params.customerCnameEnabled === 'undefined' && (params.customerAction as unknown) === 'HOSTNAME') {
			params.customerCnameEnabled = false;
		}

		if (typeof params.customerCnameLevel === 'undefined' && (params.customerCnameEnabled as unknown) === true) {
			params.customerCnameLevel = 1;
		}

		if (typeof params.applicationAction === 'undefined') {
			params.applicationAction = 'PATH';
		}

		if (
			typeof params.applicationCnameEnabled === 'undefined' &&
			(params.applicationAction as unknown) === 'HOSTNAME'
		) {
			params.applicationCnameEnabled = false;
		}

		if (
			typeof params.applicationCnameLevel === 'undefined' &&
			(params.applicationCnameEnabled as unknown) === true
		) {
			params.applicationCnameLevel = 1;
		}

		if (typeof params.usersAction === 'undefined') {
			params.usersAction = 'COOKIE';
		}

		if (typeof params.usersCnameEnabled === 'undefined' && (params.usersAction as unknown) === 'HOSTNAME') {
			params.usersCnameEnabled = false;
		}

		if (typeof params.usersCnameLevel === 'undefined' && (params.usersCnameEnabled as unknown) === true) {
			params.usersCnameLevel = 1;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'saasDefinitions', {}, params));
	}

	/**
	 * If you use the Salesforce Commerce Cloud platform for your origin content, this behavior allows your edge content
	 * managed by Akamai to contact directly to origin.
	 *
	 * @param {object} params - The parameters needed to configure setSalesForceCommerceCloudClient
	 * @param {boolean} [params.enabled] - Enables the Akamai Connector for Salesforce Commerce Cloud. Default: true.
	 * @param {string} [params.connectorId] - An ID value that helps distinguish different types of traffic sent from
	 *   Akamai to the Salesforce Commerce Cloud. Form the value as _instance-realm-customer_, where _instance_ is
	 *   either `production` or `development`, _realm_ is your Salesforce Commerce Cloud service `$REALM` value, and
	 *   _customer_ is the name for your organization in Salesforce Commerce Cloud. You can use alphanumeric characters,
	 *   underscores, or dot characters within dash-delimited segment values. PM variables may appear between '{{' and
	 *   '}}'.
	 * @param {'DEFAULT' | 'CUSTOMER'} [params.originType] - Specifies where the origin is. Default: "DEFAULT".
	 * @param {string} [params.sf3cOriginHost] - This specifies the hostname or IP address of the custom Salesforce
	 *   origin. PM variables may appear between '{{' and '}}'.
	 * @param {'DEFAULT' | 'CUSTOMER'} [params.originHostHeader] - Specifies where the `Host` header is defined.
	 *   Default: "DEFAULT".
	 * @param {string} [params.sf3cOriginHostHeader] - This specifies the hostname or IP address of the custom
	 *   Salesforce host header. PM variables may appear between '{{' and '}}'.
	 * @param {boolean} [params.allowOverrideOriginCacheKey] - When enabled, overrides the forwarding origin's cache
	 *   key. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/akamai-conn-salesforce-commerce-cloud | Akamai Techdocs}
	 */
	setSalesForceCommerceCloudClient(params: {
		/** Enables the Akamai Connector for Salesforce Commerce Cloud. Default: true. */
		enabled?: boolean;

		/**
		 * An ID value that helps distinguish different types of traffic sent from Akamai to the Salesforce Commerce
		 * Cloud. Form the value as _instance-realm-customer_, where _instance_ is either `production` or `development`,
		 * _realm_ is your Salesforce Commerce Cloud service `$REALM` value, and _customer_ is the name for your
		 * organization in Salesforce Commerce Cloud. You can use alphanumeric characters, underscores, or dot
		 * characters within dash-delimited segment values. PM variables may appear between '{{' and '}}'.
		 */
		connectorId?: string;

		/** Specifies where the origin is. Default: "DEFAULT". */
		originType?: 'DEFAULT' | 'CUSTOMER';

		/**
		 * This specifies the hostname or IP address of the custom Salesforce origin. PM variables may appear between
		 * '{{' and '}}'.
		 */
		sf3cOriginHost?: string;

		/** Specifies where the `Host` header is defined. Default: "DEFAULT". */
		originHostHeader?: 'DEFAULT' | 'CUSTOMER';

		/**
		 * This specifies the hostname or IP address of the custom Salesforce host header. PM variables may appear
		 * between '{{' and '}}'.
		 */
		sf3cOriginHostHeader?: string;

		/** When enabled, overrides the forwarding origin's cache key. Default: false. */
		allowOverrideOriginCacheKey?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.originType === 'undefined' && (params.enabled as unknown) === true) {
			params.originType = 'DEFAULT';
		}

		if (typeof params.originHostHeader === 'undefined' && (params.enabled as unknown) === true) {
			params.originHostHeader = 'DEFAULT';
		}

		if (typeof params.allowOverrideOriginCacheKey === 'undefined' && (params.enabled as unknown) === true) {
			params.allowOverrideOriginCacheKey = false;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'BEHAVIOR',
				'salesForceCommerceCloudClient',
				{allowsVars: ['connectorId', 'sf3cOriginHost', 'sf3cOriginHostHeader']},
				params,
			),
		);
	}

	/**
	 * This manages traffic between mutual customers and the Salesforce Commerce Cloud platform.
	 *
	 * @param {object} params - The parameters needed to configure setSalesForceCommerceCloudProvider
	 * @param {boolean} [params.enabled] - Enables Akamai Provider for Salesforce Commerce Cloud. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/akamai-provider-salesforce-commerce-cloud | Akamai Techdocs}
	 */
	setSalesForceCommerceCloudProvider(params: {
		/** Enables Akamai Provider for Salesforce Commerce Cloud. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'salesForceCommerceCloudProvider', {}, params),
		);
	}

	/**
	 * Manages host header values sent to the Salesforce Commerce Cloud platform.
	 *
	 * @param {object} params - The parameters needed to configure setSalesForceCommerceCloudProviderHostHeader
	 * @param {'PROPERTY' | 'CUSTOMER'} [params.hostHeaderSource] - Specify where the host header derives from. Default:
	 *   "PROPERTY".
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/akamai-provider-salesforce-commerce-cloud-host-header-control | Akamai Techdocs}
	 */
	setSalesForceCommerceCloudProviderHostHeader(params: {
		/** Specify where the host header derives from. Default: "PROPERTY". */
		hostHeaderSource?: 'PROPERTY' | 'CUSTOMER';
	}): Property {
		if (typeof params.hostHeaderSource === 'undefined') {
			params.hostHeaderSource = 'PROPERTY';
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'salesForceCommerceCloudProviderHostHeader', {}, params),
		);
	}

	/**
	 * With the [`http2`](#) behavior enabled, this loads a specified set of objects into the client browser's cache. To
	 * apply this behavior, you should match on a [`path`](#) or [`filename`](#).
	 *
	 * @param {object} params - The parameters needed to configure setManualServerPush
	 * @param {string[]} params.serverpushlist - Specifies the set of objects to load into the client browser's cache
	 *   over HTTP2. Each value in the array represents a hostname and full path to the object, such as
	 *   `www.example.com/js/site.js`.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/manual-server-push | Akamai Techdocs}
	 */
	setManualServerPush(params: {
		/**
		 * Specifies the set of objects to load into the client browser's cache over HTTP2. Each value in the array
		 * represents a hostname and full path to the object, such as `www.example.com/js/site.js`.
		 */
		serverpushlist: string[];
	}): Property {
		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'manualServerPush', {}, params));
	}

	/**
	 * This behavior simulates an origin connection problem, typically to test an accompanying [`failAction`](#) policy.
	 *
	 * @param {object} params - The parameters needed to configure setBreakConnection
	 * @param {boolean} [params.enabled] - Enables the break connection behavior. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/break-forward-connection | Akamai Techdocs}
	 */
	setBreakConnection(params: {
		/** Enables the break connection behavior. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'breakConnection', {}, params));
	}

	/**
	 * Specifies how to respond when the origin is not available: by serving stale content, by serving an error page, or
	 * by redirecting. To apply this behavior, you should match on an [`originTimeout`](#) or [`matchResponseCode`](#).
	 *
	 * @param {object} params - The parameters needed to configure setFailAction
	 * @param {boolean} [params.enabled] - When enabled in case of a failure to contact the origin, the current behavior
	 *   applies. Default: true.
	 * @param {'SERVE_STALE' | 'REDIRECT' | 'RECREATED_CO' | 'RECREATED_CEX' | 'RECREATED_NS' | 'DYNAMIC'} [params.actionType]
	 *   - Specifies the basic action to take when there is a failure to contact the origin. Default: "REDIRECT".
	 *
	 * @param {'HOSTNAME' | 'PATH' | 'QUERY_STRING' | 'COOKIE'} [params.saasType] - Identifies the component of the
	 *   request that identifies the SaaS dynamic fail action. Default: "HOSTNAME".
	 * @param {boolean} [params.saasCnameEnabled] - Specifies whether to use a CNAME chain to determine the hostname for
	 *   the SaaS dynamic failaction. Default: false.
	 * @param {number} [params.saasCnameLevel] - Specifies the number of elements in the CNAME chain backwards from the
	 *   edge hostname that determines the hostname for the SaaS dynamic failaction. Default: 1.
	 * @param {string} [params.saasCookie] - Specifies the name of the cookie that identifies this SaaS dynamic
	 *   failaction. PM variables may appear between '{{' and '}}'.
	 * @param {string} [params.saasQueryString] - Specifies the name of the query parameter that identifies this SaaS
	 *   dynamic failaction. PM variables may appear between '{{' and '}}'.
	 * @param {string} [params.saasRegex] - Specifies the substitution pattern (a Perl-compatible regular expression)
	 *   that defines the SaaS dynamic failaction.
	 * @param {string} [params.saasReplace] - Specifies the replacement pattern that defines the SaaS dynamic
	 *   failaction. PM variables may appear between '{{' and '}}'.
	 * @param {string} [params.saasSuffix] - Specifies the static portion of the SaaS dynamic failaction. PM variables
	 *   may appear between '{{' and '}}'.
	 * @param {'SERVE_301' | 'SERVE_302' | 'SERVE_ALTERNATE'} [params.dynamicMethod] - Specifies the redirect method.
	 *   Default: "SERVE_301".
	 * @param {boolean} [params.dynamicCustomPath] - Allows you to modify the original requested path. Default: true.
	 * @param {string} [params.dynamicPath] - Specifies the new path. PM variables may appear between '{{' and '}}'.
	 * @param {'ORIGINAL' | 'ALTERNATE'} [params.redirectHostnameType] - Whether to preserve or customize the hostname.
	 *   Default: "ALTERNATE".
	 * @param {string} [params.redirectHostname] - When the `actionType` is `REDIRECT` and the `redirectHostnameType` is
	 *   `ALTERNATE`, this specifies the hostname for the redirect. PM variables may appear between '{{' and '}}'.
	 * @param {boolean} [params.redirectCustomPath] - Uses the `redirectPath` to customize a new path. Default: true.
	 * @param {string} [params.redirectPath] - Specifies a new path. PM variables may appear between '{{' and '}}'.
	 * @param {302 | 301} [params.redirectMethod] - Specifies the HTTP response code. Default: 302.
	 * @param {string} [params.contentHostname] - Specifies the static hostname for the alternate redirect. PM variables
	 *   may appear between '{{' and '}}'.
	 * @param {boolean} [params.contentCustomPath] - Specifies a custom redirect path. Default: true.
	 * @param {string} [params.contentPath] - Specifies a custom redirect path. PM variables may appear between '{{' and
	 *   '}}'.
	 * @param {any} [params.netStorageHostname] - When the `actionType` is `RECREATED_NS`, specifies the
	 *   [NetStorage](https://techdocs.akamai.com/netstorage) origin to serve the alternate content. Contact Akamai
	 *   Professional Services for your NetStorage origin's `id`.
	 * @param {string} [params.netStoragePath] - When the `actionType` is `RECREATED_NS`, specifies the path for the
	 *   [NetStorage](https://techdocs.akamai.com/netstorage) request. PM variables may appear between '{{' and '}}'.
	 * @param {string} [params.cexHostname] - Specifies a hostname. PM variables may appear between '{{' and '}}'.
	 * @param {boolean} [params.cexCustomPath] - Specifies a custom path. Default: true.
	 * @param {string} [params.cexPath] - Specifies a custom path. PM variables may appear between '{{' and '}}'.
	 * @param {any} [params.cpCode] - Specifies a CP code for which to log errors for the NetStorage location. You only
	 *   need to provide the initial `id`, stripping any [`cpc_` prefix](ref:id-prefixes) to pass the integer to the
	 *   rule tree. Additional CP code details may reflect back in subsequent read-only data.
	 * @param {200
	 * 	| 404
	 * 	| 500
	 * 	| 100
	 * 	| 101
	 * 	| 102
	 * 	| 103
	 * 	| 122
	 * 	| 201
	 * 	| 202
	 * 	| 203
	 * 	| 204
	 * 	| 205
	 * 	| 206
	 * 	| 207
	 * 	| 226
	 * 	| 400
	 * 	| 401
	 * 	| 402
	 * 	| 403
	 * 	| 405
	 * 	| 406
	 * 	| 407
	 * 	| 408
	 * 	| 409
	 * 	| 410
	 * 	| 411
	 * 	| 412
	 * 	| 413
	 * 	| 414
	 * 	| 415
	 * 	| 416
	 * 	| 417
	 * 	| 422
	 * 	| 423
	 * 	| 424
	 * 	| 425
	 * 	| 426
	 * 	| 428
	 * 	| 429
	 * 	| 431
	 * 	| 444
	 * 	| 449
	 * 	| 450
	 * 	| 499
	 * 	| 501
	 * 	| 502
	 * 	| 503
	 * 	| 504
	 * 	| 505
	 * 	| 506
	 * 	| 507
	 * 	| 509
	 * 	| 510
	 * 	| 511
	 * 	| 598
	 * 	| 599} [params.statusCode]
	 *   - Assigns a new HTTP status code to the failure response. Default: 200.
	 *
	 * @param {boolean} [params.preserveQueryString] - When using either `contentCustomPath`, `cexCustomPath`,
	 *   `dynamicCustomPath`, or `redirectCustomPath` to specify a custom path, enabling this passes in the original
	 *   request's query string as part of the path. Default: true.
	 * @param {boolean} [params.modifyProtocol] - Modifies the redirect's protocol using the value of the `protocol`
	 *   field. Default: false.
	 * @param {'HTTP' | 'HTTPS'} [params.protocol] - When the `actionType` is `REDIRECT` and `modifyProtocol` is
	 *   enabled, this specifies the redirect's protocol. Default: "HTTP".
	 * @param {boolean} [params.allowFCMParentOverride] - 2DO. Default: false.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/site-failover | Akamai Techdocs}
	 */
	setFailAction(params: {
		/** When enabled in case of a failure to contact the origin, the current behavior applies. Default: true. */
		enabled?: boolean;

		/** Specifies the basic action to take when there is a failure to contact the origin. Default: "REDIRECT". */
		actionType?: 'SERVE_STALE' | 'REDIRECT' | 'RECREATED_CO' | 'RECREATED_CEX' | 'RECREATED_NS' | 'DYNAMIC';

		/** Identifies the component of the request that identifies the SaaS dynamic fail action. Default: "HOSTNAME". */
		saasType?: 'HOSTNAME' | 'PATH' | 'QUERY_STRING' | 'COOKIE';

		/**
		 * Specifies whether to use a CNAME chain to determine the hostname for the SaaS dynamic failaction. Default:
		 * false.
		 */
		saasCnameEnabled?: boolean;

		/**
		 * Specifies the number of elements in the CNAME chain backwards from the edge hostname that determines the
		 * hostname for the SaaS dynamic failaction. Default: 1.
		 */
		saasCnameLevel?: number;

		/**
		 * Specifies the name of the cookie that identifies this SaaS dynamic failaction. PM variables may appear
		 * between '{{' and '}}'.
		 */
		saasCookie?: string;

		/**
		 * Specifies the name of the query parameter that identifies this SaaS dynamic failaction. PM variables may
		 * appear between '{{' and '}}'.
		 */
		saasQueryString?: string;

		/**
		 * Specifies the substitution pattern (a Perl-compatible regular expression) that defines the SaaS dynamic
		 * failaction.
		 */
		saasRegex?: string;

		/**
		 * Specifies the replacement pattern that defines the SaaS dynamic failaction. PM variables may appear between
		 * '{{' and '}}'.
		 */
		saasReplace?: string;

		/** Specifies the static portion of the SaaS dynamic failaction. PM variables may appear between '{{' and '}}'. */
		saasSuffix?: string;

		/** Specifies the redirect method. Default: "SERVE_301". */
		dynamicMethod?: 'SERVE_301' | 'SERVE_302' | 'SERVE_ALTERNATE';

		/** Allows you to modify the original requested path. Default: true. */
		dynamicCustomPath?: boolean;

		/** Specifies the new path. PM variables may appear between '{{' and '}}'. */
		dynamicPath?: string;

		/** Whether to preserve or customize the hostname. Default: "ALTERNATE". */
		redirectHostnameType?: 'ORIGINAL' | 'ALTERNATE';

		/**
		 * When the `actionType` is `REDIRECT` and the `redirectHostnameType` is `ALTERNATE`, this specifies the
		 * hostname for the redirect. PM variables may appear between '{{' and '}}'.
		 */
		redirectHostname?: string;

		/** Uses the `redirectPath` to customize a new path. Default: true. */
		redirectCustomPath?: boolean;

		/** Specifies a new path. PM variables may appear between '{{' and '}}'. */
		redirectPath?: string;

		/** Specifies the HTTP response code. Default: 302. */
		redirectMethod?: 302 | 301;

		/** Specifies the static hostname for the alternate redirect. PM variables may appear between '{{' and '}}'. */
		contentHostname?: string;

		/** Specifies a custom redirect path. Default: true. */
		contentCustomPath?: boolean;

		/** Specifies a custom redirect path. PM variables may appear between '{{' and '}}'. */
		contentPath?: string;

		/**
		 * When the `actionType` is `RECREATED_NS`, specifies the [NetStorage](https://techdocs.akamai.com/netstorage)
		 * origin to serve the alternate content. Contact Akamai Professional Services for your NetStorage origin's
		 * `id`.
		 */
		netStorageHostname?: any;

		/**
		 * When the `actionType` is `RECREATED_NS`, specifies the path for the
		 * [NetStorage](https://techdocs.akamai.com/netstorage) request. PM variables may appear between '{{' and '}}'.
		 */
		netStoragePath?: string;

		/** Specifies a hostname. PM variables may appear between '{{' and '}}'. */
		cexHostname?: string;

		/** Specifies a custom path. Default: true. */
		cexCustomPath?: boolean;

		/** Specifies a custom path. PM variables may appear between '{{' and '}}'. */
		cexPath?: string;

		/**
		 * Specifies a CP code for which to log errors for the NetStorage location. You only need to provide the initial
		 * `id`, stripping any [`cpc_` prefix](ref:id-prefixes) to pass the integer to the rule tree. Additional CP code
		 * details may reflect back in subsequent read-only data.
		 */
		cpCode?: any;

		/** Assigns a new HTTP status code to the failure response. Default: 200. */
		statusCode?:
			| 200
			| 404
			| 500
			| 100
			| 101
			| 102
			| 103
			| 122
			| 201
			| 202
			| 203
			| 204
			| 205
			| 206
			| 207
			| 226
			| 400
			| 401
			| 402
			| 403
			| 405
			| 406
			| 407
			| 408
			| 409
			| 410
			| 411
			| 412
			| 413
			| 414
			| 415
			| 416
			| 417
			| 422
			| 423
			| 424
			| 425
			| 426
			| 428
			| 429
			| 431
			| 444
			| 449
			| 450
			| 499
			| 501
			| 502
			| 503
			| 504
			| 505
			| 506
			| 507
			| 509
			| 510
			| 511
			| 598
			| 599;

		/**
		 * When using either `contentCustomPath`, `cexCustomPath`, `dynamicCustomPath`, or `redirectCustomPath` to
		 * specify a custom path, enabling this passes in the original request's query string as part of the path.
		 * Default: true.
		 */
		preserveQueryString?: boolean;

		/** Modifies the redirect's protocol using the value of the `protocol` field. Default: false. */
		modifyProtocol?: boolean;

		/**
		 * When the `actionType` is `REDIRECT` and `modifyProtocol` is enabled, this specifies the redirect's protocol.
		 * Default: "HTTP".
		 */
		protocol?: 'HTTP' | 'HTTPS';

		/** 2DO. Default: false. */
		allowFCMParentOverride?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.actionType === 'undefined' && (params.enabled as unknown) === true) {
			params.actionType = 'REDIRECT';
		}

		if (typeof params.saasType === 'undefined' && (params.actionType as unknown) === 'DYNAMIC') {
			params.saasType = 'HOSTNAME';
		}

		if (typeof params.saasCnameEnabled === 'undefined' && (params.saasType as unknown) === 'HOSTNAME') {
			params.saasCnameEnabled = false;
		}

		if (typeof params.saasCnameLevel === 'undefined' && (params.saasCnameEnabled as unknown) === true) {
			params.saasCnameLevel = 1;
		}

		if (typeof params.dynamicMethod === 'undefined' && (params.actionType as unknown) === 'DYNAMIC') {
			params.dynamicMethod = 'SERVE_301';
		}

		if (typeof params.dynamicCustomPath === 'undefined' && (params.actionType as unknown) === 'DYNAMIC') {
			params.dynamicCustomPath = true;
		}

		if (typeof params.redirectHostnameType === 'undefined' && (params.actionType as unknown) === 'REDIRECT') {
			params.redirectHostnameType = 'ALTERNATE';
		}

		if (typeof params.redirectCustomPath === 'undefined' && (params.actionType as unknown) === 'REDIRECT') {
			params.redirectCustomPath = true;
		}

		if (typeof params.redirectMethod === 'undefined' && (params.actionType as unknown) === 'REDIRECT') {
			params.redirectMethod = 302;
		}

		if (typeof params.contentCustomPath === 'undefined' && (params.actionType as unknown) === 'RECREATED_CO') {
			params.contentCustomPath = true;
		}

		if (typeof params.cexCustomPath === 'undefined' && (params.actionType as unknown) === 'RECREATED_CEX') {
			params.cexCustomPath = true;
		}

		if (typeof params.statusCode === 'undefined' && (params.actionType as unknown) === 'RECREATED_NS') {
			params.statusCode = 200;
		}

		if (
			typeof params.preserveQueryString === 'undefined' &&
			((params.contentCustomPath as unknown) === true ||
				(params.cexCustomPath as unknown) === true ||
				(params.redirectCustomPath as unknown) === true ||
				(params.dynamicCustomPath as unknown) === true)
		) {
			params.preserveQueryString = true;
		}

		if (
			typeof params.modifyProtocol === 'undefined' &&
			((params.actionType as unknown) === 'REDIRECT' ||
				(params.dynamicMethod !== undefined && ['SERVE_301', 'SERVE_302'].includes(params.dynamicMethod)))
		) {
			params.modifyProtocol = false;
		}

		if (typeof params.protocol === 'undefined' && (params.modifyProtocol as unknown) === true) {
			params.protocol = 'HTTP';
		}

		if (typeof params.allowFCMParentOverride === 'undefined') {
			params.allowFCMParentOverride = false;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'BEHAVIOR',
				'failAction',
				{
					allowsVars: [
						'saasCookie',
						'saasQueryString',
						'saasReplace',
						'saasSuffix',
						'dynamicPath',
						'redirectHostname',
						'redirectPath',
						'contentHostname',
						'contentPath',
						'netStoragePath',
						'cexHostname',
						'cexPath',
					],
				},
				params,
			),
		);
	}

	/**
	 * Monitors the health of your origin server by tracking unsuccessful attempts to contact it. Use this behavior to
	 * keep end users from having to wait several seconds before a forwarded request times out, or to reduce requests on
	 * the origin server when it is unavailable. When client requests are forwarded to the origin, the edge server
	 * tracks the number of attempts to connect to each IP address. It cycles through IP addresses in
	 * least-recently-tested order to avoid hitting the same one twice in a row. If the number of consecutive
	 * unsuccessful tests reaches a threshold you specify, the behavior identifies the address as faulty and stops
	 * sending requests. The edge server returns an error message to the end user or else triggers any [`failAction`](#)
	 * behavior you specify.
	 *
	 * @param {object} params - The parameters needed to configure setHealthDetection
	 * @param {number} [params.retryCount] - The number of consecutive connection failures that mark an IP address as
	 *   faulty. Default: 3.
	 * @param {string} [params.retryInterval] - Specifies the amount of time the edge server will wait before trying to
	 *   reconnect to an IP address it has already identified as faulty. Default: "60s".
	 * @param {number} [params.maximumReconnects] - Specifies the maximum number of times the edge server will contact
	 *   your origin server. If your origin is associated with several IP addresses, `maximumReconnects` effectively
	 *   overrides the value of `retryCount`. Default: 3.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/origin-health-detect | Akamai Techdocs}
	 */
	setHealthDetection(params: {
		/** The number of consecutive connection failures that mark an IP address as faulty. Default: 3. */
		retryCount?: number;

		/**
		 * Specifies the amount of time the edge server will wait before trying to reconnect to an IP address it has
		 * already identified as faulty. Default: "60s".
		 */
		retryInterval?: string;

		/**
		 * Specifies the maximum number of times the edge server will contact your origin server. If your origin is
		 * associated with several IP addresses, `maximumReconnects` effectively overrides the value of `retryCount`.
		 * Default: 3.
		 */
		maximumReconnects?: number;
	}): Property {
		if (typeof params.retryCount === 'undefined') {
			params.retryCount = 3;
		}

		if (typeof params.retryInterval === 'undefined') {
			params.retryInterval = '60s';
		}

		if (typeof params.maximumReconnects === 'undefined') {
			params.maximumReconnects = 3;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'healthDetection', {}, params));
	}

	/**
	 * This behavior implements the [Site Shield](https://techdocs.akamai.com/site-shield) feature, which helps prevent
	 * non-Akamai machines from contacting your origin. You get an email with a list of Akamai servers allowed to
	 * contact your origin, with which you establish an Access Control List on your firewall to prevent any other
	 * requests.
	 *
	 * @param {object} params - The parameters needed to configure setSiteShield
	 * @param {any} params.ssmap - Identifies the hostname for the Site Shield map. See [Create a Site Shield
	 *   map](https://techdocs.akamai.com/site-shield/docs/create-a-site-shield-map) for more details. Form an object
	 *   with a `value` key that references the hostname, for example: `"ssmap":{"value":"ss.akamai.net"}`.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/siteshield-beh | Akamai Techdocs}
	 */
	setSiteShield(params: {
		/**
		 * Identifies the hostname for the Site Shield map. See [Create a Site Shield
		 * map](https://techdocs.akamai.com/site-shield/docs/create-a-site-shield-map) for more details. Form an object
		 * with a `value` key that references the hostname, for example: `"ssmap":{"value":"ss.akamai.net"}`.
		 */
		ssmap: any;
	}): Property {
		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'siteShield', {}, params));
	}

	/**
	 * This behavior allows standard TLS domain validated certificates to renew automatically. Apply it after using the
	 * [Certificate Provisioning System](https://techdocs.akamai.com/cps) to request a certificate for a hostname. To
	 * provision certificates programmatically, see the [Certificate Provisioning System
	 * API](https://techdocs.akamai.com/cps/reference). This behavior does not affect hostnames that use enhanced TLS
	 * certificates.
	 *
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/auto-domain-val | Akamai Techdocs}
	 */
	setAutoDomainValidation(): Property {
		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'autoDomainValidation', {}, {}));
	}

	/**
	 * Ensures unresponsive linked JavaScript files do not prevent HTML pages from loading.
	 *
	 * @param {object} params - The parameters needed to configure setScriptManagement
	 * @param {boolean} [params.enabled] - Enables the Script Management feature. Default: true.
	 * @param {'YES_SERVICE_WORKER' | 'NO_SERVICE_WORKER'} [params.serviceworker] - Script Management uses a JavaScript
	 *   service worker called `akam-sw.js`. It applies a policy that helps you manage scripts. Default:
	 *   "YES_SERVICE_WORKER".
	 * @param {number} [params.timestamp] - A read-only epoch timestamp that represents the last time a Script
	 *   Management policy was synchronized with its Ion property. Default: 0.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/script-mgmt | Akamai Techdocs}
	 */
	setScriptManagement(params: {
		/** Enables the Script Management feature. Default: true. */
		enabled?: boolean;

		/**
		 * Script Management uses a JavaScript service worker called `akam-sw.js`. It applies a policy that helps you
		 * manage scripts. Default: "YES_SERVICE_WORKER".
		 */
		serviceworker?: 'YES_SERVICE_WORKER' | 'NO_SERVICE_WORKER';

		/**
		 * A read-only epoch timestamp that represents the last time a Script Management policy was synchronized with
		 * its Ion property. Default: 0.
		 */
		timestamp?: number;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.serviceworker === 'undefined' && (params.enabled as unknown) === true) {
			params.serviceworker = 'YES_SERVICE_WORKER';
		}

		if (typeof params.timestamp === 'undefined' && (params.enabled as unknown) === 'never visible') {
			params.timestamp = 0;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'scriptManagement', {}, params));
	}

	/**
	 * Respond to the client request with a redirect without contacting the origin. This behavior fills the same need as
	 * [`redirect`](#), but allows you to use [variables](ref:variables) to express the redirect `destination`'s
	 * component values more concisely.
	 *
	 * @param {object} params - The parameters needed to configure setRedirectplus
	 * @param {boolean} [params.enabled] - Enables the redirect feature. Default: true.
	 * @param {string} [params.destination] - Specifies the redirect as a path expression starting with a `/` character
	 *   relative to the current root, or as a fully qualified URL. Optionally inject variables, as in this example that
	 *   refers to the original request's filename: `/path/to/{{builtin.AK_FILENAME}}`. Default:
	 *   "{{builtin.AK_SCHEME}}://{{builtin.AK_HOST}}{{builtin.AK_PATH}}". PM variables may appear between '{{' and
	 *   '}}'.
	 * @param {301 | 302 | 303 | 307} [params.responseCode] - Assigns the status code for the redirect response.
	 *   Default: 302.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/redirect-plus | Akamai Techdocs}
	 */
	setRedirectplus(params: {
		/** Enables the redirect feature. Default: true. */
		enabled?: boolean;

		/**
		 * Specifies the redirect as a path expression starting with a `/` character relative to the current root, or as
		 * a fully qualified URL. Optionally inject variables, as in this example that refers to the original request's
		 * filename: `/path/to/{{builtin.AK_FILENAME}}`. Default:
		 * "{{builtin.AK_SCHEME}}://{{builtin.AK_HOST}}{{builtin.AK_PATH}}". PM variables may appear between '{{' and
		 * '}}'.
		 */
		destination?: string;

		/** Assigns the status code for the redirect response. Default: 302. */
		responseCode?: 301 | 302 | 303 | 307;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.destination === 'undefined' && (params.enabled as unknown) === true) {
			params.destination = '{{builtin.AK_SCHEME}}://{{builtin.AK_HOST}}{{builtin.AK_PATH}}';
		}

		if (typeof params.responseCode === 'undefined' && (params.enabled as unknown) === true) {
			params.responseCode = 302;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'redirectplus', {allowsVars: ['destination']}, params),
		);
	}

	/**
	 * Modify a variable to insert into subsequent fields within the rule tree. Use this behavior to specify the
	 * predeclared `variableName` and determine from where to derive its new value. Based on this `valueSource`, you can
	 * either generate the value, extract it from some part of the incoming request, assign it from another variable
	 * (including a set of built-in system variables), or directly specify its text. Optionally choose a `transform`
	 * function to modify the value once. See [Support for variables](ref:variables) for more information.
	 *
	 * @param {object} params - The parameters needed to configure setSetVariable
	 * @param {string} params.variableName - Specifies the predeclared root name of the variable to modify. When you
	 *   declare a variable name such as `VAR`, its name is preprended with `PMUSER_` and accessible in a `user`
	 *   namespace, so that you invoke it in subsequent text fields within the rule tree as `{{user.PMUSER_VAR}}`. In
	 *   deployed [XML metadata](ref:get-property-version), it appears as `%(PMUSER_VAR)`.
	 * @param {'EXPRESSION' | 'EXTRACT' | 'GENERATE'} [params.valueSource] - Determines how you want to set the value.
	 *   Default: "EXPRESSION".
	 * @param {string} [params.variableValue] - This directly specifies the value to assign to the variable. The
	 *   expression may include a mix of static text and other variables, such as
	 *   `new_filename.{{builtin.AK_EXTENSION}}` to embed a system variable. PM variables may appear between '{{' and
	 *   '}}'.
	 * @param {'CLIENT_CERTIFICATE'
	 * 	| 'CLIENT_REQUEST_HEADER'
	 * 	| 'COOKIE'
	 * 	| 'EDGESCAPE'
	 * 	| 'PATH_COMPONENT_OFFSET'
	 * 	| 'QUERY_STRING'
	 * 	| 'DEVICE_PROFILE'
	 * 	| 'RESPONSE_HEADER'
	 * 	| 'SET_COOKIE'} [params.extractLocation]
	 *   - This specifies from where to get the value. Default: "CLIENT_REQUEST_HEADER".
	 *
	 * @param {'VERSION'
	 * 	| 'SERIAL'
	 * 	| 'FINGERPRINT_MD5'
	 * 	| 'FINGERPRINT_SHA1'
	 * 	| 'FINGERPRINT_DYN'
	 * 	| 'ISSUER_DN'
	 * 	| 'SUBJECT_DN'
	 * 	| 'NOT_BEFORE'
	 * 	| 'NOT_AFTER'
	 * 	| 'SIGNATURE_ALGORITHM'
	 * 	| 'SIGNATURE'
	 * 	| 'CONTENTS_DER'
	 * 	| 'CONTENTS_PEM'
	 * 	| 'CONTENTS_PEM_NO_LABELS'
	 * 	| 'COUNT'
	 * 	| 'STATUS_MSG'
	 * 	| 'KEY_LENGTH'} [params.certificateFieldName]
	 *   - Specifies the certificate's content. Default: "KEY_LENGTH".
	 *
	 * @param {string} [params.headerName] - Specifies the case-insensitive name of the HTTP header to extract. PM
	 *   variables may appear between '{{' and '}}'.
	 * @param {string} [params.responseHeaderName] - Specifies the case-insensitive name of the HTTP header to extract.
	 *   PM variables may appear between '{{' and '}}'.
	 * @param {string} [params.setCookieName] - Specifies the name of the origin's `Set-Cookie` response header. PM
	 *   variables may appear between '{{' and '}}'.
	 * @param {string} [params.cookieName] - Specifies the name of the cookie to extract. PM variables may appear
	 *   between '{{' and '}}'.
	 * @param {'GEOREGION'
	 * 	| 'COUNTRY_CODE'
	 * 	| 'REGION_CODE'
	 * 	| 'CITY'
	 * 	| 'DMA'
	 * 	| 'PMSA'
	 * 	| 'MSA'
	 * 	| 'AREACODE'
	 * 	| 'COUNTY'
	 * 	| 'FIPS'
	 * 	| 'LAT'
	 * 	| 'LONG'
	 * 	| 'TIMEZONE'
	 * 	| 'ZIP'
	 * 	| 'CONTINENT'
	 * 	| 'NETWORK'
	 * 	| 'NETWORK_TYPE'
	 * 	| 'ASNUM'
	 * 	| 'THROUGHPUT'
	 * 	| 'BW'} [params.locationId]
	 *   - Specifies the `X-Akamai-Edgescape` header's field name. Possible values specify basic geolocation, various
	 *       geographic standards, and information about the client's network. For details on EdgeScape header fields,
	 *       see the [EdgeScape User
	 *       Guide](https://control.akamai.com/apps/download-center/#/products/3;name=EdgeScape). Default:
	 *       "COUNTRY_CODE".
	 *
	 * @param {string} [params.pathComponentOffset] - This specifies a portion of the path. The indexing starts from
	 *   `1`, so a value of `/path/to/nested/filename.html` and an offset of `1` yields `path`, and `3` yields `nested`.
	 *   Negative indexes offset from the right, so `-2` also yields `nested`. PM variables may appear between '{{' and
	 *   '}}'.
	 * @param {string} [params.queryParameterName] - Specifies the name of the query parameter from which to extract the
	 *   value. PM variables may appear between '{{' and '}}'.
	 * @param {'HEXRAND' | 'RAND'} [params.generator] - This specifies the type of value to generate. Default: "RAND".
	 * @param {number} [params.numberOfBytes] - Specifies the number of random hex bytes to generate. Default: 16.
	 * @param {number} [params.minRandomNumber] - Specifies the lower bound of the random number. Default: 0.
	 * @param {number} [params.maxRandomNumber] - Specifies the upper bound of the random number. Default: 4294967295.
	 * @param {'NONE'
	 * 	| 'ADD'
	 * 	| 'BASE_64_DECODE'
	 * 	| 'BASE_64_ENCODE'
	 * 	| 'BASE_32_DECODE'
	 * 	| 'BASE_32_ENCODE'
	 * 	| 'BITWISE_AND'
	 * 	| 'BITWISE_NOT'
	 * 	| 'BITWISE_OR'
	 * 	| 'BITWISE_XOR'
	 * 	| 'DECIMAL_TO_HEX'
	 * 	| 'DECRYPT'
	 * 	| 'DIVIDE'
	 * 	| 'ENCRYPT'
	 * 	| 'EPOCH_TO_STRING'
	 * 	| 'EXTRACT_PARAM'
	 * 	| 'HASH'
	 * 	| 'JSON_EXTRACT'
	 * 	| 'HEX_TO_DECIMAL'
	 * 	| 'HEX_DECODE'
	 * 	| 'HEX_ENCODE'
	 * 	| 'HMAC'
	 * 	| 'LOWER'
	 * 	| 'MD5'
	 * 	| 'MINUS'
	 * 	| 'MODULO'
	 * 	| 'MULTIPLY'
	 * 	| 'NORMALIZE_PATH_WIN'
	 * 	| 'REMOVE_WHITESPACE'
	 * 	| 'COMPRESS_WHITESPACE'
	 * 	| 'SHA_1'
	 * 	| 'SHA_256'
	 * 	| 'STRING_INDEX'
	 * 	| 'STRING_LENGTH'
	 * 	| 'STRING_TO_EPOCH'
	 * 	| 'SUBSTITUTE'
	 * 	| 'SUBSTRING'
	 * 	| 'SUBTRACT'
	 * 	| 'TRIM'
	 * 	| 'UPPER'
	 * 	| 'BASE_64_URL_DECODE'
	 * 	| 'BASE_64_URL_ENCODE'
	 * 	| 'URL_DECODE'
	 * 	| 'URL_ENCODE'
	 * 	| 'URL_DECODE_UNI'
	 * 	| 'UTC_SECONDS'
	 * 	| 'XML_DECODE'
	 * 	| 'XML_ENCODE'} [params.transform]
	 *   - Specifies a function to transform the value. For more details on each transform function, see [Set Variable:
	 *       Operations](doc:set-var-op). Default: "NONE".
	 *
	 * @param {string} [params.operandOne] - Specifies an additional operand when the `transform` function is set to
	 *   various arithmetic functions (`ADD`, `SUBTRACT`, `MULTIPLY`, `DIVIDE`, or `MODULO`) or bitwise functions
	 *   (`BITWISE_AND`, `BITWISE_OR`, or `BITWISE_XOR`). PM variables may appear between '{{' and '}}'.
	 * @param {'ALG_3DES' | 'ALG_AES128' | 'ALG_AES256'} [params.algorithm] - Specifies the algorithm to apply. Default:
	 *   "ALG_3DES".
	 * @param {string} [params.encryptionKey] - Specifies the encryption hex key. For `ALG_3DES` it needs to be 48
	 *   characters long, 32 characters for `ALG_AES128`, and 64 characters for `ALG_AES256`. PM variables may appear
	 *   between '{{' and '}}'.
	 * @param {string} [params.initializationVector] - Specifies a one-time number as an initialization vector. It needs
	 *   to be 15 characters long for `ALG_3DES`, and 32 characters for both `ALG_AES128` and `ALG_AES256`.
	 * @param {'CBC' | 'ECB'} [params.encryptionMode] - Specifies the encryption mode. Default: "CBC".
	 * @param {string} [params.nonce] - Specifies the one-time number used for encryption. PM variables may appear
	 *   between '{{' and '}}'.
	 * @param {boolean} [params.prependBytes] - Specifies a number of random bytes to prepend to the key. Default: true.
	 * @param {string} [params.formatString] - Specifies an optional format string for the conversion, using format
	 *   codes such as `%m/%d/%y` as specified by [`strftime`](http://man7.org/linux/man-pages/man3/strftime.3.html). A
	 *   blank value defaults to RFC-2616 format.
	 * @param {string} [params.paramName] - Extracts the value for the specified parameter name from a string that
	 *   contains key/value pairs. (Use `separator` below to parse them.) PM variables may appear between '{{' and
	 *   '}}'.
	 * @param {string} [params.separator] - Specifies the character that separates pairs of values within the string.
	 * @param {number} [params.min] - Specifies a minimum value for the generated integer. Default: 0.
	 * @param {number} [params.max] - Specifies a maximum value for the generated integer. Default: 4294967294.
	 * @param {string} [params.hmacKey] - Specifies the secret to use in generating the base64-encoded digest. PM
	 *   variables may appear between '{{' and '}}'.
	 * @param {'SHA1' | 'SHA256' | 'MD5'} [params.hmacAlgorithm] - Specifies the algorithm to use to generate the
	 *   base64-encoded digest. Default: "SHA1".
	 * @param {'IPV4' | 'IPV6'} [params.ipVersion] - Specifies the IP version under which a subnet mask generates.
	 *   Default: "IPV4".
	 * @param {number} [params.ipv6Prefix] - Specifies the prefix of the IPV6 address, a value between 0 and 128.
	 *   Default: 128.
	 * @param {number} [params.ipv4Prefix] - Specifies the prefix of the IPV4 address, a value between 0 and 32.
	 *   Default: 32.
	 * @param {string} [params.subString] - Specifies a substring for which the returned value represents a zero-based
	 *   offset of where it appears in the original string, or `-1` if there's no match. PM variables may appear between
	 *   '{{' and '}}'.
	 * @param {string} [params.regex] - Specifies the regular expression pattern (PCRE) to match the value.
	 * @param {string} [params.replacement] - Specifies the replacement string. Reinsert grouped items from the match
	 *   into the replacement using `$1`, `$2` ... `$n`. PM variables may appear between '{{' and '}}'.
	 * @param {boolean} [params.caseSensitive] - Enabling this makes all matches case sensitive. Default: true.
	 * @param {boolean} [params.globalSubstitution] - Replaces all matches in the string, not just the first. Default:
	 *   false.
	 * @param {number} [params.startIndex] - Specifies the zero-based character offset at the start of the substring.
	 *   Negative indexes specify the offset from the end of the string. Consider this example for a string of
	 *   `abcdefghij`: `startIndex` = 0, `endIndex` = 1, result = `a` `startIndex` = 0, `endIndex` = 2, Result = `ab`
	 *   `startIndex` = 1, `endIndex` = 1, Result = `<null>` `startIndex` = 1, `endIndex` = 2, Result = `b` `startIndex`
	 *   = 3, `endIndex` = -1, Result = `defghij` `startIndex` = -2, `endIndex` = -1, Result = `j`
	 * @param {number} [params.endIndex] - Specifies the zero-based character offset at the end of the substring,
	 *   without including the character at that index position. Negative indexes specify the offset from the end of the
	 *   string. Consider this example for a string of `abcdefghij`: `startIndex` = 0, `endIndex` = 1, result = `a`
	 *   `startIndex` = 0, `endIndex` = 2, Result = `ab` `startIndex` = 1, `endIndex` = 1, Result = `<null>`
	 *   `startIndex` = 1, `endIndex` = 2, Result = `b` `startIndex` = 3, `endIndex` = -1, Result = `defghij`
	 *   `startIndex` = -2, `endIndex` = -1, Result = `j`
	 * @param {string} [params.exceptChars] - Specifies characters _not_ to encode, possibly overriding the default set.
	 * @param {string} [params.forceChars] - Specifies characters to encode, possibly overriding the default set.
	 * @param {'IS_MOBILE'
	 * 	| 'IS_TABLET'
	 * 	| 'IS_WIRELESS_DEVICE'
	 * 	| 'PHYSICAL_SCREEN_HEIGHT'
	 * 	| 'PHYSICAL_SCREEN_WIDTH'
	 * 	| 'RESOLUTION_HEIGHT'
	 * 	| 'RESOLUTION_WIDTH'
	 * 	| 'VIEWPORT_WIDTH'
	 * 	| 'BRAND_NAME'
	 * 	| 'DEVICE_OS'
	 * 	| 'DEVICE_OS_VERSION'
	 * 	| 'DUAL_ORIENTATION'
	 * 	| 'MAX_IMAGE_HEIGHT'
	 * 	| 'MAX_IMAGE_WIDTH'
	 * 	| 'MOBILE_BROWSER'
	 * 	| 'MOBILE_BROWSER_VERSION'
	 * 	| 'PDF_SUPPORT'
	 * 	| 'COOKIE_SUPPORT'} [params.deviceProfile]
	 *   - Specifies the client device attribute. Possible values specify information about the client device, including
	 *       device type, size and browser. For details on fields, see [Device
	 *       Characterization](https://techdocs.akamai.com/ion/docs/device-characterization-ion). Default: "IS_MOBILE".
	 *
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/set-var-beh | Akamai Techdocs}
	 */
	setSetVariable(params: {
		/**
		 * Specifies the predeclared root name of the variable to modify. When you declare a variable name such as
		 * `VAR`, its name is preprended with `PMUSER_` and accessible in a `user` namespace, so that you invoke it in
		 * subsequent text fields within the rule tree as `{{user.PMUSER_VAR}}`. In deployed [XML
		 * metadata](ref:get-property-version), it appears as `%(PMUSER_VAR)`.
		 */
		variableName: string;

		/** Determines how you want to set the value. Default: "EXPRESSION". */
		valueSource?: 'EXPRESSION' | 'EXTRACT' | 'GENERATE';

		/**
		 * This directly specifies the value to assign to the variable. The expression may include a mix of static text
		 * and other variables, such as `new_filename.{{builtin.AK_EXTENSION}}` to embed a system variable. PM variables
		 * may appear between '{{' and '}}'.
		 */
		variableValue?: string;

		/** This specifies from where to get the value. Default: "CLIENT_REQUEST_HEADER". */
		extractLocation?:
			| 'CLIENT_CERTIFICATE'
			| 'CLIENT_REQUEST_HEADER'
			| 'COOKIE'
			| 'EDGESCAPE'
			| 'PATH_COMPONENT_OFFSET'
			| 'QUERY_STRING'
			| 'DEVICE_PROFILE'
			| 'RESPONSE_HEADER'
			| 'SET_COOKIE';

		/** Specifies the certificate's content. Default: "KEY_LENGTH". */
		certificateFieldName?:
			| 'VERSION'
			| 'SERIAL'
			| 'FINGERPRINT_MD5'
			| 'FINGERPRINT_SHA1'
			| 'FINGERPRINT_DYN'
			| 'ISSUER_DN'
			| 'SUBJECT_DN'
			| 'NOT_BEFORE'
			| 'NOT_AFTER'
			| 'SIGNATURE_ALGORITHM'
			| 'SIGNATURE'
			| 'CONTENTS_DER'
			| 'CONTENTS_PEM'
			| 'CONTENTS_PEM_NO_LABELS'
			| 'COUNT'
			| 'STATUS_MSG'
			| 'KEY_LENGTH';

		/**
		 * Specifies the case-insensitive name of the HTTP header to extract. PM variables may appear between '{{' and
		 * '}}'.
		 */
		headerName?: string;

		/**
		 * Specifies the case-insensitive name of the HTTP header to extract. PM variables may appear between '{{' and
		 * '}}'.
		 */
		responseHeaderName?: string;

		/**
		 * Specifies the name of the origin's `Set-Cookie` response header. PM variables may appear between '{{' and
		 * '}}'.
		 */
		setCookieName?: string;

		/** Specifies the name of the cookie to extract. PM variables may appear between '{{' and '}}'. */
		cookieName?: string;

		/**
		 * Specifies the `X-Akamai-Edgescape` header's field name. Possible values specify basic geolocation, various
		 * geographic standards, and information about the client's network. For details on EdgeScape header fields, see
		 * the [EdgeScape User Guide](https://control.akamai.com/apps/download-center/#/products/3;name=EdgeScape).
		 * Default: "COUNTRY_CODE".
		 */
		locationId?:
			| 'GEOREGION'
			| 'COUNTRY_CODE'
			| 'REGION_CODE'
			| 'CITY'
			| 'DMA'
			| 'PMSA'
			| 'MSA'
			| 'AREACODE'
			| 'COUNTY'
			| 'FIPS'
			| 'LAT'
			| 'LONG'
			| 'TIMEZONE'
			| 'ZIP'
			| 'CONTINENT'
			| 'NETWORK'
			| 'NETWORK_TYPE'
			| 'ASNUM'
			| 'THROUGHPUT'
			| 'BW';

		/**
		 * This specifies a portion of the path. The indexing starts from `1`, so a value of
		 * `/path/to/nested/filename.html` and an offset of `1` yields `path`, and `3` yields `nested`. Negative indexes
		 * offset from the right, so `-2` also yields `nested`. PM variables may appear between '{{' and '}}'.
		 */
		pathComponentOffset?: string;

		/**
		 * Specifies the name of the query parameter from which to extract the value. PM variables may appear between
		 * '{{' and '}}'.
		 */
		queryParameterName?: string;

		/** This specifies the type of value to generate. Default: "RAND". */
		generator?: 'HEXRAND' | 'RAND';

		/** Specifies the number of random hex bytes to generate. Default: 16. */
		numberOfBytes?: number;

		/** Specifies the lower bound of the random number. Default: 0. */
		minRandomNumber?: number;

		/** Specifies the upper bound of the random number. Default: 4294967295. */
		maxRandomNumber?: number;

		/**
		 * Specifies a function to transform the value. For more details on each transform function, see [Set Variable:
		 * Operations](doc:set-var-op). Default: "NONE".
		 */
		transform?:
			| 'NONE'
			| 'ADD'
			| 'BASE_64_DECODE'
			| 'BASE_64_ENCODE'
			| 'BASE_32_DECODE'
			| 'BASE_32_ENCODE'
			| 'BITWISE_AND'
			| 'BITWISE_NOT'
			| 'BITWISE_OR'
			| 'BITWISE_XOR'
			| 'DECIMAL_TO_HEX'
			| 'DECRYPT'
			| 'DIVIDE'
			| 'ENCRYPT'
			| 'EPOCH_TO_STRING'
			| 'EXTRACT_PARAM'
			| 'HASH'
			| 'JSON_EXTRACT'
			| 'HEX_TO_DECIMAL'
			| 'HEX_DECODE'
			| 'HEX_ENCODE'
			| 'HMAC'
			| 'LOWER'
			| 'MD5'
			| 'MINUS'
			| 'MODULO'
			| 'MULTIPLY'
			| 'NORMALIZE_PATH_WIN'
			| 'REMOVE_WHITESPACE'
			| 'COMPRESS_WHITESPACE'
			| 'SHA_1'
			| 'SHA_256'
			| 'STRING_INDEX'
			| 'STRING_LENGTH'
			| 'STRING_TO_EPOCH'
			| 'SUBSTITUTE'
			| 'SUBSTRING'
			| 'SUBTRACT'
			| 'TRIM'
			| 'UPPER'
			| 'BASE_64_URL_DECODE'
			| 'BASE_64_URL_ENCODE'
			| 'URL_DECODE'
			| 'URL_ENCODE'
			| 'URL_DECODE_UNI'
			| 'UTC_SECONDS'
			| 'XML_DECODE'
			| 'XML_ENCODE';

		/**
		 * Specifies an additional operand when the `transform` function is set to various arithmetic functions (`ADD`,
		 * `SUBTRACT`, `MULTIPLY`, `DIVIDE`, or `MODULO`) or bitwise functions (`BITWISE_AND`, `BITWISE_OR`, or
		 * `BITWISE_XOR`). PM variables may appear between '{{' and '}}'.
		 */
		operandOne?: string;

		/** Specifies the algorithm to apply. Default: "ALG_3DES". */
		algorithm?: 'ALG_3DES' | 'ALG_AES128' | 'ALG_AES256';

		/**
		 * Specifies the encryption hex key. For `ALG_3DES` it needs to be 48 characters long, 32 characters for
		 * `ALG_AES128`, and 64 characters for `ALG_AES256`. PM variables may appear between '{{' and '}}'.
		 */
		encryptionKey?: string;

		/**
		 * Specifies a one-time number as an initialization vector. It needs to be 15 characters long for `ALG_3DES`,
		 * and 32 characters for both `ALG_AES128` and `ALG_AES256`.
		 */
		initializationVector?: string;

		/** Specifies the encryption mode. Default: "CBC". */
		encryptionMode?: 'CBC' | 'ECB';

		/** Specifies the one-time number used for encryption. PM variables may appear between '{{' and '}}'. */
		nonce?: string;

		/** Specifies a number of random bytes to prepend to the key. Default: true. */
		prependBytes?: boolean;

		/**
		 * Specifies an optional format string for the conversion, using format codes such as `%m/%d/%y` as specified by
		 * [`strftime`](http://man7.org/linux/man-pages/man3/strftime.3.html). A blank value defaults to RFC-2616
		 * format.
		 */
		formatString?: string;

		/**
		 * Extracts the value for the specified parameter name from a string that contains key/value pairs. (Use
		 * `separator` below to parse them.) PM variables may appear between '{{' and '}}'.
		 */
		paramName?: string;

		/** Specifies the character that separates pairs of values within the string. */
		separator?: string;

		/** Specifies a minimum value for the generated integer. Default: 0. */
		min?: number;

		/** Specifies a maximum value for the generated integer. Default: 4294967294. */
		max?: number;

		/**
		 * Specifies the secret to use in generating the base64-encoded digest. PM variables may appear between '{{' and
		 * '}}'.
		 */
		hmacKey?: string;

		/** Specifies the algorithm to use to generate the base64-encoded digest. Default: "SHA1". */
		hmacAlgorithm?: 'SHA1' | 'SHA256' | 'MD5';

		/** Specifies the IP version under which a subnet mask generates. Default: "IPV4". */
		ipVersion?: 'IPV4' | 'IPV6';

		/** Specifies the prefix of the IPV6 address, a value between 0 and 128. Default: 128. */
		ipv6Prefix?: number;

		/** Specifies the prefix of the IPV4 address, a value between 0 and 32. Default: 32. */
		ipv4Prefix?: number;

		/**
		 * Specifies a substring for which the returned value represents a zero-based offset of where it appears in the
		 * original string, or `-1` if there's no match. PM variables may appear between '{{' and '}}'.
		 */
		subString?: string;

		/** Specifies the regular expression pattern (PCRE) to match the value. */
		regex?: string;

		/**
		 * Specifies the replacement string. Reinsert grouped items from the match into the replacement using `$1`, `$2`
		 * ... `$n`. PM variables may appear between '{{' and '}}'.
		 */
		replacement?: string;

		/** Enabling this makes all matches case sensitive. Default: true. */
		caseSensitive?: boolean;

		/** Replaces all matches in the string, not just the first. Default: false. */
		globalSubstitution?: boolean;

		/**
		 * Specifies the zero-based character offset at the start of the substring. Negative indexes specify the offset
		 * from the end of the string. Consider this example for a string of `abcdefghij`: `startIndex` = 0, `endIndex`
		 * = 1, result = `a` `startIndex` = 0, `endIndex` = 2, Result = `ab` `startIndex` = 1, `endIndex` = 1, Result =
		 * `<null>` `startIndex` = 1, `endIndex` = 2, Result = `b` `startIndex` = 3, `endIndex` = -1, Result = `defghij`
		 * `startIndex` = -2, `endIndex` = -1, Result = `j`
		 */
		startIndex?: number;

		/**
		 * Specifies the zero-based character offset at the end of the substring, without including the character at
		 * that index position. Negative indexes specify the offset from the end of the string. Consider this example
		 * for a string of `abcdefghij`: `startIndex` = 0, `endIndex` = 1, result = `a` `startIndex` = 0, `endIndex` =
		 * 2, Result = `ab` `startIndex` = 1, `endIndex` = 1, Result = `<null>` `startIndex` = 1, `endIndex` = 2, Result
		 * = `b` `startIndex` = 3, `endIndex` = -1, Result = `defghij` `startIndex` = -2, `endIndex` = -1, Result = `j`
		 */
		endIndex?: number;

		/** Specifies characters _not_ to encode, possibly overriding the default set. */
		exceptChars?: string;

		/** Specifies characters to encode, possibly overriding the default set. */
		forceChars?: string;

		/**
		 * Specifies the client device attribute. Possible values specify information about the client device, including
		 * device type, size and browser. For details on fields, see [Device
		 * Characterization](https://techdocs.akamai.com/ion/docs/device-characterization-ion). Default: "IS_MOBILE".
		 */
		deviceProfile?:
			| 'IS_MOBILE'
			| 'IS_TABLET'
			| 'IS_WIRELESS_DEVICE'
			| 'PHYSICAL_SCREEN_HEIGHT'
			| 'PHYSICAL_SCREEN_WIDTH'
			| 'RESOLUTION_HEIGHT'
			| 'RESOLUTION_WIDTH'
			| 'VIEWPORT_WIDTH'
			| 'BRAND_NAME'
			| 'DEVICE_OS'
			| 'DEVICE_OS_VERSION'
			| 'DUAL_ORIENTATION'
			| 'MAX_IMAGE_HEIGHT'
			| 'MAX_IMAGE_WIDTH'
			| 'MOBILE_BROWSER'
			| 'MOBILE_BROWSER_VERSION'
			| 'PDF_SUPPORT'
			| 'COOKIE_SUPPORT';
	}): Property {
		if (typeof params.valueSource === 'undefined') {
			params.valueSource = 'EXPRESSION';
		}

		if (typeof params.extractLocation === 'undefined' && (params.valueSource as unknown) === 'EXTRACT') {
			params.extractLocation = 'CLIENT_REQUEST_HEADER';
		}

		if (
			typeof params.certificateFieldName === 'undefined' &&
			(params.extractLocation as unknown) === 'CLIENT_CERTIFICATE'
		) {
			params.certificateFieldName = 'KEY_LENGTH';
		}

		if (typeof params.locationId === 'undefined' && (params.extractLocation as unknown) === 'EDGESCAPE') {
			params.locationId = 'COUNTRY_CODE';
		}

		if (typeof params.generator === 'undefined' && (params.valueSource as unknown) === 'GENERATE') {
			params.generator = 'RAND';
		}

		if (typeof params.numberOfBytes === 'undefined' && (params.generator as unknown) === 'HEXRAND') {
			params.numberOfBytes = 16;
		}

		if (typeof params.minRandomNumber === 'undefined' && (params.generator as unknown) === 'RAND') {
			params.minRandomNumber = 0;
		}

		if (typeof params.maxRandomNumber === 'undefined' && (params.generator as unknown) === 'RAND') {
			params.maxRandomNumber = 4294967295;
		}

		if (typeof params.transform === 'undefined') {
			params.transform = 'NONE';
		}

		if (
			typeof params.algorithm === 'undefined' &&
			params.transform !== undefined &&
			['ENCRYPT', 'DECRYPT'].includes(params.transform)
		) {
			params.algorithm = 'ALG_3DES';
		}

		if (
			typeof params.encryptionMode === 'undefined' &&
			params.transform !== undefined &&
			['ENCRYPT', 'DECRYPT'].includes(params.transform)
		) {
			params.encryptionMode = 'CBC';
		}

		if (
			typeof params.prependBytes === 'undefined' &&
			params.transform !== undefined &&
			['ENCRYPT', 'DECRYPT'].includes(params.transform)
		) {
			params.prependBytes = true;
		}

		if (typeof params.min === 'undefined' && (params.transform as unknown) === 'HASH') {
			params.min = 0;
		}

		if (typeof params.max === 'undefined' && (params.transform as unknown) === 'HASH') {
			params.max = 4294967294;
		}

		if (typeof params.hmacAlgorithm === 'undefined' && (params.transform as unknown) === 'HMAC') {
			params.hmacAlgorithm = 'SHA1';
		}

		if (typeof params.ipVersion === 'undefined' && (params.transform as unknown) === 'NETMASK') {
			params.ipVersion = 'IPV4';
		}

		if (typeof params.ipv6Prefix === 'undefined' && (params.ipVersion as unknown) === 'IPV6') {
			params.ipv6Prefix = 128;
		}

		if (typeof params.ipv4Prefix === 'undefined' && (params.ipVersion as unknown) === 'IPV4') {
			params.ipv4Prefix = 32;
		}

		if (
			typeof params.caseSensitive === 'undefined' &&
			params.transform !== undefined &&
			['EXTRACT_PARAM', 'SUBSTITUTE'].includes(params.transform)
		) {
			params.caseSensitive = true;
		}

		if (typeof params.globalSubstitution === 'undefined' && (params.transform as unknown) === 'SUBSTITUTE') {
			params.globalSubstitution = false;
		}

		if (typeof params.deviceProfile === 'undefined' && (params.extractLocation as unknown) === 'DEVICE_PROFILE') {
			params.deviceProfile = 'IS_MOBILE';
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'BEHAVIOR',
				'setVariable',
				{
					allowsVars: [
						'variableValue',
						'headerName',
						'responseHeaderName',
						'setCookieName',
						'cookieName',
						'pathComponentOffset',
						'queryParameterName',
						'operandOne',
						'encryptionKey',
						'nonce',
						'paramName',
						'hmacKey',
						'subString',
						'replacement',
					],
					variable: ['variableName'],
				},
				params,
			),
		);
	}

	/**
	 * This behavior helps you maintain business continuity for dynamic applications in high-demand situations such as
	 * flash sales. It decreases abandonment by providing a user-friendly waiting room experience. FIFO (First-in
	 * First-out) is a request processing mechanism that prioritizes the first requests that enter the waiting room to
	 * send them first to the origin. Users can see both their estimated arrival time and position in the line. With
	 * Cloudlets available on your contract, choose **Your services** > **Edge logic Cloudlets** to control Virtual
	 * Waitig Room within [Control Center](https://control.akamai.com). Otherwise use the [Cloudlets
	 * API](https://techdocs.akamai.com/cloudlets/reference) to configure it programmatically.
	 *
	 * @param {object} params - The parameters needed to configure setVirtualWaitingRoom
	 * @param {number} params.cloudletSharedPolicy - This identifies the Visitor Waiting Room Cloudlet shared policy to
	 *   use with this behavior. You can list available shared policies with the [Cloudlets
	 *   API](https://techdocs.akamai.com/cloudlets/reference).
	 * @param {'HOST_HEADER' | 'CUSTOM'} [params.domainConfig] - This specifies the domain used to establish a session
	 *   with the visitor. Default: "HOST_HEADER".
	 * @param {string} [params.customCookieDomain] - This specifies a domain for all session cookies. In case you
	 *   configure many property hostnames, this may be their common domain. Make sure the user agent accepts the custom
	 *   domain for any request matching the `virtualWaitingRoom` behavior. Don't use top level domains (TLDs). Default:
	 *   "{{builtin.AK_HOST}}". PM variables may appear between '{{' and '}}'.
	 * @param {string} params.waitingRoomPath - This specifies the path to the waiting room main page on the origin
	 *   server, for example `/vp/waiting-room.html`. When the request is marked as Waiting Room Main Page and blocked,
	 *   the visitor enters the waiting room. The behavior sets the outgoing request path to the `waitingRoomPath` and
	 *   modifies the cache key accordingly. See the [`virtualWaitingRoomRequest`](#) match criteria to further
	 *   customize these requests. PM variables may appear between '{{' and '}}'.
	 * @param {string[]} [params.waitingRoomAssetsPaths] - This specifies the base paths to static resources such as
	 *   JavaScript, CSS, or image files for the Waiting Room Main Page requests. The option supports the `*` wildcard
	 *   that matches zero or more characters. Requests matching any of these paths aren't blocked, but marked as
	 *   Waiting Room Assets and passed through to the origin. See the [`virtualWaitingRoomRequest`](#) match criteria
	 *   to further customize these requests.
	 * @param {number} [params.sessionDuration] - Specifies the number of seconds users remain in the waiting room
	 *   queue. Default: 300.
	 * @param {boolean} [params.sessionAutoProlong] - Whether the queue session should prolong automatically when the
	 *   `sessionDuration` expires and the visitor remains active. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/virtual-waiting-room | Akamai Techdocs}
	 */
	setVirtualWaitingRoom(params: {
		/**
		 * This identifies the Visitor Waiting Room Cloudlet shared policy to use with this behavior. You can list
		 * available shared policies with the [Cloudlets API](https://techdocs.akamai.com/cloudlets/reference).
		 */
		cloudletSharedPolicy: number;

		/** This specifies the domain used to establish a session with the visitor. Default: "HOST_HEADER". */
		domainConfig?: 'HOST_HEADER' | 'CUSTOM';

		/**
		 * This specifies a domain for all session cookies. In case you configure many property hostnames, this may be
		 * their common domain. Make sure the user agent accepts the custom domain for any request matching the
		 * `virtualWaitingRoom` behavior. Don't use top level domains (TLDs). Default: "{{builtin.AK_HOST}}". PM
		 * variables may appear between '{{' and '}}'.
		 */
		customCookieDomain?: string;

		/**
		 * This specifies the path to the waiting room main page on the origin server, for example
		 * `/vp/waiting-room.html`. When the request is marked as Waiting Room Main Page and blocked, the visitor enters
		 * the waiting room. The behavior sets the outgoing request path to the `waitingRoomPath` and modifies the cache
		 * key accordingly. See the [`virtualWaitingRoomRequest`](#) match criteria to further customize these requests.
		 * PM variables may appear between '{{' and '}}'.
		 */
		waitingRoomPath: string;

		/**
		 * This specifies the base paths to static resources such as JavaScript, CSS, or image files for the Waiting
		 * Room Main Page requests. The option supports the `*` wildcard that matches zero or more characters. Requests
		 * matching any of these paths aren't blocked, but marked as Waiting Room Assets and passed through to the
		 * origin. See the [`virtualWaitingRoomRequest`](#) match criteria to further customize these requests.
		 */
		waitingRoomAssetsPaths?: string[];

		/** Specifies the number of seconds users remain in the waiting room queue. Default: 300. */
		sessionDuration?: number;

		/**
		 * Whether the queue session should prolong automatically when the `sessionDuration` expires and the visitor
		 * remains active. Default: true.
		 */
		sessionAutoProlong?: boolean;
	}): Property {
		if (typeof params.domainConfig === 'undefined') {
			params.domainConfig = 'HOST_HEADER';
		}

		if (typeof params.customCookieDomain === 'undefined' && (params.domainConfig as unknown) === 'CUSTOM') {
			params.customCookieDomain = '{{builtin.AK_HOST}}';
		}

		if (typeof params.sessionDuration === 'undefined') {
			params.sessionDuration = 300;
		}

		if (typeof params.sessionAutoProlong === 'undefined') {
			params.sessionAutoProlong = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'BEHAVIOR',
				'virtualWaitingRoom',
				{allowsVars: ['customCookieDomain', 'waitingRoomPath']},
				params,
			),
		);
	}

	/**
	 * This behavior allows you to configure the [`virtualWaitingRoom`](#) behavior with EdgeWorkers for extended
	 * scalability and customization.
	 *
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/virtual-waiting-room-edgeworkers | Akamai Techdocs}
	 */
	setVirtualWaitingRoomWithEdgeWorkers(): Property {
		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'virtualWaitingRoomWithEdgeWorkers', {}, {}),
		);
	}

	/**
	 * The [Visitor Prioritization Cloudlet](https://techdocs.akamai.com/cloudlets/docs/what-visitor-prioritization)
	 * decreases abandonment by providing a user-friendly waiting room experience. With Cloudlets available on your
	 * contract, choose **Your services** > **Edge logic Cloudlets** to control Visitor Prioritization within [Control
	 * Center](https://control.akamai.com). Otherwise use the [Cloudlets
	 * API](https://techdocs.akamai.com/cloudlets/reference) to configure it programmatically. To serve non-HTML API
	 * content such as JSON blocks, see the [`apiPrioritization`](#) behavior.
	 *
	 * @param {object} params - The parameters needed to configure setVisitorPrioritization
	 * @param {boolean} [params.enabled] - Enables the Visitor Prioritization behavior. Default: true.
	 * @param {any} [params.cloudletPolicy] - Identifies the Cloudlet policy.
	 * @param {boolean} [params.userIdentificationByCookie] - When enabled, identifies users by the value of a cookie.
	 *   Default: false.
	 * @param {string} [params.userIdentificationKeyCookie] - Specifies the name of the cookie whose value identifies
	 *   users. To match a user, the value of the cookie needs to remain constant across all requests.
	 * @param {boolean} [params.userIdentificationByHeaders] - When enabled, identifies users by the values of GET or
	 *   POST request headers. Default: false.
	 * @param {string[]} [params.userIdentificationKeyHeaders] - Specifies names of request headers whose values
	 *   identify users. To match a user, values for all the specified headers need to remain constant across all
	 *   requests.
	 * @param {boolean} [params.userIdentificationByIp] - Allows IP addresses to identify users. Default: false.
	 * @param {boolean} [params.userIdentificationByParams] - When enabled, identifies users by the values of GET or
	 *   POST request parameters. Default: false.
	 * @param {string[]} [params.userIdentificationKeyParams] - Specifies names of request parameters whose values
	 *   identify users. To match a user, values for all the specified parameters need to remain constant across all
	 *   requests. Parameters that are absent or blank may also identify users.
	 * @param {boolean} [params.allowedUserCookieEnabled] - Sets a cookie for users who have been allowed through to the
	 *   site. Default: true.
	 * @param {string} [params.allowedUserCookieLabel] - Specifies a label to distinguish this cookie for an allowed
	 *   user from others. The value appends to the cookie's name, and helps you to maintain the same user assignment
	 *   across behaviors within a property, and across properties.
	 * @param {number} [params.allowedUserCookieDuration] - Sets the number of seconds for the allowed user's session
	 *   once allowed through to the site. Default: 300.
	 * @param {boolean} [params.allowedUserCookieRefresh] - Resets the duration of an allowed cookie with each request,
	 *   so that it only expires if the user doesn't make any requests for the specified duration. Do not enable this
	 *   option if you want to set a fixed time for all users. Default: true.
	 * @param {boolean} [params.allowedUserCookieAdvanced] - Sets advanced configuration options for the allowed user's
	 *   cookie. Default: false.
	 * @param {boolean} [params.allowedUserCookieAutomaticSalt] - Sets an automatic _salt_ value to verify the integrity
	 *   of the cookie for an allowed user. Disable this if you want to share the cookie across properties. Default:
	 *   true.
	 * @param {string} [params.allowedUserCookieSalt] - Specifies a fixed _salt_ value, which is incorporated into the
	 *   cookie's value to prevent users from manipulating it. You can use the same salt string across different
	 *   behaviors or properties to apply a single cookie to all allowed users.
	 * @param {'DYNAMIC' | 'CUSTOMER'} [params.allowedUserCookieDomainType] - Specify with `allowedUserCookieAdvanced`
	 *   enabled. Default: "CUSTOMER".
	 * @param {string} [params.allowedUserCookieDomain] - Specifies a domain for an allowed user cookie.
	 * @param {boolean} [params.allowedUserCookieHttpOnly] - Applies the `HttpOnly` flag to the allowed user's cookie to
	 *   ensure it's accessed over HTTP and not manipulated by the client. Default: true.
	 * @param {boolean} [params.waitingRoomCookieEnabled] - Enables a cookie to track a waiting room assignment.
	 *   Default: true.
	 * @param {boolean} [params.waitingRoomCookieShareLabel] - Enabling this option shares the same
	 *   `allowedUserCookieLabel` string. If disabled, specify a different `waitingRoomCookieLabel`. Default: true.
	 * @param {string} [params.waitingRoomCookieLabel] - Specifies a label to distinguish this waiting room cookie from
	 *   others. The value appends to the cookie's name, and helps you to maintain the same waiting room assignment
	 *   across behaviors within a property, and across properties.
	 * @param {number} [params.waitingRoomCookieDuration] - Sets the number of seconds for which users remain in the
	 *   waiting room. During this time, users who refresh the waiting room page remain there. Default: 30.
	 * @param {boolean} [params.waitingRoomCookieAdvanced] - When enabled along with `waitingRoomCookieEnabled`, sets
	 *   advanced configuration options for the waiting room cookie. Default: false.
	 * @param {boolean} [params.waitingRoomCookieAutomaticSalt] - Sets an automatic _salt_ value to verify the integrity
	 *   of the waiting room cookie. Disable this if you want to share the cookie across properties. Default: true.
	 * @param {string} [params.waitingRoomCookieSalt] - Specifies a fixed _salt_ value, which is incorporated into the
	 *   cookie's value to prevent users from manipulating it. You can use the same salt string across different
	 *   behaviors or properties to apply a single cookie for the waiting room session.
	 * @param {'DYNAMIC' | 'CUSTOMER'} [params.waitingRoomCookieDomainType] - Specify with `waitingRoomCookieAdvanced`
	 *   enabled, selects whether to use the `DYNAMIC` incoming host header, or a `CUSTOMER`-defined cookie domain.
	 *   Default: "CUSTOMER".
	 * @param {string} [params.waitingRoomCookieDomain] - Specifies a domain for the waiting room cookie.
	 * @param {boolean} [params.waitingRoomCookieHttpOnly] - Applies the `HttpOnly` flag to the waiting room cookie to
	 *   ensure it's accessed over HTTP and not manipulated by the client. Default: true.
	 * @param {number} [params.waitingRoomStatusCode] - Specifies the response code for requests sent to the waiting
	 *   room. Default: 200.
	 * @param {boolean} [params.waitingRoomUseCpCode] - Allows you to assign a different CP code that tracks any
	 *   requests that are sent to the waiting room. Default: false.
	 * @param {any} [params.waitingRoomCpCode] - Specifies a CP code for requests sent to the waiting room. You only
	 *   need to provide the initial `id`, stripping any [`cpc_` prefix](ref:id-prefixes) to pass the integer to the
	 *   rule tree. Additional CP code details may reflect back in subsequent read-only data.
	 * @param {any} [params.waitingRoomNetStorage] - Specifies the NetStorage domain for the waiting room page.
	 * @param {string} [params.waitingRoomDirectory] - Specifies the NetStorage directory that contains the static
	 *   waiting room page, with no trailing slash character. PM variables may appear between '{{' and '}}'.
	 * @param {number} [params.waitingRoomCacheTtl] - Specifies the waiting room page's time to live in the cache, `5`
	 *   minutes by default. Default: 5.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/visitor-prioritization-cloudlet | Akamai Techdocs}
	 */
	setVisitorPrioritization(params: {
		/** Enables the Visitor Prioritization behavior. Default: true. */
		enabled?: boolean;

		/** Identifies the Cloudlet policy. */
		cloudletPolicy?: any;

		/** When enabled, identifies users by the value of a cookie. Default: false. */
		userIdentificationByCookie?: boolean;

		/**
		 * Specifies the name of the cookie whose value identifies users. To match a user, the value of the cookie needs
		 * to remain constant across all requests.
		 */
		userIdentificationKeyCookie?: string;

		/** When enabled, identifies users by the values of GET or POST request headers. Default: false. */
		userIdentificationByHeaders?: boolean;

		/**
		 * Specifies names of request headers whose values identify users. To match a user, values for all the specified
		 * headers need to remain constant across all requests.
		 */
		userIdentificationKeyHeaders?: string[];

		/** Allows IP addresses to identify users. Default: false. */
		userIdentificationByIp?: boolean;

		/** When enabled, identifies users by the values of GET or POST request parameters. Default: false. */
		userIdentificationByParams?: boolean;

		/**
		 * Specifies names of request parameters whose values identify users. To match a user, values for all the
		 * specified parameters need to remain constant across all requests. Parameters that are absent or blank may
		 * also identify users.
		 */
		userIdentificationKeyParams?: string[];

		/** Sets a cookie for users who have been allowed through to the site. Default: true. */
		allowedUserCookieEnabled?: boolean;

		/**
		 * Specifies a label to distinguish this cookie for an allowed user from others. The value appends to the
		 * cookie's name, and helps you to maintain the same user assignment across behaviors within a property, and
		 * across properties.
		 */
		allowedUserCookieLabel?: string;

		/** Sets the number of seconds for the allowed user's session once allowed through to the site. Default: 300. */
		allowedUserCookieDuration?: number;

		/**
		 * Resets the duration of an allowed cookie with each request, so that it only expires if the user doesn't make
		 * any requests for the specified duration. Do not enable this option if you want to set a fixed time for all
		 * users. Default: true.
		 */
		allowedUserCookieRefresh?: boolean;

		/** Sets advanced configuration options for the allowed user's cookie. Default: false. */
		allowedUserCookieAdvanced?: boolean;

		/**
		 * Sets an automatic _salt_ value to verify the integrity of the cookie for an allowed user. Disable this if you
		 * want to share the cookie across properties. Default: true.
		 */
		allowedUserCookieAutomaticSalt?: boolean;

		/**
		 * Specifies a fixed _salt_ value, which is incorporated into the cookie's value to prevent users from
		 * manipulating it. You can use the same salt string across different behaviors or properties to apply a single
		 * cookie to all allowed users.
		 */
		allowedUserCookieSalt?: string;

		/** Specify with `allowedUserCookieAdvanced` enabled. Default: "CUSTOMER". */
		allowedUserCookieDomainType?: 'DYNAMIC' | 'CUSTOMER';

		/** Specifies a domain for an allowed user cookie. */
		allowedUserCookieDomain?: string;

		/**
		 * Applies the `HttpOnly` flag to the allowed user's cookie to ensure it's accessed over HTTP and not
		 * manipulated by the client. Default: true.
		 */
		allowedUserCookieHttpOnly?: boolean;

		/** Enables a cookie to track a waiting room assignment. Default: true. */
		waitingRoomCookieEnabled?: boolean;

		/**
		 * Enabling this option shares the same `allowedUserCookieLabel` string. If disabled, specify a different
		 * `waitingRoomCookieLabel`. Default: true.
		 */
		waitingRoomCookieShareLabel?: boolean;

		/**
		 * Specifies a label to distinguish this waiting room cookie from others. The value appends to the cookie's
		 * name, and helps you to maintain the same waiting room assignment across behaviors within a property, and
		 * across properties.
		 */
		waitingRoomCookieLabel?: string;

		/**
		 * Sets the number of seconds for which users remain in the waiting room. During this time, users who refresh
		 * the waiting room page remain there. Default: 30.
		 */
		waitingRoomCookieDuration?: number;

		/**
		 * When enabled along with `waitingRoomCookieEnabled`, sets advanced configuration options for the waiting room
		 * cookie. Default: false.
		 */
		waitingRoomCookieAdvanced?: boolean;

		/**
		 * Sets an automatic _salt_ value to verify the integrity of the waiting room cookie. Disable this if you want
		 * to share the cookie across properties. Default: true.
		 */
		waitingRoomCookieAutomaticSalt?: boolean;

		/**
		 * Specifies a fixed _salt_ value, which is incorporated into the cookie's value to prevent users from
		 * manipulating it. You can use the same salt string across different behaviors or properties to apply a single
		 * cookie for the waiting room session.
		 */
		waitingRoomCookieSalt?: string;

		/**
		 * Specify with `waitingRoomCookieAdvanced` enabled, selects whether to use the `DYNAMIC` incoming host header,
		 * or a `CUSTOMER`-defined cookie domain. Default: "CUSTOMER".
		 */
		waitingRoomCookieDomainType?: 'DYNAMIC' | 'CUSTOMER';

		/** Specifies a domain for the waiting room cookie. */
		waitingRoomCookieDomain?: string;

		/**
		 * Applies the `HttpOnly` flag to the waiting room cookie to ensure it's accessed over HTTP and not manipulated
		 * by the client. Default: true.
		 */
		waitingRoomCookieHttpOnly?: boolean;

		/** Specifies the response code for requests sent to the waiting room. Default: 200. */
		waitingRoomStatusCode?: number;

		/**
		 * Allows you to assign a different CP code that tracks any requests that are sent to the waiting room. Default:
		 * false.
		 */
		waitingRoomUseCpCode?: boolean;

		/**
		 * Specifies a CP code for requests sent to the waiting room. You only need to provide the initial `id`,
		 * stripping any [`cpc_` prefix](ref:id-prefixes) to pass the integer to the rule tree. Additional CP code
		 * details may reflect back in subsequent read-only data.
		 */
		waitingRoomCpCode?: any;

		/** Specifies the NetStorage domain for the waiting room page. */
		waitingRoomNetStorage?: any;

		/**
		 * Specifies the NetStorage directory that contains the static waiting room page, with no trailing slash
		 * character. PM variables may appear between '{{' and '}}'.
		 */
		waitingRoomDirectory?: string;

		/** Specifies the waiting room page's time to live in the cache, `5` minutes by default. Default: 5. */
		waitingRoomCacheTtl?: number;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		if (typeof params.userIdentificationByCookie === 'undefined' && (params.enabled as unknown) === true) {
			params.userIdentificationByCookie = false;
		}

		if (typeof params.userIdentificationByHeaders === 'undefined' && (params.enabled as unknown) === true) {
			params.userIdentificationByHeaders = false;
		}

		if (typeof params.userIdentificationByIp === 'undefined' && (params.enabled as unknown) === true) {
			params.userIdentificationByIp = false;
		}

		if (typeof params.userIdentificationByParams === 'undefined' && (params.enabled as unknown) === true) {
			params.userIdentificationByParams = false;
		}

		if (typeof params.allowedUserCookieEnabled === 'undefined' && (params.enabled as unknown) === true) {
			params.allowedUserCookieEnabled = true;
		}

		if (
			typeof params.allowedUserCookieDuration === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.allowedUserCookieEnabled as unknown) === true
		) {
			params.allowedUserCookieDuration = 300;
		}

		if (
			typeof params.allowedUserCookieRefresh === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.allowedUserCookieEnabled as unknown) === true
		) {
			params.allowedUserCookieRefresh = true;
		}

		if (
			typeof params.allowedUserCookieAdvanced === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.allowedUserCookieEnabled as unknown) === true
		) {
			params.allowedUserCookieAdvanced = false;
		}

		if (
			typeof params.allowedUserCookieAutomaticSalt === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.allowedUserCookieEnabled as unknown) === true &&
			(params.allowedUserCookieAdvanced as unknown) === true
		) {
			params.allowedUserCookieAutomaticSalt = true;
		}

		if (
			typeof params.allowedUserCookieDomainType === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.allowedUserCookieEnabled as unknown) === true &&
			(params.allowedUserCookieAdvanced as unknown) === true
		) {
			params.allowedUserCookieDomainType = 'CUSTOMER';
		}

		if (
			typeof params.allowedUserCookieHttpOnly === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.allowedUserCookieEnabled as unknown) === true &&
			(params.allowedUserCookieAdvanced as unknown) === true
		) {
			params.allowedUserCookieHttpOnly = true;
		}

		if (typeof params.waitingRoomCookieEnabled === 'undefined' && (params.enabled as unknown) === true) {
			params.waitingRoomCookieEnabled = true;
		}

		if (
			typeof params.waitingRoomCookieShareLabel === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.waitingRoomCookieEnabled as unknown) === true &&
			(params.allowedUserCookieEnabled as unknown) === true
		) {
			params.waitingRoomCookieShareLabel = true;
		}

		if (
			typeof params.waitingRoomCookieDuration === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.waitingRoomCookieEnabled as unknown) === true
		) {
			params.waitingRoomCookieDuration = 30;
		}

		if (
			typeof params.waitingRoomCookieAdvanced === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.waitingRoomCookieEnabled as unknown) === true
		) {
			params.waitingRoomCookieAdvanced = false;
		}

		if (
			typeof params.waitingRoomCookieAutomaticSalt === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.waitingRoomCookieEnabled as unknown) === true &&
			(params.waitingRoomCookieAdvanced as unknown) === true
		) {
			params.waitingRoomCookieAutomaticSalt = true;
		}

		if (
			typeof params.waitingRoomCookieDomainType === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.waitingRoomCookieEnabled as unknown) === true &&
			(params.waitingRoomCookieAdvanced as unknown) === true
		) {
			params.waitingRoomCookieDomainType = 'CUSTOMER';
		}

		if (
			typeof params.waitingRoomCookieHttpOnly === 'undefined' &&
			(params.enabled as unknown) === true &&
			(params.waitingRoomCookieEnabled as unknown) === true &&
			(params.waitingRoomCookieAdvanced as unknown) === true
		) {
			params.waitingRoomCookieHttpOnly = true;
		}

		if (typeof params.waitingRoomStatusCode === 'undefined' && (params.enabled as unknown) === true) {
			params.waitingRoomStatusCode = 200;
		}

		if (typeof params.waitingRoomUseCpCode === 'undefined' && (params.enabled as unknown) === true) {
			params.waitingRoomUseCpCode = false;
		}

		if (typeof params.waitingRoomCacheTtl === 'undefined' && (params.enabled as unknown) === true) {
			params.waitingRoomCacheTtl = 5;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'BEHAVIOR',
				'visitorPrioritization',
				{allowsVars: ['waitingRoomDirectory']},
				params,
			),
		);
	}

	/**
	 * (**BETA**) The [Visitor Prioritization Cloudlet
	 * (FIFO)](https://techdocs.akamai.com/cloudlets/docs/what-visitor-prioritization) decreases abandonment by
	 * providing a user-friendly waiting room experience. FIFO (First-in First-out) is a fair request processing
	 * mechanism, which prioritizes the first requests that enter the waiting room to send them first to the origin.
	 * Users can see both their estimated arrival time and position in the line. With Cloudlets available on your
	 * contract, choose **Your services** > **Edge logic Cloudlets** to control Visitor Prioritization (FIFO) within
	 * [Control Center](https://control.akamai.com). Otherwise use the [Cloudlets
	 * API](https://techdocs.akamai.com/cloudlets/reference) to configure it programmatically. To serve non-HTML API
	 * content such as JSON blocks, see the [`apiPrioritization`](#) behavior.
	 *
	 * @param {object} params - The parameters needed to configure setVisitorPrioritizationFifo
	 * @param {number} params.cloudletSharedPolicy - This identifies the Visitor Prioritization FIFO shared policy to
	 *   use with this behavior. You can list available shared policies with the [Cloudlets
	 *   API](https://techdocs.akamai.com/cloudlets/reference).
	 * @param {'HOST_HEADER' | 'CUSTOM'} [params.domainConfig] - This specifies how to set the domain used to establish
	 *   a session with the visitor. Default: "HOST_HEADER".
	 * @param {string} [params.customCookieDomain] - This specifies a domain for all session cookies. In case you
	 *   configure many property hostnames, this may be their common domain. Make sure the user agent accepts the custom
	 *   domain for any request matching the `visitorPrioritizationFifo` behavior. Don't use top level domains (TLDs).
	 *   Default: "{{builtin.AK_HOST}}". PM variables may appear between '{{' and '}}'.
	 * @param {string} params.waitingRoomPath - This specifies the path to the waiting room main page on the origin
	 *   server, for example `/vp/waiting-room.html`. When the request is marked as `Waiting Room Main Page` and
	 *   blocked, the visitor enters the waiting room. The behavior sets the outgoing request path to the
	 *   `waitingRoomPath` and modifies the cache key accordingly. See the [`visitorPrioritizationRequest`](#) match
	 *   criteria to further customize these requests. PM variables may appear between '{{' and '}}'.
	 * @param {string[]} [params.waitingRoomAssetsPaths] - This specifies the base paths to static resources such as
	 *   `JavaScript`, `CSS`, or image files for the `Waiting Room Main Page` requests. The option supports the `*`
	 *   wildcard wildcard that matches zero or more characters. Requests matching any of these paths aren't blocked,
	 *   but marked as Waiting Room Assets and passed through to the origin. See the [`visitorPrioritizationRequest`](#)
	 *   match criteria to further customize these requests.
	 * @param {number} [params.sessionDuration] - Specifies the number of seconds users remain in the waiting room
	 *   queue. Default: 300.
	 * @param {boolean} [params.sessionAutoProlong] - Whether the queue session should prolong automatically when the
	 *   `sessionDuration` expires and the visitor remains active. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/welcome-prop-manager | Akamai Techdocs}
	 */
	setVisitorPrioritizationFifo(params: {
		/**
		 * This identifies the Visitor Prioritization FIFO shared policy to use with this behavior. You can list
		 * available shared policies with the [Cloudlets API](https://techdocs.akamai.com/cloudlets/reference).
		 */
		cloudletSharedPolicy: number;

		/** This specifies how to set the domain used to establish a session with the visitor. Default: "HOST_HEADER". */
		domainConfig?: 'HOST_HEADER' | 'CUSTOM';

		/**
		 * This specifies a domain for all session cookies. In case you configure many property hostnames, this may be
		 * their common domain. Make sure the user agent accepts the custom domain for any request matching the
		 * `visitorPrioritizationFifo` behavior. Don't use top level domains (TLDs). Default: "{{builtin.AK_HOST}}". PM
		 * variables may appear between '{{' and '}}'.
		 */
		customCookieDomain?: string;

		/**
		 * This specifies the path to the waiting room main page on the origin server, for example
		 * `/vp/waiting-room.html`. When the request is marked as `Waiting Room Main Page` and blocked, the visitor
		 * enters the waiting room. The behavior sets the outgoing request path to the `waitingRoomPath` and modifies
		 * the cache key accordingly. See the [`visitorPrioritizationRequest`](#) match criteria to further customize
		 * these requests. PM variables may appear between '{{' and '}}'.
		 */
		waitingRoomPath: string;

		/**
		 * This specifies the base paths to static resources such as `JavaScript`, `CSS`, or image files for the
		 * `Waiting Room Main Page` requests. The option supports the `*` wildcard wildcard that matches zero or more
		 * characters. Requests matching any of these paths aren't blocked, but marked as Waiting Room Assets and passed
		 * through to the origin. See the [`visitorPrioritizationRequest`](#) match criteria to further customize these
		 * requests.
		 */
		waitingRoomAssetsPaths?: string[];

		/** Specifies the number of seconds users remain in the waiting room queue. Default: 300. */
		sessionDuration?: number;

		/**
		 * Whether the queue session should prolong automatically when the `sessionDuration` expires and the visitor
		 * remains active. Default: true.
		 */
		sessionAutoProlong?: boolean;
	}): Property {
		if (typeof params.domainConfig === 'undefined') {
			params.domainConfig = 'HOST_HEADER';
		}

		if (typeof params.customCookieDomain === 'undefined' && (params.domainConfig as unknown) === 'CUSTOM') {
			params.customCookieDomain = '{{builtin.AK_HOST}}';
		}

		if (typeof params.sessionDuration === 'undefined') {
			params.sessionDuration = 300;
		}

		if (typeof params.sessionAutoProlong === 'undefined') {
			params.sessionAutoProlong = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty(
				'BEHAVIOR',
				'visitorPrioritizationFifo',
				{allowsVars: ['customCookieDomain', 'waitingRoomPath']},
				params,
			),
		);
	}

	/**
	 * 2DO.
	 *
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/welcome-prop-manager | Akamai Techdocs}
	 */
	setVisitorPrioritizationFifoStandalone(): Property {
		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'visitorPrioritizationFifoStandalone', {}, {}),
		);
	}

	/**
	 * This behavior implements a suite of security features that blocks threatening HTTP and HTTPS requests. Use it as
	 * your primary firewall, or in addition to existing security measures. Only one referenced configuration is allowed
	 * per property, so this behavior typically belongs as part of its default rule.
	 *
	 * @param {object} params - The parameters needed to configure setWebApplicationFirewall
	 * @param {any} params.firewallConfiguration - An object featuring details about your firewall configuration.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/web-app-firewall | Akamai Techdocs}
	 */
	setWebApplicationFirewall(params: {
		/** An object featuring details about your firewall configuration. */
		firewallConfiguration: any;
	}): Property {
		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'webApplicationFirewall', {}, params),
		);
	}

	/**
	 * The WebSocket protocol allows web applications real-time bidirectional communication between clients and servers.
	 *
	 * @param {object} params - The parameters needed to configure setWebSockets
	 * @param {boolean} [params.enabled] - Enables WebSocket traffic. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/websockets-support | Akamai Techdocs}
	 */
	setWebSockets(params: {
		/** Enables WebSocket traffic. Default: true. */
		enabled?: boolean;
	}): Property {
		if (typeof params.enabled === 'undefined') {
			params.enabled = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'webSockets', {}, params));
	}

	/**
	 * Sends a `Client-To-Edge` header to your origin server with details from the mutual TLS certificate sent from the
	 * requesting client to the edge network. This establishes transitive trust between the client and your origin
	 * server.
	 *
	 * @param {object} params - The parameters needed to configure setClientCertificateAuth
	 * @param {boolean} [params.enable] - Constructs the `Client-To-Edge` authentication header using information from
	 *   the client to edge mTLS handshake and forwards it to your origin. You can configure your origin to acknowledge
	 *   the header to enable transitive trust. Some form of the client x.509 certificate needs to be included in the
	 *   header. You can include the full certificate or specific attributes. Default: false.
	 * @param {boolean} [params.enableCompleteClientCertificate] - Whether to include the complete client certificate in
	 *   the header, in its binary (DER) format. DER-formatted certificates leave out the `BEGIN CERTIFICATE/END
	 *   CERTIFICATE` statements and most often use the `.der` extension. Alternatively, you can specify individual
	 *   `clientCertificateAttributes` you want included in the request. Default: true.
	 * @param {('SUBJECT' | 'COMMON_NAME' | 'SHA256_FINGERPRINT' | 'ISSUER')[]} [params.clientCertificateAttributes]
	 *
	 *   - Specify client certificate attributes to include in the `Client-To-Edge` authentication header that's sent to
	 *       your origin server.
	 *
	 * @param {boolean} [params.enableClientCertificateValidationStatus] - Whether to include the current validation
	 *   status of the client certificate in the `Client-To-Edge` authentication header. This verifies the validation
	 *   status of the certificate, regardless of the certificate attributes you're including in the header. Default:
	 *   true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/client-certificate-authentication | Akamai Techdocs}
	 */
	setClientCertificateAuth(params: {
		/**
		 * Constructs the `Client-To-Edge` authentication header using information from the client to edge mTLS
		 * handshake and forwards it to your origin. You can configure your origin to acknowledge the header to enable
		 * transitive trust. Some form of the client x.509 certificate needs to be included in the header. You can
		 * include the full certificate or specific attributes. Default: false.
		 */
		enable?: boolean;

		/**
		 * Whether to include the complete client certificate in the header, in its binary (DER) format. DER-formatted
		 * certificates leave out the `BEGIN CERTIFICATE/END CERTIFICATE` statements and most often use the `.der`
		 * extension. Alternatively, you can specify individual `clientCertificateAttributes` you want included in the
		 * request. Default: true.
		 */
		enableCompleteClientCertificate?: boolean;

		/**
		 * Specify client certificate attributes to include in the `Client-To-Edge` authentication header that's sent to
		 * your origin server.
		 */
		clientCertificateAttributes?: Array<'SUBJECT' | 'COMMON_NAME' | 'SHA256_FINGERPRINT' | 'ISSUER'>;

		/**
		 * Whether to include the current validation status of the client certificate in the `Client-To-Edge`
		 * authentication header. This verifies the validation status of the certificate, regardless of the certificate
		 * attributes you're including in the header. Default: true.
		 */
		enableClientCertificateValidationStatus?: boolean;
	}): Property {
		if (typeof params.enable === 'undefined') {
			params.enable = false;
		}

		if (typeof params.enableCompleteClientCertificate === 'undefined' && (params.enable as unknown) === true) {
			params.enableCompleteClientCertificate = true;
		}

		if (
			typeof params.enableClientCertificateValidationStatus === 'undefined' &&
			(params.enable as unknown) === true
		) {
			params.enableClientCertificateValidationStatus = true;
		}

		return this.wrapDelegateResponse(
			this.delegate.addFromProperty('BEHAVIOR', 'clientCertificateAuth', {}, params),
		);
	}

	/**
	 * This behavior repeats mTLS validation checks between a requesting client and the edge network. If the checks
	 * fail, you can deny the request or apply custom error handling. To use this behavior, you need to add either the
	 * [`hostname`](#) or [`clientCertificate`](#) criteria to the same rule.
	 *
	 * @param {object} params - The parameters needed to configure setEnforceMtlsSettings
	 * @param {boolean} [params.enableAuthSet] - Whether to require a specific mutual transport layer security (mTLS)
	 *   certificate authority (CA) set in a request from a client to the edge network. Default: false.
	 * @param {string[]} [params.certificateAuthoritySet] - Specify the client certificate authority (CA) sets you want
	 *   to support in client requests. Run the [List CA
	 *   Sets](https://techdocs.akamai.com/mtls-edge-truststore/reference/get-ca-sets) operation in the mTLS Edge
	 *   TrustStore API to get the `setId` value and pass it in this option as a string. If a request includes a set not
	 *   defined here, it will be denied. The preset list items you can select are contingent on the CA sets you've
	 *   created using the mTLS Edge Truststore, and then associated with a certificate in the [Certificate Provisioning
	 *   System](https://techdocs.akamai.com/cps/reference/certificate-provisioning-system-api).
	 * @param {boolean} [params.enableOcspStatus] - Whether the mutual transport layer security requests from a client
	 *   should use the online certificate support protocol (OCSP). OCSP can determine the x.509 certificate revocation
	 *   status during the TLS handshake. Default: false.
	 * @param {boolean} [params.enableDenyRequest] - This denies a request from a client that doesn't match what you've
	 *   set for the options in this behavior. When disabled, non-matching requests are allowed, but you can incorporate
	 *   a custom handling operation, such as reviewing generated log entries to see the discrepancies, enable the
	 *   `Client-To-Edge` authentication header, or issue a custom message. Default: true.
	 * @returns {Property} The mutated property
	 * @see {@link https://techdocs.akamai.com/property-mgr/docs/enforce-mtls-settings | Akamai Techdocs}
	 */
	setEnforceMtlsSettings(params: {
		/**
		 * Whether to require a specific mutual transport layer security (mTLS) certificate authority (CA) set in a
		 * request from a client to the edge network. Default: false.
		 */
		enableAuthSet?: boolean;

		/**
		 * Specify the client certificate authority (CA) sets you want to support in client requests. Run the [List CA
		 * Sets](https://techdocs.akamai.com/mtls-edge-truststore/reference/get-ca-sets) operation in the mTLS Edge
		 * TrustStore API to get the `setId` value and pass it in this option as a string. If a request includes a set
		 * not defined here, it will be denied. The preset list items you can select are contingent on the CA sets
		 * you've created using the mTLS Edge Truststore, and then associated with a certificate in the [Certificate
		 * Provisioning System](https://techdocs.akamai.com/cps/reference/certificate-provisioning-system-api).
		 */
		certificateAuthoritySet?: Array<string>;

		/**
		 * Whether the mutual transport layer security requests from a client should use the online certificate support
		 * protocol (OCSP). OCSP can determine the x.509 certificate revocation status during the TLS handshake.
		 * Default: false.
		 */
		enableOcspStatus?: boolean;

		/**
		 * This denies a request from a client that doesn't match what you've set for the options in this behavior. When
		 * disabled, non-matching requests are allowed, but you can incorporate a custom handling operation, such as
		 * reviewing generated log entries to see the discrepancies, enable the `Client-To-Edge` authentication header,
		 * or issue a custom message. Default: true.
		 */
		enableDenyRequest?: boolean;
	}): Property {
		if (typeof params.enableAuthSet === 'undefined') {
			params.enableAuthSet = false;
		}

		if (typeof params.enableOcspStatus === 'undefined') {
			params.enableOcspStatus = false;
		}

		if (
			typeof params.enableDenyRequest === 'undefined' &&
			((params.enableAuthSet as unknown) === true || (params.enableOcspStatus as unknown) === true)
		) {
			params.enableDenyRequest = true;
		}

		return this.wrapDelegateResponse(this.delegate.addFromProperty('BEHAVIOR', 'enforceMtlsSettings', {}, params));
	}
}
