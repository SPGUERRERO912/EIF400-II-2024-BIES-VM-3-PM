export class ContextHandler {
  constructor(vm) {
    this.vm = vm;
    this.contextStack = [];
    this.parent = null;
  }

  saveContext() {
    const currentContext = {
      environment: this.vm.environment.map((env) => [...env]),
      programCounter: this.vm.programCounter,
      callStack: [...this.vm.callStack],
    };
    this.contextStack.push(currentContext);
  }

  restoreContext() {
    if (this.contextStack.length > 0) {
      const restoredContext = this.contextStack.pop();
      this.vm.register = [...this.vm.register];
      this.vm.environment = restoredContext.environment
        .slice()
        .reverse()
        .map((env) => [...env]);
      this.vm.programCounter = restoredContext.programCounter;
    } else {
      console.error('No context to restore!');
    }
  }
}
