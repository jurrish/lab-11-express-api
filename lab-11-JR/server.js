'use strict';

const express = require('express');
const Recipe = require('./model/recipe');
const PORT = process.env.PORT || 3000;
const app =  express();
const cors = require('./lib/cors');
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const handleError = require('./lib/error-middleware');
const debug = require('morgan');
const storage = require('./storage/storage.js');

app.use(debug('dev'));
app.use(cors);

app.get('/api/recipe', (req, res, next) => {
  debug('in get route');
  try {
    storage.fetchItem('recipe', req.params.id)
    .then(requestedItem => res.json(requestedItem))
    //will just return the item, not the object itself
    .catch(err => {
      err = createError(204, 'lol no content');
      next(err);
    });
  } catch (err) {
    next(createError(400, 'bad request or invalid id'));
  }
});

app.post('/api/recipe', jsonParser, (req, res, next) => {
  debug('in route /api/recipe');
  //post some stuff to data module...check if it exists first
  try {
    const recipe = new Recipe(req.body.name, req.body.ingredients);
    storage.createItem('recipe', recipe)
    // res.json(recipe);
    .then(createdRecipe => res.json(createdRecipe))
    .catch(err => {
      err = createError(500, 'new recipe not saved in storage module');
      next(err);
    });
  } catch (err) {
    next(createError(400, 'bad user request')); //passes error to createError
  }
});

app.delete('/api/recipe/:id', (req, res, next) => {
  debug('in delete route /api/recipe');
  try {
    if(req.params.id) {
      storage.deleteItem('recipe', req.params.id)
      .then(deletedRecipe => res.json(deletedRecipe))
      .catch(err => {
        err = createError(204, 'id does not exist');
        next(err);
      });
    }
  } catch(err) {
    next(createError(404, 'no content'));
  }
});

app.put('/api/recipe', jsonParser, (req, res, next) => {
  debug('inside put route');
  try {
    if(req.params.id) {
      storage.updateItem('recipe', req.params.id, req.body.name, req.body.ingredients)
      .then(newRecipe => res.json(newRecipe))
      .catch(err => {
        err = createError(400, 'invalid object parameters');
        next(err);
      });
    }
  } catch(err) {
    next(createError(500, 'internal error'));
  }
});


app.use(handleError);

app.listen(PORT, function() {
  console.log(`listening on ${PORT}`);
});
