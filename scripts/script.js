const evaluateAndOutput = (interactions, evalElement) => {
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

    console.log(expressions);
    for (let elem of expressions) {
        console.log(elem);
    }

    evalElement.value = "";

    for (let elem of expressions) {
        if (String(evalElement.value)) {
            evalElement.value = String(evalElement.value) + "\n" + String(eval(elem));
        } else {
            evalElement.value = String(eval(elem));
        }
    }
}