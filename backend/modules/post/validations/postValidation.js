const { body, param } = require('express-validator');

const postValidation = {
  create: [
    body('title')
      .notEmpty()
      .withMessage('Title is required.'),
    body('languageid')
      .isInt({ min: 1 })
      .withMessage('Valid language ID is required.'),
    body('contents')
      .isArray({ min: 1 })
      .withMessage('Contents must be a non-empty array.'),
    body('contents.*.type')
      .isIn(['text', 'image', 'video'])
      .withMessage('Each content must have type: text, image, or video.'),
    body('contents.*')
      .custom(content => {
        if (content.type === 'text' && !content.content) {
          throw new Error('Text content must have "content" field.');
        }
        if ((content.type === 'image' || content.type === 'video') && !content.url) {
          throw new Error('Image/Video must have "url" field.');
        }
        return true;
      })
  ],

  updateStatus: [
    param('postid')
      .isInt({ min: 1 })
      .withMessage('Invalid post ID.'),
    body('status')
      .isIn([-1, 0, 1])
      .withMessage('Status must be -1 (draft), 0 (pending), or 1 (published).')
  ],

  delete: [
    param('postid')
      .isInt({ min: 1 })
      .withMessage('Invalid post ID.')
  ]
};

module.exports = postValidation;
