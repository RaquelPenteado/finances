//Abrir e fechar Modal
const Modal = {
    open(){
        document.querySelector('.modal-overlay').classList.toggle('active')
    },
    close(){
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transaction", JSON.stringify(transactions))
    }
}

//Somando dados para a Transação
const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)
        App.reload()
    },

    incomes(){
        let income = 0
        Transaction.all.forEach((transaction) =>{
            if(transaction.amount > 0){
                income += transaction.amount;
            }
        })
        return income
    },
    expenses(){
        let expense = 0
        Transaction.all.forEach((transaction) =>{
            if(transaction.amount < 0){
                expense += transaction.amount;
            }
        })
        return expense
    },
    total(){
        return Transaction.incomes() + Transaction.expenses();
    }
}

//Transferindo as transações para o HTML
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction,index) {
        
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction,index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction,index){
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="/assets/minus.svg" alt="Remover transação">
            </td>
        `
        return html
    },

    uptadeBalance(){
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value){
        value = Number(value) * 100
        return value
    },

    formatData(data){
        const splitDate = data.split("-")
        return `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value)/100

        value = value.toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL"
        })

        return signal+value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    data: document.querySelector('input#data'),

    getValue(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            data: Form.data.value
        }
    },

    validateField(){
        const { description, amount, data} = Form.getValue()
        if(description.trim() === "" || amount.trim() === "" || data.trim() === ""){
            throw new Error("Por favor preencha todos os campos") 
        }
    },

    formatValues(){
        let { description, amount, data} = Form.getValue()

        amount = Utils.formatAmount(amount)

        date = Utils.formatData(data)
        
        return {
            description,
            amount,
            date
        }
    },

    clearFields(){
        Form.description.value = ''
        Form.amount.value = ''
        Form.data.value = ''
    },

    submit(event){
       event.preventDefault()

       Form.formatValues()

       try{
        Form.validateField()
        const transaction = Form.formatValues()
        Transaction.add(transaction)
        Form.clearFields()
        Modal.close()
       } catch(error){
        alert(error.message)
       }

      
    }
}


const App = {
    init() {

        Transaction.all.forEach(DOM.addTransaction)

        DOM.uptadeBalance()

        Storage.set(Transaction.all)

    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()