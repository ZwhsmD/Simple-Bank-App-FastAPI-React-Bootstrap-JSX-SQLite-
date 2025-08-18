import React, {useState, useEffect} from "react"
import api from './api'

//React code which handles the event like onClick etc. It can only return 1 element
const App = () => {
    const [transactions, setTransactions] = useState([]);
    const [formData, setFormData] = useState ({
        amount: '',
        category: '',
        description: '',
        is_income: false,
        date: ''
    });

    const fetchTransactions = async() => {
        const response = await api.get("/transactions/");
        setTransactions(response.data)
    };

    //run sth after render
    useEffect(()=> {
        fetchTransactions();
    }, []); //run once after the first render

    const handleInputChange = (event) => {
        //                              if checkbox click so True/False -option 1, |  if it is a text/number then option 2
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setFormData({
            //copies all current form values
            ...formData,
            //update the field
            [event.target.name]: value,
        });
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        await api.post("/transactions/", formData);
        fetchTransactions()

        //returning to the basic input = empty strings
        setFormData({
            amount: '',
            category: '',
            description: '',
            is_income: false,
            date: ''
        });
    }

    //since React can only return 1 element we are returning a single div with all of the html code in it:)
    return (
        <div>
            <nav className='navbar navbar-dark bg-primary'>
                {/*classNames from bootstrap 5*/}
                <div className='container-fluid'>
                    <a className='navbar-brand' href="#"> {/*default href="#*/}
                        Finance App
                    </a>
                </div>
            </nav>

            <div className="container">
                <form onSubmit = {handleFormSubmit}>
                    <div className="mb-3 mt-3">
                        <label htmlFor='amount' className='form-label'>
                            Amount
                            <input type='text' className="form-control" id="amount" name="amount" onChange={handleInputChange} value={formData.amount}>

                            </input>
                        </label>
                    </div>

                    <div className="mb-3 ">
                        <label htmlFor='category' className='form-label'>
                            Category
                            <input type='text' className="form-control" id="category" name="category" onChange={handleInputChange} value={formData.category}>

                            </input>
                        </label>
                    </div>

                    <div className="mb-3">
                        <label htmlFor='description' className='form-label'>
                            Description
                            <input type='text' className="form-control" id="description" name="description" onChange={handleInputChange} value={formData.description}>

                            </input>
                        </label>
                    </div>

                    <div className="mb-3">
                        <label htmlFor='is_income' className='form-label'>
                            Is Income?
                            <input type='checkbox' id="is_income" name="is_income" onChange={handleInputChange} value={formData.is_income}>
                            </input>
                        </label>
                    </div>

                    <div className="mb-3">
                        <label htmlFor='date' className='form-label'>
                            Date
                            <input type='text' className="form-control" id="date" name="date" onChange={handleInputChange} value={formData.date}>
                            </input>
                        </label>
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Submit
                    </button>

                </form>

                <table className="table table-striped table-bordered table-hover">
                   <thead>
                        <tr>
                            <th>Amount</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Is Income?</th>
                            <th>Date</th>
                        </tr>
                   </thead>
                   <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction.id}>
                                <td>{transaction.amount}</td>
                                <td>{transaction.category}</td>
                                <td>{transaction.description}</td>
                                <td>{transaction.is_income ? 'Yes' : 'No'}</td>
                                <td>{transaction.date}</td>
                            </tr>
                        ))}
                   </tbody>
                </table>
            </div>

        </div>
    )
}

export default App;
