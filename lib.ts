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
	Sp,
	/** set the stack pointer relative to the immediate value */
	Spr,
	/** increnemt the stack pointer by 1 */
	Spi,
	/** deccrenemt the stack pointer by 1 */
	Spd,

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

	/** initiates a subroutine */
	Proc,
	/** terminates a subroutine */
	Ret,

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
	const ops: (Op | string)[] = []

	const labels = new Map<string, number>()
	let instr = 0;

	const tryNumber = (value: string): number | string => {
		const num = Number(value)
		return Number.isNaN(num) ? value : num
	}

	for (let i in program.split('\n')) {
		let line = program.split('\n')[i].trim()
		line = line.replace(/\r/g, '').trim().split(';')[0]
		if (line === '') continue
		const [op, ...args] = line.split(' ').filter(el => el !== '\n')
		const match = Ops.find(el => el.toLowerCase() === op.toLowerCase())

		instr += op.endsWith(':') ? 0 : 1 // if label, don't increment

		if (op.endsWith(':')) { // if label, add to labels
			labels.set(op.slice(0, -1), instr)
			continue
		} else if (op && match) {
			// op overrides
			if (op.startsWith('jmp') && /[+-]/.test(args[0])) { // if relative jump
				ops.splice(Number(i), 0, Op.Push, instr + Number(args[0]) - args.length)
				ops.push(Op[match])
			} else if (op === 'spr' && /[+-]/.test(args[0])) { // if relative stack pointer
				// turn into repeated spi or spd to get the right number
				if (args[0].startsWith('+')) {
					for (let i = 0; i < Number(args[0].slice(1)); i++) {
						ops.push(Op.Spi)
					}
				} else if (args[0].startsWith('-')) {
					for (let i = 0; i < Number(args[0].slice(1)); i++) {
						ops.push(Op.Spd)
					}
				}
			} else {
				ops.push(Op[match], ...args.map(tryNumber))
			}
		} else {
			throw new SyntaxError(`Unknown op: "${op}"`)
		}

		instr += args.length
	}

	for (const i in ops) {
		const op = ops[i]
		if (typeof op === 'string') {
			if (op.startsWith('@')) {
				const label = labels.get(op.slice(1))
				if (label === undefined) throw new Error(`Unknown label: "${op}"`)
				ops.splice(Number(i), 0, Op.Push, label)
			} else {
				ops.splice(ops.indexOf(op), 1)
			}
		}
	}

	return ops as Op[]
}

const STACK_SIZE = 256
const BUS_SIZE = 4
const MEM_SIZE = 1024

export interface runOptions {
	/** returns the stack from the bottom to the stack pointer (instead of the entire allocated stack) */
	shorten?: boolean
	/** sends the state to the console each step (before running an op) */
	debug?: boolean
}

export const run = (program: Op[], opt?: runOptions) => {
	const stack = new Uint8Array(STACK_SIZE)
	const bus = new Uint8Array(BUS_SIZE)

	let sp = 0
	let fp = 0 // used to track the end of a stack independent of the stack pointer
	let ip = 0
	let lip = 0 // used for jumps; last position of the instruction pointer

	const checkLength = (size: number, p: number) => {
		if (sp - size >= 0) true
		else throw new Error(`Stack underflow on "${Op[program[p - 1]]}" at index ${p}`)
	}

	const pop = () => {
		checkLength(1, ip)
		fp--
		return stack[--sp]
	}

	const push = (value: number) => {
		fp++
		stack[sp++] = value
	}

	while (ip < program.length) {
		const op = program[ip++]

		if (opt?.debug) console.log({ stack, sp, fp, program, ip: ip - 1, op, Instr: Op[op], arg: program[ip] }) // DEBUG

		if (op === Op.Push) {
			push(program[ip])
			ip++ // skip the immediate value
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
		} else if (op === Op.Sp) {
			const a = pop()
			sp = fp - a
		} else if (op === Op.Spi) {
			sp++
		} else if (op === Op.Spd) {
			sp--
		} else if (op === Op.Jmp) {
			const a = pop()
			ip = a
		} else if (op === Op.Jmpz) {
			const a = pop()
			const b = pop()
			if (b === 0) ip = a
		} else if (op === Op.Jmpnz) {
			const a = pop()
			const b = pop()
			if (b !== 0) ip = a
		} else if (op === Op.Jmpe) {
			const a = pop()
			const b = pop()
			const c = pop()
			if (c === b) ip = a
		} else if (op === Op.Jmpne) {
			const a = pop()
			const b = pop()
			const c = pop()
			if (c !== b) ip = a
		} else if (op === Op.Jmpg) {
			const a = pop()
			const b = pop()
			const c = pop()
			if (c > b) ip = a
		} else if (op === Op.Jmpge) {
			const a = pop()
			const b = pop()
			const c = pop()
			if (c >= b) ip = a
		} else if (op === Op.Jmpl) {
			const a = pop()
			const b = pop()
			const c = pop()
			if (c < b) ip = a
		} else if (op === Op.Jmple) {
			const a = pop()
			const b = pop()
			const c = pop()
			if (c <= b) ip = a
		} else if (op === Op.Proc) {
			const a = pop()
			push(ip)
			ip = a
			lip = ip + 1
		} else if (op === Op.Ret) {
			ip = pop()
		} else if (op === Op.Read) {
			// TODO: implement, does nothing at the moment
		} else if (op === Op.Write) {
			// TODO: implement, does nothing at the moment
			const a = pop()
			console.log(a)
		} else if (op === Op.Halt) {
			if (opt?.shorten) return stack.slice(0, sp)
			else return stack
		} else if (op === Op.DEBUG) {
			console.log('DEBUG:', { ip: ip - 1, fp, sp, stack })
		} else {
			throw new Error(`Unknown op: "${op}"`)
		}
	}

	throw new Error('Program ended without halt')
}