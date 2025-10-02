import type { Config } from 'jest';

const baseConfig: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};

const config: Config = {
  projects: [
    {
      ...baseConfig,
      displayName: 'unit',
      testMatch: ['**/tests/unit/**/*.test.ts'],
    },
    {
      ...baseConfig,
      displayName: 'integration',
      testMatch: ['**/tests/integration/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.ts'],
    },
  ],
};

export default config;
