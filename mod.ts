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
	/** increment the value at the top of the stack by 1 */
	Inc,
	/** decrement the value at the top of the stack by 1 */
	Dec,
	/** duplicate the value at the top of the stack */
	Dup,
	/** biitwise shoft left the value at the top of the stack */
	Shl,
	/** biitwise shoft right the value at the top of the stack */
	Shr,

	/** not yet */
	And,
	/** not yet */
	Or,
	/** not yet */
	Xor,
	/** not yet */
	Not,

	/** set the stack pointer the value of the top of the stack */
	Stkp,
	/** increnemt the stack pointer by 1 */
	Stki,
	/** deccrenemt the stack pointer by 1 */
	Stkd,

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
	console.log('--------- compiling ---------')
	const ops: Op[] = []
	const LINE_FEED = program.indexOf('\r') ? '\r\n' : '\n'

	for (let line of program.split(LINE_FEED)) {
		if (line.trim().startsWith(';') || line.trim() === '') continue
		line = line.trim().split(';')[0]
		const [op, ...args] = line.split(' ').filter(el => el !== '\n')
		const match = Ops.find(el => el.toLowerCase() === op.toLowerCase())

		if (op && match) {
			ops.push(Op[match], ...args.map(Number))
		} else {
			throw new Error(`Unknown op: "${op}"`)
		}
	}

	return ops
}

console.clear()
const PROGRAM: Op[] = compile(Deno.readTextFileSync('./program.txt'))

const STACK_SIZE = 256
const BUS_SIZE = 32

const run = (program: Op[]) => {
	console.log('---------- running ----------')
	const stack = new Uint8Array(STACK_SIZE)
	const bus = new Uint8Array(BUS_SIZE)

	const checkLength = (size: number, p: number) => {
		if (stackPtr - size >= 0) true
		else throw new Error(`Stack underflow on "${Op[program[p - 1]]}" at index ${p}`)
	}

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
				checkLength(1, programPtr)
				stackPtr--
				break
			case Op.Add:
				checkLength(2, programPtr)
				stack[stackPtr - 2] += stack[stackPtr - 1]
				stackPtr--
				break
			case Op.Sub:
				checkLength(2, programPtr)
				stack[stackPtr - 2] -= stack[stackPtr - 1]
				stackPtr--
				break
			case Op.Mul:
				checkLength(2, programPtr)
				stack[stackPtr - 2] *= stack[stackPtr - 1]
				stackPtr--
				break
			case Op.Div:
				checkLength(2, programPtr)
				stack[stackPtr - 2] /= stack[stackPtr - 1]
				stackPtr--
				break
			case Op.Swp:
				checkLength(2, programPtr)
				{
					const tmp = stack[stackPtr - 2]
					stack[stackPtr - 2] = stack[stackPtr - 1]
					stack[stackPtr - 1] = tmp
				}
				break
			case Op.Inc:
				checkLength(1, programPtr)
				stack[stackPtr - 1]++
				break
			case Op.Dec:
				checkLength(1, programPtr)
				stack[stackPtr - 1]--
				break
			case Op.Dup:
				checkLength(1, programPtr)
				stack[stackPtr] = stack[stackPtr - 1]
				stackPtr++
				break
			case Op.Shl:
				checkLength(1, programPtr)
				stack[stackPtr - 1] <<= 1
				break
			case Op.Shr:
				checkLength(1, programPtr)
				stack[stackPtr - 1] >>= 1
				break
			case Op.And:
				checkLength(2, programPtr)
				stack[stackPtr - 2] &= stack[stackPtr - 1]
				stackPtr--
				break
			case Op.Or:
				checkLength(2, programPtr)
				stack[stackPtr - 2] |= stack[stackPtr - 1]
				stackPtr--
				break
			case Op.Xor:
				checkLength(2, programPtr)
				stack[stackPtr - 2] ^= stack[stackPtr - 1]
				stackPtr--
				break
			case Op.Not:
				checkLength(1, programPtr)
				stack[stackPtr - 1] = ~stack[stackPtr - 1]
				break
			case Op.Stkp:
				checkLength(1, programPtr)
				stackPtr = stack[stackPtr - 1]
				break
			case Op.Stki:
				checkLength(1, programPtr)
				stackPtr++
				break
			case Op.Stkd:
				checkLength(1, programPtr)
				stackPtr--
				break
			case Op.Jmp:
				programPtr = program[programPtr]
				break
			case Op.Jmpz:
				checkLength(1, programPtr)
				if (stack[stackPtr - 1] === 0) {
					programPtr = program[programPtr]
				} else {
					programPtr++
				}
				break
			case Op.Jmpnz:
				checkLength(1, programPtr)
				if (stack[stackPtr - 1] !== 0) {
					programPtr = program[programPtr]
				} else {
					programPtr++
				}
				break
			case Op.Jmpe:
				checkLength(1, programPtr)
				if (stack[stackPtr - 1] === program[programPtr]) {
					programPtr = program[programPtr + 1]
				} else {
					programPtr += 2
				}
				break
			case Op.Jmpne:
				checkLength(1, programPtr)
				if (stack[stackPtr - 1] !== program[programPtr]) {
					programPtr = program[programPtr + 1]
				} else {
					programPtr += 2
				}
				break
			case Op.Jmpg:
				checkLength(1, programPtr)
				if (stack[stackPtr - 1] > program[programPtr]) {
					programPtr = program[programPtr + 1]
				} else {
					programPtr += 2
				}
				break
			case Op.Jmpge:
				checkLength(1, programPtr)
				if (stack[stackPtr - 1] >= program[programPtr]) {
					programPtr = program[programPtr + 1]
				} else {
					programPtr += 2
				}
				break
			case Op.Jmpl:
				checkLength(1, programPtr)
				if (stack[stackPtr - 1] < program[programPtr]) {
					programPtr = program[programPtr + 1]
				} else {
					programPtr += 2
				}
				break
			case Op.Jmple:
				checkLength(1, programPtr)
				if (stack[stackPtr - 1] <= program[programPtr]) {
					programPtr = program[programPtr + 1]
				} else {
					programPtr += 2
				}
				break
			case Op.Read:
				checkLength(1, programPtr)
				stack[stackPtr] = program[programPtr]
				programPtr++
				stackPtr++
				break
			case Op.Write:
				console.log(stack[stackPtr - 1])
				stackPtr--
				break
			case Op.Halt:
				return stack
			case Op.DEBUG:
				console.log('DEBUG:', {programPtr, stackPtr, stack})
				break
			default:
				throw new Error(`Unknown op: "${op}"`)
		}

		// Commenting this out for now, since it's not really needed
		// for (let i = stackPtr; i < stack.length; i++) {
		// 	stack[i] = 0
		// }
	}

	throw new Error('Program ended without halt')
}

console.log('result:', run(PROGRAM))