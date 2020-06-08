const evaluateCode = (code, evaluate) => {
    let expressions = collectExpressions(code);
    return evalExpressions(expressions, evaluate);
}

const collectExpressions = (code) => {
    let collections = [];
    let expressions = [];
    let linum = 0;
    let buffer = "";

    for (let elem of code) {
        if (elem == "\n") {
            linum += 1;

            if (! buffer) {
                expressions.push([collections.reduce((a, b) => a.concat(b), ''), linum]);
                collections = [];
            } else {
                collections.push(buffer);
            }
            buffer = "";
        } else {
            buffer += elem;
        }
    }

    if (buffer) {
        collections.push(buffer);
    }
    if (collections) {
        expressions.push([collections.reduce((a, b) => a.concat(b), ''), linum] );
    }

    return expressions;
}

const evalExpressions = (expressions, evaluate) => {
    let value = '';

    for (let elem of expressions) {
        try {
            let exprOutput = evaluate(elem[0]);
            while (lines(value) < elem[1]) {
                value += '\n';
            }
            if (exprOutput) {
                value += String(exprOutput) + '\n';
            }
        } catch (err) { }
    }

    return value;
}

function lines(s) {
    let lines = 1;
    for (let char of s) {
        if (char == '\n') lines += 1;
    }
    return lines;
}

export default evaluateCode;