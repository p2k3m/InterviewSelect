process.env.AWS_REGION = process.env.AWS_REGION ?? 'us-east-1';
process.env.USER_TABLE = process.env.USER_TABLE ?? 'interviewselect-users';
const localstackHost = process.env.LOCALSTACK_HOSTNAME ?? process.env.LOCALSTACK_HOST ?? 'localhost';
const localstackEndpoint = process.env.LOCALSTACK_ENDPOINT ?? `http://${localstackHost}:4566`;

process.env.DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT ?? localstackEndpoint;
process.env.COGNITO_ENDPOINT = process.env.COGNITO_ENDPOINT ?? localstackEndpoint;
process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID ?? 'test';
process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY ?? 'test';

jest.setTimeout(30000);
