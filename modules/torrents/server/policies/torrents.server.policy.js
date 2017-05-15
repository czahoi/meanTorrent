'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Torrents Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow(
    [
      {
        roles: ['admin', 'oper'],
        allows: [
          {resources: '/api/movieinfo/:tmdbid/:language', permissions: '*'},
          {resources: '/api/torrents/upload', permissions: '*'},
          {resources: '/api/torrents/download/:torrentId', permissions: '*'},
          {resources: '/api/torrents', permissions: '*'},
          {resources: '/api/torrents/:torrentId', permissions: '*'},
          {resources: '/api/torrents/:torrentId/set/saletype/:saleType', permissions: '*'},
          {resources: '/api/torrents/:torrentId/set/recommendlevel/:rlevel', permissions: '*'},
          {resources: '/api/torrents/:torrentId/set/reviewed', permissions: '*'},

          {resources: '/api/subtitles/:torrentId', permissions: '*'},
          {resources: '/api/subtitles/:torrentId/:subtitleId', permissions: '*'},

          {resources: '/api/comments/:torrentId', permissions: '*'},
          {resources: '/api/comments/:torrentId/:commentId', permissions: '*'},
          {resources: '/api/comments/:torrentId/:commentId/:subCommentId', permissions: '*'}
        ]
      },
      {
        roles: ['user'],
        allows: [
          {resources: '/api/movieinfo/:tmdbid/:language', permissions: ['get']},
          {resources: '/api/torrents/upload', permissions: ['post']},
          {resources: '/api/torrents/download/:torrentId', permissions: ['get']},
          {resources: '/api/torrents', permissions: ['get', 'post']},
          {resources: '/api/torrents/:torrentId', permissions: ['get', 'put']},

          {resources: '/api/subtitles/:torrentId', permissions: ['post']},
          {resources: '/api/subtitles/:torrentId/:subtitleId', permissions: ['get', 'delete']},

          {resources: '/api/comments/:torrentId', permissions: ['post']},
          {resources: '/api/comments/:torrentId/:commentId', permissions: ['post', 'put', 'delete']},
          {resources: '/api/comments/:torrentId/:commentId/:subCommentId', permissions: ['put', 'delete']}
        ]
      },
      {
        roles: ['guest'],
        allows: [
          {resources: '/api/movieinfo/:tmdbid/:language', permissions: ['get']},
          {resources: '/api/torrents', permissions: ['get']},
          {resources: '/api/torrents/:torrentId', permissions: ['get']}
        ]
      }
    ]
  );
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an article is being processed and the current user created it then allow any manipulation
  if (req.article && req.user && req.article.user && req.article.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
