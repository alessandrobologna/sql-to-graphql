'use strict';

var async = require('async');
var after = require('lodash/function/after');
var find = require('lodash/collection/find');
var camelCase = require('lodash/string/camelCase');
var capitalize = require('lodash/string/capitalize');
var pluralize = require('pluralize');

module.exports = function findOneToManyRelationships(adapter, models, callback) {
    console.log("\n\nStarting generation...")
    var tasks = Object.keys(models).reduce(function(tasklist, model) {
        tasklist[model] = function(cb) {
            findRelationships(adapter, models[model], models, cb);
        };
        return tasklist;
    }, {});

    async.parallel(tasks, callback);
};

function findRelationships(adapter, model, models, callback) {
    if (!model.references.length) {
        return setImmediate(callback, null, model);
    }

    var done = after(model.references.length, callback);
    console.log("\n - finding relationships for " + model.name.green)
    model.references.forEach(function(ref) {
        console.log("    > " +  ref.refField.yellow)
        var referenceColumn = getUnaliasedField(ref.refField, model);
        adapter.hasDuplicateValues(model.table, referenceColumn, function(err, hasDupes) {
            if (err) {
                return callback(err);
            }

            if (!hasDupes) {
                return done(null, model);
            }

            var reverseRefs = ref.model.listReferences;
            var refName = camelCase(pluralize(model.name));
            var description = pluralize(model.name) + ' belonging to this ' + ref.model.name;
            if (find(reverseRefs, { field: refName }) || ref.model.fields[refName]) {
                // @TODO find a better name algo resolve mechanism
                // `thread_id` should naturally be `threads`, while `old_thread_id` should be.. something else
                refName += capitalize(camelCase(referenceColumn)).replace(/Id$/, '');
                description += '..? (' + referenceColumn + ')';
            }

            reverseRefs.push({
                model: model,
                description: description,
                field: refName,
                refField: referenceColumn,
                isList: true
            });

            done(null, model);
        });
    });
}

function getUnaliasedField(field, model) {
    for (var unaliased in model.aliasedFields) {
        if (model.aliasedFields[unaliased] === field) {
            return unaliased;
        }
    }
}
