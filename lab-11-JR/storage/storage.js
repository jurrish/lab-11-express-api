'use strict';
//pretend this is a DB that's wrapped in a promise function

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'), {suffix: 'Prom'});
const createError = require('error-middleware');
//create storage object to attach .createAll/.fetchAll

exports.createItem = function(recipeSchema, recipe) {
  //this looks like recipeConstructor/recipeInstanceWithUniqueID
  if(!recipeSchema) return Promise.reject(createError(400, 'expected Schema'));
  if(!recipe) return Promise.reject(createError(400, 'expected unique recipe'));
  const json = JSON.stringify(recipe);
  return fs.writeFileProm(`${__dirname}/../data/${recipeSchema}/${recipe.id}.json`, json)
  .then(() => recipe)
  .catch((err) => Promise.reject(createError(500, err.message)));
};

exports.fetchItem = function(recipeSchema, id) {
  if(!recipeSchema) return Promise.reject(createError(400, 'expected Schema'));
  if(!id) return Promise.reject(createError(400, 'expected unique recipe id'));
  return fs.readFileProm(`${__dirname}/../data/${recipeSchema}/${id}.json`)
  .then(data => {
    try {
      let item = JSON.parse(data.toString());
      return item;
    } catch (err) {
      return Promise.reject(createError(500, err.message));
    }
  })
  .catch((err) => Promise.reject(createError(500, err.message)));
};
