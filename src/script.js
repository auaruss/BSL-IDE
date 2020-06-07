// const eva = require('./eval');

const evaluateAndOutput = () => { alert("hello"); }
// const evaluateAndOutput = (interactions, evalElement, evaluate) => {
//     let expressions = collectExpressions(interactions);
//     outputExpressions(expressions, evalElement, evaluate);
// }

const collectExpressions = (interactions) => {
    let collections = [];
    let expressions = [];
    let buffer = "";
    for (let elem of interactions) {
        if (elem == "\n") {
            if (! buffer) {
                expressions.push(collections.reduce((a, b) => a.concat(b)));
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
        expressions.push(collections.reduce((a, b) => a.concat(b)));
    }

    return expressions;
}

const outputExpressions = (expressions, evalElement, evaluate) => {
    evalElement.value = "";

    for (let elem of expressions) {
        if (String(evalElement.value)) {
            evalElement.value = String(evalElement.value) + "\n" + String(evaluate(elem));
        } else {
            evalElement.value = String(evaluate(elem));
        }
    }
}

export default evaluateAndOutput;