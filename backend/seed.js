// // backend/seed.js
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// // Load environment variables from .env file
// dotenv.config();

// // Assuming your AnimeData.js model is correctly located in backend/models/
// const AnimeData = require('./models/AnimeData'); 

// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//     console.error("FATAL ERROR: MONGODB_URI is not set in the .env file.");
//     process.exit(1);
// }

// const sampleData = [
//   {
//     title: "Demon Slayer: Kimetsu no Yaiba",
//     summary: "The story of Tanjiro Kamado, who seeks to avenge his family and cure his demon-turned sister, Nezuko. He joins the Demon Slayer Corps and battles against Muzan Kibutsuji and the Twelve Kizuki, striving to bring light back to the world.",
//     genres: ["Action", "Dark Fantasy", "Adventure", "Supernatural"],
//     studio: "Ufotable",
//     episode_count: 55, // Placeholder count
//     characters: [
//       { 
//         name: "Tanjiro Kamado", 
//         info: "The kind-hearted protagonist with a powerful sense of smell and deep empathy.", 
//         powers: "Water Breathing, Hinokami Kagura (Sun Breathing)",
//         voice_actor: "Natsuki Hanae (JP)"
//       },
//       { 
//         name: "Nezuko Kamado", 
//         info: "Tanjiro's younger sister, the sole survivor of the attack, turned into a demon who retains much of her human consciousness.", 
//         powers: "Exploding Blood, size manipulation, rapid regeneration",
//         voice_actor: "Akari Kito (JP)"
//       },
//       { 
//         name: "Zenitsu Agatsuma", 
//         info: "A cowardly Demon Slayer who is incredibly powerful when unconscious.", 
//         powers: "Thunder Breathing (First Form only)",
//         voice_actor: "Hiro Shimono (JP)"
//       },
//       { 
//         name: "Inosuke Hashibira", 
//         info: "A muscular Demon Slayer who wears a boar's head and was raised by wild animals.", 
//         powers: "Beast Breathing",
//         voice_actor: "Yoshitsugu Matsuoka (JP)"
//       },
//     ],
//     lore_chunks: ["The history of the first Sun Breather and the origins of the Demon Slayer Corps."]
//   },
//   {
//     title: "Jujutsu Kaisen",
//     summary: "Follows high school student Yuji Itadori as he joins a secret organization of Jujutsu Sorcerers to fight evil curses after becoming the host of a powerful Curse, Ryomen Sukuna. The story explores the dark side of society and the sacrifices made by sorcerers.",
//     genres: ["Dark Fantasy", "Supernatural", "Action", "School"],
//     studio: "MAPPA",
//     episode_count: 47, // Placeholder count
//     characters: [
//       { 
//         name: "Satoru Gojo", 
//         info: "The strongest living Jujutsu Sorcerer, known for his charismatic, eccentric personality and immense power.", 
//         powers: "Limitless, Six Eyes, Hollow Purple (technique)",
//         voice_actor: "Yuichi Nakamura (JP)"
//       },
//       { 
//         name: "Yuji Itadori", 
//         info: "The kind-hearted protagonist who became the vessel for Ryomen Sukuna, the King of Curses.", 
//         powers: "Immense physical strength, Divergent Fist, Black Flash",
//         voice_actor: "Junya Enoki (JP)"
//       }
//     ],
//     lore_chunks: ["The history of the Three Great Sorcerer Families.", "The concept and limitations of Domain Expansion."]
//   }
// ];

// const seedDB = async () => {
//   try {
//     // Attempt to connect to MongoDB
//     await mongoose.connect(MONGODB_URI);
//     console.log('MongoDB connected successfully for seeding.');

//     // Clear existing data
//     await AnimeData.deleteMany({});
//     console.log('✅ Existing AnimeData cleared.');

//     // Insert sample data
//     await AnimeData.insertMany(sampleData);
//     console.log(`✅ Sample data for ${sampleData.length} anime inserted successfully! 🌱`);

//   } catch (error) {
//     console.error('❌ Error during seeding:', error);
//     if (error.name === 'MongooseServerSelectionError') {
//         console.error('   -> Check your MONGODB_URI in .env file and ensure your MongoDB server is running.');
//     }
//   } finally {
//     // Close the connection
//     mongoose.connection.close();
//     console.log('MongoDB connection closed.');
//   }
// };

// seedDB();


// backend/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Assuming your models are correctly located in backend/models/
const AnimeData = require('./models/AnimeData'); 
const User = require('./models/User'); // <--- NEW IMPORT for User model

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("FATAL ERROR: MONGODB_URI is not set in the .env file.");
    process.exit(1);
}

// =========================================================================
// SAMPLE ANIME DATA (Remains the same)
// =========================================================================
const sampleData = [
  {
    title: "Demon Slayer: Kimetsu no Yaiba",
    summary: "The story of Tanjiro Kamado, who seeks to avenge his family and cure his demon-turned sister, Nezuko. He joins the Demon Slayer Corps and battles against Muzan Kibutsuji and the Twelve Kizuki, striving to bring light back to the world.",
    genres: ["Action", "Dark Fantasy", "Adventure", "Supernatural"],
    studio: "Ufotable",
    episode_count: 55, 
    characters: [
      { 
        name: "Tanjiro Kamado", 
        info: "The kind-hearted protagonist with a powerful sense of smell and deep empathy.", 
        powers: "Water Breathing, Hinokami Kagura (Sun Breathing)",
        voice_actor: "Natsuki Hanae (JP)"
      },
      { 
        name: "Nezuko Kamado", 
        info: "Tanjiro's younger sister, the sole survivor of the attack, turned into a demon who retains much of her human consciousness.", 
        powers: "Exploding Blood, size manipulation, rapid regeneration",
        voice_actor: "Akari Kito (JP)"
      },
      { 
        name: "Zenitsu Agatsuma", 
        info: "A cowardly Demon Slayer who is incredibly powerful when unconscious.", 
        powers: "Thunder Breathing (First Form only)",
        voice_actor: "Hiro Shimono (JP)"
      },
      { 
        name: "Inosuke Hashibira", 
        info: "A muscular Demon Slayer who wears a boar's head and was raised by wild animals.", 
        powers: "Beast Breathing",
        voice_actor: "Yoshitsugu Matsuoka (JP)"
      },
    ],
    lore_chunks: ["The history of the first Sun Breather and the origins of the Demon Slayer Corps."]
  },
  {
    title: "Jujutsu Kaisen",
    summary: "Follows high school student Yuji Itadori as he joins a secret organization of Jujutsu Sorcerers to fight evil curses after becoming the host of a powerful Curse, Ryomen Sukuna. The story explores the dark side of society and the sacrifices made by sorcerers.",
    genres: ["Dark Fantasy", "Supernatural", "Action", "School"],
    studio: "MAPPA",
    episode_count: 47, 
    characters: [
      { 
        name: "Satoru Gojo", 
        info: "The strongest living Jujutsu Sorcerer, known for his charismatic, eccentric personality and immense power.", 
        powers: "Limitless, Six Eyes, Hollow Purple (technique)",
        voice_actor: "Yuichi Nakamura (JP)"
      },
      { 
        name: "Yuji Itadori", 
        info: "The kind-hearted protagonist who became the vessel for Ryomen Sukuna, the King of Curses.", 
        powers: "Immense physical strength, Divergent Fist, Black Flash",
        voice_actor: "Junya Enoki (JP)"
      }
    ],
    lore_chunks: ["The history of the Three Great Sorcerer Families.", "The concept and limitations of Domain Expansion."]
  }
];


// =========================================================================
// SAMPLE USER DATA (NEW)
// =========================================================================
const sampleUser = {
    username: "AnimeFan2025",
    email: "test@animecompanion.com",
    password: "hashedpassword123", // In a real app, hash this!
    preferences: {
        favorite_genres: ["Action", "Sci-Fi", "Comedy"],
        disliked_genres: ["Horror", "Slice of Life"],
        preferred_studios: ["MAPPA", "Kyoto Animation"]
    },
    watch_history: [
        { anime_title: "Attack on Titan", rating: 9 },
        { anime_title: "Jujutsu Kaisen", rating: 8 },
        { anime_title: "Spy x Family", rating: 9.5 }
    ]
};


// =========================================================================
// SEEDING LOGIC
// =========================================================================
const seedDB = async () => {
  try {
    // Attempt to connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully for seeding.');

    // --- 1. Seed AnimeData (The main RAG knowledge base) ---
    await AnimeData.deleteMany({});
    await AnimeData.insertMany(sampleData);
    console.log(`✅ Sample data for ${sampleData.length} anime inserted.`);

    // --- 2. Seed User Data (For personalization) ---
    await User.deleteMany({});
    const newUser = await User.create(sampleUser);
    console.log(`✅ Sample User created: ${newUser.username}.`);

    // IMPORTANT: Display the ID for testing the recommendation tool
    console.log(`\n\n********************************************************`);
    console.log(`*** TEST USER ID for frontend/controller: ${newUser._id} ***`);
    console.log(`********************************************************\n`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    if (error.name === 'MongooseServerSelectionError') {
        console.error('   -> Check your MONGODB_URI in .env file and ensure your MongoDB server is running.');
    }
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedDB();