import cookie from 'cookie';

// Name of cookie and HTTP header used to identify users
const USER_ID_COOKIE_NAME = 'myCustomUserID';
const USER_ID_COOKIE_MAX_AGE = 15780000;
const USER_ID_HEADER_NAME = 'X-User-Id';

// Name of HTTP header to identify variation
const VARIATION_KEY_HEADER_NAME = 'X-Redirect-Variation-Key';

/**
 * handler - Entrypoint of the Lambda function
 *
 * @param {Object} event - CloudFront event
 * @param {Object} context - Lambda context
 * @param {Function} callback - Lambda callback
 */
export const handler = async (event, context, callback) => {
  // Get request object from event
  const { request, response } = event.Records[0].cf;

  // Get user ID from request object
  const userId = request.headers[USER_ID_HEADER_NAME.toLocaleLowerCase()][0].value;

  // Always refresh the user ID cookie
  response.headers['set-cookie'] = [
    {
      key: 'Set-Cookie',
      value: cookie.serialize(USER_ID_COOKIE_NAME, userId, {
        maxAge: USER_ID_COOKIE_MAX_AGE,
        secure: true,
        httpOnly: true
      })
    }
  ];

  // Get user ID from request object
  const variationKey = request.headers[VARIATION_KEY_HEADER_NAME.toLocaleLowerCase()][0].value;

  // Include the variation key in the response
  // TODO: send decision to logx.optimizely.com from front-end
  response.headers[VARIATION_KEY_HEADER_NAME.toLocaleLowerCase()] = [
    {
      key: VARIATION_KEY_HEADER_NAME,
      value: variationKey
    }
  ];

  // Return the updated response object to CloudFront
  // TODO: return a promise instead
  callback(null, response);
};
