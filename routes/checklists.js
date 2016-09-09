var express = require('express');
var checklists = express.Router();
var auth = require('../lib/auth');
var debug = require('debug')('runcheck:checklists');
var Checklist = require('../models/checklist').Checklist;


checklists.get('/:id/json', auth.ensureAuthenticated, function (req, res) {
  Checklist.findById(req.params['id'], function (err, checklist) {
    if (err) {
      return res.status(404).json({
        error: {
          status: err
        }
      });
    }
    return res.status(200).json(checklist.toJSON({
      virtuals: true
    }));
  });
});


checklists.put('/:id/items/json', auth.ensureAuthenticated, function (req, res) {
  Checklist.findById(req.params['id'], function (err, checklist) {
    var idx, name, item, newItem, checklistItems = {}, newChecklistItems = {};
    if (err) {
      return res.status(404).json({
        error: {
          status: err
        },
        success: false
      });
    }

    for (idx=0; idx<checklist.items.length; idx+=1) {
      if (checklist.items[idx].name) {
        checklistItems[checklist.items[idx].name] = checklist.items[idx];
      }
    }

    for (idx=0; idx<req.body.length; idx+=1) {
      if (req.body[idx].name) {
        newChecklistItems[req.body[idx].name] = req.body[idx];
      }
    }

    for (name in newChecklistItems) {
      if (newChecklistItems.hasOwnProperty(name)) {
        newItem = newChecklistItems[name];
        if (checklistItems.hasOwnProperty(name)) {
          // update checklist item
          debug('Update item: %s', name);
          item = checklistItems[name];

          if (item.custom && newItem.subject && (newItem.subject !== item.subject)) {
            debug('Update subject: "%s" => "%s"', item.subject, newItem.subject)
            item.subject = newItem.subject;
          }

          if (!item.mandatory && (newItem.required !== item.required)) {
            debug('Update required: %s => %s', item.required, newItem.required);
            item.required = newItem.required;
          }

          if ((newItem.assignee !== undefined) && (newItem.assignee !== item.assignee)) {
            debug('Update assignee: "%s" => "%s"', item.assignee, newItem.assignee);
            item.assignee = newItem.assignee;
          }
        } else {
          // add checklist item
          // ensure new item name is unique and secure
          do {
            newItem.name = 'Z' + Math.floor((Math.random()*90000)+10000).toString(16).toUpperCase();
          } while (checklistItems.hasOwnProperty(name));
          delete newChecklistItems[name];
          newChecklistItems[newItem.name] = newItem;
          debug('Add item: %s => %s', name, newItem.name);

          item = checklist.items.create({
            name: newItem.name,
            subject: newItem.subject,
            required: newItem.required
          });
          checklistItems[item.name] = item;
          checklist.items.push(item);
        }
      }
    }

    for (name in checklistItems) {
      if (checklistItems.hasOwnProperty(name)
          && !newChecklistItems.hasOwnProperty(name)) {
        item = checklistItems[name];
        if (item.custom === true) {
          // remove checklist item
          debug('Remove item: %s', name);
          delete checklistItems[name];
          idx = checklist.items.indexOf(item);
          checklist.items.splice(idx, 1);
        }
      }
    }

    if (checklist.isModified()) {
      debug('Checklist items modified')
      checklist.saveWithHistory('maxwelld', function (err) {
        if (err) {
          return res.status(500).json({
            error: {
              status: err
            },
            success: false
          });
        }
        return res.status(201).json({
          success: true
        });
      });
    } else {
      return res.status(200).json({
        success: true
      });
    }
  });
});


checklists.put('/:id/inputs/json', auth.ensureAuthenticated, function (req, res) {
  Checklist.findById(req.params['id'], function (err, checklist) {
    var idx, name, item, input, newInput, checklistItems = {}, checklistInputs = {};
    if (err) {
      return res.status(404).json({
        error: {
          status: err
        },
        success: false
      });
    }

    for (idx=0; idx<checklist.items.length; idx+=1) {
      if ((name = checklist.items[idx].name)) {
        checklistItems[name] = checklist.items[idx];
      }
    }

    for (idx=0; idx<checklist.inputs.length; idx+=1) {
      if ((name = checklist.inputs[idx].name)) {
        if (checklistInputs.hasOwnProperty(name)) {
          if (checklistInputs[name].inputOn < checklist.inputs[idx].inputOn) {
            checklistInputs[name] = checklist.inputs[idx];
          }
        } else {
          checklistInputs[name] = checklist.inputs[idx];
        }
      }
    }

    for (idx=0; idx<req.body.length; idx+=1) {
      newInput = req.body[idx]
      if (newInput.name) {
        debug('Process input: %s', name);
        name = newInput.name;
        item = checklistItems[name];
        input = checklistInputs[name];
        if (item && (item.mandatory || item.required)) {
          debug('Input permitted: %s (value: %s, comment:"%s")', name, newInput.value, newInput.comment)
          // TODO: check authorization
          if ((!input && (newInput.value !== 'N' || newInput.comment !== '')) 
              || (input && newInput.value !== input.value)
              || (input && newInput.comment !== input.comment)) {
            debug('Create new input: %s', name);
            checklist.inputs.push({
              name: name,
              value: newInput.value,
              comment: newInput.comment,
              inputOn: new Date(),
              inputBy: req.session.userid
            });
          }
        }
      }
    }

    if (checklist.isModified()) {
      debug('Checklist inputs modified')
      checklist.save(function (err) {
        if (err) {
          return res.status(500).json({
            error: {
              status: err
            },
            success: false
          });
        }
        return res.status(201).json({
          success: true
        });
      });
    } else {
      return res.status(200).json({
        success: true
      });
    }
  });
});

module.exports = checklists;