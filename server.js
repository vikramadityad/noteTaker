//Import express.js
const express = require('express');
const { v4: v4 } = require('uuid');

//import built-in Node.js package 'path' to resolve path of files that are located on the server
const path = require('path');

const fs = require('fs');


//initialize the instance of Express.js
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Specify omn whcih port the Express.js server will run
const PORT = process.env.PORT || 8001;

//import json file
const dataPath = './db/db.json';

//Static middleware pointing to the public folder 
app.use(express.static('public'));

app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, 'public/notes.html'))
);


// Read all items
app.get('/api/notes', (req, res) => {
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the data:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const items = JSON.parse(data);
      res.json(items);
    }
  });
});


// Create a new item
app.post('/api/notes', (req, res) => {
    const newItem = req.body;
    newItem.id = v4();
    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the data:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        const items = JSON.parse(data);
        items.push(newItem);
        fs.writeFile(dataPath, JSON.stringify(items, null, 2), (err) => {
          if (err) {
            console.error('Error writing the data:', err);
            res.status(500).json({ error: 'Internal server error' });
          } else {
            res.status(201).json(newItem);
          }
        });
      }
    });
  });

  
//  Update an item
app.put('/api/notes/:id', (req, res) => {
    const itemId = req.params.id;
    const updatedItem = req.body;
    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the data:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        let items = JSON.parse(data);
        const index = items.findIndex((item) => item.id === itemId);
        if (index !== -1) {
          items[index] = { ...items[index], ...updatedItem };
          fs.writeFile(dataPath, JSON.stringify(items, null, 2), (err) => {
            if (err) {
              console.error('Error writing the data:', err);
              res.status(500).json({ error: 'Internal server error' });
            } else {
              res.json(items[index]);
            }
          });
        } else {
          res.status(404).json({ error: 'Item not found' });
        }
      }
    });
  });
  
  // Delete an item
  app.delete('/api/notes/:id', (req, res) => {
    const itemId = req.params.id;
    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the data:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        let items = JSON.parse(data);
        const index = items.findIndex((item) => item.id === itemId);
        if (index !== -1) {
          const deletedItem = items.splice(index, 1)[0];
          fs.writeFile(dataPath, JSON.stringify(items, null, 2), (err) => {
            if (err) {
              console.error('Error writing the data:', err);
              res.status(500).json({ error: 'Internal server error' });
            } else {
              res.json(deletedItem);
            }
          });
        } else {
          res.status(404).json({ error: 'Item not found' });
        }
      }
    });
  });





// app.post('/api/notes', (req, res) => {
//     console.info(`${req.method} request received to add a review`);
//     console.log(req.body);
//     console.log(typeof notedata);
//     // notedata.push(req.body);
//     res.json(notedata)
// });

//liste() method is responsible for listening for incoming connections on the specidied port
app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));