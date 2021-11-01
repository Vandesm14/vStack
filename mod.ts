enum Op {
	/** no operation */
	Nop,
	/** push value to stack */
	Push,
	/** pop value from stack */
	Pop,
	/** add top two values from stack, push the result to the stack, and pop the first value: a op b = rslt: [a, b] => [rslt] */
	Add,
	/** subtract top two values from stack, push the result to the stack, and pop the first value: a op b = rslt: [a, b] => [rslt] */
	Sub,
	/** multiply top two values from stack, push the result to the stack, and pop the first value: a op b = rslt: [a, b] => [rslt] */
	Mul,
	/** divide top two values from stack, push the result to the stack, and pop the first value: a op b = rslt: [a, b] => [rslt] */
	Div,
	/** swaps the top two values on the stack: [a, b] => [b, a] */
	Swp,
	/** jump to address */
	Jmp,
	/** jump to address if top of stack is zero */
	Jmpz,
	/** jump to address if top of stack is not zero */
	Jmpnz,
	/** jump to address if top of stack is equal to value */
	Jmpe,
	/** jump to address if top of stack is not equal to value */
	Jmpne,
	/** jump to address if top of stack is greater than value */
	Jmpg,
	/** jump to address if top of stack is greater than or equal to value */
	Jmpge,
	/** jump to address if top of stack is less than value */
	Jmpl,
	/** jump to address if top of stack is less than or equal to value */
	Jmple,
	/** read value from the buss at address and push it to the stack */
	Read,
	/** write value from the stack to the bus at address */
	Write,
	/** halt the program */
	Halt,
	/** debug: print all runtime values */
	DEBUG,
}

const Ops = Object.keys(Op).filter(key => Number.isNaN(Number(key))) as (keyof typeof Op)[]

const compile = (program: string): Op[] => {
	const ops: Op[] = []
	const LINE_FEED = program.indexOf('\r') ? '\r\n' : '\n'

	for (let line of program.split(LINE_FEED)) {
		if (line.trim().startsWith(';')) continue
		line = line.trim().split(';')[0]
		const [op, ...args] = line.split(' ').filter(el => el !== '\n')
		switch (op) {
			case 'push':
				ops.push(Op.Push, ...args.map(Number))
				break
			case 'pop':
				ops.push(Op.Pop)
				break
			case 'add':
				ops.push(Op.Add)
				break
			case 'sub':
				ops.push(Op.Sub)
				break
			case 'mul':
				ops.push(Op.Mul)
				break
			case 'div':
				ops.push(Op.Div)
				break
			case 'swp':
				ops.push(Op.Swp)
				break
			case 'jmp':
				ops.push(Op.Jmp, ...args.map(Number))
				break
			case 'jmpz':
				ops.push(Op.Jmpz, ...args.map(Number))
				break
			case 'jmpnz':
				ops.push(Op.Jmpnz, ...args.map(Number))
				break
			case 'jmpe':
				ops.push(Op.Jmpe, ...args.map(Number))
				break
			case 'jmpne':
				ops.push(Op.Jmpne, ...args.map(Number))
				break
			case 'jmpg':
				ops.push(Op.Jmpg, ...args.map(Number))
				break
			case 'jmpge':
				ops.push(Op.Jmpge, ...args.map(Number))
				break
			case 'jmpl':
				ops.push(Op.Jmpl, ...args.map(Number))
				break
			case 'jmple':
				ops.push(Op.Jmple, ...args.map(Number))
				break
			case 'read':
				ops.push(Op.Read, ...args.map(Number))
				break
			case 'write':
				ops.push(Op.Write, ...args.map(Number))
				break
			case 'halt':
				ops.push(Op.Halt)
				break
			case 'debug':
				ops.push(Op.DEBUG)
				break
			default:
				throw new Error(`Unknown op: "${op}"`)
		}
	}

	return ops
}

const PROGRAM: Op[] = compile(Deno.readTextFileSync('./program.txt'))

const STACK_SIZE = 2^8 // 256 bytes
const BUS_SIZE = 2*5 // 32 bytes

const run = (program: Op[]) => {
	const stack = new Uint8Array(STACK_SIZE)
	const bus = new Uint8Array(BUS_SIZE)

	let stackPtr = 0
	let programPtr = 0

	while (programPtr < program.length) {
		const op = program[programPtr]
		programPtr++

		switch (op) {
			case Op.Nop:
				break
			case Op.Push:
				stack[stackPtr] = program[programPtr]
				programPtr++
				stackPtr++
				break
			case Op.Pop:
				stackPtr--
				break
			case Op.Add:
				stack[stackPtr - 2] += stack[stackPtr - 1]
				stackPtr--
				break
			case Op.Sub:
				stack[stackPtr - 1] -= stack[stackPtr]
				stackPtr--
				break
			case Op.Mul:
				stack[stackPtr - 1] *= stack[stackPtr]
				stackPtr--
				break
			case Op.Div:
				stack[stackPtr - 1] /= stack[stackPtr]
				stackPtr--
				break
			case Op.Swp:
				{
					const tmp = stack[stackPtr - 2]
					stack[stackPtr - 2] = stack[stackPtr - 1]
					stack[stackPtr - 1] = tmp
				}
				break
			case Op.Jmp:
				programPtr = program[programPtr]
				break
			case Op.Jmpz:
				if (stack[stackPtr - 1] === 0) {
					programPtr = program[programPtr]
				} else {
					programPtr++
				}
				break
			case Op.Jmpnz:
				if (stack[stackPtr - 1] !== 0) {
					programPtr = program[programPtr]
				} else {
					programPtr++
				}
				break
			case Op.Jmpe:
				if (stack[stackPtr - 1] === program[programPtr]) {
					programPtr = program[programPtr + 1]
				} else {
					programPtr += 2
				}
				break
			case Op.Jmpne:
				if (stack[stackPtr - 1] !== program[programPtr]) {
					programPtr = program[programPtr + 1]
				} else {
					programPtr += 2
				}
				break
			case Op.Jmpg:
				if (stack[stackPtr - 1] > program[programPtr]) {
					programPtr = program[programPtr + 1]
				} else {
					programPtr += 2
				}
				break
			case Op.Jmpge:
				if (stack[stackPtr - 1] >= program[programPtr]) {
					programPtr = program[programPtr + 1]
				} else {
					programPtr += 2
				}
				break
			case Op.Jmpl:
				if (stack[stackPtr - 1] < program[programPtr]) {
					programPtr = program[programPtr + 1]
				} else {
					programPtr += 2
				}
				break
			case Op.Jmple:
				if (stack[stackPtr - 1] <= program[programPtr]) {
					programPtr = program[programPtr + 1]
				} else {
					programPtr += 2
				}
				break
			case Op.Read:
				stack[stackPtr] = program[programPtr]
				programPtr++
				stackPtr++
				break
			case Op.Write:
				console.log(stack[stackPtr - 1])
				stackPtr--
				break
			case Op.Halt:
				return
			case Op.DEBUG:
				console.log({programPtr, data: program[programPtr], stackPtr, stack})
				break
			default:
				throw new Error(`Unknown op: "${op}"`)
		}

		for (let i = stackPtr; i < stack.length; i++) {
			stack[i] = 0
		}
	}

	throw new Error('Program ended without halt')
}

run(PROGRAM)