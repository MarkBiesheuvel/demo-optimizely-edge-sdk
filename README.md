# Demo: Optimizely Full Stack with Edge SDK

...

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