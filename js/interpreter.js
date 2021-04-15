window["10IPL"] = (() => {
    var run = (program = new Uint8Array(0), input = new Uint8Array(0)) => {
        if (!program || program.constructor != Uint8Array)
            return null;

        input = input.slice(0, 64 * 1024);

        var storage = new Uint8Array([...program.slice(0, 64 * 1024), ...new Uint8Array(64 * 1024 - program.length)]);
        var registers = new Uint8Array(8);

        var input_counter = 0;
        var print = [];

        var instruction;

        do {
            instruction = storage[registers[6] * 256 + registers[7]];
            
            if ((instruction & 0b11000000) == 0b01000000) {
                registers[(instruction & 0b00111000) / 8] = registers[(instruction & 0b00111000) / 8] ^ registers[instruction & 0b00000111];
            } else if ((instruction & 0b11000000) == 0b10000000) {
                registers[(instruction & 0b00111000) / 8] = 255 - (registers[(instruction & 0b00111000) / 8] | registers[instruction & 0b00000111]);
            } else {
                switch ((instruction & 0b11110000) / 16) {
                    case 0b0000:
                        registers[(instruction & 0b00001110) / 2] = 0;

                        break;
                    case 0b0001:
                        registers[(instruction & 0b00001110) / 2] = (registers[(instruction & 0b00001110) / 2] + 1) % 256;

                        break;
                    case 0b0010:
                        registers[(instruction & 0b00001110) / 2] = (registers[(instruction & 0b00001110) / 2] * 2) % 256 + (registers[(instruction & 0b00001110) / 2] / 128 | 0);

                        break;
                    case 0b0011:
                        if (print.length < 64 * 1024)
                            print.push(registers[(instruction & 0b00001110) / 2]);

                        break;
                    case 0b1100:
                        if (input_counter < input.length) {
                            registers[(instruction & 0b00001110) / 2] = input[input_counter];

                            input_counter = input_counter + 1 % (64 * 1024);
                        } else {
                            registers[(instruction & 0b00001110) / 2] = 0;
                        }

                        break;
                    case 0b1101:
                        registers[(instruction & 0b00001110) / 2] = storage[registers[4] * 256 + registers[5]];

                        break;
                    case 0b1110:
                        storage[registers[4] * 256 + registers[5]] = registers[(instruction & 0b00001110) / 2];

                        break;
                    case 0b1111:
                        registers[6] = registers[4];
                        registers[7] = registers[5];
                        
                        continue;
                }
            }

            registers[7]++;

            if (registers[7] == 0)
                registers[6]++;
            
            if (registers[6] == 0 && registers[7] == 0)
                break;
        } while (1);

        return print;
    };

    var build = (program) => {
        program = String(program).split("\n").map(d => d.replace(/;.*/g, "").replace(/\s+/g, " ").trim()).filter(d => d).map(d => d.split(/, |[, ]/));

        var register_id = (name) => name.match(/r[pi]?[0-7]/) ? ({
            "r0": 0,
            "r1": 1,
            "r2": 2,
            "r3": 3,
            "r4": 4,
            "r5": 5,
            "r6": 6,
            "r7": 7,
            "rp0": 4,
            "rp1": 5,
            "ri0": 6,
            "ri1": 7,
        })[name] : undefined;

        var instructions = [];

        var i;

        for (i = 0; i < program.length; i++) {
            switch (program[i][0]) {
                case "zero":
                case "zro":
                case "zr":
                case "z":
                    if (program[i].length != 2)
                        throw program[i][0] + ": incorrect number of registers";

                    if (register_id(program[i][1]) === undefined)
                        throw program[i][0] + ": incorrect register name";

                    instructions.push(0b00000000 + register_id(program[i][1]) * 2);

                    break;
                case "incr":
                case "incm":
                case "inct":
                case "inc":
                case "inr":
                case "int":
                case "ir":
                case "im":
                case "it":
                case "i":
                    if (program[i].length != 2)
                        throw program[i][0] + ": incorrect number of registers";

                    if (register_id(program[i][1]) === undefined)
                        throw program[i][0] + ": incorrect register name";

                    instructions.push(0b00010000 + register_id(program[i][1]) * 2);

                    break;
                case "rot":
                case "rtr":
                case "rt":
                case "r":
                    if (program[i].length != 2)
                        throw program[i][0] + ": incorrect number of registers";

                    if (register_id(program[i][1]) === undefined)
                        throw program[i][0] + ": incorrect register name";

                    instructions.push(0b00100000 + register_id(program[i][1]) * 2);

                    break;
                case "print":
                case "prnt":
                case "prn":
                case "prt":
                case "pr":
                case "pt":
                case "p":
                    if (program[i].length != 2)
                        throw program[i][0] + ": incorrect number of registers";

                    if (register_id(program[i][1]) === undefined)
                        throw program[i][0] + ": incorrect register name";

                    instructions.push(0b00110000 + register_id(program[i][1]) * 2);

                    break;
                case "xor":
                case "x":
                    if (program[i].length != 3)
                        throw program[i][0] + ": incorrect number of registers";

                    if (register_id(program[i][1]) === undefined || register_id(program[i][2]) === undefined)
                        throw program[i][0] + ": incorrect register name";

                    instructions.push(0b01000000 + register_id(program[i][1]) * 8 + register_id(program[i][2]));

                    break;
                case "nor":
                case "n":
                    if (program[i].length != 3)
                        throw program[i][0] + ": incorrect number of registers";

                    if (register_id(program[i][1]) === undefined || register_id(program[i][2]) === undefined)
                        throw program[i][0] + ": incorrect register name";

                    instructions.push(0b10000000 + register_id(program[i][1]) * 8 + register_id(program[i][2]));

                    break;
                case "input":
                case "inp":
                case "in":
                    if (program[i].length != 2)
                        throw program[i][0] + ": incorrect number of registers";

                    if (register_id(program[i][1]) === undefined)
                        throw program[i][0] + ": incorrect register name";

                    instructions.push(0b11000000 + register_id(program[i][1]) * 2);

                    break;
                case "read":
                case "rdd":
                case "rd":
                    if (program[i].length != 2)
                        throw program[i][0] + ": incorrect number of registers";

                    if (register_id(program[i][1]) === undefined)
                        throw program[i][0] + ": incorrect register name";

                    instructions.push(0b11010000 + register_id(program[i][1]) * 2);

                    break;
                case "write":
                case "writ":
                case "wrt":
                case "wrd":
                case "wr":
                case "wt":
                    if (program[i].length != 2)
                        throw program[i][0] + ": incorrect number of registers";

                    if (register_id(program[i][1]) === undefined)
                        throw program[i][0] + ": incorrect register name";

                    instructions.push(0b11100000 + register_id(program[i][1]) * 2);

                    break;
                case "jump":
                case "jmp":
                case "jm":
                case "jp":
                case "j":
                    if (program[i].length != 1)
                        throw program[i][0] + ": incorrect number of registers";

                    instructions.push(0b11110000);

                    break;
                default:
                    throw program[i][0] + ": unknown instruction";
            }
        }

        return new Uint8Array(instructions);
    };
    
    return {
        build: build,
        run: run
    };
})();
