import {
  createInstance,
  enums as OptimizelyEnums,
} from './optimizely.lite.js'
import https from 'https'

// Lambda@Edge does not support ENV variables
//
const OPTIMIZELY_SDK_KEY = 'KVpGWnzPGKvvQ8yeEWmJZ'

/**
 * getDatafileRequest - Retrieves the datafile from the Optimizely CDN and returns as a JSON object.
 *
 * @param string datafilePath - CDN path to datafile based on SDK Key.
 * @returns Promise
 */
const getDatafileRequest = async (datafilePath) => new Promise(
  (resolve, reject) => {
    const options = {
      hostname: 'cdn.optimizely.com',
      port: 443,
      path: datafilePath,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const req = https.get(options, (res) => {
      res.setEncoding('utf8')
      let body = ''

      res.on('data', (chunk) => {
        body += chunk
      })

      res.on('end', () => {
        try {
          resolve(JSON.parse(body))
        } catch (err) {
          reject(err)
        }
      })
    })

    req.on('error', (err) => {
      reject(err)
    })

    req.end()
  }
)

// Cache the datafile across Lambda@Edge Invocations.
// NOTE: I have removed the TTL as seen in @optimizely/aws-lambda-at-edge-starter-kit
const datafilePath = `/datafiles/${OPTIMIZELY_SDK_KEY}.json`
const datafile = await getDatafileRequest(datafilePath)

// Initialize Optimizely client from datafile (sdkKey is not supported in Edge SDK)
const optimizelyClient = createInstance({
  datafile,
  logLevel: OptimizelyEnums.LOG_LEVEL.ERROR,
  clientEngine: 'javascript-sdk/aws-lambda-at-edge',
})

export const handler = async (event, context) => {

  // Example: different variation and path for different users
  const users = ['mark', 'dejan', 'james', 'ed', 'joshua', 'simon', 'rob', 'ryan']
  users.forEach((userId) => {
    const optimizelyUserContext = optimizelyClient.createUserContext(userId)
    const { variationKey, variables } = optimizelyUserContext.decide('hero_layout')

    console.log(`For user=${userId}\tvariation=${variationKey}\tpath=${variables.path}`)
  })
}