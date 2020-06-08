const evaluateCode = (code, evaluate) => {
    console.log(collectExpressions(code));
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
        expressions.push(collections.reduce((a, b) => a.concat(b), ''));
    }

    return expressions;
}

const evalExpressions = (expressions, evaluate) => {
    let value = '';
    let linum = 0;
    let prevLinumEnd = 0;

    try {
        for (let elem of expressions) {
            if (value) {
                while (linum < prevLinumEnd) {
                    value += '\n';
                    linum += 1;
                }
                if (evaluate(elem[0])) {
                    value += '\n' + String(evaluate(elem[0]));
                } else {
                    value += '\n';
                }
                linum += 1;
            } else {
                if (evaluate(elem[0])) {
                    value = String(evaluate(elem[0]));
                }
                linum += 1;
            }

            prevLinumEnd = elem[1];
        }
    } catch (err) { }
    return value;
}

export default evaluateCode;