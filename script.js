document.addEventListener("DOMContentLoaded", function () {
  const totalAmount = document.getElementById("total-amount");
  const userAmount = document.getElementById("user-amount");
  const checkAmountButton = document.getElementById("check-amount");
  const totalAmountButton = document.getElementById("total-amount-button");
  const productTitle = document.getElementById("product-title");
  const budgetError = document.getElementById("budget-error");
  const productTitleError = document.getElementById("product-title-error");
  const amountOutput = document.getElementById("amount");
  const expenditureOutput = document.getElementById("expenditure-value");
  const balanceOutput = document.getElementById("balance-amount");
  const expenseList = document.getElementById("list");
  const category = document.getElementById("category");
  const expenseDate = document.getElementById("expense-date");
  const budgetPeriod = document.getElementById("budget-period");
  const sortButton = document.getElementById("sort-button");
  const filterButton = document.getElementById("filter-button");
  const loadMoreButton = document.getElementById("load-more-button");
  const pieChartButton = document.getElementById("pie-chart-button");
  const barChartButton = document.getElementById("bar-chart-button");
  const chartContainer = document.getElementById("chart-container");

  let tempAmount = 0;
  let budgetInterval = 30; // Default to monthly
  let expenses = [];
  let expensesPerPage = 10;
  let currentPage = 1;
  let sortOrder = 'date-desc'; // Default sort order
  let filterCategory = 'all'; // Default filter

  // Utility functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Budget management
  const setPeriod = () => {
    const selectedPeriod = budgetPeriod.value;
    budgetInterval = selectedPeriod === 'quarterly' ? 90 : selectedPeriod === 'annually' ? 365 : 30;
  };

  const setBudget = () => {
    tempAmount = parseFloat(totalAmount.value);
    if (isNaN(tempAmount) || tempAmount <= 0) {
      showError(budgetError, 'Please enter a valid budget amount.');
      return;
    }
    hideError(budgetError);
    updateBudgetDisplay();
    saveBudgetToLocalStorage();
    totalAmount.value = "";
  };

  const updateBudgetDisplay = () => {
    amountOutput.textContent = formatCurrency(tempAmount);
    calculateTotalExpense();
  };

  const saveBudgetToLocalStorage = () => {
    localStorage.setItem('budget', JSON.stringify({ total: tempAmount, period: budgetInterval }));
  };

  // Expense management
  const addExpense = () => {
    const title = productTitle.value.trim();
    const amount = parseFloat(userAmount.value);
    const selectedCategory = category.value;
    const date = expenseDate.value;

    if (!title || isNaN(amount) || amount <= 0 || !date) {
      showError(productTitleError, 'Please fill in all fields with valid values.');
      return;
    }
    hideError(productTitleError);

    const expense = { title, amount, category: selectedCategory, date };
    expenses.push(expense);
    updateLocalStorage();
    resetExpenseForm();
    loadExpenses();
  };

  const deleteExpense = (index) => {
    expenses.splice(index, 1);
    updateLocalStorage();
    loadExpenses();
  };

  const editExpense = (index) => {
    const expense = expenses[index];
    productTitle.value = expense.title;
    userAmount.value = expense.amount;
    category.value = expense.category;
    expenseDate.value = expense.date;
    deleteExpense(index);
    checkAmountButton.textContent = 'Update Expense';
    checkAmountButton.dataset.editIndex = index;
  };

  const resetExpenseForm = () => {
    productTitle.value = "";
    userAmount.value = "";
    category.value = "general";
    expenseDate.value = "";
    checkAmountButton.textContent = 'Add Expense';
    delete checkAmountButton.dataset.editIndex;
  };

  // Expense list management
  const loadExpenses = () => {
    expenseList.innerHTML = "";
    const filteredExpenses = filterExpenses(expenses);
    const sortedExpenses = sortExpenses(filteredExpenses);
    const paginatedExpenses = paginateExpenses(sortedExpenses);

    paginatedExpenses.forEach((expense, index) => {
      const listItem = createExpenseListItem(expense, index);
      expenseList.appendChild(listItem);
    });

    updatePagination();
    calculateTotalExpense();
  };

  const createExpenseListItem = (expense, index) => {
    const listItem = document.createElement("div");
    listItem.classList.add(
      "sublist-content",
      "text-gray-900",
      "bg-grey-200",
      "rounded-md",
      "py-4",
      "px-2",
      "mb-2"
    );
    listItem.innerHTML = `
      <div>
        <table>
          <thead>
            <tr class="flex justify-evenly gap-12">
              <th>Category</th>
              <th>Title</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr class="flex justify-evenly gap-10">
              <td>${expense.category}</td>
              <td>${expense.title}</td>
              <td>${formatCurrency(expense.amount)}</td>
            </tr>
          </tbody>
        </table>
        <div class="flex justify-between items-center mt-2">
          <span class="date text-sm text-gray-600">${formatDate(expense.date)}</span>
          <div class="icons-container flex gap-4">
            <button class="edit" data-index="${index}" aria-label="Edit Expense">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="delete" data-index="${index}" aria-label="Delete Expense">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    return listItem;
  };
  

  const filterExpenses = (expensesToFilter) => {
    return filterCategory === 'all' 
      ? expensesToFilter 
      : expensesToFilter.filter(expense => expense.category === filterCategory);
  };

  const sortExpenses = (expensesToSort) => {
    return expensesToSort.sort((a, b) => {
      switch (sortOrder) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'amount-asc':
          return a.amount - b.amount;
        case 'amount-desc':
          return b.amount - a.amount;
        default:
          return 0;
      }
    });
  };

  const paginateExpenses = (expensesToPaginate) => {
    const startIndex = (currentPage - 1) * expensesPerPage;
    const endIndex = startIndex + expensesPerPage;
    return expensesToPaginate.slice(startIndex, endIndex);
  };

  const updatePagination = () => {
    const totalPages = Math.ceil(expenses.length / expensesPerPage);
    loadMoreButton.disabled = currentPage >= totalPages;
  };

  // Chart rendering
  const renderPieChart = () => {
    const categoryExpenses = calculateCategoryExpenses();
    const chartData = {
      labels: Object.keys(categoryExpenses),
      datasets: [{
        data: Object.values(categoryExpenses),
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#9966FF", "#4BC0C0", "#FF9F40", "#8E5EA2"
        ],
      }],
    };

    renderChart('pie', chartData);
  };

  const renderBarChart = () => {
    const categoryExpenses = calculateCategoryExpenses();
    const chartData = {
      labels: Object.keys(categoryExpenses),
      datasets: [{
        label: 'Expenses',
        data: Object.values(categoryExpenses),
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#9966FF", "#4BC0C0", "#FF9F40", "#8E5EA2"
        ],
      }],
    };

    renderChart('bar', chartData);
  };

  const renderChart = (type, data) => {
    const ctx = document.createElement("canvas");
    chartContainer.innerHTML = "";
    chartContainer.appendChild(ctx);

    new Chart(ctx, {
      type: type,
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: { position: 'bottom' },
        title: { 
          display: true,
          text: `Expense ${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
          fontSize: 18
        }
      }
    });
  };

  const calculateCategoryExpenses = () => {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
      return acc;
    }, {});
  };

  // Utility functions
  const showError = (element, message) => {
    element.textContent = message;
    element.classList.remove("hidden");
  };

  const hideError = (element) => {
    element.classList.add("hidden");
  };

  const calculateTotalExpense = () => {
    const totalExpense = expenses.reduce((acc, expense) => acc + parseFloat(expense.amount), 0);
    expenditureOutput.textContent = formatCurrency(totalExpense);
    balanceOutput.textContent = formatCurrency(tempAmount - totalExpense);
  };

  const updateLocalStorage = () => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  };

  // Initialization
  const initializeApp = () => {
    const savedBudget = JSON.parse(localStorage.getItem("budget"));
    if (savedBudget) {
      tempAmount = savedBudget.total;
      budgetInterval = savedBudget.period;
      updateBudgetDisplay();
    }
    expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    loadExpenses();
    renderPieChart(); // Initial chart render
  };

  // Event listeners
  totalAmountButton.addEventListener("click", () => {
    setPeriod();
    setBudget();
  });

  checkAmountButton.addEventListener("click", () => {
    if (checkAmountButton.dataset.editIndex) {
      editExpense(parseInt(checkAmountButton.dataset.editIndex));
    } else {
      addExpense();
    }
  });

  sortButton.addEventListener("click", () => {
    // Implement sort order cycling
    const sortOrders = ['date-desc', 'date-asc', 'amount-desc', 'amount-asc'];
    const currentIndex = sortOrders.indexOf(sortOrder);
    sortOrder = sortOrders[(currentIndex + 1) % sortOrders.length];
    loadExpenses();
  });

  filterButton.addEventListener("click", () => {
    // Implement filter category cycling
    const categories = ['all', ...new Set(expenses.map(e => e.category))];
    const currentIndex = categories.indexOf(filterCategory);
    filterCategory = categories[(currentIndex + 1) % categories.length];
    loadExpenses();
  });

  loadMoreButton.addEventListener("click", () => {
    currentPage++;
    loadExpenses();
  });

  pieChartButton.addEventListener("click", renderPieChart);
  barChartButton.addEventListener("click", renderBarChart);

  expenseList.addEventListener("click", (e) => {
    const editButton = e.target.closest(".edit");
    const deleteButton = e.target.closest(".delete");
    if (editButton) {
      editExpense(parseInt(editButton.dataset.index));
    } else if (deleteButton) {
      deleteExpense(parseInt(deleteButton.dataset.index));
    }
  });

  initializeApp();
});