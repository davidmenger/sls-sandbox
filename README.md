# Serverless Project

## Initialization and configuration

1. Update `package.json`
    - `name`, `description`, `repository`
    - check `deploy:*` tasks regions
2. Update `serverless.yml`
    - **!**`service` and `company` tag
    - `accountIds` for right stages
    - SSL certificates ARNs from Virginia
    - `bucket` addresses
    - generate random `APP_SECRET`
3. Cleanup project: `rm --rf .git && git init && npm i`

## Short stack describtion

- AWS Lambda / Api Gateway backend
- S3 / CloudFront frontend
- ready for DynamoDB/MongoDB
- Handlebars templates & React components

## Run locally

- first, start the database
    - local DynamoDB or MongoDB
- use `npm start` or VSCode's `Launch` configuration

## Test

- `npm test` for linting, frontend and backend tests
- `npm run test:lint` for ESLint

## Deploy

- use `npm run deploy:<environment>` for build and deploy