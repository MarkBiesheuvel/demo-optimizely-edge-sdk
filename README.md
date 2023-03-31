# Demo: Optimizely Full Stack with Edge SDK

A demo that uses the Optimizely Edge SDK to implement a "redirect" experiment.
The user won't actually be redirected, as the CDN will simply request a different URL from the origin server.

## How it works

1. User makes a request to "example.com/index.html".
2. The request is routed to a Content Delivery Network (CDN) like AWS CloudFront.
3. A viewer-request function (or edgeworker):
    - imports the Optimizely Edge SDK.
    - generated a user ID or retrieves it from a cookie.
    - creates a UserContext with an attribute for the current URI.
    - calls the decide method on the `redirect` flag.
    - updates the request object if applicable.
4. The request is now routed to the updated URI at the origin server or the response is retrieved from cache.
5. A view-response function (or edgeworker):
    - Sets the user ID cookie.
6. The response is sent to the user.

## System requirements

This project requires both `aws-cdk` and `rollup`.

```sh
npm install --global aws-cdk
npm install --global rollup
```

## Bundle Lambda functions

The Lambda@Edge functions need to be bundled before deploying. Run `build` command in directory of Lambda@Edge code.

```sh
(cd src/viewer-request; npm run build)
(cd src/viewer-response; npm run build)
```

## Setup of AWS CDK

It is recommended to setup an CDK project in a Python virtual environment. This can easily be done with `venv`.

```sh
python3 -m venv .venv
```

To activate the virtual environment

```sh
source .venv/bin/activate
```

To install CDK libraries:

```sh
pip install -r cdk/requirements.txt
```

To deploy the CDK template:

```sh
cdk deploy
```

## Inspiration

Inspiration taken from https://github.com/optimizely/aws-lambda-at-edge-starter-kit