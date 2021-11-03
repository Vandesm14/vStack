export enum Op {
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
	/** duplicate the top two values from the stack */
	Dup2,
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

export const compile = (program: string): Op[] => {
	const ops: Op[] = []
	const LINE_FEED = program.indexOf('\r') > 1 ? '\r\n' : '\n'

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

const STACK_SIZE = 256
const BUS_SIZE = 32

export interface runOptions {
	/** returns the stack from the bottom to the stack pointer (instead of the entire allocated stack) */
	shorten?: boolean
	/** sends the state to the console each step (before running an op) */
	debug?: boolean
}

export const run = (program: Op[], opt?: runOptions) => {
	const stack = new Uint8Array(STACK_SIZE)
	const bus = new Uint8Array(BUS_SIZE)

	let stackPtr = 0
	let programPtr = 0

	const checkLength = (size: number, p: number) => {
		if (stackPtr - size >= 0) true
		else throw new Error(`Stack underflow on "${Op[program[p - 1]]}" at index ${p}`)
	}

	const pop = () => {
		checkLength(1, programPtr)
		return stack[--stackPtr]
	}

	const push = (value: number) => {
		stack[stackPtr++] = value
	}

	while (programPtr < program.length) {
		const op = program[programPtr++]

		if (opt?.debug) console.log({ stack, stackPtr, program, programPtr, op, Instr: Op[op], arg: program[programPtr] }) // DEBUG

		if (op === Op.Push) {
			push(program[programPtr])
			programPtr++ // skip the immediate value
		} else if (op === Op.Pop) {
			pop()
		} else if (op === Op.Add) {
			const a = pop()
			const b = pop()
			push(a + b)
		} else if (op === Op.Sub) {
			const a = pop()
			const b = pop()
			push(b - a)
		} else if (op === Op.Mul) {
			const a = pop()
			const b = pop()
			push(a * b)
		} else if (op === Op.Div) {
			const a = pop()
			const b = pop()
			push(b / a)
		} else if (op === Op.Swp) {
			const a = pop()
			const b = pop()
			push(a)
			push(b)
		} else if (op === Op.Inc) {
			const a = pop()
			push(a + 1)
		} else if (op === Op.Dec) {
			const a = pop()
			push(a - 1)
		} else if (op === Op.Dup) {
			const a = pop()
			push(a)
			push(a)
		} else if (op === Op.Dup2) {
			const a = pop()
			const b = pop()
			push(b)
			push(a)
			push(b)
			push(a)
		} else if (op === Op.Shl) {
			const a = pop()
			push(a << 1)
		} else if (op === Op.Shr) {
			const a = pop()
			push(a >> 1)
		} else if (op === Op.And) {
			const a = pop()
			const b = pop()
			push(a & b)
		} else if (op === Op.Or) {
			const a = pop()
			const b = pop()
			push(a | b)
		} else if (op === Op.Xor) {
			const a = pop()
			const b = pop()
			push(a ^ b)
		} else if (op === Op.Not) {
			const a = pop()
			push(~a)
		} else if (op === Op.Stkp) {
			const a = pop()
			stackPtr = a
		} else if (op === Op.Stki) {
			stackPtr++
		} else if (op === Op.Stkd) {
			stackPtr--
		} else if (op === Op.Jmp) {
			programPtr = program[programPtr]
		} else if (op === Op.Jmpz) {
			const a = pop()
			if (a === 0) programPtr = program[programPtr]
			else programPtr++
		} else if (op === Op.Jmpnz) {
			const a = pop()
			if (a === 0) programPtr = program[programPtr]
			else programPtr++
		} else if (op === Op.Jmpe) {
			const a = pop()
			const b = pop()
			if (b === a) programPtr = program[programPtr]
			else programPtr++
		} else if (op === Op.Jmpne) {
			const a = pop()
			const b = pop()
			if (b !== a) programPtr = program[programPtr]
			else programPtr++
		} else if (op === Op.Jmpg) {
			const a = pop()
			const b = pop()
			if (b > a) programPtr = program[programPtr]
			else programPtr++
		} else if (op === Op.Jmpge) {
			const a = pop()
			const b = pop()
			if (b >= a) programPtr = program[programPtr]
			else programPtr++
		} else if (op === Op.Jmpl) {
			const a = pop()
			const b = pop()
			if (b < a) programPtr = program[programPtr]
			else programPtr++
		} else if (op === Op.Jmple) {
			const a = pop()
			const b = pop()
			if (b <= a) programPtr = program[programPtr]
			else programPtr++
		} else if (op === Op.Read) {
			// TODO: implement, does nothing at the moment
			stack[stackPtr] = program[programPtr]
			programPtr++
			stackPtr++
		} else if (op === Op.Write) {
			// TODO: implement, does nothing at the moment
			const a = pop()
			console.log(a)
		} else if (op === Op.Halt) {
			if (opt?.shorten) return stack.slice(0, stackPtr)
			else return stack
		} else if (op === Op.DEBUG) {
			console.log('DEBUG:', {programPtr, stackPtr, stack})
		} else {
			throw new Error(`Unknown op: "${op}"`)
		}
	}

	throw new Error('Program ended without halt')
}