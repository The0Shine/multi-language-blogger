const responseUtils = {
    ok: (res, data) => res.status(200).json({ success: true, data }),
    badRequest: (res, message) => res.status(400).json({ success: false, message }),
    unauthorized: (res, message) => res.status(401).json({ success: false, message }),
    serverError: (res, message) => res.status(500).json({ success: false, message }),
};

module.exports = responseUtils;