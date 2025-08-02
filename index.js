const app = require('./app');
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`MsJarvis API running on port ${PORT}`);
});
