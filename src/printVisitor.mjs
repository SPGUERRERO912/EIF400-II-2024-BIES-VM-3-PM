import fs from 'fs';
import antlr4 from 'antlr4';

import BIESVMLexer from '../grammar/BIESVMLexer.js';
import BIESVMParser from '../grammar/BIESVMParser.js';
import BIESVMVisitor from '../grammar/BIESVMVisitor.js'; // Usaremos el Visitor en lugar del Listener
import { VM } from '../src/VM.mjs';

class PrintVisitor extends BIESVMVisitor {
  constructor() {
    super();
    this.instructions = []; // Almacenamos las instrucciones
  }

  // Visita el nodo de programa (punto de entrada)
  visitProgram(ctx) {
    this.visitChildren(ctx); // Recorrer todos los nodos hijos del programa
    return this.instructions; // Devolver las instrucciones recogidas
  }

  visitFunDirective(ctx) {
    const functionName = ctx.ID(0).getText();
    const numArgs = ctx.INT() ? ctx.INT().getText() : null;
    const parentId = ctx.ID(1).getText();
    const bytecode = `$FUN ${functionName} args : ${numArgs || 0} parent : ${parentId || 0}`;
    //console.log(bytecode); // Depuración
    this.instructions.push(bytecode);
    return null;
  }

  visitEndDirective(ctx) {
    const functionName = ctx.ID().getText();
    //console.log(`$END ${functionName}`);  // Depuración
    this.instructions.push(`$END ${functionName}`); // Cambiado a $END
    return null;
  }

  visitAppInstruction(ctx) {
    const arg = ctx.INT().getText();
    this.instructions.push(`APP ${arg}`);
    return null;
  }

  visitPopInstruction() {
    //console.log("POP");  // Depuración
    this.instructions.push('POP');
    return null;
  }
  visitSwpInstruction() {
    this.instructions.push('SWP');
    return null;
  }

  visitBldInstruction(ctx) {
    const arg1 = ctx.INT(0).getText();
    const arg2 = ctx.INT(1).getText();
    //console.log(`BLD ${arg1} ${arg2}`);  // Depuración
    this.instructions.push(`BLD ${arg1} ${arg2}`);
    return null;
  }

  visitBstInstruction(ctx) {
    const arg1 = ctx.INT(0).getText(); // Siempre habrá al menos un INT
    const arg2 = ctx.INT(1) ? ctx.INT(1).getText() : null; // Puede que haya un segundo INT o no

    if (arg2) {
      //console.log(`BST ${arg1} ${arg2}`);  // Depuración cuando hay dos argumentos
      this.instructions.push(`BST ${arg1} ${arg2}`);
    } else {
      //console.log(`BST ${arg1}`);  // Depuración cuando hay solo un argumento
      this.instructions.push(`BST ${arg1}`);
    }
    return null;
  }

  visitLdvInstruction(ctx) {
    if (ctx.list()) {
      const listValue = this.visitListDefinition(ctx.list());
      console.log(`Instrucción LDV lista: ${listValue}`);
      // console.log(Array.isArray(listValue));
      this.instructions.push(`LDV ${listValue}`);
    } else if (ctx.STRING()) {
      const value = ctx.STRING().getText();
      console.log(`Instrucción LDV cadena: ${value}`);
      this.instructions.push(`LDV ${value}`);
    } else if (ctx.INT()) {
      const value = ctx.INT().getText();
      console.log(`Instrucción LDV entero: ${value}`);
      this.instructions.push(`LDV ${value}`);
    }
    return null;
  }

  visitListDefinition(ctx) {
    if (!ctx || !ctx.value) {
      console.log('Lista vacía o nula');
      return [];
    }
    const values = ctx.value().map((valueCtx) => this.visitValue(valueCtx));
    return values;
  }

  visitValue(ctx) {
    if (ctx.INT() != null) {
      return parseInt(ctx.INT().getText(), 10);
    } else if (ctx.STRING() != null) {
      return ctx.STRING().getText();
    }
    return null;
  }

  visitLdfInstruction(ctx) {
    const functionName = ctx.ID().getText();
    //console.log(`LDF ${functionName}`);  // Depuración
    this.instructions.push(`LDF ${functionName}`);
    return null;
  }

  visitLdcInstruction(ctx) {
    if (ctx.INT()) {
      const value = ctx.INT().getText();
      //console.log(`LDC ${value}`);  // Depuración
      this.instructions.push(`LDC ${value}`);
    } else {
      const value = ctx.STRING().getText();
      //console.log(`LDC ${value}`);  // Depuración
      this.instructions.push(`LDC ${value}`);
    }
    return null;
  }

  visitAddInstruction() {
    //console.log("ADD");  // Depuración
    this.instructions.push('ADD');
    return null;
  }

  visitMulInstruction() {
    //console.log("MUL");  // Depuración
    this.instructions.push('MUL');
    return null;
  }

  visitDivInstruction() {
    //console.log("DIV");  // Depuración
    this.instructions.push('DIV');
    return null;
  }

  visitSubInstruction() {
    //console.log("SUB");  // Depuración
    this.instructions.push('SUB');
    return null;
  }

  visitNegInstruction() {
    // console.log("NEG");  // Depuración
    this.instructions.push('NEG');
    return null;
  }

  visitSgnInstruction() {
    // console.log("SGN");  // Depuración
    this.instructions.push('SGN');
    return null;
  }

  visitEqInstruction() {
    this.instructions.push('EQ');
    return null;
  }

  visitGtInstruction() {
    this.instructions.push('GT');
    return null;
  }

  visitGteInstruction() {
    this.instructions.push('GTE');
    return null;
  }

  visitLtInstruction() {
    this.instructions.push('LT');
    return null;
  }

  visitLteInstruction() {
    this.instructions.push('LTE');
    return null;
  }
  visitAndInstruction() {
    this.instructions.push('AND');
    return null;
  }

  visitOrInstruction() {
    this.instructions.push('OR');
    return null;
  }

  visitXorInstruction() {
    this.instructions.push('XOR');
    return null;
  }

  visitNotInstruction() {
    this.instructions.push('NOT');
    return null;
  }

  visitSntInstruction() {
    this.instructions.push('SNT');
    return null;
  }

  visitCatInstruction() {
    this.instructions.push('CAT');
    return null;
  }

  visitTosInstruction() {
    this.instructions.push('TOS');
    return null;
  }

  visitLntInstruction() {
    this.instructions.push('LNT');
    return null;
  }

  visitLinInstruction() {
    this.instructions.push('LIN');
    return null;
  }

  visitLtkInstruction() {
    this.instructions.push('LTK');
    return null;
  }

  visitLrkInstruction() {
    this.instructions.push('LRK');
    return null;
  }

  visitTolInstruction() {
    this.instructions.push('TOL');
    return null;
  }

  visitPrnInstruction() {
    //console.log("PRN");  // Depuración
    this.instructions.push('PRN');
    return null;
  }

  visitRetInstruction() {
    //console.log("RET");  // Depuración
    this.instructions.push('RET');
    return null;
  }

  visitCstInstruction() {
    this.instructions.push('CST');
    return null;
  }

  visitInoInstruction(ctx) {
    let instanceOff = ''; // Use 'let' to allow reassignment

    const instanceMap = new Map([
      [
        ctx.number(),
        () => {
          instanceOff = ctx.number().getText();
        },
      ],
      [
        ctx.string(),
        () => {
          instanceOff = ctx.string().getText();
        },
      ],
      [
        ctx.cstlist(),
        () => {
          instanceOff = ctx.cstlist().getText();
        },
      ],
    ]);
    for (let [key, action] of instanceMap) {
      if (key) {
        action();
        break;
      }
    }

    this.instructions.push(`INO ${instanceOff}`);
    return null;
  }

  visitHltInstruction() {
    //console.log("HLT");  // Depuración
    this.instructions.push('HLT');
    return null;
  }

  visitVariableDeclaration(ctx) {
    const value = ctx.INT().getText(); // Valor de la variable
    this.instructions.push(`LDV ${value}`); // Cargar el valor en el registro
    this.instructions.push(`BST 0 0`); // Guardar en el entorno de nivel 0
    this.instructions.push(`BLD 0 0`); // Restaurar el entorno
    //console.log(`Variable '${varName}' declarada con valor ${value}`);
    return null;
  }

  visitChildren(ctx) {
    if (!ctx) return;

    // Recorre los hijos del nodo actual y visita cada uno
    for (let i = 0; i < ctx.getChildCount(); i++) {
      this.visit(ctx.getChild(i));
    }
    return null;
  }
}

function test_parser(input_file = './input/input.basm') {
  console.log(`>>> Reading ${input_file}`);

  const input = fs.readFileSync(input_file, 'utf-8');

  // Configurar ANTLR4
  const chars = new antlr4.InputStream(input);
  const lexer = new BIESVMLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new BIESVMParser(tokens);
  parser.buildParseTrees = true;

  // Parsear la entrada y crear el AST
  const ast = parser.program();

  // Recorrer el AST con el visitante
  const visitor = new PrintVisitor();
  const instructions = visitor.visit(ast);

  console.log(`\n>>> Processing ${input_file} done`);
  //console.log(`Instructions: ${instructions.join(', ')}`);  // Depuración

  // Ejecutar las instrucciones en la VM
  const vm = new VM();
  vm.run(instructions);
}

// Exportar el parser para ser utilizado en otros archivos
export default test_parser;
