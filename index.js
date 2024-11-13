import { Command } from 'commander';
import fs from 'fs';
import test_parser from './src/printVisitor.mjs';
import generateBytecode from './src/printVisitor_bies.mjs'

generateBytecode('C:/Users/sebas/Desktop/EIF400-II-2024-BIES-VM-3-PM/input_bies/testcase1.bies', 'C:/Users/sebas/Desktop/EIF400-II-2024-BIES-VM-3-PM/input_bies/testcase1.basm');
test_parser();