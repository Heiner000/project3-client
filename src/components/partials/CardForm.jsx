import { useState } from 'react'
import axios from 'axios'

export default function CardForm({ addNewDeck }) {
    const [deckTitle, setDeckTitle] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!deckTitle) {
            setErrorMessage('Please enter a deck title') // Set the error message if the deckTitle is empty
            return
        }
        try {
            const token = localStorage.getItem('jwt')
            const newDeck = { title: deckTitle }

            const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api-v1/decks/`, newDeck, {
                headers: {
                    'Authorization': token,
                }
            })
            console.log(response.data)
            addNewDeck(response.data)
            setDeckTitle('')
            setErrorMessage('')

        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className="card-form-container">
            <form onSubmit={handleSubmit} >
                {errorMessage && <p className="error">{errorMessage}</p>} {/* Display the error message if it is set */}
                <div className="card-title-div">
                    <h2 className="card-form-title">Create New Deck:</h2>
                    <input
                        type="text"
                        placeholder='enter deck name...'
                        id='deckname'
                        value={deckTitle}
                        onChange={(e) => setDeckTitle(e.target.value)}
                        className="card-form-input"
                    />
                </div>

                <div className="btn-box">
                    <button className="card-form-submit" type="submit">Create</button>
                </div>

            </form>
        </div>
    )
}