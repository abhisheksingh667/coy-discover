
const fs = require("fs");
const path = require("path");

const names = [
  "Ananya", "Riya", "Priya", "Sneha", "Aarav",
  "Ishita", "Kavya", "Rahul", "Aditya", "Meera",
  "Arjun", "Neha", "Simran", "Kabir", "Aisha",
  "Vihaan", "Pooja", "Dev", "Sanya", "Rohan",
  "Tanya", "Ishaan", "Diya", "Karan", "Naina",
  "Reyansh", "Maya", "Aryan", "Kiara", "Siddharth"
];

const cities = [
  "Delhi", "Mumbai", "Bangalore", "Pune", "Lucknow",
  "Hyderabad", "Chandigarh", "Jaipur", "Gurugram", "Noida"
];

const interests = [
  ["Travel", "Photography", "Music"],
  ["Reading", "Coffee", "Movies"],
  ["Fitness", "Cooking", "Dancing"],
  ["Technology", "Gaming", "Cricket"],
  ["Art", "Fashion", "Food"],
  ["Hiking", "Nature", "Adventure"]
];

const bios = [
  "Exploring new places and collecting memories.",
  "Coffee lover, music enthusiast and dreamer.",
  "Living life one adventure at a time.",
  "Foodie by nature, traveller by heart.",
  "Love meaningful conversations and good vibes.",
  "Always looking for something new to learn."
];

// These profiles have already liked the logged-in user.
const alreadyLikedMe = [2, 5, 8, 12, 17, 21, 26];

const profiles = names.map((name, index) => ({
  id: index + 1,
  name,
  age: 21 + (index % 9),
  photo: `https://i.pravatar.cc/400?img=${index + 1}`,
  bio: bios[index % bios.length],
  city: cities[index % cities.length],
  interests: interests[index % interests.length],
  likedMe: alreadyLikedMe.includes(index + 1)
}));

const dataPath = path.join(__dirname, "data", "profiles.json");

fs.writeFileSync(dataPath, JSON.stringify(profiles, null, 2));

console.log(`${profiles.length} profiles created successfully!`);
console.log(`${alreadyLikedMe.length} profiles have already liked you.`);
