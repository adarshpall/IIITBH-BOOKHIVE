function calculateFine(dueDate,returnDate) {  
    if (returnDate > dueDate) {
      const daysLate = Math.floor((returnDate - dueDate) / (1000 * 60 * 60 * 24));
      const fine = daysLate * 10;
      return {
        fine,
        dueDate,
      }
    }
    return {
        fine : 0
    }
}

export default calculateFine;