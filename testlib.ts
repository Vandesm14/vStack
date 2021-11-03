interface Test {
	name: string
	fn: () => void
	only?: boolean
	skip?: boolean
}

const tests: Test[] = []

interface it {
	(name: string, fn: () => void): this
	only: (name: string, fn: () => void) => this
	skip: (name: string, fn: () => void) => this
	run: (name: string, fn: () => void) => void
}

export function it(name: string, fn: () => void) {
	tests.push({ name, fn })
	// @ts-expect-error: no idea, doesn't work without this
	return this
}

it.only = function(name: string, fn: () => void) {
	tests.push({ name, fn, only: true })
	return this
}

it.skip = function(name: string, fn: () => void) {
	tests.push({ name, fn, skip: true })
	return this
}

it.run = function() {
	let arr = tests.filter(el => !el.skip)
	if (arr.some(el => el.only)) arr = arr.filter(el => el.only)
	for (const test of arr) {
		Deno.test(test.name, test.fn as () => void)
	}
}

export const test = it
export * from 'https://deno.land/std@0.113.0/testing/asserts.ts'