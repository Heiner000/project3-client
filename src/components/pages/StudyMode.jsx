import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from 'axios';

export default function StudyMode({ currentUser, updateScore }) {
  const [cards, setCards] = useState([]);
  const [incorrectCards, setIncorrectCards] = useState([]);
  const [showBack, setShowBack] = useState(false);
  const { id } = useParams();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const navigate = useNavigate();
  const [numCorrect, setNumCorrect] = useState(0);
  const [flashcardCorrect, setFlashcardCorrect] = useState(false);

  const fetchCards = async () => {
    try {
      const token = localStorage.getItem('jwt');

      if (!token) {
        navigate('/login'); 
      } else {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api-v1/decks/${id}`, {
          headers: {
            'Authorization': token
          }
        });

        setCards(response.data.flashcards);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchCards();
  }, []);

  const toggleBack = () => {
    setShowBack(!showBack);
  };

  const handleNextCard = () => {
    if (cards.length === 0) {
      // All cards have been studied
      console.log('Congratulations, you have studied all the cards!');
      return;
    }
    setShowBack(false)
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % cards.length); // Cycle through the array
  };

  const handleMarkCorrect = () => {
    setNumCorrect((prevNumCorrect) => prevNumCorrect + 1);
    setFlashcardCorrect(true);
  
    // Remove the correct card from the array
    const newCards = [...cards];
    newCards.splice(currentCardIndex, 1);
    setCards(newCards);
  
    setTimeout(() => {
      setFlashcardCorrect(false);
      // Delay the switch to the next card
      setCurrentCardIndex((prevIndex) => {
        if (prevIndex >= newCards.length) {
          return 0; // Reset to the beginning if we've removed the last card
        } else {
          return prevIndex; // Otherwise, stay at the current index
        }
      });
    }, 1000);
  
    // update the user's score when marked correct
    if (currentUser) {
      updateScore(currentUser._id, numCorrect + 1); // add 1 to current score
    }
    setShowBack(false)
  };

  const handleMarkIncorrect = () => {
    setIncorrectCards((prevIncorrectCards) => [...prevIncorrectCards, currentCardIndex]);
    // Delay the switch to the next card
    setTimeout(() => {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % cards.length);
    }, 1000);
    setShowBack(false)
  };

  const currentCard = cards[currentCardIndex];

  if (currentCardIndex >= cards.length) {
    return (
      <div>
        <h2>No more flashcards</h2>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div>
      <h1>Study Mode</h1>
        <h2>Deck Size: {cards.length}</h2>

        <div className={`flashcard-container ${flashcardCorrect ? "flashcard-correct" : ""}`} onClick={toggleBack}>
          <h2>Current Card {currentCardIndex + 1}</h2>
          <p className="flashcard-container-p flashcard-container-front">{currentCard.front}</p>
          {currentCard.image && (
        <img
          className="flashcard-container-image"
          src={`https://res.cloudinary.com/dlzj22j8a/image/upload/w_100,h_100,c_fill/v1683568204/${currentCard.image}.jpg`}
          alt={`Image for ${currentCard.front}`}
        />
      )}
          <p className={`flashcard-container-back-next ${showBack ? 'flashcard-container-show-back-back' : ''}`}>{currentCard.back}</p>
        </div>
        <div>
          <button onClick={handleMarkCorrect}>Correct</button>
          <button onClick={handleMarkIncorrect}>Incorrect</button>
          <button onClick={handleNextCard}>Skip</button>
        </div>
        <p>Number of Correct Flashcards: {numCorrect}</p>
      </div>
    </div>
  )
}



