app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Requête /login reçue avec :", email);

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email et mot de passe requis" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Utilisateur introuvable");
      return res
        .status(401)
        .json({ message: "Identifiants invalides" });
    }

    // ICI : comparaison SIMPLE
    if (password !== user.password) {
      console.log("Mot de passe incorrect");
      return res
        .status(401)
        .json({ message: "Identifiants invalides" });
    }

    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("Connexion OK pour", email);

    res.json({
      token,
      user: {
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});