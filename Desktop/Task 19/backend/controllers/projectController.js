const path = require('path');
const fs = require('fs');

const getProjects = (req, res) => {
  const filePath = path.join(__dirname, '../database/projects.json');
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading database file' });
    }

    try {
      let projects = JSON.parse(data);
      const { category, search } = req.query;

      // Filter by category
      if (category && category !== 'All') {
        projects = projects.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }

      // Filter by search query
      if (search) {
        const query = search.toLowerCase();
        projects = projects.filter(p => 
          p.title.toLowerCase().includes(query) ||
          p.technologies.some(tech => tech.toLowerCase().includes(query)) ||
          p.category.toLowerCase().includes(query)
        );
      }

      res.status(200).json(projects);
    } catch (parseError) {
      res.status(500).json({ message: 'Error parsing database file' });
    }
  });
};

module.exports = { getProjects };
