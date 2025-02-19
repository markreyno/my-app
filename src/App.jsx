import React, { useState, useEffect } from "react";
import "./App.css";

const MemoryGame = () => {
  const [gridSize, setGridSize] = useState(Number(localStorage.getItem("gridSize")) || 4);
  const [moves, setMoves] = useState(Number(sessionStorage.getItem("moves")) || 0);
  const [totalMoves, setTotalMoves] = useState(Number(localStorage.getItem("totalMoves")) || 0);
  const [message, setMessage] = useState("");
  const [cards, setCards] = useState([]);
  const [firstCardIndex, setFirstCardIndex] = useState(null);
  const [lockBoard, setLockBoard] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [selectedGridSize, setSelectedGridSize] = useState(gridSize); 

  const totalPairs = (gridSize * gridSize) / 2;

  useEffect(() => {
    const storedGame = sessionStorage.getItem("gameState");
    if (storedGame) {
      setCards(JSON.parse(storedGame));
      setMoves(Number(sessionStorage.getItem("moves")) || 0);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "totalMoves") {
        setTotalMoves(Number(event.newValue));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sessionStorage.removeItem("moves");
        setMoves(0);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const startGame = () => {
    setGridSize(selectedGridSize); 
    localStorage.setItem("gridSize", selectedGridSize);

    let cardValues = [];
    for (let i = 0; i < (selectedGridSize * selectedGridSize) / 2; i++) {
      const letter = String.fromCharCode(65 + i);
      cardValues.push(letter, letter);
    }
    cardValues.sort(() => 0.5 - Math.random());

    const newCards = cardValues.map((value, index) => ({
      id: index,
      value,
      flipped: false,
    }));

    setCards(newCards);
    setMoves(0);
    setMatchedPairs(0);
    setMessage("");
    setFirstCardIndex(null);
    setLockBoard(false);

    sessionStorage.setItem("moves", 0);
    sessionStorage.setItem("gameState", JSON.stringify(newCards));
  };

  const flipCard = (index) => {
    if (lockBoard || cards[index].flipped || index === firstCardIndex) return;

    const newCards = [...cards];
    newCards[index] = { ...newCards[index], flipped: true };
    setCards(newCards);
    sessionStorage.setItem("gameState", JSON.stringify(newCards));

    if (firstCardIndex === null) {
      setFirstCardIndex(index);
    } else {
      const firstCard = newCards[firstCardIndex];
      const secondCard = newCards[index];

      const newMoves = moves + 1;
      setMoves(newMoves);
      sessionStorage.setItem("moves", newMoves);

      const newTotalMoves = totalMoves + 1;
      setTotalMoves(newTotalMoves);
      localStorage.setItem("totalMoves", newTotalMoves);

      if (firstCard.value === secondCard.value) {
        const newMatchedPairs = matchedPairs + 1;
        setMatchedPairs(newMatchedPairs);
        setFirstCardIndex(null);

        if (newMatchedPairs === totalPairs) {
          setMessage(`Game Over! You completed the game in ${newMoves} moves.`);
          sessionStorage.removeItem("gameState");
          sessionStorage.removeItem("moves");
        }
      } else {
        setLockBoard(true);
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstCardIndex] = { ...resetCards[firstCardIndex], flipped: false };
          resetCards[index] = { ...resetCards[index], flipped: false };
          setCards(resetCards);
          sessionStorage.setItem("gameState", JSON.stringify(resetCards));
          setFirstCardIndex(null);
          setLockBoard(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="gamecontainer">
      <div className="gameplay">
        <h1 className="title">Game Flip</h1>
        <p className="rules">Welcome to Game Flip! The objective is to match the cards in the least amount of moves.</p>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Grid Size:
            <select
              value={selectedGridSize}
              onChange={(e) => setSelectedGridSize(Number(e.target.value))}
              style={{ marginLeft: "0.5rem" }}
            >
              <option value={4}>4 x 4</option>
              <option value={5}>5 x 5</option>
              <option value={6}>6 x 6</option>
            </select>
          </label>
          <button onClick={startGame} style={{ marginLeft: "1rem" }}>Start</button>
        </div>
      
        <div>
          <span>Moves: {moves}</span>
          <span style={{ marginLeft: "1rem" }}>Total Moves: {totalMoves}</span>
        </div>
      </div>
        {message && <div id="message">{message}</div>}
        <div className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 100px)`,
            gridTemplateRows: `repeat(${gridSize}, 100px)`,
          }}
        >
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`card ${card.flipped ? "flip" : ""}`}
              onClick={() => flipCard(index)}
            >
              <div className="front"></div>
              <div className="back">{card.value}</div>
            </div>
          ))}
        </div>
      
    </div>
  );
};

export default MemoryGame;

