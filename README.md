# 10IPL

10 Instruction Programming Language: Online interpreter and transpiler

## Basics

10IPL has eight 8-bit registers:

- `r0`
- `r1`
- `r2`
- `r3`
- `rp0` (or `r4`)
- `rp1` (or `r5`)
- `ri0` (or `r6`)
- `ri1` (or `r7`)

The `rp0` and `rp1` registers form `rp`, the pointer register used for memory access and jumping. The `ri0` and `ri1` registers form `ri`, the intruction pointer. The `ri` register stores the address of the _current_ instruction being executed. The `rp0` and `ri0` are the higher bits, and `rp1` and `ri1` are lower.

The online implementation of 10IPL has 64 KiB of memory. This is used for both code and data. All instructions are represented in one byte, and are loaded into memory starting at `0x0000`. Input and print use buffers, which are 64 KiB each. Additional input and output will be discarded. If input is exhausted, taking input will return `00000000`. However, if 64 KiB or more of input are given, the pointer will wrap back around to the first input again.

# Instructions

- Zero: Writes `00000000` to a register
- Increment: Adds one to a register, or wraps around to zero
- Rotate: Rotates a register left (e.g., `10010110` becomes `00101101`)
- Print: Prints a register, without modifying it
- XOR: XORs one register with another, in place
- NOR: NORs one register with another, in place
- Input: Takes input and writes it to a register
- Read: Reads memory (at `rp`) into a register
- Write: Writes to memory (at `rp`) from a register
- Jump: Jumps to `rp`

# Programs

Programs can be written in an assembly-like language. The following aliases can be used for operations:

- Zero: `zero`, `zro`, `zr`, `z`
- Increment: `incr`, `incm`, `inct`, `inc`, `inr`, `int`, `ir`, `im`, `it`, `i`
- Rotate: `rot`, `rtr`, `rt`, `r`
- Print: `print`, `prnt`, `prn`, `prt`, `pr`, `pt`, `p`
- XOR: `xor`, `x`
- NOR: `nor`, `n`
- Input: `input`, `inp`, `in`
- Read: `read`, `rdd`, `rd`
- Write: `write`, `writ`, `wrt`, `wrd`, `wr`, `wt`
- Jump: `jump`, `jmp`, `jm`, `jp`, `j`
