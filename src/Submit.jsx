import React, { useState } from 'react';
import './index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';

function Submit() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [sentiment, setSentiment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email: email,
          feedback: feedback,
          rating: rating,
        }),
      });

      const data = await response.json();
      setSentiment(data.sentiment);

      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setFeedback('');
      setRating(0);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <div className="submit-container">
      <h2>Submit Your Feedback</h2>
      {submitted && <p className="success-message">Feedback submitted successfully!</p>}
      {sentiment && <p className="sentiment-result">Detected Sentiment: {sentiment}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          required
        />

        <div className="star-rating">
          {[...Array(5)].map((_, index) => {
            const value = index + 1;
            return (
              <span
                key={index}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHover(value)}
                onMouseLeave={() => setHover(0)}
                className="star-icon"
              >
                <FontAwesomeIcon
                  icon={value <= (hover || rating) ? solidStar : regularStar}
                />
              </span>
            );
          })}
        </div>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Enter your feedback here..."
          className="feedback-textarea"
          required
        />
        <br />
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
}

export default Submit;
