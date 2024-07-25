import express from 'express';
import 'dotenv/config';
import fs from 'fs';
import cors from 'cors';

const app = express();
const { PORT, BACKEND_URL, CORS_ORIGIN, DATA_FILE } = process.env;

app.use(cors({ CORS_ORIGIN }));

console.log(PORT);
console.log(BACKEND_URL);
console.log(CORS_ORIGIN);


const readData = () => {
    const data = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE)) : { profiles: [] };
    return data;
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

app.post('/submit-profile', (req, res) => {
    const data = readData();
    const profileId = Math.floor(Math.random() * 1000000);
    const newStatements = req.body.statements.map((text, index) => ({
        id: profileId * 10 + index, // Generate a unique ID for each statement
        [`statement${index + 1}`]: text,
        voteNumber: 0
    }));
    data.profiles.push({ ...req.body, id: profileId, statements: newStatements });
    writeData(data);
    res.sendStatus(200);
});

app.get('/profiles', (req, res) => {
    const data = readData();
    res.json(data.profiles);
});

app.post('/vote', (req, res) => {
    const data = readData();
    const { profileId, statementId } = req.body;

    const profile = data.profiles.find(profile => profile.id === profileId);
    if (profile) {
        const statement = profile.statements.find(stmt => stmt.id === statementId);
        if (statement) {
            statement.voteNumber += 1;
            profile.statements.sort((a, b) => b.voteNumber - a.voteNumber);
            writeData(data);
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(404);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});