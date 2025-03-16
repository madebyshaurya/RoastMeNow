import fs from 'fs';
import https from 'https';
import path from 'path';

// Sound effect URLs
const soundEffects = [
    {
        id: 'airhorn',
        url: 'https://www.myinstants.com/media/sounds/mlg-airhorn.mp3'
    },
    {
        id: 'oof',
        url: 'https://www.myinstants.com/media/sounds/roblox-death-sound_1.mp3'
    },
    {
        id: 'bruh',
        url: 'https://www.myinstants.com/media/sounds/movie_1.mp3'
    },
    {
        id: 'emotional-damage',
        url: 'https://www.myinstants.com/media/sounds/emotional-damage-meme.mp3'
    },
    {
        id: 'thug-life',
        url: 'https://www.myinstants.com/media/sounds/thug-life.mp3'
    },
    {
        id: 'wow',
        url: 'https://www.myinstants.com/media/sounds/anime-wow-sound-effect.mp3'
    },
    {
        id: 'fatality',
        url: 'https://www.myinstants.com/media/sounds/fatality.mp3'
    }
];

// Create directory if it doesn't exist
const soundsDir = path.join(__dirname);
if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir, { recursive: true });
}

// Download each sound effect
soundEffects.forEach(sound => {
    const filePath = path.join(soundsDir, `${sound.id}.mp3`);
    const file = fs.createWriteStream(filePath);

    console.log(`Downloading ${sound.id}...`);

    https.get(sound.url, response => {
        response.pipe(file);

        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${sound.id}`);
        });
    }).on('error', err => {
        fs.unlink(filePath, () => { }); // Delete the file if there's an error
        console.error(`Error downloading ${sound.id}: ${err.message}`);
    });
}); 