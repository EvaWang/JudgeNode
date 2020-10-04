var express = require('express');
var router = express.Router();
var dblink = require('../lib/components/dblink');
var multer = require('multer');
var _config = require('../lib/config').config;
var markdown = require('../lib/components/plugin/markdown');
var fs = require('fs');
var utils = require('../lib/components/utils');
var loginURL = utils.url_for('login');

router.get('/:sid', function(req, res, next) {
    var sid = req.params.sid;
    var uid = req.session.uid;

    dblink.helper.canReadAns(sid, uid).then(function(isPass){
        if(isPass){
            dblink.submission.source_code(sid, req.session.uid, req.session["class"], function(source_code) {
                res.type('text/plain');
                var text = '';
                for (var i in source_code)
                    text += source_code[i].code + '\n';
                res.send(text);
            });
        }else{
            res.redirect(loginURL);
        }
    },function(err){
        // error handler
        res.redirect(loginURL);
    })
    
});
router.get('/highlight/:sid', function(req, res, next) {
    var sid = req.params.sid;
    var uid = req.session.uid;

    dblink.helper.canReadAns(sid, uid).then(function(isPass){
        var isAdmin = req.session["class"] == null;
        if(isPass){
            dblink.submission.source_result(sid, req.session.uid, req.session["class"], function(source_result_json) {
                dblink.submission.source_code(sid, req.session.uid, req.session["class"], function(source_code) {
                    var text = '';
                    for (var i in source_code) {
                        text += '## ' + source_code[i].title + ' ##\n';
                        text += '```cpp\n' + source_code[i].code + '```\n';
                    }
                    dblink.submission.list({
                        sid: sid
                    }, isAdmin, function(slist) {
                        res.render('layout', {
                            layout: 'highlight',
                            user: req.session,
                            sid: sid,
                            source_result: source_result_json,
                            html_code: markdown.post_marked(text),
                            subs_info: slist && slist.length > 0 ? slist[0] : null
                        });
                    });
                });
            });
        }else{
            res.redirect(loginURL);
        }
    },function(err){
        // error handler
        res.redirect(loginURL);
    })

});

module.exports = router;
