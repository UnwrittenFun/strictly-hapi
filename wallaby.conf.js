module.exports = wallaby => ({
    testFramework: 'ava',
    files: [
        'src/**/*.ts',
        '!src/**/*.test.ts',
    ],
    tests: [
        'src/**/*.test.ts',
        '!src/**/*.integration.test.ts',
    ],
    env: {
        type: 'node',
        runner: 'node'
    }
});
