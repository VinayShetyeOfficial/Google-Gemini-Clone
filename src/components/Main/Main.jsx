import React, { useContext, useEffect, useRef, useState } from "react";
import "./Main.css";
import { assets } from "../../assets/assets";
import { cardsData } from "./Cards";
import { Context } from "../../context/Context";

const Main = () => {
  const {
    onSent,
    recentPrompt,
    showResult,
    loading,
    resultData,
    setInput,
    input,
  } = useContext(Context);

  const [randomCards, setRandomCards] = useState([]);
  const [textBoxGrow, setTextBoxGrow] = useState(false);
  const [images, setImages] = useState([]); // State to hold the uploaded images
  const [sentPrompts, setSentPrompts] = useState([]); // State to hold sent prompts with images
  const [selectedCard, setSelectedCard] = useState(null); // State to hold the index of the selected card
  const [isEditing, setIsEditing] = useState(false); // State to manage editing mode
  const [editText, setEditText] = useState(""); // State to manage the edited text
  const [hoveredPrompt, setHoveredPrompt] = useState(null); // State to track hovered prompt
  const fileInputRef = useRef(null); // Reference for the file input

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && input.trim() !== "") {
      e.preventDefault();
      handleSend();
    } else if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleCardClick = (index, text) => {
    if (selectedCard === index) {
      setInput("");
      setSelectedCard(null);
    } else {
      setInput(text + ".");
      setSelectedCard(index);
    }
  };

  const handleTextareaChange = (e) => {
    const newValue = e.target.value;
    setInput(newValue);
    if (newValue.length >= 64 || images.length > 0) {
      setTextBoxGrow(true);
    } else {
      setTextBoxGrow(false);
    }
  };

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const shuffledCards = shuffleArray(cardsData);
    setRandomCards(shuffledCards.slice(0, 4));
  }, []);

  const handleGalleryIconClick = () => {
    fileInputRef.current.click(); // Trigger file input click
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/")); // Filter only image files

    if (imageFiles.length === 0) {
      if (input.length < 64) {
        setTextBoxGrow(false);
      }
      return;
    }

    const newImages = imageFiles.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setImages((prevImages) => {
      const combinedImages = [...prevImages, ...newImages];
      if (combinedImages.length > 10) {
        return combinedImages.slice(0, 10);
      }
      return combinedImages;
    });

    setTextBoxGrow(true); // Set textBoxGrow to true when images are added
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => {
      const updatedImages = prevImages.filter((_, i) => i !== index);
      if (updatedImages.length === 0 && input.length < 64) {
        setTextBoxGrow(false);
      } else if (updatedImages.length === 0 && input.length >= 64) {
        setTextBoxGrow(true);
      }
      return updatedImages;
    });
  };

  const handleSend = () => {
    onSent();
    setSentPrompts((prevPrompts) => [
      ...prevPrompts,
      { text: input, images },
    ]);
    setInput("");
    setImages([]);
    setTextBoxGrow(false);
    setSelectedCard(null); // Reset selected card on send
  };

  const handleEditClick = (prompt) => {
    setIsEditing(true);
    setEditText(prompt.text);
  };

  const handleUpdateClick = (index) => {
    const updatedPrompts = [...sentPrompts];
    updatedPrompts[index].text = editText;
    setSentPrompts(updatedPrompts);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  return (
    <div className="main">
      <div className="nav">
        <p>Gemini</p>
        <img src={assets.gemini_bot_icon} alt="gemini_bot_icon" />
      </div>
      <div className="main-container">
        {!showResult ? (
          <>
            <div className="greet">
              <p>
                <span>Hello, Dev.</span>
              </p>
              <p>How can I help you today?</p>
            </div>
            <div className="cards">
              {randomCards.map((card, index) => (
                <div
                  className={`card ${selectedCard === index ? "selected" : ""}`}
                  key={index}
                  onClick={() => handleCardClick(index, card.text)}
                >
                  <p>{card.text}</p>
                  <img src={card.icon} alt="card_icon" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="result">
            <div className="result-title">
              <img
                className="user_icon"
                src={assets.gemini_bot_icon}
                alt="gemini_bot_icon"
              />
              <div className="prompt-container">
                <p>{recentPrompt}</p>
                {sentPrompts.map((prompt, index) => (
                  <div
                    className="sent-prompt"
                    key={index}
                    onMouseEnter={() => setHoveredPrompt(index)}
                    onMouseLeave={() => setHoveredPrompt(null)}
                  >
                    <div className="sent-images">
                      {prompt.images.map((image, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={image.url}
                          alt={image.name}
                          className="preview-image"
                        />
                      ))}
                    </div>
                    {hoveredPrompt === index && !isEditing && (
                      <img
                        className="edit-icon"
                        src={assets.edit_icon_icon} // Add pen icon asset
                        alt="edit_icon"
                        title="Edit"
                        onClick={() => handleEditClick(prompt)}
                      />
                    )}
                    {isEditing && hoveredPrompt === index && (
                      <div className="edit-container">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="edit-textarea"
                        />
                        <button onClick={() => handleUpdateClick(index)}>Update</button>
                        <button onClick={handleCancelClick}>Cancel</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="result-data">
              <img
                src={
                  loading ? assets.gemini_processing_icon : assets.gemini_icon
                }
                alt="gemini_icon"
              />
              {loading ? (
                <div className="loader">
                  <hr />
                  <hr />
                  <hr />
                </div>
              ) : (
                <p dangerouslySetInnerHTML={{ __html: resultData }}></p>
              )}
            </div>
          </div>
        )}

        <div className="main-bottom">
          <div className={`search-box ${textBoxGrow ? "change" : ""} `}>
            <textarea
              onChange={handleTextareaChange}
              value={input}
              placeholder="Enter a prompt here"
              onKeyPress={handleKeyPress}
              className={`textBox ${textBoxGrow ? "change" : ""}`}
            />
            <div className="image-preview-promptbox">
              {images.map((image, index) => (
                <div
                  className="new-file-preview-promptbox"
                  key={index}
                  title={image.name}
                >
                  <img src={image.url} alt={image.name} className="new-image" />
                  <img
                    src={assets.close_icon}
                    alt="close_icon"
                    className="close-icon"
                    onClick={() => handleRemoveImage(index)}
                  />
                </div>
              ))}
            </div>
            <div
              className={`search-box-icons ${
                input
                  ? textBoxGrow
                    ? "with-send-icon-change"
                    : "with-send-icon"
                  : ""
              }`}
            >
              <img
                className="icon"
                src={assets.gallery_icon}
                alt="gallery_icon"
                title="Upload Image"
                onClick={handleGalleryIconClick}
              />
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange} // Event handler for file input change
                multiple // Allow multiple file selection
                accept="image/*" // Accept only image files
              />
              <img
                className="icon"
                src={assets.mic_icon}
                alt="mic_icon"
                title="Use microphone"
              />
              {input ? (
                <img
                  onClick={handleSend}
                  className="icon"
                  src={assets.send_icon}
                  alt="submit_icon"
                  title="Submit"
                />
              ) : null}
            </div>
          </div>
          <p className="bottom-info">
            Gemini may display inaccurate info, including about people, so
            double-check its response.{" "}
            <a
              className="privacy"
              href="https://support.google.com/gemini?p=privacy_notice"
              target="_blank"
              rel="noopener noreferrer"
            >
              Your privacy and Gemini Apps
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;
