import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from 'axios';


export default function Deck() {
  const [cards, setCards] = useState([]);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [image, setImage] = useState('');
  const [editing, setEditing] = useState(false)
  const [editingCard, setEditingCard] = useState({})
  const [showForm, setShowForm] = useState(false);
  const [cardId, setCardId] = useState('');
  const [deckTitle, setDeckTitle] = useState('')

  const { id } = useParams()
  const navigate = useNavigate();
  const fileInput = useRef()

  const fetchCards = async () => {
    try {
      const token = localStorage.getItem('jwt');

      if (!token) {
        navigate('/login'); // Redirect user to login page if no token found
      } else {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api-v1/decks/${id}`, {
          headers: {
            'Authorization': token
          }
        });
        console.log(`this is the setCards response data`, response.data);
        setCards(response.data.flashcards);

        setDeckTitle(response.data.title)
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchCards();
  }, []);

  const deleteFlashcard = async (id) => {
    const token = localStorage.getItem('jwt');
    console.log(token)

    if (!token) {
      navigate('/login'); // Redirect user to login page if no token found
    }

    try {
      const url = `${process.env.REACT_APP_SERVER_URL}/api-v1/flashcards/${id}`;
      console.log(`Deleting flashcard at URL: ${url}`);
      const response = await axios.delete(url, {
        headers: {
          'Authorization': token
        }
      });
      console.log(`DELETE response status: ${response.status}`);
      console.log(`DELETE response data: ${JSON.stringify(response.data)}`);
      fetchCards();
    } catch (err) {
      console.log(`Error deleting flashcard: ${err.message}`);
    }
  };

  const handleEditClick = (card) => {
    setEditing(true)
    setShowForm(true)
    setEditingCard(card)
    setFront(card.front)
    setBack(card.back)
    setCardId(card._id)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('jwt');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      if (editing) {
        const formdata = new FormData()
        formdata.append("front", front)
        formdata.append("back", back)
        formdata.append("deckId", id)
        if (image) {
          formdata.append("image", image)
        }
        const response = await axios.put(`${process.env.REACT_APP_SERVER_URL}/api-v1/flashcards/${cardId}`, formdata, {
          headers: {
            'Authorization': token,
            'Content-Type': 'multipart/form-data',
          },
        }
        )
        console.log(`PUT response status: ${response.status}`)
        console.log(`PUT response data: ${JSON.stringify(response.data)}`);
      } else {
        const formdata = new FormData()
        formdata.append("image", image)
        formdata.append("front", front)
        formdata.append("back", back)
        formdata.append("deckId", id)
        const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api-v1/decks/${id}/flashcards`, formdata, {
          headers: {
            'Authorization': token,
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(`POST response status: ${response.status}`);
        console.log(`POST response data: ${JSON.stringify(response.data)}`);
      }
      setFront('');
      setBack('');
      setImage('');
      fetchCards();
      console.log(cards)
      setEditing(false);
      setCardId('')

      fileInput.current.value = ""
    } catch (err) {
      console.log(`Error adding flashcard: ${err.message}`);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    console.log(file)
    setImage(file);
  };

  const flashCard = cards.map((card) => (
    <div className="flashcard-container" key={card._id}>
      <div>
        <p className="flashcard-container-p flashcard-container-front">{card.front}</p>
        {card.image && (
          <img
            className="flashcard-container-image"
            src={`https://res.cloudinary.com/dlzj22j8a/image/upload/w_100,h_100,c_fill/v1683568204/${card.image}.jpg`}
            alt={`${card.front}`}
          />
        )}
        <p className="flashcard-container-back flashcard-container-show-back-back">{card.back}</p>
      </div>


      <div className="flashcard-container-btns">
        <button className="edit-button" onClick={() => handleEditClick(card)}>Edit</button>
        <button className="delete-button" onClick={() => deleteFlashcard(card._id)}>Delete</button>
      </div>

    </div>
  ));


  return (
    <div className="page-div">
      <h1>{deckTitle}</h1>

      <div className="flashcard-list">
        <div className="flashcard-container">
          <p><strong>New "{deckTitle}" Flashcard</strong></p>
          <form className="flashcard-form" onSubmit={handleSubmit} encType="mulipart/form">
            <div>
              <label htmlFor="flashcard-front" className="form-label">Front:</label>
              <input type="text" id="flashcard-front" value={front} onChange={(e) => setFront(e.target.value)} required />
            </div>

            <div>
              <label id="file-input" htmlFor="image-upload" className="form-label">Image:</label>
              {/* <div className="image-preview">
              {image && <img src={image} alt="Preview" />}
            </div> */}
              <input
                ref={fileInput}
                className="form-control"
                id="image-upload"
                type="file"
                onChange={handleImageUpload}
              />
            </div>

            <div>
              <label htmlFor="flashcard-back">Back:</label>
              <input type="text" id="flashcard-back" value={back} onChange={(e) => setBack(e.target.value)} required />
            </div>

            <button className="flashcard-form-button" type="submit">
              { editing ? "Update Flashcard" : "Add Flashcard" }
            </button>
          </form>

        </div>
        {flashCard}
      </div>

    </div>
  );
}
