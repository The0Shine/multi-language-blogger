const responseUtils = {
  ok: (res, data) => res.status(200).json({ success: true, data }),

  badRequest: (res, message) =>
    res.status(400).json({ success: false, message }),

  unauthorized: (res, message) =>
    res.status(401).json({ success: false, message }), // Chưa đăng nhập hoặc token không hợp lệ

  forbidden: (res, message) =>
    res.status(403).json({ success: false, message }), // Đã đăng nhập nhưng không đủ quyền

  notFound: (res, message) =>
    res.status(404).json({ success: false, message }),

  serverError: (res, message) =>
    res.status(500).json({ success: false, message }),

  error: (res, message) =>
    res.status(500).json({ success: false, message }),
};

module.exports = responseUtils;
