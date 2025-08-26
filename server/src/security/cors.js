const allowed = (process.env.CLIENT_URL || 'http://localhost:3000');
app.use(require('cors')({
  origin: allowed,
  credentials: true,
  methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
}));
