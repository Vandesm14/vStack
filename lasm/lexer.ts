import { readLines, readStringDelim, StringReader } from "./deps.ts";

/** Errors related to lexing. */
export enum LexError {
  UnknownToken = "unknown token",
}

/** A token. */
export type Token = {
  /** The token kind. */
  kind: LitTokenKind.Number;
  /** The value. */
  value: number;
} | {
  /** The token kind. */
  kind: KwTokenKind | SymTokenKind;
};

/** Token kinds. */
export type TokenKind = LitTokenKind | KwTokenKind | SymTokenKind;

/** Literal token kinds. */
export enum LitTokenKind {
  /** `123` or `-0.25` */
  Number = "number",
}

/** Keyword token kinds. */
export enum KwTokenKind {
  /** no operation */
	Nop = "nop",

  /** pop value from stack */
	Pop = "pop",

	/** set the stack pointer the value of the top of the stack */
	Sp = "sp",
	// /** set the stack pointer relative to the immediate value */
	// Spr,
	/** increnemt the stack pointer by 1 */
	Spi = "spi",
	/** deccrenemt the stack pointer by 1 */
	Spd = "spd",
	/** swaps the top two values on the stack: [a, b] => [b, a] */
	Swp = "swp",
	/** duplicate the value at the top of the stack */
	Dup = "dup",
	/** duplicate the top two values from the stack */
	Dup2 = "dup2",
	/** Sorry */
	Over = "over",
	/** Sorry */
	Rot = "rot",

	/** initiates a subroutine */
	Proc = "proc",
	/** terminates a subroutine */
	Ret = "ret",

	/** defines a variable (value is inserted at compile-time) */
	Db = "db",

  /** jump to address */
	Jmp = "jmp",
	/** jump to address if top of stack is zero */
	Jmpz = "jmpz",
	/** jump to address if top of stack is not zero */
	Jmpnz = "jmpnz",
	/** jump to address if top of stack is equal to value */
	Jmpe = "jmpe",
	/** jump to address if top of stack is not equal to value */
	Jmpne = "jmpne",
	/** jump to address if top of stack is greater than value */
	Jmpg = "jmpg",
	/** jump to address if top of stack is greater than or equal to value */
	Jmpge = "jmpge",
	/** jump to address if top of stack is less than value */
	Jmpl = "jmpl",
	/** jump to address if top of stack is less than or equal to value */
	Jmple = "jmple",

	/** read value from the buss at address and push it to the stack */
	Read = "read",
	/** write value from the stack to the bus at address */
	Write = "write",
	/** halt the program */
	Halt = "halt",
	/** debug: print all runtime values */
	DEBUG = "debug",
}

/** Operation of tokens. */
export enum SymTokenKind {
	/** add top two values from stack, push the result to the stack, and pop the first value: a op b = rslt: [a, b] => [rslt] */
	Add = "+",
	/** subtract top two values from stack, push the result to the stack, and pop the first value: a op b = rslt: [a, b] => [rslt] */
	Sub = "-",
	/** multiply top two values from stack, push the result to the stack, and pop the first value: a op b = rslt: [a, b] => [rslt] */
	Mul = "*",
	/** divide top two values from stack, push the result to the stack, and pop the first value: a op b = rslt: [a, b] => [rslt] */
	Div = "/",
	/** increment the value at the top of the stack by 1 */
	Inc = "++",
	/** decrement the value at the top of the stack by 1 */
	Dec = "--",
	/** biitwise shoft left the value at the top of the stack */
	Shl = "<<",
	/** biitwise shoft right the value at the top of the stack */
	Shr = ">>",

	/** not yet */
	And = "&",
	/** not yet */
	Or = "|",
	/** not yet */
	Xor = "^",
	/** not yet */
	Not = "~",
}

/** Converts a string into its tokens. */
export async function* lex(
  source: Deno.Reader,
): AsyncIterableIterator<Token> {
  for await (const line of readLines(source)) {
    let comment = false;

    outer:
    for await (let tok of readStringDelim(new StringReader(line), " ")) {
      tok = tok.trim();
      if (tok === "") {
        continue;
      } else if (tok === ";") {
        comment = true;
        continue;
      }

      if (!comment) {
        const num = Number(tok);

        if (!isNaN(num)) {
          try {
            new Uint16Array([num]);
            yield { kind: LitTokenKind.Number, value: num };
            continue;
          } catch {
            console.error(`${num} is not a valid number`);
            Deno.exit(1);
          }
        }

        for (
          const kw of Object.values(KwTokenKind).filter((v) => isNaN(Number(v)))
        ) {
          if (tok === kw) {
            yield { kind: kw };
            continue outer;
          }
        }

        for (
          const sym of Object.values(SymTokenKind).filter((v) => isNaN(Number(v)))
        ) {
          if (tok === sym) {
            yield { kind: sym };
            continue outer;
          }
        }

        throw SyntaxError(`${LexError.UnknownToken}: "${tok}"`);
      }
    }
  }
}
