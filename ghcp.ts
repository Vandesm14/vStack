const StackMachine = (input: string) => {
  const stack: number[] = [];
  const operators: Record<string, (a: number, b: number) => number> = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
  };

  const push = (value: number) => stack.push(value);
  const pop = () => stack.pop();
  const isLowest = () => stack.length < 2;
  const isOperator = (value: string) => Object.keys(operators).includes(value);
  const performOperation = (operator: string) => {
		if (isLowest()) throw new Error('Stack Underflow');
    const value = pop()!;
    const previous = pop()!;
    push(operators[operator](previous, value));
  };

  const tokenize = (input: string) => input.split(' ');
  const evaluate = (tokens: string[]) => {
    for (const token of tokens) {
      if (token === '(') {
        continue;
      }
      if (token === ')') {
        continue;
      }
      if (isOperator(token)) {
        performOperation(token);
        continue;
      }
      push(+token);
    }
    return pop();
  };

  const tokens = tokenize(input);
	console.log(stack);
  return evaluate(tokens);
};

console.log(StackMachine('( 2 2 + ) ( 5 + ) ( 3 - )'));