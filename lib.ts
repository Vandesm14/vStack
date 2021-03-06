import { yellow, blue, bold, gray, red, underline, green, bgRgb24 } from "https://deno.land/std@0.113.0/fmt/colors.ts";
export * from "https://deno.land/std@0.113.0/fmt/colors.ts"

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
	/** increment the value at the top of the stack by 1 */
	Inc,
	/** decrement the value at the top of the stack by 1 */
	Dec,
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
	/** swaps the top two values on the stack: [a, b] => [b, a] */
	Swp,
	/** duplicate the value at the top of the stack */
	Dup,
	/** duplicate the top two values from the stack */
	Dup2,
	/** Sorry */
	Over,
	/** Sorry */
	Rot,

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

	/** defines a variable (value is inserted at compile-time) */
	Db,

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

export const compile = (program: string): (Op | number)[] => {
	const ops: (Op | string)[] = []

	const labels = new Map<string, number>()
	const lines = new Map<number, number>()
	let instr = 0;

	const isNumber = (s: string): boolean => !isNaN(Number(s))

	const tryNumber = (value: string): number | string => {
		if (value.indexOf('0x') === 1) {
			return parseInt(value.slice(2), 16)
		} else if (value.indexOf('0b') === 1) {
			return parseInt(value.slice(2), 2)
		} else if (value.indexOf('0o') === 1) {
			return parseInt(value.slice(2), 8)
		} else if (value.indexOf('\'') === 0) {
			return value.slice(1, -1).charCodeAt(0)
		} else {
			return isNumber(value) ? Number(value) : value
		}
	}

	for (let i in program.split('\n')) {
		let line = program.split('\n')[i].trim()
		line = line.replace(/\r/g, '').split(';')[0].trim()
		if (line === '') continue
		const [op, ...args] = line.split(' ').filter(el => el !== '\n')
		const match = Ops.find(el => el.toLowerCase() === op.toLowerCase())

		instr += op.endsWith(':') ? 0 : 1 // if label, don't increment

		if (op.endsWith(':')) { // if label
			labels.set(op.slice(0, -1), instr)
			continue
		} else if (op && match) {
			lines.set(Number(i), instr - 1)
			// op overrides
			if (op === 'spr' && /[+-]/.test(args[0])) { // if relative stack pointer
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
			throw new SyntaxError(`Unknown op: "${op}" on line ${i}`)
		}

		instr += args.length
	}

	for (const i in ops) {
		const op = ops[i]
		if (typeof op === 'string') {
			if (op.indexOf('@') === 0) { // if address type
				if (op.indexOf('+') === 1 || op.indexOf('-') === 1) { // if positive/negative address
					ops[i] = Number(i) + Number(op.slice(1))
					if (ops[i] < 0 || ops[i] >= ops.length) {
						throw new RangeError(`Address out of bounds: ${op} at index: ${i}`)
					}
				} else if (isNumber(op.slice(1))) { // if line number
					const line = lines.get(Number(op.slice(1)))
					if (line === undefined) {
						throw new RangeError(`Line number out of bounds: ${op} at index: ${i}`)
					} else {
						ops[i] = line
					}
				} else { // if label
					const label = labels.get(op.slice(1))
					if (label === undefined) throw new SyntaxError(`Unknown label: "${op}" at index: ${i}`)
					ops[i] = label
				}
			} else {
				throw new SyntaxError(`Unknown datatype: "${op}" at index: ${i}`)
			}
		}
	}

	return ops as Op[]
}

const STACK_SIZE = 16
const BUS_SIZE = 4
const MEM_SIZE = 1024

export interface runOptions {
	/** returns the stack from the bottom to the stack pointer (instead of the entire allocated stack) */
	shorten?: boolean
	/** sends the state to the console each step (before running an op) */
	debug?: boolean
	/** prints all debug numbers as hexadecimal */
	hex?: boolean
}

export const run = (program: Op[], opt?: runOptions) => {
	const stack = new Float32Array(STACK_SIZE)
	const bus = new Float32Array(BUS_SIZE)

	let sp = 0
	let lsp = 0
	let fp = 0 // used to track the end of a stack independent of the stack pointer
	let ip = 0
	let lip = 0 // used for jumps; last position of the instruction pointer

	let iteration = 0
	let lastStack: Float32Array
	if (opt?.debug) lastStack = new Float32Array(STACK_SIZE)
	else lastStack = new Float32Array(0)

	let changes: string[] = []

	const checkLength = (size: number, p: number) => {
		if (sp + size >= 0) true
		else throw new Error(`Stack underflow on "${Op[program[p - 1]]}" at index ${p}`)
		if (sp + size < STACK_SIZE) true
		else throw new Error(`Stack overflow on "${Op[program[p - 1]]}" at index ${p}`)
	}

	const pop = () => {
		checkLength(-1, ip)
		fp--
		if (opt?.debug) changes.push(red(ifHex(stack[sp - 1], ' ', 2)))
		return stack[--sp]
	}

	const push = (value: number) => {
		checkLength(1, ip)
		if (opt?.debug) changes.push(green(ifHex(value, ' ', 2)))
		fp++
		stack[sp++] = value
	}

	const ifHex = (value: number, string = ' ', pad = opt?.hex ? 2 : 3) => {
		if (opt?.hex) return value.toString(16).padStart(pad, string)
		else return value.toString().padStart(pad, string)
	}

	const pretty = (stack: Float32Array) => {
		return Array.from(stack)
			.map((el, i): string => {
				let str = ifHex(el)
				str = str.padStart(opt?.hex ? 2 : 3, ' ')

				if (i === lsp) str = underline(str)

				if (i === sp) {
					return red(bold(str))
				} else if (stack[i] !== lastStack[i]) {
					return blue(bold(str))
				} else if (i === lsp) {
					return underline(yellow(str))
				} else if (i >= sp) {
					return gray(str)
				} else {
					return str
				}
			})
			// .slice(0, Math.max(fp, sp + 1))
			.join(' ')
	}

	const alternateBg = (str: string) => {
		return iteration % 2 === 1 ? bgRgb24(str, 0x555555) : str
	}

	const debug = (op: number) => {
		console.log(`${alternateBg(ifHex(iteration, ' '))}: ${yellow(ifHex(ip - 1, ' '))}:\t`+
		`(${Op[op]})\t${op === Op.Push ? program[ip - 1] : ''}\t`+
		`${pretty(stack)}\t\t`+
		`${alternateBg('+/-  ') + changes.join(' ')}`)
	}

	const ret = () => {
		if (opt?.shorten) return stack.slice(0, sp)
		else return stack
	}

	while (ip < program.length) {
		const op = program[ip++]

		if (opt?.debug) changes = []

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
		} else if (op === Op.Inc) {
			const a = pop()
			push(a + 1)
		} else if (op === Op.Dec) {
			const a = pop()
			push(a - 1)
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
		} else if (op === Op.Swp) {
			const a = pop()
			const b = pop()
			push(a)
			push(b)
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
		} else if (op === Op.Over) { // a b => a b a (2nd last to top)
			const a = pop()
			const b = pop()
			push(b)
			push(a)
			push(b)
		} else if (op === Op.Rot) { // a b c => b c a (3rd last to top)
			const a = pop()
			const b = pop()
			const c = pop()
			push(b)
			push(a)
			push(c)
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
			return ret()
		} else if (op === Op.DEBUG) {
			debug(op)
		} else {
			throw new Error(`Unknown op: "${op}"`)
		}

		if (opt?.debug) {
			debug(op)
			lastStack = stack.slice()
		}

		iteration++
		lsp = sp
	}

	// throw new Error('Program ended without halt')
	return ret()
}