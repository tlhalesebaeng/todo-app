const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
    testEnvironment: 'node',

    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],

    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },

    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/.next/',
        '/coverage/',
        '/generated/',
        '/generated/prisma/',
        '/generated/prisma/runtime/',
    ],

    coverageReporters: ['text', 'text-summary', 'html', 'lcov'],

    coverageDirectory: 'coverage',
};

module.exports = createJestConfig(customJestConfig);
