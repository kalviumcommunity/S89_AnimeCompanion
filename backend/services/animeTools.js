// backend/services/animeTools.js
const AnimeData = require('../models/AnimeData'); // Corrected path to models

/**
 * Tool: Fetches summary data for an anime title.
 */
const get_anime_summary = async ({ anime_title }) => {
  console.log(`[RAG Tool] Called: get_anime_summary for ${anime_title}`);
  
  try {
    const anime = await AnimeData.findOne({ 
        title: { $regex: new RegExp(anime_title, 'i') } 
    }).select('title summary genres studio episode_count');

    if (anime) {
      return {
        status: 'success',
        data: `Title: ${anime.title}. Summary: ${anime.summary}. Genres: ${anime.genres.join(', ')}. Studio: ${anime.studio}. Episodes: ${anime.episode_count}.`
      };
    }
    return { status: 'error', message: `Anime not found for summary: ${anime_title}.` };

  } catch (error) {
    console.error("[RAG Tool] Database error in get_anime_summary:", error);
    return { status: 'error', message: 'Failed to access anime database for summary.' };
  }
};

/**
 * Tool: Fetches character info for an anime.
 */
const fetch_character_info = async ({ anime_title, character_name }) => {
  console.log(`[RAG Tool] Called: fetch_character_info for ${character_name} in ${anime_title}`);

  try {
    const anime = await AnimeData.findOne({ 
        title: { $regex: new RegExp(anime_title, 'i') } 
    }).lean(); 

    if (anime) {
      const character = anime.characters.find(char => 
        char.name.toLowerCase().includes(character_name.toLowerCase())
      );

      if (character) {
        return {
          status: 'success',
          data: `Character Name: ${character.name}. Anime: ${anime.title}. Info: ${character.info}. Powers: ${character.powers}. Voice Actor: ${character.voice_actor}.`
        };
      }
      return { status: 'error', message: `Character ${character_name} not found in ${anime_title}.` };
    }
    return { status: 'error', message: `Anime ${anime_title} not found.` };

  } catch (error) {
    console.error("[RAG Tool] Database error in fetch_character_info:", error);
    return { status: 'error', message: 'Failed to access anime database for character info.' };
  }
};

module.exports = {
    get_anime_summary,
    fetch_character_info
};