class CalcController {

    constructor() {
        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';
        this._operation = [];
        this._locale = "pt-br";
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        this._currentDate;
        this.initialize();
        this.initButtonsEvent();
        this.initKeyboard();
    } // construtor

    // MÉTODOS
    initialize() {
        setInterval(() => {
            this.setDisplayDateTime();
        }, 1000);

        this.setLastNumberToDisplay();

        this.pasteFromClipboard();

        document.querySelectorAll('.btn-ac').forEach(btn => {
            btn.addEventListener('dblclick', e => {
                this.toggleAudio();
            });
        });
    } // initialize()

    toggleAudio() {
        return !this._audioOnOff;
    } // toggleAudio()

    playAudio() {
        if (this.toggleAudio) {
            this._audio.currentTime = 0;
            this._audio.play();
        }
    } // playAudio()

    setDisplayDateTime() {
        this.displayDate = this.currentDate.toLocaleDateString(this.locale, {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this.locale);
    } // setDisplayDateTime()

    initKeyboard() {
        document.addEventListener('keyup', e => {
            switch (e.key) {
                case 'Escape':
                    this.clearAll();
                    break;

                case 'Backspace':
                    this.clearEntry();
                    break;

                case '+':
                case '-':
                case '/':
                case '*':
                case '%':
                    this.addOperation(e.key);
                    break;

                case 'Enter':
                case '=':
                    this.calc();
                    break;

                case '.':
                case ',':
                    this.addDot();
                    break;

                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;

                case 'c':
                    if (e.ctrlKey) this.copyToClipboard();
                    break;
            } //switch
        });
    } // initKeyboard()

    copyToClipboard() {
        let input = document.createElement('input');
        input.value = this.displayCalc;
        document.body.appendChild(input);
        input.select();
        document.execCommand("Copy");
        input.remove();
    } // copyToClipboard()

    pasteFromClipboard() {
        document.addEventListener("paste", e => {
            let text = e.clipboardData.getData('Text');

            this.displayCalc = parseFloat(text);
        });
    } // pasteFromClipboard()

    initButtonsEvent() {
        let buttons = document.querySelectorAll("#buttons > g, #parts g");

        buttons.forEach((btn, index) => {
            this.addEventListenerAll(btn, "click drag", e => {
                let txtBtn = btn.className.baseVal.replace("btn-", "");
                this.execBtn(txtBtn);
            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
                btn.style.cursor = "pointer";
            });
        });
    } // initButtonsEvent()

    addEventListenerAll(element, events, fn) {
        events.split(' ').forEach(event => {
            element.addEventListener(event, fn, false);
        });
    } // addEventListenerAll()

    execBtn(value) {
        this.playAudio();

        switch (value) {
            case 'ac':
                this.clearAll();
                break;

            case 'ce':
                this.clearEntry();
                break;

            case 'soma':
                this.addOperation('+');
                break;

            case 'subtracao':
                this.addOperation('-');
                break;

            case 'multiplicacao':
                this.addOperation('*');
                break;

            case 'divisao':
                this.addOperation('/');
                break;

            case 'porcento':
                this.addOperation('%');
                break;

            case 'igual':
                this.calc();
                break;

            case 'ponto':
                this.addDot();
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;

            default:
                this.setError();
                break;
        } //switch
    } // execBtn()

    clearAll() {
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNumberToDisplay();
    } // clearAll()

    clearEntry() {
        this._operation.pop();
        this.setLastNumberToDisplay();
    } // clearEntry()

    setError() {
        this.displayCalc = "error";
    } // setError()

    addOperation(value) {
        if (isNaN(this.getLastOperation())) {
            if (this.isOperator(value)) {
                this.setLastOperation(value);
            } else {
                this.pushOperation(value);
                this.setLastNumberToDisplay();
            }
        } else {
            if (this.isOperator(value)) {
                this.pushOperation(value);
            } else {
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);
                this.setLastNumberToDisplay();
            } // else
        } // else
    } // addOperation()

    addDot() {
        let lastOperation = this.getLastOperation();

        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if (this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperation('0.');
        } else {
            this.setLastOperation(lastOperation.toString() + '.');
        } // else

        this.setLastNumberToDisplay();
    } // addDot()

    setLastNumberToDisplay() {
        let lastNumber = this.getLastItem(false);

        if (!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;
    } // setLastNumberToDisplay()

    getLastItem(isOperator = true) {
        let lastItem;

        for (let i = this._operation.length - 1; i >= 0; i--) {
            if (this.isOperator(this._operation[i]) == isOperator) {
                lastItem = this._operation[i];
                break;
            } // if
        } // for

        if (!lastItem) {
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        }

        return lastItem;
    } // getLasItem()

    pushOperation(value) {
        this._operation.push(value);

        if (this._operation.length > 3) {
            this.calc();
        } // if
    } // pushOperation()

    calc() {
        let last = '';

        this._lastOperator = this.getLastItem();

        if (this._operation.length < 3) {
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        if (this._operation.length > 3) {
            last = this._operation.pop();
            this._lastNumber = this.getResult();
        } else if (this._operation.length == 3) {
            this._lastNumber = this.getLastItem(false);
        } // elseif

        let result = this.getResult();

        if (last == "%") {
            result /= 100;
            this._operation = [result];
        } else {
            this._operation = [result];

            if (last) this._operation.push(last);
        }
        this.setLastNumberToDisplay();
    } // calc()

    getResult() {
        try {
            return eval(this._operation.join(""));
        } catch (e) {
            setTimeout(() => {
                this.setError();
            }, 0);
        } // try catch
    } // getResult()

    isOperator(value) {
        return (['+', '-', '*', '/', '%'].indexOf(value) > -1);
    } // isOperator()

    getLastOperation() {
        return this._operation[this._operation.length - 1];
    } // getLastOperation()

    setLastOperation(value) {
        this._operation[this._operation.length - 1] = value;
    } // setLastOperation()

    // GETTERS
    get displayCalc() {
        return this._displayCalcEl.innerHTML;
    }

    get displayDate() {
        return this._dateEl.innerHTML;
    }

    get displayTime() {
        return this._timeEl.innerHTML;
    }

    get currentDate() {
        return new Date();
    }

    get locale() {
        return this._locale;
    }

    // SETTERS
    set displayCalc(value) {
        if (value.toString().length > 10) {
            this.setError();
            return false;
        } // if

        this._displayCalcEl.innerHTML = value;
    }

    set displayDate(value) {
        return this._dateEl.innerHTML = value;
    }

    set displayTime(value) {
        return this._timeEl.innerHTML = value;
    }

    set currentDate(value) {
        this._dataAtual = value;
    }

    set locale(value) {
        this._locale = value;
    }

} // Fim da classe