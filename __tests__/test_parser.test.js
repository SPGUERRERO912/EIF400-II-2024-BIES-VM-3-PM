import fs from 'fs';
import test_parser from '../src/printVisitor.mjs';
import { jest } from '@jest/globals';

const compareOutputs = (output, expectedOutputPath) => {
    const expectedOutput = fs.readFileSync(expectedOutputPath, 'utf-8').trim();
    const normalizedOutput = output.trim().replace(/\s+/g, ' ');
    const normalizedExpected = expectedOutput.replace(/\s+/g, ' ');
    return normalizedOutput === normalizedExpected; 
}; 

describe('BASM VM Test Cases', () => {
  const testCases = [
    { input: './input/testcase1.basm', expected: './input/expected_outputs/expected_output1.txt' },
    { input: './input/testcase2.basm', expected: './input/expected_outputs/expected_output2.txt' }
  ];

  testCases.forEach(({ input, expected }, index) => {
    test(`Test case ${index + 1}`, () => {
        const originalConsoleLog = console.log; 
        console.log = jest.fn();
      
        test_parser(input);
      
        const output = console.log.mock.calls.map(call => call[0]).join('\n');
      
        originalConsoleLog('Output:', JSON.stringify(output, null, 2));
        originalConsoleLog('Expected:', JSON.stringify(fs.readFileSync(expected, 'utf-8').trim(), null, 2));
      
        console.log = originalConsoleLog;
      
        expect(compareOutputs(output, expected)).toBe(true);
    });
  });
});
