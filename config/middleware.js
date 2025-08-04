
 //todo isLoggedIn() authentication.
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login");
}


function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.status(403).send("Access denied");
}
export { isAdmin, isLoggedIn };
