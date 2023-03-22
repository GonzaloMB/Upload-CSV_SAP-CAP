// Import necessary libraries
const cds = require('@sap/cds');

// Define the service
module.exports = cds.service.impl(async function() {

  // Get the entities to use
  const { Books, BookTitles  } = this.entities;

  // Add validation before creating a new book
  this.before('CREATE', 'Books', async (req) => {
    const { stock, title } = req.data;
    if (stock <= 0) {
      // If the stock is negative or zero, throw an error
      req.error(400, 'Stock value must be greater than zero');
    }
    const bookTitles = await cds.run(SELECT.from(BookTitles));
    const validTitles = bookTitles.map((book) => book.title);
    if (!validTitles.includes(title)) {
      // If the title is not included in the BookTitles entity, throw an error
      req.error(400, `The title '${title}' is not valid. Please choose a title from the following options: ${validTitles.join(', ')}`);
    }
  });
  // Implement the rest of the service methods
});