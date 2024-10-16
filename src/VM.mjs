import { ContextHandler } from './contextHandler.mjs';
import { ContextLoader } from './contextLoader.mjs';

export class VM {
  constructor() {
    this.register = []; //S
    this.environment = [Array.from({ length: 10 }, () => [])]; //B
    this.functions = {}; // Guardar las funciones por nombre                    //C
    this.callStack = []; // Pila para manejar el retorno de funciones           //D
    this.currentFunction = null;
    this.contextHandler = new ContextHandler(this);
    this.contextLoader = new ContextLoader(this, this.contextHandler);
    this.halted = false; // Flag para verificar si la VM ha sido detenida
    this.programCounter = 0;
  }

  execute(instruction) {
    if (this.halted) return; // Detener ejecución si ya se ha llamado HLT
    const parts = instruction.split(' ');
    const actions = new Map([
      [
        'LDV',
        () => {
          const value = parts[1];
          if (value.startsWith('[') && value.endsWith(']')) {
            // Verificar si es una lista
            const listStr = value.slice(1, -1); // Remover los corchetes
            const list = listStr.split(',').map((item) => {
              item = item.trim(); // Remover espacios
              return isNaN(item)
                ? item.replace(/^"|"$/g, '')
                : parseInt(item, 10); // Convertir números o remover comillas
            });
            console.log('Instrucción LDV lista:', list); // Mostrar el array correctamente formado
            this.register.push(list); // Cargar el array en el registro
          } else if (!isNaN(value)) {
            const num = parseInt(value, 10);
            console.log('Instrucción LDV entero:', num); // Mostrar el número
            this.register.push(num);
          } else {
            const str = value.replace(/^"|"$/g, ''); // Remover comillas
            this.register.push(str);
          }
        },
      ],
      ['LDF', () => this.register.push(parts[1])],
      ['POP', () => this.register.pop()],
      [
        'SWP',
        () => {
          const n = this.register.pop(); // Sacar el valor N del registro
          const m = this.register.pop(); // Sacar el valor M del registro
          this.register.push(n); // Insertar N en el registro
          this.register.push(m); // Insertar M en el registro (cambiando de orden)
        },
      ],
      [
        'BST',
        () =>
          (this.environment[parseInt(parts[1], 10)][parseInt(parts[2], 10)] =
            this.register.pop()),
      ],
      [
        'BLD',
        () => {
          const [envIndex, valueIndex] = [
            parseInt(parts[1], 10),
            parseInt(parts[2], 10),
          ];
          const value = this.environment[envIndex][valueIndex];
          this.register.push(value);
          this.environment[envIndex][valueIndex] = [];
        },
      ],
      [
        'ADD',
        () => this.register.push(this.register.pop() + this.register.pop()),
      ],
      [
        'MUL',
        () => this.register.push(this.register.pop() * this.register.pop()),
      ],
      [
        'DIV',
        () => this.register.push(this.register.pop() / this.register.pop()),
      ],
      [
        'SUB',
        () => this.register.push(this.register.pop() - this.register.pop()),
      ],
      [
        'NEG',
        () => {
          this.register.push(-this.register.pop());
        },
      ],
      [
        'SGN',
        () =>
          this.register.pop() > 0
            ? this.register.push(1)
            : this.register.push(0),
      ],
      [
        'EQ',
        () => {
          this.register.push(
            this.register.pop() === this.register.pop() ? 1 : 0
          );
        },
      ],
      [
        'GT',
        () => {
          this.register.push(this.register.pop() > this.register.pop() ? 1 : 0);
        },
      ],
      [
        'GTE',
        () => {
          this.register.push(
            this.register.pop() >= this.register.pop() ? 1 : 0
          );
        },
      ],
      [
        'LT',
        () => {
          this.register.push(this.register.pop() < this.register.pop() ? 1 : 0);
        },
      ],
      [
        'LTE',
        () => {
          this.register.push(
            this.register.pop() <= this.register.pop() ? 1 : 0
          );
        },
      ],
      [
        'AND',
        () => {
          this.register.push(
            this.register.pop() && this.register.pop() ? 1 : 0
          );
        },
      ],
      [
        'OR',
        () => {
          this.register.push(
            this.register.pop() || this.register.pop() ? 1 : 0
          );
        },
      ],
      [
        'XOR',
        () => {
          const n = this.register.pop();
          const m = this.register.pop();
          this.register.push((n ? !m : m) ? 1 : 0);
        },
      ],
      [
        'NOT',
        () => {
          this.register.push(!this.register.pop() ? 1 : 0);
        },
      ],
      [
        'SNT',
        () => {
          this.register.push(
            typeof this.register.pop() === 'string' &&
              this.register.pop() === ''
              ? 1
              : 0
          );
        },
      ],
      [
        'CAT',
        () => {
          this.register.push(
            `"${this.register.pop() + ' ' + this.register.pop()}"`
          );
        },
      ],
      [
        'TOS',
        () => {
          this.register.push(`"${this.register.pop().toString()}"`);
        },
      ],
      [
        'LNT',
        () => {
          const v = this.register.pop();
          this.register.push(Array.isArray(v) && v.length === 0 ? 1 : 0);
        },
      ],
      [
        'LIN',
        () => {
          console.log('Registro antes de LIN:', this.register); // Depurar contenido del registro antes de LIN
          const list = this.register.pop(); // Obtener la lista primero
          const v = this.register.pop(); // Luego obtener el valor
          if (Array.isArray(list)) {
            list.unshift(v);
            this.register.push(list);
          } else {
            console.error('LIN: El valor no es una lista, valor actual:', list); // Imprimir error con más información
            throw new Error('LIN: El valor no es una lista.');
          }
        },
      ],
      [
        'LTK',
        () => {
          const k = this.register.pop();
          const list = this.register.pop();
          if (Array.isArray(list) && typeof k === 'number') {
            if (k >= 0 && k < list.length) {
              this.register.push(list[k]);
            } else {
              throw new Error('LTK: Índice fuera de rango.');
            }
          } else {
            throw new Error('LTK: K no es un número o V no es una lista.');
          }
        },
      ],
      [
        'LRK',
        () => {
          const k = this.register.pop();
          const list = this.register.pop();
          if (Array.isArray(list) && typeof k === 'number') {
            if (k >= 0 && k <= list.length) {
              this.register.push(list.slice(k));
            } else {
              throw new Error('LRK: Índice fuera de rango.');
            }
          } else {
            throw new Error('LRK: K no es un número o V no es una lista.');
          }
        },
      ],
      [
        'TOL',
        () => {
          const v = this.register.pop();
          if (Array.isArray(v)) {
            this.register.push(v);
          } else {
            this.register.push([v]);
          }
        },
      ],
      [
        'APP',
        () => {
          this.programCounter++;
          const functionName = this.register.pop();
          this.callStack.push({
            parent: this.functions[functionName].parent,
            args: parts[1],
          });
          this.contextLoader.loadFunction(functionName);
          this.programCounter = 0;
        },
      ],
      ['PRN', () => console.log(`${this.register[this.register.length - 1]}`)],
      [
        'HLT',
        () => {
          this.halted = true;
          console.log('<<<< HALTED');
        },
      ],
      [
        '$FUN',
        () => {
          this.currentFunction = parts[1];
          this.functions[this.currentFunction] = {
            instructions: [],
            parent: parts[7],
          };
        },
      ],
      ['$END', () => (this.currentFunction = null)],
      [
        'RET',
        () => {
          const callFrame = this.callStack.pop();
          const parentFunction = callFrame?.parent;
          if (parentFunction) {
            this.contextLoader.returnFromFunction();
            this.currentFunction = null;
          } else {
            console.log('No hay más funciones a las que retornar. VM HALTED.');
            this.halted = true; // Detener la VM si no hay más funciones a las que retornar
          }
        },
      ],
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
      this.programCounter = i; // Actualizar el PC antes de ejecutar cada instrucción
      this.execute(instructions[i]);
      if (this.halted) break;
    }
    this.programCounter == instructions.length - 1
      ? (this.programCounter = 0)
      : 0;

    if (!this.halted && this.functions['$0'] && this.currentFunction === null) {
      this.run(this.functions['$0'].instructions);
    } else if (!this.halted && !this.currentFunction) {
      console.error('No se encontró la función principal $0');
    }
  }
}
