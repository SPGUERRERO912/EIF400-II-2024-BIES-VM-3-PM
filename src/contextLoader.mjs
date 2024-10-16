export class ContextLoader {
  constructor(vm, contextHandler) {
    this.vm = vm;
    this.contextHandler = contextHandler;
  }

  loadFunction(functionName) {
    const func = this.vm.functions[functionName];
    if (!func) {
      console.error(`Function ${functionName} not found!`);
      return;
    } else {
      this.args = this.vm.callStack.map((item) => item.args)[0];
      this.registerCopy = [...this.vm.register];
      this.locals = this.registerCopy.slice(-this.args).reverse();
      this.newEnvironment = Array.from({ length: 10 }, (_, index) =>
        this.args > 0 && this.locals[index] !== undefined
          ? this.locals[index]
          : []
      );
      this.vm.environment.reverse().unshift(this.newEnvironment);
      this.contextHandler.saveContext();
      this.vm.register = this.registerCopy.slice(0, -this.args);
      this.vm.programCounter = 0;
      this.vm.run(func.instructions);
    }
  }

  returnFromFunction() {
    this.contextHandler.restoreContext();
  }
}
