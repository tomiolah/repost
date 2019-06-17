exports.usernameValidator = username => /^[a-zA-Z0-9]{2,}$/g.test(username);
exports.passwordValidator = password => /^[a-zA-Z0-9]{2,}$/g.test(password);
