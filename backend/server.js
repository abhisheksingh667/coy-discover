
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Database file paths
const dataPath = path.join(__dirname, "data");

const profilesFile = path.join(dataPath, "profiles.json");
const swipesFile = path.join(dataPath, "swipes.json");
const matchesFile = path.join(dataPath, "matches.json");

// Read JSON data
function readData(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

app.get("/", (req, res) => {
  res.json({
    message: "Coy Discover API is running!"
  });
});

// GET /feed
app.get("/feed", (req, res) => {
  try {
    const profiles = readData(profilesFile);
    const swipes = readData(swipesFile);

    // Our demo assumes one logged-in user
    const currentUserId = "current-user";

    // Find profiles already swiped on
    const swipedProfileIds = swipes
      .filter(swipe => swipe.userId === currentUserId)
      .map(swipe => swipe.profileId);

    // Remove profiles already swiped on
    const availableProfiles = profiles.filter(profile =>
      !swipedProfileIds.includes(profile.id)
    );

    // Hide internal information
    const safeProfiles = availableProfiles.map(
      ({ likedMe, ...profile }) => profile
    );

    res.json({
      success: true,
      total: safeProfiles.length,
      profiles: safeProfiles
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch profiles"
    });
  }
});



app.post("/swipe", (req, res) => {
  try {
    const { profileId, action } = req.body;

    const currentUserId = "current-user";

    // Validate request
    if (!profileId || !["like", "pass"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Valid profileId and action are required"
      });
    }

    const profiles = readData(profilesFile);
    const swipes = readData(swipesFile);
    const matches = readData(matchesFile);

    // Check whether profile exists
    const profile = profiles.find(p => p.id === profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    // Prevent duplicate swipes
    const alreadySwiped = swipes.some(
      s => s.userId === currentUserId &&
           s.profileId === profileId
    );

    if (alreadySwiped) {
      return res.status(409).json({
        success: false,
        message: "You have already swiped on this profile"
      });
    }

    // Save swipe
    const newSwipe = {
      userId: currentUserId,
      profileId,
      action,
      createdAt: new Date().toISOString()
    };

    swipes.push(newSwipe);

    fs.writeFileSync(
      swipesFile,
      JSON.stringify(swipes, null, 2)
    );

    // Check mutual like
    let isMatch = false;

    if (action === "like" && profile.likedMe) {
      isMatch = true;

      const newMatch = {
        id: `${currentUserId}-${profileId}`,
        userId: currentUserId,
        profileId,
        createdAt: new Date().toISOString()
      };

      matches.push(newMatch);

      fs.writeFileSync(
        matchesFile,
        JSON.stringify(matches, null, 2)
      );
    }

    res.json({
      success: true,
      message: isMatch
        ? "It's a match!"
        : "Swipe recorded successfully",
      isMatch,
      profileId
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
});



app.get("/matches", (req, res) => {
  try {
    const currentUserId = "current-user";

    const matches = readData(matchesFile);
    const profiles = readData(profilesFile);

    // Get matches belonging to current user
    const userMatches = matches.filter(
      match => match.userId === currentUserId
    );

    // Get profile details for each match
    const matchedProfiles = userMatches.map(match => {
      const profile = profiles.find(
        p => p.id === match.profileId
      );

      if (!profile) return null;

      // Never expose internal likedMe property
      const { likedMe, ...safeProfile } = profile;

      return {
        ...safeProfile,
        matchedAt: match.createdAt
      };
    }).filter(Boolean);

    res.json({
      success: true,
      total: matchedProfiles.length,
      matches: matchedProfiles
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch matches"
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
