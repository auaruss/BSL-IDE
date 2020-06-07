const evaluateCode = (code, evaluate) => {
    console.log(collectExpressions(code));
    let expressions = collectExpressions(code);
    return evalExpressions(expressions, evaluate);
}

const collectExpressions = (code) => {
    let collections = [];
    let expressions = [];
    let buffer = "";
    for (let elem of code) {
        if (elem == "\n") {
            if (! buffer) {
                expressions.push(collections.reduce((a, b) => a.concat(b), ''));
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

    try {
        for (let elem of expressions) {
            if (value) {
                value += "\n" + String(evaluate(elem));
            } else {
                value = String(evaluate(elem));
            }
        }
    } catch (err) { }
    
    return value;
}

export default evaluateCode;