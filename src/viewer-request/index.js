import cookie from 'cookie'
import { randomUUID } from 'crypto' // Standard library
import { getDatafileRequest } from './helpers' // Local file
import {
  createInstance,
  enums as OptimizelyEnums
} from '@optimizely/optimizely-sdk/dist/optimizely.lite.es'

// Lambda@Edge does not support ENV variables
const OPTIMIZELY_SDK_KEY = 'KVpGWnzPGKvvQ8yeEWmJZ'

// Name of cookie used to identify users
const COOKIE_NAME_USER_ID = 'myCustomUserID'

// Initialize Optimizely client from datafile (sdkKey is not supported in Edge SDK)
// NOTE: I have removed the TTL as seen in @optimizely/aws-lambda-at-edge-starter-kit
const OPTIMIZELY_CLIENT = createInstance({
  datafile: await getDatafileRequest(`/datafiles/${OPTIMIZELY_SDK_KEY}.json`),
  logLevel: OptimizelyEnums.LOG_LEVEL.ERROR,
  clientEngine: 'javascript-sdk/aws-lambda-at-edge',
})

/**
 * getCookieObject - Returns cookies from request object
 *
 * @param {Object} request - CloudFront request object
 * @returns {Object}
 */
const getCookieObject = ({ headers }) => {
  if ('cookie' in headers) {
    // The cookie string will contain equal signs and semicolons, so it needs to be parsed
    return cookie.parse(headers.cookie[0].value)
  } else {
    // No cookies set
    return {}
  }
}

/**
 * getUserId - Returns a user ID from the cookies
 *
 * @param {Object} cookies - All cookies that were set in the request
 * @returns {string}
 */
const getUserId = (cookies) => {
  if (COOKIE_NAME_USER_ID in cookies) {
    // Found existing user ID
    return cookies[COOKIE_NAME_USER_ID]
  } else {
    // Generate new user ID
    return randomUUID()
  }
}

/**
 * handler - Entrypoint of the Lambda function
 *
 * @param {Object} event - CloudFront event
 * @param {Object} context - Lambda context
 * @param {Function} callback - Lambda callback
 */
export const handler = async (event, context, callback) => {
  // Get request object from event
  const { request } = event.Records[0].cf

  // Getting user ID from request object
  const cookies = getCookieObject(request)
  const userId = getUserId(cookies)
  console.log(`User ID is ${userId}`)

  // Creating Optimizely user context
  // TODO: only create context if we need a decision
  const optimizelyUserContext = OPTIMIZELY_CLIENT.createUserContext(userId)

  // Decide redirect experiment on home page
  if (request.uri == '/' || request.uri == '/index.html') {
    // Make decision
    const { variationKey, variables } = optimizelyUserContext.decide('hero_layout')
    console.log(`Variation is ${variationKey}`)

    // Update request object with new path
    request.uri = variables.path
  }

  // Return the updated request object to CloudFront
  // TODO: return a promise instead
  callback(null, request)
}