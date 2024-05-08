import React, { useEffect, useState } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

function JokeList() {
  const [jokes, setJokes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedJokes = JSON.parse(localStorage.getItem("jokes"));
    if (storedJokes) {
      setJokes(storedJokes);
      setIsLoading(false);
    } else {
      getJokes();
    }
  }, []);

  async function getJokes() {
    try {
      localStorage.removeItem("jokes");
      let newJokes = [];
      let seenJokes = new Set();

      while (newJokes.length < 5) {
        const res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        const joke = res.data;

        if (!seenJokes.has(joke.id)) {
          seenJokes.add(joke.id);
          newJokes.push({ ...joke, votes: 0 });
        } else {
          console.log("duplicate found!");
        }
      }

      setJokes(newJokes);
      localStorage.setItem("jokes", JSON.stringify(newJokes));
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }

  function generateNewJokes() {
    setIsLoading(true);
    getJokes();
  }

  function vote(id, delta) {
    const updatedJokes = jokes.map(j =>
      j.id === id ? { ...j, votes: j.votes + delta } : j
    );
    setJokes(updatedJokes);
    localStorage.setItem("jokes", JSON.stringify(updatedJokes));
  }

  if (isLoading) {
    return (
      <div className="loading">
        <i className="fas fa-4x fa-spinner fa-spin" />
      </div>
    );
  }

  // Sort jokes based on votes before rendering
  const sortedJokes = jokes.slice().sort((a, b) => b.votes - a.votes);

  return (
    <div className="JokeList">
      <button className="JokeList-getmore" onClick={generateNewJokes}>
        Get New Jokes
      </button>

      {sortedJokes.map(j => (
        <Joke
          text={j.joke}
          key={j.id}
          id={j.id}
          votes={j.votes}
          vote={vote}
        />
      ))}
    </div>
  );
}

export default JokeList;
