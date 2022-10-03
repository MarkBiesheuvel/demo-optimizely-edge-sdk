import https from 'https' // Standard library

/**
 * getDatafileRequest - Retrieves the datafile from the Optimizely CDN and returns as a JSON object.
 *
 * @param string datafilePath - CDN path to datafile based on SDK Key.
 * @returns Promise
 */
 export const getDatafileRequest = async (datafilePath) => new Promise(
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
