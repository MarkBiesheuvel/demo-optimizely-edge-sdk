import cookie from 'cookie'

// Name of cookie used to identify users
const USER_ID_COOKIE_NAME = 'myCustomUserID'
const USER_ID_COOKIE_MAX_AGE = 15780000
const USER_ID_HEADER_NAME = 'X-User-Id'


/**
 * handler - Entrypoint of the Lambda function
 *
 * @param {Object} event - CloudFront event
 * @param {Object} context - Lambda context
 * @param {Function} callback - Lambda callback
 */
export const handler = async (event, context, callback) => {
  // Get request object from event
  const { request, response } = event.Records[0].cf

  // Get user ID from request object
  const userId = request.headers[USER_ID_HEADER_NAME.toLocaleLowerCase()][0].value

  // Always refresh the user ID cookie
  response.headers['set-cookie'] = [
    {
      key: 'Set-Cookie',
      value: cookie.serialize(USER_ID_COOKIE_NAME, userId, {
        maxAge: USER_ID_COOKIE_MAX_AGE,
        secure: true,
        httpOnly: true,
      })
    }
  ]

  // Return the updated response object to CloudFront
  // TODO: return a promise instead
  callback(null, response)
}