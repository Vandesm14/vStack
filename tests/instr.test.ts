import { run, runOptions, compile } from '../lib.ts'
import { it, assertObjectMatch } from '../testlib.ts'

const compileAndRun = (code: string, opt?: runOptions) => {
	return run(compile(code), { shorten: true, ...opt })
}

const assertArrayMatch = (a: number[], b: number[]) => {
	assertObjectMatch({ value: a }, { value: b })
}

it('halt', async ({ step }) => {
	await step('normal halt', () => {
		const result = compileAndRun(`
			halt
		`)
		assertArrayMatch([...result], [])
	})

	await step('halt w/o shorten opt', () => {
		const result = compileAndRun(`
			halt
		`, { shorten: false })
		assertArrayMatch([...result], new Array(10).fill(0))
	})
})

it('push', () => {
	const result = compileAndRun(`
		push 10
		halt
	`)
	assertArrayMatch([...result], [10])
})

it('pop', () => {
	const result = compileAndRun(`
		push 10
		push 20
		pop
		halt
	`)
	assertArrayMatch([...result], [10])
})

it('add', () => {
	const result = compileAndRun(`
		push 10
		push 20
		add
		halt
	`)
	assertArrayMatch([...result], [30])
})

it('sub', () => {
	const result = compileAndRun(`
		push 20
		push 10
		sub
		halt
	`)
	assertArrayMatch([...result], [10])
})

it('mul', () => {
	const result = compileAndRun(`
		push 10
		push 20
		mul
		halt
	`)
	assertArrayMatch([...result], [200])
})

it('div', () => {
	const result = compileAndRun(`
		push 20
		push 10
		div
		halt
	`)
	assertArrayMatch([...result], [2])
})

it('inc', () => {
	const result = compileAndRun(`
		push 10
		inc
		halt
	`)
	assertArrayMatch([...result], [11])
})

it('dec', () => {
	const result = compileAndRun(`
		push 10
		dec
		halt
	`)
	assertArrayMatch([...result], [9])
})

it('shl', () => {
	const result = compileAndRun(`
		push 10
		shl
		halt
	`)
	assertArrayMatch([...result], [10 << 1])
})

it('shr', () => {
	const result = compileAndRun(`
		push 10
		shr
		halt
	`)
	assertArrayMatch([...result], [10 >> 1])
})

it('and', () => {
	const result = compileAndRun(`
		push 10
		push 20
		and
		halt
	`)
	assertArrayMatch([...result], [10 & 20])
})

it('or', () => {
	const result = compileAndRun(`
		push 10
		push 20
		or
		halt
	`)
	assertArrayMatch([...result], [10 | 20])
})

it('xor', () => {
	const result = compileAndRun(`
		push 10
		push 20
		xor
		halt
	`)
	assertArrayMatch([...result], [10 ^ 20])
})

it('not', () => {
	const result = compileAndRun(`
		push 10
		not
		halt
	`)
	assertArrayMatch([...result], [...new Float32Array([~10])])
})

// TODO: Implement sp
it('sp', async ({ step }) => {
	await step('set zero', () => {
		const result = compileAndRun(`
			push 10
			push 20
			push 0
			sp
			halt
		`)
		assertArrayMatch([...result], [10,20])
	})

	await step('set zero (+spi)', () => {
		const result = compileAndRun(`
			push 10
			push 20
			spi
			push 0
			sp
			halt
		`)
		assertArrayMatch([...result], [10,20])
	})

	await step('set one', () => {
		const result = compileAndRun(`
			push 10
			push 20
			push 1
			sp
			halt
		`)
		assertArrayMatch([...result], [10])
	})
})

it('spi', () => {
	const result = compileAndRun(`
		push 10
		push 20
		spi
		halt
	`)
	assertArrayMatch([...result], [10,20,0])
})

it('spd', () => {
	const result = compileAndRun(`
		push 10
		push 20
		spd
		halt
	`)
	assertArrayMatch([...result], [10])
})

it('swp', () => {
	const result = compileAndRun(`
		push 20
		push 10
		swp
		halt
	`)
	assertArrayMatch([...result], [10,20])
})

it('dup', () => {
	const result = compileAndRun(`
		push 10
		dup
		halt
	`)
	assertArrayMatch([...result], [10,10])
})

it('dup2', () => {
	const result = compileAndRun(`
		push 10
		push 20
		dup2
		halt
	`)
	assertArrayMatch([...result], [10,20,10,20])
})

it('over', () => {
	const result = compileAndRun(`
		push 10
		push 20
		over
		halt
	`)
	assertArrayMatch([...result], [10,20,10])
})

it('rot', () => {
	const result = compileAndRun(`
		push 10
		push 20
		push 30
		rot
		halt
	`)
	assertArrayMatch([...result], [20,30,10])
})

it('jmp', async ({ step }) => {
	await step('jump to next line', () => {
		const result = compileAndRun(`
			push 10
			push 5
			jmp
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [10,20,30])
	})

	await step('jump past a line', () => {
		const result = compileAndRun(`
			push 10
			push 7
			jmp
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [10,30])
	})
})

it('jmpz', async ({ step }) => {
	await step('if zero', () => {
		const result = compileAndRun(`
			push 10
			push 0
			push 9
			jmpz
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [10,30])
	})

	await step('if not zero', () => {
		const result = compileAndRun(`
			push 10
			push 1
			push 9
			jmpz
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [10,20,30])
	})
})

it('jmpnz', async ({ step }) => {
	await step('if not zero', () => {
		const result = compileAndRun(`
			push 10
			push 0
			push 9
			jmpnz
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [10,20,30])
	})

	await step('if zero', () => {
		const result = compileAndRun(`
			push 10
			push 1
			push 9
			jmpnz
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [10,30])
	})
})

it('jmpe', async ({ step }) => {
	await step('if equal', () => {
		const result = compileAndRun(`
			push 10
			push 10
			push 9
			jmpe
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [30])
	})

	await step('if not equal', () => {
		const result = compileAndRun(`
			push 10
			push 1
			push 9
			jmpe
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [20,30])
	})
})

it('jmpne', async ({ step }) => {
	await step('if not equal', () => {
		const result = compileAndRun(`
			push 10
			push 1
			push 9
			jmpne
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [30])
	})

	await step('if equal', () => {
		const result = compileAndRun(`
			push 10
			push 10
			push 9
			jmpne
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [20,30])
	})
})

it('jmpg', async ({ step }) => {
	await step('if greater than', () => {
		const result = compileAndRun(`
			push 10
			push 1
			push 9
			jmpg
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [30])
	})

	await step('if not greater than', () => {
		const result = compileAndRun(`
			push 10
			push 10
			push 9
			jmpg
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [20,30])
	})
})

it('jmpge', async ({ step }) => {
	await step('if greater than', () => {
		const result = compileAndRun(`
			push 10
			push 1
			push 9
			jmpge
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [30])
	})

	await step('if equal', () => {
		const result = compileAndRun(`
			push 10
			push 10
			push 9
			jmpge
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [30])
	})

	await step('if not greater than or equal', () => {
		const result = compileAndRun(`
			push 10
			push 11
			push 9
			jmpge
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [20,30])
	})
})

it('jmpl', async ({ step }) => {
	await step('if less than', () => {
		const result = compileAndRun(`
			push 1
			push 10
			push 9
			jmpl
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [30])
	})

	await step('if not less than', () => {
		const result = compileAndRun(`
			push 10
			push 10
			push 9
			jmpl
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [20,30])
	})
})

it('jmple', async ({ step }) => {
	await step('if less than', () => {
		const result = compileAndRun(`
			push 1
			push 10
			push 9
			jmple
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [30])
	})

	await step('if equal', () => {
		const result = compileAndRun(`
			push 10
			push 10
			push 9
			jmple
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [30])
	})

	await step('if not less than or equal', () => {
		const result = compileAndRun(`
			push 10
			push 1
			push 9
			jmple
			push 20
			push 30
			halt
		`)
		assertArrayMatch([...result], [20,30])
	})
})

it.run()