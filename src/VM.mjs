import { ContextHandler } from './contextHandler.mjs';
import { ContextLoader } from './contextLoader.mjs';

export class VM {
    constructor() {
        this.register = [];                                                         //S
        this.environment = [Array.from({ length: 10 }, () => [])];                  //B
        this.functions = {};                                                        //C
        this.callStack = [];                                                        //D 
        this.currentFunction = null;
        this.contextHandler = new ContextHandler(this);
        this.contextLoader = new ContextLoader(this, this.contextHandler);
        this.halted = false; 
        this.programCounter = 0;
    }

    execute(instruction) {
        if (this.halted) return; 
        const parts = instruction.split(' ');
        const actions = new Map([
            ['LDV', () => {
                const value = parts[1];  
                const isSignedNumber = /^[-+]?\d+$/.test(value);  
                if (isSignedNumber) {
                    const num = parseInt(value, 10);
                    this.register.push(num);
                } else if (value.startsWith('"') && value.endsWith('"')) {
                    const str = value.replace(/^"|"$/g, '');  
                    this.register.push(str);
                } else {
                    const valueArr = value ? value.split(',').map(Number) : [];  
                    this.register.push(valueArr);
                }
            }],
            ['LDF', () => this.register.push(parts[1])], 
            ['POP', () => this.register.pop()],
            ['SWP', () => {
                const n = this.register.pop();   
                const m = this.register.pop();   
                this.register.push(n);           
                this.register.push(m);         
            }],
            ['BST', () => this.environment[parseInt(parts[1], 10)][parseInt(parts[2], 10)] = this.register.pop()],
            ['BLD', () => {
                const [envIndex, valueIndex] = [parseInt(parts[1], 10),parseInt(parts[2], 10)];
                const value = this.environment[envIndex][valueIndex]; 
                this.register.push(value);
                this.environment[envIndex][valueIndex] = [];
            }],
            ['ADD', () => this.register.push( this.register.pop() + this.register.pop())],
            ['MUL', () => this.register.push(this.register.pop() * this.register.pop())],
            ['DIV', () => this.register.push(this.register.pop() / this.register.pop())],
            ['SUB', () => this.register.push(this.register.pop() - this.register.pop())],
            ['NEG', () => {this.register.push(-this.register.pop())}],
            ['SGN', () => this.register.pop() > 0 ? this.register.push(1) : this.register.push(0)],
            ['EQ', () => {this.register.push(this.register.pop() === this.register.pop() ? 1 : 0);}],
            ['GT', () => {this.register.push(this.register.shift() > this.register.pop() ? 1 : 0);}],
            ['GTE', () => {this.register.push(this.register.shift() >= this.register.pop() ? 1 : 0);}],
            ['LT', () => {this.register.push(this.register.shift() < this.register.pop() ? 1 : 0);}],
            ['LTE', () => {this.register.push(this.register.shift() <= this.register.pop() ? 1 : 0);}],
            ['AND', ()=>{this.register.push((this.register.pop() && this.register.pop()) ? 1 : 0);}],
            ['OR', ()=>{this.register.push((this.register.pop() || this.register.pop()) ? 1 : 0);}],
            ['XOR', ()=>{
                const n = this.register.pop();
                const m = this.register.pop();
                this.register.push((n ? !m : m) ? 1 : 0);
            }],
            ['NOT', ()=>{this.register.push(!this.register.pop() ? 1 : 0);}],
            ['SNT', ()=>{this.register.push(typeof this.register.pop() ==='string' && this.register.pop() === "" ? 1 : 0);}],
            ['CAT', ()=>{this.register.push(`${this.register.shift() + ' ' + this.register.pop()}`);}],
            ['TOS', ()=>{this.register.push(`"${this.register.pop().toString()}"`);}],
            ['LNT', () => {
                const v = this.register.pop();
                this.register.push((Array.isArray(v) && v.length === 0) ? 1 : 0);
            }],
            ['LIN', () => {
                const v = this.register.pop();     
                const list = this.register.pop();  
                if (Array.isArray(list)) {
                    list.unshift(v);
                    this.register.push(list);
                } else {
                    console.error("LIN: El valor no es una lista, valor actual:", list);  
                    throw new Error("LIN: El valor no es una lista.");
                }
            }],
            ['LTK', () => {
                const k = this.register.pop();
                const list = this.register.pop();
                if (Array.isArray(list) && typeof k === 'number') {
                    if (k >= 0 && k < list.length) {
                        this.register.push(list[k]);
                    } else {
                        throw new Error("LTK: Índice fuera de rango.");
                    }
                } else {
                    throw new Error("LTK: K no es un número o V no es una lista.");
                }
            }],
            ['LRK', () => {
                const k = this.register.pop() + 1; 
                const list = this.register.pop();
                if (Array.isArray(list) && typeof k === 'number') {
                    if (k >= 0 && k < list.length) {
                        this.register.push(list.slice(k));
                    } else {
                        throw new Error("LRK: Índice fuera de rango.");
                    }
                } else {
                    throw new Error("LRK: K no es un número o V no es una lista.");
                }
            }],
            ['TOL', () => {
                const v = this.register.pop();
                if (Array.isArray(v)) {
                    this.register.push(v);
                }
                else { 
                    const resArr = isNaN(v) ? Array.from(v) : Array.from(String(v)).map(Number);  
                    this.register.push(resArr);
                } 
            }],
            ['APP', () => {
                this.programCounter++;
                const functionName = this.register.pop(); 
                this.callStack.push({parent: this.functions[functionName].parent, args: parts[1]});
                this.contextLoader.loadFunction(functionName); 
                this.programCounter = 0;
            }],
            ['PRN', () => console.log(this.register.pop())],
            ['HLT', () => this.halted = true],
            ['$FUN', () => {
                this.currentFunction = parts[1];
                this.functions[this.currentFunction] = { instructions: [], parent: parts[7] }; 
            }],
            ['$END', () => {
                this.currentFunction = null;
            }],
            ['RET', () => {
                const callFrame = this.callStack.pop(); 
                const parentFunction = callFrame?.parent;
                if (parentFunction) {
                    this.contextLoader.returnFromFunction();
                    this.currentFunction = null;
                } else {
                    console.log("No hay más funciones a las que retornar. VM HALTED.");
                    this.halted = true; 
                }
            }],
            ['CST', () => {
                const valToCast = this.register.pop();
                if(parts[1] === 'string') {
                    this.register.push(Array.isArray(valToCast) ? valToCast.toString() : String(valToCast));
                }
                else if(parts[1] === 'list') {
                    this.register.push(isNaN(valToCast) ? Array.from(valToCast) : Array.from(String(valToCast)).map(Number));
                }
                else{
                    const auxCast = Array.isArray(valToCast) ? valToCast : Number(valToCast);
                    isNaN(auxCast) ? (() => { throw new Error("Cannot cast array or chars to number"); })() : this.register.push(auxCast);
                }
            }],
            ['INO', () =>  { 
                const currVal = this.register.pop();
                this.register.push((parts[1] === "list") ? Array.isArray(currVal) : (typeof currVal == parts[1]))
            }],
            ['BR', () => {
                const sign = parts[1].charAt(0);
                    const offset = parseInt(parts[1].slice(1), 10);
                    this.programCounter += (sign === '+') ? offset : -offset;
                    this.programCounter--; 
            }],
            ['BT', () => {
                if (this.register.length === 0) {
                    console.error("Error: No hay valores en el registro para evaluar la condición de BT.");
                    this.halted = true; 
                    return;
                }
                const condition = this.register.pop();
                if (condition === 1 || condition === true) { 
                    const sign = parts[1].charAt(0);
                    const offset = parseInt(parts[1].slice(1), 10);
                    this.programCounter += (sign === '+') ? offset : -offset;
                    this.programCounter--; 
                }
            }],
            ['BF', () => {
                if (this.register.length === 0) {
                    console.error("Error: No hay valores en el registro para evaluar la condición de BF.");
                    this.halted = true; 
                    return;
                }
                
                const condition = this.register.pop();
                
                if (condition === 0 || condition === false) { 
                    const sign = parts[1].charAt(0);
                    const offset = parseInt(parts[1].slice(1), 10);
                    this.programCounter += (sign === '+') ? offset : -offset;
                    this.programCounter--; 
                }
            }],
            ['INI', () => {
                const functionName = parts[1];
                if (this.functions[functionName]) {
                    this.register = [];
                    this.environment = [Array.from({ length: 10 }, () => [])];
                    this.callStack = [];
                    this.currentFunction = functionName;

                    this.contextHandler.current = functionName;
                    this.run(this.functions[functionName].instructions);
                } else {
                    throw new Error(`Función ${functionName} no encontrada.`);
                }
            }],
           ['NOP', () => { return undefined; }]
        ]);

        const action = actions.get(parts[0]);
        if (action) {
            if (this.currentFunction && parts[0] !== '$FUN' && parts[0] !== '$END') {
                this.functions[this.currentFunction].instructions.push(instruction);
            } else {
                action();
            }
        }
    }

    run(instructions) {
        for (let i = this.programCounter; i < instructions.length; i++) {
            this.programCounter = i;  
            this.execute(instructions[i]);
            if (this.halted) break;
        }
        (this.programCounter == instructions.length-1) ? this.programCounter = 0 : 0;
        if (!this.halted && this.functions['$0'] && this.currentFunction === null) {
            this.run(this.functions['$0'].instructions);
        } else if (!this.halted && !this.currentFunction) {
            console.error('No se encontró la función principal $0');
        }
    }
}