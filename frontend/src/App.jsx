
import { useEffect, useRef, useState } from "react";
import {
  Heart,
  X,
  House,
  Compass,
  MessageCircleHeart,
  MapPin,
  Sparkles,
  RefreshCw
} from "lucide-react";
import "./App.css";

const API = "http://localhost:5000";
const SWIPE_THRESHOLD = 100;

function App() {
  const [activeTab, setActiveTab] = useState("discover");
  const [profiles, setProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [swipeDirection, setSwipeDirection] = useState("");
  const [newMatch, setNewMatch] = useState(null);

  // Drag gesture states
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  // Fetch profiles and matches
  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [feedResponse, matchResponse] = await Promise.all([
        fetch(`${API}/feed`),
        fetch(`${API}/matches`)
      ]);

      if (!feedResponse.ok || !matchResponse.ok) {
        throw new Error("Unable to load data");
      }

      const feedData = await feedResponse.json();
      const matchData = await matchResponse.json();

      setProfiles(feedData.profiles);
      setMatches(matchData.matches);
    } catch (err) {
      setError(
        "Cannot connect to the server. Make sure your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Like or pass a profile
  async function handleSwipe(action) {
    if (!profiles.length || busy) return;

    const currentProfile = profiles[0];

    setBusy(true);
    setIsDragging(false);
    setDragX(0);
    setSwipeDirection(action === "like" ? "right" : "left");

    try {
      const response = await fetch(`${API}/swipe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          profileId: currentProfile.id,
          action
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Swipe failed");
      }

      // Remove swiped profile
      setProfiles(prev => prev.slice(1));

      // Refresh matches
      const matchResponse = await fetch(`${API}/matches`);
      const matchData = await matchResponse.json();

      setMatches(matchData.matches);

      // Show popup only for mutual likes
      if (result.isMatch) {
        setNewMatch(currentProfile);
      }

    } catch (err) {
      setError(err.message);
      await loadData();
    } finally {
      setSwipeDirection("");
      setBusy(false);
    }
  }

  // Start dragging the card
  function handlePointerDown(event) {
    if (busy || !profiles.length || event.button !== 0) return;

    startX.current = event.clientX;
    setIsDragging(true);

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  // Move card with mouse or finger
  function handlePointerMove(event) {
    if (!isDragging || busy) return;

    const distance = event.clientX - startX.current;

    setDragX(distance);
  }

  // Release card
  function handlePointerUp() {
    if (!isDragging) return;

    setIsDragging(false);

    if (dragX > SWIPE_THRESHOLD) {
      handleSwipe("like");
    } else if (dragX < -SWIPE_THRESHOLD) {
      handleSwipe("pass");
    } else {
      setDragX(0);
    }
  }

  // Reset if pointer interaction is cancelled
  function handlePointerCancel() {
    setIsDragging(false);
    setDragX(0);
  }

  const currentProfile = profiles[0];

  // Card movement and rotation
  const cardStyle = {
    transform: isDragging
      ? `translateX(${dragX}px) rotate(${dragX * 0.08}deg)`
      : undefined,

    transition: isDragging
      ? "none"
      : "transform 0.4s ease, opacity 0.4s ease"
  };

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div className="logo">
          coy<span>.</span>
        </div>

        <div className="header-right">
          <Sparkles size={19} />
          <span>Discover people</span>
        </div>
      </header>

      {/* Main content */}
      <main className="main">

        {error && (
          <div className="error-message">
            {error}
            <button onClick={loadData}>Retry</button>
          </div>
        )}

        {/* HOME TAB */}
        {activeTab === "home" && (
          <div className="home-placeholder"></div>
        )}

        {/* DISCOVER TAB */}
        {activeTab === "discover" && (
          <section className="discover-section">

            <div className="section-heading">
              <div>
                <h1>Discover</h1>
                <p>Find someone interesting.</p>
              </div>

              <span className="profile-count">
                {profiles.length} left
              </span>
            </div>

            {loading ? (
              <div className="loading">
                <RefreshCw className="spin" />
                <p>Finding people for you...</p>
              </div>
            ) : currentProfile ? (

              <div
                key={currentProfile.id}
                className={`profile-card ${swipeDirection} ${
                  isDragging ? "dragging" : ""
                }`}
                style={cardStyle}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
              >

                {/* LIKE label */}
                {dragX > 25 && (
                  <div
                    className="swipe-label like-label"
                    style={{
                      opacity: Math.min(dragX / 100, 1)
                    }}
                  >
                    LIKE
                  </div>
                )}

                {/* PASS label */}
                {dragX < -25 && (
                  <div
                    className="swipe-label pass-label"
                    style={{
                      opacity: Math.min(Math.abs(dragX) / 100, 1)
                    }}
                  >
                    PASS
                  </div>
                )}

                {/* Profile image */}
                <div className="profile-image-wrapper">
                  <img
                    src={currentProfile.photo}
                    alt={currentProfile.name}
                    className="profile-image"
                    draggable="false"
                  />

                  <div className="image-overlay"></div>

                  <div className="profile-info">
                    <h2>
                      {currentProfile.name}, {currentProfile.age}
                    </h2>

                    <p className="location">
                      <MapPin size={15} />
                      {currentProfile.city}
                    </p>
                  </div>
                </div>

                {/* Profile details */}
                <div className="profile-details">
                  <p>{currentProfile.bio}</p>

                  <div className="interests">
                    {currentProfile.interests.map(interest => (
                      <span key={interest}>{interest}</span>
                    ))}
                  </div>
                </div>

                {/* Like and Pass buttons */}
                <div className="swipe-actions">

                  <button
                    className="pass-button"
                    onPointerDown={event => event.stopPropagation()}
                    onClick={() => handleSwipe("pass")}
                    disabled={busy}
                    aria-label="Pass profile"
                  >
                    <X size={30} />
                  </button>

                  <button
                    className="like-button"
                    onPointerDown={event => event.stopPropagation()}
                    onClick={() => handleSwipe("like")}
                    disabled={busy}
                    aria-label="Like profile"
                  >
                    <Heart size={28} fill="currentColor" />
                  </button>

                </div>
              </div>

            ) : (
              <div className="empty-state">
                <Sparkles size={42} />
                <h2>You've seen everyone!</h2>
                <p>
                  There are no more profiles to discover right now.
                </p>
              </div>
            )}

          </section>
        )}

        {/* MATCHES TAB */}
        {activeTab === "matches" && (
          <section className="matches-section">
            <h1>Your Matches</h1>
            <p>People who liked you back.</p>

            {loading ? (
              <div className="loading">Loading matches...</div>
            ) : matches.length > 0 ? (

              <div className="matches-list">
                {matches.map(match => (
                  <div className="match-item" key={match.id}>

                    <img
                      src={match.photo}
                      alt={match.name}
                    />

                    <div>
                      <h3>
                        {match.name}, {match.age}
                      </h3>
                      <p>{match.city}</p>
                    </div>

                    <Heart
                      color="#E65B78"
                      fill="#E65B78"
                    />

                  </div>
                ))}
              </div>

            ) : (
              <div className="empty-state">
                <MessageCircleHeart size={42} />
                <h2>No matches yet</h2>
                <p>
                  Keep discovering to find your connection.
                </p>
              </div>
            )}
          </section>
        )}

      </main>

      {/* Bottom navigation */}
      <nav className="bottom-nav">

        <button
          className={activeTab === "home" ? "active" : ""}
          onClick={() => setActiveTab("home")}
        >
          <House size={22} />
          <span>Home</span>
        </button>

        <button
          className={activeTab === "discover" ? "active" : ""}
          onClick={() => setActiveTab("discover")}
        >
          <Compass size={22} />
          <span>Discover</span>
        </button>

        <button
          className={activeTab === "matches" ? "active" : ""}
          onClick={() => setActiveTab("matches")}
        >
          <MessageCircleHeart size={22} />
          <span>Matches</span>

          {matches.length > 0 && (
            <span className="match-badge">
              {matches.length}
            </span>
          )}
        </button>

      </nav>

      {/* Match popup */}
      {newMatch && (
        <div className="match-overlay">
          <div className="match-popup">

            <Sparkles size={45} color="#E65B78" />

            <h1>It's a Match!</h1>

            <p>
              You and {newMatch.name} liked each other.
            </p>

            <img
              src={newMatch.photo}
              alt={newMatch.name}
            />

            <button onClick={() => setNewMatch(null)}>
              Continue Discovering
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;
