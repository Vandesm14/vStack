import { run, compile } from '../lib.ts'
import { assert } from 'https://deno.land/std@0.113.0/testing/asserts.ts'
import * as _ from 'https://deno.land/x/lodash@4.17.15-es/lodash.js'

const isEqual = _.isEqual

const compileAndRun = (code: string) => {
	return run(compile(code), { shorten: true })
}

const it = Deno.test

it('push', () => {
	const result = compileAndRun(
		'push 10\n'+
		'halt'
	)

	console.log('result', result)

	assert(isEqual([...result], [10]))
})