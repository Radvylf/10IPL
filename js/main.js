window.onload = function() {
    var layout = {
        program: document.getElementById("program"),
        incorrect_program: document.getElementById("incorrect_program"),
        binary: document.getElementById("binary"),
        incorrect_binary: document.getElementById("incorrect_binary"),
        input: document.getElementById("input"),
        input_format: document.getElementById("input_format"),
        input_tip: document.getElementById("input_tip"),
        incorrect_input: document.getElementById("incorrect_input"),
        run_program: document.getElementById("run_program"),
        run_binary: document.getElementById("run_binary"),
        build_program: document.getElementById("build_program"),
        build_binary: document.getElementById("build_binary"),
        print: document.getElementById("print"),
        print_format: document.getElementById("print_format"),
        incorrect_print: document.getElementById("incorrect_print"),
        cgcc_post: document.getElementById("cgcc_post")
    };
    
    layout.input_format.onchange = () => {
        layout.input_tip.textContent = ({
            "Binary": "0000000 11111111",
            "Numbers": "[0, 1, 2, 100, 255]",
            "Text": "Hello, world!"
        })[layout.input_format.value];
    };
    
    var interpreter = window["10IPL"];
    
    if (!interpreter)
        throw "Interpreter not found";
    
    var save = () => {
        return btoa(JSON.stringify([
            layout.program.value, layout.binary.value, layout.input.value,
            layout.input_format.selectedIndex, layout.print_format.selectedIndex
        ])).replace(/\//g, "_").replace(/\+/g, "-").replace(/=/g, "");
    };
    
    var restore = () => {
        var find_program = () => {
            var result = null;
            var items = location.search.slice(1).split("&");

            for (let p, i = 0; i < items.length; i++) {
                p = items[i].split("=");

                if (p[0] == "p")
                    return p[1];
            }

            return "";
        };
        
        [
            layout.program.value, layout.binary.value, layout.input.value,
            layout.input_format.selectedIndex, layout.print_format.selectedIndex
        ] = JSON.parse(atob(find_program().replace(/_/g, "/").replace(/-/g, "+")));
    };
    
    var update_input = () => {
        layout.incorrect_program.style.display = "";
        layout.incorrect_binary.style.display = "";
        layout.incorrect_input.style.display = "";
        layout.incorrect_print.style.display = "";
        
        var input = layout.input.value;
        
        switch (layout.input_format.value) {
            case "Binary":
                input = input.replace(/\s+/g, "");
                
                if (input.match(/[^01]/)) {
                    layout.incorrect_input.style.display = "block";
                    
                    return;
                }
                
                input = new Uint8Array(((input + "00000000".slice(0, 8 - (input.length % 8 || 8))).match(/.{8}/g) || []).map(b => parseInt(b, 2)));
                
                break;
            case "Numbers":
                if (input[0] == "[" && input[input.length - 1] == "]")
                    input = input.slice(1, -1);
                
                input = input.replace(/\s+/g, " ");
                
                if (!input.match(/^(([0-9]+(, |[, ]))*[0-9]+(, |[, ])?)?$/)) {
                    layout.incorrect_input.style.display = "block";

                    return;
                }
                
                input = new Uint8Array(input.split(/, |[, ]/).map(n => Number(n) % 256));
                
                break;
            case "Text":
                input = new TextEncoder().encode(input);
                
                break;
        }
        
        return input;
    };
    
    layout.run_program.onclick = () => {
        // Input
        
        var input = update_input();
        
        // Build
        
        var binary;
        
        try {
            binary = interpreter.build(layout.program.value);
        } catch (incorrect) {
            layout.incorrect_program.textContent = incorrect;
            layout.incorrect_program.style.display = "block";
            
            return;
        }
        
        layout.binary.value = [...binary].map(p => p.toString(2).padStart(8, 0)).join(" ");
        
        // Run
        
        var print;
        
        try {
            print = interpreter.run(binary, input);
        } catch (incorrect) {
            layout.incorrect_program.textContent = incorrect;
            layout.incorrect_program.style.display = "block";
            
            return;
        }
        
        // Format output
        
        var formatted;
        
        switch (layout.print_format.value) {
            case "Binary":
                formatted = [...print].map(p => p.toString(2).padStart(8, 0)).join("\n");
                
                break;
            case "Numbers":
                formatted = "[" + print.join(", ") + "]";
                
                break;
            case "Text":
                try {
                    formatted = new TextDecoder().decode(print);
                } catch (incorrect) {
                    formatted = "";
                }
                
                break;
        }
        
        layout.print.value = formatted;
        
        layout.cgcc_post.value = (
            "# [10IPL](https://github.com/RedwolfPrograms/10IPL), " + binary.length + " bytes\n\n" +
            "```\n" + layout.binary.value + "\n```\n\n" +
            "[Try it online!](https://redwolfprograms.github.io/10IPL?p=" + save() + ")"
        );
    };
    
    layout.run_binary.onclick = () => {
        // Input
        
        var input = update_input();
        
        // Build
        
        var binary = layout.binary.value.replace(/\s+/g, "");
                
        if (binary.match(/[^01]/)) {
            layout.incorrect_binary.textContent = "Invalid Binary";
            layout.incorrect_binary.style.display = "block";

            return;
        }

        binary = new Uint8Array(((binary + "00000000".slice(0, 8 - (binary.length % 8 || 8))).match(/.{8}/g) || []).map(b => parseInt(b, 2)));
        
        // Run
        
        var print;
        
        try {
            print = interpreter.run(binary, input);
        } catch (incorrect) {
            layout.incorrect_program.textContent = incorrect;
            layout.incorrect_program.style.display = "block";
            
            return;
        }
        
        // Format output
        
        var formatted;
        
        switch (layout.print_format.value) {
            case "Binary":
                formatted = [...print].map(p => p.toString(2).padStart(8, 0)).join("\n");
                
                break;
            case "Numbers":
                formatted = "[" + print.join(", ") + "]";
                
                break;
            case "Text":
                try {
                    formatted = new TextDecoder().decode(print);
                } catch (incorrect) {
                    formatted = "";
                }
                
                break;
        }
        
        layout.print.value = formatted;
        
        layout.cgcc_post.value = (
            "# [10IPL](https://github.com/RedwolfPrograms/10IPL), " + binary.length + " bytes\n\n" +
            "```\n" + layout.binary.value + "\n```\n\n" +
            "[Try it online!](https://redwolfprograms.github.io/10IPL?p=" + save() + ")"
        );
    };
    
    layout.build_program.onclick = () => {
        layout.incorrect_program.style.display = "";
        layout.incorrect_binary.style.display = "";
        layout.incorrect_input.style.display = "";
        layout.incorrect_print.style.display = "";
        
        var binary;
        
        try {
            binary = interpreter.build(layout.program.value);
        } catch (incorrect) {
            layout.incorrect_program.textContent = incorrect;
            layout.incorrect_program.style.display = "block";
            
            return;
        }
        
        layout.binary.value = [...binary].map(p => p.toString(2).padStart(8, 0)).join(" ");
        
        layout.cgcc_post.value = (
            "# [10IPL](https://github.com/RedwolfPrograms/10IPL), " + binary.length + " bytes\n\n" +
            "```\n" + layout.binary.value + "\n```\n\n" +
            "[Try it online!](https://redwolfprograms.github.io/10IPL?p=" + save() + ")"
        );
    };
    
    layout.build_binary.onclick = () => {
        layout.incorrect_program.style.display = "";
        layout.incorrect_binary.style.display = "";
        layout.incorrect_input.style.display = "";
        layout.incorrect_print.style.display = "";
        
        var binary = layout.binary.value.replace(/\s+/g, "");
                
        if (binary.match(/[^01]/)) {
            layout.incorrect_binary.textContent = "Invalid Binary";
            layout.incorrect_binary.style.display = "block";

            return;
        }

        binary = new Uint8Array(((binary + "00000000".slice(0, 8 - (binary.length % 8 || 8))).match(/.{8}/g) || []).map(b => parseInt(b, 2)));
        
        layout.cgcc_post.value = (
            "# [10IPL](https://github.com/RedwolfPrograms/10IPL), " + binary.length + " bytes\n\n" +
            "```\n" + layout.binary.value + "\n```\n\n" +
            "[Try it online!](https://redwolfprograms.github.io/10IPL?p=" + save() + ")"
        );
    };
};
